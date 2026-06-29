import { AlertTriangle } from "lucide-react";
import { supabaseEnv } from "../../lib/env";

export function SupabaseSetupNotice() {
  if (supabaseEnv.isConfigured) return null;

  return (
    <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 shrink-0" size={18} />
        <div>
          <p className="font-semibold">Chưa cấu hình Supabase thật</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {supabaseEnv.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <p className="mt-2">
            Tạo file <code>.env</code>, điền URL và anon key thật, chạy SQL trong <code>supabase/schema.sql</code>, rồi restart <code>npm run dev</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
