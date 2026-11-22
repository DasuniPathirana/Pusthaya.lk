"use client";
import {useState,type FormEvent} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";
type Cat={id:string;name:string};
type Product={id:string;title:string;slug:string;description:string|null;price_lkr:number|null;stock_qty:number;category_id:string|null;image_url:string|null;status:"draft"|"published"};
const blank={title:"",slug:"",description:"",price_lkr:"",stock_qty:"0",category_id:"",image_url:"",status:"draft"};
export default function ProductEditor({initial,categories}:{initial:Product[];categories:Cat[]}){
 const [items,setItems]=useState(initial);const [form,setForm]=useState(blank);
 const [editing,setEditing]=useState<string|null>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 const update=(k:keyof typeof blank,v:string)=>setForm(s=>({...s,[k]:v}));
 function start(item:Product){setEditing(item.id);setForm({title:item.title,slug:item.slug,description:item.description||"",price_lkr:item.price_lkr==null?"":String(item.price_lkr),stock_qty:String(item.stock_qty),category_id:item.category_id||"",image_url:item.image_url||"",status:item.status});window.scrollTo({top:0,behavior:"smooth"});}
 function reset(){setEditing(null);setForm(blank);}
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  const slug=form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g,"-");
  const payload={title:form.title.trim(),slug,description:form.description||null,price_lkr:form.price_lkr?Number(form.price_lkr):null,stock_qty:Number(form.stock_qty),category_id:form.category_id||null,image_url:form.image_url||null,status:form.status};
  try{const db=supabaseBrowser();const response=editing?await db.from("products").update(payload).eq("id",editing).select("*").single():await db.from("products").insert(payload).select("*").single();
   if(response.error)throw response.error;
   const product=response.data as Product;
   setItems(old=>editing?old.map(p=>p.id===editing?product:p):[product,...old]);
   setMessage(editing?"Product updated.":"Product created.");reset();
  }catch(error){setMessage(error instanceof Error?error.message:"Saving failed");}finally{setBusy(false);}
 }
 async function remove(id:string){if(!confirm("Delete this product permanently?"))return;setBusy(true);setMessage("");
  try{const db=supabaseBrowser();const {error}=await db.from("products").delete().eq("id",id);if(error)throw error;setItems(items.filter(p=>p.id!==id));setMessage("Product deleted.");}
  catch(error){setMessage(error instanceof Error?error.message:"Deletion failed");}finally{setBusy(false);}
 }
 return <div className="admin-panel"><h2>{editing?"Edit product":"Add a product"}</h2>
 <form onSubmit={save} className="product-editor">
 <label>Product name<input required value={form.title} onChange={e=>{update("title",e.target.value);if(!editing)update("slug",e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g,"-"));}}/></label>
 <label>URL slug<input required value={form.slug} onChange={e=>update("slug",e.target.value)}/></label>
 <label>Category<select value={form.category_id} onChange={e=>update("category_id",e.target.value)}><option value="">Uncategorised</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 <label>Price (LKR)<input type="number" min="0" step=".01" value={form.price_lkr} onChange={e=>update("price_lkr",e.target.value)}/></label>
 <label>Stock<input type="number" min="0" step="1" value={form.stock_qty} onChange={e=>update("stock_qty",e.target.value)}/></label>
 <label>Status<select value={form.status} onChange={e=>update("status",e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>
 <label className="wide">Image URL (temporary, uploads coming later)<input type="url" placeholder="https://..." value={form.image_url} onChange={e=>update("image_url",e.target.value)}/></label>
 <label className="wide">Description<textarea rows={3} value={form.description} onChange={e=>update("description",e.target.value)}/></label>
 <div className="actions wide"><button className="btn primary" disabled={busy} type="submit">{busy?"Saving...":editing?"Save changes":"Add product"}</button>{editing&&<button className="btn outline" type="button" onClick={reset}>Cancel</button>}</div>
 </form>{message&&<p role="status">{message}</p>}
 <h2 style={{marginTop:35}}>Your products</h2><div className="admin-rows">{items.map(p=><div className="admin-row" key={p.id}><span><strong>{p.title}</strong><small>{p.status} · {p.price_lkr===null?"Ask for price":"LKR "+p.price_lkr} · stock {p.stock_qty}</small></span><div className="actions"><button className="mini-btn" onClick={()=>start(p)}>Edit</button><button className="mini-btn" disabled={busy} onClick={()=>void remove(p.id)}>Delete</button></div></div>)}</div>
 </div>;
}
