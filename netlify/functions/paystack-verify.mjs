import {json,sbAdmin} from "./_shared.mjs";
export async function handler(event){
 const ref=event.queryStringParameters?.reference;if(!ref)return json({ok:false,message:"Missing payment reference."},400);
 if(!process.env.PAYSTACK_SECRET_KEY)return json({ok:false,message:"Paystack is not configured."},500);
 const r=await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`}});
 const d=await r.json(); if(!r.ok||!d.status)return json({ok:false,message:"Unable to verify transaction."},502);
 const t=d.data; if(t.status!=="success")return json({ok:false,message:`Payment status: ${t.status}. No premium access has been activated.`});
 const plan=t.metadata?.plan||"premium", days=plan==="starter"?30:plan==="plus"?90:365, until=new Date(Date.now()+days*86400000).toISOString();
 const db=sbAdmin();
 await db.from("payments").update({status:"success",paystack_id:String(t.id),paid_at:new Date().toISOString()}).eq("reference",ref);
 if(t.customer?.email) await db.from("students").update({vip_until:until}).ilike("email",t.customer.email);
 return json({ok:true,message:"Payment verified successfully. Premium access has been activated for matching learner records."});
}