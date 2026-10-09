import React from 'react';
import type { ItemBreakdown } from '../types';
import { formatCurrency } from '../lib/api';
import { CheckCircle2, XCircle, Tag } from 'lucide-react';

interface StoreBreakdownTableProps {
  breakdown: ItemBreakdown[];
  platformName: string;
}

export const StoreBreakdownTable: React.FC<StoreBreakdownTableProps> = ({
  breakdown,
  platformName,
}) => {
  const itemsList = Array.isArray(breakdown) ? breakdown : [];

  return (
    <div className="bg-white dark:bg-[#1E1E1A] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#E8E6DF] dark:border-[#2E2E28] bg-[#F8F6F0] dark:bg-[#242420] flex justify-between items-center">
        <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-[#F0EDE6]">
          Itemized Price Breakdown ({platformName})
        </h3>
        <span className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
          {itemsList.filter((i) => i.available).length} of {itemsList.length} items available
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAFAF8] dark:bg-[#1A1A16] text-xs font-semibold text-[#6B6B6B] dark:text-[#A0A09A] uppercase tracking-wider border-b border-[#E8E6DF] dark:border-[#2E2E28]">
            <tr>
              <th className="px-6 py-3.5">Product</th>
              <th className="px-6 py-3.5 text-center">Status</th>
              <th className="px-6 py-3.5 text-center">Qty</th>
              <th className="px-6 py-3.5 text-right">Unit Price</th>
              <th className="px-6 py-3.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E6DF] dark:divide-[#2E2E28]">
            {itemsList.map((item, idx) => (
              <tr
                key={idx}
                className={`hover:bg-[#F8F6F0]/50 dark:hover:bg-[#242420]/50 transition-colors ${
                  !item.available ? 'bg-red-50/30 dark:bg-red-950/10' : ''
                }`}
              >
                <td className="px-6 py-4 font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
                  {item.productName}
                  {item.mrp && item.unitPrice && item.mrp > item.unitPrice && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#2D6A4F] bg-[#2D6A4F]/10 px-1.5 py-0.5 rounded">
                      <Tag className="w-2.5 h-2.5" />
                      {item.discountPercent}% OFF
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  {item.available ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#2D6A4F] dark:text-[#40916C] font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <XCircle className="w-4 h-4" /> Out of Stock
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center text-[#6B6B6B] dark:text-[#A0A09A]">
                  {item.quantity}
                </td>

                <td className="px-6 py-4 text-right">
                  {item.unitPrice ? (
                    <div>
                      <span className="text-[#1A1A1A] dark:text-[#F0EDE6] font-medium">
                        {formatCurrency(item.unitPrice)}
                      </span>
                      {item.mrp && item.mrp > item.unitPrice && (
                        <span className="text-xs text-[#9B9B9B] line-through block">
                          ₹{item.mrp}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[#9B9B9B]">—</span>
                  )}
                </td>

                <td className="px-6 py-4 text-right font-serif font-bold text-[#1A1A1A] dark:text-[#F0EDE6]">
                  {item.totalPrice ? formatCurrency(item.totalPrice) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
