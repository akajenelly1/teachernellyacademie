import {json,sbAdmin,parseBody} from "./_shared.mjs";
export async function handler(event){
 if(event.httpMethod!=="POST")return json({ok:false,message:"Method not allowed"},405);
 const b=parseBody(event); for(const k of ["parent_name","email","message"])if(!String(b[k]||"").trim())return json({ok:false,message:`${k} is required`},400);
 const {error}=await sbAdmin().from("inquiries").insert({parent_name:b.parent_name,email:b.email,phone:b.phone||null,topic:b.topic||"General inquiry",message:b.message});
 if(error)return json({ok:false,message:"Inquiry could not be saved."},500);
 return json({ok:true,message:"Your inquiry has been sent successfully."});
}