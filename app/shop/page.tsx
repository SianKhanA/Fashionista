"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { categories, materials, occasions, products } from "@/lib/catalog";

const PAGE_SIZE = 16;

export default function ShopPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [material, setMaterial] = useState("All");
  const [occasion, setOccasion] = useState("All");
  const [sort, setSort] = useState(params.get("sort") ?? "featured");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return products.filter((p) => (!term || `${p.name} ${p.colour} ${p.material}`.toLowerCase().includes(term)) && (category === "All" || p.category === category) && (material === "All" || p.material === material) && (occasion === "All" || p.occasion === occasion)).sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : a.badge ? -1 : b.badge ? 1 : 0);
  }, [query, category, material, occasion, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const update = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };

  return <main><section className="page-hero"><div className="container"><span className="eyebrow">The full collection</span><h1 className="serif">Shop FashionistA</h1><p>Explore 96 deshi styles, from everyday cotton kurtis to celebration-ready Jamdani.</p></div></section>
    <div className="container shop-shell"><aside className="filters"><h2><SlidersHorizontal/> Filters</h2>
      <label>Search<span className="search-field"><Search/><input value={query} onChange={(e) => update(setQuery, e.target.value)} placeholder="Colour, style, fabric…"/></span></label>
      <label>Category<select value={category} onChange={(e) => update(setCategory, e.target.value)}><option>All</option>{categories.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Material<select value={material} onChange={(e) => update(setMaterial, e.target.value)}><option>All</option>{materials.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label>Occasion<select value={occasion} onChange={(e) => update(setOccasion, e.target.value)}><option>All</option>{occasions.map((x) => <option key={x}>{x}</option>)}</select></label>
      <button className="text-button" onClick={() => { setQuery(""); setCategory("All"); setMaterial("All"); setOccasion("All"); setPage(1); }}>Clear filters</button>
    </aside><section className="shop-results" aria-live="polite"><div className="shop-toolbar"><p><strong>{filtered.length}</strong> styles</p><label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
      {visible.length ? <div className="product-grid shop-grid">{visible.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="empty-state"><h2 className="serif">No pieces found</h2><p>Try removing a filter or searching another term.</p></div>}
      {pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button></nav>}
    </section></div></main>;
}
