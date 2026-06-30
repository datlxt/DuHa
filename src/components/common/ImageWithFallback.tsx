import { ImageOff, Maximize2, X } from "lucide-react";
import { useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

export function ImageWithFallback({ src, alt, className = "", fallbackLabel = "Ảnh không còn khả dụng" }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <button
        type="button"
        className="group relative block w-full overflow-hidden rounded-lg text-left"
        onClick={() => setOpen(true)}
        title="Bấm để xem ảnh lớn"
      >
        <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-burgundy opacity-0 shadow-sm transition group-hover:opacity-100">
          <Maximize2 size={16} />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative max-h-[92vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full bg-white p-2 text-charcoal shadow-lg hover:bg-ivory"
              onClick={() => setOpen(false)}
              title="Đóng"
            >
              <X size={20} />
            </button>
            <img className="max-h-[92vh] w-full rounded-xl object-contain shadow-2xl" src={src} alt={alt} />
          </div>
        </div>
      ) : null}
    </>
  );
}
