import Link from "next/link";
import {requireStaff} from "@/lib/auth";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const {role}=await requireStaff();
 return <section className="wrap admin-layout"><aside className="admin-sidebar"><p className="eyebrow">ADMIN WORKSPACE</p><h2>Manage pusthaya.</h2><small>Signed in as {role}</small><nav><Link href="/admin">Overview</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/menus">Navigation menus</Link><Link href="/admin/products">Products</Link><Link href="/admin/quotations">Quotations</Link></nav></aside><div className="admin-main">{children}</div></section>;
}
