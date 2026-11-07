import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBasket, LogOut, Moon, Sun, Command, Menu, X, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const { cart, setIsOpen: setIsCartOpen } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0F0F0D]/90 backdrop-blur-md border-b border-[#E8E6DF] dark:border-[#2E2E28] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingBasket className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight text-[#1A1A1A] dark:text-[#F0EDE6]">
            Basket<span className="text-[#2D6A4F] dark:text-[#40916C]">IQ</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#6B6B6B] dark:text-[#A0A09A]">
          <Link
            to="/cart"
            className={`hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors ${
              location.pathname === '/cart' ? 'text-[#2D6A4F] dark:text-[#40916C] font-semibold' : ''
            }`}
          >
            Build Cart
          </Link>
          <a href="#features" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors">
            FAQ
          </a>
          {user && (
            <Link
              to="/analytics"
              className={`flex items-center gap-1.5 hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors ${
                location.pathname === '/analytics' ? 'text-[#2D6A4F] dark:text-[#40916C] font-semibold' : ''
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          )}
        </nav>

        {/* Right CTA / Controls */}
        <div className="flex items-center space-x-3">
          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6B6B6B] bg-[#F8F6F0] dark:bg-[#1E1E1A] dark:text-[#A0A09A] rounded-lg border border-[#E8E6DF] dark:border-[#2E2E28] hover:border-[#2D6A4F] transition-all"
            title="Search & Commands (⌘K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#2A2A24] rounded shadow-xs">⌘K</kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-[#6B6B6B] dark:text-[#A0A09A] hover:bg-[#F8F6F0] dark:hover:bg-[#1E1E1A] rounded-lg transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#E8C070]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#1A1A1A] dark:text-[#F0EDE6] hover:bg-[#F8F6F0] dark:hover:bg-[#1E1E1A] rounded-lg transition-colors"
            aria-label="View Cart"
          >
            <ShoppingBasket className="w-5 h-5 text-[#2D6A4F] dark:text-[#40916C]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2D6A4F] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Auth Buttons */}
          {user ? (
            <div className="flex items-center space-x-2 border-l border-[#E8E6DF] dark:border-[#2E2E28] pl-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE6] hover:text-[#2D6A4F] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8E6DF] dark:bg-[#2E2E28] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 text-[#6B6B6B] hover:text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A0A09A] dark:hover:text-[#F0EDE6] px-3 py-2 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/cart"
                className="bg-[#2D6A4F] hover:bg-[#245A42] text-white text-sm font-medium px-4 py-2 rounded-full shadow-xs transition-all hover:shadow-md"
              >
                Start Comparing
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1A1A1A] dark:text-[#F0EDE6]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E6DF] dark:border-[#2E2E28] bg-white dark:bg-[#0F0F0D] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1A1A1A] dark:text-[#F0EDE6]"
          >
            Build Cart
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#6B6B6B]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#6B6B6B]"
          >
            How it works
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#6B6B6B]"
          >
            FAQ
          </a>
          {user && (
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-[#2D6A4F]"
            >
              Analytics Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
