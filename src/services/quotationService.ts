import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";
import type { CreateQuotationInput, Quotation } from "../types";

export async function getQuotations(userId: string): Promise<Quotation[]> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("quotations").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createQuotation(userId: string, input: CreateQuotationInput): Promise<Quotation> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("quotations").insert({ ...input, user_id: userId }).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateQuotation(id: string, input: Partial<CreateQuotationInput>): Promise<Quotation> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("quotations").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteQuotation(id: string): Promise<void> {
  requireSupabaseConfigured();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
