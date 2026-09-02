import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

const supabaseUrl = supabaseEnv.isConfigured ? supabaseEnv.url : "https://placeholder.supabase.co";
const supabaseAnonKey = supabaseEnv.isConfigured ? supabaseEnv.anonKey : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
