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

const supabaseUrl = valueOf("VITE_SUPABASE_URL");
const supabaseAnonKey = valueOf("VITE_SUPABASE_ANON_KEY");
const openaiKey = valueOf("OPENAI_API_KEY");
const viteOpenAIKey = valueOf("VITE_OPENAI_API_KEY");

const checks = [
  ["has_supabase_url", Boolean(supabaseUrl)],
  ["supabase_url_format", /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(supabaseUrl)],
  ["has_anon_key", Boolean(supabaseAnonKey)],
  ["anon_key_format", supabaseAnonKey.startsWith("eyJ") || supabaseAnonKey.startsWith("sb_publishable_")],
  ["has_openai_key", Boolean(openaiKey)],
  ["openai_key_not_exposed_to_frontend", !viteOpenAIKey],
];

let ok = true;
for (const [name, passed] of checks) {
  if (!passed) ok = false;
  console.log(`${passed ? "OK" : "MISSING"} ${name}`);
}

if (!ok) {
  console.log("\nFill .env, save the file, then restart npm run dev.");
  process.exit(1);
}

console.log("\nEnvironment shape looks good. Values were not printed.");
