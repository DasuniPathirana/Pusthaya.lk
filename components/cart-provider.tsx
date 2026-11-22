"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";

export type CartProduct={
 id:string; title:string; priceLkr:number|null; imageUrl:string|null;
 stockQty:number; status?:string;
};
export type CartLine={product:CartProduct;quantity:number};
type CartMode="guest"|"account";
type CartContextValue={
 items:CartLine[];count:number;subtotal:number;mode:CartMode;
 loading:boolean;busy:boolean;error:string;
 add:(product:CartProduct)=>Promise<boolean>;
 changeQuantity:(productId:string,quantity:number)=>Promise<void>;
 remove:(productId:string)=>Promise<void>;
 clearError:()=>void;
};
const CartContext=createContext<CartContextValue|null>(null);
const STORAGE_KEY="pusthaya-guest-cart-v1";
const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const idPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readGuest():CartLine[]{
 if(typeof window==="undefined")return [];
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
  if(!Array.isArray(saved))return [];
  return saved.filter((line:CartLine)=>line && line.product &&
   typeof line.product.id==="string" && idPattern.test(line.product.id) &&
   typeof line.product.title==="string" &&
   (line.product.priceLkr===null || (typeof line.product.priceLkr==="number" && Number.isFinite(line.product.priceLkr) && line.product.priceLkr>=0)) &&
   Number.isInteger(line.quantity) && line.quantity>0 && line.quantity<=99)
   .slice(0,100);
 }catch{return [];}
}
function writeGuest(items:CartLine[]){if(typeof window!=="undefined")localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}
function upsertGuest(lines:CartLine[],product:CartProduct,quantity:number):CartLine[]{
 if(quantity<=0)return lines.filter(l=>l.product.id!==product.id);
 const capped=Math.min(99,Math.max(1,Math.min(quantity,product.stockQty)));
 const exists=lines.some(l=>l.product.id===product.id);
 return exists?lines.map(l=>l.product.id===product.id?{product,quantity:capped}:l):[...lines,{product,quantity:capped}];
}
export function money(value:number){return "LKR "+value.toLocaleString("en-LK",{minimumFractionDigits:2,maximumFractionDigits:2});}

export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartLine[]>([]);
 const [mode,setMode]=useState<CartMode>("guest");
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 const loadAccount=useCallback(async(userId:string):Promise<CartLine[]>=>{
  const db=supabaseBrowser();
  const {data,error:dbError}=await db.from("cart_items")
   .select("product_id,quantity,products(id,title,price_lkr,image_url,stock_qty,status)")
   .eq("user_id",userId).order("created_at",{ascending:true});
  if(dbError)throw dbError;
  return (data||[]).map((record:any)=>{
   const product=Array.isArray(record.products)?record.products[0]:record.products;
   return {
    product:product?{
     id:record.product_id,title:product.title,priceLkr:product.price_lkr===null?null:Number(product.price_lkr),
     imageUrl:product.image_url||null,stockQty:Number(product.stock_qty)||0,status:product.status
    }:{id:record.product_id,title:"Unavailable product",priceLkr:null,imageUrl:null,stockQty:0,status:"unavailable"},
    quantity:Number(record.quantity)
   } as CartLine;
  });
 },[]);

 const initialise=useCallback(async()=>{
  const guest=readGuest();
  if(!configured){setMode("guest");setItems(guest);setLoading(false);return;}
  try{
   const db=supabaseBrowser();
   const {data:{user},error:authError}=await db.auth.getUser();
   if(authError)throw authError;
   if(!user){setMode("guest");setItems(guest);return;}
   setMode("account");
   if(guest.length){
    // Recheck the product's CURRENT price, status and stock before merging old guest lines.
    for(const line of guest){
     const {data:product}=await db.from("products").select("id,stock_qty,price_lkr,status").eq("id",line.product.id).eq("status","published").maybeSingle();
     if(!product || product.price_lkr===null || !product.stock_qty)continue;
     const {data:existing}=await db.from("cart_items").select("quantity").eq("user_id",user.id).eq("product_id",line.product.id).maybeSingle();
     const quantity=Math.min(99,Number(product.stock_qty),Number(existing?.quantity||0)+line.quantity);
     if(quantity<1)continue;
     const {error:mergeError}=await db.from("cart_items").upsert({user_id:user.id,product_id:line.product.id,quantity},{onConflict:"user_id,product_id"});
     if(mergeError)throw mergeError;
    }
    localStorage.removeItem(STORAGE_KEY);
   }
   setItems(await loadAccount(user.id));
  }catch(e){
   setError(e instanceof Error?e.message:"Unable to load cart");
   // Never overwrite a signed-in cart on an authentication or database error.
   setItems(guest);
  }finally{setLoading(false);}
 },[loadAccount]);

 useEffect(()=>{void initialise();},[initialise]);
 useEffect(()=>{
  if(!configured)return;
  const db=supabaseBrowser();
  const {data:{subscription}}=db.auth.onAuthStateChange(event=>{
   if(event==="SIGNED_IN" || event==="SIGNED_OUT")void initialise();
  });
  return ()=>subscription.unsubscribe();
 },[initialise]);

 const add=useCallback(async(product:CartProduct):Promise<boolean>=>{
  setError("");
  if(product.priceLkr===null || product.status==="draft" || product.stockQty<1){setError("This item is not available to add to your cart.");return false;}
  setBusy(true);
  try{
   if(configured){
    const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();
    if(user){
     const {data:existing,error:readError}=await db.from("cart_items").select("quantity").eq("user_id",user.id).eq("product_id",product.id).maybeSingle();
     if(readError)throw readError;
     const quantity=Math.min(99,product.stockQty,Number(existing?.quantity||0)+1);
     if(quantity<=Number(existing?.quantity||0)){setError("You already have the available quantity in your cart.");return false;}
     const {error:saveError}=await db.from("cart_items").upsert({user_id:user.id,product_id:product.id,quantity},{onConflict:"user_id,product_id"});
     if(saveError)throw saveError;
     setMode("account");setItems(await loadAccount(user.id));return true;
    }
   }
   const guest=upsertGuest(readGuest(),product,Math.min(99,(readGuest().find(l=>l.product.id===product.id)?.quantity||0)+1));
   writeGuest(guest);setMode("guest");setItems(guest);return true;
  }catch(e){setError(e instanceof Error?e.message:"Could not add item");return false;}
  finally{setBusy(false);}
 },[loadAccount]);

 const changeQuantity=useCallback(async(productId:string,quantity:number)=>{
  setError("");setBusy(true);
  try{
   const line=items.find(i=>i.product.id===productId);
   if(!line)return;
   if(quantity<=0){
    if(configured){const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(user){
     const {error:dbError}=await db.from("cart_items").delete().eq("user_id",user.id).eq("product_id",productId);
     if(dbError)throw dbError;setItems(await loadAccount(user.id));return;
    }}
    const guest=readGuest().filter(l=>l.product.id!==productId);writeGuest(guest);setItems(guest);return;
   }
   const capped=Math.min(99,quantity,line.product.stockQty);
   if(capped<1){setError("This item is out of stock. Please remove it.");return;}
   if(configured){const db=supabaseBrowser();const {data:{user}}=await db.auth.getUser();if(user){
    const {error:dbError}=await db.from("cart_items").update({quantity:capped}).eq("user_id",user.id).eq("product_id",productId);
    if(dbError)throw dbError;setItems(await loadAccount(user.id));return;
   }}
   const guest=upsertGuest(readGuest(),line.product,capped);writeGuest(guest);setItems(guest);
  }catch(e){setError(e instanceof Error?e.message:"Could not update quantity");}
  finally{setBusy(false);}
 },[items,loadAccount]);

 const value=useMemo<CartContextValue>(()=>({
  items,count:items.reduce((sum,line)=>sum+line.quantity,0),
  subtotal:items.reduce((sum,line)=>sum+(line.product.priceLkr||0)*line.quantity,0),
  mode,loading,busy,error,add,changeQuantity,remove:async id=>changeQuantity(id,0),
  clearError:()=>setError("")
 }),[items,mode,loading,busy,error,add,changeQuantity]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("useCart must be used within CartProvider");return value;}
