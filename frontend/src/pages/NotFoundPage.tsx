import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mx-auto">
          <ShoppingBasket className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-bold text-5xl text-[#1A1A1A] dark:text-[#F0EDE6]">
          404
        </h1>
        <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
          Page Not Found
        </h2>
        <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#2D6A4F] hover:bg-[#245A42] text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
