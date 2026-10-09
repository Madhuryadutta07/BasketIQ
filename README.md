# 🛒 BasketIQ — Grocery Intelligence Platform

BasketIQ is a production-quality full-stack **Grocery Intelligence Platform** that compares grocery baskets across major quick-commerce platforms in India (**Blinkit**, **Zepto**, **Swiggy Instamart**, and **Tata BigBasket**).

Users build a single basket once, and BasketIQ instantly evaluates item availability, delivery fees, taxes, and price variations to present the **Cheapest**, **Fastest**, and **Best Value** checkout options.

---

## 🌟 Key Features

1. **Editorial UI/UX Design**: Pixel-perfect realization of editorial product design using Cream, Warm White, Muted Green, and Soft Ochre palettes with Newsreader & Inter typography.
2. **Basket Comparison Engine**: Multi-platform aggregation algorithm calculating line-item totals, delivery fee thresholds, taxes (GST), and net savings.
3. **Itemized Store Breakdown**: Deep-dive table detailing per-item prices, discounts, MRPs, and stock status across platforms.
4. **Live Search & Autocomplete**: Debounced product search with instant category filters across 300+ seeded grocery items.
5. **Analytics Dashboard**: Price trend line charts (Recharts), platform win frequency, and total lifetime savings tracking.
6. **Command Palette (`⌘K`)**: Fast keyboard navigation and instant product search.
7. **JWT Authentication & Cart Persistence**: User registration, login, session carts, and saved lists.
8. **Dark Mode Support**: Full custom theme toggle with dark palette.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, TanStack Query, Framer Motion, Recharts, Lucide Icons, cmdk
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT, bcryptjs, Zod
- **DevOps**: Docker Compose

---

## 🚀 Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up -d
```

### 2. Setup Backend & Seed Database
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```
*Backend runs on `http://localhost:3001`*

### 3. Setup & Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 📊 Database Architecture

Normalized PostgreSQL schema managed via Prisma (13 Tables):
`users`, `products`, `categories`, `brands`, `platforms`, `platform_products`, `price_history`, `carts`, `cart_items`, `comparisons`, `comparison_results`, `saved_lists`, `search_history`, `analytics_events`.
