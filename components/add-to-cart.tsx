"use client";
import {useState} from "react";
import Link from "next/link";
import {useCart,type CartProduct} from "@/components/cart-provider";

export default function AddToCart({product}:{product:CartProduct}){
 const {add,loading,busy}=useCart();
 const [added,setAdded]=useState(false);
 const available=product.priceLkr!==null && product.stockQty>0 && product.status!=="draft";
 if(!available)return <Link href="/quotes" className="btn outline cart-add-btn">Request a quotation</Link>;
 return <button type="button" className="btn primary cart-add-btn" disabled={loading||busy}
 onClick={async()=>{const ok=await add(product);if(ok){setAdded(true);setTimeout(()=>setAdded(false),1800);}}}>{added?"Added to bag":"Add to bag"}</button>;
}
