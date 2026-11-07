import React from 'react';
import { ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-[#0F0F0D] border-t border-[#E8E6DF] dark:border-[#2E2E28] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center">
              <ShoppingBasket className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-[#1A1A1A] dark:text-[#F0EDE6]">
              Basket<span className="text-[#2D6A4F] dark:text-[#40916C]">IQ</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center space-x-8 text-sm text-[#6B6B6B] dark:text-[#A0A09A]">
            <Link to="/cart" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6]">Build Cart</Link>
            <a href="#features" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6]">Features</a>
            <a href="#how-it-works" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6]">How it works</a>
            <a href="#faq" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6]">FAQ</a>
          </div>

          <div className="text-xs text-[#9B9B9B] dark:text-[#6A6A64]">
            © {new Date().getFullYear()} BasketIQ. All rights reserved. Grocery Intelligence Platform.
          </div>
        </div>
      </div>
    </footer>
  );
};
