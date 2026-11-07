import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check, Eye } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ProductCompareModal } from './ProductCompareModal';

interface SearchBarProps {
  placeholder?: string;
  onSelectProduct?: (product: Product) => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products like Milk, Rice, Eggs, Chocolates...',
  onSelectProduct,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const { addItem, cart } = useCart();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=8`);
        setSuggestions(res.data.products || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      addItem(product, 1);
    }
  };

  const handleStartComparing = () => {
    if (query.trim()) {
      navigate(`/cart?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/cart');
    }
    setIsOpen(false);
  };

  const cartProductIds = new Set(cart?.items.map((i) => i.productId));

  return (
    <>
      <div ref={wrapperRef} className="relative w-full max-w-2xl">
        <div className="relative flex items-center bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/20 rounded-full shadow-sm p-1.5 transition-all">
          <div className="pl-4 text-[#9B9B9B]">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStartComparing();
            }}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full px-3 py-2 bg-transparent text-sm md:text-base text-[#1A1A1A] dark:text-[#F0EDE6] placeholder-[#9B9B9B] focus:outline-none font-sans"
          />
          <button
            onClick={handleStartComparing}
            className="bg-[#2D6A4F] hover:bg-[#245A42] text-white font-medium text-sm px-5 py-2.5 rounded-full transition-all shrink-0 shadow-xs"
          >
            Search Catalog
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1E1A] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] shadow-xl z-50 overflow-hidden animate-scale-in max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-[#9B9B9B]">Searching products...</div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#9B9B9B]">No matching products found</div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-1.5 text-[11px] font-semibold text-[#9B9B9B] uppercase tracking-wider flex justify-between items-center">
                  <span>Matching Products ({suggestions.length})</span>
                  <span className="text-[10px] text-[#2D6A4F] normal-case cursor-pointer" onClick={handleStartComparing}>
                    Press Enter to view all results →
                  </span>
                </div>
                {suggestions.map((product) => {
                  const isAdded = cartProductIds.has(product.id);
                  const minPrice = product.platformProducts?.[0]?.price;

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F8F6F0] dark:hover:bg-[#242420] transition-colors group"
                    >
                      <div 
                        onClick={() => setInspectProduct(product)}
                        className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1 pr-2"
                      >
                        <span className="text-xl shrink-0">{product.category?.iconEmoji || '🛒'}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE6] truncate group-hover:text-[#2D6A4F] transition-colors">
                            {product.name}
                          </div>
                          <div className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
                            {product.brand?.name || product.category?.name} • {product.unitSize}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {minPrice && (
                          <span className="text-xs font-semibold text-[#2D6A4F] dark:text-[#40916C] mr-1">
                            from ₹{minPrice.toFixed(0)}
                          </span>
                        )}

                        <button
                          onClick={() => setInspectProduct(product)}
                          title="Inspect store prices for this item"
                          className="p-1.5 rounded-lg border text-xs bg-white dark:bg-[#1A1A16] border-[#E8E6DF] dark:border-[#3E3E38] hover:border-[#2D6A4F] text-[#6B6B6B] hover:text-[#2D6A4F] transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Inspect</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(product);
                          }}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                            isAdded
                              ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                              : 'bg-[#2D6A4F] hover:bg-[#245A42] text-white border-[#2D6A4F]'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>In Basket</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual item inspection modal */}
      {inspectProduct && (
        <ProductCompareModal
          product={inspectProduct}
          onClose={() => setInspectProduct(null)}
        />
      )}
    </>
  );
};
