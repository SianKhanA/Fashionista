"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-provider";
import { products } from "@/lib/catalog";

export default function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  if (!hydrated) return <main className="container loading-state">Loading your wishlist…</main>;
  return <main><section className="page-hero compact"><div className="container"><span className="eyebrow">Saved for later</span><h1 className="serif">Your wishlist</h1></div></section><section className="section"><div className="container">{saved.length ? <div className="product-grid">{saved.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="empty-state"><Heart/><h2 className="serif">Nothing saved yet</h2><p>Tap the heart on any piece you would like to remember.</p><Link className="button button-primary" href="/shop">Explore the collection</Link></div>}</div></section></main>;
}
