import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";

const BUCKET = "duha-images";

function safeName(fileName: string) {
  return fileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadImage(file: File, userId: string, folder: "rooms" | "tiles" | "results") {
  requireSupabaseConfigured();
  const path = `${folder}/${userId}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(`Không thể upload ảnh: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadRoomImage = (file: File, userId: string) => uploadImage(file, userId, "rooms");
export const uploadTileImage = (file: File, userId: string) => uploadImage(file, userId, "tiles");
export const uploadResultImage = (file: File, userId: string) => uploadImage(file, userId, "results");
