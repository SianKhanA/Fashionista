"use client";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { formatBDT, products } from "@/lib/catalog";

export default function CartPage() {
  const { cart, hydrated, updateQuantity, removeFromCart } = useStore();
  const lines = cart.flatMap((line) => { const product = products.find((p) => p.id === line.productId); return product ? [{ ...line, product }] : []; });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  if (!hydrated) return <main className="container loading-state">Loading your bag…</main>;
  return <main><section className="page-hero compact"><div className="container"><span className="eyebrow">Your selection</span><h1 className="serif">Shopping bag</h1></div></section><div className="container cart-layout">
    <section className="cart-lines">{lines.length ? lines.map((line) => <article className="cart-line" key={`${line.productId}-${line.size}`}><Link href={`/product/${line.product.slug}`}><img src={line.product.images[0]} alt={line.product.name}/></Link><div><p className="product-category">{line.product.category}</p><h2><Link href={`/product/${line.product.slug}`}>{line.product.name}</Link></h2><p>Size: {line.size}</p><div className="quantity-control"><button onClick={() => updateQuantity(line.productId,line.size,line.quantity - 1)} aria-label="Decrease quantity"><Minus/></button><span>{line.quantity}</span><button onClick={() => updateQuantity(line.productId,line.size,line.quantity + 1)} aria-label="Increase quantity"><Plus/></button></div></div><div className="line-end"><strong>{formatBDT(line.product.price * line.quantity)}</strong><button className="remove-button" onClick={() => removeFromCart(line.productId,line.size)}><Trash2/> Remove</button></div></article>) : <div className="empty-state"><ShoppingBag/><h2 className="serif">Your bag is waiting</h2><p>Discover something made for your next celebration.</p><Link className="button button-primary" href="/shop">Start shopping</Link></div>}</section>
    {lines.length > 0 && <aside className="order-summary"><h2 className="serif">Order summary</h2><p><span>Subtotal</span><strong>{formatBDT(subtotal)}</strong></p><p><span>Delivery</span><span>Calculated at checkout</span></p><hr/><p className="summary-total"><span>Total</span><strong>{formatBDT(subtotal)}</strong></p><Link className="button button-primary button-block" href="/checkout">Secure checkout</Link><small>Taxes included. Free delivery from ৳5,000.</small></aside>}
  </div></main>;
}
