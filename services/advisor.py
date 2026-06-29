STYLE_ADVICE = {
    "Hiện đại": {
        "wall": "Tường trắng, ghi nhạt hoặc trắng kem để giữ không gian sáng và gọn.",
        "furniture": "Sofa xám, be hoặc đen nhẹ; bàn trà nên dùng gỗ sáng màu, kim loại đen hoặc kính.",
        "lighting": "Ánh sáng trung tính 3500K-4000K giúp màu gạch nhìn đúng và hiện đại.",
        "small_room": "Nếu phòng nhỏ hoặc thiếu sáng, hạn chế rèm và nội thất quá tối màu.",
        "sales": "Mẫu phối này giúp không gian nhìn gọn, sáng và hiện đại hơn.",
    },
    "Tối giản": {
        "wall": "Tường trắng ấm, kem nhạt hoặc ghi rất nhạt để nền gạch không bị rối.",
        "furniture": "Nội thất ít chi tiết, ưu tiên be, xám sáng, gỗ tự nhiên và đường nét gọn.",
        "lighting": "Dùng ánh sáng ấm nhẹ đến trung tính, tránh đèn màu quá vàng hoặc quá lạnh.",
        "small_room": "Phòng nhỏ nên giảm đồ trang trí, chỉ giữ các món thật sự cần thiết.",
        "sales": "Cách phối tối giản giúp khách dễ thấy vẻ đẹp của gạch mà không bị rối mắt.",
    },
    "Ấm áp": {
        "wall": "Tường kem, be, nâu nhạt hoặc trắng ngà tạo cảm giác gần gũi.",
        "furniture": "Sofa be, nâu, caramel; có thể thêm gỗ tự nhiên và vải thô mềm.",
        "lighting": "Ánh sáng vàng nhẹ 3000K-3500K làm phòng ấm hơn vào buổi tối.",
        "small_room": "Nếu phòng thiếu sáng, dùng be sáng thay vì nâu đậm để tránh bị nặng phòng.",
        "sales": "Tông ấm áp này phù hợp phòng khách gia đình, nhìn dễ ở và bền gu theo thời gian.",
    },
    "Sang trọng": {
        "wall": "Tường trắng ngà, ghi sáng hoặc màu trung tính để làm nền cho gạch và nội thất.",
        "furniture": "Có thể dùng da, kim loại, kính và mặt bàn đá, nhưng tiết chế để không bị phô.",
        "lighting": "Nên có ánh sáng điểm nhấn ở trần, vách tường hoặc khu vực sofa.",
        "small_room": "Phòng nhỏ nên chọn vật liệu bóng vừa phải và tránh quá nhiều chi tiết vàng.",
        "sales": "Phương án này tạo cảm giác cao cấp nhưng vẫn thực tế cho nhà ở hằng ngày.",
    },
    "Nhà phố Việt Nam": {
        "wall": "Tường trắng kem, ghi nhạt hoặc be sáng để dễ thi công và hợp nhiều kiểu nội thất.",
        "furniture": "Sofa be, xám, nâu; bàn ghế nên bền, dễ vệ sinh và phù hợp sinh hoạt gia đình.",
        "lighting": "Kết hợp ánh sáng tự nhiên với đèn trung tính để phòng khách sáng mà không lạnh.",
        "small_room": "Nhà phố thiếu sáng nên ưu tiên màu tường sáng, rèm mỏng và hạn chế gạch quá tối.",
        "sales": "Mẫu phối này dễ ứng dụng cho nhà phố, chung cư và phòng khách gia đình Việt Nam.",
    },
}


def generate_design_advice(style: str) -> str:
    advice = STYLE_ADVICE.get(style, STYLE_ADVICE["Nhà phố Việt Nam"])

    return "\n".join(
        [
            f"Tư vấn phối cảnh theo phong cách {style}:",
            f"- Màu tường: {advice['wall']}",
            f"- Sofa/bàn ghế: {advice['furniture']}",
            f"- Ánh sáng: {advice['lighting']}",
            f"- Lưu ý phòng nhỏ/thiếu sáng: {advice['small_room']}",
            f"- Câu chốt sales: \"{advice['sales']}\"",
        ]
    )
