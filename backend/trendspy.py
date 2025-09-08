#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
trendspy.py — Lọc trend & hashtag hôm nay (theo giờ Asia/Tokyo) từ nhiều nguồn:
- X/Twitter: trends24 (Worldwide + từng quốc gia)
- TikTok: TikTok Creative Center (fallback Tokchart songs), TikTok trending-hashtags
- Google Trends: pytrends "trending_searches"

Output: in-console + JSON (stdout) và tùy chọn CSV (--csv)
"""

import argparse, sys, json, re, time, datetime as dt
from typing import List, Dict
import pytz
import requests
from bs4 import BeautifulSoup
import pandas as pd

JST = pytz.timezone("Asia/Tokyo")

# --- helpers -----------------------------------------------------
def today_str():
    return dt.datetime.now(JST).strftime("%Y-%m-%d")

def now_str():
    return dt.datetime.now(JST).strftime("%Y%m%d_%H%M%S")

def get(url, **kw):
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; trendspy/1.0; +https://example.local)"
    }
    return requests.get(url, headers=headers, timeout=20, **kw)

def normalize_space(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()

def ts_now_iso():
    return dt.datetime.now(JST).isoformat()

# --- X (Twitter) via trends24 -----------------------------------
# regions: 'worldwide', 'japan', 'united-states', etc.
def fetch_trends24(region: str) -> List[Dict]:
    base = "https://trends24.in/"
    url = base if region == "worldwide" else f"{base}{region.replace(' ', '-').lower()}/"
    r = get(url)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    out = []
    # lấy cloud/table trong 24h gần nhất
    for a in soup.select(".trend-card .trend-card__list a, .trend-card__list a, .trend-card__list-item a"):
        tag = normalize_space(a.get_text())
        if not tag:
            continue
        # X có thể là hashtag hoặc từ khóa
        out.append({
            "platform": "x",
            "region": region,
            "label": tag,
            "type": "hashtag" if tag.startswith("#") else "topic",
            "source": url,
            "collected_at": ts_now_iso()
        })
    # de-dup, giữ thứ tự
    seen = set(); uniq = []
    for item in out:
        key = (item["label"].lower(), item["region"], item["platform"])
        if key in seen: 
            continue
        seen.add(key); uniq.append(item)
    return uniq

# --- TikTok: Creative Center (public page; có thể cần cookie ở vài khu vực) ----
def fetch_tiktok_creative_center_hashtags() -> List[Dict]:
    url = "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en"
    r = get(url)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    out = []
    # Trang này render bằng JS, nhưng thường có text fallback trong HTML (title + counts)
    # Bắt mọi thẻ có dấu # và số Post
    for row in soup.find_all(text=re.compile(r"^#")):
        label = normalize_space(str(row))
        if not label.startswith("#"): 
            continue
        out.append({
            "platform": "tiktok",
            "region": "worldwide",
            "label": label,
            "type": "hashtag",
            "source": url,
            "collected_at": ts_now_iso()
        })
    # fallback: nếu rỗng, trả về []
    # (người dùng có thể dùng thêm --tiktok-songs để kéo Tokchart)
    return dedup(out)

def fetch_tokchart_songs() -> List[Dict]:
    url = "https://tokchart.com/"
    r = get(url)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    out = []
    for li in soup.select("li, .song, .track"):
        name = normalize_space(li.get_text(separator=" "))
        if not name or len(name) < 3: 
            continue
        out.append({
            "platform": "tiktok",
            "region": "worldwide",
            "label": name,
            "type": "sound",
            "source": url,
            "collected_at": ts_now_iso()
        })
    return dedup(out)

def fetch_tiktok_trending_hashtags() -> List[Dict]:
    url = "https://www.tiktok.com/discover/trending-hashtags?lang=en"
    r = get(url)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    out = []
    for text in soup.find_all(text=re.compile(r"#\w+")):
        tag = normalize_space(str(text))
        if tag.startswith("#"):
            out.append({
                "platform": "tiktok",
                "region": "worldwide",
                "label": tag,
                "type": "hashtag",
                "source": url,
                "collected_at": ts_now_iso()
            })
    return dedup(out)

def dedup(items: List[Dict]) -> List[Dict]:
    seen = set(); uniq = []
    for it in items:
        key = (it["platform"], it["region"], it["label"].lower())
        if key in seen: 
            continue
        seen.add(key); uniq.append(it)
    return uniq

# --- Google Trends (trending_searches) ---------------------------
def fetch_google_trends(regions: List[str]) -> List[Dict]:
    out = []
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='en-US', tz=0)
        # map tên tự do sang pn hợp lệ
        # danh sách pn hợp lệ: 'japan','united_states','india',... 
        # nếu không hợp lệ -> bỏ qua
        for rg in regions:
            pn = rg.replace("-", "_").lower()
            try:
                df = pytrends.trending_searches(pn=pn)
            except Exception:
                continue
            for q in df[0].tolist():
                out.append({
                    "platform": "google",
                    "region": rg,
                    "label": q,
                    "type": "search",
                    "source": f"pytrends:{pn}",
                    "collected_at": ts_now_iso()
                })
    except Exception as e:
        # không có pytrends hoặc lỗi mạng -> bỏ qua
        pass
    return dedup(out)

# --- main --------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Collect today's trending hashtags/topics worldwide.")
    parser.add_argument("--region", nargs="+", default=["worldwide"], help="worldwide hoặc danh sách quốc gia (vd: japan united-states india)")
    parser.add_argument("--limit", type=int, default=30, help="giới hạn mỗi nguồn")
    parser.add_argument("--csv", default="", help="xuất CSV ra file")
    parser.add_argument("--no-tiktok", action="store_true", help="bỏ qua TikTok")
    parser.add_argument("--no-x", action="store_true", help="bỏ qua X/Twitter")
    parser.add_argument("--no-google", action="store_true", help="bỏ qua Google Trends")
    parser.add_argument("--tiktok-songs", action="store_true", help="kèm Tokchart top songs")
    args = parser.parse_args()

    regions = [r.lower() for r in args.region]
    all_items: List[Dict] = []

    # X/Twitter trends24
    if not args.no_x:
        for rg in regions:
            try:
                items = fetch_trends24(rg)[:args.limit]
                all_items.extend(items)
            except Exception:
                continue

    # TikTok
    if not args.no_tiktok:
        try:
            t1 = fetch_tiktok_creative_center_hashtags()[:args.limit]
        except Exception:
            t1 = []
        try:
            t2 = fetch_tiktok_trending_hashtags()[:args.limit]
        except Exception:
            t2 = []
        all_items.extend(t1)
        all_items.extend(t2)
        if args.tiktok_songs:
            try:
                all_items.extend(fetch_tokchart_songs()[:args.limit])
            except Exception:
                pass

    # Google Trends (search trending)
    if not args.no_google:
        try:
            # nếu user chỉ gọi worldwide -> lấy thêm vài quốc gia lớn để đa dạng
            google_regions = regions if regions != ["worldwide"] else ["united_states","japan","india","united_kingdom"]
            all_items.extend(fetch_google_trends(google_regions)[:args.limit*len(google_regions)])
        except Exception:
            pass

    # finalize
    all_items = dedup(all_items)
    # sort: platform -> region -> label
    all_items.sort(key=lambda x: (x["platform"], x["region"], x["label"].lower()))

    # console summary
    today = today_str()
    print(f"=== Trend Snapshot ({today}, JST) — {len(all_items)} items ===", file=sys.stderr)
    by_platform: Dict[str, int] = {}
    for it in all_items:
        by_platform[it["platform"]] = by_platform.get(it["platform"], 0) + 1
    print("Counts by platform:", by_platform, file=sys.stderr)

    # output JSON to stdout
    print(json.dumps({"date_jst": today, "items": all_items}, ensure_ascii=False, indent=2))

    # optional CSV
    if args.csv:
        df = pd.DataFrame(all_items)
        df.to_csv(args.csv, index=False, encoding="utf-8-sig")

if __name__ == "__main__":
    main()
