"""Generate the PWA icons. Requires Pillow: pip install pillow"""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
S = 2048  # supersampled canvas
SCALE = S / 512


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def gradient(size, start, end):
    small = Image.new("RGB", (256, 256))
    pixels = small.load()
    for y in range(256):
        for x in range(256):
            pixels[x, y] = lerp(start, end, (x + y) / 510)
    return small.resize((size, size), Image.Resampling.BICUBIC)


def make_icon(rounded: bool) -> Image.Image:
    bg = gradient(S, (49, 46, 129), (11, 16, 32))
    if rounded:
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, S - 1, S - 1], radius=round(112 * SCALE), fill=255
        )
        icon = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        icon.paste(bg, (0, 0), mask)
    else:
        icon = bg.convert("RGBA")

    draw = ImageDraw.Draw(icon)

    # Gradient clock ring, drawn as small arc segments.
    pad = round(146 * SCALE)
    bbox = [S / 2 - pad, S / 2 - pad, S / 2 + pad, S / 2 + pad]
    width = round(30 * SCALE)
    segments = 72
    for i in range(segments):
        t0 = i / segments
        t1 = (i + 1) / segments
        color = lerp((129, 140, 248), (34, 211, 238), (t0 + t1) / 2)
        draw.arc(bbox, t0 * 360 - 90, t1 * 360 - 90, fill=color, width=width)

    # Clock hands with rounded caps.
    hand_width = round(28 * SCALE)
    points = [
        (S / 2, round(166 * SCALE)),
        (S / 2, round(256 * SCALE)),
        (round(324 * SCALE), round(300 * SCALE)),
    ]
    draw.line(points, fill="white", width=hand_width, joint="curve")
    r = hand_width // 2
    for x, y in points:
        draw.ellipse([x - r, y - r, x + r, y + r], fill="white")

    # Center pin.
    r = round(16 * SCALE)
    draw.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r], fill="white")

    return icon


def main():
    icons_dir = ROOT / "public" / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    standard = make_icon(rounded=True)
    maskable = make_icon(rounded=False)

    standard.resize((192, 192), Image.Resampling.LANCZOS).save(
        icons_dir / "icon-192.png", optimize=True
    )
    standard.resize((512, 512), Image.Resampling.LANCZOS).save(
        icons_dir / "icon-512.png", optimize=True
    )
    maskable.resize((512, 512), Image.Resampling.LANCZOS).save(
        icons_dir / "icon-maskable-512.png", optimize=True
    )
    standard.resize((180, 180), Image.Resampling.LANCZOS).save(
        ROOT / "public" / "apple-touch-icon.png", optimize=True
    )
    print("Generated app icons in public/ and public/icons/")


if __name__ == "__main__":
    main()
