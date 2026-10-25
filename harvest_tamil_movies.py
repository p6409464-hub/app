import os
import sys
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import search_jiosaavn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_DATA_PATH = os.path.join(BASE_DIR, "static", "js", "songs_data.js")

with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.CATALOGUE_SONGS")
    sys.exit(1)

existing_songs = json.loads(m.group(1))
print(f"Loaded {len(existing_songs)} existing songs.", flush=True)

seen_ids = set(s["id"] for s in existing_songs)
seen_titles = set(re.sub(r"[^a-z0-9]", "", s["title"].lower()) for s in existing_songs)
all_songs = list(existing_songs)

MOVIE_QUERIES = [
    # Top 120 Tamil Blockbuster Movies (1990 - 2026)
    "Padayappa Tamil", "Muthu Tamil", "Annamalai Tamil", "Baasha Tamil", "Chandramukhi Tamil",
    "Sivaji The Boss Tamil", "Enthiran Tamil", "Kabali Tamil", "Kaala Tamil", "Petta Tamil",
    "Darbar Tamil", "Jailer Tamil", "Vettaiyan Tamil", "Thuppakki Tamil", "Kaththi Tamil",
    "Theri Tamil", "Mersal Tamil", "Sarkar Tamil", "Bigil Tamil", "Master Tamil",
    "Beast Tamil", "Varisu Tamil", "Leo Tamil", "The Greatest of All Time Tamil", "Ghilli Tamil",
    "Pokkiri Tamil", "Kushi Tamil", "Priyamanavale Tamil", "Sachein Tamil", "Vaseegara Tamil",
    "Billa Tamil", "Mankatha Tamil", "Arrambam Tamil", "Yennai Arindhaal Tamil", "Vedalam Tamil",
    "Vivegam Tamil", "Viswasam Tamil", "Valimai Tamil", "Thunivu Tamil", "Vidaamuyarchi Tamil",
    "Good Bad Ugly Tamil", "Minnale Tamil", "Kaakha Kaakha Tamil", "Ghajini Tamil", "Vaaranam Aayiram Tamil",
    "Ayan Tamil", "Aadhavan Tamil", "7aum Arivu Tamil", "Maattrraan Tamil", "Singam Tamil",
    "Anjaan Tamil", "24 Suriya Tamil", "Soorarai Pottru Tamil", "Jai Bhim Tamil", "Kanguva Tamil",
    "Polladhavan Tamil", "Aadukalam Tamil", "Maryan Tamil", "VIP Dhanush Tamil", "Vada Chennai Tamil",
    "Asuran Tamil", "Karnan Tamil", "Thiruchitrambalam Tamil", "Vaathi Tamil", "Captain Miller Tamil",
    "Raayan Tamil", "Kubera Tamil", "Pudhupettai Tamil", "Mayakkam Enna Tamil", "Aayirathil Oruvan Tamil",
    "7G Rainbow Colony Tamil", "Kaadhal Kondein Tamil", "Paiyaa Tamil", "Naan Mahaan Alla Tamil", "Siruthai Tamil",
    "Biriyani Tamil", "Madras Karthi Tamil", "Kaithi Tamil", "Sulthan Tamil", "Ponniyin Selvan Tamil",
    "Vikram Kamal Haasan Tamil", "Indian Kamal Tamil", "Indian 2 Tamil", "Vettaiyaadu Vilaiyaadu Tamil", "Dasavathaaram Tamil",
    "Apoorva Sagodharargal Tamil", "Michael Madana Kama Rajan Tamil", "Thevar Magan Tamil", "Virumaandi Tamil", "Anbe Sivam Tamil",
    "Panchatanthiram Tamil", "Avvai Shanmugi Tamil", "Kadhala Kadhala Tamil", "Tenali Tamil", "Vasool Raja MBBS Tamil",
    "Roja Tamil", "Bombay Tamil", "Gentleman Tamil", "Kadhalan Tamil", "Jeans Tamil",
    "Mudhalvan Tamil", "Alaipayuthey Tamil", "Kandukondain Kandukondain Tamil", "Kannathil Muthamittal Tamil", "Boys Tamil",
    "Aayitha Ezhuthu Tamil", "New Tamil", "Anniyan Tamil", "Sivaji Tamil", "Azhagiya Tamil Magan Tamil",
    "Vinnaithaandi Varuvaayaa Tamil", "Engeyum Kaadhal Tamil", "Ko Tamil", "Nanban Tamil", "Thani Oruvan Tamil",
    "Iru Mugan Tamil", "Vikram Vedha Tamil", "Super Deluxe Tamil", "Master Tamil", "Doctor Tamil",
    "Don Tamil", "Love Today Tamil", "Dragon Tamil", "Lover Tamil", "Star Kavin Tamil",
    "Maharaja Vijay Sethupathi Tamil", "Meiyazhagan Tamil", "Lubber Pandhu Tamil", "Amaran Tamil"
]

print(f"Beginning crawl for {len(MOVIE_QUERIES)} Tamil movie queries...", flush=True)

def fetch_query(q):
    try:
        res = search_jiosaavn(q, language="Tamil")
        return q, res
    except Exception as e:
        return q, []

added_count = 0

with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_query = {executor.submit(fetch_query, q): q for q in MOVIE_QUERIES}
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

        print(f"[{completed_idx}/{len(MOVIE_QUERIES)}] Movie '{q}': +{q_added} tracks (Total: {len(all_songs)})", flush=True)

print(f"\n==========================================", flush=True)
print(f"Crawling complete! Added {added_count} new Tamil movie tracks.", flush=True)
print(f"Total Catalogue Size: {len(all_songs)} tracks.", flush=True)
print(f"==========================================", flush=True)

output_code = "// Pranesh Music Hub - Complete Master Song Catalogue (Deduplicated)\n"
output_code += f"window.CATALOGUE_SONGS = {json.dumps(all_songs, ensure_ascii=False, separators=(',', ':'))};\n"

with open(SONGS_DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output_code)

file_size_mb = os.path.getsize(SONGS_DATA_PATH) / (1024 * 1024)
print(f"Successfully saved {SONGS_DATA_PATH}! File size: {file_size_mb:.2f} MB", flush=True)
