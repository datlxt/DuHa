import { supabase } from "../lib/supabase";
import { requireSupabaseConfigured } from "../lib/env";

const BUCKET = "duha-images";

function safeName(fileName: string) {
  return fileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
}

function fileBaseName(fileName: string) {
  return safeName(fileName).replace(/\.[^.]+$/, "") || "duha-image";
}

async function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không thể tối ưu ảnh trước khi upload."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function optimizeImageForUpload(file: File, folder: "rooms" | "tiles" | "results") {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const maxDimension = folder === "tiles" ? 1400 : 1600;
  const quality = folder === "tiles" ? 0.95 : 0.9;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

  if (scale >= 1 && file.size <= 1_800_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas, quality);
  return new File([blob], `${fileBaseName(file.name)}-optimized.jpg`, { type: "image/jpeg" });
}

async function uploadImage(file: File, userId: string, folder: "rooms" | "tiles" | "results") {
  requireSupabaseConfigured();
  const uploadFile = await optimizeImageForUpload(file, folder);
  const path = `${folder}/${userId}/${Date.now()}-${safeName(uploadFile.name)}`;
  const { error: listError } = await supabase.storage.from(BUCKET).list(folder, { limit: 1 });

  if (listError) {
    throw new Error(
      `Không thể truy cập bucket ${BUCKET} trước khi upload: ${listError.message}. Hãy chạy lại migration storage trong supabase/migrations/ và đăng nhập lại.`,
    );
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
    cacheControl: "3600",
    contentType: uploadFile.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Không thể upload ảnh lên bucket ${BUCKET}: ${error.message}. Path thử upload: ${path}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const uploadRoomImage = (file: File, userId: string) => uploadImage(file, userId, "rooms");
export const uploadTileImage = (file: File, userId: string) => uploadImage(file, userId, "tiles");
export const uploadResultImage = (file: File, userId: string) => uploadImage(file, userId, "results");
