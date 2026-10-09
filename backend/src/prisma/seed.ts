import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randPrice(base: number, variance = 0.12): number {
  const v = base * variance;
  return Math.round((base + (Math.random() - 0.5) * 2 * v) * 100) / 100;
}

async function main() {
  console.log('🌱 Seeding BasketIQ database...');

  // ─── CATEGORIES ───────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'dairy' }, update: {}, create: { name: 'Dairy & Eggs', slug: 'dairy', iconEmoji: '🥛', description: 'Milk, curd, cheese, butter, eggs', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'staples' }, update: {}, create: { name: 'Staples', slug: 'staples', iconEmoji: '🌾', description: 'Rice, atta, dal, sugar, salt', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'vegetables' }, update: {}, create: { name: 'Vegetables', slug: 'vegetables', iconEmoji: '🥦', description: 'Fresh vegetables', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'fruits' }, update: {}, create: { name: 'Fruits', slug: 'fruits', iconEmoji: '🍎', description: 'Fresh fruits', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'bread-bakery' }, update: {}, create: { name: 'Bread & Bakery', slug: 'bread-bakery', iconEmoji: '🍞', description: 'Bread, buns, biscuits', sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: 'oils-ghee' }, update: {}, create: { name: 'Oils & Ghee', slug: 'oils-ghee', iconEmoji: '🫙', description: 'Cooking oils and ghee', sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: 'snacks' }, update: {}, create: { name: 'Snacks', slug: 'snacks', iconEmoji: '🍿', description: 'Chips, namkeen, biscuits, chocolates', sortOrder: 7 } }),
    prisma.category.upsert({ where: { slug: 'beverages' }, update: {}, create: { name: 'Beverages', slug: 'beverages', iconEmoji: '☕', description: 'Tea, coffee, juices, drinks', sortOrder: 8 } }),
    prisma.category.upsert({ where: { slug: 'personal-care' }, update: {}, create: { name: 'Personal Care', slug: 'personal-care', iconEmoji: '🧴', description: 'Soap, shampoo, toothpaste', sortOrder: 9 } }),
    prisma.category.upsert({ where: { slug: 'cleaning' }, update: {}, create: { name: 'Cleaning', slug: 'cleaning', iconEmoji: '🧹', description: 'Cleaning products, detergents', sortOrder: 10 } }),
    prisma.category.upsert({ where: { slug: 'frozen' }, update: {}, create: { name: 'Frozen Foods', slug: 'frozen', iconEmoji: '🧊', description: 'Frozen meals, ice cream', sortOrder: 11 } }),
    prisma.category.upsert({ where: { slug: 'spices' }, update: {}, create: { name: 'Spices & Masala', slug: 'spices', iconEmoji: '🌶️', description: 'Spices, masalas, condiments', sortOrder: 12 } }),
  ]);

  const catMap: Record<string, string> = {};
  for (const c of categories) catMap[c.slug] = c.id;

  // ─── BRANDS ───────────────────────────────────────────────────────
  const brandNames = [
    'Amul', 'Mother Dairy', 'Nestle', 'Britannia', 'ITC', 'Dabur',
    'Godrej', 'HUL', 'P&G', 'Colgate', 'Patanjali', 'Haldiram\'s',
    'Lay\'s', 'Kurkure', 'Parle', 'Marico', 'Saffola', 'Fortune',
    'Aashirvaad', 'Pillsbury', 'India Gate', 'Daawat', 'Kohinoor',
    'Tata', 'Brooke Bond', 'Nescafe', 'Bru', 'Real', 'Tropicana',
    'Paper Boat', 'Lipton', 'Surf Excel', 'Ariel', 'Vim', 'Harpic',
    'Lizol', 'Dettol', 'Lifebuoy', 'Dove', 'Pantene', 'Head & Shoulders',
    'Clinic Plus', 'Pears', 'Himalaya', 'Dermicool', 'Sunsilk',
    'Close Up', 'Sensodyne', 'Oral-B', 'Boroline',
    'Farm Fresh', 'Safal', 'Del Monte', 'Heinz', 'Maggi', 'Knorr',
    'Catch', 'MDH', 'Everest', 'Eastern', 'Badshah', 'Priya Gold',
    'Dark Fantasy', 'Good Day', 'Tiger', 'Monaco', '50-50',
    'Kit Kat', 'Dairy Milk', 'Munch', ' 5 Star', 'Milkybar',
    'Oreo', 'Bourbon', 'Hide & Seek', 'Unibic',
    'Kwality Wall\'s', 'Mother Dairy Ice Cream', 'Havmor', 'Baskin Robbins',
    'Raw Pressery', 'B Natural', 'Minute Maid',
  ];

  const brands: Record<string, string> = {};
  for (const name of brandNames) {
    const s = slug(name);
    try {
      const b = await prisma.brand.upsert({
        where: { slug: s },
        update: {},
        create: { name, slug: s },
      });
      brands[name] = b.id;
    } catch {
      // skip duplicate
    }
  }

  // ─── PLATFORMS ────────────────────────────────────────────────────
  const platforms = await Promise.all([
    prisma.platform.upsert({
      where: { slug: 'blinkit' }, update: {},
      create: { name: 'Blinkit', slug: 'blinkit', color: '#F8C02F', deliveryTimeMin: 8, deliveryTimeMax: 15, deliveryFeeBase: 25, deliveryFeeThreshold: 199 },
    }),
    prisma.platform.upsert({
      where: { slug: 'zepto' }, update: {},
      create: { name: 'Zepto', slug: 'zepto', color: '#9B5DE5', deliveryTimeMin: 10, deliveryTimeMax: 20, deliveryFeeBase: 30, deliveryFeeThreshold: 249 },
    }),
    prisma.platform.upsert({
      where: { slug: 'instamart' }, update: {},
      create: { name: 'Instamart', slug: 'instamart', color: '#FC8019', deliveryTimeMin: 15, deliveryTimeMax: 30, deliveryFeeBase: 40, deliveryFeeThreshold: 299 },
    }),
    prisma.platform.upsert({
      where: { slug: 'bigbasket' }, update: {},
      create: { name: 'BigBasket', slug: 'bigbasket', color: '#84BA40', deliveryTimeMin: 60, deliveryTimeMax: 120, deliveryFeeBase: 35, deliveryFeeThreshold: 500 },
    }),
  ]);

  const platIds = platforms.map((p) => p.id);

  // ─── PRODUCT DEFINITIONS ──────────────────────────────────────────
  type ProductDef = {
    name: string; brand: string; category: string; unit: string;
    unitSize: string; basePrice: number; mrp: number; tags: string[];
    imageUrl?: string;
  };

  const productDefs: ProductDef[] = [
    // DAIRY
    { name: 'Amul Taaza Toned Milk', brand: 'Amul', category: 'dairy', unit: 'litre', unitSize: '1L', basePrice: 60, mrp: 64, tags: ['milk', 'dairy', 'toned', 'amul'] },
    { name: 'Amul Taaza Toned Milk', brand: 'Amul', category: 'dairy', unit: 'litre', unitSize: '500ml', basePrice: 31, mrp: 33, tags: ['milk', 'dairy', 'toned'] },
    { name: 'Mother Dairy Toned Milk', brand: 'Mother Dairy', category: 'dairy', unit: 'litre', unitSize: '1L', basePrice: 58, mrp: 62, tags: ['milk', 'dairy', 'mother dairy'] },
    { name: 'Mother Dairy Full Cream Milk', brand: 'Mother Dairy', category: 'dairy', unit: 'litre', unitSize: '1L', basePrice: 72, mrp: 76, tags: ['milk', 'dairy', 'full cream'] },
    { name: 'Amul Full Cream Milk', brand: 'Amul', category: 'dairy', unit: 'litre', unitSize: '1L', basePrice: 70, mrp: 74, tags: ['milk', 'dairy', 'full cream', 'amul'] },
    { name: 'Amul Butter', brand: 'Amul', category: 'dairy', unit: 'gm', unitSize: '100g', basePrice: 55, mrp: 58, tags: ['butter', 'dairy', 'amul'] },
    { name: 'Amul Butter', brand: 'Amul', category: 'dairy', unit: 'gm', unitSize: '500g', basePrice: 265, mrp: 280, tags: ['butter', 'dairy', 'amul'] },
    { name: 'Amul Processed Cheese', brand: 'Amul', category: 'dairy', unit: 'gm', unitSize: '200g', basePrice: 115, mrp: 125, tags: ['cheese', 'dairy', 'amul'] },
    { name: 'Amul Fresh Paneer', brand: 'Amul', category: 'dairy', unit: 'gm', unitSize: '200g', basePrice: 90, mrp: 95, tags: ['paneer', 'dairy', 'amul'] },
    { name: 'Mother Dairy Paneer', brand: 'Mother Dairy', category: 'dairy', unit: 'gm', unitSize: '200g', basePrice: 85, mrp: 92, tags: ['paneer', 'dairy'] },
    { name: 'Amul Dahi Plain Curd', brand: 'Amul', category: 'dairy', unit: 'gm', unitSize: '400g', basePrice: 48, mrp: 52, tags: ['curd', 'dahi', 'dairy'] },
    { name: 'Mother Dairy Curd', brand: 'Mother Dairy', category: 'dairy', unit: 'gm', unitSize: '400g', basePrice: 45, mrp: 50, tags: ['curd', 'dahi', 'dairy'] },
    { name: 'Amul Masti Dahi', brand: 'Amul', category: 'dairy', unit: 'kg', unitSize: '1kg', basePrice: 95, mrp: 100, tags: ['curd', 'dahi', 'dairy', 'bulk'] },
    { name: 'Amul Ghee', brand: 'Amul', category: 'dairy', unit: 'ml', unitSize: '500ml', basePrice: 290, mrp: 315, tags: ['ghee', 'dairy', 'amul'] },
    { name: 'Nestle a+ Slim Milk', brand: 'Nestle', category: 'dairy', unit: 'ml', unitSize: '500ml', basePrice: 34, mrp: 36, tags: ['milk', 'dairy', 'slim'] },
    { name: 'Farm Fresh Eggs', brand: 'Farm Fresh', category: 'dairy', unit: 'pcs', unitSize: '6 pcs', basePrice: 55, mrp: 60, tags: ['eggs', 'protein', 'dairy'] },
    { name: 'Farm Fresh Eggs', brand: 'Farm Fresh', category: 'dairy', unit: 'pcs', unitSize: '12 pcs', basePrice: 108, mrp: 115, tags: ['eggs', 'protein', 'dairy'] },
    { name: 'Farm Fresh Eggs', brand: 'Farm Fresh', category: 'dairy', unit: 'pcs', unitSize: '30 pcs', basePrice: 260, mrp: 280, tags: ['eggs', 'protein', 'dairy', 'bulk'] },
    { name: 'Amul Lassi', brand: 'Amul', category: 'dairy', unit: 'ml', unitSize: '200ml', basePrice: 30, mrp: 32, tags: ['lassi', 'dairy', 'drink'] },
    { name: 'Amul Cream', brand: 'Amul', category: 'dairy', unit: 'ml', unitSize: '250ml', basePrice: 55, mrp: 60, tags: ['cream', 'dairy', 'amul'] },

    // STAPLES
    { name: 'India Gate Basmati Rice', brand: 'India Gate', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 490, mrp: 540, tags: ['rice', 'basmati', 'staples'] },
    { name: 'India Gate Basmati Rice', brand: 'India Gate', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 105, mrp: 115, tags: ['rice', 'basmati'] },
    { name: 'Daawat Rozana Basmati Rice', brand: 'Daawat', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 380, mrp: 420, tags: ['rice', 'basmati', 'daawat'] },
    { name: 'Kohinoor Super Value Rice', brand: 'Kohinoor', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 310, mrp: 350, tags: ['rice', 'value'] },
    { name: 'Aashirvaad Atta', brand: 'Aashirvaad', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 280, mrp: 310, tags: ['atta', 'wheat', 'flour', 'staples'] },
    { name: 'Aashirvaad Atta', brand: 'Aashirvaad', category: 'staples', unit: 'kg', unitSize: '10kg', basePrice: 540, mrp: 600, tags: ['atta', 'wheat', 'flour', 'bulk'] },
    { name: 'Pillsbury Chakki Fresh Atta', brand: 'Pillsbury', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 255, mrp: 290, tags: ['atta', 'wheat', 'flour'] },
    { name: 'Patanjali Whole Wheat Atta', brand: 'Patanjali', category: 'staples', unit: 'kg', unitSize: '5kg', basePrice: 215, mrp: 250, tags: ['atta', 'wheat', 'flour', 'organic'] },
    { name: 'Tata Salt', brand: 'Tata', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 22, mrp: 24, tags: ['salt', 'staples', 'tata'] },
    { name: 'Catch Salt', brand: 'Catch', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 20, mrp: 22, tags: ['salt', 'staples'] },
    { name: 'Daawat Toor Dal', brand: 'Daawat', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 135, mrp: 150, tags: ['dal', 'toor', 'lentils', 'staples'] },
    { name: 'Tata Sampann Moong Dal', brand: 'Tata', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 145, mrp: 160, tags: ['dal', 'moong', 'lentils', 'staples'] },
    { name: 'Aashirvaad Masoor Dal', brand: 'Aashirvaad', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 120, mrp: 135, tags: ['dal', 'masoor', 'lentils'] },
    { name: 'Sugar (Double Refined)', brand: 'Tata', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 45, mrp: 50, tags: ['sugar', 'staples'] },
    { name: 'Poha', brand: 'Patanjali', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 48, mrp: 55, tags: ['poha', 'breakfast', 'staples'] },
    { name: 'Sooji / Rava', brand: 'Aashirvaad', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 38, mrp: 42, tags: ['sooji', 'rava', 'staples'] },
    { name: 'Vermicelli Seviyan', brand: 'Bambino', category: 'staples', unit: 'gm', unitSize: '900g', basePrice: 52, mrp: 58, tags: ['vermicelli', 'seviyan', 'staples'] },
    { name: 'Maida All Purpose Flour', brand: 'Aashirvaad', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 35, mrp: 38, tags: ['maida', 'flour', 'staples'] },
    { name: 'Rajma (Red Kidney Beans)', brand: 'Daawat', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 145, mrp: 160, tags: ['rajma', 'beans', 'staples'] },
    { name: 'Chana Dal', brand: 'Tata', category: 'staples', unit: 'kg', unitSize: '1kg', basePrice: 128, mrp: 140, tags: ['dal', 'chana', 'lentils', 'staples'] },

    // VEGETABLES
    { name: 'Onion', brand: 'Safal', category: 'vegetables', unit: 'kg', unitSize: '1kg', basePrice: 40, mrp: 50, tags: ['onion', 'vegetables', 'fresh'] },
    { name: 'Tomato', brand: 'Safal', category: 'vegetables', unit: 'kg', unitSize: '1kg', basePrice: 35, mrp: 45, tags: ['tomato', 'vegetables', 'fresh'] },
    { name: 'Potato', brand: 'Safal', category: 'vegetables', unit: 'kg', unitSize: '1kg', basePrice: 30, mrp: 38, tags: ['potato', 'vegetables', 'fresh'] },
    { name: 'Spinach (Palak)', brand: 'Safal', category: 'vegetables', unit: 'gm', unitSize: '250g', basePrice: 20, mrp: 25, tags: ['spinach', 'palak', 'vegetables', 'fresh', 'leafy'] },
    { name: 'Carrot', brand: 'Safal', category: 'vegetables', unit: 'kg', unitSize: '500g', basePrice: 30, mrp: 35, tags: ['carrot', 'vegetables', 'fresh'] },
    { name: 'Capsicum (Green)', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '250g', basePrice: 28, mrp: 32, tags: ['capsicum', 'vegetables', 'fresh'] },
    { name: 'Cauliflower', brand: 'Safal', category: 'vegetables', unit: 'pcs', unitSize: '1 pc (~500g)', basePrice: 45, mrp: 55, tags: ['cauliflower', 'vegetables', 'fresh'] },
    { name: 'Broccoli', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '300g', basePrice: 65, mrp: 75, tags: ['broccoli', 'vegetables', 'fresh'] },
    { name: 'Ginger', brand: 'Safal', category: 'vegetables', unit: 'gm', unitSize: '100g', basePrice: 18, mrp: 22, tags: ['ginger', 'vegetables', 'spice'] },
    { name: 'Garlic', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '100g', basePrice: 25, mrp: 30, tags: ['garlic', 'vegetables', 'spice'] },
    { name: 'Green Chilli', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '100g', basePrice: 12, mrp: 15, tags: ['chilli', 'vegetables', 'spice'] },
    { name: 'Cucumber', brand: 'Farm Fresh', category: 'vegetables', unit: 'pcs', unitSize: '2 pcs', basePrice: 22, mrp: 28, tags: ['cucumber', 'vegetables', 'fresh', 'salad'] },
    { name: 'Lemon', brand: 'Farm Fresh', category: 'vegetables', unit: 'pcs', unitSize: '4 pcs', basePrice: 20, mrp: 25, tags: ['lemon', 'vegetables', 'citrus'] },
    { name: 'Bitter Gourd (Karela)', brand: 'Safal', category: 'vegetables', unit: 'gm', unitSize: '500g', basePrice: 35, mrp: 42, tags: ['karela', 'bitter gourd', 'vegetables'] },
    { name: 'Bottle Gourd (Lauki)', brand: 'Safal', category: 'vegetables', unit: 'pcs', unitSize: '1 pc (~700g)', basePrice: 28, mrp: 35, tags: ['lauki', 'bottle gourd', 'vegetables'] },
    { name: 'Lady Finger (Bhindi)', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '500g', basePrice: 32, mrp: 40, tags: ['bhindi', 'okra', 'vegetables'] },
    { name: 'Peas (Frozen)', brand: 'Safal', category: 'vegetables', unit: 'gm', unitSize: '500g', basePrice: 55, mrp: 60, tags: ['peas', 'frozen', 'vegetables'] },
    { name: 'Methi Leaves', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '100g', basePrice: 12, mrp: 15, tags: ['methi', 'vegetables', 'leafy'] },
    { name: 'Coriander Leaves', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '50g', basePrice: 10, mrp: 12, tags: ['coriander', 'dhaniya', 'vegetables', 'fresh'] },
    { name: 'Mushroom (Button)', brand: 'Farm Fresh', category: 'vegetables', unit: 'gm', unitSize: '200g', basePrice: 55, mrp: 62, tags: ['mushroom', 'vegetables', 'fresh'] },

    // FRUITS
    { name: 'Banana (Robusta)', brand: 'Safal', category: 'fruits', unit: 'pcs', unitSize: '6 pcs', basePrice: 40, mrp: 48, tags: ['banana', 'fruits', 'fresh'] },
    { name: 'Apple (Shimla)', brand: 'Farm Fresh', category: 'fruits', unit: 'kg', unitSize: '1kg (4-5 pcs)', basePrice: 160, mrp: 180, tags: ['apple', 'shimla', 'fruits', 'fresh'] },
    { name: 'Orange (Nagpur)', brand: 'Safal', category: 'fruits', unit: 'kg', unitSize: '1kg (6-8 pcs)', basePrice: 85, mrp: 100, tags: ['orange', 'nagpur', 'citrus', 'fruits'] },
    { name: 'Grapes (Green)', brand: 'Farm Fresh', category: 'fruits', unit: 'gm', unitSize: '500g', basePrice: 75, mrp: 90, tags: ['grapes', 'green', 'fruits'] },
    { name: 'Grapes (Black)', brand: 'Farm Fresh', category: 'fruits', unit: 'gm', unitSize: '500g', basePrice: 80, mrp: 95, tags: ['grapes', 'black', 'fruits'] },
    { name: 'Mango (Alphonso)', brand: 'Safal', category: 'fruits', unit: 'kg', unitSize: '500g', basePrice: 180, mrp: 200, tags: ['mango', 'alphonso', 'fruits'] },
    { name: 'Papaya', brand: 'Farm Fresh', category: 'fruits', unit: 'kg', unitSize: '1 pc (~700g)', basePrice: 55, mrp: 65, tags: ['papaya', 'fruits'] },
    { name: 'Pomegranate', brand: 'Farm Fresh', category: 'fruits', unit: 'pcs', unitSize: '1 pc', basePrice: 80, mrp: 95, tags: ['pomegranate', 'anar', 'fruits'] },
    { name: 'Watermelon', brand: 'Safal', category: 'fruits', unit: 'kg', unitSize: '1 pc (~2kg)', basePrice: 80, mrp: 100, tags: ['watermelon', 'fruits', 'summer'] },
    { name: 'Pineapple', brand: 'Farm Fresh', category: 'fruits', unit: 'pcs', unitSize: '1 pc', basePrice: 65, mrp: 80, tags: ['pineapple', 'fruits'] },
    { name: 'Strawberry', brand: 'Farm Fresh', category: 'fruits', unit: 'gm', unitSize: '250g', basePrice: 95, mrp: 110, tags: ['strawberry', 'berries', 'fruits'] },
    { name: 'Kiwi', brand: 'Del Monte', category: 'fruits', unit: 'pcs', unitSize: '3 pcs', basePrice: 95, mrp: 110, tags: ['kiwi', 'fruits', 'exotic'] },
    { name: 'Guava', brand: 'Farm Fresh', category: 'fruits', unit: 'gm', unitSize: '500g', basePrice: 45, mrp: 55, tags: ['guava', 'amrood', 'fruits'] },
    { name: 'Chikoo (Sapota)', brand: 'Farm Fresh', category: 'fruits', unit: 'gm', unitSize: '500g', basePrice: 60, mrp: 70, tags: ['chikoo', 'sapota', 'fruits'] },
    { name: 'Coconut', brand: 'Farm Fresh', category: 'fruits', unit: 'pcs', unitSize: '1 pc', basePrice: 45, mrp: 55, tags: ['coconut', 'fruits'] },

    // BREAD & BAKERY
    { name: 'Britannia 100% Whole Wheat Bread', brand: 'Britannia', category: 'bread-bakery', unit: 'gm', unitSize: '400g', basePrice: 48, mrp: 52, tags: ['bread', 'wheat', 'britannia', 'bakery'] },
    { name: 'Britannia White Bread', brand: 'Britannia', category: 'bread-bakery', unit: 'gm', unitSize: '400g', basePrice: 40, mrp: 44, tags: ['bread', 'white', 'britannia', 'bakery'] },
    { name: 'Harvest Gold Sandwich Bread', brand: 'ITC', category: 'bread-bakery', unit: 'gm', unitSize: '450g', basePrice: 45, mrp: 50, tags: ['bread', 'sandwich', 'itc', 'bakery'] },
    { name: 'Britannia Multigrain Bread', brand: 'Britannia', category: 'bread-bakery', unit: 'gm', unitSize: '400g', basePrice: 55, mrp: 60, tags: ['bread', 'multigrain', 'britannia', 'bakery'] },
    { name: 'English Oven Brown Bread', brand: 'ITC', category: 'bread-bakery', unit: 'gm', unitSize: '400g', basePrice: 50, mrp: 55, tags: ['bread', 'brown', 'bakery'] },
    { name: 'Britannia Good Day Cashew Cookies', brand: 'Britannia', category: 'bread-bakery', unit: 'gm', unitSize: '150g', basePrice: 40, mrp: 45, tags: ['cookies', 'cashew', 'good day', 'bakery'] },
    { name: 'Parle-G Biscuits', brand: 'Parle', category: 'bread-bakery', unit: 'gm', unitSize: '400g', basePrice: 30, mrp: 35, tags: ['biscuits', 'parle-g', 'glucose'] },
    { name: 'Britannia Marie Gold', brand: 'Britannia', category: 'bread-bakery', unit: 'gm', unitSize: '250g', basePrice: 30, mrp: 35, tags: ['biscuits', 'marie', 'tea biscuits'] },
    { name: 'Pav Buns', brand: 'Britannia', category: 'bread-bakery', unit: 'pcs', unitSize: '6 pcs', basePrice: 38, mrp: 42, tags: ['pav', 'buns', 'bakery'] },

    // OILS & GHEE
    { name: 'Saffola Gold Refined Oil', brand: 'Saffola', category: 'oils-ghee', unit: 'litre', unitSize: '1L', basePrice: 175, mrp: 195, tags: ['oil', 'refined', 'saffola', 'heart'] },
    { name: 'Saffola Gold Refined Oil', brand: 'Saffola', category: 'oils-ghee', unit: 'litre', unitSize: '5L', basePrice: 820, mrp: 900, tags: ['oil', 'refined', 'saffola', 'bulk'] },
    { name: 'Fortune Sunflower Oil', brand: 'Fortune', category: 'oils-ghee', unit: 'litre', unitSize: '1L', basePrice: 145, mrp: 165, tags: ['oil', 'sunflower', 'fortune'] },
    { name: 'Fortune Refined Soyabean Oil', brand: 'Fortune', category: 'oils-ghee', unit: 'litre', unitSize: '1L', basePrice: 128, mrp: 145, tags: ['oil', 'soyabean', 'fortune'] },
    { name: 'Dhara Mustard Oil', brand: 'Dhara', category: 'oils-ghee', unit: 'litre', unitSize: '1L', basePrice: 165, mrp: 185, tags: ['oil', 'mustard', 'sarso', 'dhara'] },
    { name: 'Amul Pure Ghee', brand: 'Amul', category: 'oils-ghee', unit: 'ml', unitSize: '500ml', basePrice: 295, mrp: 320, tags: ['ghee', 'amul', 'pure'] },
    { name: 'Amul Pure Ghee', brand: 'Amul', category: 'oils-ghee', unit: 'litre', unitSize: '1L', basePrice: 570, mrp: 620, tags: ['ghee', 'amul', 'pure', 'bulk'] },
    { name: 'Patanjali Cow Ghee', brand: 'Patanjali', category: 'oils-ghee', unit: 'ml', unitSize: '500ml', basePrice: 265, mrp: 295, tags: ['ghee', 'patanjali', 'cow', 'organic'] },
    { name: 'KLF Nirmal Coconut Oil', brand: 'Patanjali', category: 'oils-ghee', unit: 'ml', unitSize: '500ml', basePrice: 155, mrp: 175, tags: ['oil', 'coconut', 'kerala'] },
    { name: 'Olive Oil (Extra Virgin)', brand: 'Del Monte', category: 'oils-ghee', unit: 'ml', unitSize: '500ml', basePrice: 420, mrp: 480, tags: ['oil', 'olive', 'extra virgin', 'healthy'] },

    // SNACKS
    { name: 'Lay\'s Classic Salted', brand: 'Lay\'s', category: 'snacks', unit: 'gm', unitSize: '48g', basePrice: 25, mrp: 28, tags: ['chips', 'lays', 'snacks', 'salted'] },
    { name: 'Lay\'s Magic Masala', brand: 'Lay\'s', category: 'snacks', unit: 'gm', unitSize: '48g', basePrice: 25, mrp: 28, tags: ['chips', 'lays', 'snacks', 'masala'] },
    { name: 'Kurkure Masala Munch', brand: 'Kurkure', category: 'snacks', unit: 'gm', unitSize: '90g', basePrice: 35, mrp: 40, tags: ['kurkure', 'snacks', 'masala', 'puffed'] },
    { name: 'Haldiram\'s Aloo Bhujia', brand: 'Haldiram\'s', category: 'snacks', unit: 'gm', unitSize: '200g', basePrice: 65, mrp: 75, tags: ['bhujia', 'haldirams', 'namkeen', 'snacks'] },
    { name: 'Haldiram\'s Moong Dal', brand: 'Haldiram\'s', category: 'snacks', unit: 'gm', unitSize: '200g', basePrice: 70, mrp: 80, tags: ['moong dal', 'haldirams', 'namkeen', 'snacks'] },
    { name: 'Haldiram\'s Mixture', brand: 'Haldiram\'s', category: 'snacks', unit: 'gm', unitSize: '500g', basePrice: 160, mrp: 185, tags: ['mixture', 'haldirams', 'namkeen', 'snacks', 'bulk'] },
    { name: 'Oreo Original Cookies', brand: 'Oreo', category: 'snacks', unit: 'gm', unitSize: '120g', basePrice: 55, mrp: 62, tags: ['oreo', 'cookies', 'chocolate', 'snacks'] },
    { name: 'Dark Fantasy Choco Fills', brand: 'Dark Fantasy', category: 'snacks', unit: 'gm', unitSize: '75g', basePrice: 35, mrp: 40, tags: ['dark fantasy', 'chocolate', 'cookies', 'snacks'] },
    { name: 'Kit Kat Chocolate Bar', brand: 'Kit Kat', category: 'snacks', unit: 'gm', unitSize: '38g', basePrice: 30, mrp: 35, tags: ['kitkat', 'chocolate', 'bar', 'snacks'] },
    { name: 'Dairy Milk Silk', brand: 'Dairy Milk', category: 'snacks', unit: 'gm', unitSize: '60g', basePrice: 85, mrp: 92, tags: ['dairy milk', 'chocolate', 'silk', 'snacks'] },
    { name: 'Dairy Milk Chocolate', brand: 'Dairy Milk', category: 'snacks', unit: 'gm', unitSize: '38g', basePrice: 40, mrp: 45, tags: ['dairy milk', 'chocolate', 'snacks'] },
    { name: '5 Star Chocolate', brand: '5 Star', category: 'snacks', unit: 'gm', unitSize: '40g', basePrice: 20, mrp: 22, tags: ['5 star', 'chocolate', 'caramel', 'snacks'] },
    { name: 'Parle Hide & Seek', brand: 'Hide & Seek', category: 'snacks', unit: 'gm', unitSize: '100g', basePrice: 40, mrp: 45, tags: ['hide seek', 'chocolate', 'cookies', 'snacks'] },
    { name: 'Maggi 2-Minute Noodles', brand: 'Maggi', category: 'snacks', unit: 'gm', unitSize: '420g (6 packs)', basePrice: 80, mrp: 90, tags: ['maggi', 'noodles', 'instant', 'snacks'] },
    { name: 'Knorr Soupy Noodles', brand: 'Knorr', category: 'snacks', unit: 'gm', unitSize: '66g', basePrice: 28, mrp: 32, tags: ['knorr', 'noodles', 'soup', 'snacks'] },
    { name: 'Pringles Original', brand: 'ITC', category: 'snacks', unit: 'gm', unitSize: '107g', basePrice: 145, mrp: 165, tags: ['pringles', 'chips', 'snacks', 'premium'] },
    { name: 'Act II Popcorn Classic Salted', brand: 'ITC', category: 'snacks', unit: 'gm', unitSize: '70g', basePrice: 35, mrp: 40, tags: ['popcorn', 'act ii', 'snacks', 'microwave'] },
    { name: 'Too Yumm Veggie Sticks', brand: 'ITC', category: 'snacks', unit: 'gm', unitSize: '55g', basePrice: 35, mrp: 40, tags: ['too yumm', 'chips', 'healthy', 'snacks'] },

    // BEVERAGES
    { name: 'Tata Tea Premium', brand: 'Tata', category: 'beverages', unit: 'gm', unitSize: '250g', basePrice: 112, mrp: 128, tags: ['tea', 'tata', 'chai', 'beverages'] },
    { name: 'Tata Tea Gold', brand: 'Tata', category: 'beverages', unit: 'gm', unitSize: '250g', basePrice: 155, mrp: 175, tags: ['tea', 'tata', 'gold', 'beverages'] },
    { name: 'Brooke Bond Red Label', brand: 'Brooke Bond', category: 'beverages', unit: 'gm', unitSize: '250g', basePrice: 120, mrp: 138, tags: ['tea', 'red label', 'brooke bond', 'beverages'] },
    { name: 'Lipton Green Tea', brand: 'Lipton', category: 'beverages', unit: 'pcs', unitSize: '25 tea bags', basePrice: 125, mrp: 145, tags: ['green tea', 'lipton', 'herbal', 'beverages'] },
    { name: 'Nescafe Classic Instant Coffee', brand: 'Nescafe', category: 'beverages', unit: 'gm', unitSize: '100g', basePrice: 235, mrp: 260, tags: ['coffee', 'nescafe', 'instant', 'beverages'] },
    { name: 'Bru Instant Coffee', brand: 'Bru', category: 'beverages', unit: 'gm', unitSize: '100g', basePrice: 200, mrp: 225, tags: ['coffee', 'bru', 'instant', 'beverages'] },
    { name: 'Real Fruit Juice (Mixed Fruit)', brand: 'Real', category: 'beverages', unit: 'ml', unitSize: '1L', basePrice: 115, mrp: 130, tags: ['juice', 'real', 'fruit', 'beverages'] },
    { name: 'Tropicana Orange Juice', brand: 'Tropicana', category: 'beverages', unit: 'ml', unitSize: '1L', basePrice: 120, mrp: 135, tags: ['juice', 'tropicana', 'orange', 'beverages'] },
    { name: 'Paper Boat Aam Panna', brand: 'Paper Boat', category: 'beverages', unit: 'ml', unitSize: '200ml', basePrice: 25, mrp: 28, tags: ['aam panna', 'paper boat', 'traditional', 'beverages'] },
    { name: 'Paper Boat Jaljeera', brand: 'Paper Boat', category: 'beverages', unit: 'ml', unitSize: '200ml', basePrice: 22, mrp: 25, tags: ['jaljeera', 'paper boat', 'traditional', 'beverages'] },
    { name: 'B Natural Apple Juice', brand: 'B Natural', category: 'beverages', unit: 'ml', unitSize: '1L', basePrice: 95, mrp: 110, tags: ['juice', 'apple', 'natural', 'beverages'] },
    { name: 'Minute Maid Pulpy Orange', brand: 'Minute Maid', category: 'beverages', unit: 'ml', unitSize: '1L', basePrice: 105, mrp: 120, tags: ['juice', 'orange', 'minute maid', 'beverages'] },
    { name: 'Horlicks Health Drink', brand: 'HUL', category: 'beverages', unit: 'gm', unitSize: '500g', basePrice: 290, mrp: 320, tags: ['horlicks', 'health drink', 'malt', 'beverages'] },
    { name: 'Bournvita Chocolate Drink', brand: 'Nestle', category: 'beverages', unit: 'gm', unitSize: '500g', basePrice: 265, mrp: 295, tags: ['bournvita', 'chocolate', 'malt', 'beverages'] },
    { name: 'Complan Chocolate', brand: 'HUL', category: 'beverages', unit: 'gm', unitSize: '500g', basePrice: 310, mrp: 345, tags: ['complan', 'health drink', 'chocolate', 'beverages'] },

    // PERSONAL CARE
    { name: 'Dove Moisturising Beauty Bar', brand: 'Dove', category: 'personal-care', unit: 'gm', unitSize: '100g', basePrice: 48, mrp: 55, tags: ['soap', 'dove', 'moisturising', 'personal care'] },
    { name: 'Dove Moisturising Beauty Bar Pack', brand: 'Dove', category: 'personal-care', unit: 'pcs', unitSize: '3 x 100g', basePrice: 135, mrp: 155, tags: ['soap', 'dove', 'pack', 'personal care'] },
    { name: 'Lifebuoy Total 10 Germ Protection', brand: 'Lifebuoy', category: 'personal-care', unit: 'gm', unitSize: '125g', basePrice: 40, mrp: 45, tags: ['soap', 'lifebuoy', 'germ protection', 'personal care'] },
    { name: 'Pears Pure & Gentle Soap', brand: 'Pears', category: 'personal-care', unit: 'gm', unitSize: '125g', basePrice: 52, mrp: 58, tags: ['soap', 'pears', 'gentle', 'personal care'] },
    { name: 'Himalaya Neem Face Wash', brand: 'Himalaya', category: 'personal-care', unit: 'ml', unitSize: '100ml', basePrice: 90, mrp: 100, tags: ['face wash', 'himalaya', 'neem', 'personal care'] },
    { name: 'Pantene Smooth & Silky Shampoo', brand: 'Pantene', category: 'personal-care', unit: 'ml', unitSize: '340ml', basePrice: 265, mrp: 295, tags: ['shampoo', 'pantene', 'smooth', 'personal care'] },
    { name: 'Head & Shoulders Anti-Dandruff Shampoo', brand: 'Head & Shoulders', category: 'personal-care', unit: 'ml', unitSize: '340ml', basePrice: 270, mrp: 300, tags: ['shampoo', 'head shoulders', 'dandruff', 'personal care'] },
    { name: 'Clinic Plus Shampoo', brand: 'Clinic Plus', category: 'personal-care', unit: 'ml', unitSize: '340ml', basePrice: 210, mrp: 235, tags: ['shampoo', 'clinic plus', 'personal care'] },
    { name: 'Sunsilk Black Shine Shampoo', brand: 'Sunsilk', category: 'personal-care', unit: 'ml', unitSize: '340ml', basePrice: 225, mrp: 250, tags: ['shampoo', 'sunsilk', 'black', 'personal care'] },
    { name: 'Colgate MaxFresh Toothpaste', brand: 'Colgate', category: 'personal-care', unit: 'gm', unitSize: '150g', basePrice: 92, mrp: 102, tags: ['toothpaste', 'colgate', 'fresh', 'personal care'] },
    { name: 'Colgate Strong Teeth Toothpaste', brand: 'Colgate', category: 'personal-care', unit: 'gm', unitSize: '200g', basePrice: 115, mrp: 128, tags: ['toothpaste', 'colgate', 'teeth', 'personal care'] },
    { name: 'Sensodyne Toothpaste', brand: 'Sensodyne', category: 'personal-care', unit: 'gm', unitSize: '70g', basePrice: 155, mrp: 175, tags: ['toothpaste', 'sensodyne', 'sensitive', 'personal care'] },
    { name: 'Oral-B Toothbrush (Soft)', brand: 'Oral-B', category: 'personal-care', unit: 'pcs', unitSize: '2 pcs', basePrice: 85, mrp: 95, tags: ['toothbrush', 'oral-b', 'personal care'] },
    { name: 'Dettol Liquid Handwash', brand: 'Dettol', category: 'personal-care', unit: 'ml', unitSize: '750ml', basePrice: 145, mrp: 165, tags: ['handwash', 'dettol', 'antiseptic', 'personal care'] },
    { name: 'Dove Body Lotion', brand: 'Dove', category: 'personal-care', unit: 'ml', unitSize: '400ml', basePrice: 295, mrp: 330, tags: ['body lotion', 'dove', 'moisturiser', 'personal care'] },

    // CLEANING
    { name: 'Surf Excel Quick Wash Detergent Powder', brand: 'Surf Excel', category: 'cleaning', unit: 'kg', unitSize: '1kg', basePrice: 195, mrp: 220, tags: ['detergent', 'surf excel', 'washing', 'cleaning'] },
    { name: 'Surf Excel Matic Front Load', brand: 'Surf Excel', category: 'cleaning', unit: 'kg', unitSize: '2kg', basePrice: 380, mrp: 430, tags: ['detergent', 'surf excel', 'matic', 'cleaning'] },
    { name: 'Ariel Matic Liquid Detergent', brand: 'Ariel', category: 'cleaning', unit: 'ml', unitSize: '1L', basePrice: 335, mrp: 375, tags: ['detergent', 'ariel', 'liquid', 'cleaning'] },
    { name: 'Vim Dishwash Liquid', brand: 'Vim', category: 'cleaning', unit: 'ml', unitSize: '750ml', basePrice: 118, mrp: 135, tags: ['dishwash', 'vim', 'liquid', 'cleaning'] },
    { name: 'Vim Dishwash Gel', brand: 'Vim', category: 'cleaning', unit: 'ml', unitSize: '400ml', basePrice: 75, mrp: 88, tags: ['dishwash', 'vim', 'gel', 'cleaning'] },
    { name: 'Harpic Power Plus Toilet Cleaner', brand: 'Harpic', category: 'cleaning', unit: 'ml', unitSize: '500ml', basePrice: 115, mrp: 130, tags: ['toilet cleaner', 'harpic', 'cleaning'] },
    { name: 'Lizol Floor Cleaner (Citrus)', brand: 'Lizol', category: 'cleaning', unit: 'ml', unitSize: '500ml', basePrice: 95, mrp: 108, tags: ['floor cleaner', 'lizol', 'cleaning', 'home'] },
    { name: 'Colin Glass Cleaner', brand: 'Godrej', category: 'cleaning', unit: 'ml', unitSize: '500ml', basePrice: 88, mrp: 98, tags: ['glass cleaner', 'colin', 'cleaning'] },
    { name: 'Dettol Floor Cleaner', brand: 'Dettol', category: 'cleaning', unit: 'ml', unitSize: '500ml', basePrice: 105, mrp: 120, tags: ['floor cleaner', 'dettol', 'antiseptic', 'cleaning'] },
    { name: 'Scotch Brite Scrub Pad', brand: 'ITC', category: 'cleaning', unit: 'pcs', unitSize: '5 pcs', basePrice: 62, mrp: 70, tags: ['scrub', 'scotch brite', 'cleaning', 'kitchen'] },
    { name: 'Garbage Bags (Medium)', brand: 'Godrej', category: 'cleaning', unit: 'pcs', unitSize: '30 pcs', basePrice: 75, mrp: 88, tags: ['garbage bags', 'waste', 'cleaning', 'home'] },
    { name: 'Toilet Paper (12 Rolls)', brand: 'Godrej', category: 'cleaning', unit: 'rolls', unitSize: '12 rolls', basePrice: 285, mrp: 320, tags: ['toilet paper', 'tissue', 'cleaning', 'bathroom'] },

    // SPICES
    { name: 'MDH Garam Masala', brand: 'MDH', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 88, mrp: 98, tags: ['garam masala', 'mdh', 'spices', 'masala'] },
    { name: 'Everest Chaat Masala', brand: 'Everest', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 75, mrp: 85, tags: ['chaat masala', 'everest', 'spices'] },
    { name: 'Badshah Rajwadi Garam Masala', brand: 'Badshah', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 68, mrp: 78, tags: ['garam masala', 'badshah', 'spices'] },
    { name: 'Catch Turmeric Powder', brand: 'Catch', category: 'spices', unit: 'gm', unitSize: '200g', basePrice: 72, mrp: 82, tags: ['turmeric', 'haldi', 'spices'] },
    { name: 'MDH Coriander Powder', brand: 'MDH', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 52, mrp: 60, tags: ['coriander powder', 'dhania', 'mdh', 'spices'] },
    { name: 'Everest Kitchen King Masala', brand: 'Everest', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 88, mrp: 98, tags: ['kitchen king', 'everest', 'spices'] },
    { name: 'MDH Tandoori Masala', brand: 'MDH', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 85, mrp: 95, tags: ['tandoori masala', 'mdh', 'spices'] },
    { name: 'Red Chilli Powder', brand: 'Catch', category: 'spices', unit: 'gm', unitSize: '200g', basePrice: 65, mrp: 75, tags: ['red chilli', 'mirchi powder', 'spices'] },
    { name: 'Cumin Seeds (Jeera)', brand: 'Catch', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 55, mrp: 62, tags: ['jeera', 'cumin', 'spices'] },
    { name: 'Mustard Seeds (Rai)', brand: 'MDH', category: 'spices', unit: 'gm', unitSize: '100g', basePrice: 35, mrp: 40, tags: ['mustard seeds', 'rai', 'spices'] },
    { name: 'Maggi Hot & Sweet Sauce', brand: 'Maggi', category: 'spices', unit: 'gm', unitSize: '400g', basePrice: 88, mrp: 98, tags: ['sauce', 'maggi', 'ketchup', 'condiments'] },
    { name: 'Heinz Tomato Ketchup', brand: 'Heinz', category: 'spices', unit: 'gm', unitSize: '450g', basePrice: 115, mrp: 130, tags: ['ketchup', 'heinz', 'tomato', 'condiments'] },

    // FROZEN
    { name: 'Amul Vanilla Ice Cream', brand: 'Amul', category: 'frozen', unit: 'ml', unitSize: '500ml', basePrice: 130, mrp: 145, tags: ['ice cream', 'amul', 'vanilla', 'frozen'] },
    { name: 'Amul Chocolate Ice Cream', brand: 'Amul', category: 'frozen', unit: 'ml', unitSize: '500ml', basePrice: 140, mrp: 158, tags: ['ice cream', 'amul', 'chocolate', 'frozen'] },
    { name: 'Mother Dairy Kulfi', brand: 'Mother Dairy', category: 'frozen', unit: 'pcs', unitSize: '4 pcs', basePrice: 90, mrp: 100, tags: ['kulfi', 'mother dairy', 'ice cream', 'frozen'] },
    { name: 'Safal Frozen Corn', brand: 'Safal', category: 'frozen', unit: 'gm', unitSize: '500g', basePrice: 75, mrp: 85, tags: ['corn', 'frozen', 'vegetables', 'safal'] },
    { name: 'Kwality Wall\'s Mango Dolly', brand: 'Kwality Wall\'s', category: 'frozen', unit: 'pcs', unitSize: '2 pcs', basePrice: 55, mrp: 62, tags: ['ice cream', 'mango', 'kwality', 'frozen'] },
  ];

  // ─── INSERT PRODUCTS + PLATFORM PRICES ───────────────────────────
  let productCount = 0;
  const slugCounts: Record<string, number> = {};

  for (const def of productDefs) {
    const brandId = brands[def.brand];
    const categoryId = catMap[def.category];
    if (!categoryId) continue;

    // Handle duplicate slugs
    const baseSlug = slug(`${def.name}-${def.unitSize}`);
    slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
    const productSlug = slugCounts[baseSlug] > 1 ? `${baseSlug}-${slugCounts[baseSlug]}` : baseSlug;

    let product;
    try {
      product = await prisma.product.upsert({
        where: { slug: productSlug },
        update: {},
        create: {
          name: def.name,
          slug: productSlug,
          categoryId,
          brandId: brandId || null,
          unit: def.unit,
          unitSize: def.unitSize,
          tags: def.tags.join(','),
          imageUrl: `https://picsum.photos/seed/${productSlug}/400/400`,
        },
      });
    } catch {
      continue;
    }

    // Create platform prices with realistic variation
    for (const platId of platIds) {
      const platformVariance = platId === platforms[0].id ? 0.03 : // Blinkit — slight premium
        platId === platforms[1].id ? -0.02 : // Zepto — slightly cheaper
          platId === platforms[2].id ? 0.01 : // Instamart — near base
            -0.04; // BigBasket — generally cheapest (bulk buying)

      const adjustedBase = def.basePrice * (1 + platformVariance);
      const price = randPrice(adjustedBase, 0.08);
      const mrp = def.mrp;
      const discountPercent = Math.round(((mrp - price) / mrp) * 100);

      await prisma.platformProduct.upsert({
        where: { platformId_productId: { platformId: platId, productId: product.id } },
        update: { price, mrp, discountPercent },
        create: {
          platformId: platId,
          productId: product.id,
          price,
          mrp,
          discountPercent: Math.max(0, discountPercent),
          inStock: Math.random() > 0.05, // 95% in stock
        },
      });

      // Seed 7 days of price history
      for (let day = 7; day >= 0; day--) {
        const histPrice = randPrice(adjustedBase, 0.12);
        const d = new Date();
        d.setDate(d.getDate() - day);

        const pp = await prisma.platformProduct.findUnique({
          where: { platformId_productId: { platformId: platId, productId: product.id } },
        });

        if (pp) {
          await prisma.priceHistory.create({
            data: {
              platformProductId: pp.id,
              price: histPrice,
              recordedAt: d,
            },
          });
        }
      }
    }

    productCount++;
  }

  console.log(`✅ Seeded ${productCount} products across ${platIds.length} platforms`);
  console.log(`✅ Seeded ${categories.length} categories`);
  console.log(`✅ Seeded ${Object.keys(brands).length} brands`);
  console.log(`✅ Seeded ${platforms.length} platforms`);
  console.log('🌱 BasketIQ seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
