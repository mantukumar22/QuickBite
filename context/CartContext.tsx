'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: any, restaurant: any) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, delta: number) => void;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
  total: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('quickbite_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('quickbite_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (item: any, restaurant: any) => {
    setItems(prev => {
      // If adding from a different restaurant, clear first or alert? 
      // For simplicity, let's allow multi-restaurant but it's usually better to restrict to one.
      // QuickBite restriction: One restaurant per order.
      if (prev.length > 0 && prev[0].restaurantId !== restaurant.id) {
        if (confirm("Clear your current cart from " + prev[0].restaurantName + " to add from " + restaurant.name + "?")) {
          return [{ ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
        }
        return prev;
      }

      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, updateQuantity, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
