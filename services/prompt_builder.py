def build_image_prompt(style: str) -> str:
    return (
        "Giữ bố cục phòng gốc, giữ vị trí tường, cửa, cửa sổ và góc nhìn. "
        "Lát nền bằng mẫu gạch người dùng đã upload, giữ màu và vân gạch gần đúng nhất. "
        f"Thiết kế theo phong cách {style}, gợi ý màu tường và nội thất phù hợp. "
        "Tạo phối cảnh thực tế cho nhà Việt Nam, không quá ảo, không quá sang, "
        "không thay đổi cấu trúc phòng quá nhiều."
    )


def build_advice_prompt(style: str) -> str:
    return (
        "Bạn là trợ lý tư vấn phối cảnh cho cửa hàng gạch ốp lát. "
        f"Hãy tư vấn theo phong cách {style}: màu tường, sofa/bàn ghế, ánh sáng, "
        "và lưu ý nếu phòng nhỏ hoặc thiếu sáng. Viết bằng tiếng Việt, dễ hiểu, "
        "thực tế và phù hợp tư vấn bán hàng tại showroom."
    )
