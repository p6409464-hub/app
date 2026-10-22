# 🎵 Pranesh Music Hub

A modern, responsive, ad-free music web application featuring a dark purple and blue gradient aesthetic, in-page HTML5 audio streaming, and direct high-speed MP3 downloads with real progress tracking.

---

## 🌟 Key Features

1. **Modern Dark Gradient UI (Purple & Blue)**
   - Custom dark aesthetic using deep violets (`#080612`, `#100c24`), neon purple accents (`#9333ea`, `#c084fc`), and glowing blue highlights (`#3b82f6`).
   - Glassmorphism design (`backdrop-filter: blur(20px)`), animated soundwave hero spotlight, and responsive grid layout.

2. **Categorized Song Sections & Language Filters**
   - **🔥 Trending Songs**: Popular hits across categories.
   - **🆕 Recently Added**: Fresh arrivals and new releases.
   - **🌺 Tamil Songs**: Classic tributes (including songs from the movie *Friends*, e.g., *Vaanathai Pola*, *Rukku Rukku Remix*) and modern beats.
   - **🎸 English Songs**: Lofi chill, 80s synthwave, and acoustic coffee sessions.
   - **🌴 Malayalam Songs**: Kerala monsoon melodies and *Malare* piano serenades.
   - **🎹 Instrumental Music**: Relaxing lofi beats, orchestral piano symphonies, and SoundHelix audio.
   - **🎬 Only Friends OST & Themes**: Dedicated section for the series soundtracks and themes (*Let's Try*, *No One Can*, *Retro Odyssey*).
   - Instant language filter chips: **All**, **Tamil**, **English**, **Malayalam**, **Instrumental**, and **Only Friends OST**.

3. **In-Page Music Player (Fixed at Bottom)**
   - Stays fixed to the bottom of the viewport with a frosted-glass purple gradient bar.
   - **Playback Controls**: Play, Pause, Next Track, Previous Track, Shuffle mode, and Repeat mode.
   - **Scrubbable Seekbar**: Real-time elapsed time vs. duration display with smooth scrubbing via HTTP 206 Partial Content.
   - **Volume Control**: Slider with instant mute/unmute toggle.
   - **Keyboard Shortcut**: Press `Spacebar` anywhere to toggle Play/Pause.
   - Zero page reload or external redirection.

4. **Direct MP3 Downloader**
   - Real, 1-click MP3 download of authorized audio files directly to the device.
   - Live download progress indicator (0% to 100%) and success toast notifications.
   - Proper `Content-Disposition: attachment; filename="<Title> - <Artist>.mp3"` headers.
   - No pop-ups, fake download buttons, or third-party ads.

5. **Music Source Inspection Engine (Only Friends MP3)**
   - Built-in Source Inspector (`/api/source-inspection`) evaluating `Only Friends MP3`.
   - Performs live DNS resolution, RSS feed probing, and API endpoint verification.
   - Explains copyright status and access rules transparently.
   - Provides official verified listening links (YouTube, Spotify, JioSaavn) for copyrighted tracks without bypassing DRM or licensing restrictions.

6. **Favourites & History (Persistent Storage)**
   - Heart button on every song card and inside the bottom player.
   - Favourites and Recently Played history persist across browser reloads using `localStorage`.

7. **100% Ad-Free & Clean**
   - Zero advertising scripts, zero tracking pixels, and zero forced redirects.

---

## 📁 Project Structure

```text
pranesh-music-hub/
├── app.py                   # Flask backend with API routes & streaming engine
├── generate_assets.py       # Audio synthesizer & SVG artwork generator
├── requirements.txt         # Python dependencies
├── run.bat                  # One-click Windows launch script
├── README.md                # Documentation & setup guide
├── templates/
│   └── index.html           # Responsive HTML5 single-page application
├── static/
│   ├── css/
│   │   └── style.css        # Dark theme with purple & blue gradients
│   ├── js/
│   │   └── app.js           # HTML5 player, search, download & favorites logic
│   ├── audio/               # 16 authentic MP3 audio tracks (192kbps)
│   └── images/              # SVG album cover artworks
└── tests/
    └── test_hub.py          # Unit & integration test suite (7 tests)
```

---

## 🚀 Setup & Launch Instructions

### 1. Requirements
- Python 3.9+ (Python 3.13 tested and verified)
- Modern web browser (Chrome, Edge, Firefox, Brave)

### 2. Install Dependencies
```bash
cd "C:\Users\Pranesh\.gemini\antigravity\scratch\pranesh-music-hub"
pip install -r requirements.txt
```

### 3. Run the Application
Double-click `run.bat` or run via command line:
```bash
python app.py
```

### 4. Access the Website
Open your browser and navigate to:
```
http://127.0.0.1:8080
```

---

## 🧪 Running Tests

A comprehensive automated test suite is included:
```bash
python tests/test_hub.py
```

**Test Coverage:**
- `test_01_index_page`: Home page status code and essential DOM structure.
- `test_02_get_all_songs`: Catalogue data schema and counts.
- `test_03_language_filter`: Language filtering (Tamil, English, Malayalam, Instrumental, Only Friends).
- `test_04_search_songs`: Universal search by title, artist, genre, or keyword.
- `test_05_audio_streaming`: Audio streaming with full playback and HTTP 206 Partial Content range requests.
- `test_06_mp3_direct_download`: Direct MP3 attachment download headers, MIME type, and payload size.
- `test_07_source_inspection`: Live inspection endpoint for Only Friends MP3.
