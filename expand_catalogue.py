import os
import sys
import json
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import search_jiosaavn

# Load current catalogue from static/js/songs_data.js
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "js", "songs_data.js")
current_songs = []
seen_ids = set()
seen_urls = set()

if os.path.exists(data_path):
    with open(data_path, "r", encoding="utf-8") as f:
        content = f.read()
        import re
        m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
        if m:
            current_songs = json.loads(m.group(1))
            for s in current_songs:
                seen_ids.add(s["id"])
                if s.get("audio_url"):
                    seen_urls.add(s["audio_url"])

print(f"Loaded {len(current_songs)} existing songs.")

# Movies and queries to ensure are fully covered
MOVIE_QUERIES = [
    # Top Tamil Movies
    ("Ghilli", "Tamil"),
    ("Mankatha", "Tamil"),
    ("Vel", "Tamil"),
    ("Kovakkara Kiliye", "Tamil"),
    ("Sivaji", "Tamil"),
    ("Ayan", "Tamil"),
    ("Vaaranam Aayiram", "Tamil"),
    ("Vinnaithaandi Varuvaayaa", "Tamil"),
    ("Paiyaa", "Tamil"),
    ("Amaran", "Tamil"),
    ("Thiruchitrambalam", "Tamil"),
    ("Kaathuvaakula Rendu Kaadhal", "Tamil"),
    ("Vikram Vedha", "Tamil"),
    ("Aaranya Kaandam", "Tamil"),
    ("Anbe Sivam", "Tamil"),
    ("Mudhalvan", "Tamil"),
    ("Jeans", "Tamil"),
    ("Indian", "Tamil"),
    ("Roja", "Tamil"),
    ("Bombay", "Tamil"),
    ("Padayappa", "Tamil"),
    ("Baashha", "Tamil"),
    ("Muthu", "Tamil"),
    ("Enthiran", "Tamil"),
    ("2.0", "Tamil"),
    ("Kabali", "Tamil"),
    ("Kaala", "Tamil"),
    ("Theri", "Tamil"),
    ("Mersal", "Tamil"),
    ("Sarkar", "Tamil"),
    ("Bigil", "Tamil"),
    ("Master", "Tamil"),
    ("Varisu", "Tamil"),
    ("Leo", "Tamil"),
    ("Jailer", "Tamil"),
    ("Vikram", "Tamil"),
    ("Vettaiyan", "Tamil"),
    ("GOAT", "Tamil"),
    ("Raayan", "Tamil"),
    ("Kanguva", "Tamil"),
    ("Pushpa", "Tamil"),
    ("KGF", "Tamil"),
    ("KGF Chapter 2", "Tamil"),
    ("Devara", "Tamil"),
    ("Animal", "Hindi"),
    ("Kabir Singh", "Hindi"),
    ("Yeh Jawaani Hai Deewani", "Hindi"),
    ("Brahmastra", "Hindi"),
    ("Jawan", "Hindi"),
    ("Pathaan", "Hindi"),
    ("Arijit Singh Hits", "Hindi"),
    ("Shreya Ghoshal Hits", "Hindi"),
    ("Interstellar Theme", "Instrumental"),
    ("Pirates of the Caribbean Theme", "Instrumental"),
    ("Game of Thrones Theme", "Instrumental"),
    ("Titanic Theme", "Instrumental")
]

added_count = 0
for query, lang in MOVIE_QUERIES:
    print(f"Searching movie/track: {query} ({lang})...")
    try:
        results = search_jiosaavn(query, language=lang.lower())
        # Add up to 5 best songs per movie
        for s in results[:5]:
            audio_url = s.get("audio_url")
            sid = s.get("id")
            if sid not in seen_ids and audio_url and audio_url not in seen_urls:
                seen_ids.add(sid)
                seen_urls.add(audio_url)
                song_obj = {
                    "id": sid,
                    "title": s["title"],
                    "artist": s["artist"],
                    "album": s["album"],
                    "duration": s["duration"],
                    "duration_str": s["duration_str"],
                    "language": lang,
                    "category": f"{lang} Songs" if lang != "Instrumental" else "Instrumental Music",
                    "sections": ["trending", lang.lower()],
                    "cover_url": s["cover_url"],
                    "audio_url": audio_url,
                    "download_authorized": True,
                    "tags": [
                        lang.lower(),
                        query.lower(),
                        s["title"].lower(),
                        s["artist"].lower(),
                        s["album"].lower(),
                        "movie",
                        "hits"
                    ]
                }
                current_songs.append(song_obj)
                added_count += 1
                print(f"  + Added: {s['title']} | Album: {s['album']} ({s['duration_str']})")
        time.sleep(0.15)
    except Exception as e:
        print(f"  Error on {query}: {e}")

print(f"\nFinished! Added {added_count} new songs. Total catalogue: {len(current_songs)}")

# Save updated catalogue to static/js/songs_data.js
js_content = f"// Pranesh Music Hub - High-Definition Song & Movie Catalogue\nwindow.CATALOGUE_SONGS = {json.dumps(current_songs, indent=2, ensure_ascii=False)};\n"
with open(data_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Written to {data_path} successfully!")
