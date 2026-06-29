from pathlib import Path
from uuid import uuid4

import streamlit as st

from services.advisor import generate_design_advice
from services.image_generator import generate_mock_image


BASE_DIR = Path(__file__).resolve().parent
ROOM_UPLOAD_DIR = BASE_DIR / "uploads" / "rooms"
TILE_UPLOAD_DIR = BASE_DIR / "uploads" / "tiles"

STYLE_OPTIONS = [
    "Hiện đại",
    "Tối giản",
    "Ấm áp",
    "Sang trọng",
    "Nhà phố Việt Nam",
]


def ensure_directories() -> None:
    ROOM_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    TILE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_uploaded_file(uploaded_file, target_dir: Path) -> Path:
    suffix = Path(uploaded_file.name).suffix.lower() or ".jpg"
    output_path = target_dir / f"{uuid4().hex}{suffix}"

    with output_path.open("wb") as file:
        file.write(uploaded_file.getbuffer())

    return output_path


def render_intro() -> None:
    st.set_page_config(
        page_title="DuHa - AI phối cảnh gạch",
        page_icon="🏠",
        layout="wide",
    )

    st.title("DuHa")
    st.subheader("Thử gạch hôm nay, thấy nhà ngày mai")
    st.write(
        "DuHa giúp bạn chụp ảnh phòng mộc và mẫu gạch để tạo phối cảnh phòng "
        "hoàn thiện, gợi ý màu tường và nội thất phù hợp trước khi quyết định mua gạch."
    )


def main() -> None:
    ensure_directories()
    render_intro()

    st.divider()

    left_col, right_col = st.columns(2)
    with left_col:
        st.markdown("### 1. Upload ảnh phòng mộc")
        room_file = st.file_uploader(
            "Chọn ảnh phòng mộc/chưa hoàn thiện",
            type=["jpg", "jpeg", "png", "webp"],
            key="room_file",
        )

    with right_col:
        st.markdown("### 2. Upload ảnh mẫu gạch")
        tile_file = st.file_uploader(
            "Chọn ảnh mẫu gạch",
            type=["jpg", "jpeg", "png", "webp"],
            key="tile_file",
        )

    st.markdown("### 3. Chọn phong cách thiết kế")
    style = st.selectbox("Phong cách", STYLE_OPTIONS)

    st.markdown("### 4. Tạo phối cảnh")
    generate_clicked = st.button("✨ Tạo phối cảnh với DuHa", type="primary")

    if generate_clicked:
        if room_file is None or tile_file is None:
            st.error("Vui lòng upload đầy đủ ảnh phòng mộc và ảnh mẫu gạch trước khi tạo phối cảnh.")
            return

        try:
            room_path = save_uploaded_file(room_file, ROOM_UPLOAD_DIR)
            tile_path = save_uploaded_file(tile_file, TILE_UPLOAD_DIR)

            with st.spinner("DuHa đang tạo bản phối cảnh minh họa..."):
                output_path = Path(generate_mock_image(str(room_path), str(tile_path), style))
                advice = generate_design_advice(style)

            st.session_state["duha_result"] = {
                "room_path": str(room_path),
                "tile_path": str(tile_path),
                "output_path": str(output_path),
                "advice": advice,
                "style": style,
            }
            st.success("Đã tạo phối cảnh minh họa.")
        except Exception as exc:
            st.error(f"Không thể tạo phối cảnh: {exc}")

    result = st.session_state.get("duha_result")
    if not result:
        st.info("Upload 2 ảnh, chọn phong cách rồi bấm tạo phối cảnh để xem kết quả demo.")
        return

    st.markdown("### 5. Kết quả và tư vấn")
    result_cols = st.columns(3)
    with result_cols[0]:
        st.image(result["room_path"], caption="Ảnh phòng gốc", use_container_width=True)
    with result_cols[1]:
        st.image(result["tile_path"], caption="Ảnh mẫu gạch", use_container_width=True)
    with result_cols[2]:
        st.image(result["output_path"], caption="Ảnh phối cảnh minh họa", use_container_width=True)

    st.markdown("#### Tư vấn phối màu/nội thất")
    st.text(result["advice"])

    output_path = Path(result["output_path"])
    with output_path.open("rb") as file:
        st.download_button(
            label="Tải ảnh kết quả",
            data=file,
            file_name=output_path.name,
            mime="image/jpeg",
        )

    st.caption(
        "Ảnh phối cảnh được tạo bởi AI nhằm mục đích minh họa. Màu sắc và tỷ lệ thực tế "
        "có thể thay đổi tùy ánh sáng, thiết bị chụp và quá trình thi công."
    )


if __name__ == "__main__":
    main()
