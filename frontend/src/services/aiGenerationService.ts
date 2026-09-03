import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured, supabaseEnv } from "../lib/env";
import type { Project } from "../types";

export type GenerateResult = {
  project: Project;
  variants?: number;
  warnings: string[];
};

export async function generateVisualization(projectId: string, signal?: AbortSignal): Promise<GenerateResult> {
  requireSupabaseConfigured();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${supabaseEnv.url}/functions/v1/generate-visualization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseEnv.anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ project_id: projectId }),
    signal,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 546) {
      throw new Error("AI render bi ngat do Edge Function chay qua lau. Vui long thu lai voi anh nho hon hoac tao lai phuong an.");
    }
    throw new Error(data?.error ?? `Edge Function loi ${response.status}.`);
  }

  if (!data?.project) throw new Error("AI render did not return a project result.");

  return {
    project: data.project as Project,
    variants: typeof data.variants === "number" ? data.variants : undefined,
    warnings: Array.isArray(data.warnings) ? (data.warnings as string[]) : [],
  };
}
