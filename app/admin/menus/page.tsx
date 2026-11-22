import AdminCollection from "@/components/admin-collection";
import {requireStaff} from "@/lib/auth";
export default async function Menus(){const {db,role}=await requireStaff();if(!["owner","manager","editor"].includes(role))return <p>Access restricted.</p>;const {data}=await db.from("navigation_items").select("id,label,href,is_visible").order("sort_order");return <><p className="eyebrow">SITE NAVIGATION</p><h1 className="page-title">Navigation menus.</h1><AdminCollection kind="navigation_items" initial={data||[]}/></>}
