import {json} from "./_shared.mjs";
export async function handler(){return json({supabaseUrl:process.env.SUPABASE_URL,supabaseAnonKey:process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY})}
