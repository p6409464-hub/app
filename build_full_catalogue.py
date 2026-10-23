import os
import sys
import json
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import search_jiosaavn

# Curated queries for the biggest hits
QUERIES = [
    # --- Tamil Hits ---
    {"q": "Badass Leo", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Naa Ready Leo", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Hukum Jailer", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Kaavaalaa Jailer", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Arabic Kuthu Beast", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Vaathi Coming Master", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Pathala Pathala Vikram", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Vikram Title Track", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Megham Karukatha", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Manasilaayo Vettaiyan", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Hunter Vantaar Vettaiyan", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Whistle Podu GOAT", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Matta GOAT", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Water Packet Raayan", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Adangaatha Asuran Raayan", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Kalluri Vaanil Amar", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Rowdy Baby Maari 2", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Why This Kolaveri Di 3", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Chellamma Doctor", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "So Baby Doctor", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Jalabulajangu Don", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Two Two Two Kaathuvaakula", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Dippam Dappam", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Ponni Nadhi PS1", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Aga Naga PS2", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Kannaana Kanney Viswasam", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Marana Mass Petta", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Aalaporaan Thamizhan Mersal", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Verithanam Bigil", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Aval Varuvala Naerukku Naer", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Vaanathai Pola Friends", "lang": "Tamil", "sec": ["trending", "tamil"]},
    {"q": "Rukku Rukku Friends", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Engeyum Kaadhal", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Kadhaippoma Oh My Kadavule", "lang": "Tamil", "sec": ["recent", "tamil"]},
    {"q": "Marakkuma Nenjam VTK", "lang": "Tamil", "sec": ["recent", "tamil"]},

    # --- English Global Hits ---
    {"q": "Shape of You Ed Sheeran", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Blinding Lights The Weeknd", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Starboy The Weeknd", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Believer Imagine Dragons", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Faded Alan Walker", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Stay Kid Laroi Justin Bieber", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Levitating Dua Lipa", "lang": "English", "sec": ["recent", "english"]},
    {"q": "As It Was Harry Styles", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Someone You Loved Lewis Capaldi", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Perfect Ed Sheeran", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Bad Guy Billie Eilish", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Closer Chainsmokers", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Sunflower Post Malone", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Senorita Shawn Mendes", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Counting Stars OneRepublic", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Cruel Summer Taylor Swift", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Anti Hero Taylor Swift", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Flowers Miley Cyrus", "lang": "English", "sec": ["trending", "english"]},
    {"q": "Industry Baby Lil Nas X", "lang": "English", "sec": ["recent", "english"]},
    {"q": "Night Changes One Direction", "lang": "English", "sec": ["recent", "english"]},

    # --- Malayalam Superhits ---
    {"q": "Illuminati Aavesham", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Jaada Aavesham", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Armadham Aavesham", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Malare Premam", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Aluva Puzhayude Premam", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Darshana Hridayam", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Arodum Parayathe Hridayam", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Neela Nilave RDX", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Kuthanthram Manjummel Boys", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Cherathukal Kumbalangi Nights", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Parudeesa Bheeshma Parvam", "lang": "Malayalam", "sec": ["trending", "malayalam"]},
    {"q": "Thee Minnal Minnal Murali", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Akale Charlie", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Ole Melody Thallumaala", "lang": "Malayalam", "sec": ["recent", "malayalam"]},
    {"q": "Omane Aadujeevitham", "lang": "Malayalam", "sec": ["recent", "malayalam"]}
]

# Static offline songs already in static/audio
EXISTING_STATIC = [
    {
        "id": "of_1",
        "title": "Let's Try (เอาเลยมั้ย)",
        "artist": "Khaotung Thanawat",
        "album": "Only Friends OST",
        "duration": 218,
        "duration_str": "3:38",
        "language": "Thai/Multi",
        "category": "Only Friends OST",
        "sections": ["trending", "only_friends"],
        "cover_url": "static/images/lets_try_acoustic.svg",
        "audio_file": "lets_try_acoustic.mp3",
        "download_authorized": True,
        "tags": ["only friends", "gmmtv", "khaotung", "ost", "trending"]
    },
    {
        "id": "of_2",
        "title": "No One Can (ห้ามแตะ)",
        "artist": "Gawin Caskey",
        "album": "Only Friends : Dream On",
        "duration": 204,
        "duration_str": "3:24",
        "language": "Thai/Multi",
        "category": "Only Friends OST",
        "sections": ["recent", "only_friends"],
        "cover_url": "static/images/no_one_can_chill.svg",
        "audio_file": "no_one_can_chill.mp3",
        "download_authorized": True,
        "tags": ["only friends", "gawin caskey", "dream on"]
    },
    {
        "id": "of_3",
        "title": "Only Friends Retro Odyssey",
        "artist": "Sonya Bara & Cyber Pulse",
        "album": "Only Friends Singles",
        "duration": 195,
        "duration_str": "3:15",
        "language": "English",
        "category": "Only Friends OST",
        "sections": ["trending", "only_friends"],
        "cover_url": "static/images/only_friends_theme.svg",
        "audio_file": "only_friends_theme.mp3",
        "download_authorized": True,
        "tags": ["only friends", "synthwave"]
    },
    {
        "id": "inst_1",
        "title": "Cinematic Piano Dream",
        "artist": "Pranesh Orchestra",
        "album": "Symphonies of the Mind",
        "duration": 260,
        "duration_str": "4:20",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["trending", "instrumental"],
        "cover_url": "static/images/cinematic_piano_dream.svg",
        "audio_file": "cinematic_piano_dream.mp3",
        "download_authorized": True,
        "tags": ["instrumental", "piano", "cinematic"]
    },
    {
        "id": "inst_2",
        "title": "Chillhop Study Beats",
        "artist": "Coffee & Rain",
        "album": "Focus & Code Vol. 1",
        "duration": 198,
        "duration_str": "3:18",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["recent", "instrumental"],
        "cover_url": "static/images/chillhop_lofi_beat.svg",
        "audio_file": "chillhop_lofi_beat.mp3",
        "download_authorized": True,
        "tags": ["instrumental", "chillhop", "lofi"]
    },
    {
        "id": "inst_3",
        "title": "SoundHelix Symphony",
        "artist": "Open Music Archive",
        "album": "Algorithmic Harmony",
        "duration": 372,
        "duration_str": "6:12",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["recent", "instrumental"],
        "cover_url": "static/images/soundhelix_ambient.svg",
        "audio_file": "soundhelix_ambient.mp3",
        "download_authorized": True,
        "tags": ["instrumental", "soundhelix", "electronic"]
    }
]

def main():
    print("Collecting songs from JioSaavn...")
    songs = list(EXISTING_STATIC)
    seen_urls = set()
    for s in songs:
        if s.get("audio_file"):
            seen_urls.add(s["audio_file"])

    for item in QUERIES:
        q = item["q"]
        lang = item["lang"]
        sec = item["sec"]
        print(f"Searching: {q}...")
        try:
            results = search_jiosaavn(q, language=lang.lower())
            if results:
                best = results[0]
                audio_url = best.get("audio_url")
                if audio_url and audio_url not in seen_urls:
                    seen_urls.add(audio_url)
                    song_obj = {
                        "id": best["id"],
                        "title": best["title"],
                        "artist": best["artist"],
                        "album": best["album"],
                        "duration": best["duration"],
                        "duration_str": best["duration_str"],
                        "language": lang,
                        "category": f"{lang} Songs",
                        "sections": sec,
                        "cover_url": best["cover_url"],
                        "audio_url": audio_url,
                        "download_authorized": True,
                        "tags": [lang.lower(), q.lower(), best["title"].lower(), best["artist"].lower(), best["album"].lower()]
                    }
                    songs.append(song_obj)
                    print(f"  + Added: {song_obj['title']} ({song_obj['duration_str']})")
            time.sleep(0.2)
        except Exception as e:
            print(f"  Error on {q}: {e}")

    print(f"\nTotal songs compiled: {len(songs)}")

    # Write to static/js/songs_data.js
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "js", "songs_data.js")
    js_content = f"// Pranesh Music Hub - High-Definition Song Catalogue\nwindow.CATALOGUE_SONGS = {json.dumps(songs, indent=2, ensure_ascii=False)};\n"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Written {len(songs)} songs to {out_path}")

if __name__ == "__main__":
    main()
