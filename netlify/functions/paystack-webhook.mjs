import crypto from "node:crypto";
import {json,sbAdmin} from "./_shared.mjs";
export async function handler(event){
 if(event.httpMethod!=="POST")return json({ok:false},405);
 const secret=process.env.PAYSTACK_SECRET_KEY;if(!secret)return json({ok:false},500);
 const raw=event.body||"",signature=event.headers?.["x-paystack-signature"]||event.headers?.["X-Paystack-Signature"]||"";
 const hash=crypto.createHmac("sha512",secret).update(raw).digest("hex");
 if(!signature||!crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(signature)))return json({ok:false},401);
 let e;try{e=JSON.parse(raw)}catch{return json({ok:false},400)}
 if(e.event==="charge.success"){
   const t=e.data,ref=t.reference,plan=t.metadata?.plan||"premium",days=plan==="starter"?30:plan==="plus"?90:365,until=new Date(Date.now()+days*86400000).toISOString();
   const db=sbAdmin();
   await db.from("payments").upsert({email:t.customer?.email||"",plan,amount:Number(t.amount||0)/100,status:"success",reference:ref,paystack_id:String(t.id),paid_at:new Date().toISOString()},{onConflict:"reference"});
   if(t.customer?.email) await db.from("students").update({vip_until:until}).ilike("email",t.customer.email);
 }
 return json({ok:true});
}