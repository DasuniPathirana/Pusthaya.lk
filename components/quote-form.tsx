"use client";
import {useState,type FormEvent} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";
const types=["School books","Stationery","Printing","Personalised gifts","Bulk orders","Office / event","Other"];
export default function QuoteForm(){
 const [category,setCategory]=useState(types[0]);
 const [details,setDetails]=useState("");
 const [quantity,setQuantity]=useState(1);
 const [message,setMessage]=useState("");
 const [pending,setPending]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage("");setPending(true);
  try{
   const db=supabaseBrowser();
   const {data:{user}}=await db.auth.getUser();
   if(!user){setMessage("Please sign in before requesting a quotation.");return;}
   const {error}=await db.from("quotations").insert({customer_id:user.id,category,details,quantity});
   if(error)throw error;
   setDetails("");setQuantity(1);setMessage("Quotation request submitted successfully.");
  }catch(err){setMessage(err instanceof Error?err.message:"Submission failed.");}finally{setPending(false);}
 }
 return <form className="form-card" onSubmit={submit}><h2>Request a quotation</h2><label>What do you need?<select value={category} onChange={e=>setCategory(e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select></label><label>Describe your request<textarea required minLength={12} maxLength={3000} rows={6} value={details} onChange={e=>setDetails(e.target.value)} placeholder="Items, grades, materials, sizes, colour preferences, deadlines..."/></label><label>Quantity<input required type="number" min={1} max={100000} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label><button className="btn primary" disabled={pending} type="submit">{pending?"Sending...":"Submit request"}</button>{message&&<p role="status" className="form-message">{message}</p>}</form>;
}
