import { createClient } from "@supabase/supabase-js";
export const json=(body,status=200)=>({statusCode:status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"},body:JSON.stringify(body)});
const secret=()=>process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishable=()=>process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY;
export const sbAdmin=()=>createClient(process.env.SUPABASE_URL,secret(),{auth:{autoRefreshToken:false,persistSession:false}});
export const sbPublic=()=>createClient(process.env.SUPABASE_URL,publishable(),{auth:{autoRefreshToken:false,persistSession:false}});
export async function requireAdmin(event){
 const h=event.headers?.authorization||event.headers?.Authorization||"";
 if(!h.startsWith("Bearer "))throw new Error("Missing authorization");
 const token=h.slice(7); const admin=sbAdmin(); const {data,error}=await admin.auth.getUser(token);
 if(error||!data?.user)throw new Error("Invalid session");
 if((data.user.email||"").toLowerCase()!==(process.env.ADMIN_EMAIL||"").toLowerCase())throw new Error("Not authorised");
 return data.user;
}
export function parseBody(event){try{return JSON.parse(event.body||"{}")}catch{return {}}}
export function origin(event){return process.env.SITE_URL||`https://${event.headers?.host||""}`} 
