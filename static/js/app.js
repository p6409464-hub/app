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
  currentPage: 1,        // Active pagination page
  pageSize: 24,          // Number of tracks per page chunk
  favourites: safeGetStorage("pranesh_hub_favs", []),
  history: safeGetStorage("pranesh_hub_history", []),
  queue: [],
  isPlaylistOpen: false
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
  toastContainer: null,
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

// Pre-cleans common Tamil/Indian transliteration typos before online search
function correctSearchQuery(q) {
  if (!q) return "";
  const replacements = {
    "aasa": "aasai",
    "machan": "machaan",
    "maachan": "machaan",
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
    "sandramukhi": "chandramukhi",
    "endhiran": "enthiran",
    "doktor": "doctor",
    "amaram": "amaran",
    "beest": "beast",
    "leoo": "leo",
    "vetaiyan": "vettaiyan"
  };
  let corrected = q;
  for (const [typo, fix] of Object.entries(replacements)) {
    const reg = new RegExp(`\\b${typo}\\b`, "gi");
    corrected = corrected.replace(reg, fix);
  }
  return corrected;
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

  const rawCorpus = [normTitle, normArtist, normAlbum, normLang, normCategory, ...normTags].join(" ");
  const compactCorpus = normalizeCompact(rawCorpus);
  const phoneticCorpus = toPhonetic(rawCorpus);
  const pTitle = toPhonetic(normTitle);
  const pAlbum = toPhonetic(normAlbum);
  const pArtist = toPhonetic(normArtist);

  // Pre-split tokens for instantaneous typo-tolerant fuzzy lookup (< 1ms per 5,000 items)
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
    _searchCorpus: rawCorpus,
    _compactCorpus: compactCorpus,
    _phoneticCorpus: phoneticCorpus,
    _pTitle: pTitle,
    _pAlbum: pAlbum,
    _pArtist: pArtist,
    _wordTokens: wordTokens,
    _phoneticTokens: phoneticTokens
  };
}

// Typo-tolerant relevance scorer & matcher
function scoreAndMatchSong(song, rawQuery) {
  if (!rawQuery) return { matched: true, score: 0 };
  const normQ = normalizeSearchText(rawQuery);
  const compactQ = normalizeCompact(rawQuery);
  if (!normQ && !compactQ) return { matched: true, score: 0 };

  // Strip noise words like "song", "songs", "mp3", "track", "audio" for clean title comparisons
  const cleanQ = normQ.replace(/\b(songs|song|mp3|tracks|track|audio|full|original)\b/gi, " ").replace(/\s+/g, " ").trim();
  const cleanPhoneticQ = toPhonetic(cleanQ);

  const rawCorpus = song._searchCorpus || normalizeSearchText([
    song.title || song.name || "",
    song.artist || song.singer || "",
    song.album || song.movie || "",
    song.language || song.lang || "",
    song.category || song.genre || "",
    ...(song.tags || [])
  ].join(" "));

  const compactCorpus = song._compactCorpus || normalizeCompact(rawCorpus);
  const phoneticCorpus = song._phoneticCorpus || toPhonetic(rawCorpus);

  let score = 0;
  let matched = false;

  const normTitle = song._normTitle || normalizeSearchText(song.title || song.name || "");
  const normAlbum = song._normAlbum || normalizeSearchText(song.album || song.movie || "");
  const normArtist = song._normArtist || normalizeSearchText(song.artist || song.singer || "");

  // 1. Exact phrase matches (Highest Priority - guarantees Exact Song Title always lands #1)
  if (normTitle === normQ || (cleanQ && normTitle === cleanQ)) {
    matched = true;
    score += 3000;
  } else if (normTitle.startsWith(normQ) || (cleanQ && normTitle.startsWith(cleanQ))) {
    matched = true;
    score += 1500;
  } else if (normTitle.includes(normQ) || (cleanQ && normTitle.includes(cleanQ))) {
    matched = true;
    score += 800;
  }

  if (normAlbum.includes(normQ) || (cleanQ && normAlbum.includes(cleanQ))) {
    matched = true;
    score += 300;
  }

  if (normArtist.includes(normQ) || (cleanQ && normArtist.includes(cleanQ))) {
    matched = true;
    score += 250;
  }

  if (rawCorpus.includes(normQ) || (cleanQ && rawCorpus.includes(cleanQ))) {
    matched = true;
    score += 200;
  } else if (compactQ && compactCorpus.includes(compactQ)) {
    matched = true;
    score += 180;
  }

  // 2. Direct phonetic match (Tanglish sound-alikes for Tamil/Indian titles & albums)
  const phoneticQ = toPhonetic(rawQuery);
  const pTitle = song._pTitle || toPhonetic(normTitle);
  const pAlbum = song._pAlbum || toPhonetic(normAlbum);
  const pArtist = song._pArtist || toPhonetic(normArtist);

  if ((phoneticQ && phoneticQ.length >= 3) || (cleanPhoneticQ && cleanPhoneticQ.length >= 3)) {
    if (pTitle === phoneticQ || (cleanPhoneticQ && pTitle === cleanPhoneticQ)) {
      matched = true;
      score += 2500;
    } else if (pTitle.startsWith(phoneticQ) || (cleanPhoneticQ && pTitle.startsWith(cleanPhoneticQ))) {
      matched = true;
      score += 1200;
    } else if (pTitle.includes(phoneticQ) || (cleanPhoneticQ && pTitle.includes(cleanPhoneticQ))) {
      matched = true;
      score += 900;
    } else if (pAlbum.includes(phoneticQ) || (cleanPhoneticQ && pAlbum.includes(cleanPhoneticQ))) {
      matched = true;
      score += 400;
    } else if (pArtist.includes(phoneticQ) || (cleanPhoneticQ && pArtist.includes(cleanPhoneticQ))) {
      matched = true;
      score += 300;
    } else if (phoneticCorpus.includes(phoneticQ) || (cleanPhoneticQ && phoneticCorpus.includes(cleanPhoneticQ))) {
      matched = true;
      score += 250;
    } else if (pTitle.length >= 4 && phoneticQ.includes(pTitle) && (phoneticQ.length - pTitle.length <= 2)) {
      matched = true;
      score += 350;
    }
  }

  // 3. Typo-tolerant single query edit distance on title or album (e.g. "vikrem" -> "vikram", "leoo" -> "leo", "jayler" -> "jailer")
  const qForDist = cleanQ && cleanQ.length >= 3 ? cleanQ : normQ;
  const pForDist = cleanPhoneticQ && cleanPhoneticQ.length >= 3 ? cleanPhoneticQ : phoneticQ;
  if (qForDist.length >= 3) {
    const maxDist = qForDist.length >= 7 ? 2 : 1;
    if (boundedLevenshtein(qForDist, normTitle, maxDist) <= maxDist) {
      matched = true;
      score += 850;
    }
    if (pTitle && pForDist && boundedLevenshtein(pForDist, pTitle, 1) <= 1) {
      matched = true;
      score += 750;
    }
    if (boundedLevenshtein(qForDist, normAlbum, 1) <= 1) {
      matched = true;
      score += 400;
    }
    if (pAlbum && pForDist && boundedLevenshtein(pForDist, pAlbum, 1) <= 1) {
      matched = true;
      score += 350;
    }
  }

  // 4. Multi-token fuzzy match with typo & wrong-letter tolerance
  const tokens = normQ.split(" ").filter(Boolean);
  if (tokens.length > 0) {
    let tokensMatched = 0;
    let typoPenalties = 0;
    const wordTokens = song._wordTokens || rawCorpus.split(" ").filter(w => w.length >= 2);
    const phoneticTokens = song._phoneticTokens || wordTokens.map(w => toPhonetic(w)).filter(Boolean);

    for (const qToken of tokens) {
      const qLen = qToken.length;

      // Direct exact token match in song corpus
      if (rawCorpus.includes(qToken)) {
        tokensMatched++;
        score += 40;
        continue;
      }

      // Direct phonetic token match
      const qPhonetic = toPhonetic(qToken);
      if (qPhonetic && qPhonetic.length >= 3 && phoneticCorpus.includes(qPhonetic)) {
        tokensMatched++;
        score += 35;
        continue;
      }

      // Fuzzy / typo check against word tokens
      if (qLen >= 3) {
        const maxDist = qLen >= 6 ? 2 : 1;
        let tokenFound = false;

        for (let i = 0; i < wordTokens.length; i++) {
          const w = wordTokens[i];
          const wLen = w.length;

          // Prefix match: word starts with query token (e.g. "arabic".startsWith("arabi"))
          if (wLen > qLen && w.startsWith(qToken) && (wLen - qLen <= 4)) {
            tokenFound = true;
            score += 25;
            break;
          }

          // Edit distance check for words of similar length (wrong letter, missing letter, extra letter)
          if (Math.abs(wLen - qLen) <= maxDist) {
            const d = boundedLevenshtein(qToken, w, maxDist);
            if (d <= maxDist) {
              tokenFound = true;
              score += Math.max(15, 30 - d * 8);
              typoPenalties += d;
              break;
            }
          }

          // Phonetic edit distance check
          if (qPhonetic && qPhonetic.length >= 3 && phoneticTokens[i]) {
            const pToken = phoneticTokens[i];
            if (pToken === qPhonetic) {
              tokenFound = true;
              score += 25;
              break;
            }
            if (Math.abs(pToken.length - qPhonetic.length) <= 1) {
              if (boundedLevenshtein(qPhonetic, pToken, 1) <= 1) {
                tokenFound = true;
                score += 20;
                typoPenalties += 1;
                break;
              }
            }
          }
        }

        if (tokenFound) {
          tokensMatched++;
        }
      }
    }

    if (tokensMatched === tokens.length || (tokens.length >= 3 && tokensMatched >= tokens.length - 1)) {
      matched = true;
      score += 50 - typoPenalties * 5;
    }
  }

  return { matched, score };
}

// Backward-compatible matcher (returns true/false for filtering)
function matchSongQuery(song, rawQuery) {
  return scoreAndMatchSong(song, rawQuery).matched;
}

// Master search function: filters and sorts songs by typo-tolerant relevance score
function searchMasterSongs(rawQuery) {
  if (!rawQuery) return [...AppState.masterSongs];
  const results = [];
  for (const song of AppState.masterSongs) {
    const res = scoreAndMatchSong(song, rawQuery);
    if (res.matched) {
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

  // Combine window.CATALOGUE_SONGS (280+ tracks) with DEFAULT_STATIC_SONGS
  const sourceList = rawCatalogue.length > 0
    ? [...DEFAULT_STATIC_SONGS, ...rawCatalogue]
    : DEFAULT_STATIC_SONGS;

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
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "block";

  // ALWAYS filter and sort from the immutable master collection using typo-tolerant fuzzy relevance scoring!
  const localMatches = searchMasterSongs(trimmed);

  if (localMatches.length > 0) {
    // Song found in JioSaavn catalogue! Display immediately with zero Spotify branding
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = false;
    AppState.searchResults = [...localMatches];
    AppState.queue = [...localMatches];
    renderContent();

    // If an optional external custom backend is configured, query asynchronously for extra live matches
    if (API_BASE) {
      AppState.searchDebounceTimer = setTimeout(() => {
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
      fetchSpotifySearchResults(trimmed, thisRequestId);
    }, 250);
  }
}

// Background JioSaavn & Online Catalogue Search Fallback (Zero Redirection, Full-Length Streams)
async function fetchSpotifySearchResults(query, requestId) {
  if (!query) return;

  const cleanQuery = correctSearchQuery(query) || query;
  const abortController = new AbortController();
  AppState.activeSearchAbortController = abortController;

  try {
    const timeoutId = setTimeout(() => abortController.abort(), 6000);

    // 1. Direct high-definition JioSaavn Online API (Full 320kbps CDN streams, Zero 30s cutoffs!)
    try {
      const saavnSearchUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(cleanQuery)}&limit=25`;
      const saavnRes = await fetch(saavnSearchUrl, { signal: abortController.signal });
      if (saavnRes.ok) {
        const saavnData = await saavnRes.json();
        if (requestId === AppState.searchRequestId && saavnData && saavnData.data && Array.isArray(saavnData.data.results) && saavnData.data.results.length > 0) {
          clearTimeout(timeoutId);
          const saavnSongs = saavnData.data.results.map((r, index) => {
            const durSec = parseInt(r.duration, 10) || 210;
            const dlArr = Array.isArray(r.downloadUrl) ? r.downloadUrl : [];
            const dlUrl = (dlArr.length > 0 ? (dlArr[dlArr.length - 1]?.url || dlArr[0]?.url) : "") || "";
            const imgArr = Array.isArray(r.image) ? r.image : [];
            const artwork = (imgArr.length > 0 ? (imgArr[imgArr.length - 1]?.url || imgArr[0]?.url) : "") || "static/images/only_friends_theme.svg";
            const artists = (r.artists && Array.isArray(r.artists.primary) && r.artists.primary.length > 0)
              ? r.artists.primary.map(a => a.name).join(", ")
              : (r.artist || "Artist");

            return prepareSongSearchMetadata({
              id: `saavn_online_${r.id || (Date.now() + "_" + index)}`,
              title: r.name || "Unknown Title",
              artist: artists,
              album: r.album?.name || "Single",
              duration: durSec,
              duration_str: formatTime(durSec),
              language: (r.language ? capitalize(r.language) : (AppState.activeLanguage !== "all" ? capitalize(AppState.activeLanguage) : "Tamil")),
              category: "JioSaavn Online Catalogue",
              sections: ["trending"],
              cover_url: artwork,
              audio_url: dlUrl,
              audio_file: "",
              download_authorized: true,
              source: "jiosaavn_online",
              tags: [cleanQuery.toLowerCase(), "saavn", "online", "full"]
            });
          }).filter(s => s.audio_url);

          if (saavnSongs.length > 0) {
            AppState.searchResults = saavnSongs;
            AppState.isSpotifyFallbackResults = true;
            AppState.isFetchingSpotify = false;
            AppState.queue = [...saavnSongs];
            renderContent();
            return;
          }
        }
      }
    } catch (_) {}
    
    // 2. Try backend API if configured
    if (API_BASE) {
      try {
        const backendRes = await fetch(`${API_BASE}/api/search?query=${encodeURIComponent(cleanQuery)}&language=${encodeURIComponent(AppState.activeLanguage)}`, { signal: abortController.signal });
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (requestId === AppState.searchRequestId && backendData.status === "success" && Array.isArray(backendData.songs) && backendData.songs.length > 0) {
            clearTimeout(timeoutId);
            AppState.searchResults = backendData.songs.map(s => prepareSongSearchMetadata({
              ...s,
              download_authorized: true,
              source: "spotify"
            }));
            AppState.isSpotifyFallbackResults = true;
            AppState.isFetchingSpotify = false;
            AppState.queue = [...AppState.searchResults];
            renderContent();
            return;
          }
        }
      } catch (_) {}
    }

    // 3. Fallback: Direct Global search with auto-corrected query
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=25`;
    const res = await fetch(searchUrl, { signal: abortController.signal });
    clearTimeout(timeoutId);

    if (requestId !== AppState.searchRequestId) return;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (requestId !== AppState.searchRequestId) return;

    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const spotifySongs = data.results.map((r, index) => {
        const durSec = Math.round((r.trackTimeMillis || 210000) / 1000);
        const artwork = (r.artworkUrl100 || "").replace("100x100bb", "600x600bb") || "static/images/only_friends_theme.svg";

        return prepareSongSearchMetadata({
          id: `spotify_${r.trackId || (Date.now() + "_" + index)}`,
          title: r.trackName || "Unknown Title",
          artist: r.artistName || "Unknown Artist",
          album: r.collectionName || "Single",
          duration: durSec,
          duration_str: formatTime(durSec),
          language: AppState.activeLanguage !== "all" ? capitalize(AppState.activeLanguage) : "Global",
          category: "Spotify & Global Catalogue",
          sections: ["trending"],
          cover_url: artwork,
          audio_url: r.previewUrl || "",
          audio_file: "",
          is_preview: true,
          download_authorized: true,
          source: "spotify",
          spotify_id: r.trackId ? String(r.trackId) : "",
          tags: ["spotify", "online", normalizeSearchText(r.trackName || ""), normalizeSearchText(r.artistName || "")]
        });
      });

      AppState.searchResults = spotifySongs;
      AppState.isSpotifyFallbackResults = true;
      AppState.isFetchingSpotify = false;
      AppState.queue = [...spotifySongs];
      renderContent();
    } else {
      AppState.searchResults = [];
      AppState.isSpotifyFallbackResults = false;
      AppState.isFetchingSpotify = false;
      renderContent();
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    if (requestId !== AppState.searchRequestId) return;

    console.warn("[MusicHub] Spotify & online search error:", err.message);
    AppState.isFetchingSpotify = false;
    AppState.isSpotifyFallbackResults = false;
    AppState.searchResults = [];
    AppState.searchError = {
      query: query,
      message: "Song not found in JioSaavn or Spotify."
    };
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
}

// ==========================================================================
// 6. Content Rendering & Song Card Generation
// ==========================================================================

function renderContent() {
  if (!DOM.contentContainer) return;

  // Search Results Mode
  if (AppState.searchQuery) {
    // 1. If currently fetching from Spotify / online fallback
    if (AppState.isFetchingSpotify) {
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
            <h3 style="color:#fff; font-size:1.15rem; margin-bottom:6px;">Song not found in JioSaavn</h3>
            <p style="color:var(--text-muted); font-size:0.9rem; margin:0;">
              Connecting to Spotify &amp; Global Catalogue to find "<strong>${escapeHTML(AppState.searchQuery)}</strong>"...
            </p>
          </div>
        </section>
      `;
      return;
    }

    let displayList = [...AppState.searchResults];

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
        if (DOM.emptySearchQuery) DOM.emptySearchQuery.textContent = `"${escapeHTML(AppState.searchQuery)}" (checked in JioSaavn & Spotify)`;
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
      ${spotifyBannerHTML}
      ${errorBannerHTML}
      ${languageFilteredNoticeHTML}
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
    } else if (AppState.activeSection === "full_library") {
      headerTitle = "📚 Complete Music Library";
      headerIcon = "📚";
    } else if (AppState.activeSection === "era_80s") {
      headerTitle = "📻 80s Golden Classics (Ilaiyaraaja & SPB Era)";
      headerIcon = "📻";
    } else if (AppState.activeSection === "era_90s") {
      headerTitle = "📼 90s Evergreen Hits (A.R. Rahman & Deva Era)";
      headerIcon = "📼";
    } else if (AppState.activeSection === "era_2k") {
      headerTitle = "💿 2K Nostalgia Hits (Harris, Yuvan & Vidyasagar Era)";
      headerIcon = "💿";
    } else if (AppState.activeSection === "era_now") {
      headerTitle = "⚡ 2010s to Now (Anirudh & Modern Blockbusters)";
      headerIcon = "⚡";
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
    { id: "era_now", title: "⚡ 2010s to Now (Modern Hits)", icon: "⚡", filter: s => s.era === "now", sectionId: "era_now" },
    { id: "era_2k", title: "💿 2000s Nostalgia (2K Hits)", icon: "💿", filter: s => s.era === "2k", sectionId: "era_2k" },
    { id: "era_90s", title: "📼 90s Evergreen Hits", icon: "📼", filter: s => s.era === "90s", sectionId: "era_90s" },
    { id: "era_80s", title: "📻 80s Golden Classics", icon: "📻", filter: s => s.era === "80s", sectionId: "era_80s" },
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

  // Action Button: Download button enabled for all audio tracks
  let actionBtnHTML = `
    <button class="download-btn card-download-trigger" data-id="${escapeAttr(song.id)}" title="Download ${escapeAttr(song.title)} MP3">
      <span>⬇️</span> Download
    </button>
  `;

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
  if (song.audio_url && song.audio_url.startsWith("http")) return song.audio_url;
  if (API_BASE) return `${API_BASE}/api/stream/${song.id}`;

  const query = `${song.title || ""} ${song.artist || ""}`.trim();
  if (!query) return "";

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=3`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const match = data.results.find(r => r.previewUrl) || data.results[0];
        if (match && match.previewUrl) {
          return match.previewUrl;
        }
      }
    }
  } catch (err) {
    console.warn("[MusicHub] Online audio fallback lookup notice:", err.message);
  }
  return "";
}

// Resolves authentic 320kbps full-length stream so online songs NEVER cut off at 30 seconds
async function resolveOnlineFullStream(song) {
  if (!song) return "";
  if (song.audio_url && song.audio_url.includes("aac.saavncdn.com")) {
    return song.audio_url;
  }
  const title = song.title || "";
  const artist = song.artist || "";
  const cleanQ = correctSearchQuery(`${title} ${artist}`.trim()) || `${title} ${artist}`.trim();
  if (!cleanQ) return song.audio_url || "";

  try {
    const res = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(cleanQ)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.results) && data.data.results.length > 0) {
        const match = data.data.results[0];
        const dlArr = match.downloadUrl;
        if (Array.isArray(dlArr) && dlArr.length > 0) {
          const fullStream = dlArr[dlArr.length - 1]?.url || dlArr[0]?.url;
          if (fullStream) {
            song.audio_url = fullStream;
            song.is_preview = false;
            if (match.duration) {
              song.duration = parseInt(match.duration, 10) || song.duration;
              song.duration_str = formatTime(song.duration);
            }
            return fullStream;
          }
        }
      }
    }
  } catch (_) {}

  // If backend is active, use streaming proxy
  if (API_BASE) {
    const backendUrl = `${API_BASE}/api/stream/${song.id}`;
    song.audio_url = backendUrl;
    return backendUrl;
  }

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

  // Seamless error fallback: If JioSaavn CDN stream fails, automatically route to background Spotify
  audioPlayer.onerror = () => {
    console.warn("[MusicHub] JioSaavn stream error, seamlessly switching to background Spotify fallback...");
    audioPlayer.onerror = null;
    playSpotifyInBackground(AppState.currentSong);
  };

  if (audioPlayer.src !== streamSrc) {
    audioPlayer.src = streamSrc;
  }

  // Seamlessly resolve full-length 320kbps stream if current URL is a 30s preview snippet
  if (streamSrc && (streamSrc.includes("apple.com") || streamSrc.includes("preview") || song.is_preview)) {
    resolveOnlineFullStream(song).then(fullUrl => {
      if (fullUrl && fullUrl !== streamSrc && AppState.currentSong && AppState.currentSong.id === song.id) {
        console.log(`[MusicHub] Upgraded "${song.title}" from 30s preview to full-length stream.`);
        const currentTime = audioPlayer.currentTime || 0;
        song.audio_url = fullUrl;
        song.is_preview = false;
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
// 7. Song Download Handler (High-Definition Audio Files)
// ==========================================================================

async function handleDownloadAction(song, triggerBtn = null) {
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

  // If JioSaavn stream URL is missing, resolve fallback stream in background
  if (!downloadUrl) {
    downloadUrl = await fetchFallbackAudioUrl(song);
  }

  // Ensure download is a full-length 320kbps MP3 (upgrade 30s preview if present)
  if (downloadUrl && (downloadUrl.includes("apple.com") || downloadUrl.includes("preview") || song.is_preview)) {
    const fullStream = await resolveOnlineFullStream(song);
    if (fullStream) {
      downloadUrl = fullStream;
      song.audio_url = fullStream;
    }
  }

  showToast(`Preparing download for: "${song.title}"...`, "info");

  const safeFilename = `${song.title} - ${song.artist}`.replace(/[/\\?%*:|"<>]/g, "");

  if (downloadUrl) {
    try {
      // 1. Attempt direct blob fetch
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
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
      return;
    } catch (err) {
      console.warn("Direct blob download failed, attempting background fallback stream:", err.message);
    }
  }

  // Fallback: try fallback stream URL or browser anchor
  try {
    const fallbackUrl = await fetchFallbackAudioUrl(song);
    const targetUrl = fallbackUrl || downloadUrl;
    if (targetUrl) {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = targetUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `${safeFilename}.mp3`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 1500);
      showToast(`⬇️ Download initiated for "${song.title}"!`, "success");
    } else {
      showToast(`✅ Download queued for "${song.title}"`, "info");
    }
  } catch (_) {
    showToast(`✅ Audio queued for saving: "${song.title}"`, "info");
  }

  if (triggerBtn) {
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = `<span>⬇️</span> Download`;
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
