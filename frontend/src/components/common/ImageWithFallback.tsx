import { ChevronLeft, ChevronRight, ImageOff, Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import { PointerEvent, useRef, useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  // Optional gallery to browse inside the viewer (e.g. the 2-3 AI variations).
  images?: string[];
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

export function ImageWithFallback({ src, alt, className = "", fallbackLabel = "Ảnh không còn khả dụng", images }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const gallery = images && images.length ? images : src ? [src] : [];
  const hasMultiple = gallery.length > 1;

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

  const current = gallery[index] ?? src;

  function openViewer() {
    const start = Math.max(0, gallery.indexOf(src ?? ""));
    setIndex(start);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setOpen(true);
  }

  function goTo(next: number) {
    if (!gallery.length) return;
    const wrapped = (next + gallery.length) % gallery.length;
    setIndex(wrapped);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  function resetView() {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }

  function zoomBy(delta: number) {
    setZoom((currentZoom) => {
      const next = clamp(Number((currentZoom + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
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
        {hasMultiple ? (
          <span className="absolute left-2 top-2 rounded-full bg-burgundy/90 px-2 py-1 text-xs font-semibold text-white shadow-sm">
            {gallery.length} mẫu
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-charcoal/85 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative mx-auto flex h-[92vh] max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-charcoal shadow-lg">
                {alt}{hasMultiple ? ` · Mẫu ${index + 1}/${gallery.length}` : ""} · {Math.round(zoom * 100)}%
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
                src={current}
                alt={alt}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: dragRef.current ? "none" : "transform 120ms ease-out",
                }}
              />

              {hasMultiple ? (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-charcoal shadow-lg hover:bg-white"
                    onClick={() => goTo(index - 1)}
                    title="Mẫu trước"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-charcoal shadow-lg hover:bg-white"
                    onClick={() => goTo(index + 1)}
                    title="Mẫu sau"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
            </div>

            {hasMultiple ? (
              <div className="flex items-center justify-center gap-2">
                {gallery.map((url, idx) => (
                  <button
                    type="button"
                    key={url}
                    onClick={() => goTo(idx)}
                    className={`h-14 w-20 overflow-hidden rounded-md border-2 transition ${idx === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={url} alt={`Mẫu ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
