import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";
import type { CreateTileInput, Tile } from "../types";

export async function getTiles(userId: string): Promise<Tile[]> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("tiles").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTile(userId: string, input: CreateTileInput): Promise<Tile> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("tiles").insert({ ...input, user_id: userId }).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTile(id: string, input: Partial<CreateTileInput>): Promise<Tile> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("tiles").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTile(id: string): Promise<void> {
  requireSupabaseConfigured();
  const { error } = await supabase.from("tiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
