"""
fix_images.py — find and repair missing / broken Wikipedia image URLs.

Each event in `src/resources/World_History.json` may have:
    - "image"  : full-size image URL (usually upload.wikimedia.org)
    - "img_md" : ~640px thumbnail
    - "img_sm" : ~320px thumbnail
    - "source" : the Wikipedia article URL the event came from

Over time Wikipedia/Commons changes thumbnail URLs, so many `img_sm`/`img_md`
links 404, and some events have no image at all.

This script:
    1. Validates every existing image / thumbnail URL (HTTP HEAD).
    2. For broken thumbnails, regenerates fresh ones from the Commons file via
       the MediaWiki `imageinfo` API (which always returns a currently-valid
       thumbnail URL).
    3. For events with NO image, pulls the article's lead image via the
       `pageimages` API using the title from the "source" URL.
    4. Writes a human-readable report to `scripts/image_report.json`.
    5. With `--write`, applies the fixes back into World_History.json
       (a timestamped .bak backup is created first).

Why not Selenium?
    The MediaWiki API gives canonical, currently-valid image + thumbnail URLs
    directly as JSON, so no browser automation is needed. It is dramatically
    faster and more reliable. (If you ever need to scrape a non-Wikipedia
    source, that's where Selenium would come in — not needed here.)

Usage:
    pip install -r scripts/requirements.txt
    python scripts/fix_images.py                 # scan + report only
    python scripts/fix_images.py --limit 25      # test on first 25 events
    python scripts/fix_images.py --only-missing   # only events missing images
    python scripts/fix_images.py --write          # apply fixes to the JSON
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import time
from datetime import datetime
from urllib.parse import unquote, urlparse

import requests

# --- Config ---------------------------------------------------------------

HERE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.normpath(os.path.join(HERE, "..", "src", "resources", "World_History.json"))

THUMB_SM = 320  # width for img_sm
THUMB_MD = 640  # width for img_md

WIKI_API = "https://en.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"

HEADERS = {
    "User-Agent": "ChronicaOmnium-ImageFixer/1.0 (https://linic.net; contact: marino)"
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

REQUEST_PAUSE = 0.1  # be polite to the APIs


# --- URL helpers ----------------------------------------------------------

def url_ok(url: str, timeout: int = 10) -> bool:
    """Return True if the URL responds with a 2xx status."""
    if not url:
        return False
    try:
        r = SESSION.head(url, allow_redirects=True, timeout=timeout)
        if r.status_code == 405:  # some servers reject HEAD; fall back to GET
            r = SESSION.get(url, stream=True, timeout=timeout)
        return 200 <= r.status_code < 300
    except requests.RequestException:
        return False


def commons_filename_from_url(url: str) -> str | None:
    """Extract the Commons file name (e.g. 'Foo.jpg') from an upload URL."""
    if not url or "upload.wikimedia.org" not in url:
        return None
    path = urlparse(url).path
    parts = [p for p in path.split("/") if p]
    if not parts:
        return None
    if "thumb" in parts:
        # .../commons/thumb/X/XX/<FILENAME>/<width>px-...  -> filename is 2nd last
        return unquote(parts[-2])
    # .../commons/X/XX/<FILENAME>
    return unquote(parts[-1])


def title_from_source(source: str) -> str | None:
    """Extract the article title from a Wikipedia '/wiki/<Title>' URL."""
    if not source or "/wiki/" not in source:
        return None
    title = source.split("/wiki/", 1)[1]
    title = title.split("#", 1)[0].split("?", 1)[0]
    return unquote(title)


# --- API lookups ----------------------------------------------------------

def imageinfo_thumb(filename: str, width: int) -> tuple[str | None, str | None]:
    """
    Given a Commons file name, return (thumb_url, original_url) for the given
    thumbnail width using the imageinfo API. Tries Commons then en.wikipedia.
    """
    if not filename:
        return None, None
    for api in (COMMONS_API, WIKI_API):
        params = {
            "action": "query",
            "format": "json",
            "titles": f"File:{filename}",
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": width,
        }
        try:
            r = SESSION.get(api, params=params, timeout=15)
            r.raise_for_status()
            pages = r.json().get("query", {}).get("pages", {})
            for page in pages.values():
                info = page.get("imageinfo")
                if info:
                    ii = info[0]
                    return ii.get("thumburl"), ii.get("url")
        except (requests.RequestException, ValueError):
            continue
        finally:
            time.sleep(REQUEST_PAUSE)
    return None, None


def page_lead_image(title: str) -> tuple[str | None, str | None]:
    """
    Return (original_url, thumb_md_url) for the lead image of a Wikipedia
    article using the pageimages API.
    """
    if not title:
        return None, None
    params = {
        "action": "query",
        "format": "json",
        "titles": title,
        "prop": "pageimages",
        "piprop": "original|thumbnail",
        "pithumbsize": THUMB_MD,
        "redirects": 1,
    }
    try:
        r = SESSION.get(WIKI_API, params=params, timeout=15)
        r.raise_for_status()
        pages = r.json().get("query", {}).get("pages", {})
        for page in pages.values():
            original = page.get("original", {}).get("source")
            thumb = page.get("thumbnail", {}).get("source")
            if original or thumb:
                return original, thumb
    except (requests.RequestException, ValueError):
        pass
    finally:
        time.sleep(REQUEST_PAUSE)
    return None, None


# --- Core processing ------------------------------------------------------

def process_event(event: dict) -> dict:
    """Inspect one event and return a report dict with any suggested fixes."""
    name = event.get("name")
    image = event.get("image")
    img_md = event.get("img_md")
    img_sm = event.get("img_sm")
    source = event.get("source")

    report = {
        "id_num": event.get("id_num"),
        "name": name,
        "status": "ok",
        "changes": {},
    }

    # Case 1: no main image at all -> try to find one from the article.
    if not image:
        title = title_from_source(source)
        original, thumb_md = page_lead_image(title)
        if original or thumb_md:
            base = original or thumb_md
            filename = commons_filename_from_url(base)
            sm, _ = imageinfo_thumb(filename, THUMB_SM) if filename else (None, None)
            md = thumb_md or (imageinfo_thumb(filename, THUMB_MD)[0] if filename else None)
            report["status"] = "found_missing"
            report["changes"] = {
                "image": original or base,
                "img_md": md or base,
                "img_sm": sm or md or base,
            }
        else:
            report["status"] = "no_image_found"
        return report

    # Case 2: have a main image -> validate / regenerate thumbnails.
    filename = commons_filename_from_url(image)
    changes = {}

    # Validate the main image; if broken, try to recover via imageinfo.
    if not url_ok(image):
        _, original = imageinfo_thumb(filename, THUMB_MD)
        if original and url_ok(original):
            changes["image"] = original
            filename = commons_filename_from_url(original)

    # Validate / regenerate thumbnails.
    if not url_ok(img_md):
        new_md, _ = imageinfo_thumb(filename, THUMB_MD)
        if new_md:
            changes["img_md"] = new_md
    if not url_ok(img_sm):
        new_sm, _ = imageinfo_thumb(filename, THUMB_SM)
        if new_sm:
            changes["img_sm"] = new_sm

    if changes:
        report["status"] = "fixed"
        report["changes"] = changes
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Fix Wikipedia image URLs in World_History.json")
    parser.add_argument("--limit", type=int, default=0, help="only process the first N events (testing)")
    parser.add_argument("--only-missing", action="store_true", help="only events that currently have no image")
    parser.add_argument("--write", action="store_true", help="apply fixes back into the JSON (creates a .bak)")
    parser.add_argument("--report", default=os.path.join(HERE, "image_report.json"), help="report output path")
    args = parser.parse_args()

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    events = data
    if args.only_missing:
        events = [e for e in data if not e.get("image")]
    if args.limit:
        events = events[: args.limit]

    print(f"Scanning {len(events)} events...\n")

    reports = []
    fixes_by_id = {}
    counts = {"ok": 0, "fixed": 0, "found_missing": 0, "no_image_found": 0}

    for i, event in enumerate(events, 1):
        rep = process_event(event)
        counts[rep["status"]] = counts.get(rep["status"], 0) + 1
        if rep["status"] != "ok":
            reports.append(rep)
            if rep["changes"]:
                fixes_by_id[rep["id_num"]] = rep["changes"]
            print(f"[{i}/{len(events)}] #{rep['id_num']} {rep['name']}: {rep['status']}")
            for k, v in rep["changes"].items():
                print(f"        {k} -> {v}")

    print("\n--- Summary ---")
    for k, v in counts.items():
        print(f"  {k}: {v}")

    with open(args.report, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)
    print(f"\nReport written to {args.report}")

    if args.write and fixes_by_id:
        backup = JSON_PATH + "." + datetime.now().strftime("%Y%m%d-%H%M%S") + ".bak"
        shutil.copy2(JSON_PATH, backup)
        print(f"Backup created: {backup}")
        for event in data:
            changes = fixes_by_id.get(event.get("id_num"))
            if changes:
                event.update(changes)
        with open(JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Applied {len(fixes_by_id)} fixes to {JSON_PATH}")
    elif args.write:
        print("Nothing to write.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
