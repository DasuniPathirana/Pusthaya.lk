import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
export type Role="owner"|"manager"|"editor"|"fulfilment"|"customer";
export async function requireStaff() {
 const db=await supabaseServer();
 if(!db) redirect("/sign-in");
 const {data:{user}}=await db.auth.getUser();
 if(!user) redirect("/sign-in");
 const {data}=await db.from("user_roles").select("role").eq("user_id",user.id).single();
 const role=data?.role as Role | undefined;
 if(!role || role==="customer") redirect("/");
 return { db,user,role };
}
