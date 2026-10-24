import os
import json
import re

DATA_PATH = r"C:\Users\Pranesh\.gemini\antigravity\scratch\pranesh-music-hub\static\js\songs_data.js"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.CATALOGUE_SONGS")
    exit(1)

songs = json.loads(m.group(1))

def clean_title_str(t):
    t = re.sub(r"\s*\(From\s+[^)]+\)", "", t, flags=re.I)
    t = re.sub(r"\s*\(Extended[^)]*\)", "", t, flags=re.I)
    t = re.sub(r"\s*\(Film\s+Version[^)]*\)", "", t, flags=re.I)
    t = re.sub(r"\s*\(Original\s+Motion\s+Picture[^)]*\)", "", t, flags=re.I)
    t = re.sub(r"\s*-\s*Teaser", "", t, flags=re.I)
    return t.strip()

def normalize_title(t):
    t = clean_title_str(t).lower()
    t = re.sub(r"[\"'\-_\.\,\?\!:\(\)]", "", t)
    return " ".join(t.split())

deduped = []
seen_titles = set()
seen_urls = set()

# 1. First add local static audio files
for s in songs:
    if s.get("audio_file"):
        norm_t = normalize_title(s["title"])
        seen_titles.add(norm_t)
        seen_urls.add(s["audio_file"])
        s["title"] = clean_title_str(s["title"])
        s["cover_url"] = s["cover_url"].lstrip("/")
        s["download_authorized"] = True
        deduped.append(s)

# 2. Add external tracks uniquely
for s in songs:
    if s.get("audio_file"):
        continue
    
    audio_url = s.get("audio_url", "")
    if not audio_url or audio_url in seen_urls:
        continue
    
    s["title"] = clean_title_str(s["title"])
    norm_t = normalize_title(s["title"])
    if norm_t in seen_titles:
        continue
    
    seen_titles.add(norm_t)
    seen_urls.add(audio_url)
    
    # Clean up tags
    tags = set(s.get("tags", []))
    tags.add(s["title"].lower())
    tags.add(s["artist"].lower())
    if s.get("album"):
        tags.add(s["album"].lower())
    tags.add(s.get("language", "").lower())
    s["tags"] = list(tags)
    
    s["download_authorized"] = False
    deduped.append(s)

print(f"Total fully deduplicated songs: {len(deduped)}")

output_content = f"// Pranesh Music Hub - High-Definition Curated Catalogue (Fully Deduplicated)\nwindow.CATALOGUE_SONGS = {json.dumps(deduped, indent=2, ensure_ascii=False)};\n"

with open(DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output_content)

print("Saved clean songs_data.js successfully!")
