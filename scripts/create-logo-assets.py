#!/usr/bin/env python3
"""Generate crisp Swapio logo assets with Riot Shop–matching rounded corners."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "Swapio Logo.png"
OUT_DIR = ROOT / "assets"
RIOT_MASK_REF = ROOT.parent / "Riot Shop" / "assets" / "logo-180.png"
MASTER_SIZE = 1080
CORNER_RATIO = 0.2102

SIZES = {
    "logo.png": 1080,
    "logo-512.png": 512,
    "logo-256.png": 256,
    "logo-180.png": 180,
    "logo-128.png": 128,
    "logo-64.png": 64,
    "logo-48.png": 48,
    "logo-32.png": 32,
    "logo-16.png": 16,
}

ICO_SIZES = [256, 128, 64, 48, 32, 16]


def rounded_mask(size: int) -> Image.Image:
    if RIOT_MASK_REF.exists():
        ref_alpha = Image.open(RIOT_MASK_REF).convert("RGBA").split()[3]
        if size == 180:
            return ref_alpha
        return ref_alpha.resize((size, size), Image.Resampling.LANCZOS)

    radius = max(2, round(size * CORNER_RATIO))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def load_square_source() -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    w, h = src.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(src, ((side - w) // 2, (side - h) // 2))
    return canvas


def compose_logo(fitted: Image.Image, size: int) -> Image.Image:
    scaled = fitted.resize((size, size), Image.Resampling.LANCZOS)
    mask = rounded_mask(size)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(scaled, (0, 0), mask)
    return out


def sharpen_small_icon(image: Image.Image, size: int) -> Image.Image:
    if size > 64:
        return image
    return image.filter(ImageFilter.UnsharpMask(radius=0.8, percent=180, threshold=2))


def downscale_from_master(master: Image.Image, size: int) -> Image.Image:
    if size == MASTER_SIZE:
        return master.copy()

    current = master.copy()
    while current.size[0] // 2 >= size * 1.5:
        next_size = max(size, current.size[0] // 2)
        current = current.resize((next_size, next_size), Image.Resampling.LANCZOS)

    if current.size[0] != size:
        current = current.resize((size, size), Image.Resampling.LANCZOS)

    return sharpen_small_icon(current, size)


def build_master() -> Image.Image:
    fitted = load_square_source().resize((MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS)
    mask = rounded_mask(180).resize((MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS)
    master = Image.new("RGBA", (MASTER_SIZE, MASTER_SIZE), (0, 0, 0, 0))
    master.paste(fitted, (0, 0), mask)
    return master


def save_favicon(master: Image.Image) -> None:
    frames = [downscale_from_master(master, size) for size in ICO_SIZES]
    ico_path = OUT_DIR / "favicon.ico"
    frames[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
        append_images=frames[1:],
    )
    print(f"OK {ico_path} ({', '.join(str(s) for s in ICO_SIZES)}px)")


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source logo: {SRC}")

    master = build_master()

    for filename, size in SIZES.items():
        logo = downscale_from_master(master, size)
        out_path = OUT_DIR / filename
        logo.save(out_path, "PNG", optimize=True)
        print(f"OK {out_path} ({size}x{size})")

    save_favicon(master)


if __name__ == "__main__":
    main()