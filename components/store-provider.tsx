"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { parseCart, parseWishlist, readStorage, writeStorage, subtractPurchased, type CartLine } from "@/lib/browser-store";
export type { CartLine } from "@/lib/browser-store";
type StoreContextValue = {
  cart: CartLine[];
  wishlist: string[];
  hydrated: boolean;
  cartCount: number;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  completePurchase: (items: CartLine[]) => void;
  toggleWishlist: (productId: string) => void;
};

const CART_KEY = "fashionista-bd-cart-v1";
const WISHLIST_KEY = "fashionista-bd-wishlist-v1";
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setCart(parseCart(readStorage(CART_KEY)));
      setWishlist(parseWishlist(readStorage(WISHLIST_KEY)));
      setHydrated(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => { if (hydrated) writeStorage(CART_KEY, JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) writeStorage(WISHLIST_KEY, JSON.stringify(wishlist)); }, [wishlist, hydrated]);

  const addToCart = useCallback((productId: string, size: string, quantity = 1) => {
    setCart((current) => {
      const match = current.find((line) => line.productId === productId && line.size === size);
      if (match) return current.map((line) => line === match ? { ...line, quantity: Math.min(10, line.quantity + quantity) } : line);
      return [...current, { productId, size, quantity: Math.min(10, Math.max(1, quantity)) }];
    });
  }, []);
  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    setCart((current) => current.map((line) => line.productId === productId && line.size === size ? { ...line, quantity: Math.min(10, Math.max(1, quantity)) } : line));
  }, []);
  const removeFromCart = useCallback((productId: string, size: string) => {
    setCart((current) => current.filter((line) => line.productId !== productId || line.size !== size));
  }, []);
  const completePurchase = useCallback((items: CartLine[]) => setCart((current) => subtractPurchased(current, items)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }, []);

  const value = useMemo(() => ({
    cart, wishlist, hydrated,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    addToCart, updateQuantity, removeFromCart, clearCart, completePurchase, toggleWishlist,
  }), [cart, wishlist, hydrated, addToCart, updateQuantity, removeFromCart, clearCart, completePurchase, toggleWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
