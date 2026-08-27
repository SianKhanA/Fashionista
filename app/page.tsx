import Link from "next/link";
import { ArrowRight, CreditCard, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/lib/catalog";

const categoryTiles = [
  { name: "Sarees", href: "/shop?category=Saree", image: "/products/saree-4.jpg", note: "Jamdani · Katan · Muslin" },
  { name: "Kameez", href: "/shop?category=Kameez", image: "/products/party-kameez.jpg", note: "Everyday · Festive" },
  { name: "Three Piece", href: "/shop?category=Three+Piece", image: "/products/muslin-kameez.jpg", note: "Complete looks" },
] as const;

export default function Home() {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "FashionistA", url: process.env.PUBLIC_SITE_URL ?? "https://fashionista.openai.site", sameAs: ["https://www.facebook.com/fashionista.K"], address: { "@type": "PostalAddress", addressCountry: "BD" } };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
    <section className="hero"><div className="container"><div className="hero-copy">
      <span className="eyebrow">Made for every celebration</span>
      <h1 className="serif">Deshi elegance,<br/><em>made for you.</em></h1>
      <p>Discover sarees, kameez and everyday pieces shaped by the colour, craft and confidence of Bangladesh.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/shop">Shop new arrivals <ArrowRight/></Link><Link className="button button-light" href="/shop?category=Saree">Explore sarees</Link></div>
    </div></div></section>
    <section className="trust"><div className="container trust-grid">
      <div className="trust-item"><Truck/><span>Nationwide delivery<small>Across Bangladesh</small></span></div>
      <div className="trust-item"><RefreshCw/><span>Easy exchange<small>Within 7 days</small></span></div>
      <div className="trust-item"><ShieldCheck/><span>Secure payment<small>bKash, cards & cash</small></span></div>
      <div className="trust-item"><CreditCard/><span>Pay your way<small>Trusted local checkout</small></span></div>
    </div></section>
    <section className="section"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Find your silhouette</span><h2 className="serif">Shop the collections</h2></div><Link className="text-link" href="/shop">View all <ArrowRight/></Link></div>
      <div className="category-grid">{categoryTiles.map((item) => <Link href={item.href} className="category-tile" key={item.name}><img src={item.image} alt={item.name}/><span><small>{item.note}</small><strong className="serif">{item.name}</strong><b>Explore <ArrowRight/></b></span></Link>)}</div>
    </div></section>
    <section className="section soft-section"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Fresh from the atelier</span><h2 className="serif">New arrivals</h2></div><Link className="text-link" href="/shop">View the collection <ArrowRight/></Link></div>
      <div className="product-grid">{featuredProducts.map((product, index) => <ProductCard product={product} priority={index < 4} key={product.id}/>)}</div>
    </div></section>
    <section className="story-section"><div className="container story-grid"><div className="story-photo"><img src="/images/hero-jamdani.webp" alt="A contemporary Jamdani saree"/></div><div className="story-copy"><span className="eyebrow">Rooted here</span><h2 className="serif">Clothing that feels like home</h2><p>FashionistA brings together familiar craft, expressive colour and modern ease. Every collection is selected for real celebrations, real weather and real wardrobes in Bangladesh.</p><Link className="button button-light" href="/about">Our story <ArrowRight/></Link></div></div></section>
    <section className="section reviews"><div className="container"><div className="center-head"><span className="eyebrow">Loved across Bangladesh</span><h2 className="serif">What customers are saying</h2></div><div className="review-grid">
      <blockquote><div>★★★★★</div><p>“The fabric was exactly as shown and the fitting help on Messenger was wonderful.”</p><cite>— Nusrat, Dhaka</cite></blockquote>
      <blockquote><div>★★★★★</div><p>“My saree arrived beautifully packed. The colour and weaving are even prettier in person.”</p><cite>— Farzana, Chattogram</cite></blockquote>
      <blockquote><div>★★★★★</div><p>“Fast delivery outside Dhaka and the exchange process was very easy.”</p><cite>— Tanjina, Rajshahi</cite></blockquote>
    </div></div></section>
  </main>;
}
