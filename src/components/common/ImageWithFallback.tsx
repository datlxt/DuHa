import { ImageOff } from "lucide-react";
import { useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

export function ImageWithFallback({ src, alt, className = "", fallbackLabel = "Ảnh không còn khả dụng" }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

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

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}
