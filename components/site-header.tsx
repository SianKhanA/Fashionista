"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useStore } from "./store-provider";

const links = [
  ["New In","/shop?sort=newest"],["Sarees","/shop?category=Saree"],["Kameez","/shop?category=Kameez"],
  ["Three Piece","/shop?category=Three+Piece"],["Kurtis","/shop?category=Kurti"],["Accessories","/shop?category=Accessories"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { cartCount, wishlist, hydrated } = useStore();
  return <>
    <div className="announcement">Free delivery on orders over ৳5,000 <span>•</span> Easy 7-day exchange</div>
    <header className="site-header">
      <div className="container header-row">
        <button className="icon-button mobile-only" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
        <Link className="brand serif" href="/">Fashionist<span>A</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label,href]) => <Link href={href} key={label}>{label}</Link>)}</nav>
        <div className="header-actions">
          <Link className="icon-button hide-small" href="/shop" aria-label="Search products"><Search/></Link>
          <Link className="icon-button badge-wrap" href="/wishlist" aria-label="Wishlist"><Heart/><b>{hydrated ? wishlist.length : 0}</b></Link>
          <Link className="icon-button badge-wrap" href="/cart" aria-label="Shopping bag"><ShoppingBag/><b>{hydrated ? cartCount : 0}</b></Link>
        </div>
      </div>
      {open && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([label,href]) => <Link href={href} onClick={() => setOpen(false)} key={label}>{label}</Link>)}<Link href="/track" onClick={() => setOpen(false)}>Track order</Link></nav>}
    </header>
  </>;
}
