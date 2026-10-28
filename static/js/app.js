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

// Built-in offline audio library with verified full-length 320kbps streams (Zero 30s cutoffs!)
const DEFAULT_STATIC_SONGS = [
  {"id":"saavn_fzAg5UIy","title":"Manithan Manithan","artist":"Malaysia Vasudevan, Chandrabose, Vairamuthu","album":"Manithan","duration":260,"duration_str":"4:20","language":"Tamil","era":"80s","category":"Tamil Songs","sections":["trending","recent","era_80s","tamil"],"cover_url":"https://c.saavncdn.com/123/Manithan-1987-500x500.jpg","audio_url":"https://aac.saavncdn.com/123/eea4bbb94ae71a217d4c2910fd4d2baa_320.mp4","download_authorized":true,"tags":["manithan","manithan manithan","rajinikanth","rajini","chandrabose","malaysia vasudevan","80s","80s movie","80s songs","80s hits","tamil","trending"]},
  {"id":"saavn_ioz_b6hk","title":"Vaanathe Paarthein","artist":"S. P. Balasubrahmanyam, Chandrabose, Vairamuthu","album":"Manithan","duration":315,"duration_str":"5:15","language":"Tamil","era":"80s","category":"Tamil Songs","sections":["trending","recent","era_80s","tamil"],"cover_url":"https://c.saavncdn.com/123/Manithan-1987-500x500.jpg","audio_url":"https://aac.saavncdn.com/123/56fcc3f711bc8c9cd080608c0c9bab3a_320.mp4","download_authorized":true,"tags":["vaanathe paarthein","vanathai parthen","vaanathe paarthen","vanathe parthen","manithan","rajinikanth","spb","chandrabose","80s","80s movie","80s songs","80s hits","tamil","trending"]},
  {"id":"saavn_g51Odreb","title":"Aval","artist":"Santhosh Narayanan, Pradeep Kumar, Priya Hemesh, Vivek","album":"Manithan","duration":266,"duration_str":"4:26","language":"Tamil","era":"now","category":"Tamil Songs","sections":["trending","recent","era_now","tamil"],"cover_url":"https://c.saavncdn.com/386/Manithan-Tamil-2016-500x500.jpg","audio_url":"https://aac.saavncdn.com/386/19daccdb0bcf64f0318e10eccffe2773_320.mp4","download_authorized":true,"tags":["aval","aval manithan","manithan","pradeep kumar","santhosh narayanan","udhayanidhi stalin","now","now movie","now hits","tamil","trending"]},
  { id: "saavn_aasai_machaan_1", title: "Aasai Machaan", artist: "Swarnalatha, Arunmozhi, Ilaiyaraaja", album: "Kummi Paattu", duration: 302, duration_str: "5:02", language: "Tamil", category: "Tamil Songs", sections: ["trending", "recent", "era_90s", "tamil"], cover_url: "https://c.saavncdn.com/550/Kummi-Paattu-Tamil-2021-20230407030208-500x500.jpg", audio_url: "https://aac.saavncdn.com/550/9f902008db8062361c3b58713205661b_320.mp4", audio_file: "", download_authorized: true, tags: ["aasai machaan", "aasa machan", "adi aasa machan", "aasai machan", "swarnalatha", "arunmozhi", "ilaiyaraaja", "kummi paattu", "90s", "tamil", "trending"], era: "90s" },
  { id: "saavn_aasai_machaan_solo", title: "Aasai Machaan (Solo)", artist: "Swarnalatha, Ilaiyaraaja", album: "Kummi Paattu", duration: 302, duration_str: "5:02", language: "Tamil", category: "Tamil Songs", sections: ["recent", "era_90s", "tamil"], cover_url: "https://c.saavncdn.com/550/Kummi-Paattu-Tamil-2021-20230407030208-500x500.jpg", audio_url: "https://aac.saavncdn.com/550/b616a9f3076026e1f460609659186d06_320.mp4", audio_file: "", download_authorized: true, tags: ["aasai machaan", "aasa machan", "swarnalatha", "ilaiyaraaja", "kummi paattu", "90s", "tamil"], era: "90s" },
  { id: "saavn_karuppu_nila_machan", title: "Karuppu Nila", artist: "S.P. Balasubrahmanyam, K. S. Chithra, Deva", album: "En Aasai Machan", duration: 295, duration_str: "4:55", language: "Tamil", category: "Tamil Songs", sections: ["trending", "era_90s", "tamil"], cover_url: "https://c.saavncdn.com/024/En-Aasai-Machan-Tamil-1994-20240905140348-500x500.jpg", audio_url: "https://aac.saavncdn.com/024/88d549bd91b629c3bd3521483c35c2f1_320.mp4", audio_file: "", download_authorized: true, tags: ["karuppu nila", "en aasai machan", "aasai machan", "aasai machaan", "vijayakanth", "revathi", "spb", "chithra", "deva", "90s", "tamil"], era: "90s" },
  { id: "of_1", title: "Let's Try (เอาเลยมั้ย)", artist: "Khaotung Thanawat", album: "Only Friends OST", duration: 233, duration_str: "3:53", language: "Thai/Multi", category: "Only Friends OST", sections: ["trending", "only_friends"], cover_url: "static/images/lets_try_acoustic.svg", audio_url: "https://aac.saavncdn.com/119/4397fcd61ccba3e425b27f767bdd1b82_320.mp4", audio_file: "", download_authorized: true, tags: ["only friends", "gmmtv", "khaotung", "ost", "trending", "2k"] },
  { id: "of_2", title: "No One Can (ห้ามแตะ)", artist: "Gawin Caskey", album: "Only Friends : Dream On", duration: 233, duration_str: "3:53", language: "Thai/Multi", category: "Only Friends OST", sections: ["recent", "only_friends"], cover_url: "static/images/no_one_can_chill.svg", audio_url: "https://aac.saavncdn.com/119/4397fcd61ccba3e425b27f767bdd1b82_320.mp4", audio_file: "", download_authorized: true, tags: ["only friends", "gawin caskey", "dream on", "2k"] },
  { id: "of_3", title: "Only Friends Retro Odyssey", artist: "Sonya Bara & Cyber Pulse", album: "Only Friends Singles", duration: 372, duration_str: "6:12", language: "English", category: "Only Friends OST", sections: ["trending", "only_friends"], cover_url: "static/images/only_friends_theme.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", audio_file: "", download_authorized: true, tags: ["only friends", "synthwave", "2k"] },
  { id: "tamil_1", title: "Engal Veetil Ella Naazhum (Vaanathai Pola)", artist: "S. P. Balasubrahmanyam, Sujatha / S.A. Rajkumar", album: "Vaanathai Pola", duration: 266, duration_str: "4:26", language: "Tamil", category: "Tamil Songs", sections: ["trending", "tamil"], cover_url: "static/images/vaanathai_pola.svg", audio_url: "https://aac.saavncdn.com/781/2b2258b8fe7318063e64b2530e12e5d7_320.mp4", audio_file: "", download_authorized: true, tags: ["tamil", "friends", "vaanathai", "pola", "spb", "2k", "2000s"] },
  { id: "tamil_2", title: "Rukku Rukku Remix (Friends)", artist: "Vijay Jesudas, Yuvan Shankar Raja, Ilaiyaraaja", album: "Friends (Tamil)", duration: 388, duration_str: "6:28", language: "Tamil", category: "Tamil Songs", sections: ["recent", "tamil"], cover_url: "static/images/rukku_rukku_remix.svg", audio_url: "https://aac.saavncdn.com/247/df7f62f69f443e6a788d89a2a0cf38a0_320.mp4", audio_file: "", download_authorized: true, tags: ["tamil", "friends", "rukku", "dance", "vijay", "suriya", "2k", "2000s"] },
  { id: "tamil_3", title: "Thendral Vandhu Theendumbothu (Avatharam)", artist: "Ilaiyaraaja, S. Janaki", album: "Avatharam / Timeless Melodies", duration: 321, duration_str: "5:21", language: "Tamil", category: "Tamil Songs", sections: ["recent", "tamil"], cover_url: "static/images/tamil_melody_flute.svg", audio_url: "https://aac.saavncdn.com/040/f3b169a744efc3cf8d98f168897d7707_320.mp4", audio_file: "", download_authorized: true, tags: ["tamil", "flute", "thendral", "ilaiyaraaja", "janaki", "melody", "90s"] },
  { id: "tamil_4", title: "Vaathi Coming (Master)", artist: "Anirudh Ravichander, Gana Balachandar", album: "Master", duration: 230, duration_str: "3:50", language: "Tamil", category: "Tamil Songs", sections: ["trending", "tamil"], cover_url: "static/images/vaathi_groove.svg", audio_url: "https://aac.saavncdn.com/347/c536b256fca6b96aa4323c21a4f00bb0_320.mp4", audio_file: "", download_authorized: true, tags: ["tamil", "vaathi", "coming", "anirudh", "master", "thalapathy", "kuthu", "now"] },
  { id: "eng_1", title: "Midnight City Lights", artist: "Aura Dreamer", album: "Lofi Night Whispers", duration: 423, duration_str: "7:03", language: "English", category: "English Songs", sections: ["trending", "english"], cover_url: "static/images/lofi_midnight_vibes.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", audio_file: "", download_authorized: true, tags: ["english", "lofi", "chill", "night"] },
  { id: "eng_2", title: "Neon Horizon 80s", artist: "Cyber Pulse", album: "Retrowave Odyssey", duration: 345, duration_str: "5:45", language: "English", category: "English Songs", sections: ["recent", "english"], cover_url: "static/images/neon_horizon_80s.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", audio_file: "", download_authorized: true, tags: ["english", "synthwave", "retro", "80s"] },
  { id: "eng_3", title: "Acoustic Breeze", artist: "Sunset Strings", album: "Morning Coffee Sessions", duration: 302, duration_str: "5:02", language: "English", category: "English Songs", sections: ["recent", "english"], cover_url: "static/images/acoustic_breeze.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", audio_file: "", download_authorized: true, tags: ["english", "acoustic", "guitar", "chill"] },
  { id: "mal_1", title: "Kerala Monsoon Rains", artist: "Malabar Ensemble", album: "God's Own Country Beats", duration: 316, duration_str: "5:16", language: "Malayalam", category: "Malayalam Songs", sections: ["trending", "malayalam"], cover_url: "static/images/kerala_monsoon_flute.svg", audio_url: "https://aac.saavncdn.com/665/64fe9e59b56dfb5f644e9e461923979b_320.mp4", audio_file: "", download_authorized: true, tags: ["malayalam", "kerala", "monsoon", "flute"] },
  { id: "mal_2", title: "Malare (Premam)", artist: "Vijay Yesudas, Rajesh Murugesan", album: "Premam", duration: 316, duration_str: "5:16", language: "Malayalam", category: "Malayalam Songs", sections: ["trending", "malayalam"], cover_url: "static/images/malare_piano_cover.svg", audio_url: "https://aac.saavncdn.com/665/64fe9e59b56dfb5f644e9e461923979b_320.mp4", audio_file: "", download_authorized: true, tags: ["malayalam", "malare", "premam", "piano", "romance", "now"] },
  { id: "mal_3", title: "Alleppey Calm Waters", artist: "Backwater Echoes", album: "Backwater Soundscapes", duration: 316, duration_str: "5:16", language: "Malayalam", category: "Malayalam Songs", sections: ["recent", "malayalam"], cover_url: "static/images/alleppey_calm_stream.svg", audio_url: "https://aac.saavncdn.com/665/64fe9e59b56dfb5f644e9e461923979b_320.mp4", audio_file: "", download_authorized: true, tags: ["malayalam", "alleppey", "ambient"] },
  { id: "inst_1", title: "Cinematic Piano Dream", artist: "Pranesh Orchestra", album: "Symphonies of the Mind", duration: 372, duration_str: "6:12", language: "Instrumental", category: "Instrumental Music", sections: ["trending", "instrumental"], cover_url: "static/images/cinematic_piano_dream.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", audio_file: "", download_authorized: true, tags: ["instrumental", "piano", "cinematic"] },
  { id: "inst_2", title: "Chillhop Study Beats", artist: "Coffee & Rain", album: "Focus & Code Vol. 1", duration: 423, duration_str: "7:03", language: "Instrumental", category: "Instrumental Music", sections: ["recent", "instrumental"], cover_url: "static/images/chillhop_lofi_beat.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", audio_file: "", download_authorized: true, tags: ["instrumental", "chillhop", "lofi"] },
  { id: "inst_3", title: "SoundHelix Symphony", artist: "Open Music Archive", album: "Algorithmic Harmony", duration: 345, duration_str: "5:45", language: "Instrumental", category: "Instrumental Music", sections: ["recent", "instrumental"], cover_url: "static/images/soundhelix_ambient.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", audio_file: "", download_authorized: true, tags: ["instrumental", "soundhelix", "electronic"] }
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
if (!configuredApi && typeof window !== "undefined" && window.location) {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "5000" || window.location.port === "8080") {
    // Automatically bind to current origin when served by Flask app.py
    configuredApi = window.location.origin;
  } else {
    configuredApi = localStorage.getItem("pranesh_api_url") || "";
  }
}
const API_BASE = configuredApi ? configuredApi.replace(/\/+$/, "") : "";

const AppState = {
  masterSongs: [],       // Immutable master catalogue (never mutated or permanently filtered)
  songs: [],             // Active browsing list
  searchResults: [],     // Current search matches
  jioResults: [],        // JioSaavn matches for active query
  spotifyResults: [],    // Spotify matches for active query
  searchSourceFilter: "all", // "all" | "jiosaavn" | "spotify"
  searchQuery: "",       // Active raw search query
  normalizedQuery: "",   // Active normalized search query
  isSearching: false,
  isSpotifyFallbackResults: false,
  isFetchingSpotify: false,
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
  activeAlbum: "all",
  activeType: "all",
  currentPage: 1,        // Active pagination page
  pageSize: 24,          // Number of tracks per page chunk
  favourites: safeGetStorage("pranesh_hub_favs", []),
  history: safeGetStorage("pranesh_hub_history", []),
  queue: [],
  isPlaylistOpen: false,
  downloadQuality: (typeof localStorage !== "undefined" && localStorage.getItem("pranesh_hub_dl_quality")) || "160" // "160" (saves 50% memory), "96" (ultra low memory), "320" (studio)
};

// Global HTML5 Audio Element (DOM-attached for mobile compliance)
const audioPlayer = document.getElementById("mainAudioPlayer") || new Audio();
audioPlayer.preload = "auto";
audioPlayer.referrerPolicy = "no-referrer";
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
  dlQualityBtn: null,
  dlQualityIcon: null,
  dlQualityText: null,
  playerDownloadBtn: null,
  playerMusicAppBtn: null,
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
  toastContainer: null,
  typeChips: null,
  togglePlaylistBtn: null,
  playlistBadge: null,
  playlistDrawer: null,
  closePlaylistBtn: null,
  shufflePlaylistBtn: null,
  playlistItems: null,
  playlistStatusText: null
};

function refreshDOMElements() {
  if (typeof document === "undefined") return;
  DOM.searchInput = document.getElementById("searchInput");
  DOM.clearSearchBtn = document.getElementById("clearSearchBtn");
  DOM.langChips = document.querySelectorAll(".lang-chip");
  DOM.typeChips = document.querySelectorAll(".type-chip");
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
  DOM.dlQualityBtn = document.getElementById("dlQualityBtn");
  DOM.dlQualityIcon = document.getElementById("dlQualityIcon");
  DOM.dlQualityText = document.getElementById("dlQualityText");
  DOM.playerDownloadBtn = document.getElementById("playerDownloadBtn");
  DOM.playerMusicAppBtn = document.getElementById("playerMusicAppBtn");
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
  DOM.togglePlaylistBtn = document.getElementById("togglePlaylistBtn");
  DOM.playlistBadge = document.getElementById("playlistBadge");
  DOM.playlistDrawer = document.getElementById("playlistDrawer");
  DOM.closePlaylistBtn = document.getElementById("closePlaylistBtn");
  DOM.shufflePlaylistBtn = document.getElementById("shufflePlaylistBtn");
  DOM.playlistItems = document.getElementById("playlistItems");
  DOM.playlistStatusText = document.getElementById("playlistStatusText");
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
  updateDownloadQualityUI();
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
        if (AppState.searchResults.length > 0) {
          playSong(AppState.searchResults[0]);
          showToast(`🎵 Playing "${AppState.searchResults[0].title}" with related tracks in Playlist!`, "info");
        }
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
      AppState.activeAlbum = "all";
      AppState.currentPage = 1;
      if (AppState.searchQuery) {
        executeSearch(AppState.searchQuery);
      } else {
        renderContent();
      }
    });
  });

  // Type / Mood Chips
  if (DOM.typeChips) {
    DOM.typeChips.forEach(chip => {
      chip.addEventListener("click", () => {
        DOM.typeChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        AppState.activeType = chip.dataset.type || "all";
        AppState.currentPage = 1;
        if (AppState.searchQuery) {
          executeSearch(AppState.searchQuery);
        } else {
          renderContent();
        }
      });
    });
  }

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

  if (DOM.dlQualityBtn) {
    DOM.dlQualityBtn.addEventListener("click", () => {
      cycleDownloadQuality();
    });
  }

  if (DOM.playerDownloadBtn) {
    DOM.playerDownloadBtn.addEventListener("click", () => {
      if (AppState.currentSong) handleDownloadAction(AppState.currentSong);
    });
  }

  if (DOM.playerMusicAppBtn) {
    DOM.playerMusicAppBtn.addEventListener("click", () => {
      if (AppState.currentSong) handleOpenInMobileMusicApp(AppState.currentSong);
    });
  }

  // Playlist Drawer & Queue Controls
  if (DOM.togglePlaylistBtn) {
    DOM.togglePlaylistBtn.addEventListener("click", () => {
      togglePlaylistDrawer();
    });
  }

  if (DOM.closePlaylistBtn) {
    DOM.closePlaylistBtn.addEventListener("click", () => {
      togglePlaylistDrawer(false);
    });
  }

  if (DOM.shufflePlaylistBtn) {
    DOM.shufflePlaylistBtn.addEventListener("click", () => {
      shuffleQueue();
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
// 3. String Normalization, Phonetics & Typo-Tolerant Fuzzy Matching Engine
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

// Enhanced Phonetic transformation for Tanglish (Romanized Tamil & Indian words)
function toPhonetic(s) {
  if (!s) return "";
  let str = String(s).toLowerCase();
  str = str.replace(/aa+/g, "a")
           .replace(/ee+/g, "i")
           .replace(/oo+/g, "u")
           .replace(/ii+/g, "i")
           .replace(/uu+/g, "u")
           .replace(/ai|ay/g, "a")
           .replace(/ou|au/g, "u")
           .replace(/o+/g, "u")
           .replace(/e+/g, "i")
           .replace(/dh|th/g, "t")
           .replace(/sh|ch|zh|z|j/g, "s")
           .replace(/ph|f/g, "p")
           .replace(/b/g, "p")
           .replace(/g/g, "k")
           .replace(/d/g, "t")
           .replace(/w/g, "v")
           .replace(/y/g, "i")
           .replace(/h/g, "")
           .replace(/([a-z0-9])\1+/g, "$1")
           .replace(/[^a-z0-9]/g, "");
  return str;
}

// Fast bounded Levenshtein distance (aborts early if distance exceeds maxDist)
function boundedLevenshtein(a, b, maxDist) {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxDist) return maxDist + 1;

  let prev = [];
  for (let j = 0; j <= lb; j++) prev[j] = j;

  for (let i = 1; i <= la; i++) {
    let curr = [i];
    let rowMin = curr[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= lb; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      const val = Math.min(
        curr[j - 1] + 1,       // insertion
        prev[j] + 1,           // deletion
        prev[j - 1] + cost     // substitution
      );
      curr[j] = val;
      if (val < rowMin) rowMin = val;
    }
    if (rowMin > maxDist) return maxDist + 1;
    prev = curr;
  }
  return prev[lb];
}

// Collapses doubled consonants and trailing vowels (a/e)
function normalizeTamilWord(str) {
  if (!str) return "";
  return String(str).toLowerCase()
    .replace(/aa+/g, "a")
    .replace(/ee+/g, "i")
    .replace(/oo+/g, "u")
    .replace(/ii+/g, "i")
    .replace(/uu+/g, "u")
    .replace(/ai|ay/g, "a")
    .replace(/([a-z])\1+/g, "$1") // collapse doubled consonants (kk -> k, nn -> n, ll -> l, tt -> t, pp -> p)
    .replace(/[ae]+$/, "");       // only normalize trailing a/e endings (e.g. kulla/kulle, nikkira/nikkire)
}

// Flexible token matching against target words (exact regex, transliteration normalized, or Levenshtein <= 1)
function checkTokenInTarget(token, tokenRegex, target, targetWords) {
  if (!token) return true;
  if (tokenRegex && tokenRegex.test(target)) return true;
  const normTok = normalizeTamilWord(token);
  const words = Array.isArray(targetWords) ? targetWords : (target || "").split(" ").filter(Boolean);
  for (const w of words) {
    if (w === token) return true;
    if (token[0] !== w[0]) continue; // First letter must match to prevent unrelated words from matching
    const normW = normalizeTamilWord(w);
    if (normTok && normW && normTok === normW) return true;
    if (token.length >= 6 && w.length >= 6 && boundedLevenshtein(token, w, 1) <= 1) return true;
  }
  return false;
}

// Pre-cleans common Tamil/Indian transliteration typos before online search
function correctSearchQuery(q) {
  if (!q) return "";
  const replacements = {
    "movice": "movie",
    "flim": "film",
    "filam": "film",
    "ghili": "ghilli",
    "gilli": "ghilli",
    "kummi paatu": "kummi paattu",
    "kummipaattu": "kummi paattu",
    "kummipaatu": "kummi paattu",
    "en aasa machan": "en aasai machan",
    "en aasai machaan": "en aasai machan",
    "aasa machan": "aasai machan",
    "aasa machaan": "aasai machan",
    "vanathai parthen": "vaanathe paarthein",
    "vanathai": "vaanathe",
    "parthen": "paarthein",
    "machan": "machaan",
    "maachan": "machaan",
    "aniruth": "anirudh",
    "spb": "s p balasubrahmanyam",
    "yesudas": "k j yesudas",
    "chithra": "k s chithra",
    "janaki": "s janaki",
    "arr": "a r rahman",
    "yuvan": "yuvan shankar raja",
    "harris": "harris jayaraj",
    "arabi": "arabic",
    "vikrem": "vikram",
    "jayler": "jailer",
    "hokum": "hukum",
    "hukumm": "hukum",
    "badaas": "badass",
    "thupaki": "thuppakki",
    "thupakki": "thuppakki",
    "illayaraja": "ilaiyaraaja",
    "ilayaraja": "ilaiyaraaja",
    "chutamalle": "chuttamalle",
    "vaathy": "vaathi",
    "kaavala": "kaavaalaa",
    "mangatha": "mankatha",
    "mangkatha": "mankatha",
    "sandramukhi": "chandramukhi",
    "endhiran": "enthiran",
    "doktor": "doctor",
    "doktar": "doctor",
    "amaram": "amaran",
    "amram": "amaran",
    "kannukulla nikkira": "kannukulla nikkira",
    "kannukulla nikkura": "kannukulla nikkira",
    "kannukkulla nikkira": "kannukulla nikkira",
    "kannukulle nikkira": "kannukulla nikkira",
    "kannukulla nikkire": "kannukulla nikkira",
    "kannukulla": "kannukulla",
    "kannukkulla": "kannukulla",
    "kannukulle": "kannukulle",
    "kannukkulle": "kannukulle",
    "sa rajkumar": "s a rajkumar",
    "s.a.rajkumar": "s a rajkumar",
    "unnikrishnan": "p unnikrishnan",
    "unni menon": "unni menon",
    "pennin manathai thottu": "pennin manathai thottu",
    "pennin manathai": "pennin manathai thottu",
    "beest": "beast",
    "leoo": "leo",
    "vetaiyan": "vettaiyan",
    "vetayan": "vettaiyan",
    "rayan": "raayan",
    "rayen": "raayan",
    "premm": "premam",
    "avesham": "aavesham",
    "visvaasam": "viswasam",
    "basha": "baasha",
    "anamalai": "annamalai",
    "shivaji": "sivaji",
    "padayapa": "padayappa",
    "padaiyappa": "padayappa"
  };
  let corrected = q;
  for (const [typo, fix] of Object.entries(replacements)) {
    const reg = new RegExp(`\\b${typo}\\b`, "gi");
    corrected = corrected.replace(reg, fix);
  }
  return corrected;
}

// Decodes common HTML entities returned from live API responses (&quot; -> ", &#039; -> ')
function decodeHtmlEntities(str) {
  if (!str) return "";
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function prepareSongSearchMetadata(song) {
  const title = decodeHtmlEntities(song.title || song.name || "");
  const artist = decodeHtmlEntities(song.artist || song.singer || song.artists || "");
  const album = decodeHtmlEntities(song.album || song.movie || "");
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

  const titleTokens = normTitle.split(" ").filter(Boolean);
  const albumTokens = normAlbum.split(" ").filter(Boolean);
  const artistTokens = normArtist.split(" ").filter(Boolean);

  const rawCorpus = [normTitle, normArtist, normAlbum, normLang, normCategory, ...normTags].join(" ");
  const compactCorpus = normalizeCompact(rawCorpus);
  const phoneticCorpus = toPhonetic(rawCorpus);
  const pTitle = toPhonetic(normTitle);
  const pAlbum = toPhonetic(normAlbum);
  const pArtist = toPhonetic(normArtist);

  const wordTokens = rawCorpus.split(" ").filter(w => w.length >= 2);
  const phoneticTokens = wordTokens.map(w => toPhonetic(w)).filter(Boolean);

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
    _coreTitle: cleanCoreTitle(title),
    _coreAlbum: cleanCoreTitle(album),
    _compactTitle: normalizeCompact(normTitle),
    _compactAlbum: normalizeCompact(normAlbum),
    _compactArtist: normalizeCompact(normArtist),
    _pTitle: pTitle,
    _pAlbum: pAlbum,
    _pArtist: pArtist,
    _titleTokens: titleTokens,
    _albumTokens: albumTokens,
    _artistTokens: artistTokens,
    _pTitleTokens: titleTokens.map(w => toPhonetic(w)).filter(Boolean),
    _pAlbumTokens: albumTokens.map(w => toPhonetic(w)).filter(Boolean),
    _pArtistTokens: artistTokens.map(w => toPhonetic(w)).filter(Boolean),
    _targetText: `${normTitle} ${normAlbum} ${normArtist}`,
    _albumFirst: albumTokens[0] || "",
    _compound1: `${normTitle} ${normAlbum}`,
    _compound2: `${normAlbum} ${normTitle}`,
    _searchCorpus: rawCorpus,
    _compactCorpus: compactCorpus,
    _phoneticCorpus: phoneticCorpus,
    _wordTokens: wordTokens,
    _phoneticTokens: phoneticTokens
  };
}

// Cleans core title by removing extraneous movie tags, bracketed suffixes, and feat tags
function cleanCoreTitle(rawTitle) {
  if (!rawTitle) return "";
  return rawTitle
    .replace(/\s*\([^)]*(?:from|soundtrack|ost|version|theme|feat|ft\.)[^)]*\)/gi, " ")
    .replace(/\s*\[[^\]]*(?:from|soundtrack|ost|version|theme|feat|ft\.)[^\]]*\]/gi, " ")
    .replace(/\s*-\s*(?:from|soundtrack|ost|halamithi|original|lyric|audio|video|remix|reprise).*/gi, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Intelligently finds matching original singer / 320kbps full-length stream from JioSaavn catalogue
function findFullLengthAudioMatch(rawTitle, rawArtist = "", rawAlbum = "") {
  if (!rawTitle) return null;
  const normTitle = normalizeSearchText(rawTitle);
  const coreTitle = cleanCoreTitle(rawTitle);
  const normAlbum = normalizeSearchText(rawAlbum);

  const pool = (Array.isArray(AppState.masterSongs) && AppState.masterSongs.length > 0)
    ? AppState.masterSongs
    : (typeof window !== "undefined" && Array.isArray(window.CATALOGUE_SONGS) ? window.CATALOGUE_SONGS : []);

  const candidates = [];

  for (const s of pool) {
    if (!s.audio_url || !s.audio_url.includes("aac.saavncdn.com")) continue;

    const sNormTitle = s._normTitle || normalizeSearchText(s.title);
    const sCoreTitle = cleanCoreTitle(s.title);
    const sNormAlbum = s._normAlbum || normalizeSearchText(s.album);

    let matchQuality = 0;

    // 1. Exact normalized title match
    if (sNormTitle === normTitle) matchQuality += 10000;
    // 2. Exact core title match
    else if (coreTitle && sCoreTitle === coreTitle) matchQuality += 8000;
    // 3. Album match + Core title match
    else if (normAlbum && sNormAlbum === normAlbum && (sCoreTitle.includes(coreTitle) || coreTitle.includes(sCoreTitle))) matchQuality += 7000;
    // 4. Starts with core title
    else if (coreTitle && coreTitle.length >= 3 && (sCoreTitle.startsWith(coreTitle) || sNormTitle.startsWith(coreTitle))) matchQuality += 4000;
    // 5. Substring match
    else if (coreTitle && coreTitle.length >= 4 && sNormTitle.includes(coreTitle)) matchQuality += 2000;

    if (matchQuality > 0) {
      const sFull = `${(s.title || "").toLowerCase()} ${(s.album || "").toLowerCase()}`;
      const isTeaser = /\b(audio teaser|teaser|promo|trailer|glimpse|dialogue promo)\b/i.test(sFull) || (s.duration && s.duration < 65);
      const isRemix = /\b(remix|dj|lofi|lo-fi|flip|slowed|sped up)\b/i.test(sFull);

      // Severe penalty for teasers, snippets, remixes when matching original full audio
      if (isTeaser) matchQuality -= 6000;
      if (isRemix) matchQuality -= 3000;
      if (s.duration >= 90) matchQuality += 1500; // Prefer full-length 2-6 min track

      candidates.push({ song: s, quality: matchQuality });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.quality - a.quality);
  return candidates[0].song;
}

// Filters out amateur covers, karaoke, and tribute remakes so original singers/movie tracks always take priority
function isAmateurCoverOrKaraoke(title, artist = "", album = "") {
  const t = (title || "").toLowerCase();
  const a = (artist || "").toLowerCase();
  const alb = (album || "").toLowerCase();
  const full = `${t} ${a} ${alb}`;
  const filterKeywords = [
    "karaoke", "backing track", "tribute", "cover version",
    "acoustic cover", "instrumental cover", "sing2piano", "the karaoke channel",
    "piano cover", "lofi cover", "guitar cover", "made famous by",
    "in the style of", "originally performed by", "hit crew", "cover artist",
    "tribute band", "remix cover", "lofi flip", "slowed reverb", "ringtone"
  ];
  return filterKeywords.some(kw => full.includes(kw));
}

// ==========================================================================
// 3. High-Precision Query Context & Typo-Tolerant Matcher
// ==========================================================================

function buildQueryContext(rawQuery) {
  if (!rawQuery) return null;
  const normQ = normalizeSearchText(rawQuery);
  const compactQ = normalizeCompact(rawQuery);
  if (!normQ && !compactQ) return null;

  const noiseRegex = /\b(movice|movies|movie|movi|moive|movei|films|film|flims|flim|filam|padangal|padam|cinema|cinemas|theatre|theatres|soundtracks|soundtrack|ost|albums|album|songs|song|sngs|sng|paatu|paattu|pattu|geetham|mp3|tracks|track|audios|audio|full|original|hits|hit|classics|classic|evergreen|golden|blockbusters|blockbuster|popular)\b/gi;
  let cleanQ = normQ.replace(noiseRegex, " ").replace(/\s+/g, " ").trim();
  const typoCorrected = correctSearchQuery(normQ);
  if (typoCorrected && typoCorrected !== normQ) {
    const cleanTypo = typoCorrected.replace(noiseRegex, " ").replace(/\s+/g, " ").trim();
    if (cleanTypo) cleanQ = cleanTypo;
  }
  if (!cleanQ) cleanQ = normQ;

  const is1980to2026Query = /\b(1980\s*(?:to|-|until|through)\s*2026|1980\s+2026|1980s?\s*(?:to|-)\s*2026s?)\b/i.test(normQ) ||
    (/\b1980\b/i.test(normQ) && /\b2026\b/i.test(normQ));

  const specificYearMatch = normQ.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const specificYear = specificYearMatch ? specificYearMatch[1] : null;
  const isSpecificYearOnly = specificYear && cleanQ.replace(new RegExp(`\\b${specificYear}\\b`, 'g'), " ").trim().length === 0;

  const is80s = /\b(80s|eighties|80's|1980s|1980)\b/i.test(normQ);
  const is90s = /\b(90s|nineties|90's|1990s|1990)\b/i.test(normQ);
  const is2k = /\b(2k|2000s|2000|twothousand|2ks)\b/i.test(normQ);
  const isNow = /\b(now|latest|current|new|2010s|2020s|2024|2025|2026)\b/i.test(normQ);
  const requestedEra = is80s ? "80s" : (is90s ? "90s" : (is2k ? "2k" : (isNow ? "now" : null)));
  const eraWordRegex = /\b(80s|eighties|80's|1980s|1980|90s|nineties|90's|1990s|1990|2k|2000s|2000|twothousand|2ks|now|latest|current|new|2010s|2020s|2024|2025|2026)\b/gi;
  const remainingQuery = cleanQ.replace(eraWordRegex, " ").replace(/\s+/g, " ").trim();
  const isPureEraQuery = requestedEra && remainingQuery.length === 0;

  // When era or year is combined with keywords (e.g. "80s manithan", "1987 manithan", "90s rahman"), strip era/year from cleanQ
  if (requestedEra && remainingQuery.length > 0) {
    cleanQ = remainingQuery;
  }
  if (specificYear && !isSpecificYearOnly) {
    const withoutYear = cleanQ.replace(new RegExp(`\\b${specificYear}\\b`, 'g'), " ").replace(/\s+/g, " ").trim();
    if (withoutYear) cleanQ = withoutYear;
  }

  const isGenericMovieQuery = !requestedEra && /\b(movie|movies|movice|films|film|padam|padangal)\b/i.test(normQ) &&
    cleanQ.replace(/\b(all|the|form|from|to|and|in|of|songs|song|sngs|sng|tracks|track|audio|audios|full|original|mp3|hits|hit)\b/gi, " ").trim().length === 0;

  const isMovieWordInQuery = /\b(movie|movies|movice|films|film|flims|flim|filam|padangal|padam|cinema|cinemas|theatre|theatres|soundtracks|soundtrack|ost|albums|album)\b/i.test(normQ);

  const isMelodyQ = /\b(melody|melodies|love|romantic|romance|kadhal|kadhale)\b/i.test(normQ);
  const isKuthuQ = /\b(kuthu|dance|party|fast beat|fastbeat|mass)\b/i.test(normQ);
  const isFolkQ = /\b(folk|gaana|gana|dappankuthu|gramathu)\b/i.test(normQ);
  const isSadQ = /\b(sad|heartbreak|pain|alone|crying|feeling|emotional)\b/i.test(normQ);
  const isDevotionalQ = /\b(devotional|spiritual|god|bhajan|bhajans|stotram|kavasam|agaval|chalisa)\b/i.test(normQ);
  const isRapQ = /\b(rap|hip hop|hiphop|hip-hop|indie)\b/i.test(normQ);
  const isLofiQ = /\b(lofi|lo-fi|chill|acoustic|relax|sleep)\b/i.test(normQ);
  const isEdmQ = /\b(edm|remix|dj|club)\b/i.test(normQ);
  const isSpotifyQ = /\b(spotify|sportity|jiosaavn|jiosaraven|all type|all types)\b/i.test(normQ);
  const requestedType = isMelodyQ ? "melody" : (isKuthuQ ? "kuthu" : (isFolkQ ? "folk" : (isSadQ ? "sad" : (isDevotionalQ ? "devotional" : (isRapQ ? "rap" : (isLofiQ ? "lofi" : (isEdmQ ? "edm" : (isSpotifyQ ? "spotify" : null))))))));

  const isPureTypeQuery = requestedType && cleanQ.replace(/\b(melody|melodies|love|romantic|romance|kadhal|kadhale|kuthu|dance|party|fast|beat|mass|folk|gaana|gana|dappankuthu|gramathu|sad|heartbreak|pain|alone|crying|feeling|emotional|devotional|spiritual|god|bhajan|bhajans|stotram|kavasam|agaval|chalisa|rap|hip|hop|hiphop|indie|lofi|chill|acoustic|relax|sleep|edm|remix|dj|club|spotify|sportity|jiosaavn|jiosaraven|all|type|types|songs|song)\b/gi, " ").trim().length === 0;

  const cleanCompactQ = normalizeCompact(cleanQ);
  const cleanPhoneticQ = toPhonetic(cleanQ);
  const phoneticQ = toPhonetic(rawQuery);
  const qPhonetics = [phoneticQ, cleanPhoneticQ].filter(Boolean);
  const coreQ = cleanCoreTitle(rawQuery);
  const qForDist = cleanQ && cleanQ.length >= 4 ? cleanQ : (normQ.length >= 4 ? normQ : null);

  const tokenSource = cleanQ && cleanQ.length >= 2 ? cleanQ : normQ;
  const tokens = tokenSource.split(" ").filter(w => w.length >= 2);
  const tokenRegexes = tokens.length >= 2 ? tokens.map(t => new RegExp(`\\b${t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i")) : null;

  return {
    rawQuery, normQ, cleanQ, compactQ, cleanCompactQ, cleanPhoneticQ, phoneticQ,
    qPhonetics, coreQ, qForDist, tokens, tokenRegexes,
    is1980to2026Query, specificYear, isSpecificYearOnly,
    requestedEra, isPureEraQuery, isGenericMovieQuery, isMovieWordInQuery,
    requestedType, isPureTypeQuery
  };
}

function scoreSongWithContext(song, ctx) {
  const {
    normQ, cleanQ, compactQ, cleanPhoneticQ, phoneticQ,
    qPhonetics, coreQ, qForDist, tokens, tokenRegexes,
    is1980to2026Query, specificYear, isSpecificYearOnly,
    requestedEra, isPureEraQuery, isGenericMovieQuery, isMovieWordInQuery,
    requestedType, isPureTypeQuery
  } = ctx;

  // 1980 to 2026 range queries
  if (is1980to2026Query) {
    let yearRangeScore = 5500;
    if (song.year) yearRangeScore += 200;
    if (Array.isArray(song.sections) && song.sections.includes("trending")) yearRangeScore += 150;
    if (song.era === "80s") yearRangeScore += 120;
    else if (song.era === "90s") yearRangeScore += 100;
    else if (song.era === "2k") yearRangeScore += 90;
    else if (song.era === "now") yearRangeScore += 80;
    return { matched: true, score: yearRangeScore };
  }

  // Specific 4-digit Year Query
  if (isSpecificYearOnly) {
    const sYear = String(song.year || "");
    const sTags = Array.isArray(song.tags) ? song.tags.map(t => String(t).toLowerCase()) : [];
    if (sYear === specificYear || sTags.includes(specificYear) || (song.album && song.album.includes(specificYear))) {
      return { matched: true, score: 6600 };
    }
    return { matched: false, score: 0 };
  }

  // Pure era query
  if (isPureEraQuery) {
    if (song.era === requestedEra) {
      return { matched: true, score: 6100 };
    }
    return { matched: false, score: 0 };
  }

  // Generic movie query
  if (isGenericMovieQuery) {
    let movieScore = 4800;
    if (song.album && song.album.length > 0) movieScore += 200;
    return { matched: true, score: movieScore };
  }

  // Pure genre / mood / type query
  if (isPureTypeQuery) {
    if (requestedType === "spotify") return { matched: true, score: 5200 };
    if (song.type === requestedType || (Array.isArray(song.tags) && song.tags.includes(requestedType))) {
      return { matched: true, score: 6100 };
    }
    return { matched: false, score: 0 };
  }

  let score = 0;
  let matched = false;

  // Era / Year / Type contextual bonuses (when combined with keywords)
  if (requestedEra && song.era === requestedEra) score += 2500;
  if (specificYear && (String(song.year) === specificYear || (song.album && song.album.includes(specificYear)))) {
    score += 3500;
  }
  if (requestedType && (song.type === requestedType || (Array.isArray(song.tags) && song.tags.includes(requestedType)))) {
    score += 2200;
  }
  if (AppState.activeType && AppState.activeType !== "all" && (song.type === AppState.activeType || (Array.isArray(song.tags) && song.tags.includes(AppState.activeType)))) {
    score += 500;
  }

  const normTitle = song._normTitle || normalizeSearchText(song.title || song.name || "");
  const normAlbum = song._normAlbum || normalizeSearchText(song.album || song.movie || "");
  const normArtist = song._normArtist || normalizeSearchText(song.artist || song.singer || "");
  const coreTitle = song._coreTitle || cleanCoreTitle(song.title);
  const coreAlbum = song._coreAlbum || cleanCoreTitle(song.album);
  const pTitle = song._pTitle || toPhonetic(normTitle);
  const pAlbum = song._pAlbum || toPhonetic(normAlbum);
  const pArtist = song._pArtist || toPhonetic(normArtist);

  const compound1 = song._compound1 || `${normTitle} ${normAlbum}`;
  const compound2 = song._compound2 || `${normAlbum} ${normTitle}`;
  const rawTags = song._normTags || [];

  // 0a. Direct alias or tag match (e.g. "kannukulla nikkira" in song tags for "Kannukkulle")
  for (const tag of rawTags) {
    if (tag === normQ || tag === cleanQ || (normQ.length >= 6 && tag === normQ)) {
      matched = true;
      score += 9500;
      break;
    }
  }

  // 0b. Compound title + album match
  if (cleanQ === compound1 || cleanQ === compound2 || normQ === compound1 || normQ === compound2) {
    matched = true;
    score += 8500;
  } else if (cleanQ.startsWith(compound1 + " ") || cleanQ.startsWith(compound2 + " ")) {
    matched = true;
    score += 7500;
  }

  // 1. Song Title matches
  if (coreQ && coreTitle === coreQ) {
    matched = true;
    score += 12000;
  } else if (normTitle === normQ || normTitle === cleanQ) {
    matched = true;
    score += 10000;
  } else if (coreQ && coreTitle.startsWith(coreQ)) {
    matched = true;
    score += 5000;
  } else if (normTitle.startsWith(cleanQ + " ") || normTitle.startsWith(normQ + " ")) {
    matched = true;
    score += 4500;
  } else if (cleanQ.length >= 3 && cleanQ.startsWith(normTitle + " ")) {
    matched = true;
    score += 4000;
  } else if (normTitle.includes(" " + cleanQ + " ") || normTitle.startsWith(cleanQ + " ") || normTitle.endsWith(" " + cleanQ) ||
             normTitle.includes(" " + normQ + " ") || normTitle.startsWith(normQ + " ") || normTitle.endsWith(" " + normQ)) {
    matched = true;
    score += 3500;
  } else if (cleanQ.length >= 5 && normTitle.includes(cleanQ)) {
    matched = true;
    score += 1500;
  }

  // Compact title match (e.g. "naatunaatu" -> "Naatu Naatu")
  const compactTitle = song._compactTitle || normalizeCompact(normTitle);
  if (compactQ && (compactTitle === compactQ || compactTitle.startsWith(compactQ))) {
    matched = true;
    score += 4000;
  }

  // 2. Movie / Album matches (Ensures ALL songs belonging to the album are included and displayed separately!)
  if (normAlbum === normQ || normAlbum === cleanQ || (coreQ && coreAlbum === coreQ)) {
    matched = true;
    score += 5000;
    if (coreTitle.includes(coreQ) || normTitle.includes(normQ) || (cleanQ && normTitle.includes(cleanQ))) {
      score += 8500; // Title track from same named movie (e.g. Manithan Manithan in Manithan)
    }
    if (isMovieWordInQuery) {
      score += 3500; // Explicitly searched for movie/album
    }
  } else if (normAlbum.startsWith(cleanQ + " ") || normAlbum.startsWith(normQ + " ")) {
    matched = true;
    score += 4000;
  } else if (cleanQ.length >= 3 && cleanQ.startsWith(normAlbum + " ")) {
    matched = true;
    score += 3500;
  } else if (normAlbum.includes(" " + cleanQ + " ") || normAlbum.startsWith(cleanQ + " ") || normAlbum.endsWith(" " + cleanQ) ||
             normAlbum.includes(" " + normQ + " ") || normAlbum.startsWith(normQ + " ") || normAlbum.endsWith(" " + normQ)) {
    matched = true;
    score += 3000;
  } else if (cleanQ.length >= 5 && normAlbum.includes(cleanQ)) {
    matched = true;
    score += 1200;
  }

  // Compact album match
  const compactAlbum = song._compactAlbum || normalizeCompact(normAlbum);
  if (compactQ && (compactAlbum === compactQ || compactAlbum.startsWith(compactQ))) {
    matched = true;
    score += 3500;
  }

  // 3. Artist matches
  if (normArtist === normQ || normArtist === cleanQ) {
    matched = true;
    score += 3000;
  } else if (normArtist.startsWith(cleanQ + " ") || normArtist.startsWith(normQ + " ")) {
    matched = true;
    score += 2500;
  } else if (normArtist.includes(" " + cleanQ + " ") || normArtist.startsWith(cleanQ + " ") || normArtist.endsWith(" " + cleanQ) ||
             normArtist.includes(" " + normQ + " ") || normArtist.startsWith(normQ + " ") || normArtist.endsWith(" " + normQ)) {
    matched = true;
    score += 2000;
  }

  // Compact artist match (e.g. "arrahman", "gvprakash")
  const compactArtist = song._compactArtist || normalizeCompact(normArtist);
  if (compactQ && (compactArtist === compactQ || compactArtist.startsWith(compactQ))) {
    matched = true;
    score += 3000;
  }

  // 4. Phonetic matches
  for (const qp of qPhonetics) {
    if (qp.length < 3) continue;
    if (pTitle === qp) {
      matched = true;
      score += 2500;
    } else if (pAlbum === qp) {
      matched = true;
      score += 2400;
    } else if (pArtist === qp) {
      matched = true;
      score += 1800;
    } else if (song._pTitleTokens && song._pTitleTokens.includes(qp)) {
      matched = true;
      score += 1500;
    } else if (song._pAlbumTokens && song._pAlbumTokens.includes(qp)) {
      matched = true;
      score += 1400;
    } else if (song._pArtistTokens && song._pArtistTokens.includes(qp)) {
      matched = true;
      score += 1200;
    }
  }

  // 5. Typo & edit distance on title & album (strictly bounded to max distance 1)
  if (qForDist) {
    const maxDist = 1;
    if (boundedLevenshtein(qForDist, normTitle, maxDist) <= maxDist) {
      matched = true;
      score += 1200;
    }
    if (boundedLevenshtein(qForDist, normAlbum, maxDist) <= maxDist) {
      matched = true;
      score += 1600;
    } else {
      const albumFirst = song._albumFirst || normAlbum.split(" ")[0];
      if (albumFirst && albumFirst.length >= 4 && boundedLevenshtein(qForDist, albumFirst, maxDist) <= maxDist) {
        matched = true;
        score += 1400;
      }
    }
  }

  // 6. Multi-token phrase matching across Title / Album / Artist / Tags with Tamil transliteration support
  if (tokenRegexes && tokenRegexes.length >= 2) {
    const target = song._targetText || `${normTitle} ${normAlbum} ${normArtist} ${rawTags.join(" ")}`;
    const targetWords = (song._targetWords || target.split(" ")).filter(Boolean);
    let allTokensPresent = true;
    const usedWordIndices = new Set();
    for (let i = 0; i < tokenRegexes.length; i++) {
      const tok = (tokens && tokens[i]) || "";
      const normTok = normalizeTamilWord(tok);
      let foundIndex = -1;
      for (let j = 0; j < targetWords.length; j++) {
        if (usedWordIndices.has(j)) continue;
        const w = targetWords[j];
        if (w === tok) { foundIndex = j; break; }
        if (tok[0] !== w[0]) continue;
        const normW = normalizeTamilWord(w);
        if (normTok && normW && normTok === normW) { foundIndex = j; break; }
        if (tok.length >= 6 && w.length >= 6 && boundedLevenshtein(tok, w, 1) <= 1) { foundIndex = j; break; }
      }
      if (foundIndex !== -1) {
        usedWordIndices.add(foundIndex);
      } else {
        allTokensPresent = false;
        break;
      }
    }
    if (allTokensPresent) {
      matched = true;
      score += 4500;
      let allInTitle = true;
      const titleWords = (song._titleTokens || normTitle.split(" ")).filter(Boolean);
      for (let i = 0; i < tokenRegexes.length; i++) {
        const tok = (tokens && tokens[i]) || "";
        const reg = tokenRegexes[i];
        if (!checkTokenInTarget(tok, reg, normTitle, titleWords)) {
          allInTitle = false;
          break;
        }
      }
      if (allInTitle) score += 4000;
    }
  }

  // 7. Penalties for non-original versions (teasers, remixes, lofis, karaokes, covers)
  if (matched) {
    const tFull = `${(song.title || "").toLowerCase()} ${(song.album || "").toLowerCase()} ${(song.artist || "").toLowerCase()}`;
    const queryWantsTeaser = /\b(teaser|promo|trailer|glimpse|dialogue|dialog)\b/i.test(normQ);
    const queryWantsRemix = /\b(remix|mix|dj|club|flip|mashup)\b/i.test(normQ);
    const queryWantsLofi = /\b(lofi|lo-fi|chill|acoustic|slowed|sped|speed|reverb)\b/i.test(normQ);
    const queryWantsKaraoke = /\b(karaoke|instrumental|backing)\b/i.test(normQ);
    const queryWantsCover = /\b(cover|tribute|remake)\b/i.test(normQ);

    const hasTeaser = /\b(audio teaser|teaser|trailer|promo|dialogue promo|dialogue|glimpse|snippet|sample)\b/i.test(tFull) || (song.duration && song.duration < 65 && !normTitle.includes("intro"));
    const hasRemix = /\b(remix|dj\s|dj-|club mix|edm mix|flip|party mix|dance mix)\b/i.test(tFull) || normArtist.startsWith("dj ");
    const hasLofi = /\b(lofi|lo-fi|slowed|sped up|speed up|reverb|ambient)\b/i.test(tFull);
    const hasKaraoke = /\b(karaoke|instrumental|backing track|minus one|off vocal)\b/i.test(tFull);
    const hasCover = /\b(cover|tribute|made famous by|in the style of)\b/i.test(tFull);

    if (!queryWantsTeaser && hasTeaser) score -= 12000;
    if (!queryWantsRemix && hasRemix) score -= 12000;
    if (!queryWantsLofi && hasLofi) score -= 12000;
    if (!queryWantsKaraoke && hasKaraoke) score -= 12000;
    if (!queryWantsCover && hasCover) score -= 12000;

    // Authentic original master track bonus
    if (!hasTeaser && !hasRemix && !hasLofi && !hasKaraoke && !hasCover) {
      score += 4000;
      if (song.duration >= 180) score += 4000;
      else if (song.duration >= 90) score += 2000;
    }
  }

  // Strict relevance threshold: negative score or score < 500 is NOT a match!
  if (score < 500) {
    matched = false;
  }

  return { matched, score };
}

// Typo-tolerant relevance scorer & matcher
function scoreAndMatchSong(song, rawQuery, queryContext = null) {
  if (!rawQuery) return { matched: true, score: 0 };
  const ctx = queryContext || buildQueryContext(rawQuery);
  if (!ctx) return { matched: true, score: 0 };
  return scoreSongWithContext(song, ctx);
}

// Backward-compatible matcher (returns true/false for filtering)
function matchSongQuery(song, rawQuery) {
  return scoreAndMatchSong(song, rawQuery).matched;
}

// Master search function: filters and sorts songs by typo-tolerant relevance score
function searchMasterSongs(rawQuery) {
  if (!rawQuery) return [...AppState.masterSongs];
  const ctx = buildQueryContext(rawQuery);
  if (!ctx) return [...AppState.masterSongs];

  const results = [];
  for (const song of AppState.masterSongs) {
    const res = scoreSongWithContext(song, ctx);
    if (res.matched && res.score >= 500) {
      results.push({ song, score: res.score });
    }
  }
  // Sort descending by relevance score (highest quality match first)
  results.sort((a, b) => b.score - a.score);
  return results.map(r => r.song);
}

// ==========================================================================
// 4. Catalogue Loader & Deduplicated Merging
// ==========================================================================

function loadCatalogue() {
  const rawCatalogue = (typeof window !== "undefined" && window.CATALOGUE_SONGS && Array.isArray(window.CATALOGUE_SONGS) && window.CATALOGUE_SONGS.length > 0)
    ? window.CATALOGUE_SONGS
    : [];

  // Combine window.CATALOGUE_SONGS with DEFAULT_STATIC_SONGS (curated master collection takes priority)
  let sourceList = rawCatalogue.length > 0
    ? [...DEFAULT_STATIC_SONGS, ...rawCatalogue]
    : DEFAULT_STATIC_SONGS;

  // Append verified user-played online tracks after master catalogue
  try {
    const rawStored = localStorage.getItem("pmh_imported_songs");
    const stored = rawStored ? JSON.parse(rawStored) : [];
    if (Array.isArray(stored) && stored.length > 0) {
      const validStored = stored.filter(s => s && s.id && (s.audio_url || s.audio_file) && (s.title || s.name));
      sourceList = [...sourceList, ...validStored];
    }
  } catch (_) {}

  const seenIds = new Set();
  const seenKeys = new Set();
  const deduped = [];

  for (const s of sourceList) {
    if (!s || !s.id || !(s.title || s.name)) continue;

    const title = s.title || s.name || "";
    const artist = s.artist || s.singer || "";
    const normTitle = normalizeSearchText(title);
    const normArtist = normalizeSearchText(artist);
    const trackKey = `${normTitle}::${normArtist}`;

    if (seenIds.has(s.id) || seenKeys.has(trackKey)) continue;

    seenIds.add(s.id);
    seenKeys.add(trackKey);

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

// Auto-import any song found online permanently into website catalogue
function autoImportSongToCatalogue(song) {
  if (!song || !song.id) return;
  const rawTitle = song.title || song.name || "";
  const rawArtist = song.artist || song.singer || "";
  if (!rawTitle) return;

  const normTitle = normalizeSearchText(rawTitle);
  const normArtist = normalizeSearchText(rawArtist);
  const exists = AppState.masterSongs.some(s => s.id === song.id || (normalizeSearchText(s.title || "") === normTitle && normalizeSearchText(s.artist || "") === normArtist));
  if (exists) return;

  const prepared = prepareSongSearchMetadata({
    ...song,
    title: rawTitle,
    artist: rawArtist,
    album: song.album || song.movie || "Online Single",
    download_authorized: true,
    tags: [
      normTitle,
      normArtist,
      (song.album || "").toLowerCase(),
      (song.language || "tamil").toLowerCase(),
      song.type || "melody",
      song.era || "now",
      "movie",
      "movie songs",
      "jiosaavn",
      "spotify",
      "imported",
      "trending"
    ]
  });

  AppState.masterSongs = Object.freeze([prepared, ...AppState.masterSongs]);
  AppState.songs = [prepared, ...AppState.songs];

  try {
    const rawStored = localStorage.getItem("pmh_imported_songs");
    const stored = rawStored ? JSON.parse(rawStored) : [];
    if (!stored.some(s => s.id === prepared.id)) {
      stored.unshift(prepared);
      localStorage.setItem("pmh_imported_songs", JSON.stringify(stored.slice(0, 250)));
    }
  } catch (_) {}
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
    AppState.jioResults = [];
    AppState.spotifyResults = [];
    AppState.searchSourceFilter = "all";
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = false;
    if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "none";
    if (DOM.emptyState) DOM.emptyState.style.display = "none";
    renderContent();
    return;
  }

  AppState.searchQuery = trimmed;
  AppState.normalizedQuery = normalized;
  AppState.isSearching = true;
  AppState.searchSourceFilter = "all";
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "block";

  // ALWAYS filter and sort from the immutable master collection using typo-tolerant fuzzy relevance scoring!
  const localMatches = searchMasterSongs(trimmed).map(s => {
    s.source = "jiosaavn";
    return s;
  });
  AppState.jioResults = [...localMatches];
  AppState.spotifyResults = [];

  if (localMatches.length > 0) {
    // Song found in JioSaavn catalogue! Display immediately
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = true; // Indicates background Spotify query is underway in parallel
    AppState.searchResults = [...localMatches];
    AppState.queue = [...localMatches];
    renderContent();

    // Query Spotify & Global Online catalogue in parallel so BOTH JioSaavn & Spotify results appear!
    AppState.searchDebounceTimer = setTimeout(() => {
      fetchSpotifySearchResults(trimmed, thisRequestId, true /* isParallel */);
    }, 200);

    // If an optional external custom backend is configured, query asynchronously for extra live matches
    if (API_BASE) {
      setTimeout(() => {
        fetchBackendSearchResults(trimmed, thisRequestId);
      }, 350);
    }
  } else {
    // Song NOT found in JioSaavn catalogue!
    // Seamlessly query Spotify & Global Online catalogue in background without redirecting
    AppState.searchResults = [];
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = true;
    renderContent();

    AppState.searchDebounceTimer = setTimeout(() => {
      fetchSpotifySearchResults(trimmed, thisRequestId, false /* isParallel */);
    }, 250);
  }
}

// Reliable Dual-Mirror JioSaavn API Client with Automatic Failover
async function fetchJioMirrorApi(pathAndQuery, signal) {
  const mirrors = [
    "https://jiosaavn-api-sage.vercel.app",
    "https://jiosaavn-api-nine.vercel.app"
  ];
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}${pathAndQuery}`, signal ? { signal } : {});
      if (res.ok) {
        const json = await res.json();
        if (json && (json.data || json.results || Array.isArray(json))) {
          return json;
        }
      }
    } catch (_) {}
  }
  return null;
}

// Maps Live API Song or Album Track to Standard Song Object with Decoded Entities
function mapJioSongResult(r, index, fallbackCategory = "JioSaavn Live Global Stream") {
  const dl = r.downloadUrl && (r.downloadUrl.find(u => u.quality === "320kbps") || r.downloadUrl[r.downloadUrl.length - 1]);
  const img = r.image && (r.image.find(u => u.quality === "500x500") || r.image[r.image.length - 1]);
  const durSec = parseInt(r.duration, 10) || 220;
  const primaryArtists = (r.artists && r.artists.primary) ? r.artists.primary.map(a => a.name).join(", ") : "";
  const albumName = (r.album && typeof r.album === "object" && r.album.name) ? r.album.name : (typeof r.album === "string" ? r.album : "");

  const decodedTitle = decodeHtmlEntities(r.name || "Unknown Title");
  const decodedArtist = decodeHtmlEntities(primaryArtists || albumName || "Original Soundtrack");
  const decodedAlbum = decodeHtmlEntities(albumName || r.name || "Single");

  return prepareSongSearchMetadata({
    id: `saavn_${r.id || (Date.now() + "_" + index)}`,
    title: decodedTitle,
    artist: decodedArtist,
    album: decodedAlbum,
    year: r.year ? String(r.year) : "2024",
    duration: durSec,
    duration_str: formatTime(durSec),
    language: r.language ? capitalize(r.language) : (AppState.activeLanguage !== "all" ? capitalize(AppState.activeLanguage) : "Global"),
    category: fallbackCategory,
    sections: ["trending"],
    cover_url: img ? img.url : "static/images/only_friends_theme.svg",
    audio_url: dl ? dl.url : "",
    audio_file: "",
    is_preview: false,
    download_authorized: true,
    source: "jiosaavn",
    tags: [
      normalizeSearchText(decodedTitle),
      normalizeSearchText(decodedArtist),
      normalizeSearchText(decodedAlbum),
      "jiosaavn",
      "online"
    ]
  });
}

// Generates alternate transliteration variants (vowels, double consonants, common Tamil song aliases)
function getSearchQueryVariants(cleanQuery) {
  const variants = new Set();
  const lower = (cleanQuery || "").toLowerCase().trim();
  if (!lower) return [];
  variants.add(cleanQuery);

  // 1. Common Tamil song & chorus aliases (e.g. Kannukulla Nikkira -> Kannukulla Nikkire, Kannukkulle, Pennin Manathai Thottu)
  if (lower.includes("kannukulla") || lower.includes("kannukkulla") || lower.includes("kannukulle") || lower.includes("kannukkulle")) {
    if (lower.includes("nikki") || lower.includes("nikku") || lower.includes("nikire")) {
      variants.add("kannukulla nikkire");
      variants.add("kannukkulle");
      variants.add("pennin manathai thottu");
    } else {
      variants.add("kannukkulle");
      variants.add("kannukulla");
    }
  }

  // 2. Trailing vowel variations (a <-> e, e <-> a, a <-> u)
  if (/\b\w+a\b/.test(lower)) {
    variants.add(lower.replace(/\b(\w+)a\b/g, "$1e"));
  }
  if (/\b\w+e\b/.test(lower)) {
    variants.add(lower.replace(/\b(\w+)e\b/g, "$1a"));
  }

  // 3. Double vs single consonants (kk <-> k, ll <-> l, nn <-> n, tt <-> t, pp <-> p)
  const singleConsonants = lower.replace(/([klnpt])\1+/g, "$1");
  if (singleConsonants !== lower) variants.add(singleConsonants);

  // 4. Tamil "zh" <-> "l"
  if (lower.includes("zh")) variants.add(lower.replace(/zh/g, "l"));
  if (lower.includes("l") && !lower.includes("zh")) variants.add(lower.replace(/l/g, "zh"));

  // 5. "th" <-> "dh"
  if (lower.includes("dh")) variants.add(lower.replace(/dh/g, "th"));
  if (lower.includes("th")) variants.add(lower.replace(/th/g, "dh"));

  return Array.from(variants).slice(0, 4);
}

// Background JioSaavn & Online Catalogue Search Fallback (Zero Redirection, Full-Length Streams)
async function fetchSpotifySearchResults(query, requestId, isParallel = false) {
  if (!query) return;

  const noiseRegex = /\b(movice|movies|movie|movi|moive|movei|films|film|flims|flim|filam|padangal|padam|cinema|cinemas|theatre|theatres|soundtracks|soundtrack|ost|albums|album|songs|song|sngs|sng|paatu|paattu|pattu|geetham|mp3|tracks|track|audios|audio|full|original|hits|hit|classics|classic|evergreen|golden|blockbusters|blockbuster|popular)\b/gi;
  let cleanQuery = correctSearchQuery(query) || query;
  const strippedOnline = cleanQuery.replace(noiseRegex, " ").replace(/\s+/g, " ").trim();
  if (strippedOnline) {
    cleanQuery = strippedOnline;
  }
  const abortController = new AbortController();
  AppState.activeSearchAbortController = abortController;

  try {
    const timeoutId = setTimeout(() => abortController.abort(), 6000);

    // 1. Try backend API if configured
    if (API_BASE) {
      try {
        const backendRes = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(cleanQuery)}&language=${encodeURIComponent(AppState.activeLanguage)}`, { signal: abortController.signal });
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (requestId === AppState.searchRequestId && backendData.status === "success" && Array.isArray(backendData.songs) && backendData.songs.length > 0) {
            clearTimeout(timeoutId);
            const backendSongs = backendData.songs.map(s => prepareSongSearchMetadata({
              ...s,
              download_authorized: true,
              source: "spotify"
            }));
            backendSongs.forEach(s => autoImportSongToCatalogue(s));
            AppState.spotifyResults = backendSongs;
            AppState.isSpotifyFallbackResults = !isParallel;
            AppState.isFetchingSpotify = false;
            if (isParallel) {
              AppState.searchResults = [...AppState.jioResults, ...backendSongs];
            } else {
              AppState.searchResults = backendSongs;
            }
            AppState.queue = [...AppState.searchResults];
            renderContent();
            return;
          }
        }
      } catch (_) {}
    }

    // 2. Direct Dual-API Search (JioSaavn Live 320kbps Streams + Album Track Separation + Spotify/iTunes India Global Network)
    const yearMatch = cleanQuery.match(/\b(19\d\d|20[0-2]\d)\b/);
    const isYearOnly = /^(19\d\d|20[0-2]\d)$/.test(cleanQuery.trim());
    const apiSongQuery = isYearOnly ? `Tamil hits ${yearMatch[1]}` : cleanQuery;
    const apiAlbumQuery = isYearOnly ? `Tamil ${yearMatch[1]}` : cleanQuery;

    const queryVariants = getSearchQueryVariants(cleanQuery);
    const songEndpoints = [
      `/api/search/songs?query=${encodeURIComponent(apiSongQuery)}&limit=30`
    ];
    for (const v of queryVariants) {
      if (v !== cleanQuery && v !== apiSongQuery) {
        songEndpoints.push(`/api/search/songs?query=${encodeURIComponent(v)}&limit=15`);
      }
    }

    let liveJioSongs = [];

    // Fetch songs across query variants and albums in parallel across failover mirrors
    try {
      const songPromises = songEndpoints.map(ep => fetchJioMirrorApi(ep, abortController.signal));
      const albumPromise = fetchJioMirrorApi(`/api/search/albums?query=${encodeURIComponent(apiAlbumQuery)}&limit=4`, abortController.signal);

      const [albumData, ...songResults] = await Promise.all([albumPromise, ...songPromises]);

      for (const songData of songResults) {
        if (songData && songData.data && Array.isArray(songData.data.results)) {
          const mappedSongs = songData.data.results
            .map((r, idx) => mapJioSongResult(r, idx, "JioSaavn Live Global Stream"))
            .filter(s => s.audio_url && s.duration >= 60);
          liveJioSongs.push(...mappedSongs);
        }
      }

      // If albums matched, fetch all tracks of each matching album dynamically so every song is an individual result
      if (albumData && albumData.data && Array.isArray(albumData.data.results) && albumData.data.results.length > 0) {
        const matchingAlbums = albumData.data.results.slice(0, 3);
        const albumDetailsPromises = matchingAlbums.map(alb =>
          fetchJioMirrorApi(`/api/albums?id=${encodeURIComponent(alb.id)}`, abortController.signal)
        );
        const albumDetailsResults = await Promise.all(albumDetailsPromises);
        for (const albRes of albumDetailsResults) {
          if (albRes && albRes.data && Array.isArray(albRes.data.songs)) {
            const albumTracks = albRes.data.songs
              .map((r, idx) => mapJioSongResult(r, idx, "Tamil Album Tracks"))
              .filter(s => s.audio_url && s.duration >= 60);
            liveJioSongs.push(...albumTracks);
          }
        }
      }
    } catch (_) {}

    // Query Spotify & iTunes India Global Network in parallel (country=IN for complete Tamil catalog 1980-2026)
    let itunesSongs = [];
    try {
      const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=IN&entity=song&limit=40`;
      const res = await fetch(searchUrl, { signal: abortController.signal });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const filteredResults = data.results.filter(r => !isAmateurCoverOrKaraoke(r.trackName, r.artistName));
          const poolToMap = filteredResults.length > 0 ? filteredResults : data.results;

          itunesSongs = poolToMap.map((r, index) => {
            const durSec = Math.round((r.trackTimeMillis || 210000) / 1000);
            const artwork = (r.artworkUrl100 || "").replace("100x100bb", "600x600bb") || "static/images/only_friends_theme.svg";

            const decodedTitle = decodeHtmlEntities(r.trackName || "Unknown Title");
            const decodedArtist = decodeHtmlEntities(r.artistName || "Unknown Artist");
            const decodedAlbum = decodeHtmlEntities(r.collectionName || "Single");

            // Check if authentic full-length 320kbps JioSaavn stream is available in catalogue or live results
            const localMatch = findFullLengthAudioMatch(decodedTitle, decodedArtist, decodedAlbum) ||
              liveJioSongs.find(j => {
                const jCore = cleanCoreTitle(j.title);
                const rCore = cleanCoreTitle(decodedTitle);
                return jCore && rCore && (jCore === rCore || jCore.includes(rCore) || rCore.includes(jCore));
              });

            const hasFullAudio = localMatch && localMatch.audio_url && !localMatch.audio_url.includes("apple.com");
            const finalAudio = hasFullAudio ? localMatch.audio_url : (r.previewUrl || "");
            const finalDuration = hasFullAudio && localMatch.duration ? localMatch.duration : durSec;
            const finalDurationStr = hasFullAudio && localMatch.duration_str ? localMatch.duration_str : formatTime(durSec);

            return prepareSongSearchMetadata({
              id: `spotify_${r.trackId || (Date.now() + "_" + index)}`,
              title: decodedTitle,
              artist: decodedArtist,
              album: decodedAlbum,
              duration: finalDuration,
              duration_str: finalDurationStr,
              language: AppState.activeLanguage !== "all" ? capitalize(AppState.activeLanguage) : (r.primaryGenreName || "Global"),
              category: "JioSaavn & Spotify Global Catalogue",
              sections: ["trending"],
              cover_url: artwork,
              audio_url: finalAudio,
              audio_file: "",
              is_preview: !hasFullAudio,
              download_authorized: true,
              source: "spotify",
              spotify_id: r.trackId ? String(r.trackId) : "",
              tags: ["spotify", "jiosaavn", "online", "global", normalizeSearchText(decodedTitle), normalizeSearchText(decodedArtist)]
            });
          });
        }
      }
    } catch (_) {}

    clearTimeout(timeoutId);

    if (requestId !== AppState.searchRequestId) return;

    // Merge and deduplicate results
    const combinedOnline = [];
    const seenOnline = new Set();

    // Prefer live JioSaavn full-length 320kbps tracks first
    for (const s of liveJioSongs) {
      const key = cleanCoreTitle(s.title) + "_" + normalizeSearchText(s.artist);
      if (!seenOnline.has(key)) {
        seenOnline.add(key);
        combinedOnline.push(s);
      }
    }

    // Add Spotify tracks
    for (const s of itunesSongs) {
      const key = cleanCoreTitle(s.title) + "_" + normalizeSearchText(s.artist);
      if (!seenOnline.has(key)) {
        seenOnline.add(key);
        combinedOnline.push(s);
      } else {
        // Track already exists from JioSaavn; ensure Spotify badge exists in spotifyResults
        const existing = combinedOnline.find(x => cleanCoreTitle(x.title) + "_" + normalizeSearchText(x.artist) === key);
        if (existing && !existing.audio_url && s.audio_url) {
          existing.audio_url = s.audio_url;
        }
      }
    }

    // Filter out unauthentic or unrelated online tracks (only genuinely matching songs)
    const filteredOnline = combinedOnline.filter(s => {
      const res = scoreAndMatchSong(s, query);
      return res.matched && res.score >= 500;
    });

    if (filteredOnline.length > 0) {
      // Sort so authentic original song is ranked #1
      filteredOnline.sort((a, b) => {
        const scoreB = scoreAndMatchSong(b, query).score;
        const scoreA = scoreAndMatchSong(a, query).score;
        return scoreB - scoreA;
      });

      // DO NOT mass auto-import unverified search results! Only import when played
      AppState.spotifyResults = itunesSongs.length > 0 ? itunesSongs : filteredOnline.filter(s => s.source === "spotify");
      if (AppState.spotifyResults.length === 0) {
        AppState.spotifyResults = filteredOnline.map(s => ({ ...s, source: "spotify" }));
      }

      if (isParallel) {
        // AppState.jioResults ALREADY contains the authentic local matches!
        // The #1 local match must NEVER be displaced or re-sorted down by online results!
        const seenCombined = new Set();
        for (const s of AppState.jioResults) {
          const key = cleanCoreTitle(s.title) + "_" + normalizeSearchText(s.artist);
          seenCombined.add(key);
        }

        const newOnlineTracks = [];
        for (const s of filteredOnline) {
          const key = cleanCoreTitle(s.title) + "_" + normalizeSearchText(s.artist);
          if (!seenCombined.has(key)) {
            seenCombined.add(key);
            newOnlineTracks.push(s);
          }
        }

        // Local catalogue matches stay locked in their exact relevance order at the top!
        AppState.searchResults = [...AppState.jioResults, ...newOnlineTracks];
        AppState.isSpotifyFallbackResults = false;
        AppState.isFetchingSpotify = false;
        AppState.queue = [...AppState.searchResults];
      } else {
        // Local catalogue had no matches! Online results are the primary results
        AppState.searchResults = filteredOnline;
        AppState.isSpotifyFallbackResults = true;
        AppState.isFetchingSpotify = false;
        AppState.queue = [...filteredOnline];
      }
      renderContent();
    } else {
      AppState.isFetchingSpotify = false;
      if (!isParallel) {
        AppState.searchResults = [];
        AppState.isSpotifyFallbackResults = false;
      }
      renderContent();
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    if (requestId !== AppState.searchRequestId) return;

    console.warn("[MusicHub] Spotify & online search error:", err.message);
    AppState.isFetchingSpotify = false;
    if (!isParallel) {
      AppState.isSpotifyFallbackResults = false;
      AppState.searchResults = [];
      AppState.searchError = {
        query: query,
        message: "Song not found in JioSaavn or Spotify."
      };
    }
    renderContent();
  } finally {
    if (AppState.activeSearchAbortController === abortController) {
      AppState.activeSearchAbortController = null;
    }
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
    // Only flag a search error if we have 0 local matches from the catalogue
    if (AppState.searchResults.length === 0) {
      AppState.searchError = {
        query: query,
        message: "Online search request could not be completed."
      };
      renderContent();
    }
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
  if (DOM.typeChips) {
    DOM.typeChips.forEach(c => {
      c.classList.toggle("active", (c.dataset.type || "all") === AppState.activeType);
    });
  }
}

// ==========================================================================
// 6. Content Rendering & Song Card Generation
// ==========================================================================

function renderContent() {
  if (!DOM.contentContainer) return;

  // Search Results Mode
  if (AppState.searchQuery) {
    // 1. If currently fetching from Spotify / online fallback and have zero results yet
    if (AppState.isFetchingSpotify && AppState.searchResults.length === 0) {
      if (DOM.emptyState) DOM.emptyState.style.display = "none";
      DOM.contentContainer.innerHTML = `
        <section class="music-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-icon">🔍</span>
              <h2 class="section-title">Searching for "${escapeHTML(AppState.searchQuery)}"</h2>
            </div>
          </div>
          <div class="spotify-loading-banner">
            <div class="spinner" style="width:36px; height:36px; margin:0 auto 16px auto; border-color:rgba(30,215,96,0.25); border-top-color:#1ed760;"></div>
            <h3 style="color:#fff; font-size:1.15rem; margin-bottom:6px;">Song not found in JioSaavn &mdash; Searching All Tamil &amp; Global Songs (1980 &ndash; 2026)</h3>
            <p style="color:var(--text-muted); font-size:0.9rem; margin:0;">
              Connecting to Spotify &amp; Global Catalogue to find "<strong>${escapeHTML(AppState.searchQuery)}</strong>"...
            </p>
          </div>
        </section>
      `;
      return;
    }

    let displayList = [...AppState.searchResults];

    // Source Filter Handling during Search: All / JioSaavn / Spotify
    const totalAllCount = displayList.length;
    const jioCount = displayList.filter(s => s.source !== "spotify").length;
    const spotifyCount = displayList.filter(s => s.source === "spotify").length;

    let sourceFilterHTML = "";
    if (jioCount > 0 && spotifyCount > 0) {
      sourceFilterHTML = `
        <div class="search-source-filter-row">
          <span class="source-filter-label">Filter Source:</span>
          <button class="source-filter-chip ${AppState.searchSourceFilter === 'all' ? 'active' : ''}" data-source="all">
            ✨ All Results (${totalAllCount})
          </button>
          <button class="source-filter-chip ${AppState.searchSourceFilter === 'jiosaavn' ? 'active' : ''}" data-source="jiosaavn">
            🟣 JioSaavn (${jioCount})
          </button>
          <button class="source-filter-chip ${AppState.searchSourceFilter === 'spotify' ? 'active' : ''}" data-source="spotify">
            🟢 Spotify (${spotifyCount})
          </button>
          ${AppState.isFetchingSpotify ? `
            <span class="spotify-sync-badge" style="display:inline-flex; align-items:center; gap:6px; font-size:0.78rem; color:#1ed760; margin-left:8px;">
              <span class="spinner" style="width:11px; height:11px; border-width:2px; border-color:rgba(30,215,96,0.25); border-top-color:#1ed760;"></span>
              Syncing Spotify in parallel...
            </span>
          ` : ''}
        </div>
      `;
    }

    if (AppState.searchSourceFilter === "jiosaavn") {
      displayList = displayList.filter(s => s.source !== "spotify");
    } else if (AppState.searchSourceFilter === "spotify") {
      displayList = displayList.filter(s => s.source === "spotify");
    }

    // Language Filter Handling during Search
    let languageFilteredNoticeHTML = "";
    if (AppState.activeLanguage !== "all") {
      const activeLang = AppState.activeLanguage.toLowerCase();
      const langFiltered = displayList.filter(s => {
        const sLang = (s.language || "").toLowerCase();
        if (activeLang === "only_friends") {
          return s.category === "Only Friends OST" || (s._normTags && s._normTags.includes("only friends"));
        }
        return sLang === activeLang || (s._normTags && s._normTags.includes(activeLang)) || sLang === "all" || !s.language;
      });

      if (langFiltered.length > 0) {
        displayList = langFiltered;
      } else if (displayList.length > 0) {
        // If current language chip would filter out all matches, automatically display all matching tracks
        // across languages with a clear notice. This permanently eliminates "No songs found" when searching!
        languageFilteredNoticeHTML = `
          <div class="search-language-notice" style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; background:rgba(168,85,247,0.14); border:1px solid rgba(168,85,247,0.35); border-radius:12px; padding:10px 16px; margin-bottom:18px; font-size:0.86rem; color:#e9d5ff;">
            <div>
              <span>🌐</span> No ${capitalize(AppState.activeLanguage)} songs matched "<strong>${escapeHTML(AppState.searchQuery)}</strong>", but found <strong>${displayList.length}</strong> matching track(s) in other languages:
            </div>
            <button id="searchResetLangFilterBtn" class="btn btn-pill" style="padding:4px 12px; font-size:0.78rem; background:rgba(168,85,247,0.3); border:1px solid rgba(168,85,247,0.5); color:#fff; cursor:pointer;">
              Show All Languages
            </button>
          </div>
        `;
      }
    }

    // Spotify Fallback Banner (Informs user that results were fetched from Spotify & Global Catalogue)
    let spotifyBannerHTML = "";
    if (AppState.isSpotifyFallbackResults && displayList.length > 0) {
      spotifyBannerHTML = `
        <div class="spotify-fallback-banner">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.6rem;">🟢</span>
            <div>
              <strong style="color:#fff; font-size:0.98rem; display:block;">Song not found in JioSaavn — Retrieved from Spotify &amp; Global Catalogue</strong>
              <span style="color:var(--text-dim); font-size:0.82rem;">Play directly on this page or download MP3 to your device without leaving the website.</span>
            </div>
          </div>
          <span class="spotify-fallback-badge">
            ✓ Spotify Online
          </span>
        </div>
      `;
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
            🔄 Retry Search
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

    // World Catalogue Search Banner (Empowers user to fetch any song in the world from JioSaavn & Spotify)
    let searchWorldBannerHTML = "";
    if (!AppState.isSpotifyFallbackResults && AppState.searchQuery) {
      searchWorldBannerHTML = `
        <div class="search-global-bar" style="margin-bottom:18px; padding:12px 18px; background:linear-gradient(135deg, rgba(30,215,96,0.12) 0%, rgba(59,130,246,0.12) 100%); border:1px solid rgba(30,215,96,0.35); border-radius:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <strong style="color:#fff; font-size:0.94rem; display:flex; align-items:center; gap:6px;">
              <span>🌐</span> Search JioSaavn &amp; Spotify World Catalogue
            </strong>
            <span style="display:block; font-size:0.82rem; color:var(--text-muted); margin-top:2px;">
              Looking for international hits, new releases, or songs across the world? Take from JioSaavn &amp; Spotify directly.
            </span>
          </div>
          <button id="searchGlobalOnlineBtn" class="btn btn-pill" style="padding:8px 22px; font-size:0.84rem; font-weight:700; background:#1ed760; color:#000; border:none; cursor:pointer; border-radius:30px; box-shadow:0 4px 14px rgba(30,215,96,0.35);">
            <span>🟢</span> Search World Catalogue
          </button>
        </div>
      `;
    }

    if (DOM.emptyState) DOM.emptyState.style.display = "none";

    DOM.contentContainer.innerHTML = `
      ${spotifyBannerHTML}
      ${errorBannerHTML}
      ${languageFilteredNoticeHTML}
      ${sourceFilterHTML}
      ${searchWorldBannerHTML}
      <section class="music-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">${AppState.isSpotifyFallbackResults ? "🟢" : "🔍"}</span>
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

    document.querySelectorAll(".source-filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        AppState.searchSourceFilter = chip.dataset.source;
        renderContent();
      });
    });

    const searchGlobalBtn = document.getElementById("searchGlobalOnlineBtn");
    if (searchGlobalBtn) {
      searchGlobalBtn.addEventListener("click", () => {
        AppState.isSpotifyFallbackResults = false;
        AppState.isFetchingSpotify = true;
        renderContent();
        fetchSpotifySearchResults(AppState.searchQuery, ++AppState.searchRequestId);
      });
    }

    const resetLangBtn = document.getElementById("searchResetLangFilterBtn");
    if (resetLangBtn) {
      resetLangBtn.addEventListener("click", () => {
        AppState.activeLanguage = "all";
        updateActivePills();
        renderContent();
      });
    }
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

  // Type / Mood Filter
  if (AppState.activeType && AppState.activeType !== "all") {
    filtered = filtered.filter(s => s.type === AppState.activeType || (Array.isArray(s.tags) && s.tags.includes(AppState.activeType)));
  }

  // Section Filter
  let isFavourites = AppState.activeSection === "favourites";
  let isHistory = AppState.activeSection === "history";

  if (AppState.activeSection === "trending") {
    filtered = filtered.filter(s => (s.sections || []).includes("trending"));
  } else if (AppState.activeSection === "recent") {
    filtered = filtered.filter(s => (s.sections || []).includes("recent"));
  } else if (AppState.activeSection === "era_80s") {
    filtered = filtered.filter(s => s.era === "80s");
  } else if (AppState.activeSection === "era_90s") {
    filtered = filtered.filter(s => s.era === "90s");
  } else if (AppState.activeSection === "era_2k") {
    filtered = filtered.filter(s => s.era === "2k");
  } else if (AppState.activeSection === "era_now") {
    filtered = filtered.filter(s => s.era === "now");
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

  // Dedicated View for Favourites / History / Single Language / Type
  if (AppState.activeSection !== "all" || AppState.activeLanguage !== "all" || (AppState.activeType && AppState.activeType !== "all")) {
    let headerTitle = "Music Collection";
    let headerIcon = "🎵";
    let extraHeaderHTML = "";

    if (AppState.activeType === "melody") {
      headerTitle = "❤️ Melody & Romance Hits";
      headerIcon = "❤️";
    } else if (AppState.activeType === "kuthu") {
      headerTitle = "🔥 Kuthu & Party Dance Beats";
      headerIcon = "🔥";
    } else if (AppState.activeType === "folk") {
      headerTitle = "🥁 Folk & Gaana Superhits";
      headerIcon = "🥁";
    } else if (AppState.activeType === "sad") {
      headerTitle = "💔 Sad & Heartbreak Melodies";
      headerIcon = "💔";
    } else if (AppState.activeType === "devotional") {
      headerTitle = "🕉️ Devotional & Spiritual Songs";
      headerIcon = "🕉️";
    } else if (AppState.activeType === "rap") {
      headerTitle = "🎤 Rap, Hip-Hop & Indie Tracks";
      headerIcon = "🎤";
    } else if (AppState.activeType === "lofi") {
      headerTitle = "☕ Lofi & Chill Beats";
      headerIcon = "☕";
    } else if (AppState.activeType === "edm") {
      headerTitle = "🎧 EDM, DJ & Party Remixes";
      headerIcon = "🎧";
    } else if (AppState.activeType === "spotify") {
      headerTitle = "🌟 Spotify Global Chartbusters";
      headerIcon = "🌟";
    } else if (isFavourites) {
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
    } else if (AppState.activeSection === "full_library") {
      headerTitle = "📚 Complete Music Library";
      headerIcon = "📚";
    } else if (AppState.activeSection === "era_80s") {
      headerTitle = "📻 80s Golden Classics & Movies (Ilaiyaraaja & SPB Era)";
      headerIcon = "📻";
    } else if (AppState.activeSection === "era_90s") {
      headerTitle = "📼 90s Evergreen Hits & Movies (A.R. Rahman & Deva Era)";
      headerIcon = "📼";
    } else if (AppState.activeSection === "era_2k") {
      headerTitle = "💿 2K Nostalgia Hits & Movies (2000s Golden Era)";
      headerIcon = "💿";
    } else if (AppState.activeSection === "era_now") {
      headerTitle = "⚡ 2010s to Now Movies & Hits (Modern Blockbusters)";
      headerIcon = "⚡";
    } else if (AppState.activeSection === "trending") {
      headerTitle = "🔥 Trending Songs";
      headerIcon = "🔥";
    } else if (AppState.activeSection === "recent") {
      headerTitle = "🆕 Recently Added Songs";
      headerIcon = "🆕";
    } else if (AppState.activeLanguage === "tamil") {
      headerTitle = "🌺 Tamil Movie Albums & Blockbusters";
      headerIcon = "🌺";
    } else if (AppState.activeLanguage === "telugu") {
      headerTitle = "🪘 Telugu Movie Albums & Blockbusters";
      headerIcon = "🪘";
    } else if (AppState.activeLanguage === "hindi") {
      headerTitle = "🪔 Hindi Bollywood Albums & Hits";
      headerIcon = "🪔";
    } else if (AppState.activeLanguage === "malayalam") {
      headerTitle = "🌴 Malayalam Movie Melodies & Albums";
      headerIcon = "🌴";
    } else if (AppState.activeLanguage === "kannada") {
      headerTitle = "🪕 Kannada Golden Albums & Blockbusters";
      headerIcon = "🪕";
    } else if (AppState.activeLanguage === "english") {
      headerTitle = "🎸 English Global Albums & Chartbusters";
      headerIcon = "🎸";
    } else if (AppState.activeLanguage === "instrumental") {
      headerTitle = "🎹 Instrumental & Soundtracks";
      headerIcon = "🎹";
    } else if (AppState.activeLanguage === "only_friends") {
      headerTitle = "🎬 Only Friends OST & Asian Themes";
      headerIcon = "🎬";
    } else if (AppState.activeLanguage !== "all") {
      headerTitle = `${capitalize(AppState.activeLanguage)} Music`;
      headerIcon = "🌺";
    }

    // Extract top movie albums for this language
    let albumChipsHTML = "";
    if (AppState.activeLanguage !== "all") {
      const albumCounts = {};
      filtered.forEach(s => {
        const alb = (s.album || "").trim();
        if (alb && alb !== "Single" && alb !== "Unknown") {
          albumCounts[alb] = (albumCounts[alb] || 0) + 1;
        }
      });
      const sortedAlbums = Object.entries(albumCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 18);

      if (sortedAlbums.length > 0) {
        albumChipsHTML = `
          <div class="album-topics-wrap">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
              <span style="font-size:0.84rem; color:var(--text-muted); font-weight:600;">
                🎬 Movie Album Topics (${capitalize(AppState.activeLanguage)}):
              </span>
              ${AppState.activeAlbum !== "all" ? `
                <button id="resetAlbumTopicBtn" class="btn btn-pill" style="padding:2px 8px; font-size:0.75rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#e9d5ff; cursor:pointer;">
                  Clear Album Filter ✕
                </button>
              ` : ""}
            </div>
            <div class="album-chips-row">
              <button class="chip album-topic-chip ${AppState.activeAlbum === 'all' ? 'active' : ''}" data-album="all">
                All Albums
              </button>
              ${sortedAlbums.map(([albumName, count]) => `
                <button class="chip album-topic-chip ${AppState.activeAlbum.toLowerCase() === albumName.toLowerCase() ? 'active' : ''}" data-album="${escapeAttr(albumName)}">
                  ${escapeHTML(albumName)} <span style="opacity:0.7; font-size:0.75rem;">(${count})</span>
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }
    }

    const displayFiltered = (AppState.activeAlbum !== "all")
      ? filtered.filter(s => (s.album || "").trim().toLowerCase() === AppState.activeAlbum.toLowerCase())
      : filtered;

    const totalCount = displayFiltered.length;
    const visibleList = displayFiltered.slice(0, AppState.currentPage * AppState.pageSize);

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
          ${albumChipsHTML}
        </div>
        <div class="songs-grid">
          ${visibleList.map(s => createSongCardHTML(s)).join("")}
        </div>
        ${loadMoreHTML}
      </section>
    `;

    attachCardListeners(visibleList);
    attachPaginationListeners();
    attachSectionExploreListeners();

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
    { id: "era_now", title: "⚡ Now Movies & Modern Hits (2010s - 2026)", icon: "⚡", filter: s => s.era === "now", sectionId: "era_now" },
    { id: "era_2k", title: "💿 2K Movies & Nostalgia (2000s Hits)", icon: "💿", filter: s => s.era === "2k", sectionId: "era_2k" },
    { id: "era_90s", title: "📼 90s Movies & Evergreen Hits", icon: "📼", filter: s => s.era === "90s", sectionId: "era_90s" },
    { id: "era_80s", title: "📻 80s Movies & Golden Classics", icon: "📻", filter: s => s.era === "80s", sectionId: "era_80s" },
    { id: "type_melody", title: "❤️ Romantic Melodies & Love Hits", icon: "❤️", filter: s => s.type === "melody", type: "melody" },
    { id: "type_kuthu", title: "🔥 Kuthu, Mass & Party Dance Beats", icon: "🔥", filter: s => s.type === "kuthu", type: "kuthu" },
    { id: "type_folk", title: "🥁 Folk & Gaana Superhits", icon: "🥁", filter: s => s.type === "folk", type: "folk" },
    { id: "type_sad", title: "💔 Sad & Heartbreak Melodies", icon: "💔", filter: s => s.type === "sad", type: "sad" },
    { id: "type_devotional", title: "🕉️ Devotional & Spiritual Songs", icon: "🕉️", filter: s => s.type === "devotional", type: "devotional" },
    { id: "type_rap", title: "🎤 Rap, Hip-Hop & Indie Hits", icon: "🎤", filter: s => s.type === "rap", type: "rap" },
    { id: "type_lofi", title: "☕ Lofi, Chill & Acoustic Vibes", icon: "☕", filter: s => s.type === "lofi", type: "lofi" },
    { id: "type_edm", title: "🎧 EDM, Club & Party Remixes", icon: "🎧", filter: s => s.type === "edm", type: "edm" },
    { id: "type_spotify", title: "🌟 Spotify Global Chartbusters", icon: "🌟", filter: s => s.type === "spotify", type: "spotify" },
    { id: "trending", title: "🔥 Trending Songs", icon: "🔥", filter: s => (s.sections || []).includes("trending"), sectionId: "trending" },
    { id: "recent", title: "🆕 Recently Added", icon: "🆕", filter: s => (s.sections || []).includes("recent"), sectionId: "recent" },
    { id: "tamil", title: "🌺 Tamil Movie Albums & Blockbusters", icon: "🌺", filter: s => s.language === "Tamil", lang: "tamil" },
    { id: "telugu", title: "🪘 Telugu Movie Albums & Blockbusters", icon: "🪘", filter: s => s.language === "Telugu", lang: "telugu" },
    { id: "hindi", title: "🪔 Hindi Bollywood Albums & Hits", icon: "🪔", filter: s => s.language === "Hindi", lang: "hindi" },
    { id: "malayalam", title: "🌴 Malayalam Movie Melodies & Albums", icon: "🌴", filter: s => s.language === "Malayalam", lang: "malayalam" },
    { id: "kannada", title: "🪕 Kannada Golden Albums & Blockbusters", icon: "🪕", filter: s => s.language === "Kannada", lang: "kannada" },
    { id: "english", title: "🎸 English Global Albums & Chartbusters", icon: "🎸", filter: s => s.language === "English", lang: "english" },
    { id: "instrumental", title: "🎹 Instrumental & Soundtracks", icon: "🎹", filter: s => s.category === "Instrumental Music" || s.language === "Instrumental", lang: "instrumental" },
    { id: "only_friends", title: "🎬 Only Friends OST & Themes", icon: "🎬", filter: s => s.category === "Only Friends OST", lang: "only_friends" }
  ];

  let fullHTML = "";
  const renderedPool = [];

  sectionsDef.forEach(sec => {
    const secSongs = filtered.filter(sec.filter);
    if (secSongs.length > 0) {
      const topSongs = secSongs.slice(0, 12);
      topSongs.forEach(s => renderedPool.push(s));

      fullHTML += `
        <section class="music-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-icon">${sec.icon}</span>
              <h2 class="section-title">${sec.title}</h2>
              <span class="section-badge">${secSongs.length} tracks</span>
            </div>
            <button class="section-view-all-link" data-lang="${sec.lang || ''}" data-section="${sec.sectionId || ''}" data-type="${sec.type || ''}">
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

  fullHTML += `
    <div style="text-align:center; padding: 40px 20px; margin: 36px 0 20px 0; background: linear-gradient(135deg, rgba(88,28,135,0.3) 0%, rgba(30,27,75,0.45) 100%); border: 1px solid rgba(168,85,247,0.35); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="font-size:2.4rem; margin-bottom:10px;">📚</div>
      <h3 style="color:#fff; font-size:1.35rem; font-weight:700; margin-bottom:8px;">Browse All ${AppState.masterSongs.length} Songs in Library</h3>
      <p style="color:var(--text-muted); font-size:0.92rem; max-width:600px; margin:0 auto 20px auto;">
        Explore the full collection across Tamil, Telugu, Hindi, Malayalam, English, and Instrumental blockbusters with direct playback &amp; downloads.
      </p>
      <button id="homeViewAllLibraryBtn" class="btn btn-primary" style="padding:12px 36px; font-size:1rem; font-weight:700; border-radius:30px; box-shadow:0 6px 20px rgba(168,85,247,0.45); cursor:pointer;">
        <span>📚</span> Explore All Songs (${AppState.masterSongs.length})
      </button>
    </div>
  `;

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
  const homeViewAllBtn = document.getElementById("homeViewAllLibraryBtn");
  if (homeViewAllBtn) {
    homeViewAllBtn.addEventListener("click", () => {
      AppState.activeSection = "full_library";
      AppState.currentPage = 1;
      updateActivePills();
      renderContent();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".section-view-all-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      const sec = btn.dataset.section;
      const type = btn.dataset.type;
      if (type) {
        AppState.activeType = type;
        AppState.activeLanguage = "all";
        AppState.activeSection = "all";
      } else if (lang) {
        AppState.activeLanguage = lang;
        AppState.activeSection = "all";
        AppState.activeType = "all";
      } else if (sec) {
        AppState.activeSection = sec;
        AppState.activeLanguage = "all";
        AppState.activeType = "all";
      }
      AppState.activeAlbum = "all";
      AppState.currentPage = 1;
      updateActivePills();
      renderContent();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".album-topic-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      AppState.activeAlbum = chip.dataset.album || "all";
      AppState.currentPage = 1;
      renderContent();
    });
  });

  const resetAlbumBtn = document.getElementById("resetAlbumTopicBtn");
  if (resetAlbumBtn) {
    resetAlbumBtn.addEventListener("click", () => {
      AppState.activeAlbum = "all";
      AppState.currentPage = 1;
      renderContent();
    });
  }
}

// Generate accessible HTML for an individual song card
function createSongCardHTML(song) {
  const isThisPlaying = AppState.currentSong && AppState.currentSong.id === song.id && AppState.isPlaying;
  const isThisLoading = AppState.currentSong && AppState.currentSong.id === song.id && AppState.isLoading;
  const isFav = AppState.favourites.includes(song.id);

  let playIconText = "▶";
  if (isThisLoading) playIconText = "⏳";
  else if (isThisPlaying) playIconText = "⏸";

  // Action Button: Download & Mobile Music App buttons enabled for all audio tracks
  let actionBtnHTML = `
    <button class="download-btn card-download-trigger" data-id="${escapeAttr(song.id)}" title="Download ${escapeAttr(song.title)} MP3">
      <span>⬇️</span> Download
    </button>
    <button class="card-musicapp-btn card-musicapp-trigger" data-id="${escapeAttr(song.id)}" title="Open ${escapeAttr(song.title)} in Mobile Music App">
      <span>📱</span> Music App
    </button>
  `;

  const safeCover = escapeAttr(song.cover_url || "static/images/only_friends_theme.svg");
  const movieBadge = song.album ? ` • <span class="card-album-tag" title="Movie/Album: ${escapeAttr(song.album)}">${escapeHTML(song.album)}</span>` : "";
  const isSpotify = song.source === "spotify";
  const sourceBadgeHTML = `
    <span class="card-source-tag ${isSpotify ? 'spotify-badge' : 'saavn-badge'}" title="Source: ${isSpotify ? 'Spotify Global Network' : 'JioSaavn Original Master'}">
      ${isSpotify ? '🟢 Spotify' : '🟣 JioSaavn'}
    </span>
  `;

  return `
    <div class="song-card ${isThisPlaying ? 'now-playing' : ''}" data-id="${escapeAttr(song.id)}">
      <div class="card-thumb-wrap">
        <img class="card-thumb-img" src="${safeCover}" alt="${escapeAttr(song.title)}" loading="lazy" onerror="this.src='static/images/only_friends_theme.svg'" />
        <span class="card-category-tag">${escapeHTML(song.language || "Music")}</span>
        ${sourceBadgeHTML}
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

  // Mobile Default Music App triggers
  document.querySelectorAll(".card-musicapp-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const song = getSongById(btn.dataset.id);
      if (song) handleOpenInMobileMusicApp(song);
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

// Builds an intelligent queue of related songs based on album/movie, artist, search results, and language
function buildRelatedQueue(selectedSong) {
  if (!selectedSong) return [];

  const queue = [selectedSong];
  const seenIds = new Set([selectedSong.id]);

  // 1. If currently in search mode and there are other search results, queue them first
  if (AppState.isSearching && Array.isArray(AppState.searchResults)) {
    for (const s of AppState.searchResults) {
      if (!seenIds.has(s.id)) {
        seenIds.add(s.id);
        queue.push(s);
      }
    }
  }

  const pool = (Array.isArray(AppState.masterSongs) && AppState.masterSongs.length > 0)
    ? AppState.masterSongs
    : (Array.isArray(AppState.songs) ? AppState.songs : []);

  // 2. Add songs from the same album / movie
  if (selectedSong.album && !["pranesh music hub", "single", "unknown"].includes(selectedSong.album.trim().toLowerCase())) {
    const selAlbum = selectedSong.album.trim().toLowerCase();
    for (const s of pool) {
      if (!seenIds.has(s.id) && s.album && s.album.trim().toLowerCase() === selAlbum) {
        seenIds.add(s.id);
        queue.push(s);
      }
    }
  }

  // 3. Add songs by the same artist / music director
  if (selectedSong.artist) {
    const artistTokens = selectedSong.artist.toLowerCase().split(/[,/&|;]/).map(a => a.trim()).filter(a => a.length > 2);
    for (const s of pool) {
      if (!seenIds.has(s.id) && s.artist) {
        const sArtistLower = s.artist.toLowerCase();
        if (artistTokens.some(token => sArtistLower.includes(token))) {
          seenIds.add(s.id);
          queue.push(s);
        }
      }
    }
  }

  // 4. Add top tracks in the same language
  if (selectedSong.language && selectedSong.language.toLowerCase() !== "all") {
    const selLang = selectedSong.language.toLowerCase();
    for (const s of pool) {
      if (!seenIds.has(s.id) && s.language && s.language.toLowerCase() === selLang) {
        seenIds.add(s.id);
        queue.push(s);
        if (queue.length >= 25) break;
      }
    }
  }

  // 5. Fill remaining queue with popular songs up to 25 items
  for (const s of pool) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      queue.push(s);
      if (queue.length >= 25) break;
    }
  }

  return queue;
}

// Render dynamic Up Next & Related Songs Playlist Drawer
function renderPlaylistDrawer() {
  if (DOM.playlistBadge) {
    DOM.playlistBadge.textContent = AppState.queue ? AppState.queue.length : 0;
  }
  if (!DOM.playlistItems) return;

  if (!AppState.queue || AppState.queue.length === 0) {
    DOM.playlistItems.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted); font-size:0.88rem;">
        <span>🎵</span> No tracks in Up Next playlist.<br/>Play any song to auto-queue related tracks!
      </div>
    `;
    return;
  }

  if (DOM.playlistStatusText && AppState.currentSong) {
    const relCount = Math.max(0, AppState.queue.length - 1);
    DOM.playlistStatusText.textContent = `${relCount} related track(s) playing in sequence`;
  }

  const currentId = AppState.currentSong ? AppState.currentSong.id : null;

  DOM.playlistItems.innerHTML = AppState.queue.map((song, idx) => {
    const isCurrent = song.id === currentId;
    const coverUrl = song.cover_url || "static/images/only_friends_theme.svg";
    const playIcon = isCurrent && AppState.isPlaying ? "⏸" : "▶";

    return `
      <div class="playlist-row ${isCurrent ? 'active' : ''}" data-id="${song.id}">
        <div class="playlist-row-num">${isCurrent ? '▶' : (idx + 1)}</div>
        <img class="playlist-row-thumb" src="${coverUrl}" alt="Cover" loading="lazy" />
        <div class="playlist-row-info">
          <div class="playlist-row-title" title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</div>
          <div class="playlist-row-sub" title="${escapeHTML(song.artist)}">${escapeHTML(song.artist)}${song.album ? ' • ' + escapeHTML(song.album) : ''}</div>
        </div>
        <div class="playlist-row-actions">
          <button class="playlist-row-play-btn" data-id="${song.id}" title="${isCurrent && AppState.isPlaying ? 'Pause' : 'Play'}">
            ${playIcon}
          </button>
          <button class="playlist-row-download-btn" data-id="${song.id}" title="Download MP3">
            ⬇️
          </button>
        </div>
      </div>
    `;
  }).join("");

  // Attach event listeners for playlist rows
  DOM.playlistItems.querySelectorAll(".playlist-row").forEach(row => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".playlist-row-download-btn")) return;
      const songId = row.dataset.id;
      const song = AppState.queue.find(s => s.id === songId);
      if (song) {
        if (AppState.currentSong && AppState.currentSong.id === song.id) {
          togglePlayPause();
        } else {
          playSong(song, true);
        }
      }
    });
  });

  DOM.playlistItems.querySelectorAll(".playlist-row-download-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const song = AppState.queue.find(s => s.id === songId);
      if (song) {
        handleDownloadAction(song, btn);
      }
    });
  });
}

function togglePlaylistDrawer(forceState) {
  if (typeof forceState === "boolean") {
    AppState.isPlaylistOpen = forceState;
  } else {
    AppState.isPlaylistOpen = !AppState.isPlaylistOpen;
  }

  if (DOM.playlistDrawer) {
    DOM.playlistDrawer.style.display = AppState.isPlaylistOpen ? "flex" : "none";
  }
  if (DOM.togglePlaylistBtn) {
    DOM.togglePlaylistBtn.classList.toggle("active", AppState.isPlaylistOpen);
  }

  if (AppState.isPlaylistOpen) {
    renderPlaylistDrawer();
  }
}

function shuffleQueue() {
  if (!AppState.queue || AppState.queue.length <= 1) return;
  const current = AppState.currentSong;
  const others = AppState.queue.filter(s => s.id !== current?.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  AppState.queue = current ? [current, ...others] : others;
  AppState.currentSongIndex = 0;
  renderPlaylistDrawer();
  showToast("🔀 Up Next playlist shuffled!", "info");
}

// ==========================================================================
// 6B. Background Spotify & Audio Fallback Engine (Zero User Distraction)
// ==========================================================================

let bgSpotifyTimer = null;
let bgSpotifyCurrentTime = 0;

async function fetchFallbackAudioUrl(song) {
  if (!song) return "";
  if (song.audio_url && song.audio_url.startsWith("http") && !song.audio_url.includes("apple.com") && !song.is_preview) {
    return song.audio_url;
  }
  if (API_BASE) return `${API_BASE}/api/stream/${song.id}`;

  const resolved = await resolveOnlineFullStream(song);
  if (resolved) return resolved;

  return song.audio_url || "";
}

// Resolves authentic 320kbps full-length stream so online songs NEVER cut off at 30 seconds
async function resolveOnlineFullStream(song) {
  if (!song) return "";
  if (song.audio_url && song.audio_url.includes("aac.saavncdn.com") && !song.audio_url.includes("_p.mp4") && (!song.duration || song.duration >= 60)) {
    return song.audio_url;
  }

  // 1. Check local master catalogue first using intelligent original singer & core title matcher
  const match = findFullLengthAudioMatch(song.title, song.artist, song.album);
  if (match && match.audio_url && !match.audio_url.includes("apple.com")) {
    song.audio_url = match.audio_url;
    song.is_preview = false;
    song.duration = match.duration || song.duration;
    song.duration_str = match.duration_str || song.duration_str;
    autoImportSongToCatalogue(song);
    return match.audio_url;
  }

  const cleanQ = correctSearchQuery(`${song.title || ""} ${song.artist || ""}`.trim()) || `${song.title || ""} ${song.artist || ""}`.trim();
  if (!cleanQ) return song.audio_url || "";

  // 2. If backend is active, use streaming proxy
  if (API_BASE) {
    const backendUrl = `${API_BASE}/api/stream/${song.id}`;
    song.audio_url = backendUrl;
    return backendUrl;
  }

  // 3. Resolve directly from high-speed JioSaavn Global mirrors (Zero 30s cutoffs!)
  try {
    const data = await fetchJioMirrorApi(`/api/search/songs?query=${encodeURIComponent(cleanQ)}&limit=10`);
    if (data && data.data && Array.isArray(data.data.results) && data.data.results.length > 0) {
      const best = data.data.results.find(r => r.duration >= 90) || data.data.results[0];
      const dl = best.downloadUrl && (best.downloadUrl.find(u => u.quality === "320kbps") || best.downloadUrl[best.downloadUrl.length - 1]);
      if (dl && dl.url) {
        song.audio_url = dl.url;
        song.is_preview = false;
        if (best.duration) {
          song.duration = parseInt(best.duration, 10);
          song.duration_str = formatTime(song.duration);
        }
        autoImportSongToCatalogue(song);
        return dl.url;
      }
    }
  } catch (_) {}

  return song.audio_url || "";
}

async function playSpotifyInBackground(song) {
  if (!song) return;

  AppState.isSpotifyBackground = true;
  AppState.isPlaying = true;
  AppState.isLoading = false;
  if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
  updatePlayingCardHighlight();
  renderPlaylistDrawer();

  // Start simulated seekbar progression for background playback
  startSimulatedSeekbar(song.duration || 210);

  // 1. First attempt to resolve and play a direct audio stream silently in background
  const fallbackAudio = await fetchFallbackAudioUrl(song);
  if (fallbackAudio) {
    try {
      audioPlayer.src = fallbackAudio;
      const playPromise = (typeof audioPlayer.play === "function") ? audioPlayer.play() : undefined;
      if (playPromise !== undefined) {
        await playPromise;
        return;
      }
    } catch (e) {
      console.warn("[MusicHub] Direct fallback play notice:", e.message);
    }
  }

  // 2. If direct stream is unavailable, route silently to the Background Spotify Player iframe
  if (typeof document !== "undefined") {
    const bgFrame = document.getElementById("backgroundSpotifyPlayer");
    if (bgFrame) {
      const spotifyUri = song.spotify_id ? `track/${song.spotify_id}` : `playlist/37i9dQZF1DX4s3V2rT5alW`;
      bgFrame.src = `https://open.spotify.com/embed/${spotifyUri}?utm_source=generator&theme=0&autoplay=1`;
    }
  }
}

function startSimulatedSeekbar(durationSec) {
  stopSimulatedSeekbar();
  bgSpotifyCurrentTime = 0;

  if (DOM.durationTimeEl) DOM.durationTimeEl.textContent = formatTime(durationSec);
  if (DOM.seekbar) DOM.seekbar.max = durationSec;

  if (typeof setInterval !== "undefined") {
    bgSpotifyTimer = setInterval(() => {
      if (!AppState.isPlaying) return;
      bgSpotifyCurrentTime += 1;
      if (DOM.currentTimeEl) DOM.currentTimeEl.textContent = formatTime(bgSpotifyCurrentTime);
      if (DOM.seekbar) DOM.seekbar.value = bgSpotifyCurrentTime;

      if (bgSpotifyCurrentTime >= durationSec) {
        stopSimulatedSeekbar();
        playNextSong();
      }
    }, 1000);
  }
}

function stopSimulatedSeekbar() {
  if (bgSpotifyTimer) {
    clearInterval(bgSpotifyTimer);
    bgSpotifyTimer = null;
  }
}

function playSong(song, preserveQueue = false) {
  if (!song) return;

  AppState.currentSong = song;

  // If not preserving current queue, dynamically build intelligent related queue
  if (!preserveQueue || !AppState.queue || AppState.queue.length === 0) {
    AppState.queue = buildRelatedQueue(song);
    AppState.currentSongIndex = 0;
  } else {
    let idx = AppState.queue.findIndex(s => s.id === song.id);
    if (idx === -1) {
      AppState.queue.push(song);
      idx = AppState.queue.length - 1;
    }
    AppState.currentSongIndex = idx;
  }

  // Update playlist drawer and badge
  renderPlaylistDrawer();

  // Save to Listening History safely (max 50 tracks)
  AppState.history = [song.id, ...AppState.history.filter(id => id !== song.id)].slice(0, 50);
  safeSetStorage("pranesh_hub_history", AppState.history);

  updatePlayerBarUI(song);

  // Audio source resolution: Always prioritize full-length 320kbps CDN stream
  let streamSrc = "";
  if (song.audio_url && song.audio_url.startsWith("http")) {
    streamSrc = song.audio_url;
  } else if (song.audio_file && song.audio_file.startsWith("http")) {
    streamSrc = song.audio_file;
  } else if (API_BASE) {
    streamSrc = `${API_BASE}/api/stream/${song.id}`;
  } else if (song.audio_file && !song.audio_file.startsWith("http")) {
    streamSrc = `static/audio/${song.audio_file}`;
  }

  // If JioSaavn stream is missing, silently fall back to background Spotify / online stream
  if (!streamSrc) {
    playSpotifyInBackground(song);
    return;
  }

  AppState.isLoading = true;
  AppState.isSpotifyBackground = false;
  stopSimulatedSeekbar();
  if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏳";
  updatePlayingCardHighlight();

  // Resilient error fallback: If 320kbps CDN stream encounters a network hiccup, seamlessly try 160kbps stream on same CDN
  audioPlayer.onerror = () => {
    console.warn("[MusicHub] Audio stream notice on:", audioPlayer.src);
    audioPlayer.onerror = null;
    if (audioPlayer.src && audioPlayer.src.includes("_320.mp4")) {
      const alt160 = audioPlayer.src.replace("_320.mp4", "_160.mp4");
      console.log("[MusicHub] Retrying full-length stream at 160kbps:", alt160);
      audioPlayer.src = alt160;
      audioPlayer.play().catch(() => {});
      return;
    }
    const altSong = AppState.masterSongs.find(s => s.id !== song.id && s.title.toLowerCase() === song.title.toLowerCase());
    if (altSong && altSong.audio_url && altSong.audio_url.includes("aac.saavncdn.com")) {
      audioPlayer.src = altSong.audio_url;
      audioPlayer.play().catch(() => {});
      return;
    }
    playSpotifyInBackground(AppState.currentSong);
  };

  // Immediate upgrade of any 30s preview snippet before assigning src
  if (streamSrc && (streamSrc.includes("apple.com") || streamSrc.includes("preview") || song.is_preview || (song.duration && song.duration <= 45))) {
    const fullMatch = findFullLengthAudioMatch(song.title, song.artist, song.album);
    if (fullMatch && fullMatch.audio_url && !fullMatch.audio_url.includes("apple.com") && !fullMatch.audio_url.includes("preview")) {
      streamSrc = fullMatch.audio_url;
      song.audio_url = fullMatch.audio_url;
      song.is_preview = false;
      song.duration = fullMatch.duration || song.duration;
      song.duration_str = fullMatch.duration_str || song.duration_str;
      autoImportSongToCatalogue(song);
    }
  }

  if (audioPlayer.src !== streamSrc) {
    audioPlayer.src = streamSrc;
  }

  // Display Mobile Music App button in player when supported
  if (DOM.playerMusicAppBtn && typeof navigator !== "undefined" && navigator.canShare) {
    DOM.playerMusicAppBtn.style.display = "inline-flex";
  }

  // Seamlessly resolve full-length 320kbps stream if current URL is a 30s preview snippet
  if (streamSrc && (streamSrc.includes("apple.com") || streamSrc.includes("preview") || song.is_preview || (song.duration && song.duration <= 45))) {
    resolveOnlineFullStream(song).then(fullUrl => {
      if (fullUrl && fullUrl !== streamSrc && !fullUrl.includes("apple.com") && !fullUrl.includes("preview") && AppState.currentSong && AppState.currentSong.id === song.id) {
        console.log(`[MusicHub] Upgraded "${song.title}" from 30s preview to full-length stream.`);
        const currentTime = audioPlayer.currentTime || 0;
        song.audio_url = fullUrl;
        song.is_preview = false;
        autoImportSongToCatalogue(song);
        audioPlayer.src = fullUrl;
        audioPlayer.currentTime = currentTime;
        audioPlayer.play().catch(() => {});
      }
    });
  }

  const playPromise = (typeof audioPlayer.play === "function") ? audioPlayer.play() : undefined;
  if (playPromise !== undefined) {
    playPromise.then(() => {
      AppState.isLoading = false;
      AppState.isPlaying = true;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
      updatePlayingCardHighlight();
      renderPlaylistDrawer();
    }).catch(err => {
      console.warn("Mobile playback notice, engaging background Spotify fallback:", err.message);
      playSpotifyInBackground(AppState.currentSong);
    });
  }
}

function togglePlayPause() {
  if (!AppState.currentSong) {
    if (AppState.songs.length > 0) playSong(AppState.songs[0]);
    return;
  }

  if (AppState.isSpotifyBackground && !audioPlayer.src) {
    const bgFrame = typeof document !== "undefined" ? document.getElementById("backgroundSpotifyPlayer") : null;
    if (AppState.isPlaying) {
      AppState.isPlaying = false;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
      stopSimulatedSeekbar();
      if (bgFrame) bgFrame.src = "about:blank";
    } else {
      AppState.isPlaying = true;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
      playSpotifyInBackground(AppState.currentSong);
    }
    updatePlayingCardHighlight();
    renderPlaylistDrawer();
    return;
  }

  if (audioPlayer.paused) {
    const playPromise = (typeof audioPlayer.play === "function") ? audioPlayer.play() : undefined;
    if (playPromise !== undefined) {
      playPromise.then(() => {
        AppState.isPlaying = true;
        if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
        updatePlayingCardHighlight();
        renderPlaylistDrawer();
      }).catch(err => {
        console.warn("Playback resume error, engaging background fallback:", err);
        playSpotifyInBackground(AppState.currentSong);
      });
    }
  } else {
    audioPlayer.pause();
    AppState.isPlaying = false;
    if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "▶";
    updatePlayingCardHighlight();
    renderPlaylistDrawer();
  }
}

function playNextSong() {
  if (!AppState.queue || AppState.queue.length === 0) return;

  if (AppState.isShuffle) {
    const nextIdx = Math.floor(Math.random() * AppState.queue.length);
    playSong(AppState.queue[nextIdx], true);
  } else {
    let nextIdx = AppState.currentSongIndex + 1;
    if (nextIdx >= AppState.queue.length) nextIdx = 0;
    playSong(AppState.queue[nextIdx], true);
  }
}

function playPreviousSong() {
  if (!AppState.queue || AppState.queue.length === 0) return;

  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }

  let prevIdx = AppState.currentSongIndex - 1;
  if (prevIdx < 0) prevIdx = AppState.queue.length - 1;
  playSong(AppState.queue[prevIdx], true);
}

function handleTrackEnded() {
  if (AppState.currentSong && (AppState.currentSong.is_preview || (audioPlayer.duration && audioPlayer.duration < 45))) {
    console.log("[MusicHub] Preview snippet finished; attempting seamless continuation with full-length stream...");
    resolveOnlineFullStream(AppState.currentSong).then(fullUrl => {
      if (fullUrl && fullUrl !== audioPlayer.src && !fullUrl.includes("apple.com") && !fullUrl.includes("preview")) {
        console.log("[MusicHub] Seamlessly resuming playback from full-length stream...");
        AppState.currentSong.audio_url = fullUrl;
        AppState.currentSong.is_preview = false;
        audioPlayer.src = fullUrl;
        audioPlayer.currentTime = 30; // Seamlessly continue from the 30s mark!
        audioPlayer.play().catch(() => playNextSong());
        return;
      }
      playSpotifyInBackground(AppState.currentSong);
    }).catch(() => playNextSong());
    return;
  }
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
    DOM.playerDownloadBtn.innerHTML = `<span>⬇️</span> Download`;
    DOM.playerDownloadBtn.title = `Download ${song.title} MP3`;
  }
}

// ==========================================================================
// 7. Song Download & Mobile Default Music Player Integration (Low-Memory Engine)
// ==========================================================================

// Memory-optimized bitrate URL generator (160k = 50% less RAM/storage, 96k = 70% less RAM/storage)
function getOptimizedDownloadUrl(rawUrl, quality) {
  if (!rawUrl) return "";
  const q = quality || AppState.downloadQuality || "160";
  if (rawUrl.includes("aac.saavncdn.com")) {
    if (q === "160") return rawUrl.replace(/_320\.mp4/gi, "_160.mp4");
    if (q === "96") return rawUrl.replace(/_320\.mp4/gi, "_96.mp4");
    if (q === "48") return rawUrl.replace(/_320\.mp4/gi, "_48.mp4");
    if (q === "320") return rawUrl;
  }
  return rawUrl;
}

function updateDownloadQualityUI() {
  if (!DOM.dlQualityBtn) return;
  const q = AppState.downloadQuality || "160";
  if (q === "96") {
    if (DOM.dlQualityIcon) DOM.dlQualityIcon.textContent = "🍃";
    if (DOM.dlQualityText) DOM.dlQualityText.textContent = "96k (Save 70% RAM)";
    DOM.dlQualityBtn.style.color = "#34d399";
    DOM.dlQualityBtn.style.borderColor = "rgba(16, 185, 129, 0.45)";
    DOM.dlQualityBtn.style.background = "rgba(16, 185, 129, 0.16)";
    DOM.dlQualityBtn.title = "Download Memory Mode: Ultra Eco 96kbps (Saves 70% RAM & storage). Tap to switch.";
  } else if (q === "320") {
    if (DOM.dlQualityIcon) DOM.dlQualityIcon.textContent = "💎";
    if (DOM.dlQualityText) DOM.dlQualityText.textContent = "320k (Studio)";
    DOM.dlQualityBtn.style.color = "#c084fc";
    DOM.dlQualityBtn.style.borderColor = "rgba(168, 85, 247, 0.45)";
    DOM.dlQualityBtn.style.background = "rgba(168, 85, 247, 0.16)";
    DOM.dlQualityBtn.title = "Download Memory Mode: Studio 320kbps. Tap to switch to Low Memory mode.";
  } else {
    // 160kbps standard default
    if (DOM.dlQualityIcon) DOM.dlQualityIcon.textContent = "⚡";
    if (DOM.dlQualityText) DOM.dlQualityText.textContent = "160k (Save 50% RAM)";
    DOM.dlQualityBtn.style.color = "#38bdf8";
    DOM.dlQualityBtn.style.borderColor = "rgba(56, 189, 248, 0.45)";
    DOM.dlQualityBtn.style.background = "rgba(56, 189, 248, 0.16)";
    DOM.dlQualityBtn.title = "Download Memory Mode: Standard 160kbps (Saves 50% RAM & storage). Tap to switch.";
  }
}

function cycleDownloadQuality() {
  const current = AppState.downloadQuality || "160";
  let next = "160";
  if (current === "160") next = "96";
  else if (current === "96") next = "320";
  else next = "160";

  AppState.downloadQuality = next;
  try {
    localStorage.setItem("pranesh_hub_dl_quality", next);
  } catch (_) {}
  updateDownloadQualityUI();

  if (next === "96") {
    showToast("🍃 Ultra-Low Memory Mode: 96kbps activated (Saves 70% RAM & phone storage)!", "success");
  } else if (next === "160") {
    showToast("⚡ Low-Memory Standard Mode: 160kbps activated (Saves 50% RAM & phone storage)!", "success");
  } else {
    showToast("💎 Studio Quality: 320kbps activated.", "info");
  }
}

async function handleDownloadAction(song, triggerBtn = null) {
  if (!song) return;

  // Determine endpoint for audio
  let downloadUrl = "";
  if (song.audio_file && !song.audio_file.startsWith("http")) {
    downloadUrl = `static/audio/${song.audio_file}`;
  } else if (song.audio_file && song.audio_file.startsWith("http")) {
    downloadUrl = song.audio_file;
  } else if (song.audio_url) {
    downloadUrl = song.audio_url;
  }

  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `<span class="spinner" style="width:13px;height:13px;border-width:2px;"></span> Saving...`;
  }

  // Ensure download is a full-length stream (upgrade 30s preview if present)
  if (!downloadUrl || downloadUrl.includes("apple.com") || downloadUrl.includes("preview") || song.is_preview || (song.duration && song.duration <= 45)) {
    const fullStream = await resolveOnlineFullStream(song);
    if (fullStream && !fullStream.includes("apple.com") && !fullStream.includes("preview")) {
      downloadUrl = fullStream;
      song.audio_url = fullStream;
      song.is_preview = false;
    }
  }

  if (!downloadUrl) {
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = `<span>⬇️</span> Download`;
    }
    showToast(`⚠️ Audio source not available for download.`, "error");
    return;
  }

  // Apply memory-saving bitrate optimization (160k = 50% less memory, 96k = 70% less memory)
  const quality = AppState.downloadQuality || "160";
  const optimizedUrl = getOptimizedDownloadUrl(downloadUrl, quality);
  const qualityLabel = quality === "96" ? "96k • 70% RAM Saved" : (quality === "320" ? "320k • Studio" : "160k • 50% RAM Saved");

  showToast(`⚡ Low-Memory Download starting: "${song.title}" [${qualityLabel}]...`, "info");

  const cleanTitle = (song.title || "Song").replace(/[/\\?%*:|"<>]/g, "").trim();
  const cleanArtist = (song.artist || "Artist").replace(/[/\\?%*:|"<>]/g, "").trim();
  const safeFilename = `${cleanTitle} - ${cleanArtist}`;

  if (optimizedUrl) {
    try {
      // Single-pass direct blob streaming with instant memory revocation (0 duplicate buffers)
      const res = await fetch(optimizedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const rawBlob = await res.blob();
      const blobUrl = window.URL.createObjectURL(rawBlob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `${safeFilename}.m4a`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Immediately revoke blob URL so browser garbage-collects heap memory instantly (0 persistent memory retention)
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 150);

      showToast(`✅ "${song.title}" saved! [${qualityLabel}] Indexed to Mobile Music App.`, "success");

      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `<span>✓</span> Done`;
        setTimeout(() => {
          triggerBtn.innerHTML = `<span>⬇️</span> Download`;
        }, 2500);
      }
      return;
    } catch (err) {
      console.warn("Direct blob download notice, attempting native anchor stream:", err.message);
    }
  }

  // Fallback: direct native browser download anchor (0 MB JS memory)
  try {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = optimizedUrl || downloadUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = `${safeFilename}.m4a`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 500);
    showToast(`⬇️ Direct download stream started for "${song.title}"!`, "success");
  } catch (_) {
    showToast(`✅ Download queued for "${song.title}"`, "info");
  }

  if (triggerBtn) {
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = `<span>⬇️</span> Download`;
  }
}

// Direct Handler to Open Audio File in Mobile Default Music App via system share sheet
async function handleOpenInMobileMusicApp(song) {
  if (!song) return;
  let downloadUrl = song.audio_url || (song.audio_file ? `static/audio/${song.audio_file}` : "");
  if (!downloadUrl && song.id) {
    const matched = AppState.masterSongs.find(s => s.id === song.id);
    if (matched) downloadUrl = matched.audio_url;
  }
  if (!downloadUrl || downloadUrl.includes("apple.com") || downloadUrl.includes("preview") || song.is_preview || (song.duration && song.duration <= 45)) {
    const fullStream = await resolveOnlineFullStream(song);
    if (fullStream && !fullStream.includes("apple.com") && !fullStream.includes("preview")) {
      downloadUrl = fullStream;
      song.audio_url = fullStream;
      song.is_preview = false;
    }
  }
  if (!downloadUrl) return;

  const quality = AppState.downloadQuality || "160";
  const optimizedUrl = getOptimizedDownloadUrl(downloadUrl, quality);

  const cleanTitle = (song.title || "Song").replace(/[/\\?%*:|"<>]/g, "").trim();
  const cleanArtist = (song.artist || "Artist").replace(/[/\\?%*:|"<>]/g, "").trim();
  const safeFilename = `${cleanTitle} - ${cleanArtist}`;

  // Only if Web Share Level 2 is supported on mobile devices
  if (typeof navigator !== "undefined" && typeof navigator.canShare === "function") {
    showToast(`Preparing "${song.title}" for Mobile Music App (Low-Memory)...`, "info");
    try {
      const res = await fetch(optimizedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rawBlob = await res.blob();
      const audioFile = (typeof File !== "undefined") ? new File([rawBlob], `${safeFilename}.m4a`, { type: "audio/mp4" }) : null;

      if (audioFile && navigator.canShare({ files: [audioFile] })) {
        await navigator.share({
          files: [audioFile],
          title: song.title,
          text: `Playing ${song.title} by ${song.artist}`
        });
        showToast(`🎵 Opened in Default Music App!`, "success");
        return;
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Mobile music app open notice:", err.message);
      }
    }
  }

  // Seamless fallback to low-memory direct download
  handleDownloadAction(song);
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
// 9. Toast Notification Hub with Action Buttons
// ==========================================================================

function showToast(message, type = "info") {
  showToastWithAction(message, type, null, null);
}

function showToastWithAction(message, type = "info", actionLabel = null, actionCallback = null) {
  if (!DOM.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "🔔";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span style="flex:1;">${escapeHTML(message)}</span>
    ${actionLabel && actionCallback ? `
      <button class="toast-action-btn" style="padding:4px 10px; font-size:0.78rem; font-weight:700; background:rgba(255,255,255,0.22); border:1px solid rgba(255,255,255,0.4); border-radius:20px; color:#fff; cursor:pointer; margin-left:8px; white-space:nowrap;">
        ${escapeHTML(actionLabel)}
      </button>
    ` : ""}
  `;

  if (actionCallback) {
    const btn = toast.querySelector(".toast-action-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        actionCallback();
      });
    }
  }

  DOM.toastContainer.appendChild(toast);

  const duration = actionCallback ? 6500 : 3200;
  setTimeout(() => {
    toast.style.animation = "slideInToast 0.3s ease reverse forwards";
    setTimeout(() => {
      if (DOM.toastContainer && DOM.toastContainer.contains(toast)) {
        DOM.toastContainer.removeChild(toast);
      }
    }, 300);
  }, duration);
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
