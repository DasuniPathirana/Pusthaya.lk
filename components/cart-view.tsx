"use client";
import Link from "next/link";
import {Trash2} from "lucide-react";
import {useCart,money} from "@/components/cart-provider";

export default function CartView(){
 const {items,loading,busy,error,count,subtotal,mode,changeQuantity,remove,clearError}=useCart();
 if(loading)return <div className="empty" role="status">Loading your shopping bag…</div>;
 return <section className="wrap section">
  <p className="eyebrow">YOUR PICKS</p><h1 className="page-title">Your shopping bag.</h1>
  {mode==="guest"&&<p className="cart-notice">Your bag is saved on this device. <Link href="/sign-in">Sign in</Link> to keep it with your account.</p>}
  {error&&<p className="cart-error" role="alert">{error} <button type="button" onClick={clearError} aria-label="Dismiss error">Dismiss</button></p>}
  {items.length===0?<div className="empty"><h2>Nothing in your bag yet.</h2><p>Explore the shop and add something you love.</p><Link href="/shop" className="btn primary">Explore the shop</Link></div>:
  <div className="cart-layout"><div className="cart-lines">{items.map(line=>{
   const product=line.product,available=product.priceLkr!==null && product.stockQty>0 && product.status!=="unavailable";
   return <article key={product.id} className="cart-line">
    <div className="cart-thumb">{product.imageUrl?<img src={product.imageUrl} alt={product.title}/>:<span>pusthaya.lk</span>}</div>
    <div className="cart-line-body"><h2>{product.title}</h2><p>{available?money(product.priceLkr!):"Currently unavailable"}</p>
     {product.stockQty>0&&product.stockQty<line.quantity&&<p className="stock-warning">Only {product.stockQty} in stock. Reduce your quantity.</p>}
     <div className="cart-controls"><button type="button" disabled={busy} aria-label={`Decrease ${product.title} quantity`} onClick={()=>void changeQuantity(product.id,line.quantity-1)}>−</button><span aria-label="Quantity">{line.quantity}</span><button type="button" disabled={busy||!available||line.quantity>=Math.min(99,product.stockQty)} aria-label={`Increase ${product.title} quantity`} onClick={()=>void changeQuantity(product.id,line.quantity+1)}>+</button><button type="button" className="cart-remove" disabled={busy} aria-label={`Remove ${product.title}`} onClick={()=>void remove(product.id)}><Trash2 size={17}/><span>Remove</span></button></div>
    </div><strong className="cart-line-total">{available?money(product.priceLkr!*line.quantity):"Unavailable"}</strong>
   </article>;
  })}</div><aside className="cart-summary"><p className="eyebrow">ORDER SUMMARY</p><h2>Almost yours.</h2><div className="cart-summary-row"><span>Items</span><span>{count}</span></div><div className="cart-summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="cart-summary-row"><span>Delivery</span><span>Calculated at checkout</span></div><hr/><div className="cart-summary-row"><strong>Estimated total</strong><strong>{money(subtotal)}</strong></div><p className="cart-disclaimer">Prices are estimates. The final price and available stock will be checked when checkout is implemented.</p><button className="btn primary cart-checkout" disabled title="Checkout and online payments are not yet available">Checkout coming soon</button><Link className="cart-continue" href="/shop">Continue shopping</Link><Link className="cart-continue" href="/quotes">Request a custom quotation</Link></aside></div>}
 </section>;
}
