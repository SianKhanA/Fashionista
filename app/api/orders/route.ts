import { NextResponse } from "next/server";
import { database, ensureDatabase } from "@/db/runtime";
import { calculateShipping, products } from "@/lib/catalog";
import { initiatePayment } from "@/lib/payments";
import { proxyToSites, usesVercelBridge } from "@/lib/sites-backend";

type Input = { customer?:Record<string,unknown>; paymentMethod?:string; idempotencyKey?:string; items?:Array<{productId?:string;size?:string;quantity?:number}> };
const clean=(value:unknown,max=200)=>typeof value==="string"?value.trim().slice(0,max):"";
const phonePattern=/^(?:\+?88)?01[3-9]\d{8}$/;
function orderCode(){ const bytes=crypto.getRandomValues(new Uint8Array(5)); return `FAS-${Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("").toUpperCase()}`; }

export async function POST(request:Request){
  if (usesVercelBridge()) return proxyToSites(request, "/api/orders");
  try { await ensureDatabase(); const input=await request.json() as Input; const customer=input.customer??{}; const name=clean(customer.name,80), phone=clean(customer.phone,20).replace(/[\s-]/g,""), email=clean(customer.email,120), address=clean(customer.address,300), division=clean(customer.division,30), district=clean(customer.district,60), postcode=clean(customer.postcode,12), notes=clean(customer.notes,300); const method=clean(input.paymentMethod,12); const key=clean(input.idempotencyKey,80);
    if(!name||!phonePattern.test(phone)||address.length<8||!division||!district) return NextResponse.json({error:"Please provide complete and valid delivery details."},{status:400});
    if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:"Please enter a valid email address."},{status:400});
    if(!["cod","bkash","card"].includes(method)) return NextResponse.json({error:"Please select a payment method."},{status:400});
    if(!key||!Array.isArray(input.items)||input.items.length<1||input.items.length>30) return NextResponse.json({error:"Your shopping bag is invalid."},{status:400});
    const existing=await database().prepare("SELECT order_code AS orderCode FROM orders WHERE idempotency_key = ?").bind(key).first<{orderCode:string}>(); if(existing) return NextResponse.json(existing);
    const lines=input.items.map((item)=>{ const product=products.find((p)=>p.id===item.productId); const quantity=Math.floor(Number(item.quantity)); const size=clean(item.size,20); if(!product||!Number.isFinite(quantity)||quantity<1||quantity>10||!product.sizes.includes(size)) throw new Error("One or more items are unavailable. Please refresh your bag."); return {product,size,quantity}; });
    const subtotal=lines.reduce((sum,line)=>sum+line.product.price*line.quantity,0); const shipping=calculateShipping(subtotal,division); const total=subtotal+shipping; const code=orderCode(); const now=new Date().toISOString();
    const insert=await database().prepare("INSERT INTO orders (order_code,idempotency_key,name,phone,email,address,division,district,postcode,notes,subtotal,shipping,total,payment_method,payment_status,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(code,key,name,phone,email||null,address,division,district,postcode||null,notes||null,subtotal,shipping,total,method,method==="cod"?"cash_due":"pending","placed",now,now).run(); const id=Number(insert.meta.last_row_id);
    await database().batch(lines.map((line)=>database().prepare("INSERT INTO order_items (order_id,product_id,name,size,quantity,unit_price) VALUES (?,?,?,?,?,?)").bind(id,line.product.id,line.product.name,line.size,line.quantity,line.product.price)));
    if(method!=="cod"){ try { const paymentUrl=await initiatePayment({orderCode:code,total,name,phone,email,address,paymentMethod:method as "bkash"|"card"}); return NextResponse.json({orderCode:code,paymentUrl},{status:201}); } catch(cause){ await database().prepare("UPDATE orders SET status='payment_failed', updated_at=? WHERE id=?").bind(new Date().toISOString(),id).run(); throw cause; } }
    return NextResponse.json({orderCode:code},{status:201});
  } catch(cause){ return NextResponse.json({error:cause instanceof Error?cause.message:"Could not place the order."},{status:400}); }
}
