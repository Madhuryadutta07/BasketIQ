import React from 'react';
import { Clock, ArrowRight, AlertCircle, ChevronRight } from 'lucide-react';
import type { ComparisonResult } from '../types';
import { formatCurrency } from '../lib/api';
import { SmartBasketBadge } from './SmartBasketBadge';
import { useNavigate } from 'react-router-dom';

interface ComparisonCardProps {
  result: ComparisonResult;
  comparisonId: string;
  maxTotal?: number;
  isRecommended?: boolean;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  result,
  comparisonId,
  isRecommended = false,
}) => {
  const navigate = useNavigate();
  const platform = result.platform;

  const handleContinueHandoff = () => {
    navigate(`/handoff/${platform.slug}?comparisonId=${comparisonId}`);
  };

  const handleSelectStore = () => {
    navigate(`/compare/${comparisonId}/store/${platform.id}`);
  };

  return (
    <div
      className={`bg-white dark:bg-[#1E1E1A] rounded-2xl border transition-all p-6 relative flex flex-col justify-between ${
        isRecommended
          ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20 shadow-lg bg-gradient-to-b from-[#2D6A4F]/2 to-transparent dark:from-[#2D6A4F]/4'
          : 'border-[#E8E6DF] dark:border-[#2E2E28] hover:border-[#2D6A4F]/40 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Badges & Logo */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm shrink-0"
              style={{ backgroundColor: platform.color }}
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-[#1A1A1A] dark:text-[#F0EDE6]">
                {platform.name}
              </h3>
              <div className="flex items-center space-x-1 text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
                <Clock className="w-3.5 h-3.5" />
                <span>~{result.estimatedDeliveryMins} mins</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {result.isCheapest && <SmartBasketBadge type="cheapest" />}
            {result.isFastest && !result.isCheapest && <SmartBasketBadge type="fastest" />}
            {result.isBestValue && !result.isCheapest && !result.isFastest && <SmartBasketBadge type="best-value" />}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="my-6 py-4 px-4 bg-[#F8F6F0] dark:bg-[#242420] rounded-xl border border-[#E8E6DF] dark:border-[#2E2E28]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">Final Basket Total</span>
            <span className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
              {formatCurrency(result.finalTotal)}
            </span>
          </div>

          {result.savingsVsMax > 0 && (
            <div className="mt-2 pt-2 border-t border-[#E8E6DF] dark:border-[#2E2E28] flex justify-between items-center text-xs">
              <span className="text-[#2D6A4F] dark:text-[#40916C] font-medium">You save vs max store:</span>
              <span className="font-bold text-[#2D6A4F] dark:text-[#40916C]">
                {formatCurrency(result.savingsVsMax)}
              </span>
            </div>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-2 text-xs text-[#6B6B6B] dark:text-[#A0A09A] mb-6">
          <div className="flex justify-between">
            <span>Items Available:</span>
            <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
              {result.availableItems} items
            </span>
          </div>
          {result.unavailableItems > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Out of stock:
              </span>
              <span className="font-semibold">{result.unavailableItems} items</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
              {result.deliveryFee === 0 ? (
                <span className="text-[#2D6A4F] font-semibold">FREE</span>
              ) : (
                formatCurrency(result.deliveryFee)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Taxes (GST):</span>
            <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
              {formatCurrency(result.estimatedTax)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleContinueHandoff}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-xs text-white cursor-pointer hover:opacity-90"
          style={{ backgroundColor: platform.color }}
        >
          <span>Continue on {platform.name} 🛒</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleSelectStore}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all text-[#6B6B6B] dark:text-[#A0A09A] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] border border-dashed border-[#E8E6DF] dark:border-[#3E3E38] hover:border-[#2D6A4F] cursor-pointer"
        >
          <span>View Store Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
