import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { formatBDT, getProduct, products } from "@/lib/catalog";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.description, openGraph: { title: product.name, description: product.description, images: [product.images[0]] } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.name, image: product.images, description: product.description, sku: product.id, offers: { "@type": "Offer", priceCurrency: "BDT", price: product.price, availability: "https://schema.org/InStock" }, aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews } };
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><div className="container product-detail"><ProductGallery product={product}/><div className="product-copy"><p className="product-category">{product.category} · {product.colour}</p><h1 className="serif">{product.name}</h1><div className="detail-rating">★★★★★ <span>{product.rating} ({product.reviews} reviews)</span></div><p className="detail-price">{formatBDT(product.price)} {product.compareAt && <del>{formatBDT(product.compareAt)}</del>}</p><p className="detail-description">{product.description}</p><ProductPurchase product={product}/><div className="detail-panels"><details open><summary>Product details</summary><ul>{product.details.map((item) => <li key={item}>{item}</li>)}</ul></details><details><summary>Size guide</summary><div className="size-table"><span>Size</span><span>Bust</span><span>Waist</span><b>S</b><span>36″</span><span>34″</span><b>M</b><span>38″</span><span>36″</span><b>L</b><span>40″</span><span>38″</span><b>XL</b><span>43″</span><span>41″</span><b>XXL</b><span>46″</span><span>44″</span></div></details><details><summary>Delivery & exchange</summary><p>Delivery in 2–4 working days inside Dhaka and 3–7 days elsewhere in Bangladesh. Exchange requests are accepted within 7 days of delivery.</p></details></div></div></div>
    <section className="section soft-section"><div className="container"><div className="section-head"><div><span className="eyebrow">You may also like</span><h2 className="serif">More from this collection</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard product={item} key={item.id}/>)}</div></div></section></main>;
}
