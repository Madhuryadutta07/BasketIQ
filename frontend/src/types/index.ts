export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: {
    comparisons: number;
    savedLists: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconEmoji: string;
  description?: string;
  sortOrder: number;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  color: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFeeBase: number;
  deliveryFeeThreshold: number;
  isActive: boolean;
}

export interface PlatformProduct {
  id: string;
  platformId: string;
  productId: string;
  price: number;
  mrp: number;
  discountPercent: number;
  inStock: boolean;
  platform: Platform;
  priceHistory?: { price: number; recordedAt: string }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  unitSize?: string;
  tags: string[];
  category: Category;
  brand?: Brand;
  platformProducts: PlatformProduct[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  itemCount: number;
  _count?: {
    items: number;
  };
}

export interface ItemBreakdown {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  available: boolean;
  discountPercent: number;
  mrp: number | null;
}

export interface ComparisonResult {
  id: string;
  comparisonId: string;
  platformId: string;
  totalPrice: number;
  deliveryFee: number;
  estimatedTax: number;
  finalTotal: number;
  availableItems: number;
  unavailableItems: number;
  estimatedDeliveryMins: number;
  savingsVsMax: number;
  isCheapest: boolean;
  isFastest: boolean;
  isBestValue: boolean;
  itemBreakdown: ItemBreakdown[];
  platform: Platform;
}

export interface Comparison {
  id: string;
  cartId: string;
  userId?: string;
  createdAt: string;
  cart: Cart;
  results: ComparisonResult[];
}

export interface SavedList {
  id: string;
  userId: string;
  name: string;
  cartId: string;
  createdAt: string;
  cart: Cart;
}
