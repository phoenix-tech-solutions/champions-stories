import { createClient } from "supabase";
import "https://deno.land/x/dotenv@v3.0.0/load.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
