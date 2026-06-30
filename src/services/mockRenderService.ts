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
  const tileSize = Math.max(150, Math.round(canvasWidth / 5.5));
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = tileSize;
  patternCanvas.height = tileSize;
  const patternCtx = patternCanvas.getContext("2d");
  if (!patternCtx) throw new Error("Trình duyệt không hỗ trợ canvas.");

  const cropSize = Math.min(tileImage.width, tileImage.height);
  const cropX = Math.round((tileImage.width - cropSize) / 2);
  const cropY = Math.round((tileImage.height - cropSize) / 2);
  patternCtx.drawImage(tileImage, cropX, cropY, cropSize, cropSize, 0, 0, tileSize, tileSize);

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

  ctx.globalAlpha = 0.82;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, floorTop, canvasWidth, canvasHeight - floorTop);

  const gradient = ctx.createLinearGradient(0, floorTop, 0, canvasHeight);
  gradient.addColorStop(0, "rgba(255,255,255,0.28)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.08)");
  gradient.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, floorTop, canvasWidth, canvasHeight - floorTop);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  for (let x = -tileSize; x < canvasWidth + tileSize; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, floorTop);
    ctx.lineTo(x + tileSize * 0.55, canvasHeight);
    ctx.stroke();
  }
  for (let y = floorTop; y < canvasHeight + tileSize; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

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

  return canvas.toDataURL("image/jpeg", 0.88);
}
