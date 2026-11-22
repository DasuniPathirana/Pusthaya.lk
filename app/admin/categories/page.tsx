import AdminCollection from "@/components/admin-collection";
import {requireStaff} from "@/lib/auth";
export default async function Categories(){const {db,role}=await requireStaff();if(!["owner","manager","editor"].includes(role))return <p>Access restricted.</p>;const {data}=await db.from("categories").select("id,name,slug,is_visible").order("sort_order");return <><p className="eyebrow">CATALOGUE</p><h1 className="page-title">Categories.</h1><AdminCollection kind="categories" initial={data||[]}/></>}
