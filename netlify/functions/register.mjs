import {json,sbAdmin,parseBody} from "./_shared.mjs";
export async function handler(event){
 if(event.httpMethod!=="POST")return json({ok:false,message:"Method not allowed"},405);
 const b=parseBody(event); for(const k of ["child_name","parent_name","email","phone","level"])if(!String(b[k]||"").trim())return json({ok:false,message:`${k} is required`},400);
 const db=sbAdmin();
 let vip_until=null;
 const {data:payments}=await db.from("payments").select("plan,paid_at,status").ilike("email",String(b.email).trim()).eq("status","success").order("paid_at",{ascending:false}).limit(1);
 if(payments?.[0]?.paid_at){const days=payments[0].plan==="starter"?30:payments[0].plan==="plus"?90:365;const until=new Date(new Date(payments[0].paid_at).getTime()+days*86400000);if(until>new Date())vip_until=until.toISOString();}
 const {error}=await db.from("students").insert({child_name:b.child_name,parent_name:b.parent_name,email:b.email,phone:b.phone,level:b.level,programme:b.programme||"Regular Learning",notes:b.notes||null,vip_until});
 if(error)return json({ok:false,message:"Registration could not be saved."},500);
 return json({ok:true,message:vip_until?"Registration submitted successfully. Your matching Premium access is active.":"Registration submitted successfully. The academy will contact you soon."});
}