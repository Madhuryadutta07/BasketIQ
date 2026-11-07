import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Sparkles } from 'lucide-react';
import { api, formatCurrency } from '../lib/api';
import type { Category, Product } from '../types';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, updateItem, removeItem, clearCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/products?limit=24';
        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`;
        }
        if (searchQuery) {
          url = `/products/search?q=${encodeURIComponent(searchQuery)}&limit=24`;
          if (selectedCategory !== 'all') url += `&category=${selectedCategory}`;
        }
        const res = await api.get(url);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug === 'all') params.delete('category');
    else params.set('category', slug);
    navigate(`/cart?${params.toString()}`);
  };

  const handleCompare = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Add items to your basket before comparing');
      return;
    }

    try {
      setComparing(true);
      const res = await api.post('/compare');
      const comparisonId = res.data.comparison.id;
      toast.success('Basket comparison complete!');
      navigate(`/compare/${comparisonId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to compare cart');
    } finally {
      setComparing(false);
    }
  };

  const items = cart?.items || [];
  const estimatedLowestTotal = items.reduce((sum, item) => {
    const minPrice = item.product.platformProducts?.[0]?.price || 0;
    return sum + minPrice * item.quantity;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Build Your Basket
          </h1>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
            Search products or browse categories to assemble your grocery list.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-96">
          <SearchBar placeholder="Search & add groceries..." />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Products Catalogue (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#2D6A4F] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1E1E1A] text-[#6B6B6B] dark:text-[#A0A09A] border border-[#E8E6DF] dark:border-[#2E2E28] hover:border-[#2D6A4F]'
              }`}
            >
              🛒 All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  selectedCategory === cat.slug
                    ? 'bg-[#2D6A4F] text-white shadow-xs'
                    : 'bg-white dark:bg-[#1E1E1A] text-[#6B6B6B] dark:text-[#A0A09A] border border-[#E8E6DF] dark:border-[#2E2E28] hover:border-[#2D6A4F]'
                }`}
              >
                <span>{cat.iconEmoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-12 text-center text-[#9B9B9B]">
              <p className="font-semibold text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-1">
                No products found
              </p>
              <p className="text-xs">Try selecting a different category or clearing search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Right Basket Summary Panel (1 Col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E6DF] dark:border-[#2E2E28] pb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#2D6A4F]" />
                <h2 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6]">
                  Current Basket ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {items.length === 0 ? (
              <div className="py-12 text-center text-[#9B9B9B]">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#2D6A4F]" />
                <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
                  Your basket is empty
                </p>
                <p className="text-xs mt-1">Add items from the catalogue to compare pricing</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {items.map((item) => {
                  const minPrice = item.product.platformProducts?.[0]?.price || 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-[#F8F6F0] dark:bg-[#242420] rounded-xl border border-[#E8E6DF] dark:border-[#2E2E28]"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-xl shrink-0">
                          {item.product.category?.iconEmoji || '🛒'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-[#6B6B6B] dark:text-[#A0A09A]">
                            {item.product.unitSize} • ₹{minPrice}/ea
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="flex items-center space-x-1 bg-white dark:bg-[#1A1A16] border border-[#E8E6DF] dark:border-[#3E3E38] rounded-md px-1">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="p-1 text-[#6B6B6B]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="p-1 text-[#6B6B6B]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estimated Total & Compare CTA */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-[#E8E6DF] dark:border-[#2E2E28] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#6B6B6B] dark:text-[#A0A09A]">Est. Best Total</span>
                  <span className="font-serif font-bold text-xl text-[#2D6A4F] dark:text-[#40916C]">
                    {formatCurrency(estimatedLowestTotal)}
                  </span>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={comparing}
                  className="w-full py-3.5 px-4 bg-[#2D6A4F] hover:bg-[#245A42] text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{comparing ? 'Comparing Stores...' : 'Compare Cart Across Stores'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
