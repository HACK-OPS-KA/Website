#!/usr/bin/env python3
"""Build assets/floor.json and the gallery section for floor.html from assets/photos."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / "assets" / "photos"

# Not published on the public floor gallery (same as homepage mock).
SKIP = frozenset({"op002_18"})

OPS = (
    ("op003", "OP003", "Karlsruhe", "op003", "#e8c877", "#0b0b0c"),
    ("op0k4", "OP0K4", "Karlsruhe · Game Jam", "gamejam", "#ff6b4a", "#1d1d1b"),
    ("op0m4", "OP0M4", "München · Game Jam", "gamejam", "#179970", "#ffffff"),
    ("op002", "OP002", "Stuttgart", "op002", "#9670ff", "#ffffff"),
)


def op_key(name: str) -> str:
    if name.startswith("op003_"):
        return "op003"
    if name.startswith("op002_"):
        return "op002"
    if name.startswith("karlsruhe_"):
        return "op0k4"
    if name.startswith("muenchen_"):
        return "op0m4"
    return "other"


def op_code(key: str) -> str:
    return {"op003": "OP003", "op002": "OP002", "op0k4": "OP0K4", "op0m4": "OP0M4"}.get(key, "OP")


def collect() -> dict[str, list[dict]]:
    buckets: dict[str, list[dict]] = {k: [] for k, *_ in OPS}
    for folder in ("op003", "op002", "gamejam"):
        if not (PHOTOS / folder).is_dir():
            continue
        for path in sorted((PHOTOS / folder).glob("*-800.webp")):
            stem = path.name[: -len("-800.webp")]
            if stem in SKIP:
                continue
            key = op_key(stem)
            if key not in buckets:
                continue
            buckets[key].append(
                {
                    "id": stem,
                    "src": f"/assets/photos/{folder}/{path.name}",
                    "code": op_code(key),
                }
            )
    for key in buckets:
        buckets[key].sort(key=lambda p: p["id"])
    return buckets


def frame(photo: dict) -> str:
    return (
        f'<figure class="m11-frame floor-frame">'
        f'<span class="m11-edge">{photo["code"]}</span>'
        f'<img src="{photo["src"]}" alt="" loading="lazy" width="800" height="533" />'
        f"</figure>"
    )


def strip_row(photos: list[dict]) -> str:
    inner = "".join(frame(p) for p in photos)
    return (
        f'<div class="floor-strip m11-strip">'
        f'<div class="m11-holes"></div>'
        f'<div class="m11-track floor-track">{inner}</div>'
        f'<div class="m11-holes"></div>'
        f"</div>"
    )


def gallery_html(buckets: dict[str, list[dict]]) -> str:
    chips = ['<button type="button" class="floor-chip is-on" data-floor-op="all">All</button>']
    sections: list[str] = []
    total = 0
    for key, code, place, _folder, accent, on in OPS:
        photos = buckets[key]
        if not photos:
            continue
        total += len(photos)
        chips.append(
            f'<button type="button" class="floor-chip" data-floor-op="{key}" '
            f'style="--chip-accent:{accent};--chip-on:{on}">{code}</button>'
        )
        sections.append(
            f'<section class="floor-op" id="{key}" data-floor-op="{key}" '
            f'style="--op-accent:{accent}">'
            f'<div class="hp-wrap floor-op-head">'
            f'<h2 class="floor-op-title hp-pixel">{code}</h2>'
            f'<p class="floor-op-meta">{place} · <span>{len(photos)}</span> photos</p>'
            f"</div>"
            f"{strip_row(photos)}"
            f"</section>"
        )
    nav = (
        f'<nav class="floor-filter" aria-label="Filter by op">'
        f'<div class="hp-wrap floor-filter-in">{"".join(chips)}</div>'
        f"</nav>"
    )
    return total, nav + "\n" + "\n".join(sections)


def main() -> None:
    buckets = collect()
    manifest = {
        "total": sum(len(v) for v in buckets.values()),
        "skip": sorted(SKIP),
        "ops": [
            {
                "id": key,
                "code": code,
                "place": place,
                "count": len(buckets[key]),
                "photos": buckets[key],
            }
            for key, code, place, *_ in OPS
        ],
    }
    (ROOT / "assets" / "floor.json").write_text(json.dumps(manifest, indent=2) + "\n")

    total, body = gallery_html(buckets)
    manifest["total"] = total
    (ROOT / "assets" / "floor.json").write_text(json.dumps(manifest, indent=2) + "\n")

    floor_html = ROOT / "floor.html"
    text = floor_html.read_text()
    start = "        <!-- floor-gallery:start -->\n"
    end = "        <!-- floor-gallery:end -->"
    i0 = text.index(start) + len(start)
    i1 = text.index(end)
    floor_html.write_text(text[:i0] + body + "\n        " + text[i1:])
    print(f"ok · {total} photos · assets/floor.json · floor.html gallery")


if __name__ == "__main__":
    main()