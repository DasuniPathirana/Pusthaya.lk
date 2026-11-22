import Link from "next/link";
import {supabaseServer} from "@/lib/supabase/server";
import AddToCart from "@/components/add-to-cart";
export default async function Shop({searchParams}:{searchParams:Promise<{category?:string}>}){
 const {category}=await searchParams;
 const db=await supabaseServer();
 let title="Something for everyone.";
 let products:{id:string;title:string;slug:string;description:string|null;price_lkr:number|null;image_url:string|null;stock_qty:number;status:string}[]=[];
 if(db){
  let query=db.from("products").select("id,title,slug,description,price_lkr,image_url,stock_qty,status").eq("status","published").order("created_at",{ascending:false}).limit(40);
  if(category){
   const {data:cat}=await db.from("categories").select("id,name").eq("slug",category).eq("is_visible",true).maybeSingle();
   if(cat){query=query.eq("category_id",cat.id);title=cat.name;}
   else return <section className="wrap section"><h1 className="page-title">Collection not found.</h1><Link href="/shop">Browse all collections</Link></section>;
  }
  const {data}=await query;products=data||[];
 }
 return <section className="wrap section"><p className="eyebrow">THE COLLECTION</p><h1 className="page-title">{title}</h1>
  <p className="lede">Books, stationery, creative essentials and gifts.</p>
  {!products.length?<div className="empty"><h2>Our shelves are being filled.</h2><p>Our catalogue is being prepared. Need something now?</p><Link className="btn primary" href="/quotes">Request a quotation</Link></div>:
   <div className="products">{products.map(p=><article key={p.id} className="product">
    <div className="product-photo">{p.image_url?<img src={p.image_url} alt={p.title}/>:<span>pusthaya.lk</span>}</div>
    <div className="product-info"><h3>{p.title}</h3><p>{p.description}</p>
     <strong>{p.price_lkr===null?"Ask for price":`LKR ${Number(p.price_lkr).toLocaleString("en-LK")}`}</strong>
     <p className="stock-label">{p.stock_qty>0?`${p.stock_qty} available`:"Out of stock"}</p>
     <AddToCart product={{id:p.id,title:p.title,priceLkr:p.price_lkr===null?null:Number(p.price_lkr),imageUrl:p.image_url,stockQty:p.stock_qty,status:p.status}}/>
    </div>
   </article>)}</div>}
 </section>;
}
