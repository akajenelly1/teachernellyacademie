import {json,sbAdmin,parseBody} from "./_shared.mjs";
export async function handler(event){
 if(event.httpMethod!=="POST")return json({ok:false,message:"Method not allowed"},405);
 const b=parseBody(event); const email=String(b.email||"").trim(); const child=String(b.child_name||"").trim();
 if(!email)return json({ok:false,message:"Parent email is required."},400);
 let q=sbAdmin().from("students").select("child_name,level,programme,vip_until").ilike("email",email).limit(10);
 if(child) q=q.ilike("child_name",child);
 const {data,error}=await q;
 if(error||!data?.length)return json({ok:false,message:"No matching learner record was found. Please check the email and learner name."},404);
 const active=data.some(x=>x.vip_until&&new Date(x.vip_until)>new Date());
 const learner=data.find(x=>x.vip_until&&new Date(x.vip_until)>new Date())||data[0];
 return json({ok:true,active,child_name:learner.child_name,level:learner.level,programme:learner.programme,message:`${learner.child_name} is registered for ${learner.level}. Premium access: ${active?"ACTIVE until "+new Date(learner.vip_until).toLocaleDateString():"not currently active"}.`});
}