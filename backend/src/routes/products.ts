import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/products — list with pagination, filters, category
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };

    if (minPrice || maxPrice) {
      where.platformProducts = {
        some: {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
          inStock: true,
        },
      };
    }

    if (inStock === 'true') {
      where.platformProducts = {
        some: { inStock: true },
      };
    }

    const validSortFields = ['name', 'createdAt'];
    const orderBy: Record<string, string> = {
      [validSortFields.includes(sortBy) ? sortBy : 'name']: sortOrder === 'desc' ? 'desc' : 'asc',
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
          brand: { select: { id: true, name: true, slug: true } },
          platformProducts: {
            include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
            where: { inStock: true },
            orderBy: { price: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      },
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Grocery synonym & term variant mapper
const SYNONYMS: Record<string, string[]> = {
  egg: ['egg', 'eggs', 'anda', 'ande'],
  eggs: ['egg', 'eggs', 'anda', 'ande'],
  potato: ['potato', 'potatoes', 'aloo', 'alu'],
  potatoes: ['potato', 'potatoes', 'aloo', 'alu'],
  aloo: ['potato', 'potatoes', 'aloo'],
  tomato: ['tomato', 'tomatoes', 'tamatar'],
  tomatoes: ['tomato', 'tomatoes', 'tamatar'],
  onion: ['onion', 'onions', 'pyaz', 'pyaaz'],
  onions: ['onion', 'onions', 'pyaz', 'pyaaz'],
  milk: ['milk', 'doodh', 'taaza', 'toned', 'full cream'],
  butter: ['butter', 'makhan'],
  curd: ['curd', 'dahi', 'yogurt'],
  dahi: ['curd', 'dahi', 'yogurt'],
  paneer: ['paneer', 'cottage cheese'],
  atta: ['atta', 'wheat', 'flour'],
  flour: ['atta', 'maida', 'flour'],
  rice: ['rice', 'basmati', 'chawal'],
  oil: ['oil', 'tel', 'ghee'],
  ghee: ['ghee'],
  chocolate: ['chocolate', 'chocolates', 'choco', 'silk', 'dark fantasy', 'kit kat', '5 star', 'dairy milk'],
  chocolates: ['chocolate', 'chocolates', 'choco', 'silk', 'dark fantasy', 'kit kat', '5 star', 'dairy milk'],
  chips: ['chips', 'lays', 'kurkure', 'namkeen'],
  tea: ['tea', 'chai', 'tata tea'],
  coffee: ['coffee', 'nescafe', 'bru'],
  soap: ['soap', 'beauty bar', 'dove', 'pears', 'lifebuoy'],
  shampoo: ['shampoo', 'pantene', 'sunsilk', 'head shoulders'],
  toothpaste: ['toothpaste', 'colgate', 'sensodyne'],
  biscuit: ['biscuit', 'biscuits', 'parle', 'britannia', 'cookies'],
  biscuits: ['biscuit', 'biscuits', 'parle', 'britannia', 'cookies'],
  cookie: ['cookie', 'cookies', 'biscuit'],
  cookies: ['cookie', 'cookies', 'biscuit'],
  noodle: ['noodle', 'noodles', 'maggi', 'knorr'],
  noodles: ['noodle', 'noodles', 'maggi', 'knorr'],
  maggi: ['maggi', 'noodles'],
  bread: ['bread', 'bun', 'pav'],
};

function getSearchVariants(rawQuery: string): string[] {
  const tokens = rawQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const variants = new Set<string>();
  variants.add(rawQuery.toLowerCase());

  for (const token of tokens) {
    variants.add(token);
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach((s) => variants.add(s.toLowerCase()));
    }
    if (token.endsWith('ies') && token.length > 4) variants.add(token.slice(0, -3) + 'y');
    if (token.endsWith('es') && token.length > 4) variants.add(token.slice(0, -2));
    if (token.endsWith('s') && token.length > 3) variants.add(token.slice(0, -1));
  }

  return Array.from(variants);
}

// GET /api/products/search — relevance-ranked fuzzy search
router.get('/search', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q = '', limit = '10', category } = req.query as Record<string, string>;
    const query = q.trim();

    if (!query) {
      const popular = await prisma.product.findMany({
        where: { isActive: true, ...(category && { category: { slug: category } }) },
        include: {
          category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
          brand: { select: { id: true, name: true } },
          platformProducts: {
            include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
            where: { inStock: true },
            orderBy: { price: 'asc' },
          },
        },
        take: Math.min(20, parseInt(limit)),
        orderBy: { name: 'asc' },
      });
      res.json({ products: popular, query: '' });
      return;
    }

    // Save search history for authenticated users
    if (req.user) {
      prisma.searchHistory.create({
        data: { userId: req.user.id, query },
      }).catch(console.error);
    }

    const searchVariants = getSearchVariants(query);
    const orConditions: object[] = [];
    for (const v of searchVariants) {
      orConditions.push({ name: { contains: v } });
      orConditions.push({ description: { contains: v } });
      orConditions.push({ tags: { contains: v } });
      orConditions.push({ brand: { name: { contains: v } } });
      orConditions.push({ category: { name: { contains: v } } });
    }

    const rawProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: orConditions,
        ...(category && { category: { slug: category } }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
        brand: { select: { id: true, name: true } },
        platformProducts: {
          include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
          where: { inStock: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    const qLower = query.toLowerCase();

    // Score candidates by relevance
    const scored = rawProducts.map((p) => {
      let score = 0;
      const pName = p.name.toLowerCase();
      const pTags = (p.tags || '').toLowerCase();
      const pBrand = (p.brand?.name || '').toLowerCase();
      const pCat = p.category?.name?.toLowerCase() || '';

      if (pName === qLower) score += 1000;
      else if (pName.startsWith(qLower)) score += 500;
      else if (pName.includes(qLower)) score += 300;

      for (const v of searchVariants) {
        if (pName.includes(v)) score += 150;
      }
      for (const v of searchVariants) {
        if (pTags.includes(v)) score += 100;
      }
      for (const v of searchVariants) {
        if (pBrand.includes(v)) score += 50;
      }

      // Category match gets tiny score so it won't displace actual name/tag matches
      if (score === 0 && pCat.includes(qLower)) {
        score += 5;
      }

      return { product: p, score };
    });

    // Sort by relevance score DESC, then product name ASC
    scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));

    const takeCount = Math.min(50, parseInt(limit));
    const products = scored.slice(0, takeCount).map((s) => s.product);

    res.json({ products, query });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});


// GET /api/products/popular — top products
router.get('/popular', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true, iconEmoji: true } },
        brand: { select: { id: true, name: true } },
        platformProducts: {
          include: { platform: { select: { id: true, name: true, slug: true, color: true } } },
          where: { inStock: true },
          orderBy: { price: 'asc' },
        },
      },
      take: 20,
      orderBy: { name: 'asc' },
    });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: req.params.id }, { slug: req.params.id }],
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        platformProducts: {
          include: {
            platform: true,
            priceHistory: {
              orderBy: { recordedAt: 'desc' },
              take: 30,
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

export default router;
