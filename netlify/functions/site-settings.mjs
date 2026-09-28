import {json,requireAdmin,sbAdmin} from "./_shared.mjs";
export async function handler(event){
  const db=sbAdmin();
  if(event.httpMethod==="GET"){
    const {data,error}=await db.from("site_settings").select("key,value");
    if(error)return json({ok:false,message:error.message},500);
    const settings=Object.fromEntries((data||[]).map(x=>[x.key,x.value]));
    return json({ok:true,settings});
  }
  if(event.httpMethod==="POST"){
    try{await requireAdmin(event)}catch(e){return json({ok:false,message:e.message},403)}
    let body={};try{body=JSON.parse(event.body||"{}")}catch{}
    const allowed=["welcome_eyebrow","welcome_title","welcome_text","welcome_button"];
    for(const key of allowed){if(body[key]!==undefined){const value=String(body[key]).trim();if(!value)continue;const {error}=await db.from("site_settings").upsert({key,value,updated_at:new Date().toISOString()});if(error)return json({ok:false,message:error.message},500)}}
    return json({ok:true,message:"Welcome banner updated."});
  }
  return json({ok:false,message:"Method not allowed"},405);
}
