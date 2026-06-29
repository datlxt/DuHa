from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageDraw, ImageFont, UnidentifiedImageError


BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "outputs" / "generated"


def _load_font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def _resize_to_width(image: Image.Image, width: int = 1000) -> Image.Image:
    if image.width <= width:
        return image.copy()

    ratio = width / image.width
    height = max(1, int(image.height * ratio))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def generate_mock_image(room_image_path: str, tile_image_path: str, style: str) -> str:
    """Create a v1 mock preview from room and tile images."""
    room_path = Path(room_image_path)
    tile_path = Path(tile_image_path)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    try:
        with Image.open(room_path) as room_source:
            room = _resize_to_width(room_source.convert("RGB"))

        with Image.open(tile_path) as tile_source:
            tile = tile_source.convert("RGB")
            tile.thumbnail((180, 180), Image.Resampling.LANCZOS)
    except FileNotFoundError as exc:
        raise ValueError("Khong tim thay anh phong hoac anh mau gach.") from exc
    except UnidentifiedImageError as exc:
        raise ValueError("File upload khong phai la anh hop le.") from exc
    except OSError as exc:
        raise ValueError("Khong the xu ly anh. Vui long thu anh JPG/PNG khac.") from exc

    draw = ImageDraw.Draw(room, "RGBA")
    panel_height = min(190, max(130, room.height // 4))
    draw.rounded_rectangle(
        (24, 24, room.width - 24, panel_height),
        radius=18,
        fill=(255, 255, 255, 224),
        outline=(214, 202, 184, 255),
        width=2,
    )

    title_font = _load_font(32)
    body_font = _load_font(20)
    small_font = _load_font(16)

    draw.text((48, 44), "DuHa AI Preview", fill=(32, 38, 46), font=title_font)
    draw.text((48, 88), f"Style: {style}", fill=(76, 83, 94), font=body_font)
    draw.text(
        (48, 120),
        "Tile sample applied in future AI version",
        fill=(103, 96, 88),
        font=small_font,
    )

    padding = 18
    thumb_x = room.width - tile.width - 48
    thumb_y = max(44, panel_height - tile.height - padding)
    draw.rounded_rectangle(
        (
            thumb_x - 8,
            thumb_y - 8,
            thumb_x + tile.width + 8,
            thumb_y + tile.height + 8,
        ),
        radius=12,
        fill=(248, 246, 242, 255),
        outline=(200, 188, 168, 255),
        width=2,
    )
    room.paste(tile, (thumb_x, thumb_y))

    output_path = OUTPUT_DIR / f"duha-preview-{uuid4().hex}.jpg"
    room.save(output_path, format="JPEG", quality=92, optimize=True)
    return str(output_path)
