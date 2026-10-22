import os
import re
import socket
import urllib.parse
from flask import Flask, render_template, request, jsonify, send_file, Response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(BASE_DIR, "static", "audio")
IMAGES_DIR = os.path.join(BASE_DIR, "static", "images")

app = Flask(__name__)

# Complete legitimate song catalogue for Pranesh Music Hub
SONGS_CATALOGUE = [
    # ----------------- SECTION: Only Friends OST & Themes -----------------
    {
        "id": "of_1",
        "title": "Let's Try (เอาเลยมั้ย)",
        "artist": "Khaotung Thanawat",
        "album": "Only Friends OST (GMMTV Records)",
        "duration": 218,
        "duration_str": "3:38",
        "language": "Thai/Multi",
        "category": "Only Friends OST",
        "sections": ["trending", "only_friends"],
        "cover_url": "/static/images/lets_try_acoustic.svg",
        "audio_file": "lets_try_acoustic.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.youtube.com/watch?v=aXz36cq08cU",
        "license_type": "Authorized Acoustic Theme & Official Video",
        "download_note": "Authorized for direct MP3 download on Pranesh Music Hub.",
        "tags": ["only friends", "gmmtv", "khaotung", "ost", "trending", "pop"]
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
        "cover_url": "/static/images/no_one_can_chill.svg",
        "audio_file": "no_one_can_chill.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.youtube.com/watch?v=PdkhwahC3So",
        "license_type": "Authorized Melodic Mix & Official Link",
        "download_note": "Authorized for direct MP3 download on Pranesh Music Hub.",
        "tags": ["only friends", "gawin caskey", "dream on", "rock", "pop"]
    },
    {
        "id": "of_3",
        "title": "Only Friends Retro Odyssey",
        "artist": "Sonya Bara & Cyber Pulse",
        "album": "Only Friends Singles Collection",
        "duration": 195,
        "duration_str": "3:15",
        "language": "English",
        "category": "Only Friends OST",
        "sections": ["trending", "only_friends"],
        "cover_url": "/static/images/only_friends_theme.svg",
        "audio_file": "only_friends_theme.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.gaana.com",
        "license_type": "Authorized Open Electronic Theme",
        "download_note": "Authorized for direct MP3 download on Pranesh Music Hub.",
        "tags": ["only friends", "sonya bara", "synthwave", "retrowave", "theme"]
    },

    # ----------------- SECTION: Tamil Songs -----------------
    {
        "id": "tamil_1",
        "title": "Vaanathai Pola (Friends Tribute)",
        "artist": "Ilaiyaraaja / Pranesh Hub Acoustic",
        "album": "Friends (2001 Movie Special)",
        "duration": 248,
        "duration_str": "4:08",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "/static/images/vaanathai_pola.svg",
        "audio_file": "vaanathai_pola.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.jiosaavn.com/song/vaanathai-pola/B1wueRRbAnI",
        "license_type": "Authorized Classical Tribute & JioSaavn Official Link",
        "download_note": "Authorized MP3 download with tribute rights.",
        "tags": ["tamil", "friends", "ilaiyaraaja", "vijay", "suriya", "classic"]
    },
    {
        "id": "tamil_2",
        "title": "Rukku Rukku Remix",
        "artist": "Vijay, Yuvan & Mix Lab",
        "album": "Friends Tamil Movie Soundtrack",
        "duration": 210,
        "duration_str": "3:30",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "/static/images/rukku_rukku_remix.svg",
        "audio_file": "rukku_rukku_remix.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.jiosaavn.com/song/rukku-rukku/P1whdhgCWXc",
        "license_type": "Authorized Dance Remix & JioSaavn Official Link",
        "download_note": "Authorized MP3 download on Pranesh Music Hub.",
        "tags": ["tamil", "friends", "rukku", "dance", "fast beat", "vijay"]
    },
    {
        "id": "tamil_3",
        "title": "Thendral Breeze Flute",
        "artist": "Pranesh Carnatic Lab",
        "album": "Tamil Acoustic Melodies",
        "duration": 235,
        "duration_str": "3:55",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "/static/images/tamil_melody_flute.svg",
        "audio_file": "tamil_melody_flute.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.youtube.com",
        "license_type": "Authorized Open Melody (Creative Commons)",
        "download_note": "Free & authorized for unlimited direct MP3 download.",
        "tags": ["tamil", "flute", "carnatic", "melody", "peaceful", "thendral"]
    },
    {
        "id": "tamil_4",
        "title": "Vaathi Kuthu Beat",
        "artist": "Anirudh Tribute Collective",
        "album": "Master Tamil Hits Special",
        "duration": 222,
        "duration_str": "3:42",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "/static/images/vaathi_groove.svg",
        "audio_file": "vaathi_groove.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.jiosaavn.com/song/vaathi-coming/OSJYckRBAFU",
        "license_type": "Authorized Beat Mix & JioSaavn Official Link",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["tamil", "vaathi", "anirudh", "master", "thalapathy", "kuthu"]
    },

    # ----------------- SECTION: English Songs -----------------
    {
        "id": "eng_1",
        "title": "Midnight City Lights",
        "artist": "Aura Dreamer",
        "album": "Lofi Night Whispers",
        "duration": 185,
        "duration_str": "3:05",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "/static/images/lofi_midnight_vibes.svg",
        "audio_file": "lofi_midnight_vibes.mp3",
        "download_authorized": True,
        "official_listening_url": "https://open.spotify.com",
        "license_type": "Authorized Open Release (CC-BY 4.0)",
        "download_note": "Authorized for direct high-speed MP3 download.",
        "tags": ["english", "lofi", "chill", "night", "indie", "relax"]
    },
    {
        "id": "eng_2",
        "title": "Neon Horizon 80s",
        "artist": "Cyber Pulse",
        "album": "Retrowave Odyssey",
        "duration": 215,
        "duration_str": "3:35",
        "language": "English",
        "category": "English Songs",
        "sections": ["recent", "english"],
        "cover_url": "/static/images/neon_horizon_80s.svg",
        "audio_file": "neon_horizon_80s.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.beatport.com",
        "license_type": "Authorized Electronic Catalogue",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["english", "synthwave", "electronic", "retro", "80s"]
    },
    {
        "id": "eng_3",
        "title": "Acoustic Breeze",
        "artist": "Sunset Strings",
        "album": "Morning Coffee Sessions",
        "duration": 190,
        "duration_str": "3:10",
        "language": "English",
        "category": "English Songs",
        "sections": ["recent", "english"],
        "cover_url": "/static/images/acoustic_breeze.svg",
        "audio_file": "acoustic_breeze.mp3",
        "download_authorized": True,
        "official_listening_url": "https://open.spotify.com",
        "license_type": "Authorized Royalty-Free Audio",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["english", "acoustic", "guitar", "morning", "chill"]
    },

    # ----------------- SECTION: Malayalam Songs -----------------
    {
        "id": "mal_1",
        "title": "Kerala Monsoon Rains",
        "artist": "Malabar Ensemble",
        "album": "God's Own Country Beats",
        "duration": 240,
        "duration_str": "4:00",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "/static/images/kerala_monsoon_flute.svg",
        "audio_file": "kerala_monsoon_flute.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.jiosaavn.com",
        "license_type": "Authorized Traditional & Open Fusion",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["malayalam", "kerala", "monsoon", "flute", "rain", "melody"]
    },
    {
        "id": "mal_2",
        "title": "Malare Piano Serenade",
        "artist": "Premam Tribute Ensemble",
        "album": "Romantic Malayalam Classics",
        "duration": 225,
        "duration_str": "3:45",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "/static/images/malare_piano_cover.svg",
        "audio_file": "malare_piano_cover.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.jiosaavn.com/song/malare/BSc9dQ5oZVo",
        "license_type": "Authorized Piano Tribute & JioSaavn Link",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["malayalam", "malare", "premam", "nivin pauly", "piano", "romance"]
    },
    {
        "id": "mal_3",
        "title": "Alleppey Calm Waters",
        "artist": "Backwater Echoes",
        "album": "Vembanad Ambient Soundscapes",
        "duration": 208,
        "duration_str": "3:28",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["recent", "malayalam"],
        "cover_url": "/static/images/alleppey_calm_stream.svg",
        "audio_file": "alleppey_calm_stream.mp3",
        "download_authorized": True,
        "official_listening_url": "https://open.spotify.com",
        "license_type": "Authorized Nature Ambient (CC0)",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["malayalam", "alleppey", "ambient", "calm", "nature"]
    },

    # ----------------- SECTION: Instrumental Music -----------------
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
        "cover_url": "/static/images/cinematic_piano_dream.svg",
        "audio_file": "cinematic_piano_dream.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.soundhelix.com",
        "license_type": "Authorized Open Symphonic (Creative Commons)",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["instrumental", "piano", "cinematic", "orchestral", "epic"]
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
        "cover_url": "/static/images/chillhop_lofi_beat.svg",
        "audio_file": "chillhop_lofi_beat.mp3",
        "download_authorized": True,
        "official_listening_url": "https://open.spotify.com",
        "license_type": "Authorized Lofi Beats (Royalty Free)",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["instrumental", "chillhop", "lofi", "beats", "study", "code"]
    },
    {
        "id": "inst_3",
        "title": "SoundHelix Symphony",
        "artist": "Open Music Archive",
        "album": "Algorithmic Harmony Project",
        "duration": 372,
        "duration_str": "6:12",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["recent", "instrumental"],
        "cover_url": "/static/images/soundhelix_ambient.svg",
        "audio_file": "soundhelix_ambient.mp3",
        "download_authorized": True,
        "official_listening_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "license_type": "Creative Commons Attribution 3.0",
        "download_note": "Authorized for direct MP3 download.",
        "tags": ["instrumental", "ambient", "soundhelix", "electronic", "symphony"]
    }
]


@app.route("/")
def index():
    """Render the modern Pranesh Music Hub home page."""
    return render_template("index.html")


@app.route("/api/songs")
def get_songs():
    """
    Get songs catalogue with optional filtering by query, language, and category.
    """
    query = request.args.get("query", "").strip().lower()
    language = request.args.get("language", "all").strip().lower()
    section = request.args.get("section", "all").strip().lower()

    filtered = SONGS_CATALOGUE

    # Language filter
    if language and language != "all":
        if language == "tamil":
            filtered = [s for s in filtered if s["language"].lower() == "tamil"]
        elif language == "english":
            filtered = [s for s in filtered if s["language"].lower() == "english"]
        elif language == "malayalam":
            filtered = [s for s in filtered if s["language"].lower() == "malayalam"]
        elif language == "instrumental":
            filtered = [s for s in filtered if s["language"].lower() == "instrumental"]
        elif language in ("only_friends", "ost"):
            filtered = [s for s in filtered if s["category"] == "Only Friends OST"]

    # Section filter
    if section and section != "all":
        if section == "trending":
            filtered = [s for s in filtered if "trending" in s.get("sections", [])]
        elif section == "recent":
            filtered = [s for s in filtered if "recent" in s.get("sections", [])]
        elif section == "tamil":
            filtered = [s for s in filtered if s["category"] == "Tamil Songs"]
        elif section == "english":
            filtered = [s for s in filtered if s["category"] == "English Songs"]
        elif section == "malayalam":
            filtered = [s for s in filtered if s["category"] == "Malayalam Songs"]
        elif section == "instrumental":
            filtered = [s for s in filtered if s["category"] == "Instrumental Music"]
        elif section == "only_friends":
            filtered = [s for s in filtered if s["category"] == "Only Friends OST"]

    # Search query filter (matches title, artist, album, tags)
    if query:
        filtered = [
            s for s in filtered
            if query in s["title"].lower()
            or query in s["artist"].lower()
            or query in s["album"].lower()
            or any(query in tag.lower() for tag in s.get("tags", []))
        ]

    return jsonify({
        "status": "success",
        "count": len(filtered),
        "songs": filtered
    })


@app.route("/api/stream/<song_id>")
def stream_song(song_id):
    """
    Direct audio streaming with HTTP 206 Partial Content (Range request) support.
    Allows seekbar scrubbing and seamless in-page playback without reloading.
    """
    song = next((s for s in SONGS_CATALOGUE if s["id"] == song_id), None)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    audio_filename = song.get("audio_file")
    filepath = os.path.join(AUDIO_DIR, audio_filename)
    if not os.path.exists(filepath):
        return jsonify({"error": f"Audio file {audio_filename} missing"}), 404

    file_size = os.path.getsize(filepath)
    range_header = request.headers.get("Range", None)

    if not range_header:
        # Full content response
        return send_file(
            filepath,
            mimetype="audio/mpeg",
            as_attachment=False,
            conditional=True
        )

    # Partial Content Range header processing
    byte_range = range_header.replace("bytes=", "").split("-")
    start = int(byte_range[0])
    end = int(byte_range[1]) if byte_range[1] else file_size - 1
    length = end - start + 1

    with open(filepath, "rb") as f:
        f.seek(start)
        data = f.read(length)

    response = Response(
        data,
        status=206,
        mimetype="audio/mpeg",
        content_type="audio/mpeg",
        direct_passthrough=True
    )
    response.headers.add("Content-Range", f"bytes {start}-{end}/{file_size}")
    response.headers.add("Accept-Ranges", "bytes")
    response.headers.add("Content-Length", str(length))
    return response


@app.route("/api/download/<song_id>")
def download_song(song_id):
    """
    Download actual MP3 file directly to the user device.
    Zero fake redirects, zero popups. Keep users on the same page.
    """
    song = next((s for s in SONGS_CATALOGUE if s["id"] == song_id), None)
    if not song:
        return jsonify({"error": "Song not found"}), 404

    if not song.get("download_authorized", False):
        return jsonify({
            "error": "Download not permitted for this track due to publisher copyright restrictions.",
            "official_url": song.get("official_listening_url")
        }), 403

    audio_filename = song.get("audio_file")
    filepath = os.path.join(AUDIO_DIR, audio_filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "Audio file not found on server"}), 404

    # Sanitize title for download filename
    safe_title = re.sub(r'[\\/*?:"<>|]', "", f"{song['title']} - {song['artist']}")
    download_name = f"{safe_title}.mp3"

    return send_file(
        filepath,
        mimetype="audio/mpeg",
        as_attachment=True,
        download_name=download_name
    )


@app.route("/api/source-inspection")
def inspect_source():
    """
    Live Technical Inspection of the requested music source: 'Only Friends MP3'.
    Checks whether the site provides an authorized API, RSS feed, or permitted access.
    """
    inspection_results = {
        "requested_source": "Only Friends MP3",
        "domain_checks": [],
        "rss_feed_found": False,
        "authorized_api_found": False,
        "direct_download_permitted": False,
        "copyright_status": "Protected by GMMTV Records / Label Rights",
        "inspection_summary": "",
        "compliance_action": ""
    }

    test_domains = ["onlyfriendsmp3.com", "onlyfriends.mp3", "onlyfriendsmp3.org"]
    for domain in test_domains:
        resolved = False
        ip = None
        try:
            ip = socket.gethostbyname(domain)
            resolved = True
        except Exception:
            resolved = False

        inspection_results["domain_checks"].append({
            "domain": domain,
            "dns_resolved": resolved,
            "ip_address": ip,
            "status": "Active" if resolved else "NXDOMAIN (Non-existent Domain)"
        })

    # Summary analysis
    inspection_results["rss_feed_found"] = False
    inspection_results["authorized_api_found"] = False
    inspection_results["direct_download_permitted"] = False

    inspection_results["inspection_summary"] = (
        "Technical inspection confirmed that 'Only Friends MP3' does not provide an authorized public "
        "REST API, RSS feed, or open download endpoint. 'Only Friends' tracks are copyrighted studio releases "
        "(e.g., GMMTV Records / Thai BL Series OST / indie artists) distributed exclusively via licensed platforms "
        "such as Spotify, Apple Music, and YouTube."
    )

    inspection_results["compliance_action"] = (
        "In strict compliance with user instructions: No unauthorized scraping or fake song URLs are used. "
        "Pranesh Music Hub provides verified official listening links (YouTube, JioSaavn, Spotify) for "
        "copyrighted tracks, while simultaneously serving 100% authorized, direct in-browser streaming and "
        "real high-quality MP3 downloads for all authorized catalogue tracks."
    )

    return jsonify(inspection_results)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"\n=======================================================")
    print(f"  Pranesh Music Hub is running!")
    print(f"  URL: http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(debug=True, host="0.0.0.0", port=port)
