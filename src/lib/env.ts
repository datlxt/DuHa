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
    isPlaceholder(rawUrl) ? "Thiếu VITE_SUPABASE_URL thật trong file .env." : "",
    rawUrl && !isValidSupabaseUrl(rawUrl) ? "VITE_SUPABASE_URL không đúng định dạng https://xxxxx.supabase.co." : "",
    isPlaceholder(rawAnonKey) ? "Thiếu VITE_SUPABASE_ANON_KEY thật trong file .env." : "",
  ].filter(Boolean),
};

export function requireSupabaseConfigured() {
  if (!supabaseEnv.isConfigured) {
    throw new Error(`Chưa cấu hình Supabase: ${supabaseEnv.issues.join(" ")}`);
  }
}

export function readableError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Có lỗi xảy ra, vui lòng thử lại.";
}
