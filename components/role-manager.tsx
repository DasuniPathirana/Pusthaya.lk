"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Role = "owner"|"manager"|"editor"|"fulfilment"|"customer";
type Account = {user_id:string; role:Role; display_name:string | null};
const roles: Role[]=["owner","manager","editor","fulfilment","customer"];

export default function RoleManager({accounts,currentUserId}:{accounts:Account[];currentUserId:string}){
 const [rows,setRows]=useState(accounts);
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState("");
 async function assign(userId:string,role:Role){
  if(userId===currentUserId){setMessage("You cannot change your own Owner role here.");return;}
  setBusy(userId);setMessage("");
  try {
   const db=supabaseBrowser();
   const {error}=await db.from("user_roles").update({role}).eq("user_id",userId);
   if(error)throw error;
   setRows(old=>old.map(item=>item.user_id===userId?{...item,role}:item));
   setMessage("Role updated successfully.");
  } catch(e){setMessage(e instanceof Error?e.message:"Unable to change role");}
  finally{setBusy(null);}
 }
 return <div className="admin-panel"><p>Only the Owner can change account permissions. New accounts are Customers by default.</p><div className="admin-rows">{rows.map(account=><div className="admin-row" key={account.user_id}><span><strong>{account.display_name||"Account"}</strong><small>{account.user_id}</small></span><select aria-label="Assigned role" disabled={busy===account.user_id||account.user_id===currentUserId} value={account.role} onChange={e=>void assign(account.user_id,e.target.value as Role)}>{roles.map(role=><option value={role} key={role}>{role}</option>)}</select></div>)}</div>{message&&<p role="status">{message}</p>}</div>;
}
