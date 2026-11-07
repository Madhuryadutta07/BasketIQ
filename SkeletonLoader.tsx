import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="w-12 h-12 skeleton mb-3" />
        <div className="w-1/3 h-3 skeleton mb-2" />
        <div className="w-3/4 h-5 skeleton mb-2" />
        <div className="w-1/4 h-3 skeleton" />
      </div>
      <div className="mt-4 pt-3 border-t border-[#E8E6DF] dark:border-[#2E2E28] flex justify-between items-center">
        <div className="w-1/2 h-6 skeleton" />
        <div className="w-16 h-8 skeleton rounded-xl" />
      </div>
    </div>
  );
};

export const ComparisonSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 skeleton rounded-xl" />
          <div className="space-y-2">
            <div className="w-24 h-5 skeleton" />
            <div className="w-16 h-3 skeleton" />
          </div>
        </div>
        <div className="w-20 h-6 skeleton rounded-full" />
      </div>
      <div className="w-full h-20 skeleton rounded-xl" />
      <div className="space-y-2">
        <div className="w-full h-4 skeleton" />
        <div className="w-3/4 h-4 skeleton" />
      </div>
      <div className="w-full h-10 skeleton rounded-xl" />
    </div>
  );
};
