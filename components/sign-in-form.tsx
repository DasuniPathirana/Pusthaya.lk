"use client";
import {useState,type FormEvent} from "react";
import {supabaseBrowser} from "@/lib/supabase/browser";
export default function SignInForm(){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [register,setRegister]=useState(false);const [message,setMessage]=useState("");const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setLoading(true);setMessage("");
 try{const db=supabaseBrowser();const result=register?await db.auth.signUp({email,password}):await db.auth.signInWithPassword({email,password});
 if(result.error)throw result.error;
 if(register)setMessage("Please check your email to confirm your account.");
 else window.location.href="/admin";
 }catch(e){setMessage(e instanceof Error?e.message:"Something went wrong.");}finally{setLoading(false);}}
 return <form className="form-card auth-card" onSubmit={submit}><h2>{register?"Create account":"Sign in"}</h2><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={loading} type="submit" className="btn primary">{loading?"Please wait":register?"Create account":"Sign in"}</button><button type="button" className="text-action" onClick={()=>{setRegister(!register);setMessage("");}}>{register?"Already registered? Sign in":"New here? Create an account"}</button>{message&&<p role="status">{message}</p>}</form>;
}
