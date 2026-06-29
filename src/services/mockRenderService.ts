function loadImageFromSource(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể đọc ảnh để tạo phối cảnh."));
    image.src = typeof source === "string" ? source : URL.createObjectURL(source);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh."));
    reader.readAsDataURL(file);
  });
}

function drawTilePattern(
  ctx: CanvasRenderingContext2D,
  tileImage: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
) {
  const floorTop = Math.round(canvasHeight * 0.58);
  const tileSize = Math.max(90, Math.round(canvasWidth / 9));
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = tileSize;
  patternCanvas.height = tileSize;
  const patternCtx = patternCanvas.getContext("2d");
  if (!patternCtx) throw new Error("Trình duyệt không hỗ trợ canvas.");

  patternCtx.drawImage(tileImage, 0, 0, tileSize, tileSize);
  patternCtx.strokeStyle = "rgba(255,255,255,0.42)";
  patternCtx.lineWidth = 2;
  patternCtx.strokeRect(0, 0, tileSize, tileSize);

  const pattern = ctx.createPattern(patternCanvas, "repeat");
  if (!pattern) throw new Error("Không thể tạo mẫu gạch.");

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(Math.round(canvasWidth * 0.08), floorTop);
  ctx.lineTo(Math.round(canvasWidth * 0.92), floorTop);
  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.lineTo(0, canvasHeight);
  ctx.closePath();
  ctx.clip();

  ctx.globalAlpha = 0.88;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, floorTop, canvasWidth, canvasHeight - floorTop);

  const gradient = ctx.createLinearGradient(0, floorTop, 0, canvasHeight);
  gradient.addColorStop(0, "rgba(255,255,255,0.2)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.04)");
  gradient.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorTop, canvasWidth, canvasHeight - floorTop);

  ctx.restore();
}

export async function fileToPersistentPreview(file: File) {
  return fileToDataUrl(file);
}

export async function generateMockTileRender(roomSource: File | string, tileSource: File | string) {
  const [roomImage, tileImage] = await Promise.all([
    loadImageFromSource(roomSource),
    loadImageFromSource(tileSource),
  ]);

  const maxWidth = 1200;
  const scale = Math.min(1, maxWidth / roomImage.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(roomImage.width * scale);
  canvas.height = Math.round(roomImage.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas.");

  ctx.drawImage(roomImage, 0, 0, canvas.width, canvas.height);
  drawTilePattern(ctx, tileImage, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(122,0,19,0.86)";
  ctx.fillRect(24, 24, 210, 44);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("DuHa Preview", 42, 53);

  return canvas.toDataURL("image/jpeg", 0.88);
}
