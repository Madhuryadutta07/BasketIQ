import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Cart, Product } from '../types';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addItem = async (product: Product, quantity = 1) => {
    try {
      const res = await api.post('/cart/items', { productId: product.id, quantity });
      setCart(res.data.cart);
      toast.success(`Added ${product.name} to cart`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add item');
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(res.data.cart);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update item');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data.cart);
      toast.success('Item removed from cart');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
      toast.success('Cart cleared');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isOpen,
        setIsOpen,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
