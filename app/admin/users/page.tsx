import {requireStaff} from "@/lib/auth";
import RoleManager from "@/components/role-manager";
export default async function Users(){
 const {db,role,user}=await requireStaff();
 if(role!=="owner") return <p>You don't have permission to manage account roles.</p>;
 const {data:roles,error}=await db.from("user_roles").select("user_id,role,profiles(display_name)").order("role");
 if(error)return <p>Unable to load users: {error.message}</p>;
 const accounts=(roles||[]).map(item=>({user_id:item.user_id,role:item.role as "owner"|"manager"|"editor"|"fulfilment"|"customer",display_name:(Array.isArray(item.profiles)?item.profiles[0]?.display_name:(item.profiles as {display_name?:string|null}|null)?.display_name)??null}));
 return <><p className="eyebrow">ACCOUNT SECURITY</p><h1 className="page-title">User roles.</h1><RoleManager accounts={accounts} currentUserId={user.id}/></>;
}
