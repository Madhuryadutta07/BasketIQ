import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, ShoppingBasket, BarChart3, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or shortcut
        }
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=5`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1E1E1A] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] shadow-2xl overflow-hidden z-10 animate-scale-in">
        <Command className="w-full">
          <div className="flex items-center border-b border-[#E8E6DF] dark:border-[#2E2E28] px-4 py-3">
            <Search className="w-5 h-5 text-[#9B9B9B] mr-3" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Type a command or search groceries..."
              className="w-full bg-transparent text-sm text-[#1A1A1A] dark:text-[#F0EDE6] placeholder-[#9B9B9B] focus:outline-none"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-xs text-[#9B9B9B]">
              No results found. Try searching for "Milk", "Atta", or "Eggs".
            </Command.Empty>

            {/* Products Group */}
            {products.length > 0 && (
              <Command.Group heading="Products" className="text-[11px] font-semibold text-[#9B9B9B] px-3 py-1.5 uppercase">
                {products.map((p) => (
                  <Command.Item
                    key={p.id}
                    onSelect={() => {
                      addItem(p, 1);
                      onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-[#F8F6F0] dark:hover:bg-[#242420] cursor-pointer text-[#1A1A1A] dark:text-[#F0EDE6]"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{p.category?.iconEmoji || '🛒'}</span>
                      <span>{p.name}</span>
                    </div>
                    <span className="text-xs text-[#2D6A4F] font-semibold">
                      Add to Cart
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Navigation Group */}
            <Command.Group heading="Navigation" className="text-[11px] font-semibold text-[#9B9B9B] px-3 py-1.5 uppercase mt-2">
              <Command.Item
                onSelect={() => {
                  navigate('/cart');
                  onClose();
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm hover:bg-[#F8F6F0] dark:hover:bg-[#242420] cursor-pointer text-[#1A1A1A] dark:text-[#F0EDE6]"
              >
                <ShoppingBasket className="w-4 h-4 text-[#2D6A4F]" />
                <span>Build & Compare Cart</span>
              </Command.Item>

              {user ? (
                <>
                  <Command.Item
                    onSelect={() => {
                      navigate('/analytics');
                      onClose();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm hover:bg-[#F8F6F0] dark:hover:bg-[#242420] cursor-pointer text-[#1A1A1A] dark:text-[#F0EDE6]"
                  >
                    <BarChart3 className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Analytics Dashboard</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      navigate('/profile');
                      onClose();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm hover:bg-[#F8F6F0] dark:hover:bg-[#242420] cursor-pointer text-[#1A1A1A] dark:text-[#F0EDE6]"
                  >
                    <User className="w-4 h-4 text-[#2D6A4F]" />
                    <span>My Profile & Saved Carts</span>
                  </Command.Item>
                </>
              ) : (
                <Command.Item
                  onSelect={() => {
                    navigate('/login');
                    onClose();
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl text-sm hover:bg-[#F8F6F0] dark:hover:bg-[#242420] cursor-pointer text-[#1A1A1A] dark:text-[#F0EDE6]"
                >
                  <LogIn className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Log in / Register</span>
                </Command.Item>
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
