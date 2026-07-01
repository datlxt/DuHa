import { ImageOff, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { PointerEvent, useRef, useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

type Position = {
  x: number;
  y: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.35;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ImageWithFallback({ src, alt, className = "", fallbackLabel = "Ảnh không còn khả dụng" }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-dashed border-beige bg-ivory text-center text-sm text-muted ${className}`}>
        <div>
          <ImageOff className="mx-auto mb-2" size={22} />
          <span>{fallbackLabel}</span>
        </div>
      </div>
    );
  }

  function openViewer() {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setOpen(true);
  }

  function resetView() {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  function zoomBy(delta: number) {
    setZoom((current) => {
      const next = clamp(Number((current + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
      if (next === MIN_ZOOM) setPosition({ x: 0, y: 0 });
      return next;
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPosition({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  return (
    <>
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-lg text-left"
        onClick={openViewer}
        title="Bấm để xem ảnh lớn"
      >
        <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-burgundy opacity-0 shadow-sm transition group-hover:opacity-100">
          <Maximize2 size={16} />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-charcoal/85 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative mx-auto flex h-[92vh] max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-lg">
                {alt} · {Math.round(zoom * 100)}%
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/95 p-1 shadow-lg">
                <button type="button" className="rounded-full p-2 text-charcoal hover:bg-ivory" onClick={() => zoomBy(-ZOOM_STEP)} title="Thu nhỏ">
                  <Minus size={18} />
                </button>
                <button type="button" className="rounded-full p-2 text-charcoal hover:bg-ivory" onClick={() => zoomBy(ZOOM_STEP)} title="Phóng to">
                  <Plus size={18} />
                </button>
                <button type="button" className="rounded-full p-2 text-charcoal hover:bg-ivory" onClick={resetView} title="Về mặc định">
                  <RotateCcw size={18} />
                </button>
                <button type="button" className="rounded-full p-2 text-charcoal hover:bg-ivory" onClick={() => setOpen(false)} title="Đóng">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div
              className={`relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black/20 shadow-2xl ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={(event) => {
                event.preventDefault();
                zoomBy(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
              }}
            >
              <img
                className="h-full w-full select-none object-contain"
                src={src}
                alt={alt}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: dragRef.current ? "none" : "transform 120ms ease-out",
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
