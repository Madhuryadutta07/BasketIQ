import { prisma } from '../lib/prisma';
import { Cart, CartItem, Product } from '@prisma/client';

type CartWithItems = Cart & {
  items: (CartItem & { product: Product })[];
};

interface PlatformResult {
  platformId: string;
  totalPrice: number;
  deliveryFee: number;
  estimatedTax: number;
  finalTotal: number;
  availableItems: number;
  unavailableItems: number;
  estimatedDeliveryMins: number;
  itemBreakdown: ItemBreakdown[];
}

interface ItemBreakdown {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  available: boolean;
  discountPercent: number;
  mrp: number | null;
}

/**
 * Core comparison engine.
 * For each platform, calculates total basket price, delivery fee,
 * and tags cheapest/fastest/best-value result.
 */
export const runComparisonEngine = async (
  cart: CartWithItems,
  userId?: string
) => {
  const platforms = await prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const productIds = cart.items.map((item) => item.productId);

  // Fetch all platform prices for all products in cart at once
  const platformProducts = await prisma.platformProduct.findMany({
    where: {
      productId: { in: productIds },
    },
    include: {
      platform: true,
      product: { select: { id: true, name: true } },
    },
  });

  // Group by platformId → productId
  const priceMap: Record<string, Record<string, typeof platformProducts[0]>> = {};
  for (const pp of platformProducts) {
    if (!priceMap[pp.platformId]) priceMap[pp.platformId] = {};
    priceMap[pp.platformId][pp.productId] = pp;
  }

  const platformResults: PlatformResult[] = [];

  for (const platform of platforms) {
    const breakdown: ItemBreakdown[] = [];
    let totalPrice = 0;
    let availableItems = 0;
    let unavailableItems = 0;

    for (const item of cart.items) {
      const pp = priceMap[platform.id]?.[item.productId];
      const available = !!pp && pp.inStock;

      if (available && pp) {
        const lineTotal = pp.price * item.quantity;
        totalPrice += lineTotal;
        availableItems++;

        breakdown.push({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: pp.price,
          totalPrice: lineTotal,
          available: true,
          discountPercent: pp.discountPercent,
          mrp: pp.mrp,
        });
      } else {
        unavailableItems++;
        breakdown.push({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: null,
          totalPrice: null,
          available: false,
          discountPercent: 0,
          mrp: null,
        });
      }
    }

    // Calculate delivery fee (free above threshold)
    const deliveryFee =
      totalPrice >= platform.deliveryFeeThreshold ? 0 : platform.deliveryFeeBase;

    // Estimated tax (GST ~5% on groceries, simplified)
    const estimatedTax = Math.round(totalPrice * 0.05 * 100) / 100;

    // Random delivery time within platform range (simulate real variance)
    const deliveryRange = platform.deliveryTimeMax - platform.deliveryTimeMin;
    const estimatedDeliveryMins =
      platform.deliveryTimeMin + Math.floor(Math.random() * deliveryRange);

    const finalTotal =
      Math.round((totalPrice + deliveryFee + estimatedTax) * 100) / 100;

    platformResults.push({
      platformId: platform.id,
      totalPrice: Math.round(totalPrice * 100) / 100,
      deliveryFee,
      estimatedTax,
      finalTotal,
      availableItems,
      unavailableItems,
      estimatedDeliveryMins,
      itemBreakdown: breakdown,
    });
  }

  // Only tag platforms where at least some items are available
  const validResults = platformResults.filter((r) => r.availableItems > 0);

  if (validResults.length === 0) {
    throw new Error('No items are available on any platform');
  }

  const minTotal = Math.min(...validResults.map((r) => r.finalTotal));
  const maxTotal = Math.max(...validResults.map((r) => r.finalTotal));
  const minDelivery = Math.min(...validResults.map((r) => r.estimatedDeliveryMins));

  // Tag each result
  for (const result of platformResults) {
    const isCheapest = result.finalTotal === minTotal && result.availableItems > 0;
    const isFastest = result.estimatedDeliveryMins === minDelivery && result.availableItems > 0;
    // Best value = cheapest OR within 5% of cheapest AND faster than average
    const avgDelivery =
      validResults.reduce((s, r) => s + r.estimatedDeliveryMins, 0) / validResults.length;
    const isBestValue =
      result.availableItems > 0 &&
      result.finalTotal <= minTotal * 1.05 &&
      result.estimatedDeliveryMins <= avgDelivery;

    (result as PlatformResult & { isCheapest: boolean; isFastest: boolean; isBestValue: boolean; savingsVsMax: number }).isCheapest = isCheapest;
    (result as PlatformResult & { isCheapest: boolean; isFastest: boolean; isBestValue: boolean; savingsVsMax: number }).isFastest = isFastest;
    (result as PlatformResult & { isCheapest: boolean; isFastest: boolean; isBestValue: boolean; savingsVsMax: number }).isBestValue = isBestValue;
    (result as PlatformResult & { isCheapest: boolean; isFastest: boolean; isBestValue: boolean; savingsVsMax: number }).savingsVsMax =
      Math.round((maxTotal - result.finalTotal) * 100) / 100;
  }

  // Persist comparison in database
  const comparison = await prisma.comparison.create({
    data: {
      cartId: cart.id,
      userId: userId || null,
      results: {
        create: platformResults.map((r) => {
          const tagged = r as PlatformResult & {
            isCheapest: boolean;
            isFastest: boolean;
            isBestValue: boolean;
            savingsVsMax: number;
          };
          return {
            platformId: tagged.platformId,
            totalPrice: tagged.totalPrice,
            deliveryFee: tagged.deliveryFee,
            estimatedTax: tagged.estimatedTax,
            finalTotal: tagged.finalTotal,
            availableItems: tagged.availableItems,
            unavailableItems: tagged.unavailableItems,
            estimatedDeliveryMins: tagged.estimatedDeliveryMins,
            savingsVsMax: tagged.savingsVsMax,
            isCheapest: tagged.isCheapest,
            isFastest: tagged.isFastest,
            isBestValue: tagged.isBestValue,
            itemBreakdown: JSON.stringify(tagged.itemBreakdown),
          };
        }),
      },
    },
    include: {
      results: {
        include: { platform: true },
        orderBy: { finalTotal: 'asc' },
      },
      cart: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                  brand: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  // Log analytics event
  if (userId) {
    prisma.analyticsEvent.create({
      data: {
        userId,
        eventType: 'comparison_created',
        metadata: JSON.stringify({
          comparisonId: comparison.id,
          itemCount: cart.items.length,
          platformCount: platforms.length,
        }),
      },
    }).catch(console.error);
  }

  const formattedComparison = {
    ...comparison,
    results: comparison.results.map((r) => {
      let parsedBreakdown = [];
      if (typeof r.itemBreakdown === 'string') {
        try {
          parsedBreakdown = JSON.parse(r.itemBreakdown);
        } catch {
          parsedBreakdown = [];
        }
      } else {
        parsedBreakdown = r.itemBreakdown;
      }
      return {
        ...r,
        itemBreakdown: parsedBreakdown,
      };
    }),
  };

  return formattedComparison;
};
