"""
Geocoding helper for Chronica Omnium.

The original version naively took Nominatim's first result with no User-Agent,
no importance filtering and no category check, so non-geographic queries (e.g.
"Universe", "Milky Way") matched random low-importance places and the map
pointed to the wrong location.

This version follows Nominatim usage best practices:
  - Sends a descriptive User-Agent (required by their usage policy).
  - Requests several candidates (limit=5) with address/extra details.
  - Picks the best candidate by `importance`, requiring a minimum threshold so
    weak/ambiguous matches are rejected instead of silently used.
  - Skips obviously non-geographic concepts via a stop-list.
  - Respects the 1 request/second rate limit.
  - Returns extra metadata (importance, class, type, place_rank) so downstream
    code / the UI can reason about precision.
"""

import time

import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Nominatim requires a genuine, identifying User-Agent.
HEADERS = {"User-Agent": "ChronicaOmnium/1.0 (https://linic.net; contact: marino)"}

# Concepts that are not real places on Earth - never trust a geocode for these.
NON_GEOGRAPHIC = {
    "universe", "milky way", "galaxy", "solar system", "earth", "world",
    "space", "cosmos", "outer space", "the universe", "planet",
}

# Candidates weaker than this are considered too ambiguous to trust.
MIN_IMPORTANCE = 0.35

_last_request_time = 0.0


def _rate_limit():
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < 1.0:
        time.sleep(1.0 - elapsed)
    _last_request_time = time.time()


def get_location_info(location, min_importance=MIN_IMPORTANCE):
    """Return structured location info for a place name, or None if untrusted."""
    if not location or location.strip().lower() in NON_GEOGRAPHIC:
        return None

    _rate_limit()
    try:
        response = requests.get(
            NOMINATIM_URL,
            params={
                "q": location,
                "format": "jsonv2",
                "addressdetails": 1,
                "extratags": 1,
                "limit": 5,
            },
            headers=HEADERS,
            timeout=15,
        )
        response.raise_for_status()
        results = response.json()
    except requests.exceptions.RequestException as error:
        print(f"Geocoding request failed for '{location}': {error}")
        return None
    except ValueError as error:
        print(f"Could not parse geocoding response for '{location}': {error}")
        return None

    if not results:
        print(f"No location found for '{location}'")
        return None

    # Choose the most prominent candidate by importance.
    best = max(results, key=lambda r: float(r.get("importance", 0) or 0))
    importance = float(best.get("importance", 0) or 0)

    if importance < min_importance:
        print(
            f"Best match for '{location}' too weak "
            f"(importance={importance:.2f} < {min_importance}); skipping."
        )
        return None

    try:
        return {
            "display_name": best["display_name"],
            "boundingbox": best["boundingbox"],
            "osm_id": best.get("osm_id"),
            "osm_type": best.get("osm_type"),
            "coordinates": (float(best["lat"]), float(best["lon"])),
            "importance": importance,
            "class": best.get("category") or best.get("class"),
            "type": best.get("type"),
            "place_rank": best.get("place_rank"),
        }
    except (KeyError, ValueError) as error:
        print(f"Error processing location data for '{location}': {error}")
        return None


if __name__ == "__main__":
    for q in ["Rome", "Milky Way", "Universe", "Giza", "Constantinople"]:
        print(q, "->", get_location_info(q))
