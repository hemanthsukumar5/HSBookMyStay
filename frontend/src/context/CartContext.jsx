import { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCartLoading(true);
    try {
      const res = await apiFetch('/api/cart/');
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const addToCart = async (roomId, quantity = 1) => {
    const res = await apiFetch('/api/cart/add/', {
      method: 'POST',
      body: { room_id: roomId, quantity },
    });
    setCart(res.data);
    return res.data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const res = await apiFetch(`/api/cart/items/${itemId}/`, {
      method: 'PATCH',
      body: { quantity },
    });
    setCart(res.data);
    return res.data;
  };

  const removeCartItem = async (itemId) => {
    const res = await apiFetch(`/api/cart/items/${itemId}/`, {
      method: 'DELETE',
    });
    setCart(res.data);
    return res.data;
  };

  const clearCart = () => setCart(null);

  const cartItemCount = cart?.items?.length || 0;

  const value = {
    cart, cartLoading, fetchCart, addToCart,
    updateCartItem, removeCartItem, clearCart, cartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
