/**
 * Pranesh Music Hub - Main Application Script
 * Features:
 * - 100% Static GitHub Pages Compatible & In-Page HTML5 Audio Engine
 * - Instant 0ms Full Catalogue Search across 250+ songs (Title, Artist, Movie Album, Language, Tags)
 * - Individual Song Cards with Album Artwork, Artist, Movie Badge, and Actions
 * - Robust Play, Pause, Next, Previous, Seekbar, Shuffle, Repeat & Volume Controls
 * - Graceful Audio Error Handling, Buffering Indicators & Auto-advance
 * - Compliant Download Handling: Authorized Offline Saves & Stream-Only Indicators
 * - Safe LocalStorage Favourites & Listening History with Clear History Option
 * - Responsive Mobile-First Design with Accessible Touch Targets
 */

// ==========================================================================
// 1. Storage & State Management
// ==========================================================================

function safeGetStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) ? (Array.isArray(parsed) ? parsed : fallback) : parsed;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return fallback;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] Failed to save ${key}:`, err);
  }
}

// Built-in offline audio library (16 royalty-free / open / theme recordings in static/audio/)
const DEFAULT_STATIC_SONGS = [
  { id: "of_1", title: "Let's Try (เอาเลยมั้ย)", artist: "Khaotung Thanawat", album: "Only Friends OST", duration: 218, duration_str: "3:38", language: "Thai/Multi", category: "Only Friends OST", sections: ["trending", "only_friends"], cover_url: "static/images/lets_try_acoustic.svg", audio_file: "lets_try_acoustic.mp3", download_authorized: true, tags: ["only friends", "gmmtv", "khaotung", "ost", "trending"] },
  { id: "of_2", title: "No One Can (ห้ามแตะ)", artist: "Gawin Caskey", album: "Only Friends : Dream On", duration: 204, duration_str: "3:24", language: "Thai/Multi", category: "Only Friends OST", sections: ["recent", "only_friends"], cover_url: "static/images/no_one_can_chill.svg", audio_file: "no_one_can_chill.mp3", download_authorized: true, tags: ["only friends", "gawin caskey", "dream on"] },
  { id: "of_3", title: "Only Friends Retro Odyssey", artist: "Sonya Bara & Cyber Pulse", album: "Only Friends Singles", duration: 195, duration_str: "3:15", language: "English", category: "Only Friends OST", sections: ["trending", "only_friends"], cover_url: "static/images/only_friends_theme.svg", audio_file: "only_friends_theme.mp3", download_authorized: true, tags: ["only friends", "synthwave"] },
  { id: "tamil_1", title: "Vaanathai Pola", artist: "Ilaiyaraaja / Pranesh Hub", album: "Friends", duration: 248, duration_str: "4:08", language: "Tamil", category: "Tamil Songs", sections: ["trending", "tamil"], cover_url: "static/images/vaanathai_pola.svg", audio_file: "vaanathai_pola.mp3", download_authorized: true, tags: ["tamil", "friends", "kodi", "ilaiyaraaja", "vijay", "suriya"] },
  { id: "tamil_2", title: "Rukku Rukku Remix", artist: "Vijay, Yuvan & Mix Lab", album: "Friends", duration: 210, duration_str: "3:30", language: "Tamil", category: "Tamil Songs", sections: ["recent", "tamil"], cover_url: "static/images/rukku_rukku_remix.svg", audio_file: "rukku_rukku_remix.mp3", download_authorized: true, tags: ["tamil", "friends", "rukku", "dance", "kodi"] },
  { id: "tamil_3", title: "Thendral Breeze Flute", artist: "Pranesh Carnatic Lab", album: "Tamil Acoustic Melodies", duration: 235, duration_str: "3:55", language: "Tamil", category: "Tamil Songs", sections: ["recent", "tamil"], cover_url: "static/images/tamil_melody_flute.svg", audio_file: "tamil_melody_flute.mp3", download_authorized: true, tags: ["tamil", "aval", "flute", "carnatic", "melody"] },
  { id: "tamil_4", title: "Vaathi Kuthu Beat", artist: "Anirudh Tribute Collective", album: "Master", duration: 222, duration_str: "3:42", language: "Tamil", category: "Tamil Songs", sections: ["trending", "tamil"], cover_url: "static/images/vaathi_groove.svg", audio_file: "vaathi_groove.mp3", download_authorized: true, tags: ["tamil", "kodi", "vaathi", "anirudh", "master", "thalapathy", "aval"] },
  { id: "eng_1", title: "Midnight City Lights", artist: "Aura Dreamer", album: "Lofi Night Whispers", duration: 185, duration_str: "3:05", language: "English", category: "English Songs", sections: ["trending", "english"], cover_url: "static/images/lofi_midnight_vibes.svg", audio_file: "lofi_midnight_vibes.mp3", download_authorized: true, tags: ["english", "lofi", "chill"] },
  { id: "eng_2", title: "Neon Horizon 80s", artist: "Cyber Pulse", album: "Retrowave Odyssey", duration: 215, duration_str: "3:35", language: "English", category: "English Songs", sections: ["recent", "english"], cover_url: "static/images/neon_horizon_80s.svg", audio_file: "neon_horizon_80s.mp3", download_authorized: true, tags: ["english", "synthwave", "retro"] },
  { id: "eng_3", title: "Acoustic Breeze", artist: "Sunset Strings", album: "Morning Coffee Sessions", duration: 190, duration_str: "3:10", language: "English", category: "English Songs", sections: ["recent", "english"], cover_url: "static/images/acoustic_breeze.svg", audio_file: "acoustic_breeze.mp3", download_authorized: true, tags: ["english", "acoustic", "guitar"] },
  { id: "mal_1", title: "Kerala Monsoon Rains", artist: "Malabar Ensemble", album: "God's Own Country Beats", duration: 240, duration_str: "4:00", language: "Malayalam", category: "Malayalam Songs", sections: ["trending", "malayalam"], cover_url: "static/images/kerala_monsoon_flute.svg", audio_file: "kerala_monsoon_flute.mp3", download_authorized: true, tags: ["malayalam", "kerala", "monsoon", "flute"] },
  { id: "mal_2", title: "Malare Piano Serenade", artist: "Premam Tribute Ensemble", album: "Romantic Malayalam", duration: 225, duration_str: "3:45", language: "Malayalam", category: "Malayalam Songs", sections: ["trending", "malayalam"], cover_url: "static/images/malare_piano_cover.svg", audio_file: "malare_piano_cover.mp3", download_authorized: true, tags: ["malayalam", "malare", "premam", "piano"] },
  { id: "mal_3", title: "Alleppey Calm Waters", artist: "Backwater Echoes", album: "Backwater Soundscapes", duration: 208, duration_str: "3:28", language: "Malayalam", category: "Malayalam Songs", sections: ["recent", "malayalam"], cover_url: "static/images/alleppey_calm_stream.svg", audio_file: "alleppey_calm_stream.mp3", download_authorized: true, tags: ["malayalam", "alleppey", "ambient"] },
  { id: "inst_1", title: "Cinematic Piano Dream", artist: "Pranesh Orchestra", album: "Symphonies of the Mind", duration: 260, duration_str: "4:20", language: "Instrumental", category: "Instrumental Music", sections: ["trending", "instrumental"], cover_url: "static/images/cinematic_piano_dream.svg", audio_file: "cinematic_piano_dream.mp3", download_authorized: true, tags: ["instrumental", "piano", "cinematic"] },
  { id: "inst_2", title: "Chillhop Study Beats", artist: "Coffee & Rain", album: "Focus & Code Vol. 1", duration: 198, duration_str: "3:18", language: "Instrumental", category: "Instrumental Music", sections: ["recent", "instrumental"], cover_url: "static/images/chillhop_lofi_beat.svg", audio_file: "chillhop_lofi_beat.mp3", download_authorized: true, tags: ["instrumental", "chillhop", "lofi"] },
  { id: "inst_3", title: "SoundHelix Symphony", artist: "Open Music Archive", album: "Algorithmic Harmony", duration: 372, duration_str: "6:12", language: "Instrumental", category: "Instrumental Music", sections: ["recent", "instrumental"], cover_url: "static/images/soundhelix_ambient.svg", audio_file: "soundhelix_ambient.mp3", download_authorized: true, tags: ["instrumental", "soundhelix", "electronic"] }
];

// Clean up any stale ephemeral Cloudflare tunnels from localStorage
try {
  const storedApi = localStorage.getItem("pranesh_api_url");
  if (storedApi && (storedApi.includes("trycloudflare.com") || storedApi.includes("loca.lt") || storedApi.includes("ngrok"))) {
    localStorage.removeItem("pranesh_api_url");
  }
} catch (_) {}

// Optional custom backend endpoint (supports query param ?api=... or localhost)
const urlParams = (typeof window !== "undefined" && window.location) ? new URLSearchParams(window.location.search) : new URLSearchParams();
let configuredApi = urlParams.get("api") || "";
if (!configuredApi && typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
  configuredApi = localStorage.getItem("pranesh_api_url") || "";
}
const API_BASE = configuredApi ? configuredApi.replace(/\/+$/, "") : "";

const AppState = {
  masterSongs: [],       // Immutable master catalogue (never mutated or permanently filtered)
  songs: [],             // Active browsing list
  searchResults: [],     // Current search matches
  searchQuery: "",       // Active raw search query
  normalizedQuery: "",   // Active normalized search query
  isSearching: false,
  searchRequestId: 0,    // Monotonic ID preventing async race conditions
  searchDebounceTimer: null,
  activeSearchAbortController: null,
  searchError: null,     // Holds error state for user retry
  currentSong: null,
  currentSongIndex: -1,
  isPlaying: false,
  isLoading: false,
  isShuffle: false,
  isRepeat: false,
  volume: parseFloat(localStorage.getItem("pranesh_hub_vol") || "0.85"),
  isMuted: false,
  activeLanguage: "all",
  activeSection: "all",
  currentPage: 1,        // Active pagination page
  pageSize: 24,          // Number of tracks per page chunk
  favourites: safeGetStorage("pranesh_hub_favs", []),
  history: safeGetStorage("pranesh_hub_history", []),
  queue: []
};

// Global HTML5 Audio Element (DOM-attached for mobile compliance)
const audioPlayer = document.getElementById("mainAudioPlayer") || new Audio();
audioPlayer.preload = "auto";
audioPlayer.volume = AppState.volume;

// Mobile Audio Context Unblocker
let audioUnlocked = false;
function unlockMobileAudio() {
  if (audioUnlocked) return;
  audioPlayer.play().then(() => {
    audioPlayer.pause();
    audioUnlocked = true;
  }).catch(() => {
    audioUnlocked = true;
  });
  document.removeEventListener("touchstart", unlockMobileAudio);
  document.removeEventListener("touchend", unlockMobileAudio);
  document.removeEventListener("click", unlockMobileAudio);
}
document.addEventListener("touchstart", unlockMobileAudio, { passive: true, once: true });
document.addEventListener("touchend", unlockMobileAudio, { passive: true, once: true });
document.addEventListener("click", unlockMobileAudio, { passive: true, once: true });

// DOM Elements
const DOM = {
  searchInput: null,
  clearSearchBtn: null,
  langChips: [],
  sectionPills: [],
  contentContainer: null,
  emptyState: null,
  emptySearchQuery: null,
  resetSearchBtn: null,
  playerBar: null,
  playerThumb: null,
  playerTitle: null,
  playerArtist: null,
  playerFavBtn: null,
  playerDownloadBtn: null,
  playPauseBtn: null,
  playPauseIcon: null,
  prevBtn: null,
  nextBtn: null,
  shuffleBtn: null,
  repeatBtn: null,
  currentTimeEl: null,
  durationTimeEl: null,
  seekbar: null,
  volumeBtn: null,
  volumeIcon: null,
  volumeSlider: null,
  toastContainer: null
};

function refreshDOMElements() {
  if (typeof document === "undefined") return;
  DOM.searchInput = document.getElementById("searchInput");
  DOM.clearSearchBtn = document.getElementById("clearSearchBtn");
  DOM.langChips = document.querySelectorAll(".lang-chip");
  DOM.sectionPills = document.querySelectorAll(".section-pill");
  DOM.contentContainer = document.getElementById("contentContainer");
  DOM.emptyState = document.getElementById("emptyState");
  DOM.emptySearchQuery = document.getElementById("emptySearchQuery");
  DOM.resetSearchBtn = document.getElementById("resetSearchBtn");
  DOM.playerBar = document.getElementById("playerBar");
  DOM.playerThumb = document.getElementById("playerThumb");
  DOM.playerTitle = document.getElementById("playerTitle");
  DOM.playerArtist = document.getElementById("playerArtist");
  DOM.playerFavBtn = document.getElementById("playerFavBtn");
  DOM.playerDownloadBtn = document.getElementById("playerDownloadBtn");
  DOM.playPauseBtn = document.getElementById("playPauseBtn");
  DOM.playPauseIcon = document.getElementById("playPauseIcon");
  DOM.prevBtn = document.getElementById("prevBtn");
  DOM.nextBtn = document.getElementById("nextBtn");
  DOM.shuffleBtn = document.getElementById("shuffleBtn");
  DOM.repeatBtn = document.getElementById("repeatBtn");
  DOM.currentTimeEl = document.getElementById("currentTime");
  DOM.durationTimeEl = document.getElementById("durationTime");
  DOM.seekbar = document.getElementById("seekbar");
  DOM.volumeBtn = document.getElementById("volumeBtn");
  DOM.volumeIcon = document.getElementById("volumeIcon");
  DOM.volumeSlider = document.getElementById("volumeSlider");
  DOM.toastContainer = document.getElementById("toastContainer");
}

// Initial binding attempt
refreshDOMElements();

// ==========================================================================
// 2. Initialization & Event Listeners
// ==========================================================================

let appInitialized = false;
let listenersAttached = false;

function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;
  refreshDOMElements();
  setupEventListeners();
  loadCatalogue();
}

// Expose for testing or explicit invocation
if (typeof window !== "undefined") {
  window.initializeApp = initializeApp;
}

// Execute immediately if DOM is ready; otherwise listen for DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
}

function setupEventListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  refreshDOMElements();
  // Live Instant Search Bar with 0ms deterministic local response
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", (e) => {
      executeSearch(e.target.value);
    });

    DOM.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        executeSearch(DOM.searchInput.value);
      } else if (e.key === "Escape") {
        if (DOM.searchInput) DOM.searchInput.value = "";
        executeSearch("");
      }
    });
  }

  // Clear Search Button
  if (DOM.clearSearchBtn) {
    DOM.clearSearchBtn.addEventListener("click", () => {
      if (DOM.searchInput) {
        DOM.searchInput.value = "";
        DOM.searchInput.focus();
      }
      executeSearch("");
    });
  }

  // Reset Search & Filters Button
  if (DOM.resetSearchBtn) {
    DOM.resetSearchBtn.addEventListener("click", () => {
      if (DOM.searchInput) DOM.searchInput.value = "";
      AppState.activeLanguage = "all";
      AppState.activeSection = "all";
      updateActivePills();
      executeSearch("");
    });
  }

  // Language Chips
  DOM.langChips.forEach(chip => {
    chip.addEventListener("click", () => {
      DOM.langChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      AppState.activeLanguage = chip.dataset.lang || "all";
      AppState.currentPage = 1;
      if (AppState.searchQuery) {
        executeSearch(AppState.searchQuery);
      } else {
        renderContent();
      }
    });
  });

  // Section Navigation Pills (All, Trending, Recent, Favourites, History)
  DOM.sectionPills.forEach(pill => {
    pill.addEventListener("click", () => {
      DOM.sectionPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      AppState.activeSection = pill.dataset.section || "all";
      AppState.currentPage = 1;
      // Clear search when intentionally navigating to a section view
      if (AppState.searchQuery) {
        if (DOM.searchInput) DOM.searchInput.value = "";
        executeSearch("");
      } else {
        renderContent();
      }
    });
  });

  // Audio Player Event Listeners
  audioPlayer.addEventListener("loadstart", () => {
    AppState.isLoading = true;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏳";
    updatePlayingCardHighlight();
  });

  audioPlayer.addEventListener("waiting", () => {
    AppState.isLoading = true;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏳";
    updatePlayingCardHighlight();
  });

  audioPlayer.addEventListener("canplay", () => {
    AppState.isLoading = false;
    if (AppState.isPlaying && DOM.playPauseIcon) {
      DOM.playPauseIcon.textContent = "⏸";
    }
  });

  audioPlayer.addEventListener("playing", () => {
    AppState.isLoading = false;
    AppState.isPlaying = true;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
    updatePlayingCardHighlight();
  });

  audioPlayer.addEventListener("pause", () => {
    AppState.isPlaying = false;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
    updatePlayingCardHighlight();
  });

  audioPlayer.addEventListener("timeupdate", updateSeekbar);

  audioPlayer.addEventListener("loadedmetadata", () => {
    if (DOM.durationTimeEl) {
      DOM.durationTimeEl.textContent = formatTime(audioPlayer.duration || 0);
    }
  });

  audioPlayer.addEventListener("ended", handleTrackEnded);

  audioPlayer.addEventListener("error", (e) => {
    console.error("Audio playback error:", e);
    AppState.isLoading = false;
    AppState.isPlaying = false;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
    updatePlayingCardHighlight();

    // If an alternative CDN URL exists, try it once
    if (AppState.currentSong && AppState.currentSong.audio_url && audioPlayer.src !== AppState.currentSong.audio_url) {
      console.log("Retrying audio playback with alternate CDN source...");
      audioPlayer.src = AppState.currentSong.audio_url;
      audioPlayer.play().catch(() => {});
      return;
    }

    showToast("⚠️ This audio stream is currently unavailable. Playing next track...", "error");
    setTimeout(() => {
      playNextSong();
    }, 1200);
  });

  // Seekbar Control
  if (DOM.seekbar) {
    DOM.seekbar.addEventListener("input", (e) => {
      if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const seekTo = (parseFloat(e.target.value) / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTo;
      }
    });
  }

  // Playback Controls
  if (DOM.playPauseBtn) DOM.playPauseBtn.addEventListener("click", togglePlayPause);
  if (DOM.prevBtn) DOM.prevBtn.addEventListener("click", playPreviousSong);
  if (DOM.nextBtn) DOM.nextBtn.addEventListener("click", playNextSong);

  if (DOM.shuffleBtn) {
    DOM.shuffleBtn.addEventListener("click", () => {
      AppState.isShuffle = !AppState.isShuffle;
      DOM.shuffleBtn.classList.toggle("active", AppState.isShuffle);
      showToast(AppState.isShuffle ? "🔀 Shuffle Enabled" : "Shuffle Disabled");
    });
  }

  if (DOM.repeatBtn) {
    DOM.repeatBtn.addEventListener("click", () => {
      AppState.isRepeat = !AppState.isRepeat;
      DOM.repeatBtn.classList.toggle("active", AppState.isRepeat);
      showToast(AppState.isRepeat ? "🔁 Repeat Enabled" : "Repeat Disabled");
    });
  }

  // Volume Controls
  if (DOM.volumeSlider) {
    DOM.volumeSlider.value = AppState.volume;
    DOM.volumeSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      AppState.volume = val;
      audioPlayer.volume = val;
      AppState.isMuted = val === 0;
      safeSetStorage("pranesh_hub_vol", val);
      updateVolumeIcon();
    });
  }

  if (DOM.volumeBtn) {
    DOM.volumeBtn.addEventListener("click", () => {
      if (AppState.isMuted) {
        audioPlayer.volume = AppState.volume || 0.85;
        if (DOM.volumeSlider) DOM.volumeSlider.value = audioPlayer.volume;
        AppState.isMuted = false;
      } else {
        audioPlayer.volume = 0;
        if (DOM.volumeSlider) DOM.volumeSlider.value = 0;
        AppState.isMuted = true;
      }
      updateVolumeIcon();
    });
  }

  // Player Bar Actions
  if (DOM.playerFavBtn) {
    DOM.playerFavBtn.addEventListener("click", () => {
      if (AppState.currentSong) toggleFavourite(AppState.currentSong.id);
    });
  }

  if (DOM.playerDownloadBtn) {
    DOM.playerDownloadBtn.addEventListener("click", () => {
      if (AppState.currentSong) handleDownloadAction(AppState.currentSong);
    });
  }

  // Hero Play Button
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener("click", () => {
      if (AppState.songs.length > 0) playSong(AppState.songs[0]);
    });
  }

  // Spacebar Keyboard Shortcut
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    }
  });
}

// ==========================================================================
// 3. String Normalization & Multi-Field Search Matching
// ==========================================================================

function normalizeSearchText(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .toLowerCase()
    .replace(/['’`"“”«»]/g, "") // remove quotes/apostrophes so "let's" == "lets"
    .replace(/[-_.,/#!$%^&*;:{}=~()\[\]]/g, " ") // replace word separators with space to avoid word fusion
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

function normalizeCompact(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // completely compact alphanumeric string
}

function prepareSongSearchMetadata(song) {
  const title = song.title || song.name || "";
  const artist = song.artist || song.singer || song.artists || "";
  const album = song.album || song.movie || "";
  const lang = song.language || song.lang || "";
  const category = song.category || song.genre || "";
  const rawTags = song.tags || [];
  const normTags = Array.isArray(rawTags) 
    ? rawTags.map(t => normalizeSearchText(t)) 
    : (typeof rawTags === "string" ? [normalizeSearchText(rawTags)] : []);

  const normTitle = normalizeSearchText(title);
  const normArtist = normalizeSearchText(artist);
  const normAlbum = normalizeSearchText(album);
  const normLang = normalizeSearchText(lang);
  const normCategory = normalizeSearchText(category);

  const searchCorpus = [normTitle, normArtist, normAlbum, normLang, normCategory, ...normTags].join(" ");
  const compactCorpus = normalizeCompact([normTitle, normArtist, normAlbum, normLang, normCategory, ...normTags].join(" "));

  return {
    ...song,
    title: title,
    artist: artist,
    album: album,
    language: lang,
    category: category,
    _normTitle: normTitle,
    _normArtist: normArtist,
    _normAlbum: normAlbum,
    _normLang: normLang,
    _normCategory: normCategory,
    _normTags: normTags,
    _searchCorpus: searchCorpus,
    _compactCorpus: compactCorpus
  };
}

function matchSongQuery(song, rawQuery) {
  if (!rawQuery) return true;
  if (!song) return false;

  const normQuery = normalizeSearchText(rawQuery);
  const compactQuery = normalizeCompact(rawQuery);
  if (!normQuery && !compactQuery) return true;

  const corpus = song._searchCorpus || normalizeSearchText([
    song.title || song.name || "",
    song.artist || song.singer || "",
    song.album || song.movie || "",
    song.language || song.lang || "",
    song.category || song.genre || "",
    ...(song.tags || [])
  ].join(" "));

  const compactCorpus = song._compactCorpus || normalizeCompact([
    song.title || song.name || "",
    song.artist || song.singer || "",
    song.album || song.movie || "",
    song.language || song.lang || "",
    song.category || song.genre || "",
    ...(song.tags || [])
  ].join(" "));

  // 1. Exact phrase match
  if (normQuery && corpus.includes(normQuery)) return true;

  // 2. Compact match (e.g. "ar rahman" matches "A.R. Rahman", "kgf" matches "K.G.F.", "naatunaatu" matches "Naatu Naatu")
  if (compactQuery && compactCorpus.includes(compactQuery)) return true;

  // 3. Multi-token match: every token in the query must match in corpus OR compactCorpus
  const tokens = normQuery ? normQuery.split(" ").filter(Boolean) : [];
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every(token => {
      const compactToken = normalizeCompact(token);
      return corpus.includes(token) || (compactToken && compactCorpus.includes(compactToken));
    });
    if (allTokensMatch) return true;
  }

  return false;
}

// ==========================================================================
// 4. Catalogue Loader & Deduplicated Merging
// ==========================================================================

function loadCatalogue() {
  const rawCatalogue = (typeof window !== "undefined" && window.CATALOGUE_SONGS && Array.isArray(window.CATALOGUE_SONGS) && window.CATALOGUE_SONGS.length > 0)
    ? window.CATALOGUE_SONGS
    : [];

  // Combine window.CATALOGUE_SONGS (280+ tracks) with DEFAULT_STATIC_SONGS
  const sourceList = rawCatalogue.length > 0
    ? [...DEFAULT_STATIC_SONGS, ...rawCatalogue]
    : DEFAULT_STATIC_SONGS;

  const seenIds = new Set();
  const seenTitles = new Set();
  const deduped = [];

  for (const s of sourceList) {
    if (!s || !s.id || !(s.title || s.name)) continue;

    const title = s.title || s.name || "";
    const normTitle = normalizeSearchText(title);
    if (seenIds.has(s.id) || seenTitles.has(normTitle)) continue;

    seenIds.add(s.id);
    seenTitles.add(normTitle);

    let cover = s.cover_url || "static/images/only_friends_theme.svg";
    if (cover.startsWith("/")) cover = cover.substring(1);

    const prepared = prepareSongSearchMetadata({
      ...s,
      title: title,
      album: s.album || s.movie || "",
      cover_url: cover,
      download_authorized: Boolean(s.download_authorized)
    });

    deduped.push(prepared);
  }

  // Freeze the master catalogue so nothing can ever mutate, slice, or corrupt it
  AppState.masterSongs = Object.freeze([...deduped]);
  AppState.songs = [...deduped];
  AppState.queue = [...deduped];

  // Production log
  console.log(`[MusicHub] Catalogue loaded with ${AppState.masterSongs.length} tracks.`);

  renderContent();
}

// ==========================================================================
// 5. Deterministic Search Engine with Race-Condition Protection
// ==========================================================================

function executeSearch(rawQuery) {
  const trimmed = (rawQuery || "").trim();
  const normalized = normalizeSearchText(trimmed);

  // Invalidate any previous async searches & timers
  AppState.searchRequestId++;
  const thisRequestId = AppState.searchRequestId;
  clearTimeout(AppState.searchDebounceTimer);
  if (AppState.activeSearchAbortController) {
    try { AppState.activeSearchAbortController.abort(); } catch (_) {}
    AppState.activeSearchAbortController = null;
  }

  AppState.searchError = null;

  if (!trimmed) {
    AppState.searchQuery = "";
    AppState.normalizedQuery = "";
    AppState.isSearching = false;
    AppState.searchResults = [];
    if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "none";
    if (DOM.emptyState) DOM.emptyState.style.display = "none";
    renderContent();
    return;
  }

  AppState.searchQuery = trimmed;
  AppState.normalizedQuery = normalized;
  AppState.isSearching = true;
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "block";

  // ALWAYS filter from the immutable master collection (never from previous search results!)
  const localMatches = AppState.masterSongs.filter(song => matchSongQuery(song, trimmed));
  AppState.searchResults = [...localMatches];

  // Update active queue for uninterrupted playback
  AppState.queue = localMatches.length > 0 ? [...localMatches] : [...AppState.masterSongs];

  // 0ms instant local rendering
  renderContent();

  // If a custom backend is configured, query asynchronously with sequence protection
  if (API_BASE) {
    AppState.searchDebounceTimer = setTimeout(() => {
      fetchBackendSearchResults(trimmed, thisRequestId);
    }, 350);
  }
}

// Optional query to an external backend with sequence & race-condition protection
async function fetchBackendSearchResults(query, requestId) {
  if (!API_BASE || !query) return;

  const abortController = new AbortController();
  AppState.activeSearchAbortController = abortController;

  try {
    const timeoutId = setTimeout(() => abortController.abort(), 4000);
    const url = `${API_BASE}/api/search?query=${encodeURIComponent(query)}&language=${encodeURIComponent(AppState.activeLanguage)}`;
    // Temporary diagnostic log (Step 8)
    console.log(`[MusicHub Diagnostic] Querying online backend API: ${url}`);
    const res = await fetch(url, { signal: abortController.signal });
    clearTimeout(timeoutId);

    // Verify this is still the active search request
    if (requestId !== AppState.searchRequestId) {
      console.log(`[Search] Discarding stale response for request #${requestId} (active is #${AppState.searchRequestId})`);
      return;
    }

    if (res.ok) {
      const data = await res.json();
      if (requestId !== AppState.searchRequestId) return;

      if (data.status === "success" && Array.isArray(data.songs)) {
        // Merge without duplicating or mutating masterSongs
        const seenIds = new Set(AppState.searchResults.map(s => s.id));
        const newFound = [];
        for (const s of data.songs) {
          if (!seenIds.has(s.id)) {
            seenIds.add(s.id);
            newFound.push(prepareSongSearchMetadata({
              ...s,
              download_authorized: Boolean(s.download_authorized)
            }));
          }
        }

        if (newFound.length > 0) {
          // Temporary diagnostic log (Step 8)
          console.log(`[MusicHub Diagnostic] Online backend returned ${newFound.length} tracks for "${query}"`);
          AppState.searchResults = [...AppState.searchResults, ...newFound];
          AppState.queue = [...AppState.searchResults];
          renderContent();
        }
      }
    } else {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.name === "AbortError") return; // Normal abort on new input
    if (requestId !== AppState.searchRequestId) return;

    // Temporary diagnostic log (Step 8)
    console.warn(`[MusicHub Diagnostic] Online search notice: ${err.message}`);
    AppState.searchError = {
      query: query,
      message: "Online search request could not be completed."
    };
    renderContent();
  } finally {
    if (AppState.activeSearchAbortController === abortController) {
      AppState.activeSearchAbortController = null;
    }
  }
}

function updateActivePills() {
  DOM.langChips.forEach(c => {
    c.classList.toggle("active", (c.dataset.lang || "all") === AppState.activeLanguage);
  });
  DOM.sectionPills.forEach(p => {
    p.classList.toggle("active", (p.dataset.section || "all") === AppState.activeSection);
  });
}

// ==========================================================================
// 6. Content Rendering & Song Card Generation
// ==========================================================================

function renderContent() {
  if (!DOM.contentContainer) return;

  // Search Results Mode
  if (AppState.searchQuery) {
    let displayList = [...AppState.searchResults];

    // Language Filter Handling during Search
    let languageFilteredOut = false;
    if (AppState.activeLanguage !== "all") {
      const activeLang = AppState.activeLanguage.toLowerCase();
      const langFiltered = displayList.filter(s => {
        const sLang = (s.language || "").toLowerCase();
        if (activeLang === "only_friends") {
          return s.category === "Only Friends OST" || (s._normTags && s._normTags.includes("only friends"));
        }
        return sLang === activeLang || (s._normTags && s._normTags.includes(activeLang));
      });

      if (displayList.length > 0 && langFiltered.length === 0) {
        languageFilteredOut = true;
      }
      displayList = langFiltered;
    }

    // Error Banner (if API search failed, allows user retry)
    let errorBannerHTML = "";
    if (AppState.searchError) {
      errorBannerHTML = `
        <div class="search-error-banner" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); border-radius:12px; padding:12px 18px; margin-bottom:20px; color:#fca5a5; font-size:0.88rem;">
          <div>
            <span style="font-weight:600;">⚠️ ${escapeHTML(AppState.searchError.message)}</span>
            <span style="display:block; font-size:0.78rem; color:var(--text-dim); margin-top:2px;">Showing instant results from built-in offline music catalogue.</span>
          </div>
          <button id="retrySearchBtn" class="btn btn-pill" style="padding:6px 16px; font-size:0.8rem; background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.5); color:#fff; cursor:pointer;">
            🔄 Retry Online Search
          </button>
        </div>
      `;
    }

    const attachRetryListener = () => {
      const retryBtn = document.getElementById("retrySearchBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          AppState.searchError = null;
          executeSearch(AppState.searchQuery);
        });
      }
    };

    if (displayList.length === 0) {
      if (DOM.emptyState) DOM.emptyState.style.display = "none";
      if (languageFilteredOut) {
        DOM.contentContainer.innerHTML = `
          ${errorBannerHTML}
          <div style="text-align:center; padding: 48px 20px; background:rgba(30,27,75,0.4); border:1px solid rgba(139,92,246,0.25); border-radius:16px; margin:20px 0;">
            <div style="font-size:2.5rem; margin-bottom:12px;">🌐</div>
            <h3 style="color:#fff; font-size:1.2rem; margin-bottom:8px;">No ${capitalize(AppState.activeLanguage)} songs matched "${escapeHTML(AppState.searchQuery)}"</h3>
            <p style="color:var(--text-muted); font-size:0.92rem; max-width:480px; margin:0 auto 20px auto;">
              Found <strong>${AppState.searchResults.length}</strong> matching track(s) in other languages.
            </p>
            <button id="searchShowAllLanguagesBtn" class="btn btn-primary" style="padding:10px 24px;">
              <span>🌐</span> Show Results in All Languages (${AppState.searchResults.length})
            </button>
          </div>
        `;
        const showAllBtn = document.getElementById("searchShowAllLanguagesBtn");
        if (showAllBtn) {
          showAllBtn.addEventListener("click", () => {
            AppState.activeLanguage = "all";
            updateActivePills();
            renderContent();
          });
        }
        attachRetryListener();
        return;
      }

      // No songs matched across any language
      DOM.contentContainer.innerHTML = errorBannerHTML;
      attachRetryListener();
      if (DOM.emptyState) {
        DOM.emptyState.style.display = "block";
        if (DOM.emptySearchQuery) DOM.emptySearchQuery.textContent = `"${escapeHTML(AppState.searchQuery)}"`;
      }
      return;
    }

    const totalCount = displayList.length;
    const visibleList = displayList.slice(0, AppState.currentPage * AppState.pageSize);

    let loadMoreHTML = "";
    if (visibleList.length < totalCount) {
      loadMoreHTML = `
        <div class="load-more-wrap">
          <p style="color:var(--text-muted); font-size:0.86rem;">
            Showing <strong>${visibleList.length}</strong> of <strong>${totalCount}</strong> matching tracks
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <button id="loadMoreBtn" class="btn btn-primary" style="padding:10px 28px; border-radius:30px; font-weight:600; font-size:0.92rem; box-shadow:0 4px 15px rgba(168,85,247,0.35);">
              <span>⬇️</span> Load More Songs (${totalCount - visibleList.length} remaining)
            </button>
            <button id="showAllSongsBtn" class="btn btn-pill" style="padding:10px 20px; font-size:0.88rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18);">
              Show All (${totalCount})
            </button>
          </div>
        </div>
      `;
    } else if (totalCount > AppState.pageSize) {
      loadMoreHTML = `
        <div style="text-align:center; margin:28px 0 16px 0; color:var(--text-dim); font-size:0.82rem;">
          ✨ All <strong>${totalCount}</strong> matching songs loaded
        </div>
      `;
    }

    if (DOM.emptyState) DOM.emptyState.style.display = "none";

    DOM.contentContainer.innerHTML = `
      ${errorBannerHTML}
      <section class="music-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">🔍</span>
            <h2 class="section-title">Search Results for "${escapeHTML(AppState.searchQuery)}"</h2>
            <span class="section-badge">${totalCount} tracks found</span>
          </div>
        </div>
        <div class="songs-grid">
          ${visibleList.map(s => createSongCardHTML(s)).join("")}
        </div>
        ${loadMoreHTML}
      </section>
    `;

    attachCardListeners(visibleList);
    attachRetryListener();
    attachPaginationListeners();
    updatePlayingCardHighlight();
    return;
  }

  // Browsing Mode (Filtered by Section / Language) - Always starts from immutable masterSongs
  let filtered = [...AppState.masterSongs];

  // Language Filter
  if (AppState.activeLanguage !== "all") {
    if (AppState.activeLanguage === "only_friends") {
      filtered = filtered.filter(s => s.category === "Only Friends OST");
    } else {
      filtered = filtered.filter(s => s.language && s.language.toLowerCase() === AppState.activeLanguage.toLowerCase());
    }
  }

  // Section Filter
  let isFavourites = AppState.activeSection === "favourites";
  let isHistory = AppState.activeSection === "history";

  if (AppState.activeSection === "trending") {
    filtered = filtered.filter(s => (s.sections || []).includes("trending"));
  } else if (AppState.activeSection === "recent") {
    filtered = filtered.filter(s => (s.sections || []).includes("recent"));
  } else if (isFavourites) {
    filtered = AppState.favourites
      .map(id => AppState.masterSongs.find(s => s.id === id))
      .filter(Boolean);
  } else if (isHistory) {
    filtered = AppState.history
      .map(id => AppState.masterSongs.find(s => s.id === id))
      .filter(Boolean);
  }

  // Empty State for Filter
  if (filtered.length === 0) {
    DOM.contentContainer.innerHTML = "";
    if (DOM.emptyState) {
      DOM.emptyState.style.display = "block";
      if (DOM.emptySearchQuery) {
        DOM.emptySearchQuery.textContent = isFavourites
          ? "Favourites (No songs added yet. Tap 🤍 on any track to add it!)"
          : isHistory
          ? "History (No songs played yet)"
          : "Selected filter (No tracks found)";
      }
    }
    return;
  }

  if (DOM.emptyState) DOM.emptyState.style.display = "none";

  // Dedicated View for Favourites / History / Single Language
  if (AppState.activeSection !== "all" || AppState.activeLanguage !== "all") {
    let headerTitle = "Music Collection";
    let headerIcon = "🎵";
    let extraHeaderHTML = "";

    if (isFavourites) {
      headerTitle = "My Favourite Songs";
      headerIcon = "❤️";
      extraHeaderHTML = `
        <p style="color:var(--text-dim); font-size:0.82rem; margin-top:4px;">
          ℹ️ Saved locally in this browser. Will not sync across different devices.
        </p>
      `;
    } else if (isHistory) {
      headerTitle = "Recently Played History";
      headerIcon = "🕒";
      extraHeaderHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:6px;">
          <p style="color:var(--text-dim); font-size:0.82rem;">
            ℹ️ Saved locally in this browser. Will not sync across different devices.
          </p>
          <button id="clearHistoryBtn" class="btn btn-pill" style="padding:4px 12px; font-size:0.78rem; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#fca5a5;">
            🗑️ Clear History
          </button>
        </div>
      `;
    } else if (AppState.activeSection === "trending") {
      headerTitle = "🔥 Trending Songs";
      headerIcon = "🔥";
    } else if (AppState.activeSection === "recent") {
      headerTitle = "🆕 Recently Added Songs";
      headerIcon = "🆕";
    } else if (AppState.activeLanguage === "telugu") {
      headerTitle = "⚡ Telugu Blockbusters";
      headerIcon = "⚡";
    } else if (AppState.activeLanguage === "hindi") {
      headerTitle = "🪔 Hindi Hits";
      headerIcon = "🪔";
    } else if (AppState.activeLanguage !== "all") {
      headerTitle = `${capitalize(AppState.activeLanguage)} Music`;
      headerIcon = "🌺";
    }

    const totalCount = filtered.length;
    const visibleList = filtered.slice(0, AppState.currentPage * AppState.pageSize);

    let loadMoreHTML = "";
    if (visibleList.length < totalCount) {
      loadMoreHTML = `
        <div class="load-more-wrap">
          <p style="color:var(--text-muted); font-size:0.86rem;">
            Showing <strong>${visibleList.length}</strong> of <strong>${totalCount}</strong> tracks
          </p>
          <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
            <button id="loadMoreBtn" class="btn btn-primary" style="padding:10px 28px; border-radius:30px; font-weight:600; font-size:0.92rem; box-shadow:0 4px 15px rgba(168,85,247,0.35);">
              <span>⬇️</span> Load More Songs (${totalCount - visibleList.length} remaining)
            </button>
            <button id="showAllSongsBtn" class="btn btn-pill" style="padding:10px 20px; font-size:0.88rem; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18);">
              Show All (${totalCount})
            </button>
          </div>
        </div>
      `;
    } else if (totalCount > AppState.pageSize) {
      loadMoreHTML = `
        <div style="text-align:center; margin:28px 0 16px 0; color:var(--text-dim); font-size:0.82rem;">
          ✨ All <strong>${totalCount}</strong> tracks loaded
        </div>
      `;
    }

    DOM.contentContainer.innerHTML = `
      <section class="music-section">
        <div class="section-header" style="flex-direction:column; align-items:flex-start; gap:4px;">
          <div class="section-title-wrap" style="width:100%; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="section-icon">${headerIcon}</span>
              <h2 class="section-title">${headerTitle}</h2>
            </div>
            <span class="section-badge">${totalCount} tracks</span>
          </div>
          ${extraHeaderHTML}
        </div>
        <div class="songs-grid">
          ${visibleList.map(s => createSongCardHTML(s)).join("")}
        </div>
        ${loadMoreHTML}
      </section>
    `;

    attachCardListeners(visibleList);
    attachPaginationListeners();

    // Attach Clear History Event if present
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your listening history?")) {
          AppState.history = [];
          safeSetStorage("pranesh_hub_history", []);
          showToast("Listening history cleared.");
          renderContent();
        }
      });
    }

    updatePlayingCardHighlight();
    return;
  }

  // Default Home Page View: Organized Section Grids with Top 8 and View All Buttons
  const sectionsDef = [
    { id: "trending", title: "🔥 Trending Songs", icon: "🔥", filter: s => (s.sections || []).includes("trending"), sectionId: "trending" },
    { id: "recent", title: "🆕 Recently Added", icon: "🆕", filter: s => (s.sections || []).includes("recent"), sectionId: "recent" },
    { id: "tamil", title: "🌺 Tamil Blockbusters", icon: "🌺", filter: s => s.language === "Tamil", lang: "tamil" },
    { id: "telugu", title: "⚡ Telugu Blockbusters", icon: "⚡", filter: s => s.language === "Telugu", lang: "telugu" },
    { id: "hindi", title: "🪔 Hindi Hits", icon: "🪔", filter: s => s.language === "Hindi", lang: "hindi" },
    { id: "english", title: "🎸 English Hits", icon: "🎸", filter: s => s.language === "English", lang: "english" },
    { id: "malayalam", title: "🌴 Malayalam Melodies", icon: "🌴", filter: s => s.language === "Malayalam", lang: "malayalam" },
    { id: "instrumental", title: "🎹 Instrumental & Soundtracks", icon: "🎹", filter: s => s.category === "Instrumental Music" || s.language === "Instrumental", lang: "instrumental" },
    { id: "only_friends", title: "🎬 Only Friends OST & Themes", icon: "🎬", filter: s => s.category === "Only Friends OST", lang: "only_friends" }
  ];

  let fullHTML = "";
  const renderedPool = [];

  sectionsDef.forEach(sec => {
    const secSongs = filtered.filter(sec.filter);
    if (secSongs.length > 0) {
      const topSongs = secSongs.slice(0, 8);
      topSongs.forEach(s => renderedPool.push(s));

      fullHTML += `
        <section class="music-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-icon">${sec.icon}</span>
              <h2 class="section-title">${sec.title}</h2>
              <span class="section-badge">${secSongs.length} tracks</span>
            </div>
            <button class="section-view-all-link" data-lang="${sec.lang || ''}" data-section="${sec.sectionId || ''}">
              Explore All (${secSongs.length}) →
            </button>
          </div>
          <div class="songs-grid">
            ${topSongs.map(s => createSongCardHTML(s)).join("")}
          </div>
        </section>
      `;
    }
  });

  DOM.contentContainer.innerHTML = fullHTML;
  attachCardListeners(renderedPool);
  attachSectionExploreListeners();
  updatePlayingCardHighlight();
}

function attachPaginationListeners() {
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      AppState.currentPage++;
      renderContent();
    });
  }
  const showAllBtn = document.getElementById("showAllSongsBtn");
  if (showAllBtn) {
    showAllBtn.addEventListener("click", () => {
      AppState.currentPage = 999;
      renderContent();
    });
  }
}

function attachSectionExploreListeners() {
  document.querySelectorAll(".section-view-all-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      const sec = btn.dataset.section;
      if (lang) {
        AppState.activeLanguage = lang;
        AppState.activeSection = "all";
      } else if (sec) {
        AppState.activeSection = sec;
        AppState.activeLanguage = "all";
      }
      AppState.currentPage = 1;
      updateActivePills();
      renderContent();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// Generate accessible HTML for an individual song card
function createSongCardHTML(song) {
  const isThisPlaying = AppState.currentSong && AppState.currentSong.id === song.id && AppState.isPlaying;
  const isThisLoading = AppState.currentSong && AppState.currentSong.id === song.id && AppState.isLoading;
  const isFav = AppState.favourites.includes(song.id);

  let playIconText = "▶";
  if (isThisLoading) playIconText = "⏳";
  else if (isThisPlaying) playIconText = "⏸";

  // Action Button: Download authorized MP3s vs Stream-Only badge
  let actionBtnHTML = "";
  if (song.download_authorized) {
    actionBtnHTML = `
      <button class="download-btn card-download-trigger" data-id="${escapeAttr(song.id)}" title="Download authorized MP3 file">
        <span>⬇️</span> Download
      </button>
    `;
  } else {
    actionBtnHTML = `
      <button class="download-btn card-stream-info" data-id="${escapeAttr(song.id)}" style="background:rgba(147,51,234,0.18); border-color:rgba(147,51,234,0.4); color:#c084fc;" title="In-App Stream Only (Copyright Protected)">
        <span>🎧</span> Stream Only
      </button>
    `;
  }

  const safeCover = escapeAttr(song.cover_url || "static/images/only_friends_theme.svg");
  const movieBadge = song.album ? ` • <span class="card-album-tag" title="Movie/Album: ${escapeAttr(song.album)}">${escapeHTML(song.album)}</span>` : "";

  return `
    <div class="song-card ${isThisPlaying ? 'now-playing' : ''}" data-id="${escapeAttr(song.id)}">
      <div class="card-thumb-wrap">
        <img class="card-thumb-img" src="${safeCover}" alt="${escapeAttr(song.title)}" loading="lazy" onerror="this.src='static/images/only_friends_theme.svg'" />
        <span class="card-category-tag">${escapeHTML(song.language || "Music")}</span>
        <span class="card-duration-badge">${escapeHTML(song.duration_str || "3:30")}</span>
        <div class="play-overlay">
          <button class="play-circle-btn card-play-trigger" data-id="${escapeAttr(song.id)}" aria-label="Play ${escapeAttr(song.title)}">
            ${playIconText}
          </button>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title" title="${escapeAttr(song.title)}">${escapeHTML(song.title)}</h3>
        <p class="card-artist" title="${escapeAttr(song.artist)}">${escapeHTML(song.artist)}${movieBadge}</p>
      </div>
      <div class="card-actions">
        <button class="fav-btn ${isFav ? 'favorited' : ''}" data-id="${escapeAttr(song.id)}" title="${isFav ? 'Remove from Favourites' : 'Add to Favourites'}" aria-label="Favourite">
          ${isFav ? '❤️' : '🤍'}
        </button>
        <div class="card-action-right">
          ${actionBtnHTML}
        </div>
      </div>
    </div>
  `;
}

// Attach event listeners to song cards
function attachCardListeners(pool = []) {
  const getSongById = (id) => {
    return pool.find(s => s.id === id) ||
           AppState.searchResults.find(s => s.id === id) ||
           AppState.masterSongs.find(s => s.id === id) ||
           AppState.songs.find(s => s.id === id);
  };

  // Play button triggers
  document.querySelectorAll(".card-play-trigger").forEach(btn => {
    const handlePlay = (e) => {
      e.stopPropagation();
      const song = getSongById(btn.dataset.id);
      if (song) {
        if (AppState.currentSong && AppState.currentSong.id === song.id) {
          togglePlayPause();
        } else {
          playSong(song);
        }
      }
    };
    btn.addEventListener("click", handlePlay);
    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      handlePlay(e);
    }, { passive: false });
  });

  // Entire Card Click plays track
  document.querySelectorAll(".song-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      const song = getSongById(card.dataset.id);
      if (song) {
        if (AppState.currentSong && AppState.currentSong.id === song.id) {
          togglePlayPause();
        } else {
          playSong(song);
        }
      }
    });
  });

  // Favourite button triggers
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavourite(btn.dataset.id);
    });
  });

  // Download triggers (authorized files only)
  document.querySelectorAll(".card-download-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const song = getSongById(btn.dataset.id);
      if (song) handleDownloadAction(song, btn);
    });
  });

  // Stream-only info triggers
  document.querySelectorAll(".card-stream-info").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      showToast("ℹ️ This track is licensed for in-app streaming. Tap ▶ to listen freely!", "info");
    });
  });
}

function updatePlayingCardHighlight() {
  document.querySelectorAll(".song-card").forEach(card => {
    const isThisSong = AppState.currentSong && card.dataset.id === AppState.currentSong.id;
    const isThisPlaying = isThisSong && AppState.isPlaying;
    const isThisLoading = isThisSong && AppState.isLoading;

    card.classList.toggle("now-playing", isThisPlaying);

    const playBtn = card.querySelector(".card-play-trigger");
    if (playBtn) {
      if (isThisLoading) playBtn.textContent = "⏳";
      else if (isThisPlaying) playBtn.textContent = "⏸";
      else playBtn.textContent = "▶";
    }
  });
}

// ==========================================================================
// 6. In-Page Audio Playback Engine
// ==========================================================================

function playSong(song) {
  if (!song) return;

  AppState.currentSong = song;

  // Queue tracking: sync to search results when in search mode, otherwise master collection
  if (AppState.isSearching && AppState.searchResults.length > 0) {
    AppState.queue = [...AppState.searchResults];
  } else if (!AppState.queue || AppState.queue.length === 0) {
    AppState.queue = [...AppState.masterSongs];
  }

  let idx = AppState.queue.findIndex(s => s.id === song.id);
  if (idx === -1) {
    AppState.queue.push(song);
    idx = AppState.queue.length - 1;
  }
  AppState.currentSongIndex = idx;

  // Save to Listening History safely (max 50 tracks)
  AppState.history = [song.id, ...AppState.history.filter(id => id !== song.id)].slice(0, 50);
  safeSetStorage("pranesh_hub_history", AppState.history);

  updatePlayerBarUI(song);

  // Audio source resolution
  let streamSrc = "";
  if (song.audio_file && !song.audio_file.startsWith("http")) {
    streamSrc = `static/audio/${song.audio_file}`;
  } else if (song.audio_url && song.audio_url.startsWith("http")) {
    streamSrc = song.audio_url;
  } else if (song.audio_file && song.audio_file.startsWith("http")) {
    streamSrc = song.audio_file;
  } else if (API_BASE) {
    streamSrc = `${API_BASE}/api/stream/${song.id}`;
  }

  if (!streamSrc) {
    showToast("⚠️ Audio stream unavailable for this track.", "error");
    return;
  }

  AppState.isLoading = true;
  if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏳";
  updatePlayingCardHighlight();

  if (audioPlayer.src !== streamSrc) {
    audioPlayer.src = streamSrc;
  }

  const playPromise = audioPlayer.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      AppState.isLoading = false;
      AppState.isPlaying = true;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
      updatePlayingCardHighlight();
    }).catch(err => {
      console.warn("Mobile playback notice:", err.message);
      AppState.isLoading = false;
      AppState.isPlaying = false;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
      updatePlayingCardHighlight();
    });
  }
}

function togglePlayPause() {
  if (!AppState.currentSong) {
    if (AppState.songs.length > 0) playSong(AppState.songs[0]);
    return;
  }

  if (audioPlayer.paused) {
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        AppState.isPlaying = true;
        if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
        updatePlayingCardHighlight();
      }).catch(err => {
        console.error("Playback resume error:", err);
      });
    }
  } else {
    audioPlayer.pause();
    AppState.isPlaying = false;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
    updatePlayingCardHighlight();
  }
}

function playNextSong() {
  if (AppState.queue.length === 0) return;

  if (AppState.isShuffle) {
    const nextIdx = Math.floor(Math.random() * AppState.queue.length);
    playSong(AppState.queue[nextIdx]);
  } else {
    let nextIdx = AppState.currentSongIndex + 1;
    if (nextIdx >= AppState.queue.length) nextIdx = 0;
    playSong(AppState.queue[nextIdx]);
  }
}

function playPreviousSong() {
  if (AppState.queue.length === 0) return;

  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }

  let prevIdx = AppState.currentSongIndex - 1;
  if (prevIdx < 0) prevIdx = AppState.queue.length - 1;
  playSong(AppState.queue[prevIdx]);
}

function handleTrackEnded() {
  if (AppState.isRepeat) {
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => {});
  } else {
    playNextSong();
  }
}

function updateSeekbar() {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;
  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  if (DOM.seekbar) DOM.seekbar.value = progressPercent;
  if (DOM.currentTimeEl) DOM.currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function updateVolumeIcon() {
  if (!DOM.volumeIcon) return;
  if (AppState.isMuted || audioPlayer.volume === 0) {
    DOM.volumeIcon.textContent = "🔇";
  } else if (audioPlayer.volume < 0.5) {
    DOM.volumeIcon.textContent = "🔉";
  } else {
    DOM.volumeIcon.textContent = "🔊";
  }
}

function updatePlayerBarUI(song) {
  if (!DOM.playerBar) return;
  DOM.playerBar.style.display = "flex";

  if (DOM.playerThumb) DOM.playerThumb.src = song.cover_url || "static/images/only_friends_theme.svg";
  if (DOM.playerTitle) DOM.playerTitle.textContent = song.title;
  if (DOM.playerArtist) DOM.playerArtist.textContent = song.artist + (song.album ? ` • ${song.album}` : "");

  const isFav = AppState.favourites.includes(song.id);
  if (DOM.playerFavBtn) DOM.playerFavBtn.textContent = isFav ? "❤️" : "🤍";

  if (DOM.playerDownloadBtn) {
    DOM.playerDownloadBtn.style.display = "inline-flex";
    if (song.download_authorized) {
      DOM.playerDownloadBtn.innerHTML = `<span>⬇️</span> Download`;
      DOM.playerDownloadBtn.title = `Download ${song.title} MP3`;
    } else {
      DOM.playerDownloadBtn.innerHTML = `<span>🎧</span> Stream Only`;
      DOM.playerDownloadBtn.title = `Streaming only (downloads restricted)`;
    }
  }
}

// ==========================================================================
// 7. Song Download Handler (Authorized Files Only)
// ==========================================================================

async function handleDownloadAction(song, triggerBtn = null) {
  // Enforce copyright compliance & download authorization
  if (!song.download_authorized) {
    showToast("ℹ️ This track is licensed for in-app streaming. Direct downloading is not available for copyright compliance.", "info");
    return;
  }

  // Determine endpoint for authorized audio
  let downloadUrl = "";
  if (song.audio_file && !song.audio_file.startsWith("http")) {
    downloadUrl = `static/audio/${song.audio_file}`;
  } else if (song.audio_file && song.audio_file.startsWith("http")) {
    downloadUrl = song.audio_file;
  } else if (song.audio_url) {
    downloadUrl = song.audio_url;
  }

  if (!downloadUrl) {
    showToast("⚠️ Download file is not available.", "error");
    return;
  }

  showToast(`Preparing download for: "${song.title}"...`, "info");
  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `<span class="spinner" style="width:13px;height:13px;border-width:2px;"></span> Saving...`;
  }

  try {
    // Verify file accessibility and fetch blob
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    const safeFilename = `${song.title} - ${song.artist}`.replace(/[/\\?%*:|"<>]/g, "");
    a.download = `${safeFilename}.mp3`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 2000);

    showToast(`✅ "${song.title}.mp3" saved successfully!`, "success");

    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = `<span>✓</span> Done`;
      setTimeout(() => {
        triggerBtn.innerHTML = `<span>⬇️</span> Download`;
      }, 3000);
    }
  } catch (err) {
    console.warn("Download failed:", err);
    showToast("⚠️ Could not download file directly due to network restrictions.", "error");

    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = `<span>⬇️</span> Download`;
    }
  }
}

// ==========================================================================
// 8. Favourites Manager
// ==========================================================================

function toggleFavourite(songId) {
  const song = AppState.masterSongs.find(s => s.id === songId) || AppState.searchResults.find(s => s.id === songId) || AppState.songs.find(s => s.id === songId);
  const title = song ? song.title : "Song";
  const idx = AppState.favourites.indexOf(songId);

  if (idx === -1) {
    AppState.favourites.push(songId);
    showToast(`❤️ Added "${title}" to Favourites`);
  } else {
    AppState.favourites.splice(idx, 1);
    showToast(`Removed "${title}" from Favourites`);
  }

  safeSetStorage("pranesh_hub_favs", AppState.favourites);

  if (AppState.currentSong && AppState.currentSong.id === songId && DOM.playerFavBtn) {
    DOM.playerFavBtn.textContent = idx === -1 ? "❤️" : "🤍";
  }

  // Update card heart states
  document.querySelectorAll(`.fav-btn[data-id="${songId}"]`).forEach(btn => {
    const isFav = idx === -1;
    btn.classList.toggle("favorited", isFav);
    btn.textContent = isFav ? "❤️" : "🤍";
    btn.title = isFav ? "Remove from Favourites" : "Add to Favourites";
  });

  // Re-render if viewing favourites
  if (AppState.activeSection === "favourites") {
    renderContent();
  }
}

// ==========================================================================
// 9. Toast Notification Hub
// ==========================================================================

function showToast(message, type = "info") {
  if (!DOM.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "🔔";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${escapeHTML(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInToast 0.3s ease reverse forwards";
    setTimeout(() => {
      if (DOM.toastContainer.contains(toast)) {
        DOM.toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

// ==========================================================================
// 10. Utility Functions & XSS Sanitization
// ==========================================================================

function formatTime(seconds) {
  const sec = Math.floor(seconds || 0);
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}:${remSec < 10 ? '0' : ''}${remSec}`;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
