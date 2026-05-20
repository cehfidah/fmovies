#!/usr/bin/env python3
"""
Extract slug → TMDB ID / IMDB ID mappings from downloaded Wayback archive.
Outputs: slug_mappings.json  (used by Next.js at runtime)
"""
import os, re, json
from pathlib import Path

ARCHIVE = Path("wayback_archive/fmoviesz.cyou")
DIRS = {"movie": ARCHIVE / "fmovies-movie", "series": ARCHIVE / "fmovies-series"}
OUT = Path("lib/slug_mappings.json")

RE_FAV = re.compile(r"addFavorite\('(tt[\w]+)',\s*'(\d+)',\s*'(\w+)'")
RE_TITLE = re.compile(r"<title>(.+?)</title>")

mappings = {}

for media_type, base_dir in DIRS.items():
    if not base_dir.exists():
        print(f"[skip] {base_dir} not found")
        continue
    for slug_dir in sorted(base_dir.iterdir()):
        if not slug_dir.is_dir():
            continue
        html_file = slug_dir / "index.html"
        if not html_file.exists():
            continue
        try:
            content = html_file.read_text(encoding="utf-8", errors="replace")
        except Exception as e:
            print(f"[err] {slug_dir.name}: {e}")
            continue

        m = RE_FAV.search(content)
        if not m:
            continue

        imdb_id   = m.group(1)   # e.g. tt10548174
        tmdb_id   = int(m.group(2))
        item_type = m.group(3)   # movie or series/tv

        # Normalise type
        media = "movie" if item_type == "movie" else "tv"

        # Extract clean title from <title>
        t = RE_TITLE.search(content)
        raw_title = t.group(1) if t else slug_dir.name
        # "Watch Movie 28 Years Later (2025) on Fmovies..." → "28 Years Later (2025)"
        clean = re.sub(r"^Watch (?:Movie|Series)\s+", "", raw_title)
        clean = re.sub(r"\s+on Fmovies.*$", "", clean).strip()

        mappings[slug_dir.name] = {
            "tmdb_id":    tmdb_id,
            "imdb_id":    imdb_id,
            "media_type": media,
            "title":      clean,
        }
        print(f"  {media:<6} {slug_dir.name:<50} tmdb={tmdb_id}")

OUT.parent.mkdir(parents=True, exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(mappings, f, indent=2, ensure_ascii=False)

print(f"\n✓ Extracted {len(mappings)} slugs → {OUT}")
