import Link from "next/link";
import { Facebook } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="newsletter"><div className="container newsletter-row"><div><span className="eyebrow">The FashionistA edit</span><h2 className="serif">A little beauty in your inbox</h2><p>New drops, styling notes and private offers—occasionally.</p></div><NewsletterForm/></div></div>
    <div className="container footer-grid">
      <div><Link className="brand serif footer-brand" href="/">Fashionist<span>A</span></Link><p>Contemporary deshi clothing, thoughtfully selected for women across Bangladesh.</p><div className="socials"><a href="https://www.facebook.com/fashionista.K" target="_blank" rel="noreferrer" aria-label="FashionistA on Facebook"><Facebook/></a></div></div>
      <nav><h3>Shop</h3><Link href="/shop?category=Saree">Sarees</Link><Link href="/shop?category=Kameez">Kameez</Link><Link href="/shop?category=Three+Piece">Three Piece</Link><Link href="/shop?category=Accessories">Accessories</Link></nav>
      <nav><h3>Help</h3><Link href="/track">Track order</Link><Link href="/policies#delivery">Delivery</Link><Link href="/policies#exchange">Exchange policy</Link><Link href="/contact">Contact us</Link></nav>
      <nav><h3>Company</h3><Link href="/about">Our story</Link><Link href="/policies">Privacy & terms</Link><a href="https://www.facebook.com/fashionista.K" target="_blank" rel="noreferrer">Facebook</a></nav>
    </div>
    <div className="container footer-bottom">© {new Date().getFullYear()} FashionistA Bangladesh · bKash · Visa · Mastercard · Cash on delivery</div>
  </footer>;
}
