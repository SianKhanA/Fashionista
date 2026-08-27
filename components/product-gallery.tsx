"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  return <div className="product-gallery">
    <div className="gallery-thumbs">{product.images.map((image,index) => <button key={image} className={active === index ? "active" : ""} onClick={() => setActive(index)} aria-label={`Show product image ${index + 1}`}><img src={image} alt=""/></button>)}</div>
    <div className="gallery-main"><img src={product.images[active]} alt={`${product.name}, view ${active + 1}`}/></div>
  </div>;
}
