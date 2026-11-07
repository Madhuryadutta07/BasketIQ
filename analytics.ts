import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [totalComparisons, totalSavingsRes, favPlatformRes, searchCount] = await Promise.all([
      prisma.comparison.count({ where: { userId } }),
      prisma.comparisonResult.aggregate({
        where: { comparison: { userId }, isCheapest: true },
        _sum: { savingsVsMax: true },
      }),
      prisma.comparisonResult.groupBy({
        by: ['platformId'],
        where: { comparison: { userId }, isCheapest: true },
        _count: { platformId: true },
        orderBy: { _count: { platformId: 'desc' } },
        take: 1,
      }),
      prisma.searchHistory.count({ where: { userId } }),
    ]);

    let favPlatform = null;
    if (favPlatformRes.length > 0) {
      favPlatform = await prisma.platform.findUnique({
        where: { id: favPlatformRes[0].platformId },
        select: { id: true, name: true, slug: true, color: true },
      });
    }

    res.json({
      totalComparisons,
      totalSavings: Math.round((totalSavingsRes._sum.savingsVsMax || 0) * 100) / 100,
      favoritePlatform: favPlatform,
      totalSearches: searchCount,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /api/analytics/platform-comparison
router.get('/platform-comparison', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, color: true },
    });

    const comparisons = await prisma.comparisonResult.findMany({
      where: { comparison: { userId } },
      select: {
        platformId: true,
        finalTotal: true,
        isCheapest: true,
        savingsVsMax: true,
      },
    });

    // Aggregate per platform
    const stats = platforms.map((platform) => {
      const results = comparisons.filter((c) => c.platformId === platform.id);
      const avgTotal = results.length > 0
        ? results.reduce((s, r) => s + r.finalTotal, 0) / results.length
        : 0;
      const cheapestCount = results.filter((r) => r.isCheapest).length;
      const totalSavings = results.reduce((s, r) => s + r.savingsVsMax, 0);

      return {
        ...platform,
        comparisonsCount: results.length,
        avgTotal: Math.round(avgTotal * 100) / 100,
        cheapestCount,
        totalSavings: Math.round(totalSavings * 100) / 100,
      };
    });

    res.json({ platformStats: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platform comparison' });
  }
});

// GET /api/analytics/price-trends
router.get('/price-trends', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get last 30 days of comparison results for the user
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const comparisons = await prisma.comparison.findMany({
      where: { userId: req.user!.id, createdAt: { gte: thirtyDaysAgo } },
      include: {
        results: {
          include: { platform: { select: { name: true, color: true } } },
          where: { isCheapest: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const trends = comparisons.map((c) => ({
      date: c.createdAt.toISOString().split('T')[0],
      cheapestTotal: c.results[0]?.finalTotal ?? 0,
      platform: c.results[0]?.platform?.name ?? 'N/A',
    }));

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
});

// GET /api/analytics/category-breakdown
router.get('/category-breakdown', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get all cart items across user's comparisons
    const carts = await prisma.cart.findMany({
      where: { comparisons: { some: { userId } } },
      include: {
        items: {
          include: {
            product: {
              include: { category: { select: { name: true } } },
            },
          },
        },
      },
    });

    const categoryMap: Record<string, { name: string; count: number; items: number }> = {};
    for (const cart of carts) {
      for (const item of cart.items) {
        const catName = item.product.category.name;
        if (!categoryMap[catName]) {
          categoryMap[catName] = { name: catName, count: 0, items: 0 };
        }
        categoryMap[catName].count++;
        categoryMap[catName].items += item.quantity;
      }
    }

    const categories = Object.values(categoryMap).sort((a, b) => b.count - a.count);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

export default router;
