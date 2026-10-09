import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
});

// GET /api/profile
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, avatarUrl: true, createdAt: true,
        _count: { select: { comparisons: true, savedLists: true } },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get recent comparisons
    const recentComparisons = await prisma.comparison.findMany({
      where: { userId: req.user!.id },
      include: {
        results: {
          include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
          orderBy: { finalTotal: 'asc' },
          take: 1,
        },
        cart: { include: { _count: { select: { items: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Saved lists
    const savedLists = await prisma.savedList.findMany({
      where: { userId: req.user!.id },
      include: {
        cart: { include: { _count: { select: { items: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Total savings across all comparisons
    const allResults = await prisma.comparisonResult.findMany({
      where: {
        comparison: { userId: req.user!.id },
        isCheapest: true,
      },
      select: { savingsVsMax: true },
    });
    const totalSavings = allResults.reduce((sum, r) => sum + r.savingsVsMax, 0);

    res.json({ user, recentComparisons, savedLists, totalSavings: Math.round(totalSavings * 100) / 100 });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/profile
router.put('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, avatarUrl: true, updatedAt: true },
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/profile/saved-lists
router.get('/saved-lists', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const savedLists = await prisma.savedList.findMany({
      where: { userId: req.user!.id },
      include: {
        cart: {
          include: {
            items: {
              include: { product: { include: { brand: { select: { name: true } } } } },
              take: 5,
            },
            _count: { select: { items: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ savedLists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved lists' });
  }
});

// DELETE /api/profile/saved-lists/:id
router.delete('/saved-lists/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.savedList.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.json({ message: 'List deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// GET /api/profile/search-history
router.get('/search-history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const history = await prisma.searchHistory.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      distinct: ['query'],
    });

    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

export default router;
