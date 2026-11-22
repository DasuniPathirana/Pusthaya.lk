import "./globals.css";
import Link from "next/link";
import type {Metadata} from "next";
import {supabaseServer} from "@/lib/supabase/server";
import {CartProvider} from "@/components/cart-provider";
import CartIndicator from "@/components/cart-indicator";
export const metadata:Metadata={title:"pusthaya.lk | Books, stationery & thoughtful gifts",description:"School books, everyday stationery, gifts and custom quotations in one place."};
const defaults=[{href:"/shop",label:"Shop"},{href:"/books",label:"School books"},{href:"/quotes",label:"Custom quotations"}];
export default async function RootLayout({children}:{children:React.ReactNode}){
 const db=await supabaseServer();
 const {data,error}=db?await db.from("navigation_items").select("label,href").eq("is_visible",true).in("location",["header","both"]).order("sort_order"):{data:null,error:null};
 const nav=db&&!error?(data||[]):defaults;
 let staff=false;
 if(db){
  const {data:auth}=await db.auth.getUser();
  if(auth.user){
   const {data:role}=await db.from("user_roles").select("role").eq("user_id",auth.user.id).maybeSingle();
   staff=Boolean(role?.role && role.role!=="customer");
  }
 }
 return <html lang="en"><body><CartProvider>
  <div className="topbar">For the curious, the creative and the everyday.</div>
  <header className="header">
   <Link href="/" className="logo">pusthaya<span>.lk</span></Link>
   <nav aria-label="Main navigation">{nav.map((item,i)=><Link key={i} href={item.href}>{item.label}</Link>)}</nav>
   <div className="header-actions"><CartIndicator/><Link className="account-link" href="/sign-in">My account</Link>{staff&&<Link className="account-link" href="/admin">Admin</Link>}</div>
  </header>
  <main>{children}</main>
  <footer className="footer"><strong>pusthaya.lk</strong><p>Books, stationery, printing, gifts and everything in between.</p><small>Prices and inventory are being prepared for launch.</small></footer>
 </CartProvider></body></html>;
}
