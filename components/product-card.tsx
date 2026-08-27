"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/catalog";
import { useStore } from "./store-provider";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { wishlist, toggleWishlist } = useStore();
  const wished = wishlist.includes(product.id);
  return <article className="product-card">
    <div className="product-image">
      <Link href={`/product/${product.slug}`} aria-label={product.name}><img src={product.images[0]} alt={product.name} loading={priority ? "eager" : "lazy"} decoding="async"/></Link>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className={`wish-button ${wished ? "active" : ""}`} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggleWishlist(product.id)}><Heart fill={wished ? "currentColor" : "none"}/></button>
    </div>
    <div className="product-info"><p className="product-category">{product.category}</p><h3><Link href={`/product/${product.slug}`}>{product.name}</Link></h3><div className="product-meta"><span>{formatBDT(product.price)} {product.compareAt && <del>{formatBDT(product.compareAt)}</del>}</span><span className="rating"><Star fill="currentColor"/> {product.rating}</span></div></div>
  </article>;
}
