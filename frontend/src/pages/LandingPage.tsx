import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { ShoppingBag, Clock, Sparkles, TrendingUp, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Category, Product } from '../types';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/popular'),
        ]);
        setCategories(catRes.data.categories || []);
        setPopularProducts(prodRes.data.products || []);
      } catch (err) {
        console.error('Landing page fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Does BasketIQ deliver groceries?',
      a: 'No. BasketIQ is a Grocery Intelligence Platform. We compare your entire cart across platforms like Blinkit, Zepto, Instamart, and BigBasket so you can checkout at the store offering the best price or fastest delivery.',
    },
    {
      q: 'Which platforms are supported?',
      a: 'We currently support Blinkit, Zepto, Swiggy Instamart, and Tata BigBasket across major cities in India.',
    },
    {
      q: 'How often are prices updated?',
      a: 'Prices and item availability are updated continuously throughout the day so you always get accurate checkout totals.',
    },
    {
      q: 'Is BasketIQ free?',
      a: 'Yes, BasketIQ is 100% free for shoppers. You get full access to cart comparison, itemized breakdowns, and price history analytics.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-12 md:pt-20 text-center max-w-4xl mx-auto px-4">
        {/* Top pill badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 text-[#2D6A4F] dark:text-[#40916C] text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span>Now comparing 4 platforms</span>
        </div>

        {/* Hero Heading */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0EDE6] leading-[1.15]">
          Build your cart once.{' '}
          <span className="text-[#2D6A4F] dark:text-[#40916C] font-normal italic">
            We'll find the smartest checkout.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#6B6B6B] dark:text-[#A0A09A] max-w-2xl mx-auto text-balance">
          BasketIQ compares your complete grocery cart across India's biggest grocery platforms and recommends the cheapest or most convenient checkout.
        </p>

        {/* Search Bar Container */}
        <div className="mt-10 flex justify-center">
          <SearchBar placeholder="Search products like Milk, Rice, Eggs..." />
        </div>
      </section>

      {/* ── 2. POPULAR CATEGORIES ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6] mb-8">
          Popular Categories
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/cart?category=${cat.slug}`)}
              className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 text-center hover:shadow-md hover:border-[#2D6A4F]/40 cursor-pointer transition-all group"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.iconEmoji}
              </div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6]">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            How it works
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
            Three steps to a smarter grocery run.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-8 relative">
            <span className="text-xs font-bold font-mono text-[#2D6A4F] dark:text-[#40916C]">01</span>
            <h3 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6] mt-4 mb-2">
              Build Cart
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Search for groceries and add them to your basket in one place.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-8 relative">
            <span className="text-xs font-bold font-mono text-[#2D6A4F] dark:text-[#40916C]">02</span>
            <h3 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6] mt-4 mb-2">
              Compare
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              BasketIQ checks your full cart across Blinkit, Zepto, Instamart, and BigBasket.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-8 relative">
            <span className="text-xs font-bold font-mono text-[#2D6A4F] dark:text-[#40916C]">03</span>
            <h3 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6] mt-4 mb-2">
              Save
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Pick the platform that saves you the most money or gets groceries to you fastest.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. WHY BASKETIQ ────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Why BasketIQ
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
            Everything in one comparison, nothing extra.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] dark:bg-[#242420] flex items-center justify-center text-[#2D6A4F] mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-2">
              Compare Entire Cart
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Compare your whole shopping basket instead of one product at a time.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] dark:bg-[#242420] flex items-center justify-center text-[#2D6A4F] mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-2">
              Save Time
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Stop switching between multiple grocery apps to check prices.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] dark:bg-[#242420] flex items-center justify-center text-[#D4A853] mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-2">
              Smart Recommendations
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Choose the cheapest checkout or the fastest delivery — your call.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] dark:bg-[#242420] flex items-center justify-center text-[#2D6A4F] mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-2">
              Track Prices
            </h3>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
              Monitor grocery price trends over time across platforms.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. POPULAR PRODUCTS GRID ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
              Trending Groceries
            </h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
              Add essentials directly to your basket.
            </p>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="text-xs font-semibold text-[#2D6A4F] dark:text-[#40916C] flex items-center space-x-1 hover:underline"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* ── 6. FAQ SECTION ─────────────────────────────────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-4">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-center text-[#1A1A1A] dark:text-[#F0EDE6] mb-10">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center font-medium text-sm sm:text-base text-[#1A1A1A] dark:text-[#F0EDE6]"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#6B6B6B]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#6B6B6B]" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed border-t border-[#E8E6DF]/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. READY TO SHOP CTA ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-10 md:p-14 shadow-xs">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Ready to shop smarter?
          </h2>
          <p className="mt-3 text-sm text-[#6B6B6B] dark:text-[#A0A09A]">
            Join early access — free, no credit card needed.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/cart')}
              className="bg-[#2D6A4F] hover:bg-[#245A42] text-white font-medium text-sm px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Start Comparing Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
