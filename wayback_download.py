#!/usr/bin/env python3
"""
Wayback Machine bulk downloader for fmoviesz.cyou
Downloads all archived snapshots via the CDX API.
Usage: python wayback_download.py
"""

import os
import re
import sys
import time
import json
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────
DOMAIN = "fmoviesz.cyou"
OUTPUT_DIR = Path("wayback_archive")
CDX_API = "https://web.archive.org/cdx/search/cdx"
WB_BASE = "https://web.archive.org/web"
MAX_WORKERS = 5          # parallel downloads (be polite to archive.org)
DELAY_BETWEEN = 0.5      # seconds between requests per worker
REQUEST_TIMEOUT = 30     # seconds
MAX_RETRIES = 3
# Only download these mime types (set to None to download everything)
ALLOWED_MIME = {
    "text/html",
    "text/css",
    "application/javascript",
    "text/javascript",
    "application/json",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/x-icon",
    "application/xml",
    "text/xml",
    "text/plain",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def sanitize_filename(url: str) -> Path:
    """Convert a URL to a safe relative file path under OUTPUT_DIR."""
    parsed = urllib.parse.urlparse(url)
    # Strip scheme and domain, keep path + query
    path = parsed.path.lstrip("/")
    if parsed.query:
        path += "__" + re.sub(r'[\\/:*?"<>|]', "_", parsed.query)
    if not path or path.endswith("/"):
        path += "index.html"
    elif "." not in Path(path).name:
        path += "/index.html"
    # Replace chars illegal on Windows
    path = re.sub(r'[\\:*?"<>|]', "_", path)
    return OUTPUT_DIR / parsed.netloc / path


def fetch_url(url: str, retries: int = MAX_RETRIES) -> bytes | None:
    """Download URL bytes with retry + back-off."""
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (WaybackDownloader/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                wait = 2 ** attempt
                print(f"  [rate-limit] {e.code} – waiting {wait}s …")
                time.sleep(wait)
            elif e.code == 404:
                return None  # snapshot missing, skip
            else:
                print(f"  [HTTP {e.code}] {url}")
                return None
        except Exception as e:
            if attempt < retries:
                time.sleep(2 ** attempt)
            else:
                print(f"  [error] {url}: {e}")
    return None


def get_cdx_records() -> list[dict]:
    """
    Query the CDX API for all snapshots of DOMAIN.
    Returns list of dicts with keys: timestamp, original, mimetype, statuscode.
    """
    params = urllib.parse.urlencode({
        "url": f"{DOMAIN}/*",
        "output": "json",
        "fl": "timestamp,original,mimetype,statuscode",
        "filter": "statuscode:200",
        "collapse": "urlkey",   # one snapshot per unique URL
        "limit": "100000",
    })
    cdx_url = f"{CDX_API}?{params}"
    print(f"[CDX] Querying: {cdx_url}\n")

    data = fetch_url(cdx_url)
    if not data:
        sys.exit("Failed to fetch CDX index. Check your internet connection.")

    rows = json.loads(data.decode("utf-8"))
    if not rows:
        sys.exit("No snapshots found for this domain.")

    header, *records = rows
    results = []
    for row in records:
        rec = dict(zip(header, row))
        mime = rec.get("mimetype", "").split(";")[0].strip()
        if ALLOWED_MIME and mime not in ALLOWED_MIME:
            continue
        results.append(rec)
    return results


def download_snapshot(rec: dict) -> tuple[str, str]:
    """
    Download a single Wayback snapshot and save it to disk.
    Returns (status, original_url).
    """
    ts = rec["timestamp"]
    orig = rec["original"]
    wb_url = f"{WB_BASE}/{ts}id_/{orig}"   # id_ flag = raw content, no toolbar

    dest = sanitize_filename(orig)
    if dest.exists():
        return ("skip", orig)

    time.sleep(DELAY_BETWEEN)
    data = fetch_url(wb_url)
    if data is None:
        return ("fail", orig)

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return ("ok", orig)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"=== Wayback Downloader — {DOMAIN} ===")
    print(f"Output: {OUTPUT_DIR.resolve()}\n")

    print("[1/2] Fetching CDX index …")
    records = get_cdx_records()
    total = len(records)
    print(f"      Found {total} unique snapshots (after mime filter)\n")

    if total == 0:
        print("Nothing to download.")
        return

    print(f"[2/2] Downloading with {MAX_WORKERS} workers …\n")
    ok = fail = skip = 0
    done = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(download_snapshot, rec): rec for rec in records}
        for future in as_completed(futures):
            status, url = future.result()
            done += 1
            if status == "ok":
                ok += 1
                label = "✓"
            elif status == "skip":
                skip += 1
                label = "·"
            else:
                fail += 1
                label = "✗"
            # Print progress every 10 items
            if done % 10 == 0 or done == total:
                pct = done / total * 100
                print(f"  [{pct:5.1f}%] {done}/{total}  ✓{ok}  ·{skip}  ✗{fail}")
            else:
                short = url[:80] + "…" if len(url) > 80 else url
                print(f"  {label} {short}")

    print(f"\n=== Done ===")
    print(f"  Downloaded : {ok}")
    print(f"  Skipped    : {skip}  (already existed)")
    print(f"  Failed     : {fail}")
    print(f"  Saved to   : {OUTPUT_DIR.resolve()}")

    # Write a manifest
    manifest_path = OUTPUT_DIR / "manifest.txt"
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(f"Downloaded from Wayback Machine for {DOMAIN}\n")
        f.write(f"Date: {datetime.now().isoformat()}\n")
        f.write(f"Total: {total}  OK: {ok}  Skipped: {skip}  Failed: {fail}\n\n")
        for rec in records:
            f.write(f"{rec['timestamp']}  {rec['mimetype']}  {rec['original']}\n")
    print(f"  Manifest   : {manifest_path}")


if __name__ == "__main__":
    main()
