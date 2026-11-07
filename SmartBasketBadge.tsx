import React from 'react';

interface SmartBasketBadgeProps {
  type: 'cheapest' | 'fastest' | 'best-value';
}

export const SmartBasketBadge: React.FC<SmartBasketBadgeProps> = ({ type }) => {
  if (type === 'cheapest') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#EAF5EC] dark:bg-[#1C3A27] text-[#2D6A4F] dark:text-[#49A078] border border-[#2D6A4F]/20 shrink-0">
        Cheapest 🟢
      </span>
    );
  }

  if (type === 'fastest') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#FCF8E3] dark:bg-[#3D3516] text-[#B08924] dark:text-[#EAD06F] border border-[#B08924]/20 shrink-0">
        Fastest ⚡
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#EDF7F6] dark:bg-[#1E3B39] text-[#1E8A85] dark:text-[#5CE6E0] border border-[#1E8A85]/20 shrink-0">
      Best Value ⭐
    </span>
  );
};
