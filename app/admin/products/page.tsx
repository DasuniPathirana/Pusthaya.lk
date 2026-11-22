import {requireStaff} from "@/lib/auth";
import ProductEditor from "@/components/product-editor";
export default async function Products(){const {db,role}=await requireStaff();if(!["owner","manager","editor"].includes(role))return <p>Access restricted.</p>;
 const [products,categories]=await Promise.all([db.from("products").select("id,title,slug,description,price_lkr,stock_qty,category_id,image_url,status").order("created_at",{ascending:false}),db.from("categories").select("id,name").order("sort_order")]);
 return <><p className="eyebrow">CATALOGUE</p><h1 className="page-title">Products.</h1><ProductEditor initial={(products.data||[]) as Parameters<typeof ProductEditor>[0]["initial"]} categories={categories.data||[]}/></>}
