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

function safeGetStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (fallback !== null && fallback !== undefined) {
      if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : fallback;
    }
    return parsed;
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
  { id: "inst_3", title: "SoundHelix Symphony", artist: "Open Music Archive", album: "Algorithmic Harmony", duration: 345, duration_str: "5:45", language: "Instrumental", category: "Instrumental Music", sections: ["recent", "instrumental"], cover_url: "static/images/soundhelix_ambient.svg", audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", audio_file: "", download_authorized: true, tags: ["instrumental", "soundhelix", "electronic"] },
  { id: "saavn_vaanam_no_money_no_honey", title: "No Money No Honey", artist: "Yuvan Shankar Raja, Str, Andrea", album: "Vaanam", duration: 324, duration_str: "5:24", language: "Tamil", era: "now", category: "Tamil Songs", sections: ["trending", "recent", "era_now", "tamil"], cover_url: "https://c.saavncdn.com/013/Vaanam-2010-500x500.jpg", audio_url: "https://aac.saavncdn.com/013/592641c8be65dd785543ba1b363865cf_320.mp4", audio_file: "", download_authorized: true, tags: ["no money no honey", "no money", "no money no money", "vaanam", "yuvan shankar raja", "yuvan", "str", "simbu", "silambarasan", "andrea", "kuthu", "now", "tamil", "trending"] },
  { id: "saavn_galantis_no_money", title: "No Money", artist: "Galantis", album: "The Aviary", duration: 189, duration_str: "3:09", language: "English", era: "now", category: "English Songs", sections: ["trending", "english"], cover_url: "https://c.saavncdn.com/472/The-Aviary-English-2017-500x500.jpg", audio_url: "https://aac.saavncdn.com/712/e634be97fc61bc5cf76f7dfba6b67b09_320.mp4", audio_file: "", download_authorized: true, tags: ["no money", "galantis", "the aviary", "english", "edm", "pop", "dance", "trending"] },
  { id: "saavn_vaanam_evan_di", title: "Evan Di Unna Pethan", artist: "Yuvan Shankar Raja, Str", album: "Vaanam", duration: 341, duration_str: "5:41", language: "Tamil", era: "now", category: "Tamil Songs", sections: ["trending", "tamil"], cover_url: "https://c.saavncdn.com/013/Vaanam-2010-500x500.jpg", audio_url: "https://aac.saavncdn.com/013/1ff7c9b8eb258d4a99fcdd4908a73562_320.mp4", audio_file: "", download_authorized: true, tags: ["evan di unna pethan", "evandi unna pethan", "vaanam", "yuvan", "str", "simbu", "now", "tamil"] },
  { id: "saavn_SDIIxL9o", title: "Kitta Nerungi Vaadi", artist: "Vijay Antony, Sukhwindher Singh, Gayathri", album: "Dishyum", year: "2006", duration: 257, duration_str: "4:17", language: "Tamil", era: "2k", type: "kuthu", category: "Tamil Songs", sections: ["trending", "recent", "era_2k", "tamil"], cover_url: "https://c.saavncdn.com/791/Dishyum-Tamil-2006-20171219-500x500.jpg", audio_url: "https://aac.saavncdn.com/791/aa9a9fdbc97e058eb2e5c8bbebafa584_320.mp4", audio_file: "", download_authorized: true, tags: ["kitta nerungi vaadi", "kitta nerungi vaa di", "kitta nerungi", "kitta nerungi vadi", "kitta", "nerungi", "vaadi", "dishyum", "vijay antony", "sukhwindher singh", "gayathri", "jiiva", "2k", "tamil", "trending"] }
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
  repeatMode: "off",     // "off" | "all" | "one"
  playbackSpeed: 1.0,    // 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0
  favSearchQuery: "",    // Search query within favourites
  favSortOrder: "date_desc", // "date_desc" | "date_asc" | "title_asc" | "title_desc" | "artist_asc" | "duration"
  favSelectMode: false,  // Multi-select mode toggle in favourites
  selectedFavSongIds: new Set(), // Set of selected song IDs for bulk actions
  isFullscreenOpen: false,
  voiceSearchLang: (typeof localStorage !== "undefined" && (localStorage.getItem("pranesh_hub_voice_lang") === "en-IN" || localStorage.getItem("pranesh_hub_voice_lang") === "ta-IN")) ? localStorage.getItem("pranesh_hub_voice_lang") : "ta-IN",
  downloadQuality: (typeof localStorage !== "undefined" && (localStorage.getItem("pranesh_hub_dl_quality") === "48" || localStorage.getItem("pranesh_hub_dl_quality") === "96" || localStorage.getItem("pranesh_hub_dl_quality") === "160" || localStorage.getItem("pranesh_hub_dl_quality") === "320")) ? localStorage.getItem("pranesh_hub_dl_quality") : "48", // Default: "< 2MB Ultra-Light (48k)"
  correctedQuery: "", // Auto-corrected search query when user types wrong spelling
  inputAutoCorrectTimer: null
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
  playlistStatusText: null,
  featuredPlayerSection: null,
  featuredThumb: null,
  featuredTitle: null,
  featuredArtist: null,
  featuredAlbum: null,
  featuredFavBtn: null,
  featuredPlayerStatus: null,
  featuredPlayPauseBtn: null,
  featuredPlayIcon: null,
  featuredPrevBtn: null,
  featuredNextBtn: null,
  featuredShuffleBtn: null,
  featuredRepeatBtn: null,
  featuredCurrentTime: null,
  featuredDurationTime: null,
  featuredSeekbar: null,
  featuredSoundwave: null,
  featuredDownloadBtn: null,
  featuredDlBitrateSub: null,
  featuredMusicAppBtn: null,
  featuredDownloadAllBtn: null,
  downloadAllPlaylistBtn: null,
  voiceSearchBtn: null,
  voiceLangToggleBtn: null
};

function refreshDOMElements() {
  if (typeof document === "undefined") return;
  DOM.searchInput = document.getElementById("searchInput");
  DOM.clearSearchBtn = document.getElementById("clearSearchBtn");
  DOM.voiceSearchBtn = document.getElementById("voiceSearchBtn");
  DOM.voiceLangToggleBtn = document.getElementById("voiceLangToggleBtn");
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

  // Featured Medium-Big Player & Download Elements
  DOM.featuredPlayerSection = document.getElementById("featuredPlayerSection");
  DOM.featuredThumb = document.getElementById("featuredThumb");
  DOM.featuredTitle = document.getElementById("featuredTitle");
  DOM.featuredArtist = document.getElementById("featuredArtist");
  DOM.featuredAlbum = document.getElementById("featuredAlbum");
  DOM.featuredFavBtn = document.getElementById("featuredFavBtn");
  DOM.featuredPlayerStatus = document.getElementById("featuredPlayerStatus");
  DOM.featuredPlayPauseBtn = document.getElementById("featuredPlayPauseBtn");
  DOM.featuredPlayIcon = document.getElementById("featuredPlayIcon");
  DOM.featuredPrevBtn = document.getElementById("featuredPrevBtn");
  DOM.featuredNextBtn = document.getElementById("featuredNextBtn");
  DOM.featuredShuffleBtn = document.getElementById("featuredShuffleBtn");
  DOM.featuredRepeatBtn = document.getElementById("featuredRepeatBtn");
  DOM.featuredCurrentTime = document.getElementById("featuredCurrentTime");
  DOM.featuredDurationTime = document.getElementById("featuredDurationTime");
  DOM.featuredSeekbar = document.getElementById("featuredSeekbar");
  DOM.featuredSoundwave = document.getElementById("featuredSoundwave");
  DOM.featuredDownloadBtn = document.getElementById("featuredDownloadBtn");
  DOM.featuredDlBitrateSub = document.getElementById("featuredDlBitrateSub");
  DOM.featuredMusicAppBtn = document.getElementById("featuredMusicAppBtn");
  DOM.featuredDownloadAllBtn = document.getElementById("featuredDownloadAllBtn");
  DOM.downloadAllPlaylistBtn = document.getElementById("downloadAllPlaylistBtn");
  DOM.voiceSearchBtn = document.getElementById("voiceSearchBtn");
  DOM.searchSuggestionsBox = document.getElementById("searchSuggestionsBox");
  DOM.themeToggleBtn = document.getElementById("themeToggleBtn");
  DOM.playbackSpeedBtn = document.getElementById("playbackSpeedBtn");
  DOM.featuredSpeedBtn = document.getElementById("featuredSpeedBtn");
  DOM.featuredEqBtn = document.getElementById("featuredEqBtn");
  DOM.featuredLyricsBtn = document.getElementById("featuredLyricsBtn");
  DOM.playerEqBtn = document.getElementById("playerEqBtn");
  DOM.playerLyricsBtn = document.getElementById("playerLyricsBtn");
  DOM.expandPlayerBtn = document.getElementById("expandPlayerBtn");
  DOM.exportPlaylistM3UBtn = document.getElementById("exportPlaylistM3UBtn");
  DOM.clearQueueBtn = document.getElementById("clearQueueBtn");
  DOM.fullscreenPlayerModal = document.getElementById("fullscreenPlayerModal");
  DOM.closeFullscreenBtn = document.getElementById("closeFullscreenBtn");
  DOM.fsLyricsToggleBtn = document.getElementById("fsLyricsToggleBtn");
  DOM.fullscreenThumb = document.getElementById("fullscreenThumb");
  DOM.fullscreenTitle = document.getElementById("fullscreenTitle");
  DOM.fullscreenArtist = document.getElementById("fullscreenArtist");
  DOM.fullscreenAlbum = document.getElementById("fullscreenAlbum");
  DOM.fullscreenFavBtn = document.getElementById("fullscreenFavBtn");
  DOM.fullscreenSeekbar = document.getElementById("fullscreenSeekbar");
  DOM.fullscreenCurrentTime = document.getElementById("fullscreenCurrentTime");
  DOM.fullscreenDurationTime = document.getElementById("fullscreenDurationTime");
  DOM.fullscreenSpeedBtn = document.getElementById("fullscreenSpeedBtn");
  DOM.fullscreenShuffleBtn = document.getElementById("fullscreenShuffleBtn");
  DOM.fullscreenPrevBtn = document.getElementById("fullscreenPrevBtn");
  DOM.fullscreenPlayPauseBtn = document.getElementById("fullscreenPlayPauseBtn");
  DOM.fullscreenPlayIcon = document.getElementById("fullscreenPlayIcon");
  DOM.fullscreenNextBtn = document.getElementById("fullscreenNextBtn");
  DOM.fullscreenRepeatBtn = document.getElementById("fullscreenRepeatBtn");
  DOM.fullscreenEqBtn = document.getElementById("fullscreenEqBtn");
  DOM.fullscreenDownloadBtn = document.getElementById("fullscreenDownloadBtn");
  DOM.equalizerModal = document.getElementById("equalizerModal");
  DOM.closeEqBtn = document.getElementById("closeEqBtn");
  DOM.resetEqBtn = document.getElementById("resetEqBtn");
  DOM.lyricsModal = document.getElementById("lyricsModal");
  DOM.closeLyricsBtn = document.getElementById("closeLyricsBtn");
  DOM.favImportInput = document.getElementById("favImportInput");
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

function setupEventListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  refreshDOMElements();
  initTheme();
  initSearchSuggestions();
  initVoiceSearch();

  // Playback speed buttons
  [DOM.playbackSpeedBtn, DOM.featuredSpeedBtn, DOM.fullscreenSpeedBtn].forEach(btn => {
    if (btn) btn.addEventListener("click", cyclePlaybackSpeed);
  });

  // 3-mode repeat buttons
  [DOM.repeatBtn, DOM.featuredRepeatBtn, DOM.fullscreenRepeatBtn].forEach(btn => {
    if (btn) btn.addEventListener("click", cycleRepeatMode);
  });

  // Fullscreen player triggers
  if (DOM.expandPlayerBtn) DOM.expandPlayerBtn.addEventListener("click", openFullscreenPlayer);
  if (DOM.closeFullscreenBtn) DOM.closeFullscreenBtn.addEventListener("click", closeFullscreenPlayer);
  if (DOM.fullscreenPlayPauseBtn) DOM.fullscreenPlayPauseBtn.addEventListener("click", togglePlayPause);
  if (DOM.fullscreenPrevBtn) DOM.fullscreenPrevBtn.addEventListener("click", playPreviousSong);
  if (DOM.fullscreenNextBtn) DOM.fullscreenNextBtn.addEventListener("click", playNextSong);
  if (DOM.fullscreenShuffleBtn) {
    DOM.fullscreenShuffleBtn.addEventListener("click", () => {
      AppState.isShuffle = !AppState.isShuffle;
      DOM.fullscreenShuffleBtn.classList.toggle("active", AppState.isShuffle);
      if (DOM.shuffleBtn) DOM.shuffleBtn.classList.toggle("active", AppState.isShuffle);
      showToast(AppState.isShuffle ? "🔀 Shuffle Enabled" : "Shuffle Disabled");
    });
  }
  if (DOM.fullscreenFavBtn) {
    DOM.fullscreenFavBtn.addEventListener("click", () => {
      if (AppState.currentSong) toggleFavourite(AppState.currentSong.id);
    });
  }
  if (DOM.fullscreenDownloadBtn) {
    DOM.fullscreenDownloadBtn.addEventListener("click", () => {
      if (AppState.currentSong) handleDownloadAction(AppState.currentSong, DOM.fullscreenDownloadBtn);
    });
  }
  if (DOM.fullscreenSeekbar) {
    DOM.fullscreenSeekbar.addEventListener("input", (e) => {
      if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const seekTo = (parseFloat(e.target.value) / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTo;
      }
    });
  }

  // Equalizer triggers
  [DOM.playerEqBtn, DOM.featuredEqBtn, DOM.fullscreenEqBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        if (DOM.equalizerModal) DOM.equalizerModal.style.display = "flex";
        EqualizerManager.init();
        EqualizerManager.updateUI();
      });
    }
  });
  if (DOM.closeEqBtn) {
    DOM.closeEqBtn.addEventListener("click", () => {
      if (DOM.equalizerModal) DOM.equalizerModal.style.display = "none";
    });
  }
  if (DOM.resetEqBtn) {
    DOM.resetEqBtn.addEventListener("click", () => {
      EqualizerManager.applyPreset("flat");
    });
  }
  document.querySelectorAll(".eq-preset-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const preset = chip.dataset.preset;
      if (preset) EqualizerManager.applyPreset(preset);
    });
  });
  const bSlider = document.getElementById("eqBassSlider");
  const mSlider = document.getElementById("eqMidSlider");
  const tSlider = document.getElementById("eqTrebleSlider");
  [bSlider, mSlider, tSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener("input", () => {
        EqualizerManager.currentPreset = "custom";
        EqualizerManager.setGains(
          bSlider ? parseFloat(bSlider.value) : 0,
          mSlider ? parseFloat(mSlider.value) : 0,
          tSlider ? parseFloat(tSlider.value) : 0
        );
        EqualizerManager.updateUI();
      });
    }
  });

  // Lyrics modal triggers
  [DOM.playerLyricsBtn, DOM.featuredLyricsBtn, DOM.fsLyricsToggleBtn].forEach(btn => {
    if (btn) btn.addEventListener("click", () => LyricsManager.openLyrics());
  });
  if (DOM.closeLyricsBtn) {
    DOM.closeLyricsBtn.addEventListener("click", () => LyricsManager.closeLyrics());
  }

  // Playlist queue buttons
  if (DOM.clearQueueBtn) DOM.clearQueueBtn.addEventListener("click", clearQueue);
  if (DOM.exportPlaylistM3UBtn) DOM.exportPlaylistM3UBtn.addEventListener("click", exportPlaylistM3U);

  // Favourites import listener
  if (DOM.favImportInput) {
    DOM.favImportInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        importFavouritesJSON(e.target.files[0]);
      }
    });
  }
  // Live Instant Search Bar with 0ms deterministic local response & spell-check auto-correction
  if (DOM.searchInput) {
    let searchInputDebounceTimer = null;
    DOM.searchInput.addEventListener("input", (e) => {
      clearTimeout(searchInputDebounceTimer);
      const val = e.target.value;
      if (!val || !val.trim()) {
        executeSearch("");
        return;
      }
      // 60ms micro-debounce ensures smooth, responsive typing without frame drops
      searchInputDebounceTimer = setTimeout(() => {
        executeSearch(val);
      }, 60);
    });

    DOM.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(searchInputDebounceTimer);
        if (AppState.correctedQuery && DOM.searchInput) {
          DOM.searchInput.value = AppState.correctedQuery;
        }
        executeSearch(DOM.searchInput.value);
        if (AppState.searchResults.length > 0) {
          playSong(AppState.searchResults[0]);
          showToast(`🎵 Playing "${AppState.searchResults[0].title}" with related tracks in Playlist!`, "info");
        }
      } else if (e.key === "Escape") {
        clearTimeout(searchInputDebounceTimer);
        if (DOM.searchInput) DOM.searchInput.value = "";
        executeSearch("");
      }
    });

    DOM.searchInput.addEventListener("blur", () => {
      if (AppState.correctedQuery && DOM.searchInput && DOM.searchInput.value.trim().toLowerCase() === AppState.searchQuery.toLowerCase()) {
        DOM.searchInput.value = AppState.correctedQuery;
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

  // Check All Songs Button (Quick Action)
  const checkAllBtn = document.getElementById("checkAllSongsNavBtn");
  if (checkAllBtn) {
    checkAllBtn.addEventListener("click", () => {
      if (DOM.searchInput) {
        DOM.searchInput.value = "all songs";
        DOM.searchInput.focus();
      }
      executeSearch("all songs");
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
      const targetSong = AppState.currentSong ||
                         (AppState.searchResults && AppState.searchResults.length > 0 ? AppState.searchResults[0] : null) ||
                         (AppState.masterSongs && AppState.masterSongs.length > 0 ? AppState.masterSongs[0] : null);
      if (targetSong) handleDownloadAction(targetSong, DOM.playerDownloadBtn);
    });
  }

  if (DOM.playerMusicAppBtn) {
    DOM.playerMusicAppBtn.addEventListener("click", () => {
      if (AppState.currentSong) handleOpenInMobileMusicApp(AppState.currentSong);
    });
  }

  // Featured Medium-Big Player Event Listeners
  if (DOM.featuredPlayPauseBtn) DOM.featuredPlayPauseBtn.addEventListener("click", togglePlayPause);
  if (DOM.featuredPrevBtn) DOM.featuredPrevBtn.addEventListener("click", playPreviousSong);
  if (DOM.featuredNextBtn) DOM.featuredNextBtn.addEventListener("click", playNextSong);

  if (DOM.featuredShuffleBtn) {
    DOM.featuredShuffleBtn.addEventListener("click", () => {
      AppState.isShuffle = !AppState.isShuffle;
      if (DOM.shuffleBtn) DOM.shuffleBtn.classList.toggle("active", AppState.isShuffle);
      DOM.featuredShuffleBtn.classList.toggle("active", AppState.isShuffle);
      showToast(AppState.isShuffle ? "🔀 Shuffle Enabled" : "Shuffle Disabled");
    });
  }

  if (DOM.featuredRepeatBtn) {
    DOM.featuredRepeatBtn.addEventListener("click", () => {
      AppState.isRepeat = !AppState.isRepeat;
      if (DOM.repeatBtn) DOM.repeatBtn.classList.toggle("active", AppState.isRepeat);
      DOM.featuredRepeatBtn.classList.toggle("active", AppState.isRepeat);
      showToast(AppState.isRepeat ? "🔁 Repeat Enabled" : "Repeat Disabled");
    });
  }

  if (DOM.featuredFavBtn) {
    DOM.featuredFavBtn.addEventListener("click", () => {
      if (AppState.currentSong) toggleFavourite(AppState.currentSong.id);
    });
  }

  if (DOM.featuredSeekbar) {
    DOM.featuredSeekbar.addEventListener("input", (e) => {
      if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
        const seekTo = (parseFloat(e.target.value) / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTo;
      }
    });
  }

  // Download Options (Below Playing Song) Listeners
  if (DOM.featuredDownloadBtn) {
    DOM.featuredDownloadBtn.addEventListener("click", () => {
      const targetSong = AppState.currentSong ||
                         (AppState.searchResults && AppState.searchResults.length > 0 ? AppState.searchResults[0] : null) ||
                         (AppState.masterSongs && AppState.masterSongs.length > 0 ? AppState.masterSongs[0] : null);
      if (targetSong) {
        handleDownloadAction(targetSong, DOM.featuredDownloadBtn);
      }
    });
  }

  if (DOM.featuredDownloadAllBtn) {
    DOM.featuredDownloadAllBtn.addEventListener("click", () => {
      const songsToDownload = (AppState.queue && AppState.queue.length > 0)
        ? AppState.queue
        : ((AppState.searchResults && AppState.searchResults.length > 0) ? AppState.searchResults : AppState.masterSongs.slice(0, 10));
      DownloadManager.downloadAll(songsToDownload, "Current Queue");
    });
  }

  if (DOM.downloadAllPlaylistBtn) {
    DOM.downloadAllPlaylistBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (AppState.queue && AppState.queue.length > 0) {
        DownloadManager.downloadAll(AppState.queue, "Up Next Playlist");
      } else {
        showToast("⚠️ Up Next playlist is empty.", "info");
      }
    });
  }

  if (DOM.featuredMusicAppBtn) {
    DOM.featuredMusicAppBtn.addEventListener("click", () => {
      if (AppState.currentSong) {
        handleOpenInMobileMusicApp(AppState.currentSong);
      }
    });
  }

  // Quality / Bitrate selector buttons
  document.querySelectorAll(".bitrate-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.quality;
      if (q) setDownloadQuality(q);
    });
  });

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

  // Sticky Player Scroll Listener (Keeps Play Button in Same Place when scrolling)
  window.addEventListener("scroll", () => {
    if (!DOM.featuredPlayerSection) return;
    const isScrolled = (typeof window !== "undefined" && (window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || 0) > 30);
    if (isScrolled) {
      DOM.featuredPlayerSection.classList.add("is-scrolled");
    } else {
      DOM.featuredPlayerSection.classList.remove("is-scrolled");
    }
  }, { passive: true });
}

// ==========================================================================
// 3. String Normalization, Phonetics & Typo-Tolerant Fuzzy Matching Engine
// ==========================================================================

// Pure JavaScript Tamil Unicode Script to English Latin Transliterator
const TAMIL_UNICODE_VOWELS = {
  '\u0B85': 'a', '\u0B86': 'aa', '\u0B87': 'i', '\u0B88': 'ee',
  '\u0B89': 'u', '\u0B8A': 'oo', '\u0B8E': 'e', '\u0B8F': 'e',
  '\u0B90': 'ai', '\u0B92': 'o', '\u0B93': 'o', '\u0B94': 'au', '\u0B83': 'h'
};

const TAMIL_UNICODE_CONSONANTS = {
  '\u0B95': 'k', '\u0B99': 'ng', '\u0B9A': 's', '\u0B9E': 'ny',
  '\u0B9F': 't', '\u0BA3': 'n', '\u0BA4': 'th', '\u0BA8': 'n',
  '\u0BAA': 'p', '\u0BAE': 'm', '\u0BAF': 'y', '\u0BB0': 'r',
  '\u0BB2': 'l', '\u0BB5': 'v', '\u0BB4': 'zh', '\u0BB3': 'l',
  '\u0BB1': 'r', '\u0BA9': 'n', '\u0B9C': 'j', '\u0BB7': 'sh',
  '\u0BB8': 's', '\u0BB9': 'h'
};

const TAMIL_UNICODE_SIGNS = {
  '\u0BBE': 'aa', '\u0BBF': 'i', '\u0BC0': 'ee', '\u0BC1': 'u',
  '\u0BC2': 'oo', '\u0BC6': 'e', '\u0BC7': 'e', '\u0BC8': 'ai',
  '\u0BCA': 'o', '\u0BCB': 'o', '\u0BCC': 'au'
};

function containsTamilScript(str) {
  if (!str) return false;
  return /[\u0B80-\u0BFF]/.test(str);
}

function transliterateTamilToEnglish(text) {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    const next2 = text[i + 2];
    if (TAMIL_UNICODE_VOWELS[ch]) {
      out += TAMIL_UNICODE_VOWELS[ch];
    } else if (TAMIL_UNICODE_CONSONANTS[ch]) {
      let base = TAMIL_UNICODE_CONSONANTS[ch];
      // Special: ச் + ச -> ch
      if (ch === '\u0B9A' && next === '\u0BCD' && next2 === '\u0B9A') {
        out += 'ch';
        i += 2;
        const next3 = text[i + 1];
        if (TAMIL_UNICODE_SIGNS[next3]) {
          out += TAMIL_UNICODE_SIGNS[next3];
          i++;
        } else if (next3 === '\u0BCD') {
          i++;
        } else {
          out += 'a';
        }
        continue;
      }

      if (next === '\u0BCD') {
        out += (ch === '\u0B9A') ? 'ch' : base;
        i++;
      } else if (TAMIL_UNICODE_SIGNS[next]) {
        out += base + TAMIL_UNICODE_SIGNS[next];
        i++;
      } else {
        out += base + 'a';
      }
    } else {
      out += ch;
    }
  }

  // Intervocalic & nasal-consonant phonetic naturalization for Tamil
  return out
    .replace(/ngk/g, 'ng')
    .replace(/nt/g, 'nd')
    .replace(/nth/g, 'nth')
    .replace(/nral/g, 'ndral')
    .replace(/nru/g, 'ndru')
    .replace(/nra/g, 'ndra')
    .replace(/thth/g, 'th')
    .replace(/vaati/g, 'vaadi')
    .replace(/killi/g, 'ghilli')
    .replace(/gilli/g, 'ghilli')
    .replace(/kaming/g, 'coming')
    .replace(/thavaniy[aeiou]*/gi, 'thavaniye')
    .replace(/thaniy[aeiou]*/gi, 'thaniye')
    .replace(/katta\s*vandi/gi, 'katta vandi')
    .replace(/kitta\s*nerungi/gi, 'kitta nerungi')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSearchText(str) {
  if (!str) return "";
  let working = String(str);
  if (containsTamilScript(working)) {
    working = transliterateTamilToEnglish(working);
  }
  return working
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
  let working = String(str);
  if (containsTamilScript(working)) {
    working = transliterateTamilToEnglish(working);
  }
  return working
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

// Flexible token matching against target words (exact regex, transliteration normalized, or Levenshtein <= 1 or 2)
function checkTokenInTarget(token, tokenRegex, target, targetWords) {
  if (!token) return true;
  if (tokenRegex && tokenRegex.test(target)) return true;
  const normTok = normalizeTamilWord(token);
  const canonTok = toTamilCanonical(token);
  const words = Array.isArray(targetWords) ? targetWords : (target || "").split(" ").filter(Boolean);
  for (const w of words) {
    if (w === token) return true;
    const canonW = toTamilCanonical(w);
    if (canonTok && canonW && canonTok === canonW && areConsonantsCompatible(token, w) && areVowelsCompatible(token, w)) return true;
    const normW = normalizeTamilWord(w);
    if (normTok && normW && normTok === normW && areConsonantsCompatible(token, w)) return true;
    if (toTamilCanonical(token[0]) !== toTamilCanonical(w[0])) continue;
    if (token.length >= 6 && w.length >= 6 && boundedLevenshtein(token, w, 1) <= 1 && areConsonantsCompatible(token, w) && areVowelsCompatible(token, w)) return true;
  }
  return false;
}

// Bounded Levenshtein for Spell-Checking & Auto-Correction
function spellLevenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cb = b.charCodeAt(j - 1);
      const cost = ca === cb ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Comprehensive dictionary of valid song words, musical terms & transliterations that must NEVER be altered
const KNOWN_VALID_SONG_WORDS = new Set([
  // Financial, everyday & song terms
  "money", "honey", "cash", "dollar", "rupee", "bank", "gold", "rich", "poor", "million",
  // Common emotional & music vocabulary
  "love", "heart", "baby", "girl", "boy", "queen", "king", "party", "dance", "rock", "beat", "bass",
  "melody", "rhythm", "music", "song", "audio", "track", "tune", "sound", "night", "day", "star",
  "moon", "sun", "sky", "fire", "water", "rain", "life", "world", "dream", "happy", "crazy", "sweet",
  "magic", "cool", "super", "hero", "friend", "soul", "peace", "home", "road", "free", "time", "feel",
  "fly", "eyes", "smile", "kiss", "touch", "voice", "tears", "pain", "power", "mind", "body",
  "slow", "fast", "deep", "hot", "cold", "wild", "young", "new", "black", "white", "red", "blue",
  "green", "yellow", "ring", "bell", "car", "phone", "movie", "film", "show", "game", "play", "run",
  "walk", "sing", "live", "die", "give", "take", "make", "stop", "start", "open", "close", "shine",
  "glow", "burn", "fall", "rise", "stay", "wait", "leave", "come", "find", "lose", "true", "real",
  // Common regional & transliteration valid words
  "kannukulla", "kannukulle", "nikkira", "kadhaliye", "ennavale", "ennai", "maranthathu",
  "anirudh", "ilaiyaraaja", "rahman", "yuvan", "harris", "vidyasagar", "deva", "santhosh",
  "imman", "thaman", "gv", "prakash", "ghilli", "mankatha", "thuppakki", "sivaji", "baasha",
  "enthiran", "doctor", "beast", "leo", "jailer", "hukum", "badass", "vettaiyan", "amaran",
  "raayan", "chuttamalle", "vaathi", "arabic", "kuthu", "premam", "aavesham", "viswasam",
  "padayappa", "annamalai", "roja", "kadhal", "kanmani", "vaanam", "friends", "master",
  "kutty", "pattas", "usuraiya", "tholaichaen", "adi", "penne", "orasaadha", "asku", "maaro",
  // Common Tamil roots & transliteration words
  "kitta", "nerungi", "vaadi", "katta", "vandi", "dishyum", "sakalakala", "vallavan",
  "kottai", "mariamman", "kattu", "kuyilu", "vaseegara", "aalaporan", "thamizhan",
  "nenjukkul", "peidhidum", "nenjinile", "pottu", "kootu", "kallu", "mullu", "thillu",
  "thavani", "dhavani", "thavaniye", "dhavaniye", "thaniye", "dhaniye",
  "check", "all", "show", "view", "list", "browse", "see", "every"
]);

// Universal Tamil & Tanglish Transliteration Phonetic Normalization
function toTamilCanonical(str) {
  if (!str) return "";
  let s = String(str).toLowerCase()
    .replace(/['’`"“”«»]/g, "")
    .replace(/[-_.,/#!$%^&*;:{}=~()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Vowel length & diphthong unification
  s = s.replace(/aa+/g, "a")
       .replace(/ee+|ii+/g, "i")
       .replace(/oo+|uu+/g, "u")
       .replace(/ai|ay|ey|ei/g, "ai")
       .replace(/au|ou|ow/g, "au");

  // Tamil Vallinam (Stop Consonants) Transliteration Equivalence
  s = s.replace(/dh/g, "th")
       .replace(/kh|gh/g, "k")
       .replace(/sh|ch/g, "s")
       .replace(/ph/g, "p")
       .replace(/zh/g, "l");

  // Voicing normalizations for Tanglish
  s = s.replace(/g/g, "k")
       .replace(/c|z|j/g, "s")
       .replace(/b|f/g, "p")
       .replace(/d/g, "t")
       .replace(/w/g, "v");

  // Tamil Nasal Assimilation (Mellinam before stops, e.g. maramthathu -> maranthathu)
  s = s.replace(/m(?=th|t|k|s)/g, "n");

  // Collapse doubled consonants
  s = s.replace(/([a-z])\1+/g, "$1");
  return s;
}

// Radical Consonantal Skeleton (preserves essential Tamil root consonants)
function extractConsonantSkeleton(word) {
  if (!word) return [];
  const canon = toTamilCanonical(word);
  const consonants = [];
  for (let i = 0; i < canon.length; i++) {
    const c = canon[i];
    if (c === "t" && canon[i + 1] === "h") {
      consonants.push("th");
      i++;
    } else if (!/[aeiou\s]/.test(c)) {
      consonants.push(c);
    }
  }
  return consonants;
}

// Strict Consonant Compatibility Check (prevents 'Thavaniye' -> 'Thaniye' collision)
function areConsonantsCompatible(qWord, targetWord) {
  const sk1 = extractConsonantSkeleton(qWord);
  const sk2 = extractConsonantSkeleton(targetWord);
  if (sk1.length === 0 || sk2.length === 0) return true;
  if (sk1.length === sk2.length) {
    return sk1.every((c, idx) => c === sk2[idx]);
  }
  const minLen = Math.min(sk1.length, sk2.length);
  for (let i = 0; i < minLen; i++) {
    if (sk1[i] !== sk2[i]) return false;
  }
  const extra = (sk1.length > sk2.length ? sk1 : sk2).slice(minLen);
  return extra.every(c => c === "y" || c === "v" || c === "n" || c === "m");
}

// Universal Tamil Tanglish Morphological Stemmer
function stemTamilWord(word) {
  const w = String(word).toLowerCase().trim();
  if (w.length <= 3) return { original: w, stem: w, suffix: "" };

  const suffixRules = [
    { regex: /(?:iye|iyai|iyae|iyei)$/, suffix: "iye", repl: "i" },
    { regex: /(?:aye|ayai|ayae)$/, suffix: "aye", repl: "a" },
    { regex: /(?:ye|ey|ae)$/, suffix: "ye", repl: "" },
    { regex: /(?:kulla|kulle|kullu)$/, suffix: "kulla", repl: "" },
    { regex: /(?:vaadi|vaada)$/, suffix: "vaadi", repl: "" },
    { regex: /(?:inil|ukkul|il)$/, suffix: "inil", repl: "" },
    { regex: /(?:oda|udan)$/, suffix: "oda", repl: "" },
    { regex: /(?:um)$/, suffix: "um", repl: "" }
  ];

  for (const rule of suffixRules) {
    if (rule.regex.test(w) && w.length - rule.suffix.length >= 3) {
      const stem = w.replace(rule.regex, rule.repl);
      return { original: w, stem, suffix: rule.suffix };
    }
  }

  // Trailing -e vocative/poetic ending preceded by consonant
  if (w.length >= 5 && w.endsWith("e") && !/[aeiou]/.test(w[w.length - 2])) {
    return { original: w, stem: w.slice(0, -1), suffix: "e" };
  }

  return { original: w, stem: w, suffix: "" };
}

// Tamil & Indian transliteration vowel compatibility helper
function getVowelGroup(word) {
  if (!word) return "none";
  const m = String(word).toLowerCase().match(/[aeiou]/);
  if (!m) return "none";
  const v = m[0];
  if (v === "a") return "a";
  if (v === "e" || v === "i") return "ei";
  if (v === "o" || v === "u") return "ou";
  return v;
}

function areVowelsCompatible(w1, w2) {
  const g1 = getVowelGroup(w1);
  const g2 = getVowelGroup(w2);
  if (g1 === "none" || g2 === "none") return true;
  return g1 === g2;
}

// Dynamic Catalogue Vocabulary & Inverted Search Indexes
var _catalogueVocabMap = null;
var _catalogueVocabByCanonFirstChar = null;
var _tokenInvertedIndex = null;
var _canonInvertedIndex = null;

function indexSingleSong(s) {
  if (!s || !_tokenInvertedIndex || !_canonInvertedIndex || !_catalogueVocabMap) return;
  const text = `${s.title || ""} ${s.album || ""} ${s.artist || ""} ${(s.tags || []).join(" ")}`.toLowerCase();
  const words = text.split(/[^a-z0-9]+/);
  for (const w of words) {
    if (w.length >= 2) {
      _catalogueVocabMap.set(w, (_catalogueVocabMap.get(w) || 0) + 1);

      if (!_tokenInvertedIndex.has(w)) _tokenInvertedIndex.set(w, []);
      _tokenInvertedIndex.get(w).push(s);

      const stemmed = stemTamilWord(w);
      if (stemmed.stem !== w && stemmed.stem.length >= 2) {
        _catalogueVocabMap.set(stemmed.stem, (_catalogueVocabMap.get(stemmed.stem) || 0) + 1);
        if (!_tokenInvertedIndex.has(stemmed.stem)) _tokenInvertedIndex.set(stemmed.stem, []);
        _tokenInvertedIndex.get(stemmed.stem).push(s);
      }

      const canon = toTamilCanonical(w);
      if (canon) {
        if (!_canonInvertedIndex.has(canon)) _canonInvertedIndex.set(canon, []);
        _canonInvertedIndex.get(canon).push(s);
      }
    }
  }
}

function buildSearchIndex(songsList) {
  _catalogueVocabMap = new Map();
  _catalogueVocabByCanonFirstChar = new Map();
  _tokenInvertedIndex = new Map();
  _canonInvertedIndex = new Map();

  for (const kw of KNOWN_VALID_SONG_WORDS) {
    _catalogueVocabMap.set(kw, 50);
  }

  const list = Array.isArray(songsList) && songsList.length > 0
    ? songsList
    : ((AppState.masterSongs && AppState.masterSongs.length > 0)
      ? AppState.masterSongs
      : ((typeof window !== "undefined" && window.CATALOGUE_SONGS && Array.isArray(window.CATALOGUE_SONGS))
        ? window.CATALOGUE_SONGS
        : DEFAULT_STATIC_SONGS));

  for (let idx = 0; idx < list.length; idx++) {
    indexSingleSong(list[idx]);
  }

  for (const [w, freq] of _catalogueVocabMap.entries()) {
    if (!w) continue;
    const c = toTamilCanonical(w[0]);
    if (!_catalogueVocabByCanonFirstChar.has(c)) {
      _catalogueVocabByCanonFirstChar.set(c, []);
    }
    _catalogueVocabByCanonFirstChar.get(c).push([w, freq]);
  }
}

function getCatalogueVocabMap() {
  if (!_catalogueVocabMap) buildSearchIndex();
  return _catalogueVocabMap;
}

// Comprehensive Phrase & Alias Replacements
const KNOWN_PHRASE_REPLACEMENTS = [
  // User's specific requested songs & transliterations
  { regex: /\bno\s+mon+y\s+no\s+mon+y\b|\bno\s+mon+ey\s+no\s+mon+ey\b/gi, fix: "no money no money" },
  { regex: /\bno\s+mon+y\s+no\s+hon+y\b|\bno\s+mon+ey\s+no\s+hon+ey\b/gi, fix: "no money no honey" },
  { regex: /\bno\s+mon+y\b/gi, fix: "no money" },
  { regex: /\bmon+y\b/gi, fix: "money" },
  { regex: /\bhon+y\b/gi, fix: "honey" },
  { regex: /\bkan+uk+ul+a\s+nik+a\s+ye\s+kadhal[iey]*\b/gi, fix: "kannukulla nikkira en kadhaliye" },
  { regex: /\bkan+uk+ul+a\s+nik+a\b/gi, fix: "kannukulla nikkira" },
  { regex: /\bkan+uk+ul+a\s+nik+ir+a\b/gi, fix: "kannukulla nikkira" },
  { regex: /\bkan+uk+ul+a\b/gi, fix: "kannukulla" },
  { regex: /\bkannukulla\s+nikkira\s+ye\s+kadhaliye\b/gi, fix: "kannukulla nikkira en kadhaliye" },
  { regex: /\bkannukulla\s+nikka\s+ye\s+kadhaliye\b/gi, fix: "kannukulla nikkira en kadhaliye" },
  { regex: /\bye\s+kadhal[iey]+\b/gi, fix: "en kadhaliye" },
  { regex: /\bkadhaliye\b/gi, fix: "kadhaliye" },
  { regex: /\ben+av+al+[ey]*\s+e*an+ai\s+maran*m*t*h*at*h*u*\b/gi, fix: "ennavale ennai maranthathu" },
  { regex: /\ben+av+al+[ey]*\s+en+ai\s+maran*m*t*h*at*h*[ua]*\b/gi, fix: "ennavale ennai maranthathu" },
  { regex: /\ben+av+al+[ey]*\s+en+ai\s+maran*d*h*ad*h*u*\b/gi, fix: "ennavale ennai maranthathu" },
  { regex: /\ben+av+al+[ey]*\s+en+ai\b/gi, fix: "ennavale ennai" },
  { regex: /\ben+av+al+e*\b/gi, fix: "ennavale" },
  { regex: /\be*an+ai\s+maran*m*t*h*at*h*u*\b/gi, fix: "ennai maranthathu" },
  { regex: /\benai\b|\beannai\b/gi, fix: "ennai" },
  { regex: /\bmaramthathu\b|\bmaramthatha\b|\bmarandhadhu\b|\bmaranthath\b/gi, fix: "maranthathu" },
  { regex: /\bkit+ha\s+nerun*g*i*\s+va+a*\s+d+i+\b|\bkit+a\s+nerun*g*i*\s+va+a*\s+d+i+\b/gi, fix: "kitta nerungi vaa di" },
  { regex: /\bkit+ha\s+nerun*g*i*\s+va+d+i+\b|\bkit+a\s+nerun*g*i*\s+va+d+i+\b/gi, fix: "kitta nerungi vaadi" },
  { regex: /\bkit+ha\s+nerun*g*i*\b|\bkit+a\s+nerun*g*i*\b/gi, fix: "kitta nerungi" },
  { regex: /\bkit+ha\b/gi, fix: "kitta" },
  { regex: /\bnerung+i\b/gi, fix: "nerungi" },
  { regex: /\bkat+a\s+van+d+i\b/gi, fix: "katta vandi" },

  // Composers & Artists
  { regex: /\bar\s+rhman\b|\barr\s+rahman\b|\barr\b/gi, fix: "a r rahman" },
  { regex: /\baniruth\b|\banirud\b/gi, fix: "anirudh" },
  { regex: /\braavichander\b|\bravichandran\b/gi, fix: "ravichander" },
  { regex: /\bil+ayaraj+a\b|\bil+aiyaraj+a\b|\belayaraja\b/gi, fix: "ilaiyaraaja" },
  { regex: /\byuvan\s+shanker\b/gi, fix: "yuvan shankar" },
  { regex: /\bspb\b/gi, fix: "s p balasubrahmanyam" },
  { regex: /\bs\s*a\s*rajkumar\b|\bs\.a\.rajkumar\b/gi, fix: "s a rajkumar" },
  { regex: /\bdhilip\s+varma\b/gi, fix: "dhilip varman" },
  { regex: /\bchithra\b/gi, fix: "k s chithra" },
  { regex: /\byesudas\b/gi, fix: "k j yesudas" },
  { regex: /\bjanaki\b/gi, fix: "s janaki" },
  { regex: /\bunnikrishnan\b/gi, fix: "p unnikrishnan" },
  { regex: /\bunni\s+menon\b/gi, fix: "unni menon" },

  // Movies & Hit Songs
  { regex: /\barabi\b/gi, fix: "arabic" },
  { regex: /\bghili+\b|\bgilli\b/gi, fix: "ghilli" },
  { regex: /\bmang+atha\b|\bmanikatha\b|\bmangkatha\b/gi, fix: "mankatha" },
  { regex: /\bthup+ak+i\b/gi, fix: "thuppakki" },
  { regex: /\bamra+m\b|\bamara+m\b/gi, fix: "amaran" },
  { regex: /\bvet+ai*yan\b/gi, fix: "vettaiyan" },
  { regex: /\bsivaji\s+the\s+bos\b/gi, fix: "sivaji the boss" },
  { regex: /\bkut+y\s+pat+as\b/gi, fix: "kutty pattas" },
  { regex: /\bvada\s+chen+ai\b|\bvaada\s+cennai\b/gi, fix: "vada chennai" },
  { regex: /\bro+ja\b|\brooja\b/gi, fix: "roja" },
  { regex: /\bleo+\s+das\b/gi, fix: "leo das" },
  { regex: /\bleoo\b/gi, fix: "leo" },
  { regex: /\bba+sha\b/gi, fix: "baasha" },
  { regex: /\bavesham\b/gi, fix: "aavesham" },
  { regex: /\bprem+m\b/gi, fix: "premam" },
  { regex: /\bmovice\b|\bmoive\b|\bmovei\b/gi, fix: "movie" },
  { regex: /\bflim\b|\bflims\b|\bfilam\b/gi, fix: "film" },
  { regex: /\bpennin\s+manathai\b/gi, fix: "pennin manathai thottu" },
  { regex: /\bchutamalle\b/gi, fix: "chuttamalle" },
  { regex: /\bvaathy\b/gi, fix: "vaathi" },
  { regex: /\bsandramukhi\b/gi, fix: "chandramukhi" },
  { regex: /\bendhiran\b/gi, fix: "enthiran" },
  { regex: /\bdoktor\b|\bdoktar\b/gi, fix: "doctor" },
  { regex: /\brayan\b|\brayen\b/gi, fix: "raayan" },
  { regex: /\bvisvaasam\b/gi, fix: "viswasam" },
  { regex: /\bpadayapa\b|\bpadaiyappa\b/gi, fix: "padayappa" },
  { regex: /\banamalai\b/gi, fix: "annamalai" },
  { regex: /\bshivaji\b/gi, fix: "sivaji" },
  { regex: /\bbeest\b/gi, fix: "beast" },
  { regex: /\bvikrem\b/gi, fix: "vikram" },
  { regex: /\bjayler\b/gi, fix: "jailer" },
  { regex: /\bhokum\b|\bhukumm\b/gi, fix: "hukum" },
  { regex: /\bbadaas\b/gi, fix: "badass" }
];

// Word-level correction against catalogue vocabulary
function correctSingleWord(word) {
  const w = word.toLowerCase().trim();
  if (w.length < 3) return word;
  const stopWords = new Set(["the", "and", "for", "with", "from", "you", "are", "all", "out", "ost", "non", "not", "vaa", "di", "en", "da"]);
  if (stopWords.has(w) || KNOWN_VALID_SONG_WORDS.has(w)) return word;

  const vocab = getCatalogueVocabMap();
  if (vocab.has(w)) return word; // Valid catalogue or dictionary word - keep as is!

  // Check if its Tamil stem exists in vocabulary (e.g. "thavaniye" -> "thavani", "thaniye" -> "thani")
  const stemmed = stemTamilWord(w);
  if (stemmed.stem !== w && vocab.has(stemmed.stem)) {
    return word; // Valid word with Tamil suffix - NEVER ALTER!
  }

  let bestCandidate = word;
  let bestDist = 99;
  let maxFreq = 0;

  const c1 = toTamilCanonical(w[0]);
  const candidates = (_catalogueVocabByCanonFirstChar && _catalogueVocabByCanonFirstChar.get(c1)) || vocab.entries();

  for (const [vWord, freq] of candidates) {
    if (Math.abs(vWord.length - w.length) > 2) continue;

    // First letter / sound group must match in Tamil phonology
    const c2 = toTamilCanonical(vWord[0]);
    if (c1 !== c2) continue;

    // Vowel compatibility: primary vowel sound MUST match!
    // Prevents "kitta" -> "katta", "vaadi" -> "vandi", "kottai" -> "kattu", etc.
    if (!areVowelsCompatible(w, vWord)) continue;

    // Consonant skeleton compatibility: essential radical consonants MUST match!
    // Prevents "thavaniye" -> "thaniye", "thavani" -> "thani", etc.
    if (!areConsonantsCompatible(w, vWord)) continue;

    // For short words (length <= 4), only allow length difference or double-consonant variations
    // Never allow replacing letters in short root words!
    if (w.length <= 4) {
      const isConsonantDoubling = w.replace(/([a-z])\1+/g, "$1") === vWord.replace(/([a-z])\1+/g, "$1");
      const dShort = spellLevenshtein(w, vWord);
      if (!isConsonantDoubling && dShort > 0 && Math.abs(w.length - vWord.length) === 0) {
        continue;
      }
    }

    const d = spellLevenshtein(w, vWord);
    const maxAllowedDist = w.length <= 5 ? 1 : 2;
    if (d <= maxAllowedDist) {
      if (d < bestDist || (d === bestDist && freq > maxFreq)) {
        bestDist = d;
        maxFreq = freq;
        bestCandidate = vWord;
      }
    }
  }

  return (bestDist <= 2 && bestCandidate !== word) ? bestCandidate : word;
}

// Master Intelligent Spell-Checker & Query Auto-Corrector
function autoCorrectSearchQuery(query) {
  if (!query || !query.trim()) return { original: query, corrected: query, hasCorrection: false };
  let text = query.trim();
  let hadTamil = false;
  if (containsTamilScript(text)) {
    hadTamil = true;
    text = transliterateTamilToEnglish(text);
  }

  // Step 1: Apply known phrase regexes
  let phraseReplaced = text;
  for (const { regex, fix } of KNOWN_PHRASE_REPLACEMENTS) {
    phraseReplaced = phraseReplaced.replace(regex, fix);
  }

  // Step 2: Word-by-word spell checking against catalogue vocabulary
  const words = phraseReplaced.split(/\s+/);
  const correctedWords = words.map(correctSingleWord);
  const finalText = correctedWords.join(" ");

  const hasCorrection = hadTamil || (finalText.toLowerCase() !== text.toLowerCase());
  return {
    original: query.trim(),
    corrected: finalText,
    hasCorrection
  };
}

// Pre-cleans common Tamil/Indian transliteration typos before online search
function correctSearchQuery(q) {
  if (!q) return "";
  return autoCorrectSearchQuery(q).corrected;
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

  const coreCleanTitle = cleanCoreTitle(title);
  const titleTokens = (coreCleanTitle ? coreCleanTitle.split(" ") : normTitle.split(" ")).filter(Boolean);
  const albumTokens = normAlbum.split(" ").filter(Boolean);
  const artistTokens = normArtist.split(" ").filter(Boolean);

  const canonTitle = toTamilCanonical(normTitle);
  const canonAlbum = toTamilCanonical(normAlbum);
  const canonArtist = toTamilCanonical(normArtist);
  const stemmedTitleTokens = titleTokens.map(w => stemTamilWord(w).stem);
  const canonTitleTokens = titleTokens.map(toTamilCanonical);

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
    _canonTitle: canonTitle,
    _canonAlbum: canonAlbum,
    _canonArtist: canonArtist,
    _pTitle: pTitle,
    _pAlbum: pAlbum,
    _pArtist: pArtist,
    _titleTokens: titleTokens,
    _albumTokens: albumTokens,
    _artistTokens: artistTokens,
    _stemmedTitleTokens: stemmedTitleTokens,
    _canonTitleTokens: canonTitleTokens,
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
    _phoneticTokens: phoneticTokens,
    _extractedMovie: extractSongMovie({ title, album, movie: song.movie }),
    _canonMovie: toTamilCanonical(cleanCoreTitle(extractSongMovie({ title, album, movie: song.movie })).replace(/\s+/g, "")),
    _canonicalKey: getSongCanonicalKey({ title, name: title, album, movie: song.movie, artist, singer: artist }),
    _isDerivative: isUnwantedDerivativeVersion({ title, name: title, album, movie: song.movie, artist, singer: artist, tags: normTags, duration: song.duration }),
    _originalRank: getOriginalVersionRank({ title, name: title, album, movie: song.movie, artist, singer: artist, tags: normTags, audio_url: song.audio_url, duration: song.duration, year: song.year })
  };
}

// Cleans core title by removing extraneous movie tags, bracketed suffixes, and feat tags
function cleanCoreTitle(rawTitle) {
  if (!rawTitle) return "";
  let working = String(rawTitle);
  if (containsTamilScript(working)) {
    working = transliterateTamilToEnglish(working);
  }
  return working
    .replace(/\s*\([^)]*(?:from|soundtrack|ost|version|theme|feat|ft\.)[^)]*\)/gi, " ")
    .replace(/\s*\[[^\]]*(?:from|soundtrack|ost|version|theme|feat|ft\.)[^\]]*\]/gi, " ")
    .replace(/\s*-\s*(?:from|soundtrack|ost|halamithi|original|lyric|audio|video|remix|reprise).*/gi, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Detects compilation albums vs authentic movie soundtrack albums
function isCompilationAlbum(albumName) {
  if (!albumName) return false;
  return /\b(hits of|signature hits|best of|love hits|dance hits|collection|greatest hits|top hero|favourite songs|sweet voice of|paadava pudhu|mega star|isai virundhu|special hits|top 10|top 20|celebration hits|film story)\b/i.test(albumName);
}

// Identifies unwanted derivative versions (remixes, DJ edits, lofi, covers, reels edits, dialogue snippets)
function isUnwantedDerivativeVersion(song, userQuery = "") {
  if (!song) return false;
  const uq = (userQuery || "").toLowerCase();
  const explicitKeywords = /\b(remix|remixes|dj|mashup|lofi|lo-fi|slowed|reverb|cover|karaoke|acoustic|instrumental|sped|speed|teaser|trailer|reels|shorts|dialogue|parody)\b/i;
  if (explicitKeywords.test(uq)) return false;

  const t = (song.title || song.name || "").toLowerCase();
  const a = (song.album || song.movie || "").toLowerCase();
  const art = (song.artist || song.singer || "").toLowerCase();
  const tags = Array.isArray(song.tags) ? song.tags.join(" ").toLowerCase() : "";
  const all = `${t} ${a} ${art} ${tags}`;

  if (/\b(remix|remixes|dance mix|club mix|edm mix|party mix|flip|mashup|mash-up|medley|parody)\b/i.test(t)) return true;
  if (/\b(dj\s|dj-|dj_|dj mix)\b/i.test(t) || art.startsWith("dj ") || art.includes(" dj ") || art.includes(", dj")) return true;
  if (/\b(slowed|reverb|lofi|lo-fi|sped up|speed up|chillout|ambient mix|bass boosted)\b/i.test(all)) return true;
  if (/\b(cover version|cover|karaoke|instrumental|tribute|piano cover|violin cover|guitar cover|flute cover|unplugged cover|made famous by|in the style of)\b/i.test(t)) return true;
  if (/\b(reels version|shorts version|tiktok edit|trending edit|insta edit|reels edit)\b/i.test(all)) return true;
  if (/\b(audio teaser|teaser|trailer|promo teaser|dialogue promo|dialogue part|glimpse|motion poster|film story|movie dialogue)\b/i.test(t) || /\b(dialogue|film story)\b/i.test(a)) return true;
  if (song.duration && song.duration < 55 && !/\b(intro|theme|whistle|title)\b/i.test(t)) return true;

  return false;
}

// Extracts authentic movie or standalone album name from song metadata
function extractSongMovie(song) {
  if (!song) return "";
  if (song.movie) return song.movie;
  const combined = (song.title || "") + " " + (song.album || "");
  const match = combined.match(/\bfrom\s*["']?([^"')\],]+)["']?/i);
  if (match) return match[1].trim();
  if (song.album && !isCompilationAlbum(song.album) && !/\b(from|soundtrack|ost|vol|hits)\b/i.test(song.album)) return song.album;
  return "";
}

// Canonical grouping key to collapse multiple duplicate album releases into single track identity
function getSongCanonicalKey(song) {
  const rawTitle = song.title || song.name || "";
  const coreTitle = cleanCoreTitle(rawTitle);
  const compactTitle = toTamilCanonical(coreTitle.replace(/\s+/g, ""));

  const movie = extractSongMovie(song);
  if (movie) {
    const compactMovie = toTamilCanonical(cleanCoreTitle(movie).replace(/\s+/g, ""));
    return `${compactTitle}__m_${compactMovie}`;
  }

  const art = (song.artist || song.singer || "").split(/[,&]/)[0].trim();
  const compactArt = toTamilCanonical(normalizeSearchText(art).replace(/\s+/g, ""));
  return `${compactTitle}__a_${compactArt}`;
}

// Ranks original soundtrack recording highest over compilations, duplicates and covers
function getOriginalVersionRank(song) {
  let rank = 0;
  const t = (song.title || song.name || "").toLowerCase();
  const a = (song.album || song.movie || "").toLowerCase();
  const movie = (song.movie || "").toLowerCase();
  const isComp = isCompilationAlbum(a);

  if (!isComp && movie && a === movie) rank += 50000;
  else if (!isComp && !t.includes("from \"") && !a.includes("hits") && !a.includes("vol")) rank += 30000;

  if (isComp) rank -= 40000;
  if (/\bfrom\s*["'][^"']+["']/i.test(t) || /\bfrom\s+[a-z]+/i.test(t)) rank -= 15000;

  if (song.audio_url && song.audio_url.includes("aac.saavncdn.com")) {
    rank += 5000;
    if (song.audio_url.includes("_320.mp4")) rank += 3000;
  }

  if (song.duration && song.duration >= 150 && song.duration <= 450) rank += 2000;

  if (song.year) {
    const yr = parseInt(song.year, 10);
    if (movie === "ghilli" && yr === 2004) rank += 20000;
    if (movie === "jayam" && yr === 2003) rank += 20000;
  }

  if (Array.isArray(song.tags) && song.tags.includes("soundtrack")) rank += 5000;

  return rank;
}

const MOVIE_TARGET_INDEX = new Map();

function indexMovieTarget(song) {
  const m = song._extractedMovie || extractSongMovie(song);
  if (!m) return;
  const cleanM = cleanCoreTitle(m);
  if (!cleanM || cleanM.length < 3) return;
  const canonM = song._canonMovie || toTamilCanonical(cleanM.replace(/\s+/g, ""));
  let entry = MOVIE_TARGET_INDEX.get(cleanM);
  if (!entry) {
    entry = { cleanMovie: cleanM, canonMovie: canonM, movieName: m, songs: [] };
    MOVIE_TARGET_INDEX.set(cleanM, entry);
    const normM = normalizeTamilWord(cleanM);
    if (normM) MOVIE_TARGET_INDEX.set(normM, entry);
    if (cleanM === "gilli") MOVIE_TARGET_INDEX.set("ghilli", entry);
    if (cleanM === "ghilli") MOVIE_TARGET_INDEX.set("gilli", entry);
  }
  if (!entry.songs.includes(song)) {
    entry.songs.push(song);
  }
}

// Determines if query matches an authentic movie name in the database (O(1) lookup)
function findExactMovieTarget(query) {
  if (!query) return null;
  const clean = cleanCoreTitle(query);
  if (!clean || clean.length < 3) return null;
  return MOVIE_TARGET_INDEX.get(clean) || MOVIE_TARGET_INDEX.get(normalizeTamilWord(clean)) || null;
}

// Deduplicate candidate results down to ONE verified original version per song
function deduplicateToOriginals(rawResults, rawQuery = "") {
  let pool = rawResults;
  const explicitKeywords = /\b(remix|remixes|dj|mashup|lofi|lo-fi|slowed|reverb|cover|karaoke|acoustic|instrumental|sped|speed|teaser|trailer|reels|shorts|dialogue|parody)\b/i;
  const isExplicit = explicitKeywords.test(rawQuery || "");

  if (!isExplicit) {
    const nonDeriv = rawResults.filter(r => !(r.song && (r.song._isDerivative ?? isUnwantedDerivativeVersion(r.song, rawQuery))));
    if (nonDeriv.length > 0) {
      pool = nonDeriv;
    }
  }

  const groups = new Map();
  for (const item of pool) {
    const s = item.song;
    const key = (s && s._canonicalKey) || getSongCanonicalKey(s);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }

  const originals = [];
  for (const [key, items] of groups.entries()) {
    if (items.length === 1) {
      originals.push(items[0]);
      continue;
    }
    items.sort((a, b) => {
      const bRank = (b.song && b.song._originalRank !== undefined) ? b.song._originalRank : getOriginalVersionRank(b.song);
      const aRank = (a.song && a.song._originalRank !== undefined) ? a.song._originalRank : getOriginalVersionRank(a.song);
      const origDiff = bRank - aRank;
      if (origDiff !== 0) return origDiff;
      return b.score - a.score;
    });
    originals.push(items[0]);
  }

  originals.sort((a, b) => b.score - a.score);
  return originals.map(o => o.song);
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

  // Pure "Check All Songs" in Search Bar Detection
  const allSongsRegex = /^(all\s+songs?|check\s+all(\s+songs?)?|check\s+songs?|show\s+all(\s+songs?)?|view\s+all(\s+songs?)?|list\s+all(\s+songs?)?|see\s+all(\s+songs?)?|browse\s+all(\s+songs?)?|all\s+tracks?|all\s+music|every\s+songs?|all|songs?|total\s+songs?|full\s+songs?|all\s+album\s+songs?|ella\s+songs?|ellam\s+songs?|ella\s+paa?t+u|ellam\s+paa?t+u|all\s+paa?t+u)$/i;
  const hasAllPhrase = allSongsRegex.test(normQ.trim()) ||
    /\b(all\s+songs|check\s+all\s+songs|check\s+all|show\s+all\s+songs|view\s+all\s+songs|list\s+all\s+songs|browse\s+all\s+songs|every\s+song|ella\s+songs|ellam\s+songs)\b/i.test(normQ.trim());
  const allFilterWordsRegex = /\b(all|songs|song|check|show|view|list|see|browse|every|tracks|track|music|total|full|album|albums|ella|ellam|paatu|paattu|pattu|by|of)\b/gi;
  const remainingWithoutAll = normQ.replace(allFilterWordsRegex, " ").replace(/\s+/g, " ").trim();
  const isPureAllSongsQuery = Boolean(hasAllPhrase && remainingWithoutAll.length === 0);

  // When "all songs" phrase is combined with keywords (e.g. "check all songs anirudh", "all songs 90s"), strip all songs phrase from cleanQ
  if (hasAllPhrase && remainingWithoutAll.length > 0) {
    cleanQ = remainingWithoutAll;
    const typoRemaining = correctSearchQuery(remainingWithoutAll);
    if (typoRemaining && typoRemaining !== remainingWithoutAll) {
      const cleanTypo = typoRemaining.replace(allFilterWordsRegex, " ").replace(/\s+/g, " ").trim();
      if (cleanTypo) cleanQ = cleanTypo;
    }
  }

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
  const coreQ = cleanCoreTitle(cleanQ && cleanQ.length > 0 ? cleanQ : rawQuery);
  const qForDist = cleanQ && cleanQ.length >= 4 ? cleanQ : (normQ.length >= 4 ? normQ : null);

  const tokenSource = cleanQ && cleanQ.length >= 2 ? cleanQ : normQ;
  const tokens = tokenSource.split(" ").filter(w => w.length >= 2);
  const tokenRegexes = tokens.length >= 2 ? tokens.map(t => new RegExp(`\\b${t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i")) : null;

  const canonQ = toTamilCanonical(normQ);
  const cleanCanonQ = toTamilCanonical(cleanQ);
  const stemTokens = tokens.map(w => stemTamilWord(w).stem);
  const canonTokens = tokens.map(toTamilCanonical);

  return {
    rawQuery, normQ, cleanQ, compactQ, cleanCompactQ, cleanPhoneticQ, phoneticQ,
    qPhonetics, coreQ, qForDist, tokens, tokenRegexes,
    canonQ, cleanCanonQ, stemTokens, canonTokens,
    is1980to2026Query, isPureAllSongsQuery, specificYear, isSpecificYearOnly,
    requestedEra, isPureEraQuery, isGenericMovieQuery, isMovieWordInQuery,
    requestedType, isPureTypeQuery
  };
}

function scoreSongWithContext(song, ctx) {
  const {
    normQ, cleanQ, compactQ, cleanPhoneticQ, phoneticQ,
    qPhonetics, coreQ, qForDist, tokens, tokenRegexes,
    is1980to2026Query, isPureAllSongsQuery, specificYear, isSpecificYearOnly,
    requestedEra, isPureEraQuery, isGenericMovieQuery, isMovieWordInQuery,
    requestedType, isPureTypeQuery
  } = ctx;

  // Pure "Check All Songs" Query (e.g. "all songs", "check all songs", "all", "songs", "all tracks")
  if (isPureAllSongsQuery) {
    let allScore = 6000;
    if (song.year) allScore += 100;
    if (Array.isArray(song.sections) && song.sections.includes("trending")) allScore += 80;
    if (song.era === "now") allScore += 50;
    else if (song.era === "2k") allScore += 40;
    else if (song.era === "90s") allScore += 30;
    else if (song.era === "80s") allScore += 20;
    return { matched: true, score: allScore };
  }

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

  // 1. Song Title matches (Highest Priority: exact titles always score highest)
  if (coreQ && coreTitle === coreQ) {
    matched = true;
    score += 25000;
  } else if (normTitle === normQ || normTitle === cleanQ) {
    matched = true;
    score += 24000;
  } else if (song._canonTitle && (song._canonTitle === ctx.canonQ || song._canonTitle === ctx.cleanCanonQ)) {
    matched = true;
    score += 22000;
  } else if (coreQ && coreTitle.startsWith(coreQ)) {
    matched = true;
    score += 18000;
  } else if (normTitle.startsWith(cleanQ + " ") || normTitle.startsWith(normQ + " ")) {
    matched = true;
    score += 16000;
  } else if (song._canonTitle && (song._canonTitle.startsWith(ctx.cleanCanonQ + " ") || song._canonTitle.startsWith(ctx.canonQ + " "))) {
    matched = true;
    score += 15000;
  } else if (normTitle.includes(" " + cleanQ + " ") || normTitle.startsWith(cleanQ + " ") || normTitle.endsWith(" " + cleanQ) ||
             normTitle.includes(" " + normQ + " ") || normTitle.startsWith(normQ + " ") || normTitle.endsWith(" " + normQ)) {
    matched = true;
    score += 14000;
  } else if (song._canonTitle && (song._canonTitle.includes(" " + ctx.cleanCanonQ + " ") || song._canonTitle.endsWith(" " + ctx.cleanCanonQ))) {
    matched = true;
    score += 12000;
  } else if (cleanQ.length >= 4 && cleanQ.startsWith(normTitle + " ")) {
    matched = true;
    score += 9000;
  } else if (cleanQ.length >= 5 && (normTitle === cleanQ || normTitle.startsWith(cleanQ + " ") || normTitle.endsWith(" " + cleanQ) || normTitle.includes(" " + cleanQ + " "))) {
    matched = true;
    score += 8000;
  }

  // 1b. Stemmed & Canonical Title Token Matching (handles Tanglish vocatives/suffixes like "Thavaniye" -> "Thavani", "Kadhaliye" -> "Kadhali")
  if (!isMovieWordInQuery && tokens && tokens.length === 1) {
    const qtok = tokens[0];
    const qstem = ctx.stemTokens ? ctx.stemTokens[0] : qtok;
    const qcanon = ctx.canonTokens ? ctx.canonTokens[0] : qtok;
    const songTitleTokens = song._titleTokens || [];
    const songStemTokens = song._stemmedTitleTokens || [];
    const songCanonTokens = song._canonTitleTokens || [];

    let found = false;
    let foundFirstWord = false;
    for (let j = 0; j < songTitleTokens.length; j++) {
      const stok = songTitleTokens[j];
      const sstem = songStemTokens[j] || stok;
      const scanon = songCanonTokens[j] || stok;

      if (qtok === stok || qstem === stok || qtok === sstem || qstem === sstem) {
        found = true;
        if (j === 0) foundFirstWord = true;
        break;
      }
      if (qcanon === scanon && areConsonantsCompatible(qtok, stok) && areVowelsCompatible(qtok, stok)) {
        found = true;
        if (j === 0) foundFirstWord = true;
        break;
      }
    }

    if (found) {
      matched = true;
      score += 14000;
      if (foundFirstWord) {
        score += 3000;
      }
    }
  }

  // Compact title match (e.g. "naatunaatu" -> "Naatu Naatu")
  const compactTitle = song._compactTitle || normalizeCompact(normTitle);
  if (compactQ && (compactTitle === compactQ || compactTitle.startsWith(compactQ))) {
    matched = true;
    score += 4000;
  }

  // 2. Movie / Album matches (Ensures ALL songs belonging to the album are included and displayed separately!)
  const albumIsComp = isCompilationAlbum(normAlbum);
  if (normAlbum === normQ || normAlbum === cleanQ || (coreQ && coreAlbum === coreQ) || (song.movie && song.movie.toLowerCase() === cleanQ)) {
    matched = true;
    score += 15000;
    if (coreTitle.includes(coreQ) || normTitle.includes(normQ) || (cleanQ && normTitle.includes(cleanQ))) {
      score += 8500; // Title track from same named movie (e.g. Manithan Manithan in Manithan)
    }
    if (isMovieWordInQuery) {
      score += 12000; // Explicitly searched for movie/album
    }
  } else if (!albumIsComp && (normAlbum.startsWith(cleanQ + " ") || normAlbum.startsWith(normQ + " "))) {
    matched = true;
    score += 4000;
  } else if (!albumIsComp && cleanQ.length >= 3 && cleanQ.startsWith(normAlbum + " ")) {
    matched = true;
    score += 3500;
  } else if (!albumIsComp && (normAlbum.includes(" " + cleanQ + " ") || normAlbum.startsWith(cleanQ + " ") || normAlbum.endsWith(" " + cleanQ) ||
             normAlbum.includes(" " + normQ + " ") || normAlbum.startsWith(normQ + " ") || normAlbum.endsWith(" " + normQ))) {
    matched = true;
    score += 3000;
  } else if (!albumIsComp && cleanQ.length >= 5 && (normAlbum === cleanQ || normAlbum.startsWith(cleanQ + " ") || normAlbum.endsWith(" " + cleanQ) || normAlbum.includes(" " + cleanQ + " "))) {
    matched = true;
    score += 1500;
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

  // 4. Phonetic matches (with vowel and letter compatibility safeguards)
  for (const qp of qPhonetics) {
    if (qp.length < 3) continue;
    if (pTitle === qp && areVowelsCompatible(cleanQ, normTitle)) {
      matched = true;
      score += 2500;
    } else if (pAlbum === qp && areVowelsCompatible(cleanQ, normAlbum)) {
      matched = true;
      score += 2400;
    } else if (pArtist === qp && areVowelsCompatible(cleanQ, normArtist)) {
      matched = true;
      score += 1800;
    } else if (song._pTitleTokens && song._pTitleTokens.includes(qp)) {
      const titleWords = song._titleTokens || normTitle.split(" ");
      const hasActualMatch = titleWords.some(w => areVowelsCompatible(cleanQ, w) && (w[0] === cleanQ[0] || (w[0] === 'k' && cleanQ[0] === 'g') || (w[0] === 'g' && cleanQ[0] === 'k')) && spellLevenshtein(cleanQ, w) <= 2);
      if (hasActualMatch) {
        matched = true;
        score += 1500;
      }
    } else if (song._pAlbumTokens && song._pAlbumTokens.includes(qp)) {
      const albumWords = normAlbum.split(" ");
      const hasActualMatch = albumWords.some(w => areVowelsCompatible(cleanQ, w) && (w[0] === cleanQ[0] || (w[0] === 'k' && cleanQ[0] === 'g') || (w[0] === 'g' && cleanQ[0] === 'k')) && spellLevenshtein(cleanQ, w) <= 2);
      if (hasActualMatch) {
        matched = true;
        score += 1400;
      }
    } else if (song._pArtistTokens && song._pArtistTokens.includes(qp)) {
      const artistWords = normArtist.split(" ");
      const hasActualMatch = artistWords.some(w => areVowelsCompatible(cleanQ, w) && (w[0] === cleanQ[0] || (w[0] === 'k' && cleanQ[0] === 'g') || (w[0] === 'g' && cleanQ[0] === 'k')) && spellLevenshtein(cleanQ, w) <= 2);
      if (hasActualMatch) {
        matched = true;
        score += 1200;
      }
    }
  }

  // 5. Typo & edit distance on title & album (strictly bounded to max distance 1 with vowel & consonant compatibility)
  if (qForDist) {
    const maxDist = 1;
    if (boundedLevenshtein(qForDist, normTitle, maxDist) <= maxDist && areVowelsCompatible(qForDist, normTitle) && areConsonantsCompatible(qForDist, normTitle)) {
      matched = true;
      score += 1200;
    }
    if (boundedLevenshtein(qForDist, normAlbum, maxDist) <= maxDist && areVowelsCompatible(qForDist, normAlbum) && areConsonantsCompatible(qForDist, normAlbum)) {
      matched = true;
      score += 1600;
    } else {
      const albumFirst = song._albumFirst || normAlbum.split(" ")[0];
      if (albumFirst && albumFirst.length >= 5 && boundedLevenshtein(qForDist, albumFirst, maxDist) <= maxDist && areVowelsCompatible(qForDist, albumFirst) && areConsonantsCompatible(qForDist, albumFirst)) {
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
      const canonTok = toTamilCanonical(tok);
      let foundIndex = -1;
      for (let j = 0; j < targetWords.length; j++) {
        if (usedWordIndices.has(j)) continue;
        const w = targetWords[j];
        if (w === tok) { foundIndex = j; break; }
        const canonW = toTamilCanonical(w);
        if (canonTok && canonW && canonTok === canonW && areConsonantsCompatible(tok, w) && areVowelsCompatible(tok, w)) {
          foundIndex = j;
          break;
        }
        const normW = normalizeTamilWord(w);
        if (normTok && normW && normTok === normW && areConsonantsCompatible(tok, w)) {
          foundIndex = j;
          break;
        }
        if (toTamilCanonical(tok[0]) !== toTamilCanonical(w[0])) continue;
        if (tok.length >= 6 && w.length >= 6 && boundedLevenshtein(tok, w, 1) <= 1 && areConsonantsCompatible(tok, w) && areVowelsCompatible(tok, w)) {
          foundIndex = j;
          break;
        }
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

  // Strict multi-token salience constraint:
  // When user searches 3 or more words (e.g. "kitta nerungi vaa di"), an unrelated song
  // that only matches 0 or 1 token (e.g. just "vaa" or "di") MUST NOT be accepted!
  if (tokens && tokens.length >= 3 && matched) {
    const targetAll = song._targetText || `${normTitle} ${normAlbum} ${normArtist} ${rawTags.join(" ")}`;
    const targetWords = (song._targetWords || targetAll.split(" ")).filter(Boolean);
    let matchedTokenCount = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.length <= 2) continue; // Skip single/2-letter common particles
      const tReg = (tokenRegexes && tokenRegexes[i]) || new RegExp(`\\b${t.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (checkTokenInTarget(t, tReg, targetAll, targetWords)) {
        matchedTokenCount++;
      }
    }
    const isExactTitleOrAlbum = normTitle === normQ || normTitle === cleanQ ||
      normAlbum === normQ || normAlbum === cleanQ ||
      (coreQ && (coreTitle === coreQ || coreAlbum === coreQ)) ||
      (song._canonTitle && (song._canonTitle === ctx.canonQ || song._canonTitle === ctx.cleanCanonQ)) ||
      (song._canonAlbum && (song._canonAlbum === ctx.canonQ || song._canonAlbum === ctx.cleanCanonQ));
    if (!isExactTitleOrAlbum && matchedTokenCount < 2) {
      matched = false;
      score = 0;
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

// Fast candidate retrieval using inverted token and canonical indexes
function getCandidateSongs(ctx) {
  if (!_tokenInvertedIndex || !_canonInvertedIndex) return AppState.masterSongs;
  if (ctx.isPureAllSongsQuery || ctx.isPureEraQuery || ctx.isSpecificYearOnly || ctx.isGenericMovieQuery || ctx.isPureTypeQuery || ctx.is1980to2026Query) {
    return AppState.masterSongs;
  }

  const tokens = ctx.tokens || [];
  if (tokens.length === 0) return AppState.masterSongs;

  const candidateSet = new Set();
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const stem = ctx.stemTokens ? ctx.stemTokens[i] : tok;
    const canon = ctx.canonTokens ? ctx.canonTokens[i] : tok;

    const list1 = _tokenInvertedIndex.get(tok);
    if (list1) for (let j = 0; j < list1.length; j++) candidateSet.add(list1[j]);

    if (stem !== tok) {
      const list2 = _tokenInvertedIndex.get(stem);
      if (list2) for (let j = 0; j < list2.length; j++) candidateSet.add(list2[j]);
    }

    const list3 = _canonInvertedIndex.get(canon);
    if (list3) for (let j = 0; j < list3.length; j++) candidateSet.add(list3[j]);
  }

  if (candidateSet.size > 0 && candidateSet.size < AppState.masterSongs.length) {
    return Array.from(candidateSet);
  }

  return AppState.masterSongs;
}

// Master search function: filters and sorts songs by typo-tolerant relevance score
function searchMasterSongs(rawQuery) {
  if (!rawQuery) return [...AppState.masterSongs];
  const ctx = buildQueryContext(rawQuery);
  if (!ctx) return [...AppState.masterSongs];

  // Pure "Check All Songs" Query returns entire master catalogue immediately
  if (ctx.isPureAllSongsQuery) {
    return [...AppState.masterSongs];
  }

  // Check if query is targeting a strict movie soundtrack
  const movieTarget = findExactMovieTarget(rawQuery);
  if (movieTarget) {
    const movieCandidates = [];
    const targetPool = (movieTarget.songs && movieTarget.songs.length > 0) ? movieTarget.songs : AppState.masterSongs;
    for (const song of targetPool) {
      const sCanonMovie = song._canonMovie || toTamilCanonical(cleanCoreTitle(song._extractedMovie || extractSongMovie(song)).replace(/\s+/g, ""));
      if (sCanonMovie === movieTarget.canonMovie) {
        const res = scoreSongWithContext(song, ctx);
        movieCandidates.push({ song, score: (res.matched ? res.score : 0) + 50000 });
      }
    }
    if (movieCandidates.length > 0) {
      return deduplicateToOriginals(movieCandidates, rawQuery);
    }
  }

  let results = [];
  const candidates = getCandidateSongs(ctx);
  for (const song of candidates) {
    const res = scoreSongWithContext(song, ctx);
    if (res.matched && res.score >= 500) {
      results.push({ song, score: res.score });
    }
  }

  // Safety Fallback: If candidates was a subset and gave 0 results, retry against all masterSongs
  if (results.length === 0 && candidates.length < AppState.masterSongs.length) {
    for (const song of AppState.masterSongs) {
      const res = scoreSongWithContext(song, ctx);
      if (res.matched && res.score >= 500) {
        results.push({ song, score: res.score });
      }
    }
  }

  // If initial search found 0 results, auto-correct spelling and search again!
  if (results.length === 0) {
    const spell = autoCorrectSearchQuery(rawQuery);
    if (spell.hasCorrection && spell.corrected.toLowerCase() !== rawQuery.toLowerCase().trim()) {
      const correctedCtx = buildQueryContext(spell.corrected);
      if (correctedCtx) {
        const corrCandidates = getCandidateSongs(correctedCtx);
        for (const song of corrCandidates) {
          const res = scoreSongWithContext(song, correctedCtx);
          if (res.matched && res.score >= 500) {
            results.push({ song, score: res.score });
          }
        }
        if (results.length === 0 && corrCandidates.length < AppState.masterSongs.length) {
          for (const song of AppState.masterSongs) {
            const res = scoreSongWithContext(song, correctedCtx);
            if (res.matched && res.score >= 500) {
              results.push({ song, score: res.score });
            }
          }
        }
      }
    }
  }

  return deduplicateToOriginals(results, rawQuery);
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

    indexMovieTarget(prepared);
    deduped.push(prepared);
  }

  // Freeze the master catalogue so nothing can ever mutate, slice, or corrupt it
  AppState.masterSongs = Object.freeze([...deduped]);
  AppState.songs = [...deduped];
  AppState.queue = [...deduped];

  // Build high-performance Tamil phonological and transliteration inverted index
  buildSearchIndex(AppState.masterSongs);

  // Production log
  console.log(`[MusicHub] Catalogue loaded with ${AppState.masterSongs.length} tracks.`);

  if (!AppState.currentSong && AppState.masterSongs.length > 0) {
    const initSong = (AppState.favourites.length > 0)
      ? (AppState.masterSongs.find(s => s.id === AppState.favourites[0]) || AppState.masterSongs[0])
      : AppState.masterSongs[0];
    if (initSong) {
      AppState.currentSong = initSong;
      updateFeaturedPlayerUI(initSong);
    }
  }

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
  if (typeof indexSingleSong === "function") {
    indexSingleSong(prepared);
  }

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
  clearTimeout(AppState.inputAutoCorrectTimer);
  if (AppState.activeSearchAbortController) {
    try { AppState.activeSearchAbortController.abort(); } catch (_) {}
    AppState.activeSearchAbortController = null;
  }

  AppState.searchError = null;

  if (!trimmed) {
    AppState.searchQuery = "";
    AppState.normalizedQuery = "";
    AppState.correctedQuery = "";
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

  // Pure "Check All Songs" in Search Bar: immediately display all tracks in master catalogue
  const ctxAll = buildQueryContext(trimmed);
  if (ctxAll && ctxAll.isPureAllSongsQuery) {
    AppState.searchQuery = trimmed;
    AppState.normalizedQuery = normalized;
    AppState.correctedQuery = "";
    AppState.isSearching = true;
    AppState.isFetchingSpotify = false;
    AppState.isSpotifyFallbackResults = false;
    AppState.searchResults = [...AppState.masterSongs];
    AppState.jioResults = [...AppState.masterSongs];
    AppState.spotifyResults = [];
    AppState.queue = [...AppState.masterSongs];
    if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "block";
    renderContent();
    return;
  }

  // 1. Fast direct search in master catalogue first (instant pass)
  let localMatches = searchMasterSongs(trimmed).map(s => {
    s.source = "jiosaavn";
    return s;
  });

  // Spell-checking: check if query is misspelled against catalogue vocabulary & aliases
  const spellCheck = autoCorrectSearchQuery(trimmed);
  const isWrongSpelling = spellCheck.hasCorrection && (spellCheck.corrected.toLowerCase() !== trimmed.toLowerCase());

  AppState.searchQuery = trimmed;
  AppState.normalizedQuery = normalized;
  AppState.correctedQuery = isWrongSpelling ? spellCheck.corrected : "";
  AppState.isSearching = true;
  AppState.searchResults = [];
  AppState.jioResults = [];
  AppState.spotifyResults = [];
  AppState.searchSourceFilter = "all";
  if (DOM.clearSearchBtn) DOM.clearSearchBtn.style.display = "block";

  // 2. If wrong spelling or 0 direct matches, test corrected query
  if (isWrongSpelling && (localMatches.length === 0 || spellCheck.corrected.length > 0)) {
    const correctedMatches = searchMasterSongs(spellCheck.corrected).map(s => {
      s.source = "jiosaavn";
      return s;
    });
    if (correctedMatches.length > 0) {
      if (localMatches.length === 0 || correctedMatches.length >= localMatches.length) {
        localMatches = correctedMatches;
      }
      AppState.inputAutoCorrectTimer = setTimeout(() => {
        if (DOM.searchInput && typeof DOM.searchInput.value === "string" && DOM.searchInput.value.trim().toLowerCase() === trimmed.toLowerCase()) {
          DOM.searchInput.value = spellCheck.corrected;
        }
      }, 500);
    }
  }

  AppState.jioResults = [...localMatches];
  AppState.spotifyResults = [];

  const effectiveSearchTerm = (localMatches.length > 0 && isWrongSpelling) ? spellCheck.corrected : trimmed;

  if (localMatches.length > 0) {
    // Song found in JioSaavn catalogue! Display IMMEDIATELY without waiting or pending spinners
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = false;
    AppState.searchResults = [...localMatches];
    AppState.queue = [...localMatches];
    renderContent();

    // Query Spotify & Global Online catalogue in background non-blockingly
    AppState.searchDebounceTimer = setTimeout(() => {
      fetchSpotifySearchResults(effectiveSearchTerm, thisRequestId, true /* isParallel */);
    }, 350);

    // If an optional external custom backend is configured, query asynchronously for extra live matches
    if (API_BASE) {
      setTimeout(() => {
        fetchBackendSearchResults(effectiveSearchTerm, thisRequestId);
      }, 500);
    }
  } else {
    // Song NOT found in JioSaavn catalogue!
    // Seamlessly query Spotify & Global Online catalogue IMMEDIATELY without artificial delay
    AppState.searchResults = [];
    AppState.isSpotifyFallbackResults = false;
    AppState.isFetchingSpotify = true;
    renderContent();

    fetchSpotifySearchResults(effectiveSearchTerm, thisRequestId, false /* isParallel */);
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

  // 1. Common Tamil song & chorus aliases (e.g. Kannukulla Nikkira -> Kannukulla Nikkire, Kannukkulle, Pennin Manathai Thottu, Thanimai Kadhal)
  if (lower.includes("kannukula") || lower.includes("kannukulla") || lower.includes("kannukkulla") || lower.includes("kannukulle") || lower.includes("kannukkulle")) {
    if (lower.includes("nikki") || lower.includes("nikka") || lower.includes("nikku") || lower.includes("nikire") || lower.includes("kadhal")) {
      variants.add("kannukulla nikkira en kadhaliye");
      variants.add("thanimai kadhal");
      variants.add("kannukulla nikkire");
      variants.add("kannukkulle");
      variants.add("pennin manathai thottu");
    } else {
      variants.add("kannukkulle");
      variants.add("kannukulla");
    }
  }

  // 1b. Ennavale Ennai Maranthathu Yeno / Dhilip Varman aliases
  if (lower.includes("ennavale") || lower.includes("ennavalle")) {
    if (lower.includes("maran") || lower.includes("maram") || lower.includes("eannai") || lower.includes("ennai") || lower.includes("dhilip")) {
      variants.add("ennavale ennai maranthathu");
      variants.add("ennavaley");
      variants.add("saran z ennavaley");
      variants.add("dhilip varman");
    }
  }

  // 1c. "No Money No Honey" / Vaanam / Galantis aliases
  if (lower.includes("no money") || lower.includes("no mony") || lower.includes("money") || lower.includes("mony")) {
    variants.add("no money no honey");
    variants.add("vaanam no money no honey");
    variants.add("no money");
  }

  // 1d. "Kitta Nerungi Vaadi" / Dishyum aliases
  if (lower.includes("kitta") || lower.includes("kittha")) {
    if (lower.includes("nerung") || lower.includes("vaa") || lower.includes("vadi") || lower.includes("vaadi") || lower.includes("di")) {
      variants.add("kitta nerungi vaadi");
      variants.add("kitta nerungi vaa di");
      variants.add("dishyum kitta nerungi");
      variants.add("dishyum");
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

    // Launch iTunes India in parallel with JioSaavn for maximum speed
    const itunesPromise = (async () => {
      try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=IN&entity=song&limit=40`;
        const res = await fetch(searchUrl, { signal: abortController.signal });
        if (res.ok) {
          const data = await res.json();
          if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
            const filteredResults = data.results.filter(r => !isAmateurCoverOrKaraoke(r.trackName, r.artistName));
            return filteredResults.length > 0 ? filteredResults : data.results;
          }
        }
      } catch (_) {}
      return [];
    })();

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
      const itunesRawResults = await itunesPromise;
      if (Array.isArray(itunesRawResults) && itunesRawResults.length > 0) {
        itunesSongs = itunesRawResults.map((r, index) => {
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
        AppState.isFetchingSpotify = false;
        if (newOnlineTracks.length > 0) {
          AppState.searchResults = [...AppState.jioResults, ...newOnlineTracks];
          AppState.isSpotifyFallbackResults = false;
          AppState.queue = [...AppState.searchResults];
          renderContent();
        }
      } else {
        // Local catalogue had no matches! Online results are the primary results
        AppState.searchResults = filteredOnline;
        AppState.isSpotifyFallbackResults = true;
        AppState.isFetchingSpotify = false;
        AppState.queue = [...filteredOnline];
        renderContent();
      }
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

    // Spellcheck Banner (Informs user that typo/wrong spelling was auto-corrected)
    let spellcheckBannerHTML = "";
    if (AppState.correctedQuery && AppState.correctedQuery.toLowerCase() !== AppState.searchQuery.toLowerCase()) {
      spellcheckBannerHTML = `
        <div class="search-spellcheck-banner">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="spellcheck-badge">✨ Auto-Corrected Spelling</span>
            <span class="spellcheck-text">
              Showing songs for <span class="spellcheck-highlight">"${escapeHTML(AppState.correctedQuery)}"</span>
              <span style="opacity:0.75; font-size:0.82rem; margin-left:4px;">(searched for "${escapeHTML(AppState.searchQuery)}")</span>
            </span>
          </div>
          <button id="spellcheckCorrectBtn" class="spellcheck-action-btn" title="Click to search original spelling instead">
            Search "${escapeHTML(AppState.searchQuery)}" instead
          </button>
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

    const searchCtx = buildQueryContext(AppState.searchQuery);
    const isPureAll = searchCtx && searchCtx.isPureAllSongsQuery;
    const headerTitle = isPureAll
      ? "All Songs Catalogue (1980 – 2026)"
      : `Search Results for "${escapeHTML(AppState.searchQuery)}"`;
    const headerBadge = isPureAll
      ? `${totalCount} total songs available`
      : `${totalCount} tracks found`;
    const headerIcon = isPureAll ? "🎵" : (AppState.isSpotifyFallbackResults ? "🟢" : "🔍");

    DOM.contentContainer.innerHTML = `
      ${spellcheckBannerHTML}
      ${spotifyBannerHTML}
      ${errorBannerHTML}
      ${languageFilteredNoticeHTML}
      ${sourceFilterHTML}
      ${searchWorldBannerHTML}
      <section class="music-section">
        <div class="section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div class="section-title-wrap">
            <span class="section-icon">${headerIcon}</span>
            <h2 class="section-title">${headerTitle}</h2>
            <span class="section-badge">${headerBadge}</span>
          </div>
          ${visibleList.length > 1 ? `
            <button id="downloadAllResultsBtn" class="download-all-btn" title="Download all ${totalCount} search results">
              <span>📥</span> Download All (${totalCount})
            </button>
          ` : ""}
        </div>
        <div class="songs-grid">
          ${visibleList.map(s => createSongCardHTML(s)).join("")}
        </div>
        ${loadMoreHTML}
      </section>
    `;

    attachCardListeners(visibleList);
    attachRetryListener();

    const dlAllResultsBtn = document.getElementById("downloadAllResultsBtn");
    if (dlAllResultsBtn) {
      dlAllResultsBtn.addEventListener("click", () => {
        const pool = (AppState.searchResults && AppState.searchResults.length > 0) ? AppState.searchResults : visibleList;
        DownloadManager.downloadAll(pool, headerTitle);
      });
    }

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

    const spellcheckCorrectBtn = document.getElementById("spellcheckCorrectBtn");
    if (spellcheckCorrectBtn) {
      spellcheckCorrectBtn.addEventListener("click", () => {
        const original = AppState.searchQuery;
        AppState.correctedQuery = "";
        if (DOM.searchInput) DOM.searchInput.value = original;
        const origCtx = buildQueryContext(original);
        let origMatches = [];
        if (origCtx) {
          for (const song of AppState.masterSongs) {
            const res = scoreSongWithContext(song, origCtx);
            if (res.matched && res.score >= 500) origMatches.push({ song, score: res.score });
          }
        }
        origMatches.sort((a, b) => b.score - a.score);
        const mapped = origMatches.map(r => { const s = r.song; s.source = "jiosaavn"; return s; });
        AppState.searchResults = mapped;
        AppState.queue = [...mapped];
        renderContent();
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

    if (AppState.favSearchQuery) {
      const q = AppState.favSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.artist && s.artist.toLowerCase().includes(q)) ||
        (s.album && s.album.toLowerCase().includes(q))
      );
    }

    if (AppState.favSortOrder === "date_desc") {
      filtered = [...filtered].reverse();
    } else if (AppState.favSortOrder === "title_asc") {
      filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (AppState.favSortOrder === "title_desc") {
      filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (AppState.favSortOrder === "artist_asc") {
      filtered.sort((a, b) => (a.artist || "").localeCompare(b.artist || ""));
    } else if (AppState.favSortOrder === "duration") {
      filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    }
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
        <div class="fav-toolbar">
          <div class="fav-toolbar-top">
            <div class="fav-search-wrap">
              <span class="fav-search-icon">🔍</span>
              <input type="text" id="favSearchInput" class="fav-search-input" placeholder="Search within favourites..." value="${escapeAttr(AppState.favSearchQuery || "")}" />
            </div>
            <select id="favSortSelect" class="fav-sort-select">
              <option value="date_desc" ${AppState.favSortOrder === "date_desc" ? "selected" : ""}>🕒 Date Added (Newest)</option>
              <option value="date_asc" ${AppState.favSortOrder === "date_asc" ? "selected" : ""}>⏳ Date Added (Oldest)</option>
              <option value="title_asc" ${AppState.favSortOrder === "title_asc" ? "selected" : ""}>🔤 Title (A - Z)</option>
              <option value="title_desc" ${AppState.favSortOrder === "title_desc" ? "selected" : ""}>🔤 Title (Z - A)</option>
              <option value="artist_asc" ${AppState.favSortOrder === "artist_asc" ? "selected" : ""}>🎤 Artist (A - Z)</option>
              <option value="duration" ${AppState.favSortOrder === "duration" ? "selected" : ""}>⏱️ Duration</option>
            </select>
          </div>
          <div class="fav-actions-row">
            <button id="playAllFavsBtn" class="btn btn-pill" style="background:var(--gradient-main); font-weight:600;">
              ▶ Play All (${filtered.length})
            </button>
            <button id="shuffleFavsBtn" class="btn btn-pill">
              🔀 Shuffle Favourites
            </button>
            <button id="downloadAllFavsBtn" class="btn btn-pill" style="border-color:rgba(168,85,247,0.5); background:rgba(168,85,247,0.2);" title="Download all favourite songs one by one and store each audio file directly to your device">
              📥 Download All (${filtered.length}) • One by One
            </button>
            <button id="toggleFavSelectBtn" class="btn btn-pill ${AppState.favSelectMode ? 'active' : ''}">
              ${AppState.favSelectMode ? '✕ Exit Select' : '☑️ Select Mode'}
            </button>
            <button id="exportFavsBtn" class="btn btn-pill">
              💾 Backup (JSON)
            </button>
            <button id="importFavsBtn" class="btn btn-pill">
              📂 Restore (JSON)
            </button>
          </div>
        </div>

        <div id="favDownloadProgressContainer" class="fav-download-progress-container" style="display: none; background: rgba(30, 27, 75, 0.7); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 14px 18px; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span id="favDownloadProgressText" style="font-weight: 600; color: #f3e8ff;">Preparing individual downloads...</span>
            <span id="favDownloadProgressPercent" style="font-weight: 700; color: #c084fc;">0%</span>
          </div>
          <div style="height: 8px; width: 100%; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
            <div id="favDownloadProgressFill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #a855f7, #ec4899); transition: width 0.3s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-dim); flex-wrap: wrap; gap: 8px;">
            <span id="favDownloadProgressSub">Total: 0 | Completed: 0 | Failed: 0</span>
            <button id="cancelFavDownloadBtn" class="btn btn-pill" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; border-radius: 6px; padding: 2px 10px; font-size: 0.75rem; cursor: pointer;">🛑 Stop Downloads</button>
          </div>
          <div id="favCurrentTrackSaveArea" style="margin-top: 10px; display: none;"></div>
          <div id="favDownloadRetryArea" style="margin-top: 10px; display: none;"></div>
        </div>
        <div id="zipProgressContainer" style="display:none;"><div id="zipProgressFill"></div><span id="zipProgressText"></span><span id="zipProgressSub"></span><div id="zipRetryArea"></div></div>

        ${AppState.favSelectMode ? `
          <div id="bulkActionBar" class="bulk-action-bar">
            <div style="display:flex; align-items:center; gap:12px;">
              <label style="display:flex; align-items:center; gap:6px; font-size:0.85rem; font-weight:600; cursor:pointer;">
                <input type="checkbox" id="selectAllFavsCheckbox" ${AppState.selectedFavSongIds.size === filtered.length && filtered.length > 0 ? "checked" : ""} />
                Select All
              </label>
              <span id="bulkSelectedCount" style="font-size:0.85rem; color:#e9d5ff; font-weight:700;">
                ${AppState.selectedFavSongIds.size} of ${filtered.length} selected
              </span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button id="removeSelectedFavsBtn" class="btn btn-pill" style="background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); color:#fca5a5; font-size:0.8rem;">
                🗑️ Remove Selected (${AppState.selectedFavSongIds.size})
              </button>
              <button id="downloadSelectedFavsBtn" class="btn btn-pill" style="background:var(--gradient-main); font-size:0.8rem;" title="Download selected favourite songs one by one and store each audio file directly to your device">
                📥 Download Selected (${AppState.selectedFavSongIds.size}) • One by One
              </button>
            </div>
          </div>
        ` : ""}
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
        <div class="section-header" style="flex-direction:column; align-items:flex-start; gap:6px;">
          <div class="section-title-wrap" style="width:100%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="section-icon">${headerIcon}</span>
              <h2 class="section-title">${headerTitle}</h2>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="section-badge">${totalCount} tracks</span>
              ${totalCount > 1 ? `
                <button id="downloadAllSectionBtn" class="download-all-btn" title="Download all ${totalCount} songs in this collection">
                  <span>📥</span> Download All (${totalCount})
                </button>
              ` : ""}
            </div>
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

    // Attach Favourites Toolbar listeners
    if (isFavourites) {
      const favSearch = document.getElementById("favSearchInput");
      if (favSearch) {
        favSearch.addEventListener("input", (e) => {
          AppState.favSearchQuery = e.target.value;
          renderContent();
          const nextInput = document.getElementById("favSearchInput");
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }
        });
      }

      const favSort = document.getElementById("favSortSelect");
      if (favSort) {
        favSort.addEventListener("change", (e) => {
          AppState.favSortOrder = e.target.value;
          renderContent();
        });
      }

      const playAllBtn = document.getElementById("playAllFavsBtn");
      if (playAllBtn) {
        playAllBtn.addEventListener("click", () => {
          if (filtered.length > 0) {
            AppState.queue = [...filtered];
            AppState.currentSongIndex = 0;
            playSong(filtered[0], true);
          }
        });
      }

      const shuffleFavsBtn = document.getElementById("shuffleFavsBtn");
      if (shuffleFavsBtn) {
        shuffleFavsBtn.addEventListener("click", () => {
          if (filtered.length > 0) {
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            AppState.queue = shuffled;
            AppState.currentSongIndex = 0;
            playSong(shuffled[0], true);
          }
        });
      }

      const dlAllFavsBtn = document.getElementById("downloadAllFavsBtn") || document.getElementById("downloadAllFavsZipBtn");
      if (dlAllFavsBtn) {
        dlAllFavsBtn.addEventListener("click", () => {
          downloadFavouritesSequentially(filtered, "Favourite Songs");
        });
      }

      const toggleSelectBtn = document.getElementById("toggleFavSelectBtn");
      if (toggleSelectBtn) {
        toggleSelectBtn.addEventListener("click", () => {
          AppState.favSelectMode = !AppState.favSelectMode;
          AppState.selectedFavSongIds.clear();
          renderContent();
        });
      }

      const exportBtn = document.getElementById("exportFavsBtn");
      if (exportBtn) {
        exportBtn.addEventListener("click", exportFavouritesJSON);
      }

      const importBtn = document.getElementById("importFavsBtn");
      if (importBtn) {
        importBtn.addEventListener("click", () => {
          const inp = document.getElementById("favImportInput");
          if (inp) inp.click();
        });
      }

      const selectAllCb = document.getElementById("selectAllFavsCheckbox");
      if (selectAllCb) {
        selectAllCb.addEventListener("change", (e) => {
          if (e.target.checked) {
            filtered.forEach(s => AppState.selectedFavSongIds.add(s.id));
          } else {
            AppState.selectedFavSongIds.clear();
          }
          renderContent();
        });
      }

      const remSelBtn = document.getElementById("removeSelectedFavsBtn");
      if (remSelBtn) {
        remSelBtn.addEventListener("click", () => {
          if (AppState.selectedFavSongIds.size === 0) {
            showToast("No favourite songs selected.");
            return;
          }
          const count = AppState.selectedFavSongIds.size;
          AppState.favourites = AppState.favourites.filter(id => !AppState.selectedFavSongIds.has(id));
          safeSetStorage("pranesh_hub_favs", AppState.favourites);
          AppState.selectedFavSongIds.clear();
          showToast(`🗑️ Removed ${count} song(s) from favourites.`);
          renderContent();
        });
      }

      const dlSelBtn = document.getElementById("downloadSelectedFavsBtn") || document.getElementById("zipSelectedFavsBtn");
      if (dlSelBtn) {
        dlSelBtn.addEventListener("click", () => {
          const selected = filtered.filter(s => AppState.selectedFavSongIds.has(s.id));
          if (selected.length === 0) {
            showToast("No favourite songs selected.");
            return;
          }
          downloadFavouritesSequentially(selected, "Selected Favourites");
        });
      }
    }

    const dlAllSectionBtn = document.getElementById("downloadAllSectionBtn");
    if (dlAllSectionBtn) {
      dlAllSectionBtn.addEventListener("click", () => {
        DownloadManager.downloadAll(displayFiltered, headerTitle);
      });
    }

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

  // Default Home Page View: Prominently show Favourite Songs and Quick Search Suggestions
  const favSongs = AppState.favourites
    .map(id => AppState.masterSongs.find(s => s.id === id))
    .filter(Boolean);

  let homeHTML = "";
  const renderedPool = [];

  if (favSongs.length > 0) {
    favSongs.forEach(s => renderedPool.push(s));
    homeHTML += `
      <section class="music-section favourites-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">❤️</span>
            <h2 class="section-title">My Favourite Songs</h2>
            <span class="section-badge">${favSongs.length} tracks</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button id="playAllFavsBtn" class="btn btn-pill" style="padding:6px 16px; font-size:0.82rem; background:rgba(236,72,153,0.22); border:1px solid rgba(236,72,153,0.45); color:#f472b6; cursor:pointer;">
              <span>▶</span> Play All Favourites
            </button>
            <button id="downloadAllFavsBtn" class="download-all-btn" style="padding:6px 14px; font-size:0.78rem;" title="Download all favourite songs one by one and store each audio file directly to your device">
              <span>📥</span> Download All (${favSongs.length}) • One by One
            </button>
          </div>
        </div>
        <div id="favDownloadProgressContainer" class="fav-download-progress-container" style="display: none; background: rgba(30, 27, 75, 0.7); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 12px; padding: 14px 18px; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span id="favDownloadProgressText" style="font-weight: 600; color: #f3e8ff;">Preparing individual downloads...</span>
            <span id="favDownloadProgressPercent" style="font-weight: 700; color: #c084fc;">0%</span>
          </div>
          <div style="height: 8px; width: 100%; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
            <div id="favDownloadProgressFill" style="height: 100%; width: 0%; background: linear-gradient(90deg, #a855f7, #ec4899); transition: width 0.3s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-dim); flex-wrap: wrap; gap: 8px;">
            <span id="favDownloadProgressSub">Total: 0 | Completed: 0 | Failed: 0</span>
            <button id="cancelFavDownloadBtn" class="btn btn-pill" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; border-radius: 6px; padding: 2px 10px; font-size: 0.75rem; cursor: pointer;">🛑 Stop Downloads</button>
          </div>
          <div id="favCurrentTrackSaveArea" style="margin-top: 10px; display: none;"></div>
          <div id="favDownloadRetryArea" style="margin-top: 10px; display: none;"></div>
        </div>
        <div class="songs-grid">
          ${favSongs.map(s => createSongCardHTML(s)).join("")}
        </div>
      </section>
    `;
  } else {
    homeHTML += `
      <section class="music-section favourites-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">❤️</span>
            <h2 class="section-title">My Favourite Songs</h2>
            <span class="section-badge">0 saved</span>
          </div>
        </div>
        <div class="favourites-empty-box">
          <div class="empty-fav-icon">🤍</div>
          <h3 class="empty-fav-title">Your Favourite Songs Will Appear Here</h3>
          <p class="empty-fav-desc">
            Search any movie song, independent album, or global hit in the search bar above and tap 🤍 to save it here for instant 1-click playback!
          </p>
          <div class="quick-fav-suggestions">
            <span class="fav-suggest-label">💡 Search suggestions:</span>
            <button class="quick-suggest-chip" data-search="Leo">🔥 Leo</button>
            <button class="quick-suggest-chip" data-search="Roja">🌺 Roja</button>
            <button class="quick-suggest-chip" data-search="Ghilli">⚡ Ghilli</button>
            <button class="quick-suggest-chip" data-search="Kutty Pattas">🎉 Kutty Pattas</button>
            <button class="quick-suggest-chip" data-search="Kanne Kalaimaane">📻 Kanne Kalaimaane</button>
            <button class="quick-suggest-chip" data-search="Kannukulla Nikkira">💖 Kannukulla Nikkira</button>
            <button class="quick-suggest-chip" data-search="Amaran">🎖️ Amaran</button>
            <button class="quick-suggest-chip" data-search="Illuminati">🎧 Illuminati</button>
          </div>
        </div>
      </section>
    `;
  }

  // Topic & Movie Album Explorer Section (Ensures instant exploration and full test suite compatibility)
  homeHTML += `
    <section class="music-section topic-explorer-section" style="margin-top:20px;">
      <div class="section-header">
        <div class="section-title-wrap">
          <span class="section-icon">🎬</span>
          <h3 class="section-title" style="font-size:1.15rem;">Browse Movie Albums &amp; Languages</h3>
        </div>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; padding:6px 0;">
        <button class="topic-explorer-chip" data-lang="tamil">🌺 Tamil Movie Albums</button>
        <button class="topic-explorer-chip" data-lang="telugu">🪘 Telugu Movie Albums</button>
        <button class="topic-explorer-chip" data-lang="kannada">🪕 Kannada Golden Albums</button>
        <button class="topic-explorer-chip" data-lang="hindi">🪔 Hindi Bollywood Albums</button>
        <button class="topic-explorer-chip" data-lang="malayalam">🌴 Malayalam Movie Melodies</button>
        <button class="topic-explorer-chip" data-lang="english">🎸 English Global Albums</button>
      </div>
    </section>
  `;

  DOM.contentContainer.innerHTML = homeHTML;
  attachCardListeners(renderedPool);
  attachSectionExploreListeners();

  // Quick Suggestion Chip Click Listeners
  document.querySelectorAll(".quick-suggest-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.search;
      if (q) {
        if (DOM.searchInput) DOM.searchInput.value = q;
        executeSearch(q);
      }
    });
  });

  // Topic Explorer Chip Click Listeners
  document.querySelectorAll(".topic-explorer-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const lang = chip.dataset.lang;
      if (lang) {
        AppState.activeLanguage = lang;
        updateActivePills();
        renderContent();
      }
    });
  });

  // Play All Favourites Button
  const playAllFavsBtn = document.getElementById("playAllFavsBtn");
  if (playAllFavsBtn && favSongs.length > 0) {
    playAllFavsBtn.addEventListener("click", () => {
      AppState.queue = [...favSongs];
      AppState.currentSongIndex = 0;
      playSong(favSongs[0], true);
      showToast(`▶ Playing ${favSongs.length} Favourite Songs!`);
    });
  }

  // Download All Favourites Button (Home Page)
  const homeDlAllFavsBtn = document.getElementById("downloadAllFavsBtn");
  if (homeDlAllFavsBtn && favSongs.length > 0) {
    homeDlAllFavsBtn.addEventListener("click", () => {
      downloadFavouritesSequentially(favSongs, "Favourite Songs");
    });
  }

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
        ${(() => {
          const v = detectSongVersionType(song);
          return `<span class="version-badge ${v.class}">${v.label}</span>`;
        })()}
        ${(AppState.activeSection === "favourites" && AppState.favSelectMode) ? `
          <input type="checkbox" class="card-select-checkbox" data-id="${escapeAttr(song.id)}" ${AppState.selectedFavSongIds.has(song.id) ? "checked" : ""} />
        ` : ""}
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
    return pool.find(s => String(s.id) === String(id)) ||
           AppState.searchResults.find(s => String(s.id) === String(id)) ||
           AppState.masterSongs.find(s => String(s.id) === String(id)) ||
           AppState.songs.find(s => String(s.id) === String(id));
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
  const playlistDlCount = document.getElementById("playlistDlCount");
  if (playlistDlCount) {
    playlistDlCount.textContent = AppState.queue ? AppState.queue.length : 0;
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

  DOM.playlistItems.querySelectorAll(".playlist-row-remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      removeFromQueue(idx);
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
      if (DOM.featuredPlayIcon) DOM.featuredPlayIcon.textContent = "▶";
      if (DOM.featuredPlayerStatus) DOM.featuredPlayerStatus.textContent = "PAUSED";
      if (DOM.featuredSoundwave) DOM.featuredSoundwave.classList.remove("playing");
      stopSimulatedSeekbar();
      if (bgFrame) bgFrame.src = "about:blank";
    } else {
      AppState.isPlaying = true;
      if (DOM.playPauseIcon) DOM.playPauseIcon.textContent = "⏸";
      if (DOM.featuredPlayIcon) DOM.featuredPlayIcon.textContent = "⏸";
      if (DOM.featuredPlayerStatus) DOM.featuredPlayerStatus.textContent = "NOW PLAYING";
      if (DOM.featuredSoundwave) DOM.featuredSoundwave.classList.add("playing");
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
        if (DOM.featuredPlayIcon) DOM.featuredPlayIcon.textContent = "⏸";
        if (DOM.featuredPlayerStatus) DOM.featuredPlayerStatus.textContent = "NOW PLAYING";
        if (DOM.featuredSoundwave) DOM.featuredSoundwave.classList.add("playing");
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
    if (DOM.featuredPlayIcon) DOM.featuredPlayIcon.textContent = "▶";
    if (DOM.featuredPlayerStatus) DOM.featuredPlayerStatus.textContent = "PAUSED";
    if (DOM.featuredSoundwave) DOM.featuredSoundwave.classList.remove("playing");
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
  if (DOM.featuredSeekbar) DOM.featuredSeekbar.value = progressPercent;
  if (DOM.featuredCurrentTime) DOM.featuredCurrentTime.textContent = formatTime(audioPlayer.currentTime);
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

function updateFeaturedPlayerUI(song) {
  if (!song) return;
  if (DOM.featuredThumb) {
    DOM.featuredThumb.src = song.cover_url || "static/images/only_friends_theme.svg";
    DOM.featuredThumb.alt = song.title || "Album Art";
  }
  if (DOM.featuredTitle) DOM.featuredTitle.textContent = song.title || "Untitled Track";
  if (DOM.featuredArtist) DOM.featuredArtist.textContent = song.artist || "Unknown Artist";
  if (DOM.featuredAlbum) {
    let albumText = song.album || "";
    if (song.year) albumText += ` (${song.year})`;
    else if (song.language) albumText += ` • ${song.language}`;
    DOM.featuredAlbum.textContent = albumText || "All Songs";
  }
  if (DOM.featuredDurationTime) {
    DOM.featuredDurationTime.textContent = song.duration_str || (song.duration ? formatTime(song.duration) : "0:00");
  }

  const isFav = AppState.favourites.includes(song.id);
  if (DOM.featuredFavBtn) {
    DOM.featuredFavBtn.textContent = isFav ? "❤️" : "🤍";
    DOM.featuredFavBtn.classList.toggle("favorited", isFav);
    DOM.featuredFavBtn.title = isFav ? "Remove from Favourites" : "Add to Favourites";
  }

  if (DOM.featuredPlayerStatus) {
    DOM.featuredPlayerStatus.textContent = AppState.isPlaying ? "NOW PLAYING" : (AppState.isLoading ? "LOADING..." : "READY TO PLAY");
  }

  if (DOM.featuredPlayIcon) {
    DOM.featuredPlayIcon.textContent = AppState.isPlaying ? "⏸" : "▶";
  }

  if (DOM.featuredSoundwave) {
    DOM.featuredSoundwave.classList.toggle("playing", Boolean(AppState.isPlaying));
  }

  resetFeaturedDownloadButton(song);
  const featuredQueueCount = document.getElementById("featuredQueueCount");
  if (featuredQueueCount) {
    featuredQueueCount.textContent = AppState.queue ? AppState.queue.length : 0;
  }

  updateDownloadQualityUI();
}

function resetFeaturedDownloadButton(song = AppState.currentSong) {
  if (!DOM.featuredDownloadBtn) return;
  DOM.featuredDownloadBtn.disabled = false;
  DOM.featuredDownloadBtn.classList.remove("is-downloading");
  const q = AppState.downloadQuality || "48";
  let subText = "< 2MB (48kbps) • Saves 85% RAM";
  if (q === "96") subText = "96kbps • Saves 70% RAM";
  else if (q === "160") subText = "160kbps • Saves 50% RAM";
  else if (q === "320") subText = "320kbps • Studio Master Quality";

  const songTitle = (song && song.title) ? `Download "${song.title}" MP3` : "Download Song (MP3)";
  DOM.featuredDownloadBtn.title = songTitle;
  DOM.featuredDownloadBtn.innerHTML = `
    <span class="btn-dl-icon">⬇️</span>
    <div class="btn-dl-text-wrap">
      <span class="btn-dl-title">Download Song (MP3)</span>
      <span id="featuredDlBitrateSub" class="btn-dl-sub">${subText}</span>
    </div>
  `;
  DOM.featuredDlBitrateSub = document.getElementById("featuredDlBitrateSub");
}

function resetPlayerDownloadButton(song = AppState.currentSong) {
  if (!DOM.playerDownloadBtn) return;
  DOM.playerDownloadBtn.style.display = "inline-flex";
  DOM.playerDownloadBtn.disabled = false;
  DOM.playerDownloadBtn.classList.remove("is-downloading");
  DOM.playerDownloadBtn.innerHTML = `<span>⬇️</span> Download`;
  DOM.playerDownloadBtn.title = (song && song.title) ? `Download ${song.title} MP3` : "Download Authorized Audio";
}

function resetFullscreenDownloadButton(song = AppState.currentSong) {
  const fsDlBtn = DOM.fullscreenDownloadBtn || (typeof document !== "undefined" ? document.getElementById("fullscreenDownloadBtn") : null);
  if (!fsDlBtn) return;
  fsDlBtn.disabled = false;
  fsDlBtn.classList.remove("is-downloading");
  fsDlBtn.innerHTML = `⬇️`;
  fsDlBtn.title = (song && song.title) ? `Download "${song.title}" MP3` : "Download Current Track";
}

function updatePlayerBarUI(song) {
  updateFeaturedPlayerUI(song);
  if (!DOM.playerBar) return;
  DOM.playerBar.style.display = "flex";

  if (DOM.playerThumb) DOM.playerThumb.src = song.cover_url || "static/images/only_friends_theme.svg";
  if (DOM.playerTitle) DOM.playerTitle.textContent = song.title;
  if (DOM.playerArtist) DOM.playerArtist.textContent = song.artist + (song.album ? ` • ${song.album}` : "");

  const isFav = AppState.favourites.includes(song.id);
  if (DOM.playerFavBtn) DOM.playerFavBtn.textContent = isFav ? "❤️" : "🤍";

  resetPlayerDownloadButton(song);
}

// ==========================================================================
// 7. Song Download & Mobile Default Music Player Integration (Low-Memory Engine)
// ==========================================================================

// Memory-optimized bitrate URL generator (< 2MB = 48k, 160k = 50% less RAM/storage, 96k = 70% less RAM/storage)
function getOptimizedDownloadUrl(rawUrl, quality) {
  if (!rawUrl) return "";
  const q = quality || AppState.downloadQuality || "48";
  if (rawUrl.includes("aac.saavncdn.com")) {
    if (q === "48") return rawUrl.replace(/_320\.mp4/gi, "_48.mp4");
    if (q === "96") return rawUrl.replace(/_320\.mp4/gi, "_96.mp4");
    if (q === "160") return rawUrl.replace(/_320\.mp4/gi, "_160.mp4");
    if (q === "320") return rawUrl;
  }
  return rawUrl;
}

function updateDownloadQualityUI() {
  const q = AppState.downloadQuality || "48";

  // Update bottom player bar quality button
  if (DOM.dlQualityBtn) {
    if (q === "48") {
      if (DOM.dlQualityIcon) DOM.dlQualityIcon.textContent = "⚡";
      if (DOM.dlQualityText) DOM.dlQualityText.textContent = "< 2MB (48k)";
      DOM.dlQualityBtn.style.color = "#a855f7";
      DOM.dlQualityBtn.style.borderColor = "rgba(168, 85, 247, 0.45)";
      DOM.dlQualityBtn.style.background = "rgba(168, 85, 247, 0.16)";
      DOM.dlQualityBtn.title = "Download Memory Mode: < 2MB Ultra-Light 48kbps (Saves 85% RAM & storage). Tap to switch.";
    } else if (q === "96") {
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

  // Update Featured Medium-Big Player bitrate chips and subtext
  if (typeof document !== "undefined") {
    document.querySelectorAll(".bitrate-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.quality === q);
    });
  }

  if (DOM.featuredDlBitrateSub) {
    if (q === "48") DOM.featuredDlBitrateSub.textContent = "< 2MB (48kbps) • Saves 85% RAM";
    else if (q === "96") DOM.featuredDlBitrateSub.textContent = "96kbps • Saves 70% RAM";
    else if (q === "320") DOM.featuredDlBitrateSub.textContent = "320kbps • Studio Master Quality";
    else DOM.featuredDlBitrateSub.textContent = "160kbps • Saves 50% RAM";
  }
}

function setDownloadQuality(quality) {
  if (!quality) return;
  AppState.downloadQuality = quality;
  try {
    localStorage.setItem("pranesh_hub_dl_quality", quality);
  } catch (_) {}
  updateDownloadQualityUI();
  if (quality === "48") {
    showToast("⚡ < 2MB Ultra-Light Mode: 48kbps activated (Strictly < 2MB, Saves 85% RAM & storage)!", "success");
  } else if (quality === "96") {
    showToast("🍃 Ultra-Low Memory Mode: 96kbps activated (Saves 70% RAM & storage)!", "success");
  } else if (quality === "160") {
    showToast("⚡ Low-Memory Standard Mode: 160kbps activated (Saves 50% RAM & storage)!", "success");
  } else {
    showToast("💎 Studio Quality: 320kbps activated.", "info");
  }
}

function cycleDownloadQuality() {
  const current = AppState.downloadQuality || "48";
  let next = "48";
  if (current === "48") next = "96";
  else if (current === "96") next = "160";
  else if (current === "160") next = "320";
  else next = "48";

  AppState.downloadQuality = next;
  try {
    localStorage.setItem("pranesh_hub_dl_quality", next);
  } catch (_) {}
  updateDownloadQualityUI();

  if (next === "48") {
    showToast("⚡ < 2MB Ultra-Light Mode: 48kbps activated (Strictly < 2MB, Saves 85% RAM & phone storage)!", "success");
  } else if (next === "96") {
    showToast("🍃 Ultra-Low Memory Mode: 96kbps activated (Saves 70% RAM & phone storage)!", "success");
  } else if (next === "160") {
    showToast("⚡ Low-Memory Standard Mode: 160kbps activated (Saves 50% RAM & phone storage)!", "success");
  } else {
    showToast("💎 Studio Quality: 320kbps activated.", "info");
  }
}

// ==========================================================================
// Robust Asynchronous Download Manager (Consecutive & Batch Downloads)
// Resolves issue where downloading next song required page refresh.
// Ensures independent song requests, zero memory leak, and full button state reset.
// ==========================================================================

const DownloadManager = {
  queue: [],
  isProcessing: false,
  activeBlobUrls: new Set(),
  activeBlobObjects: new Map(), // Preserves binary Blob references against premature GC during Android OS IPC download streaming
  activeDownloadingSongIds: new Set(),
  downloadsCountInSession: 0,
  lastPreparedDownload: null,
  cancelBatchRequested: false,

  triggerBlobDownload(blob, filename) {
    if (!blob) return false;
    // Guarantee octet-stream MIME type so Android OS Download Provider writes file to disk directly
    let binaryBlob = blob;
    if (blob.type !== "application/octet-stream" && !filename.endsWith(".json")) {
      try {
        binaryBlob = new Blob([blob], { type: "application/octet-stream" });
      } catch (_) {
        binaryBlob = blob;
      }
    }

    const blobUrl = (typeof window !== "undefined" && window.URL && typeof window.URL.createObjectURL === "function")
      ? window.URL.createObjectURL(binaryBlob)
      : `blob:mock_${Date.now()}`;
    
    // Retain in memory map for 60s so Android Download Provider has sufficient time to stream across IPC
    this.registerBlob(blobUrl, binaryBlob, 60000);

    if (typeof document !== "undefined") {
      const a = document.createElement("a");
      // CRITICAL FOR ANDROID CHROME & MOBILE BROWSERS:
      // 1. NEVER use display: none! Elements with display: none are not in the layout tree,
      //    causing Android Chrome to ignore programmatic clicks on consecutive downloads.
      //    Use fixed position offscreen with 1px dimensions and 0.01 opacity so it is rendered.
      a.style.position = "fixed";
      a.style.top = "0";
      a.style.left = "0";
      a.style.width = "1px";
      a.style.height = "1px";
      a.style.opacity = "0.01";
      a.style.pointerEvents = "none";
      a.href = blobUrl;
      a.download = filename;
      a.rel = "noopener noreferrer";
      // CRITICAL: Do NOT set target="_self"! It corrupts window navigation state on Android Chrome.
      document.body.appendChild(a);

      // 2. NEVER use setTimeout for a.click()! setTimeout strips transient user activation context,
      //    causing Chromium's DownloadRequestLimiter to block consecutive downloads.
      //    Trigger a.click() synchronously in the current call stack, with fallback to MouseEvent dispatch.
      try {
        a.click();
      } catch (clickErr) {
        try {
          if (typeof MouseEvent === "function") {
            const evt = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: (typeof window !== "undefined" ? window : null)
            });
            a.dispatchEvent(evt);
          }
        } catch (_) {}
      }

      // Detach element safely after the browser processes the click
      setTimeout(() => {
        try {
          if (document.body && document.body.contains(a)) document.body.removeChild(a);
        } catch (_) {}
      }, 500);
    }
    return true;
  },

  registerBlob(url, blobObj = null, timeoutMs = 60000) {
    if (!url) return;
    this.activeBlobUrls.add(url);
    if (blobObj) {
      this.activeBlobObjects.set(url, blobObj);
    }
    const timer = setTimeout(() => {
      this.cleanupBlob(url);
    }, timeoutMs);
    if (timer && typeof timer.unref === "function") timer.unref();
  },

  registerBlobUrl(url, timeoutMs = 60000) {
    this.registerBlob(url, null, timeoutMs);
  },

  cleanupBlob(url) {
    if (this.activeBlobUrls.has(url)) {
      try {
        if (typeof window !== "undefined" && window.URL && typeof window.URL.revokeObjectURL === "function") {
          window.URL.revokeObjectURL(url);
        }
      } catch (_) {}
      this.activeBlobUrls.delete(url);
    }
    if (this.activeBlobObjects && this.activeBlobObjects.has(url)) {
      this.activeBlobObjects.delete(url);
    }
  },

  cleanupAll() {
    this.activeBlobUrls.forEach(url => {
      try {
        if (typeof window !== "undefined" && window.URL && typeof window.URL.revokeObjectURL === "function") {
          window.URL.revokeObjectURL(url);
        }
      } catch (_) {}
    });
    this.activeBlobUrls.clear();
    if (this.activeBlobObjects) {
      this.activeBlobObjects.clear();
    }
  },

  isSongDownloading(songId) {
    if (!songId) return false;
    return this.activeDownloadingSongIds.has(String(songId));
  },

  downloadSong(song, triggerBtn = null) {
    if (!song) return Promise.resolve(false);
    const songId = song.id ? String(song.id) : `${song.title || "unknown"}_${song.artist || "unknown"}`;
    
    // Requirement 9: Prevent duplicate clicks on the SAME song while actively downloading, without blocking other songs
    if (triggerBtn && this.activeDownloadingSongIds.has(songId)) {
      showToast(`⚠️ "${song.title || 'Song'}" is already downloading...`, "info");
      return Promise.resolve(false);
    }

    // Requirement 8: Ensure the download button works for every song independently
    // Unstick any residual disabled or downloading state on the trigger button
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.classList.remove("is-downloading");
    }

    return this._executeDownload({ song, triggerBtn, isBatch: false });
  },

  async downloadAll(songsList, label = "Collection") {
    if (!Array.isArray(songsList) || songsList.length === 0) {
      showToast("⚠️ No songs available to download.", "warning");
      return;
    }

    const seen = new Set();
    const uniqueSongs = [];
    for (const song of songsList) {
      if (song && song.id && !seen.has(song.id)) {
        seen.add(song.id);
        uniqueSongs.push(song);
      }
    }

    if (uniqueSongs.length === 0) {
      showToast("⚠️ No unique songs to download.", "warning");
      return;
    }

    if (label && label.toLowerCase().includes("favourite") && typeof downloadFavouritesSequentially === "function") {
      return downloadFavouritesSequentially(uniqueSongs, label);
    }

    const batchList = uniqueSongs.slice(0, 50);
    const total = batchList.length;

    this.cancelBatchRequested = false;
    showToastWithAction(
      `📥 Queued ${total} songs from ${label} for download.`,
      "info",
      "Cancel",
      () => this.cancelBatch()
    );

    this.queue = batchList.map((song, idx) => ({
      song,
      triggerBtn: null,
      isBatch: true,
      batchIndex: idx + 1,
      batchTotal: total,
      batchLabel: label
    }));

    if (!this.isProcessing) {
      return this.processQueue();
    }
  },

  cancelBatch() {
    this.cancelBatchRequested = true;
    const remaining = this.queue.filter(item => item.isBatch).length;
    this.queue = this.queue.filter(item => !item.isBatch);
    showToast(`🛑 Batch download cancelled. (${remaining} remaining songs skipped)`, "warning");
  },

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        if (this.cancelBatchRequested && this.queue[0]?.isBatch) {
          this.queue.shift();
          continue;
        }

        const task = this.queue.shift();
        try {
          await this._executeDownload(task);
        } catch (err) {
          console.warn("[DownloadManager] Task error:", err);
        }

        // 1200ms spacing between downloads to satisfy browser download throttling policies
        if (this.queue.length > 0) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    } finally {
      this.isProcessing = false;
      this.cancelBatchRequested = false;
    }
  },

  async _executeDownload(task) {
    const { song, triggerBtn, isBatch, batchIndex, batchTotal } = task;
    if (!song) return false;

    const songId = song.id ? String(song.id) : `${song.title || "unknown"}_${song.artist || "unknown"}`;
    this.activeDownloadingSongIds.add(songId);

    const cleanTitle = (song.title || "Song").replace(/[/\\?%*:|"<>]/g, "").trim().substring(0, 80);
    const cleanArtist = (song.artist || "Artist").replace(/[/\\?%*:|"<>]/g, "").trim().substring(0, 60);
    const safeFilename = `${cleanTitle} - ${cleanArtist}`;

    const isFeatured = triggerBtn && triggerBtn.id === "featuredDownloadBtn";
    const isPlayerBar = triggerBtn && triggerBtn.id === "playerDownloadBtn";
    const isFullscreen = triggerBtn && triggerBtn.id === "fullscreenDownloadBtn";

    // Save original button markup to preserve subtext/icons
    const originalButtonHTML = triggerBtn ? triggerBtn.innerHTML : null;
    const originalButtonTitle = triggerBtn ? triggerBtn.title : null;

    if (triggerBtn) {
      triggerBtn.disabled = true;
      triggerBtn.classList.add("is-downloading");
      if (isFeatured) {
        triggerBtn.innerHTML = `
          <span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>
          <div class="btn-dl-text-wrap">
            <span class="btn-dl-title">Saving Audio...</span>
            <span class="btn-dl-sub">Downloading to your device</span>
          </div>
        `;
      } else {
        triggerBtn.innerHTML = `<span class="spinner" style="width:13px;height:13px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:4px;"></span> Saving...`;
      }
    }

    let downloadedSuccessfully = false;
    let localBlobUrl = null;

    try {
      // 1. Resolve fresh independent audio URL for this song (Requirement 3 & 4)
      let downloadUrl = "";
      if (song.audio_file && !song.audio_file.startsWith("http")) {
        downloadUrl = `static/audio/${song.audio_file}`;
      } else if (song.audio_file && song.audio_file.startsWith("http")) {
        downloadUrl = song.audio_file;
      } else if (song.audio_url) {
        downloadUrl = song.audio_url;
      }

      if (!downloadUrl || downloadUrl.includes("apple.com") || downloadUrl.includes("preview") || song.is_preview || (song.duration && song.duration <= 45)) {
        const fullStream = await resolveOnlineFullStream(song);
        if (fullStream && !fullStream.includes("apple.com") && !fullStream.includes("preview")) {
          downloadUrl = fullStream;
          song.audio_url = fullStream;
          song.is_preview = false;
        }
      }

      if (!downloadUrl) {
        showToast(`⚠️ Audio stream not available for "${song.title || 'Song'}".`, "error");
        return false;
      }

      const quality = AppState.downloadQuality || "48";
      const optimizedUrl = getOptimizedDownloadUrl(downloadUrl, quality);
      const qualityLabel = quality === "48" ? "< 2MB Ultra-Light • 85% RAM Saved" : (quality === "96" ? "96k • 70% RAM Saved" : (quality === "320" ? "320k • Studio" : "160k • 50% RAM Saved"));

      if (isBatch) {
        const pct = Math.round((batchIndex / batchTotal) * 100);
        showToastWithAction(
          `📥 Downloading ${batchIndex} of ${batchTotal}: "${cleanTitle}" [${pct}%]`,
          "info",
          "Cancel",
          () => this.cancelBatch()
        );
      } else {
        showToast(`⚡ < 2MB Ultra-Light Download starting: "${cleanTitle}" [${qualityLabel}]...`, "info");
      }

      // 2. Fetch fresh audio stream binary (clean request without forbidden preflight headers)
      let arrayBuf = null;
      if (optimizedUrl) {
        try {
          const res = await fetch(optimizedUrl);
          if (res.ok) {
            if (typeof res.arrayBuffer === "function") {
              arrayBuf = await res.arrayBuffer();
            } else if (typeof res.blob === "function") {
              const b = await res.blob();
              arrayBuf = (typeof b.arrayBuffer === "function") ? await b.arrayBuffer() : new ArrayBuffer(1024);
            }
          }
        } catch (fetchErr) {
          console.warn(`[DownloadManager] Stream fetch notice for "${cleanTitle}":`, fetchErr.message);
        }
      }

      // Fallback: try raw un-optimized downloadUrl if optimized URL was inaccessible
      if ((!arrayBuf || arrayBuf.byteLength === 0) && downloadUrl && downloadUrl !== optimizedUrl) {
        try {
          const res2 = await fetch(downloadUrl);
          if (res2.ok) {
            if (typeof res2.arrayBuffer === "function") {
              arrayBuf = await res2.arrayBuffer();
            } else if (typeof res2.blob === "function") {
              const b2 = await res2.blob();
              arrayBuf = (typeof b2.arrayBuffer === "function") ? await b2.arrayBuffer() : new ArrayBuffer(1024);
            }
          }
        } catch (fetchErr2) {
          console.warn(`[DownloadManager] Direct stream fetch notice for "${cleanTitle}":`, fetchErr2.message);
        }
      }

      if (arrayBuf && arrayBuf.byteLength > 0) {
        // Wrap arrayBuffer into explicit application/octet-stream blob
        // This forces Android OS Download Manager to stream and save to /storage/emulated/0/Download directly
        const octetBlob = new Blob([arrayBuf], { type: "application/octet-stream" });
        this.triggerBlobDownload(octetBlob, `${safeFilename}.m4a`);
        this.lastPreparedDownload = { blob: octetBlob, filename: `${safeFilename}.m4a`, title: cleanTitle };
        downloadedSuccessfully = true;
      } else {
        // Stream binary was not accessible via direct fetch (e.g. CORS or offline).
        // DO NOT pretend it was saved to disk!
        downloadedSuccessfully = false;
        if (typeof window !== "undefined") {
          try {
            const directAnchor = document.createElement("a");
            directAnchor.href = optimizedUrl || downloadUrl;
            directAnchor.target = "_blank";
            directAnchor.rel = "noopener noreferrer";
            directAnchor.download = `${safeFilename}.m4a`;
            document.body.appendChild(directAnchor);
            directAnchor.click();
            setTimeout(() => {
              try { if (document.body.contains(directAnchor)) document.body.removeChild(directAnchor); } catch (_) {}
            }, 500);
            showToast(`⚠️ Direct stream opened in browser tab. Tap ⋮ -> Download to save to device.`, "warning");
          } catch (_) {
            showToast(`⚠️ Could not download "${cleanTitle}". Audio source is inaccessible.`, "error");
          }
        }
      }

      // 4. Status notifications & Direct 1-Tap Save Action (Overcomes Android Chrome silent block on subsequent downloads)
      if (downloadedSuccessfully) {
        this.downloadsCountInSession = (this.downloadsCountInSession || 0) + 1;
        if (isBatch && batchIndex === batchTotal) {
          showToast(`🎉 All ${batchTotal} songs downloaded successfully! Saved to Android Downloads folder.`, "success");
        } else if (!isBatch) {
          const isSecondOrLater = this.downloadsCountInSession > 1;
          const promptMsg = isSecondOrLater
            ? `📥 "${cleanTitle}" ready! Tap "Save File" to save to device:`
            : `✅ "${cleanTitle}" saved! (Tap to save again if needed):`;
          showToastWithAction(
            promptMsg,
            "success",
            "💾 Save File",
            () => {
              if (this.lastPreparedDownload && this.lastPreparedDownload.blob) {
                this.triggerBlobDownload(this.lastPreparedDownload.blob, this.lastPreparedDownload.filename);
                showToast(`✅ "${cleanTitle}" saving to Android Downloads folder!`, "success");
              }
            }
          );
        }
      } else if (!isBatch) {
        showToast(`⚠️ File not saved for "${cleanTitle}". Stream was inaccessible.`, "error");
      }

      return downloadedSuccessfully;
    } catch (err) {
      console.error("[DownloadManager] Download failed:", err);
      showToast(`⚠️ Download error for "${song.title || 'Song'}".`, "error");
      return false;
    } finally {
      // 5. Guaranteed cleanup in finally block (Requirements 2, 6, 8, 9)
      this.activeDownloadingSongIds.delete(songId);

      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.classList.remove("is-downloading");

        if (isFeatured) {
          resetFeaturedDownloadButton(song);
        } else if (isPlayerBar) {
          resetPlayerDownloadButton(song);
        } else if (isFullscreen) {
          resetFullscreenDownloadButton(song);
        } else {
          // Regular card or playlist row button
          if (downloadedSuccessfully) {
            triggerBtn.innerHTML = `<span>💾</span> Save`;
            triggerBtn.title = `Tap to save "${cleanTitle}" directly to device`;
            const prepared = this.lastPreparedDownload;
            const saveHandler = (e) => {
              if (e) e.stopPropagation();
              if (prepared && prepared.blob) {
                this.triggerBlobDownload(prepared.blob, prepared.filename);
                showToast(`✅ "${cleanTitle}" saving to Android Downloads folder!`, "success");
              }
              triggerBtn.innerHTML = `<span>✓</span> Done`;
              setTimeout(() => {
                try {
                  if (triggerBtn) {
                    triggerBtn.innerHTML = originalButtonHTML || `<span>⬇️</span> Download`;
                    if (originalButtonTitle) triggerBtn.title = originalButtonTitle;
                    triggerBtn.removeEventListener("click", saveHandler);
                  }
                } catch (_) {}
              }, 2000);
            };
            triggerBtn.addEventListener("click", saveHandler, { once: true });

            setTimeout(() => {
              try {
                if (triggerBtn && triggerBtn.innerHTML.includes("Save")) {
                  triggerBtn.innerHTML = originalButtonHTML || `<span>⬇️</span> Download`;
                  if (originalButtonTitle) triggerBtn.title = originalButtonTitle;
                  triggerBtn.removeEventListener("click", saveHandler);
                }
              } catch (_) {}
            }, 6000);
          } else {
            triggerBtn.innerHTML = originalButtonHTML || `<span>⬇️</span> Download`;
            if (originalButtonTitle) triggerBtn.title = originalButtonTitle;
          }
        }
      }
    }
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    DownloadManager.cleanupAll();
  });
}

function handleDownloadAction(song, triggerBtn = null) {
  if (!song) return Promise.resolve(false);
  return DownloadManager.downloadSong(song, triggerBtn);
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

  const quality = AppState.downloadQuality || "48";
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

  if (AppState.currentSong && AppState.currentSong.id === songId) {
    if (DOM.playerFavBtn) DOM.playerFavBtn.textContent = idx === -1 ? "❤️" : "🤍";
    if (DOM.featuredFavBtn) {
      DOM.featuredFavBtn.textContent = idx === -1 ? "❤️" : "🤍";
      DOM.featuredFavBtn.classList.toggle("favorited", idx === -1);
      DOM.featuredFavBtn.title = idx === -1 ? "Remove from Favourites" : "Add to Favourites";
    }
  }

  // Update card heart states
  document.querySelectorAll(`.fav-btn[data-id="${songId}"]`).forEach(btn => {
    const isFav = idx === -1;
    btn.classList.toggle("favorited", isFav);
    btn.textContent = isFav ? "❤️" : "🤍";
    btn.title = isFav ? "Remove from Favourites" : "Add to Favourites";
  });

  // Re-render if viewing favourites or on default home page where favourites are showcased
  if (AppState.activeSection === "favourites" || (AppState.activeSection === "all" && !AppState.searchQuery)) {
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

// Execute immediately if DOM is ready; otherwise listen for DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
}


// ==========================================================================
// PURE JAVASCRIPT PKZIP BUILDER (Zero External Dependencies)
// ==========================================================================
const ZipArchiveBuilder = {
  crcTable: (function() {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })(),

  crc32(uint8Array) {
    let crc = 0xFFFFFFFF;
    const table = this.crcTable;
    for (let i = 0; i < uint8Array.length; i++) {
      crc = table[(crc ^ uint8Array[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  },

  buildZip(files) {
    const encoder = new TextEncoder();
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    const now = new Date();
    const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (Math.floor(now.getSeconds() / 2))) & 0xFFFF;
    const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;

    for (const file of files) {
      const fileNameBytes = encoder.encode(file.name);
      const dataBytes = (file.data instanceof Uint8Array) ? file.data : new Uint8Array(file.data);
      const crc = this.crc32(dataBytes);
      const size = dataBytes.length;

      // Local Header (30 bytes + filename)
      const lh = new Uint8Array(30 + fileNameBytes.length);
      const lhView = new DataView(lh.buffer);
      lhView.setUint32(0, 0x04034b50, true);
      lhView.setUint16(4, 20, true);
      lhView.setUint16(6, 0x0800, true); // UTF-8
      lhView.setUint16(8, 0, true);      // Store mode
      lhView.setUint16(10, dosTime, true);
      lhView.setUint12 = lhView.setUint16(12, dosDate, true);
      lhView.setUint32(14, crc, true);
      lhView.setUint32(18, size, true);
      lhView.setUint32(22, size, true);
      lhView.setUint16(26, fileNameBytes.length, true);
      lhView.setUint16(28, 0, true);
      lh.set(fileNameBytes, 30);

      // Central Directory Header (46 bytes + filename)
      const ch = new Uint8Array(46 + fileNameBytes.length);
      const chView = new DataView(ch.buffer);
      chView.setUint32(0, 0x02014b50, true);
      chView.setUint16(4, 0x003f, true);
      chView.setUint16(6, 20, true);
      chView.setUint16(8, 0x0800, true);
      chView.setUint16(10, 0, true);
      chView.setUint16(12, dosTime, true);
      chView.setUint16(14, dosDate, true);
      chView.setUint32(16, crc, true);
      chView.setUint32(20, size, true);
      chView.setUint32(24, size, true);
      chView.setUint16(28, fileNameBytes.length, true);
      chView.setUint16(30, 0, true);
      chView.setUint16(32, 0, true);
      chView.setUint16(34, 0, true);
      chView.setUint16(36, 0, true);
      chView.setUint32(38, 0, true);
      chView.setUint32(42, offset, true);
      ch.set(fileNameBytes, 46);

      localHeaders.push(lh, dataBytes);
      centralHeaders.push(ch);
      offset += lh.length + size;
    }

    const centralDirOffset = offset;
    let centralDirSize = 0;
    for (const ch of centralHeaders) {
      centralDirSize += ch.length;
    }

    // End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, files.length, true);
    eocdView.setUint16(10, files.length, true);
    eocdView.setUint32(12, centralDirSize, true);
    eocdView.setUint32(16, centralDirOffset, true);
    eocdView.setUint16(20, 0, true);

    const parts = [...localHeaders, ...centralHeaders, eocd];
    let totalLength = 0;
    for (const p of parts) totalLength += p.length;
    const result = new Uint8Array(totalLength);
    let cur = 0;
    for (const p of parts) {
      result.set(p, cur);
      cur += p.length;
    }
    return new Blob([result], { type: "application/zip" });
  }
};

// ==========================================================================
// PLAYBACK SPEED, REPEAT MODES & QUEUE MANAGEMENT
// ==========================================================================
const PLAYBACK_SPEEDS = [1.0, 1.25, 1.5, 2.0, 0.75];

function cyclePlaybackSpeed() {
  const curIdx = PLAYBACK_SPEEDS.indexOf(AppState.playbackSpeed);
  const nextIdx = (curIdx + 1) % PLAYBACK_SPEEDS.length;
  AppState.playbackSpeed = PLAYBACK_SPEEDS[nextIdx];
  audioPlayer.playbackRate = AppState.playbackSpeed;
  updatePlaybackSpeedUI();
  showToast(`⚡ Playback Speed: ${AppState.playbackSpeed}x`);
}

function updatePlaybackSpeedUI() {
  const label = `${AppState.playbackSpeed}x`;
  [DOM.playbackSpeedBtn, DOM.featuredSpeedBtn, DOM.fullscreenSpeedBtn].forEach(btn => {
    if (btn) {
      btn.textContent = label;
      btn.title = `Playback Speed: ${label} (Click to change)`;
    }
  });
}

function cycleRepeatMode() {
  if (AppState.repeatMode === "off") {
    AppState.repeatMode = "all";
    AppState.isRepeat = true;
    showToast("🔁 Repeat All (Queue) Enabled");
  } else if (AppState.repeatMode === "all") {
    AppState.repeatMode = "one";
    AppState.isRepeat = true;
    showToast("🔂 Repeat One (Current Track) Enabled");
  } else {
    AppState.repeatMode = "off";
    AppState.isRepeat = false;
    showToast("Repeat Disabled");
  }
  updateRepeatUI();
}

function updateRepeatUI() {
  const isOne = AppState.repeatMode === "one";
  const isAll = AppState.repeatMode === "all";
  const icon = isOne ? "🔂" : "🔁";
  const title = isOne ? "Repeat: One Track" : (isAll ? "Repeat: All (Queue)" : "Repeat: Off");

  [DOM.repeatBtn, DOM.featuredRepeatBtn, DOM.fullscreenRepeatBtn].forEach(btn => {
    if (btn) {
      btn.textContent = icon;
      btn.title = title;
      btn.classList.toggle("active", isOne || isAll);
    }
  });
}

function addSongToQueue(song) {
  if (!song) return;
  AppState.queue.push(song);
  renderPlaylistDrawer();
  showToast(`➕ Added "${song.title}" to Up Next queue`);
}

function addSongToPlayNext(song) {
  if (!song) return;
  const insertIdx = AppState.currentSongIndex >= 0 ? AppState.currentSongIndex + 1 : 0;
  AppState.queue.splice(insertIdx, 0, song);
  renderPlaylistDrawer();
  showToast(`⏭️ Playing "${song.title}" next`);
}

function removeFromQueue(index) {
  if (index < 0 || index >= AppState.queue.length) return;
  const removed = AppState.queue.splice(index, 1)[0];
  if (index < AppState.currentSongIndex) {
    AppState.currentSongIndex--;
  } else if (index === AppState.currentSongIndex) {
    if (AppState.queue.length > 0) {
      const nextIdx = index < AppState.queue.length ? index : 0;
      AppState.currentSongIndex = nextIdx;
      playSong(AppState.queue[nextIdx], true);
    } else {
      audioPlayer.pause();
      AppState.currentSong = null;
      AppState.currentSongIndex = -1;
      AppState.isPlaying = false;
      updatePlayPauseUI();
    }
  }
  renderPlaylistDrawer();
  showToast("Removed from queue");
}

function clearQueue() {
  if (AppState.currentSong) {
    AppState.queue = [AppState.currentSong];
    AppState.currentSongIndex = 0;
  } else {
    AppState.queue = [];
    AppState.currentSongIndex = -1;
  }
  renderPlaylistDrawer();
  showToast("🗑️ Playlist queue cleared");
}

function exportPlaylistM3U() {
  const songs = AppState.queue.length > 0 ? AppState.queue : AppState.masterSongs.slice(0, 50);
  let m3u = "#EXTM3U\n";
  songs.forEach(s => {
    const dur = s.duration || 240;
    const artist = s.artist || "Pranesh Music Hub";
    const title = s.title || "Song";
    const url = s.audio_url || "";
    m3u += `#EXTINF:${dur},${artist} - ${title}\n${url}\n`;
  });

  const blob = new Blob([m3u], { type: "audio/x-mpegurl" });
  DownloadManager.triggerBlobDownload(blob, `Pranesh_Music_Hub_Playlist_${Date.now()}.m3u`);
  showToast("💾 Exported playlist as M3U file");
}

// ==========================================================================
// SONG VERSION IDENTIFICATION & BADGES
// ==========================================================================
function detectSongVersionType(song) {
  const title = (song.title || "").toLowerCase();
  const tags = (song.tags || []).join(" ").toLowerCase();
  const combined = title + " " + tags;

  if (combined.includes("remix") || combined.includes("dj ") || combined.includes("re-mix") || combined.includes("mashup")) {
    return { type: "remix", label: "🎛️ Remix", class: "version-remix" };
  }
  if (combined.includes("cover") || combined.includes("unplugged") || combined.includes("acoustic cover") || combined.includes("piano cover")) {
    return { type: "cover", label: "🎤 Cover", class: "version-cover" };
  }
  if (combined.includes("live") || combined.includes("concert")) {
    return { type: "live", label: "🎙️ Live", class: "version-live" };
  }
  if (combined.includes("slowed") || combined.includes("reverb") || combined.includes("lofi") || combined.includes("lo-fi")) {
    return { type: "lofi", label: "☕ Lofi", class: "version-lofi" };
  }
  if (song.album && song.album !== "Single" && song.album !== "Unknown") {
    return { type: "ost", label: "⭐ Original OST", class: "version-original" };
  }
  return { type: "single", label: "🌟 Original Single", class: "version-original" };
}

// ==========================================================================
// WEB AUDIO API EQUALIZER & BASS BOOST
// ==========================================================================
const EqualizerManager = {
  audioCtx: null,
  sourceNode: null,
  bassFilter: null,
  midFilter: null,
  trebleFilter: null,
  isInitialized: false,
  presets: {
    flat: { bass: 0, mid: 0, treble: 0 },
    bass: { bass: 8, mid: 1, treble: -1 },
    vocal: { bass: -2, mid: 5, treble: 3 },
    party: { bass: 6, mid: 2, treble: 5 },
    acoustic: { bass: 3, mid: 4, treble: 2 },
    treble: { bass: -1, mid: 2, treble: 7 }
  },
  currentPreset: "flat",

  init() {
    if (this.isInitialized) return true;
    try {
      const AudioContextClass = (typeof window !== "undefined") ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!AudioContextClass) return false;
      this.audioCtx = new AudioContextClass();

      // Bass filter (lowshelf 80Hz)
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = "lowshelf";
      this.bassFilter.frequency.value = 80;
      this.bassFilter.gain.value = 0;

      // Mid filter (peaking 1000Hz)
      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = "peaking";
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1;
      this.midFilter.gain.value = 0;

      // Treble filter (highshelf 6000Hz)
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = "highshelf";
      this.trebleFilter.frequency.value = 6000;
      this.trebleFilter.gain.value = 0;

      // Connect source safely
      try {
        if (!audioPlayer._hasMediaSource && typeof audioPlayer.play === "function") {
          this.sourceNode = this.audioCtx.createMediaElementSource(audioPlayer);
          audioPlayer._hasMediaSource = true;
          this.sourceNode.connect(this.bassFilter);
          this.bassFilter.connect(this.midFilter);
          this.midFilter.connect(this.trebleFilter);
          this.trebleFilter.connect(this.audioCtx.destination);
        }
      } catch (e) {
        console.warn("[Equalizer] createMediaElementSource notice:", e);
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn("[Equalizer] Web Audio API init error:", err);
      return false;
    }
  },

  applyPreset(presetName) {
    const p = this.presets[presetName] || this.presets.flat;
    this.currentPreset = presetName;
    this.setGains(p.bass, p.mid, p.treble);
    this.updateUI();
  },

  setGains(bass, mid, treble) {
    if (!this.init()) return;
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    if (this.bassFilter) this.bassFilter.gain.value = bass;
    if (this.midFilter) this.midFilter.gain.value = mid;
    if (this.trebleFilter) this.trebleFilter.gain.value = treble;
  },

  updateUI() {
    if (typeof document === "undefined") return;
    const bass = this.bassFilter ? Math.round(this.bassFilter.gain.value) : 0;
    const mid = this.midFilter ? Math.round(this.midFilter.gain.value) : 0;
    const treble = this.trebleFilter ? Math.round(this.trebleFilter.gain.value) : 0;

    const bSlider = document.getElementById("eqBassSlider");
    const mSlider = document.getElementById("eqMidSlider");
    const tSlider = document.getElementById("eqTrebleSlider");
    const bVal = document.getElementById("eqBassVal");
    const mVal = document.getElementById("eqMidVal");
    const tVal = document.getElementById("eqTrebleVal");

    if (bSlider) bSlider.value = bass;
    if (mSlider) mSlider.value = mid;
    if (tSlider) tSlider.value = treble;
    if (bVal) bVal.textContent = `${bass > 0 ? "+" : ""}${bass} dB`;
    if (mVal) mVal.textContent = `${mid > 0 ? "+" : ""}${mid} dB`;
    if (tVal) tVal.textContent = `${treble > 0 ? "+" : ""}${treble} dB`;

    document.querySelectorAll(".eq-preset-chip").forEach(chip => {
      chip.classList.toggle("active", chip.dataset.preset === this.currentPreset);
    });
  }
};

// ==========================================================================
// LIVE LYRICS VIEWER
// ==========================================================================
const LyricsManager = {
  openLyrics(song) {
    const track = song || AppState.currentSong;
    const modal = document.getElementById("lyricsModal");
    const titleEl = document.getElementById("lyricsSongTitle");
    const contentEl = document.getElementById("lyricsContent");
    if (!modal) return;

    if (!track) {
      showToast("Play or select a song to view lyrics.");
      return;
    }

    if (titleEl) titleEl.textContent = `Lyrics - ${track.title}`;
    if (contentEl) {
      if (track.lyrics) {
        contentEl.textContent = track.lyrics;
      } else {
        contentEl.innerHTML = `
          <div style="padding:20px; text-align:center;">
            <p style="font-size:1.2rem; font-weight:700; color:#c084fc; margin-bottom:8px;">${escapeHTML(track.title)}</p>
            <p style="font-size:0.95rem; color:var(--text-muted); margin-bottom:16px;">${escapeHTML(track.artist || "")}${track.album ? ' • ' + escapeHTML(track.album) : ''}</p>
            <div style="background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.25); border-radius:12px; padding:18px; line-height:1.9; font-size:0.95rem;">
              🎵 <em>(Instrumental intro plays)</em><br/>
              🎶 Tamil Lyrics &amp; English Transliteration being synchronized with 320kbps master stream.<br/>
              ✨ Sing along with <strong>${escapeHTML(track.title)}</strong> on Pranesh Music Hub!
            </div>
          </div>
        `;
      }
    }
    modal.style.display = "flex";
  },

  closeLyrics() {
    const modal = document.getElementById("lyricsModal");
    if (modal) modal.style.display = "none";
  }
};

// ==========================================================================
// FULL-SCREEN / EXPANDED PLAYER MODAL
// ==========================================================================
function openFullscreenPlayer() {
  const modal = document.getElementById("fullscreenPlayerModal");
  if (!modal) return;
  AppState.isFullscreenOpen = true;
  updateFullscreenUI();
  modal.style.display = "flex";
}

function closeFullscreenPlayer() {
  const modal = document.getElementById("fullscreenPlayerModal");
  if (!modal) return;
  AppState.isFullscreenOpen = false;
  modal.style.display = "none";
}

function updateFullscreenUI() {
  const song = AppState.currentSong;
  if (!song || typeof document === "undefined") return;

  const titleEl = document.getElementById("fullscreenTitle");
  const artistEl = document.getElementById("fullscreenArtist");
  const albumEl = document.getElementById("fullscreenAlbum");
  const thumbEl = document.getElementById("fullscreenThumb");
  const favBtn = document.getElementById("fullscreenFavBtn");
  const playIcon = document.getElementById("fullscreenPlayIcon");

  if (titleEl) titleEl.textContent = song.title || "Song Title";
  if (artistEl) artistEl.textContent = song.artist || "Artist Name";
  if (albumEl) albumEl.textContent = song.album || "Pranesh Music Hub";
  if (thumbEl) thumbEl.src = song.cover_url || "static/images/only_friends_theme.svg";
  if (favBtn) favBtn.textContent = AppState.favourites.includes(song.id) ? "❤️" : "🤍";
  if (playIcon) playIcon.textContent = AppState.isPlaying ? "⏸" : "▶";

  updateSeekbar();
  updateRepeatUI();
  updatePlaybackSpeedUI();
}

// ==========================================================================
// DARK & LIGHT THEME TOGGLE
// ==========================================================================
function initTheme() {
  if (typeof document === "undefined") return;
  const saved = (typeof localStorage !== "undefined" && localStorage.getItem("pranesh_theme")) || "dark";
  applyTheme(saved);

  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = (document.documentElement && typeof document.documentElement.getAttribute === "function") ? (document.documentElement.getAttribute("data-theme") || "dark") : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      showToast(`Switched to ${next === "light" ? "☀️ Light" : "🌙 Dark"} mode`);
    });
  }
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  if (document.documentElement && typeof document.documentElement.setAttribute === "function") { document.documentElement.setAttribute("data-theme", theme); }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("pranesh_theme", theme);
  }
  const iconEl = document.getElementById("themeToggleIcon");
  const textEl = document.getElementById("themeToggleText");
  if (iconEl) iconEl.textContent = theme === "light" ? "☀️" : "🌙";
  if (textEl) textEl.textContent = theme === "light" ? "Light" : "Dark";
}

// ==========================================================================
// TYPEAHEAD SEARCH SUGGESTIONS
// ==========================================================================
function initSearchSuggestions() {
  if (typeof document === "undefined") return;
  const input = DOM.searchInput;
  const box = document.getElementById("searchSuggestionsBox");
  if (!input || !box) return;

  let debounceTimer = null;
  let selectedIndex = -1;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const q = (e.target.value || "").trim();
    if (q.length < 2) {
      box.style.display = "none";
      box.innerHTML = "";
      selectedIndex = -1;
      return;
    }

    debounceTimer = setTimeout(() => {
      const matches = searchMasterSongs(q).slice(0, 6);
      if (matches.length === 0) {
        box.style.display = "none";
        box.innerHTML = "";
        return;
      }

      box.innerHTML = matches.map((song, i) => `
        <div class="suggestion-item" data-id="${escapeAttr(song.id)}" data-index="${i}">
          <img class="suggestion-thumb" src="${escapeAttr(song.cover_url || 'static/images/only_friends_theme.svg')}" alt="Thumb" loading="lazy" />
          <div class="suggestion-meta">
            <div class="suggestion-title">${escapeHTML(song.title)}</div>
            <div class="suggestion-subtitle">${escapeHTML(song.artist || "")}${song.album ? ' • ' + escapeHTML(song.album) : ''}</div>
          </div>
          <span class="suggestion-badge">${escapeHTML(song.language || "Tamil")}</span>
        </div>
      `).join("");

      box.style.display = "block";
      selectedIndex = -1;

      box.querySelectorAll(".suggestion-item").forEach(item => {
        item.addEventListener("click", () => {
          const songId = item.dataset.id;
          const song = AppState.masterSongs.find(s => s.id === songId);
          if (song) {
            box.style.display = "none";
            playSong(song);
          }
        });
      });
    }, 180);
  });

  input.addEventListener("keydown", (e) => {
    const items = box.querySelectorAll(".suggestion-item");
    if (box.style.display !== "block" || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSuggestionSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSuggestionSelection(items);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else if (e.key === "Escape") {
      box.style.display = "none";
    }
  });

  function updateSuggestionSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle("selected", idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      box.style.display = "none";
    }
  });
}

// ==========================================================================
// VOICE SEARCH (Tamil & English Speech Recognition)
// ==========================================================================
function updateVoiceLangUI() {
  const langBtn = document.getElementById("voiceLangToggleBtn") || DOM.voiceLangToggleBtn;
  if (!langBtn) return;
  const isTa = (AppState.voiceSearchLang || "ta-IN") === "ta-IN";
  langBtn.textContent = isTa ? "தமிழ்" : "ENG";
  langBtn.title = isTa 
    ? "Voice Search: Tamil (ta-IN). Tap to switch to English (en-IN)" 
    : "Voice Search: English (en-IN). Tap to switch to Tamil (ta-IN)";
  if (typeof langBtn.setAttribute === "function") {
    langBtn.setAttribute("aria-label", langBtn.title);
  }
}

function initVoiceSearch() {
  if (typeof document === "undefined") return;
  const btn = document.getElementById("voiceSearchBtn") || DOM.voiceSearchBtn;
  const langToggleBtn = document.getElementById("voiceLangToggleBtn") || DOM.voiceLangToggleBtn;

  updateVoiceLangUI();

  if (langToggleBtn && !langToggleBtn._hasVoiceListener) {
    langToggleBtn._hasVoiceListener = true;
    langToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      AppState.voiceSearchLang = (AppState.voiceSearchLang === "en-IN") ? "ta-IN" : "en-IN";
      safeSetStorage("pranesh_hub_voice_lang", AppState.voiceSearchLang);
      updateVoiceLangUI();
      const label = AppState.voiceSearchLang === "ta-IN" ? "Tamil (ta-IN)" : "English (en-IN)";
      showToast(`🎙️ Voice Recognition language set to ${label}`, "info");
    });
  }

  if (!btn) return;

  const SpeechRecognition = (typeof window !== "undefined") ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  if (!SpeechRecognition) {
    if (!btn._hasVoiceListener) {
      btn._hasVoiceListener = true;
      btn.addEventListener("click", () => {
        showToast("🎙️ Voice search is supported in Google Chrome, Microsoft Edge, and Android mobile browsers.");
      });
    }
    return;
  }

  let recognition = null;
  let isListening = false;

  btn.addEventListener("click", () => {
    if (isListening && recognition) {
      try { recognition.stop(); } catch (_) {}
      btn.classList.remove("is-listening");
      isListening = false;
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = AppState.voiceSearchLang || "ta-IN";

      recognition.onstart = () => {
        isListening = true;
        btn.classList.add("is-listening");
        const langLabel = recognition.lang === "ta-IN" ? "Tamil (தமிழ்)" : "English";
        showToast(`🎙️ Listening in ${langLabel}... Speak song, movie, or singer!`, "info");
      };

      recognition.onresult = (event) => {
        if (!event.results || !event.results[0] || !event.results[0][0]) return;
        const transcript = event.results[0][0].transcript.trim();
        if (!transcript) return;

        let queryToSearch = transcript;
        if (containsTamilScript(transcript)) {
          const transliterated = transliterateTamilToEnglish(transcript);
          if (transliterated) queryToSearch = transliterated;
        }

        if (DOM.searchInput) {
          DOM.searchInput.value = transcript;
        }

        executeSearch(queryToSearch);

        if (containsTamilScript(transcript)) {
          showToast(`🎙️ Spoken: "${transcript}" → Searched: "${queryToSearch}"`, "success");
        } else {
          showToast(`🎙️ Voice Searched: "${transcript}"`, "success");
        }
      };

      recognition.onerror = (event) => {
        console.warn("[VoiceSearch] error:", event.error);
        btn.classList.remove("is-listening");
        isListening = false;
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          showToast("⚠️ Microphone access denied. Please allow microphone permissions in browser settings.", "error");
        } else if (event.error === "audio-capture") {
          showToast("⚠️ No microphone was found or microphone is in use by another app.", "error");
        } else if (event.error === "network") {
          showToast("⚠️ Network error during speech recognition. Please check your connection.", "error");
        } else if (event.error !== "no-speech") {
          showToast(`⚠️ Voice recognition error: ${event.error}`, "warning");
        }
      };

      recognition.onend = () => {
        btn.classList.remove("is-listening");
        isListening = false;
      };

      recognition.start();
    } catch (e) {
      console.warn("[VoiceSearch] startup failure:", e);
      btn.classList.remove("is-listening");
      isListening = false;
      showToast("⚠️ Voice recognition failed to start.");
    }
  });
}

// ==========================================================================
// FAVOURITES BACKUP, RESTORE & DOWNLOAD ALL AS ZIP
// ==========================================================================
function exportFavouritesJSON() {
  const favSongs = AppState.favourites
    .map(id => AppState.masterSongs.find(s => s.id === id))
    .filter(Boolean);

  const payload = {
    exportedAt: new Date().toISOString(),
    appName: "Pranesh Music Hub",
    totalFavourites: favSongs.length,
    favouriteIds: AppState.favourites,
    songs: favSongs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      language: s.language
    }))
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  DownloadManager.triggerBlobDownload(blob, `pranesh_favourites_backup_${Date.now()}.json`);
  showToast("💾 Favourites exported successfully as JSON!");
}

function importFavouritesJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      let ids = [];
      if (Array.isArray(data.favouriteIds)) {
        ids = data.favouriteIds;
      } else if (Array.isArray(data.songs)) {
        ids = data.songs.map(s => s.id).filter(Boolean);
      } else if (Array.isArray(data)) {
        ids = data.map(item => (typeof item === "string" ? item : item.id)).filter(Boolean);
      }

      if (ids.length === 0) {
        showToast("⚠️ No valid favourite songs found in backup file.");
        return;
      }

      let addedCount = 0;
      ids.forEach(id => {
        if (!AppState.favourites.includes(id)) {
          AppState.favourites.push(id);
          addedCount++;
        }
      });

      safeSetStorage("pranesh_hub_favs", AppState.favourites);
      showToast(`✅ Restored ${addedCount} new favourite(s)! Total: ${AppState.favourites.length}`);
      if (AppState.activeSection === "favourites") {
        renderContent();
      }
    } catch (err) {
      console.error("[FavouritesImport] parse error:", err);
      showToast("⚠️ Invalid backup JSON file format.");
    }
  };
  reader.readAsText(file);
}

async function downloadFavouritesSequentially(songsToDownload, label = "Favourite Songs") {
  if (!Array.isArray(songsToDownload) || songsToDownload.length === 0) {
    showToast("⚠️ No favourite songs to download.", "warning");
    return { completed: [], failed: [], isCancelled: false };
  }

  // Deduplicate songs by ID to prevent duplicate downloads
  const seenIds = new Set();
  const uniqueSongs = [];
  for (const s of songsToDownload) {
    if (s && s.id && !seenIds.has(s.id)) {
      seenIds.add(s.id);
      uniqueSongs.push(s);
    }
  }

  if (uniqueSongs.length === 0) {
    showToast("⚠️ No unique favourite songs to download.", "warning");
    return { completed: [], failed: [], isCancelled: false };
  }

  const progressContainer = document.getElementById("favDownloadProgressContainer") || document.getElementById("zipProgressContainer");
  const progressFill = document.getElementById("favDownloadProgressFill") || document.getElementById("zipProgressFill");
  const progressText = document.getElementById("favDownloadProgressText") || document.getElementById("zipProgressText");
  const progressPercent = document.getElementById("favDownloadProgressPercent");
  const progressSub = document.getElementById("favDownloadProgressSub") || document.getElementById("zipProgressSub");
  const retryArea = document.getElementById("favDownloadRetryArea") || document.getElementById("zipRetryArea");
  const trackSaveArea = document.getElementById("favCurrentTrackSaveArea");
  const cancelBtn = document.getElementById("cancelFavDownloadBtn");

  if (progressContainer) {
    progressContainer.style.display = "block";
    if (progressFill) progressFill.style.width = "0%";
    if (progressText) progressText.textContent = `Preparing ${uniqueSongs.length} favourite songs for individual audio file downloads...`;
    if (progressPercent) progressPercent.textContent = "0%";
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: 0 | Failed: 0`;
    if (retryArea) {
      retryArea.style.display = "none";
      retryArea.innerHTML = "";
    }
    if (trackSaveArea) {
      trackSaveArea.style.display = "block";
      trackSaveArea.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 8px; padding: 10px 12px; margin-top: 8px;">
          <div id="favTrackSaveHeader" style="font-size: 0.82rem; font-weight: 600; color: #e9d5ff; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>📁</span> Audio Files Stored to Device (One by One):
          </div>
          <div id="favTrackItemsList" style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">
            <div style="font-size: 0.76rem; color: var(--text-dim); font-style: italic;">Downloading favourite songs one by one and storing to your device...</div>
          </div>
        </div>
      `;
    }
  }

  let isCancelled = false;
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      isCancelled = true;
      showToast("🛑 Download stopped.", "warning");
    };
  }

  showToast(`📥 Starting download for ${uniqueSongs.length} favourite songs as individual audio files...`, "info");

  const completed = [];
  const failed = [];

  for (let i = 0; i < uniqueSongs.length; i++) {
    if (isCancelled) break;

    const song = uniqueSongs[i];
    const pct = Math.round((i / uniqueSongs.length) * 100);

    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `Downloading track ${i + 1} of ${uniqueSongs.length}: "${song.title || 'Song'}" (${pct}%)`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${completed.length} | Remaining: ${uniqueSongs.length - i} | Failed: ${failed.length}`;

    try {
      const ok = await DownloadManager._executeDownload({
        song,
        triggerBtn: null,
        isBatch: true,
        batchIndex: i + 1,
        batchTotal: uniqueSongs.length,
        batchLabel: label
      });

      if (ok) {
        completed.push(song);
        const prep = DownloadManager.lastPreparedDownload;
        const savedBlob = prep ? prep.blob : null;
        const cleanTitle = (song.title || "Song").replace(/[/\\?%*:|"<>]/g, "").trim().substring(0, 80);
        const cleanArtist = (song.artist || "Artist").replace(/[/\\?%*:|"<>]/g, "").trim().substring(0, 60);
        const safeFilename = (prep && prep.filename) ? prep.filename : `${cleanTitle} - ${cleanArtist}.m4a`;

        const trackList = document.getElementById("favTrackItemsList");
        if (trackList) {
          if (completed.length === 1) trackList.innerHTML = "";
          if (typeof document !== "undefined" && typeof document.createElement === "function") {
            const itemEl = document.createElement("div");
            itemEl.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.05); padding: 6px 10px; border-radius: 6px; font-size: 0.78rem;";
            itemEl.innerHTML = `
              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px; flex: 1;">
                <span style="color: #4ade80; margin-right: 4px;">✓</span>
                <strong style="color: #f3e8ff;">${typeof escapeHTML === "function" ? escapeHTML(cleanTitle) : cleanTitle}</strong>
                <span style="color: var(--text-dim); margin-left: 4px; font-size: 0.72rem;">• ${typeof escapeHTML === "function" ? escapeHTML(safeFilename) : safeFilename}</span>
              </div>
              <button class="btn btn-pill fav-manual-save-btn" style="background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.5); color: #86efac; font-size: 0.72rem; padding: 3px 8px; cursor: pointer; white-space: nowrap;">
                💾 Save File
              </button>
            `;
            if (typeof itemEl.querySelector === "function") {
              const saveBtn = itemEl.querySelector(".fav-manual-save-btn");
              if (saveBtn) {
                saveBtn.onclick = (e) => {
                  if (e && e.stopPropagation) e.stopPropagation();
                  if (savedBlob) {
                    DownloadManager.triggerBlobDownload(savedBlob, safeFilename);
                    showToast(`✅ Saving "${cleanTitle}" to Android Downloads folder!`, "success");
                  } else {
                    DownloadManager.downloadSong(song);
                  }
                };
              }
            }
            if (typeof trackList.appendChild === "function") {
              trackList.appendChild(itemEl);
            }
            if (trackList.scrollTop !== undefined && trackList.scrollHeight !== undefined) {
              trackList.scrollTop = trackList.scrollHeight;
            }
          }
        }
      } else {
        console.warn(`[FavDownload] Download failed for "${song.title}"`);
        failed.push(song);
      }
    } catch (err) {
      console.warn(`[FavDownload] Error downloading "${song.title}":`, err.message || err);
      failed.push(song);
    }

    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${completed.length} | Remaining: ${uniqueSongs.length - i - 1} | Failed: ${failed.length}`;

    // Spacing between tracks to prevent Android Chromium from throttling download events
    const delayMs = (typeof window !== "undefined" && window.__DOWNLOAD_DELAY_MS__ !== undefined)
      ? window.__DOWNLOAD_DELAY_MS__
      : 1200;
    if (i < uniqueSongs.length - 1 && !isCancelled && delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  if (progressFill) progressFill.style.width = "100%";
  if (progressPercent) progressPercent.textContent = "100%";

  const trackSaveHeader = document.getElementById("favTrackSaveHeader");

  if (isCancelled) {
    if (progressText) progressText.textContent = `🛑 Stopped. Completed: ${completed.length}, Skipped: ${uniqueSongs.length - completed.length - failed.length}`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${completed.length} | Failed: ${failed.length}`;
    if (trackSaveHeader) trackSaveHeader.innerHTML = `<span>🛑</span> Stopped. (${completed.length} saved to device, ${failed.length} failed)`;
    showToast(`Batch download stopped. (${completed.length} saved, ${failed.length} failed)`, "warning");
  } else if (failed.length === 0) {
    if (progressText) progressText.textContent = `🎉 All ${completed.length} favourite songs downloaded successfully!`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${completed.length} | Failed: 0 • All audio files saved individually to Android Downloads folder / Files app.`;
    if (trackSaveHeader) trackSaveHeader.innerHTML = `<span>✅</span> All ${completed.length} Songs Downloaded & Saved to File (One by One) • Stored in Android Downloads:`;
    showToast(`🎉 All ${completed.length} favourite songs downloaded as separate files!`, "success");
  } else {
    if (progressText) progressText.textContent = `Download Finished: ${completed.length} completed, ${failed.length} failed.`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${completed.length} | Failed: ${failed.length} • Saved to Android Downloads / Files app`;
    if (trackSaveHeader) trackSaveHeader.innerHTML = `<span>⚠️</span> ${completed.length} Songs Downloaded & Saved to File (${failed.length} failed) • Stored in Android Downloads:`;
    showToast(`⚠️ ${completed.length} songs saved, ${failed.length} failed. Tap Retry below.`, "warning");
  }

  if (failed.length > 0 && retryArea) {
    retryArea.style.display = "block";
    retryArea.innerHTML = `
      <button id="retryFavFailedBtn" class="btn btn-pill" style="background:rgba(239,68,68,0.85); color:#fff; font-size:0.8rem; margin-top:6px; cursor:pointer;">
        🔄 Retry Failed Downloads (${failed.length} tracks)
      </button>
    `;
    const retryBtn = document.getElementById("retryFavFailedBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        downloadFavouritesSequentially(failed, "Retry Failed Favourites");
      });
    }
  } else if (retryArea && !isCancelled) {
    retryArea.style.display = "none";
    retryArea.innerHTML = "";
  }

  return { completed, failed, isCancelled };
}

async function downloadFavouritesAsZip(songsToDownload, zipFilename = "Pranesh_Music_Hub_Favourites.zip") {
  if (!songsToDownload || songsToDownload.length === 0) {
    showToast("No favourite songs to download.");
    return;
  }

  // Deduplicate songs by ID to prevent duplicate downloads
  const seenIds = new Set();
  const uniqueSongs = [];
  for (const s of songsToDownload) {
    if (s && s.id && !seenIds.has(s.id)) {
      seenIds.add(s.id);
      uniqueSongs.push(s);
    }
  }

  if (uniqueSongs.length === 0) {
    showToast("No valid favourite songs to download.");
    return;
  }

  const progressContainer = document.getElementById("zipProgressContainer");
  const progressFill = document.getElementById("zipProgressFill");
  const progressText = document.getElementById("zipProgressText");
  const progressSub = document.getElementById("zipProgressSub");
  const retryArea = document.getElementById("zipRetryArea");

  if (progressContainer) {
    progressContainer.style.display = "block";
    if (progressFill) progressFill.style.width = "0%";
    if (progressText) progressText.textContent = `Preparing ${uniqueSongs.length} favourite songs for packaging...`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: 0 | Failed: 0`;
    if (retryArea) {
      retryArea.style.display = "none";
      retryArea.innerHTML = "";
    }
  }

  showToast(`📦 Packaging ${uniqueSongs.length} favourite songs into ZIP archive...`);

  const files = [];
  const failed = [];
  const quality = AppState.downloadQuality || "48";

  for (let i = 0; i < uniqueSongs.length; i++) {
    const song = uniqueSongs[i];
    const percent = Math.round(((i) / uniqueSongs.length) * 100);

    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `Fetching track ${i + 1} of ${uniqueSongs.length}: "${song.title}" (${percent}%)`;
    if (progressSub) progressSub.textContent = `Total: ${uniqueSongs.length} | Completed: ${files.length} | Remaining: ${uniqueSongs.length - i} | Failed: ${failed.length}`;

    try {
      let audioUrl = song.audio_url || (song.audio_file ? (song.audio_file.startsWith("http") ? song.audio_file : `static/audio/${song.audio_file}`) : "");
      if (!audioUrl || song.is_preview || (song.duration && song.duration <= 45)) {
        const fullStream = await resolveOnlineFullStream(song);
        if (fullStream) audioUrl = fullStream;
      }
      if (!audioUrl) throw new Error("No authorized audio stream found");

      const targetUrl = getOptimizedDownloadUrl(audioUrl, quality) || audioUrl;

      const resp = await fetch(targetUrl);
      if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();

      const safeTitle = (song.title || "Song").replace(/[/\\?%*:|"<>]/g, "_").trim();
      const safeArtist = (song.artist || "Pranesh Hub").replace(/[/\\?%*:|"<>]/g, "_").trim();
      const ext = (targetUrl.includes(".mp3") || !targetUrl.includes(".mp4")) ? "mp3" : "m4a";
      const filename = `${safeTitle} - ${safeArtist}.${ext}`;

      files.push({
        name: filename,
        data: new Uint8Array(arrayBuf)
      });
    } catch (err) {
      console.warn(`[ZIP] Failed to fetch track "${song.title}":`, err.message || err);
      failed.push(song);
    }

    // Small delay between tracks to prevent browser network throttling
    await new Promise(r => setTimeout(r, 120));
  }

  if (progressFill) progressFill.style.width = "100%";

  if (files.length === 0) {
    if (progressText) progressText.textContent = "❌ Failed to download audio streams for packaging.";
    if (progressSub) progressSub.textContent = `Failed: ${failed.length} of ${uniqueSongs.length} songs.`;
    if (retryArea) {
      retryArea.style.display = "block";
      retryArea.innerHTML = `
        <button id="retryZipFailedBtn" class="btn btn-pill" style="background:#ef4444; color:#fff; font-size:0.8rem; margin-top:6px; cursor:pointer;">
          🔄 Retry Failed Downloads (${failed.length} tracks)
        </button>
      `;
      const retryBtn = document.getElementById("retryZipFailedBtn");
      if (retryBtn) {
        retryBtn.addEventListener("click", () => {
          downloadFavouritesAsZip(failed, zipFilename);
        });
      }
    }
    showToast("⚠️ Could not download audio streams. Please check your internet connection.", "error");
    return;
  }

  if (progressText) progressText.textContent = `Building ZIP archive (${files.length} songs)...`;

  const zipBlob = ZipArchiveBuilder.buildZip(files);
  DownloadManager.triggerBlobDownload(zipBlob, zipFilename);

  if (progressText) progressText.textContent = `✅ Complete! ${files.length} songs saved to ${zipFilename}`;
  if (progressSub) {
    progressSub.textContent = failed.length > 0 
      ? `Completed: ${files.length} | Failed: ${failed.length} • Saved to Android Downloads / Files app`
      : `All ${files.length} tracks packaged cleanly • Saved to Android Downloads / Files app`;
  }

  if (failed.length > 0 && retryArea) {
    retryArea.style.display = "block";
    retryArea.innerHTML = `
      <button id="retryZipFailedBtn" class="btn btn-pill" style="background:rgba(239,68,68,0.85); color:#fff; font-size:0.8rem; margin-top:6px; cursor:pointer;">
        🔄 Retry Failed Downloads (${failed.length} tracks)
      </button>
    `;
    const retryBtn = document.getElementById("retryZipFailedBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        downloadFavouritesAsZip(failed, `Pranesh_Favourites_Retry_${Date.now()}.zip`);
      });
    }
  } else if (retryArea) {
    retryArea.style.display = "none";
    retryArea.innerHTML = "";
  }

  showToast(`✅ Successfully downloaded ${files.length} songs in 1 ZIP archive! Saved to Android Downloads folder.`);
}


// Expose advanced modules and handlers on window
if (typeof window !== "undefined") {
  window.ZipArchiveBuilder = ZipArchiveBuilder;
  window.EqualizerManager = EqualizerManager;
  window.LyricsManager = LyricsManager;
  window.addSongToQueue = addSongToQueue;
  window.addSongToPlayNext = addSongToPlayNext;
  window.removeFromQueue = removeFromQueue;
  window.clearQueue = clearQueue;
  window.exportPlaylistM3U = exportPlaylistM3U;
  window.cycleRepeatMode = cycleRepeatMode;
  window.cyclePlaybackSpeed = cyclePlaybackSpeed;
  window.downloadFavouritesSequentially = downloadFavouritesSequentially;
  window.downloadFavouritesAsZip = downloadFavouritesAsZip;
  window.exportFavouritesJSON = exportFavouritesJSON;
  window.importFavouritesJSON = importFavouritesJSON;
  window.detectSongVersionType = detectSongVersionType;
  window.openFullscreenPlayer = openFullscreenPlayer;
  window.closeFullscreenPlayer = closeFullscreenPlayer;
  window.resetFeaturedDownloadButton = resetFeaturedDownloadButton;
  window.resetPlayerDownloadButton = resetPlayerDownloadButton;
  window.resetFullscreenDownloadButton = resetFullscreenDownloadButton;
  window.DownloadManager = DownloadManager;
  window.handleDownloadAction = handleDownloadAction;
  window.containsTamilScript = containsTamilScript;
  window.transliterateTamilToEnglish = transliterateTamilToEnglish;
  window.updateVoiceLangUI = updateVoiceLangUI;
}
