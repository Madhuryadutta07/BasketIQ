import React, { useState } from 'react';
import { Plus, Check, TrendingDown, Eye } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductCompareModal } from './ProductCompareModal';

interface ProductCardProps {
  product: Product;
}

const PLATFORM_COLORS: Record<string, string> = {
  blinkit: '#F8C02F',
  zepto: '#9B5DE5',
  instamart: '#FC8019',
  bigbasket: '#84BA40',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, cart } = useCart();
  const [showCompareModal, setShowCompareModal] = useState(false);
  const isAdded = cart?.items.some((i) => i.productId === product.id);

  const prices = product.platformProducts || [];
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const minPrice = sortedPrices[0]?.price ?? 0;
  const maxPrice = sortedPrices[sortedPrices.length - 1]?.price ?? 0;
  const priceDiff = maxPrice - minPrice;

  return (
    <>
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-[#2D6A4F]/40 transition-all group">
        <div>
          {/* Category Icon & Savings Tag */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl p-2 bg-[#F8F6F0] dark:bg-[#242420] rounded-xl group-hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowCompareModal(true)}>
              {product.category?.iconEmoji || '🛒'}
            </span>
            {priceDiff > 5 && (
              <span 
                onClick={() => setShowCompareModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 px-2 py-0.5 rounded-full cursor-pointer hover:bg-[#2D6A4F]/20"
              >
                <TrendingDown className="w-3 h-3" />
                Save up to ₹{Math.round(priceDiff)}
              </span>
            )}
          </div>

          {/* Brand & Title */}
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] font-medium">
            {product.brand?.name || product.category?.name}
          </p>
          <h3 
            onClick={() => setShowCompareModal(true)}
            className="font-sans font-semibold text-base text-[#1A1A1A] dark:text-[#F0EDE6] line-clamp-2 mt-0.5 cursor-pointer hover:text-[#2D6A4F] transition-colors"
          >
            {product.name}
          </h3>
          <p className="text-xs text-[#9B9B9B] mt-1">{product.unitSize}</p>
        </div>

        {/* All Platform Prices */}
        <div className="mt-4 pt-3 border-t border-[#E8E6DF] dark:border-[#2E2E28]">
          {sortedPrices.length > 0 ? (
            <div 
              onClick={() => setShowCompareModal(true)}
              className="space-y-1.5 mb-3 cursor-pointer group/prices"
              title="Click to view detailed store breakdown for this item"
            >
              {sortedPrices.map((pp, idx) => {
                const slug = pp.platform?.slug || '';
                const color = PLATFORM_COLORS[slug] || '#888';
                const isCheapest = idx === 0;
                return (
                  <div
                    key={pp.id || slug}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                      isCheapest
                        ? 'bg-[#2D6A4F]/8 dark:bg-[#2D6A4F]/15 border border-[#2D6A4F]/20 group-hover/prices:bg-[#2D6A4F]/15'
                        : 'bg-[#F8F6F0] dark:bg-[#242420] group-hover/prices:bg-[#EFECE6] dark:group-hover/prices:bg-[#2C2C28]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
                        {pp.platform?.name}
                      </span>
                      {isCheapest && (
                        <span className="text-[9px] font-bold text-[#2D6A4F] bg-[#2D6A4F]/15 px-1.5 py-0.5 rounded-full">
                          BEST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pp.mrp > pp.price && (
                        <span className="text-[10px] text-[#9B9B9B] line-through">
                          ₹{pp.mrp}
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold ${
                          isCheapest
                            ? 'text-[#2D6A4F] dark:text-[#40916C]'
                            : 'text-[#1A1A1A] dark:text-[#F0EDE6]'
                        }`}
                      >
                        ₹{pp.price.toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-[#9B9B9B] mb-3">No pricing available</p>
          )}

          {/* Action Buttons: Individual Compare + Add to Basket */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowCompareModal(true)}
              className="py-2 px-2 rounded-xl border border-[#E8E6DF] dark:border-[#3E3E38] bg-[#F8F6F0] dark:bg-[#242420] hover:bg-[#EFECE6] dark:hover:bg-[#2C2C28] text-[#1A1A1A] dark:text-[#F0EDE6] font-medium text-xs flex items-center justify-center space-x-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Inspect Item</span>
            </button>

            <button
              onClick={() => addItem(product, 1)}
              className={`py-2 px-2 rounded-xl border font-medium text-xs flex items-center justify-center space-x-1 transition-all ${
                isAdded
                  ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
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
                  <span>Add to Basket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Single Item Comparison Modal */}
      {showCompareModal && (
        <ProductCompareModal
          product={product}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
};
