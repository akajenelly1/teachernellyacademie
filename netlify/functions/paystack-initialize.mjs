import {json,sbAdmin,parseBody,origin} from "./_shared.mjs";
export async function handler(event){
 if(event.httpMethod!=="POST")return json({ok:false,message:"Method not allowed"},405);
 if(!process.env.PAYSTACK_SECRET_KEY)return json({ok:false,message:"Paystack is not configured yet."},500);
 const b=parseBody(event),amount=Number(b.amount);
 if(!b.email||!Number.isFinite(amount)||amount<=0)return json({ok:false,message:"Valid email and amount are required."},400);
 const reference=`TN-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
 const payload={email:b.email,amount:String(Math.round(amount*100)),currency:"NGN",reference,callback_url:`${origin(event)}/payment-success.html`,metadata:{plan:b.plan||"premium"}};
 const r=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,"Content-Type":"application/json"},body:JSON.stringify(payload)});
 const d=await r.json();
 if(!r.ok||!d.status)return json({ok:false,message:d.message||"Paystack could not initialize the transaction."},502);
 const {error}=await sbAdmin().from("payments").insert({email:b.email,plan:b.plan||"premium",amount:amount,status:"initialized",reference});
 if(error)return json({ok:false,message:"Payment started but could not be recorded."},500);
 return json({ok:true,authorization_url:d.data.authorization_url,reference});
}