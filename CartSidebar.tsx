import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const CartSidebar: React.FC = () => {
  const { cart, isOpen, setIsOpen, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Estimate total using lowest price platform for each product
  const estimatedTotal = items.reduce((sum, item) => {
    const minPrice = item.product.platformProducts?.[0]?.price || 0;
    return sum + minPrice * item.quantity;
  }, 0);

  const handleCompare = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1E1E1A] shadow-2xl flex flex-col border-l border-[#E8E6DF] dark:border-[#2E2E28] animate-slide-in-right">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E6DF] dark:border-[#2E2E28] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#2D6A4F] dark:text-[#40916C]" />
              <h2 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6]">
                Your Basket ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-[#9B9B9B]">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#2D6A4F]" />
                <p className="font-medium text-base text-[#1A1A1A] dark:text-[#F0EDE6] mb-1">
                  Your basket is empty
                </p>
                <p className="text-xs">Search products and add items to compare across platforms</p>
              </div>
            ) : (
              items.map((item) => {
                const minPrice = item.product.platformProducts?.[0]?.price || 0;
                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-3 bg-[#F8F6F0] dark:bg-[#242420] rounded-xl border border-[#E8E6DF] dark:border-[#2E2E28]"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white dark:bg-[#1A1A16] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {item.product.category?.iconEmoji || '🛒'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#1A1A1A] dark:text-[#F0EDE6] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
                        {item.product.unitSize} • From {formatCurrency(minPrice)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center space-x-1 bg-white dark:bg-[#1A1A16] border border-[#E8E6DF] dark:border-[#3E3E38] rounded-md px-1.5 py-0.5">
                          <button
                            onClick={() => updateItem(item.id, item.quantity - 1)}
                            className="p-1 text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="p-1 text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-sm text-[#1A1A1A] dark:text-[#F0EDE6] block">
                        {formatCurrency(minPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 mt-1 inline-block"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E8E6DF] dark:border-[#2E2E28] bg-white dark:bg-[#1E1E1A] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#6B6B6B] dark:text-[#A0A09A]">Estimated Lowest Total</span>
                <span className="font-serif font-bold text-lg text-[#2D6A4F] dark:text-[#40916C]">
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearCart}
                  className="py-2.5 px-4 text-xs font-medium text-[#6B6B6B] dark:text-[#A0A09A] hover:bg-[#F8F6F0] dark:hover:bg-[#242420] rounded-xl border border-[#E8E6DF] dark:border-[#2E2E28] transition-colors"
                >
                  Clear Basket
                </button>
                <button
                  onClick={handleCompare}
                  className="py-2.5 px-4 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#245A42] rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                >
                  <span>Compare Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
