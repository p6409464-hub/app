import os
import sys
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import search_jiosaavn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_DATA_PATH = os.path.join(BASE_DIR, "static", "js", "songs_data.js")

# 1. Load existing songs
with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.CATALOGUE_SONGS in songs_data.js")
    sys.exit(1)

existing_songs = json.loads(m.group(1))
print(f"Loaded {len(existing_songs)} existing songs.", flush=True)

seen_ids = set(s["id"] for s in existing_songs)
seen_titles = set(re.sub(r"[^a-z0-9]", "", s["title"].lower()) for s in existing_songs)
all_songs = list(existing_songs)

TAMIL_MASSIVE_QUERIES = [
    # --- COMPOSERS ---
    "Ilaiyaraaja 80s Tamil Hits",
    "Ilaiyaraaja 90s Tamil Hits",
    "Ilaiyaraaja Evergreen Melodies Tamil",
    "Ilaiyaraaja Love Songs Tamil",
    "Ilaiyaraaja Sad Songs Tamil",
    "Ilaiyaraaja Folk Songs Tamil",
    "AR Rahman 90s Tamil Hits",
    "AR Rahman 2000s Tamil Hits",
    "AR Rahman Romantic Songs Tamil",
    "AR Rahman Fast Beat Songs Tamil",
    "AR Rahman Melodies Tamil",
    "Yuvan Shankar Raja Hits Tamil",
    "Yuvan Love Songs Tamil",
    "Yuvan Sad Songs Tamil",
    "Yuvan BGM Tamil",
    "Yuvan 2000s Hits Tamil",
    "Harris Jayaraj Romantic Hits Tamil",
    "Harris Jayaraj Melodies Tamil",
    "Harris Jayaraj Fast Songs Tamil",
    "Anirudh Ravichander All Time Hits Tamil",
    "Anirudh Dance Hits Tamil",
    "Anirudh Love Songs Tamil",
    "Deva Gana Songs Tamil",
    "Deva Kuthu Songs Tamil",
    "Deva 90s Melodies Tamil",
    "Vidyasagar Romantic Hits Tamil",
    "Vidyasagar Melodies Tamil",
    "D Imman Melodies Tamil",
    "D Imman Folk Songs Tamil",
    "Santhosh Narayanan Tamil Hits",
    "GV Prakash Hits Tamil",
    "GV Prakash Romantic Melodies Tamil",
    "Hiphop Tamizha Hits Tamil",
    "Vijay Antony Tamil Hits",
    "Sam CS Hits Tamil",
    "Sean Roldan Tamil Melodies",
    "Ghibran Hits Tamil",

    # --- LEGENDARY SINGERS ---
    "SP Balasubrahmanyam Tamil Golden Hits",
    "SPB Melodies Tamil",
    "SPB Duets Tamil",
    "KJ Yesudas Tamil Classics",
    "KJ Yesudas Melodies Tamil",
    "KS Chithra Tamil Melodies",
    "KS Chithra Hits Tamil",
    "S Janaki Tamil Classics",
    "P Susheela Golden Hits Tamil",
    "Hariharan Melodies Tamil",
    "Shankar Mahadevan Tamil Energy Hits",
    "Unnikrishnan Tamil Melodies",
    "Sid Sriram Tamil Hits",
    "Sid Sriram Romantic Songs Tamil",
    "Pradeep Kumar Tamil Melodies",
    "Haricharan Tamil Hits",
    "Karthik Melodies Tamil",
    "Shreya Ghoshal Tamil Melodies",
    "Chinmayi Tamil Hits",

    # --- STARS & HEROES ---
    "Rajinikanth Mass Songs Tamil",
    "Rajinikanth 90s Hits Tamil",
    "Rajinikanth 80s Hits Tamil",
    "Kamal Haasan Hits Tamil",
    "Kamal Haasan 80s Classics Tamil",
    "Thalapathy Vijay All Time Hits Tamil",
    "Thalapathy Vijay Dance Beats Tamil",
    "Vijay Romantic Songs Tamil",
    "Ajith Kumar Blockbusters Tamil",
    "Ajith Kumar Melodies Tamil",
    "Ajith Mass Hits Tamil",
    "Suriya Hits Tamil",
    "Suriya Romantic Melodies Tamil",
    "Dhanush All Hits Tamil",
    "Dhanush Love Songs Tamil",
    "Sivakarthikeyan Hits Tamil",
    "Sivakarthikeyan Dance Songs Tamil",
    "Silambarasan TR Hits Tamil",
    "Karthi Hits Tamil",
    "Chiyaan Vikram Hits Tamil",
    "Jayam Ravi Hits Tamil",
    "Vijay Sethupathi Hits Tamil",
    "Madhavan Romantic Hits Tamil",

    # --- DECADES & GENRES ---
    "80s Tamil Golden Hits",
    "90s Tamil Nostalgia Hits",
    "2000s Tamil Melodies",
    "2010s Tamil Blockbusters",
    "2020s Tamil Trending Hits",
    "2024 Tamil Latest Hits",
    "2025 Tamil Latest Songs",
    "Tamil Midnight Melodies",
    "Tamil Acoustic Guitar Songs",
    "Tamil Rain Songs",
    "Tamil Travel Songs",
    "Tamil Motivation Songs",
    "Tamil Village Folk Songs",
    "Tamil Gaana Songs",
    "Tamil Lofi Chill Beats",
    "Tamil Unplugged Melodies"
]

print(f"Beginning concurrent crawl for {len(TAMIL_MASSIVE_QUERIES)} queries with 8 workers...", flush=True)

def fetch_query(q):
    try:
        res = search_jiosaavn(q, language="Tamil")
        return q, res
    except Exception as e:
        return q, []

added_count = 0

with ThreadPoolExecutor(max_workers=8) as executor:
    future_to_query = {executor.submit(fetch_query, q): q for q in TAMIL_MASSIVE_QUERIES}
    completed_idx = 0
    for future in as_completed(future_to_query):
        completed_idx += 1
        q, results = future.result()
        q_added = 0
        for song in results:
            if not song.get("audio_url"):
                continue
            song_id = song["id"]
            title = song.get("title", "")
            norm_title = re.sub(r"[^a-z0-9]", "", title.lower())

            if song_id in seen_ids or (norm_title and norm_title in seen_titles):
                continue

            seen_ids.add(song_id)
            if norm_title:
                seen_titles.add(norm_title)

            song["language"] = "Tamil"
            song["category"] = "Tamil Songs"
            song["download_authorized"] = True

            all_songs.append(song)
            q_added += 1
            added_count += 1

        print(f"[{completed_idx}/{len(TAMIL_MASSIVE_QUERIES)}] Query '{q}': +{q_added} tracks (Total: {len(all_songs)})", flush=True)

print(f"\n==========================================", flush=True)
print(f"Crawling complete! Added {added_count} new Tamil tracks.", flush=True)
print(f"Total Catalogue Size: {len(all_songs)} tracks.", flush=True)
print(f"==========================================", flush=True)

# Write back to static/js/songs_data.js with clean compact formatting
output_code = "// Pranesh Music Hub - Complete Master Song Catalogue (Deduplicated)\n"
output_code += f"window.CATALOGUE_SONGS = {json.dumps(all_songs, ensure_ascii=False, separators=(',', ':'))};\n"

with open(SONGS_DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output_code)

file_size_mb = os.path.getsize(SONGS_DATA_PATH) / (1024 * 1024)
print(f"Successfully saved {SONGS_DATA_PATH}! File size: {file_size_mb:.2f} MB", flush=True)
