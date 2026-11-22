import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata={title:"pusthaya.lk | Books, stationery & thoughtful gifts",description:"School books, everyday stationery, gifts and custom quotations in one place."};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><div className="topbar">For the curious, the creative and the everyday.</div>
 <header className="header"><Link href="/" className="logo">pusthaya<span>.lk</span></Link><nav aria-label="Main navigation"><Link href="/shop">Shop</Link><Link href="/books">School books</Link><Link href="/quotes">Custom quotations</Link><Link href="/admin">Admin</Link></nav><Link className="account-link" href="/sign-in">My account</Link></header>
 <main>{children}</main><footer className="footer"><strong>pusthaya.lk</strong><p>Books, stationery, printing, gifts and everything in between.</p><small>Prices and inventory are being prepared for launch.</small></footer></body></html>;
}
