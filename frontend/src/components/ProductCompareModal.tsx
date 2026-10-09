import React from 'react';
import { X, ShoppingCart, TrendingDown, Clock } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCompareModalProps {
  product: Product | null;
  onClose: () => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  blinkit: '#F8C02F',
  zepto: '#9B5DE5',
  instamart: '#FC8019',
  bigbasket: '#84BA40',
};

const PLATFORM_DELIVERY: Record<string, string> = {
  blinkit: '8–15 min',
  zepto: '10–20 min',
  instamart: '15–30 min',
  bigbasket: '60–120 min',
};

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({ product, onClose }) => {
  const { addItem, cart } = useCart();
  if (!product) return null;

  const prices = [...(product.platformProducts || [])].sort((a, b) => a.price - b.price);
  const cheapest = prices[0];
  const mostExpensive = prices[prices.length - 1];
  const maxSaving = mostExpensive && cheapest ? mostExpensive.price - cheapest.price : 0;

  const isAdded = cart?.items.some((i) => i.productId === product.id);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-[#1A1A16] rounded-t-3xl sm:rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E8E6DF] dark:border-[#2E2E28]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{product.category?.iconEmoji || '🛒'}</span>
            <div>
              <h2 className="font-sans font-bold text-sm text-[#1A1A1A] dark:text-[#F0EDE6] line-clamp-1">
                {product.name}
              </h2>
              <p className="text-xs text-[#9B9B9B]">{product.brand?.name} • {product.unitSize}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F8F6F0] dark:hover:bg-[#242420] text-[#9B9B9B]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saving Banner */}
        {maxSaving > 2 && (
          <div className="mx-5 mt-4 px-4 py-2.5 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 rounded-xl flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <p className="text-xs text-[#2D6A4F] font-semibold">
              Buy on <span className="font-bold">{cheapest?.platform?.name}</span> to save{' '}
              <span className="font-bold">₹{maxSaving.toFixed(0)}</span> vs most expensive option
            </p>
          </div>
        )}

        {/* Platform Price Rows */}
        <div className="px-5 py-4 space-y-2.5">
          <p className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider mb-3">
            Price Across Platforms
          </p>
          {prices.length === 0 && (
            <p className="text-sm text-[#9B9B9B] text-center py-4">No platform pricing available</p>
          )}
          {prices.map((pp, idx) => {
            const slug = pp.platform?.slug || '';
            const color = PLATFORM_COLORS[slug] || '#888';
            const isCheapest = idx === 0;
            const discount = pp.mrp > pp.price
              ? Math.round(((pp.mrp - pp.price) / pp.mrp) * 100)
              : 0;

            return (
              <div
                key={pp.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isCheapest
                    ? 'border-[#2D6A4F]/40 bg-[#2D6A4F]/6 dark:bg-[#2D6A4F]/12'
                    : 'border-[#E8E6DF] dark:border-[#2E2E28] bg-[#F8F6F0] dark:bg-[#242420]'
                }`}
              >
                {/* Platform info */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {(pp.platform?.name || '?')[0]}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6]">
                        {pp.platform?.name}
                      </span>
                      {isCheapest && (
                        <span className="text-[9px] font-bold text-white bg-[#2D6A4F] px-1.5 py-0.5 rounded-full">
                          CHEAPEST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-[#9B9B9B]" />
                      <span className="text-[10px] text-[#9B9B9B]">
                        {PLATFORM_DELIVERY[slug] || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="flex items-baseline gap-1.5">
                    {pp.mrp > pp.price && (
                      <span className="text-xs text-[#9B9B9B] line-through">₹{pp.mrp}</span>
                    )}
                    <span className={`text-base font-bold ${isCheapest ? 'text-[#2D6A4F] dark:text-[#40916C]' : 'text-[#1A1A1A] dark:text-[#F0EDE6]'}`}>
                      ₹{pp.price.toFixed(0)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <span className="text-[9px] font-semibold text-[#2D6A4F]">{discount}% off</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add to basket CTA */}
        <div className="px-5 pb-5">
          <button
            onClick={() => { addItem(product, 1); onClose(); }}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isAdded
                ? 'bg-[#2D6A4F] text-white'
                : 'bg-[#2D6A4F] hover:bg-[#245A42] text-white shadow-md'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdded ? 'Already in Basket — View Cart' : 'Add to Basket & Compare Full Cart'}
          </button>
          <p className="text-center text-[10px] text-[#9B9B9B] mt-2">
            Add multiple items → Compare all platforms at once
          </p>
        </div>
      </div>
    </div>
  );
};
