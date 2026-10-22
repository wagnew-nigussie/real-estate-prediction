"""Reproducibly download the Ames Housing CSV into data/raw/.

Source: AmesHousing.csv distributed with the AmesHousing R package, mirrored on
GitHub. Original study: De Cock (2011), Journal of Statistics Education 19(3).

Educational / proof-of-concept use only. This is US (Ames, Iowa, USD) data and
is NOT Ethiopian market data.

Usage (from project root, venv active or using its python):
    ./ml-service/venv/bin/python ml-service/scripts/download_dataset.py
"""
from __future__ import annotations

import hashlib
import sys
import urllib.request
from pathlib import Path

URL = (
    "https://raw.githubusercontent.com/georgehagstrom/"
    "DATA622Spring2026/main/website/assignments/labs/labData/AmesHousing.csv"
)

def main() -> int:
    project_root = Path(__file__).resolve().parents[2]
    out_dir = project_root / "data" / "raw"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_csv = out_dir / "ames_housing.csv"

    if out_csv.exists():
        print(f"File already exists: {out_csv}")
        print("Delete it first if you want to re-download.")
        return 0

    print(f"Downloading: {URL}")
    req = urllib.request.Request(URL, headers={"User-Agent": "curl/8"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()

    out_csv.write_bytes(data)

    sha256 = hashlib.sha256(data).hexdigest()
    print(f"Saved: {out_csv}")
    print(f"Bytes: {len(data)}")
    print(f"SHA256: {sha256}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
