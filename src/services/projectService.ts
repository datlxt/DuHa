import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";
import type { CreateProjectInput, Project } from "../types";

export async function getProjects(userId: string, limit?: number): Promise<Project[]> {
  requireSupabaseConfigured();
  let query = supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("projects").insert({ ...input, user_id: userId }).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProject(id: string, input: Partial<CreateProjectInput>): Promise<Project> {
  requireSupabaseConfigured();
  const { data, error } = await supabase.from("projects").update({ ...input, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  requireSupabaseConfigured();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
