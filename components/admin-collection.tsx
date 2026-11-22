"use client";
import {useState} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";
type RecordItem={id:string;name?:string;label?:string;slug?:string;href?:string;is_visible?:boolean};
export default function AdminCollection({kind,initial}:{kind:"categories"|"navigation_items",initial:RecordItem[]}){
 const [items,setItems]=useState(initial),[name,setName]=useState(""),[slug,setSlug]=useState(""),[message,setMessage]=useState("");
 async function add(){setMessage("");try{
 const db=supabaseBrowser();const value=kind==="categories"?{name,slug:slug.trim().toLowerCase().replace(/[^a-z0-9-]/g,"-"),description:"",accent:"#D8E3F2"}:{label:name,href:slug.startsWith("/")?slug:"/"+slug,location:"both"};
 const {data,error}=await db.from(kind).insert(value).select().single();if(error)throw error;setItems([...items,data]);setName("");setSlug("");
 }catch(e){setMessage(e instanceof Error?e.message:"Save failed");}}
 async function toggle(item:RecordItem){setMessage("");const db=supabaseBrowser();const {error}=await db.from(kind).update({is_visible:!item.is_visible}).eq("id",item.id);if(error)setMessage(error.message);else setItems(items.map(x=>x.id===item.id?{...x,is_visible:!x.is_visible}:x));}
 return <div className="admin-panel"><form onSubmit={e=>{e.preventDefault();void add();}} className="inline-form"><label>{kind==="categories"?"Category name":"Menu label"}<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>{kind==="categories"?"URL slug":"Destination /path"}<input required value={slug} onChange={e=>setSlug(e.target.value)}/></label><button className="btn primary" type="submit">Add {kind==="categories"?"category":"menu item"}</button></form>{message&&<p role="status">{message}</p>}<div className="admin-rows">{items.map(item=><div key={item.id} className="admin-row"><span><strong>{item.name||item.label}</strong><small>{item.slug||item.href}</small></span><button type="button" className="mini-btn" onClick={()=>void toggle(item)}>{item.is_visible?"Hide":"Show"}</button></div>)}</div></div>;
}
