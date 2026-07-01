#!/usr/bin/env python3
"""Generate Swapio logo assets with Riot Shop–matching rounded app-icon corners."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "Swapio Logo.png"
OUT_DIR = ROOT / "assets"
RIOT_MASK_REF = ROOT.parent / "Riot Shop" / "assets" / "logo-180.png"

# Fallback if Riot reference is unavailable (~227px radius at 1080px)
CORNER_RATIO = 0.2102

SIZES = {
    "logo.png": 1080,
    "logo-512.png": 512,
    "logo-180.png": 180,
    "logo-32.png": 32,
    "logo-16.png": 16,
}


def rounded_mask(size: int) -> Image.Image:
    if RIOT_MASK_REF.exists():
        ref_alpha = Image.open(RIOT_MASK_REF).convert("RGBA").split()[3]
        return ref_alpha.resize((size, size), Image.Resampling.LANCZOS)

    radius = max(2, round(size * CORNER_RATIO))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def make_logo(size: int) -> Image.Image:
    src = Image.open(SRC).convert("RGBA")

    # Fit square source on transparent canvas, then scale
    w, h = src.size
    side = max(w, h)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    offset = ((side - w) // 2, (side - h) // 2)
    canvas.paste(src, offset)

    fitted = canvas.resize((size, size), Image.Resampling.LANCZOS)
    mask = rounded_mask(size)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(fitted, (0, 0), mask)
    return out


def save_favicon() -> None:
    sizes = [16, 32, 48]
    images = [make_logo(s) for s in sizes]
    ico_path = OUT_DIR / "favicon.ico"
    images[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    print(f"OK {ico_path}")


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source logo: {SRC}")

    for filename, size in SIZES.items():
        logo = make_logo(size)
        out_path = OUT_DIR / filename
        logo.save(out_path, "PNG", optimize=True)
        print(f"OK {out_path} ({size}x{size})")

    save_favicon()


if __name__ == "__main__":
    main()