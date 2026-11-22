"use client";
import Link from "next/link";
import {ShoppingBag} from "lucide-react";
import {useCart} from "@/components/cart-provider";
export default function CartIndicator(){
 const {count}=useCart();
 return <Link href="/cart" className="cart-nav-link" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19} strokeWidth={1.8}/><span>Bag</span>{count>0&&<span className="cart-badge">{count>99?"99+":count}</span>}</Link>;
}
