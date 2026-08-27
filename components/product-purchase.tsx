"use client";

import { useState } from "react";
import { Check, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useStore } from "./store-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.includes(product.id);
  function add() {
    addToCart(product.id, size, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }
  return <div className="purchase-panel">
    <fieldset><legend>Choose a size</legend><div className="size-options">{product.sizes.map((item) => <button type="button" className={size === item ? "active" : ""} onClick={() => setSize(item)} key={item}>{item}</button>)}</div></fieldset>
    <div className="purchase-row">
      <div className="quantity-select"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus/></button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(Math.min(10, quantity + 1))}><Plus/></button></div>
      <button type="button" className="button button-primary" onClick={add}>{added ? <><Check/> Added</> : <><ShoppingBag/> Add to bag</>}</button>
      <button type="button" className={`icon-button ${wished ? "active" : ""}`} aria-label="Toggle wishlist" onClick={() => toggleWishlist(product.id)}><Heart fill={wished ? "currentColor" : "none"}/></button>
    </div>
    <p className="purchase-note">bKash, Visa, Mastercard or cash on delivery</p>
  </div>;
}
