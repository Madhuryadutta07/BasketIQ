import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth, authenticate, AuthRequest } from '../middleware/auth';
import { runComparisonEngine } from '../services/comparisonEngine';

const router = Router();

// POST /api/compare — main comparison endpoint
router.post('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    // Get the user's active cart
    let cart = null;
    if (req.user?.id) {
      cart = await prisma.cart.findFirst({
        where: { userId: req.user.id, isActive: true },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findFirst({
        where: { sessionId, isActive: true },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ error: 'Cart is empty. Add items before comparing.' });
      return;
    }

    // Run comparison engine
    const comparison = await runComparisonEngine(cart, req.user?.id);

    res.status(201).json({ comparison });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ error: 'Comparison failed' });
  }
});

// GET /api/compare/:id — fetch a saved comparison
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: req.params.id },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
                    brand: { select: { id: true, name: true } },
                    platformProducts: {
                      include: {
                        platform: { select: { id: true, name: true, slug: true, color: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        results: {
          include: {
            platform: true,
          },
          orderBy: { finalTotal: 'asc' },
        },
      },
    });

    if (!comparison) {
      res.status(404).json({ error: 'Comparison not found' });
      return;
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

    res.json({ comparison: formattedComparison });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison' });
  }
});

// GET /api/compare — comparison history (auth required)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [comparisons, total] = await Promise.all([
      prisma.comparison.findMany({
        where: { userId: req.user!.id },
        include: {
          results: {
            include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
            orderBy: { finalTotal: 'asc' },
            take: 1,
          },
          cart: {
            include: {
              _count: { select: { items: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.comparison.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      comparisons,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Comparison history error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison history' });
  }
});

export default router;
