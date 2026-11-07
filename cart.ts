import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const addItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().min(1).max(99).default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

// Helper: get or create active cart
const getOrCreateCart = async (userId?: string, sessionId?: string) => {
  if (userId) {
    let cart = await prisma.cart.findFirst({
      where: { userId, isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                brand: { select: { id: true, name: true } },
                platformProducts: {
                  include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
                  where: { inStock: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, isActive: true },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                  brand: { select: { id: true, name: true } },
                  platformProducts: {
                    include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
                    where: { inStock: true },
                    orderBy: { price: 'asc' },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }
    return cart;
  }

  if (sessionId) {
    let cart = await prisma.cart.findFirst({
      where: { sessionId, isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                brand: { select: { id: true, name: true } },
                platformProducts: {
                  include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
                  where: { inStock: true },
                  orderBy: { price: 'asc' },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId, isActive: true },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                  brand: { select: { id: true, name: true } },
                  platformProducts: {
                    include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
                    where: { inStock: true },
                    orderBy: { price: 'asc' },
                  },
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }
    return cart;
  }

  return null;
};

// GET /api/cart
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getOrCreateCart(req.user?.id, sessionId);

    if (!cart) {
      res.json({ cart: null, items: [], itemCount: 0 });
      return;
    }

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ cart: { ...cart, itemCount } });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart/items
router.post('/items', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { productId, quantity } = parsed.data;
    const sessionId = req.headers['x-session-id'] as string;

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const cart = await getOrCreateCart(req.user?.id, sessionId);
    if (!cart) {
      res.status(400).json({ error: 'Session ID required for guest cart' });
      return;
    }

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(99, existing.quantity + quantity) },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    // Return updated cart
    const updatedCart = await getOrCreateCart(req.user?.id, sessionId);
    const itemCount = updatedCart!.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ cart: { ...updatedCart, itemCount }, item });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/items/:itemId
router.put('/items/:itemId', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { quantity } = parsed.data;
    const sessionId = req.headers['x-session-id'] as string;

    if (quantity === 0) {
      // Delete the item
      await prisma.cartItem.deleteMany({
        where: { id: req.params.itemId },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: req.params.itemId },
        data: { quantity },
      });
    }

    const cart = await getOrCreateCart(req.user?.id, sessionId);
    const itemCount = cart!.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ cart: { ...cart, itemCount } });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/items/:itemId
router.delete('/items/:itemId', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    await prisma.cartItem.deleteMany({
      where: { id: req.params.itemId },
    });

    const cart = await getOrCreateCart(req.user?.id, sessionId);
    const itemCount = cart!.items.reduce((sum, i) => sum + i.quantity, 0);
    res.json({ cart: { ...cart, itemCount } });
  } catch (error) {
    console.error('Delete cart item error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// DELETE /api/cart — clear cart
router.delete('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getOrCreateCart(req.user?.id, sessionId);

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// POST /api/cart/save — save current cart as a list (requires auth)
router.post('/save', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'List name is required' });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: { userId: req.user!.id, isActive: true },
    });

    if (!cart) {
      res.status(404).json({ error: 'No active cart found' });
      return;
    }

    const savedList = await prisma.savedList.create({
      data: {
        userId: req.user!.id,
        name,
        cartId: cart.id,
      },
    });

    res.status(201).json({ savedList });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});

export default router;
