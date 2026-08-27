import Link from "next/link";

const preview = [
  ["Nokshi Jamdani Saree","৳ 6,850","linear-gradient(145deg,#762d47,#d5a47b)"],
  ["Meghdoot Muslin Kameez","৳ 3,450","linear-gradient(145deg,#315b68,#b8d5d3)"],
  ["Gulbahar Three-Piece","৳ 4,250","linear-gradient(145deg,#9a5262,#eed5d7)"],
  ["Shonali Katan Saree","৳ 7,900","linear-gradient(145deg,#74601b,#e5cf8b)"],
] as const;

export default function Home() {
  return <main>
    <section className="hero"><div className="container"><div className="hero-copy">
      <span className="eyebrow">Made for every celebration</span>
      <h1 className="serif">Deshi elegance,<br/><em>made for you.</em></h1>
      <p>Discover sarees, kameez and everyday pieces shaped by the colour, craft and confidence of Bangladesh.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/shop">Shop new arrivals</Link><Link className="button button-light" href="/shop?category=saree">Explore sarees</Link></div>
    </div></div></section>
    <section className="trust"><div className="container trust-grid">
      <div className="trust-item">Nationwide delivery<small>Across Bangladesh</small></div>
      <div className="trust-item">Easy exchange<small>Within 7 days</small></div>
      <div className="trust-item">Secure payment<small>bKash, cards & cash</small></div>
      <div className="trust-item">Thoughtful quality<small>Checked before dispatch</small></div>
    </div></section>
    <section className="section"><div className="container">
      <div className="section-head"><div><span className="eyebrow">Fresh from the atelier</span><h2 className="serif">New arrivals</h2></div><Link href="/shop">View the collection →</Link></div>
      <div className="cards">{preview.map(([name,price,bg])=><article className="product" key={name}><div className="product-art" style={{background:bg}}/><h3>{name}</h3><p>{price}</p></article>)}</div>
    </div></section>
  </main>;
}
