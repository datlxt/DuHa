import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");

if (!existsSync(envPath)) {
  console.error("Missing .env file.");
  process.exit(1);
}

const content = readFileSync(envPath, "utf8");

function valueOf(name) {
  const match = content.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

const url = valueOf("VITE_SUPABASE_URL");
const anonKey = valueOf("VITE_SUPABASE_ANON_KEY");

if (!url || !anonKey) {
  console.error("Missing Supabase URL or anon key.");
  process.exit(1);
}

const supabase = createClient(url, anonKey);
let failed = false;

async function checkTable(table) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    failed = true;
    console.log(`FAIL table ${table}: ${error.message}`);
    return;
  }
  console.log(`OK table ${table}`);
}

async function checkStorage() {
  const { error } = await supabase.storage.from("duha-images").list("rooms", { limit: 1 });
  if (error) {
    failed = true;
    console.log(`FAIL storage duha-images: ${error.message}`);
    return;
  }
  console.log("OK storage duha-images");
}

for (const table of ["profiles", "customers", "tiles", "projects", "quotations"]) {
  await checkTable(table);
}

await checkStorage();

if (failed) {
  console.log("\nRun the SQL in supabase/migrations/ (or `supabase db push`) in your Supabase project, then retry.");
  process.exit(1);
}

console.log("\nSupabase schema and storage checks passed. Keys were not printed.");
