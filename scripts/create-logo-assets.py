#!/usr/bin/env python3
"""Generate Swapio logo assets at Riot Shop sizes with rounded corners."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "Swapio Logo.png"
OUT_DIR = ROOT / "assets"

# iOS-style icon corner radius (~22.37% of edge length)
CORNER_RATIO = 0.2237
MASTER_SIZE = 1080
SIZES = {
    "logo.png": 1080,
    "logo-512.png": 512,
    "logo-180.png": 180,
    "logo-32.png": 32,
}


def rounded_mask(size: int) -> Image.Image:
    radius = max(4, int(size * CORNER_RATIO))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def make_logo(size: int) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")
    src = src.resize((size, size), Image.Resampling.LANCZOS)
    mask = rounded_mask(size)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source logo: {SRC}")

    for filename, size in SIZES.items():
        logo = make_logo(size)
        out_path = OUT_DIR / filename
        logo.save(out_path, "PNG", optimize=True)
        print(f"OK {out_path} ({size}x{size})")


if __name__ == "__main__":
    main()