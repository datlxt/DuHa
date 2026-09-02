const rawUrl = String(import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const rawAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

function isPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return (
    !normalized ||
    normalized.includes("your_") ||
    normalized.includes("example.supabase.co") ||
    normalized.includes("dummy")
  );
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export const supabaseEnv = {
  url: rawUrl,
  anonKey: rawAnonKey,
  isConfigured: !isPlaceholder(rawUrl) && !isPlaceholder(rawAnonKey) && isValidSupabaseUrl(rawUrl),
  issues: [
    isPlaceholder(rawUrl) ? "Thieu VITE_SUPABASE_URL that trong file .env." : "",
    rawUrl && !isValidSupabaseUrl(rawUrl) ? "VITE_SUPABASE_URL khong dung dinh dang https://xxxxx.supabase.co." : "",
    isPlaceholder(rawAnonKey) ? "Thieu VITE_SUPABASE_ANON_KEY that trong file .env." : "",
  ].filter(Boolean),
};

export function requireSupabaseConfigured() {
  if (!supabaseEnv.isConfigured) {
    throw new Error(`Chua cau hinh Supabase: ${supabaseEnv.issues.join(" ")}`);
  }
}

export function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (!message) return "Co loi xay ra, vui long thu lai.";

  const normalized = message.toLowerCase();
  if (normalized.includes("incorrect api key") || normalized.includes("invalid api key")) {
    return "OpenAI API key chua hop le. Vui long kiem tra lai key trong Supabase secrets roi thu lai.";
  }
  if (normalized.includes("billing") || normalized.includes("quota") || normalized.includes("insufficient_quota")) {
    return "Tai khoan OpenAI chua san sang de tao anh. Vui long kiem tra billing/quota trong OpenAI Dashboard.";
  }
  if (normalized.includes("model") && (normalized.includes("not found") || normalized.includes("does not exist"))) {
    return "Model tao anh chua kha dung voi tai khoan OpenAI hien tai. Vui long kiem tra model trong Supabase secret.";
  }

  return message
    .replace(/sk-proj-[A-Za-z0-9_-]+/g, "sk-proj-***")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "jwt-***");
}
