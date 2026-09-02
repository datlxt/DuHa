import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";
import type { CreateCustomerInput, Customer } from "../types";

export async function getCustomers(userId: string): Promise<Customer[]> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("customers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCustomer(userId: string, input: CreateCustomerInput): Promise<Customer> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("customers").insert({ ...input, user_id: userId }).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(id: string, input: Partial<CreateCustomerInput>): Promise<Customer> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("customers").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  requireSupabaseConfigured();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
