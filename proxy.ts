import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
export async function proxy(request: NextRequest) {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url || !key || key.startsWith("YOUR-"))return NextResponse.next({request});
 let response=NextResponse.next({request});
 const db=createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll();},
  setAll(toSet){
   toSet.forEach(({name,value})=>request.cookies.set(name,value));
   response=NextResponse.next({request});
   toSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  }
 }});
 await db.auth.getUser();
 return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
