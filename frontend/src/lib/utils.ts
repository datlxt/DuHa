import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function styleAdvice(style: string) {
  const fallback = "Mẫu gạch này phù hợp với tường trắng kem hoặc ghi nhạt. Nên kết hợp sofa be/xám sáng và ánh sáng vàng nhẹ để không gian ấm, dễ chịu hơn.";
  const map: Record<string, string> = {
    "Hiện đại": "Nên dùng tường trắng, ghi nhạt hoặc trắng kem; sofa xám/be và ánh sáng trung tính để phòng gọn, sáng, hiện đại.",
    "Tối giản": "Ưu tiên tường trắng ấm, nội thất ít chi tiết, màu be/xám sáng và tránh quá nhiều điểm nhấn đậm.",
    "Ấm áp": "Tường kem, be hoặc nâu nhạt rất hợp; phối sofa caramel/gỗ tự nhiên và ánh sáng vàng nhẹ.",
    "Sang trọng": "Dùng tường trắng ngà, ghi sáng, nội thất da/kim loại/kính tiết chế cùng đèn điểm nhấn.",
    "Nhà phố Việt Nam": "Ưu tiên màu dễ thi công như trắng kem, be sáng; nội thất bền, dễ vệ sinh và ánh sáng trung tính.",
  };
  return map[style] ?? fallback;
}
