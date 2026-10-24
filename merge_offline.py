import os
import json
import re

OFFLINE_16 = [
  { "id": "of_1", "title": "Let's Try (เอาเลยมั้ย)", "artist": "Khaotung Thanawat", "album": "Only Friends OST", "duration": 218, "duration_str": "3:38", "language": "Thai/Multi", "category": "Only Friends OST", "sections": ["trending", "only_friends"], "cover_url": "static/images/lets_try_acoustic.svg", "audio_file": "lets_try_acoustic.mp3", "download_authorized": True, "tags": ["only friends", "gmmtv", "khaotung", "ost", "trending"] },
  { "id": "of_2", "title": "No One Can (ห้ามแตะ)", "artist": "Gawin Caskey", "album": "Only Friends : Dream On", "duration": 204, "duration_str": "3:24", "language": "Thai/Multi", "category": "Only Friends OST", "sections": ["recent", "only_friends"], "cover_url": "static/images/no_one_can_chill.svg", "audio_file": "no_one_can_chill.mp3", "download_authorized": True, "tags": ["only friends", "gawin caskey", "dream on"] },
  { "id": "of_3", "title": "Only Friends Retro Odyssey", "artist": "Sonya Bara & Cyber Pulse", "album": "Only Friends Singles", "duration": 195, "duration_str": "3:15", "language": "English", "category": "Only Friends OST", "sections": ["trending", "only_friends"], "cover_url": "static/images/only_friends_theme.svg", "audio_file": "only_friends_theme.mp3", "download_authorized": True, "tags": ["only friends", "synthwave"] },
  { "id": "tamil_1", "title": "Vaanathai Pola", "artist": "Ilaiyaraaja / Pranesh Hub", "album": "Friends", "duration": 248, "duration_str": "4:08", "language": "Tamil", "category": "Tamil Songs", "sections": ["trending", "tamil"], "cover_url": "static/images/vaanathai_pola.svg", "audio_file": "vaanathai_pola.mp3", "download_authorized": True, "tags": ["tamil", "friends", "kodi", "ilaiyaraaja", "vijay", "suriya"] },
  { "id": "tamil_2", "title": "Rukku Rukku Remix", "artist": "Vijay, Yuvan & Mix Lab", "album": "Friends", "duration": 210, "duration_str": "3:30", "language": "Tamil", "category": "Tamil Songs", "sections": ["recent", "tamil"], "cover_url": "static/images/rukku_rukku_remix.svg", "audio_file": "rukku_rukku_remix.mp3", "download_authorized": True, "tags": ["tamil", "friends", "rukku", "dance", "kodi"] },
  { "id": "tamil_3", "title": "Thendral Breeze Flute", "artist": "Pranesh Carnatic Lab", "album": "Tamil Acoustic Melodies", "duration": 235, "duration_str": "3:55", "language": "Tamil", "category": "Tamil Songs", "sections": ["recent", "tamil"], "cover_url": "static/images/tamil_melody_flute.svg", "audio_file": "tamil_melody_flute.mp3", "download_authorized": True, "tags": ["tamil", "aval", "flute", "carnatic", "melody"] },
  { "id": "tamil_4", "title": "Vaathi Kuthu Beat", "artist": "Anirudh Tribute Collective", "album": "Master", "duration": 222, "duration_str": "3:42", "language": "Tamil", "category": "Tamil Songs", "sections": ["trending", "tamil"], "cover_url": "static/images/vaathi_groove.svg", "audio_file": "vaathi_groove.mp3", "download_authorized": True, "tags": ["tamil", "kodi", "vaathi", "anirudh", "master", "thalapathy", "aval"] },
  { "id": "eng_1", "title": "Midnight City Lights", "artist": "Aura Dreamer", "album": "Lofi Night Whispers", "duration": 185, "duration_str": "3:05", "language": "English", "category": "English Songs", "sections": ["trending", "english"], "cover_url": "static/images/lofi_midnight_vibes.svg", "audio_file": "lofi_midnight_vibes.mp3", "download_authorized": True, "tags": ["english", "lofi", "chill"] },
  { "id": "eng_2", "title": "Neon Horizon 80s", "artist": "Cyber Pulse", "album": "Retrowave Odyssey", "duration": 215, "duration_str": "3:35", "language": "English", "category": "English Songs", "sections": ["recent", "english"], "cover_url": "static/images/neon_horizon_80s.svg", "audio_file": "neon_horizon_80s.mp3", "download_authorized": True, "tags": ["english", "synthwave", "retro"] },
  { "id": "eng_3", "title": "Acoustic Breeze", "artist": "Sunset Strings", "album": "Morning Coffee Sessions", "duration": 190, "duration_str": "3:10", "language": "English", "category": "English Songs", "sections": ["recent", "english"], "cover_url": "static/images/acoustic_breeze.svg", "audio_file": "acoustic_breeze.mp3", "download_authorized": True, "tags": ["english", "acoustic", "guitar"] },
  { "id": "mal_1", "title": "Kerala Monsoon Rains", "artist": "Malabar Ensemble", "album": "God's Own Country Beats", "duration": 240, "duration_str": "4:00", "language": "Malayalam", "category": "Malayalam Songs", "sections": ["trending", "malayalam"], "cover_url": "static/images/kerala_monsoon_flute.svg", "audio_file": "kerala_monsoon_flute.mp3", "download_authorized": True, "tags": ["malayalam", "kerala", "monsoon", "flute"] },
  { "id": "mal_2", "title": "Malare Piano Serenade", "artist": "Premam Tribute Ensemble", "album": "Romantic Malayalam", "duration": 225, "duration_str": "3:45", "language": "Malayalam", "category": "Malayalam Songs", "sections": ["trending", "malayalam"], "cover_url": "static/images/malare_piano_cover.svg", "audio_file": "malare_piano_cover.mp3", "download_authorized": True, "tags": ["malayalam", "malare", "premam", "piano"] },
  { "id": "mal_3", "title": "Alleppey Calm Waters", "artist": "Backwater Echoes", "album": "Backwater Soundscapes", "duration": 208, "duration_str": "3:28", "language": "Malayalam", "category": "Malayalam Songs", "sections": ["recent", "malayalam"], "cover_url": "static/images/alleppey_calm_stream.svg", "audio_file": "alleppey_calm_stream.mp3", "download_authorized": True, "tags": ["malayalam", "alleppey", "ambient"] },
  { "id": "inst_1", "title": "Cinematic Piano Dream", "artist": "Pranesh Orchestra", "album": "Symphonies of the Mind", "duration": 260, "duration_str": "4:20", "language": "Instrumental", "category": "Instrumental Music", "sections": ["trending", "instrumental"], "cover_url": "static/images/cinematic_piano_dream.svg", "audio_file": "cinematic_piano_dream.mp3", "download_authorized": True, "tags": ["instrumental", "piano", "cinematic"] },
  { "id": "inst_2", "title": "Chillhop Study Beats", "artist": "Coffee & Rain", "album": "Focus & Code Vol. 1", "duration": 198, "duration_str": "3:18", "language": "Instrumental", "category": "Instrumental Music", "sections": ["recent", "instrumental"], "cover_url": "static/images/chillhop_lofi_beat.svg", "audio_file": "chillhop_lofi_beat.mp3", "download_authorized": True, "tags": ["instrumental", "chillhop", "lofi"] },
  { "id": "inst_3", "title": "SoundHelix Symphony", "artist": "Open Music Archive", "album": "Algorithmic Harmony", "duration": 372, "duration_str": "6:12", "language": "Instrumental", "category": "Instrumental Music", "sections": ["recent", "instrumental"], "cover_url": "static/images/soundhelix_ambient.svg", "audio_file": "soundhelix_ambient.mp3", "download_authorized": True, "tags": ["instrumental", "soundhelix", "electronic"] }
]

DATA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "js", "songs_data.js")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
existing = json.loads(m.group(1))

# Exclude previous offline items by ID
offline_ids = {s["id"] for s in OFFLINE_16}
existing_filtered = [s for s in existing if s["id"] not in offline_ids]

final_list = OFFLINE_16 + existing_filtered

output = f"// Pranesh Music Hub - High-Definition Curated Catalogue (Fully Deduplicated)\nwindow.CATALOGUE_SONGS = {json.dumps(final_list, indent=2, ensure_ascii=False)};\n"
with open(DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output)

print(f"Successfully updated songs_data.js! Total songs: {len(final_list)}")
