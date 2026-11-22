import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";
export default async function Shop(){
 const db=await supabaseServer();
 const {data:products}=db?await db.from("products").select("id,title,slug,description,price_lkr,image_url").eq("status","published").order("created_at",{ascending:false}).limit(40):{data:[]};
 return <section className="wrap section"><p className="eyebrow">THE COLLECTION</p><h1 className="page-title">Something for everyone.</h1><p className="lede">Books, stationery, creative essentials and gifts.</p>{!products?.length?<div className="empty"><h2>Our shelves are being filled.</h2><p>Our catalogue is being prepared. Need something now?</p><Link className="btn primary" href="/quotes">Request a quotation</Link></div>:<div className="products">{products.map(p=><article key={p.id} className="product"><div className="product-photo">{p.image_url?<img src={p.image_url} alt={p.title}/>:<span>pusthaya.lk</span>}</div><div className="product-info"><h3>{p.title}</h3><p>{p.description}</p><strong>{p.price_lkr==null?"Ask for price":`LKR ${Number(p.price_lkr).toLocaleString("en-LK")}`}</strong></div></article>)}</div>}</section>;
}
