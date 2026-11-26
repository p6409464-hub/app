const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("==================================================");
console.log("RUNNING MULTI-SOURCE INDIAN MUSIC IMPORT ENGINE & 100K+ SCALABLE DATABASE TESTS");
console.log("==================================================");

// Mock browser globals
const memStorage = new Map();
global.localStorage = {
  getItem: (k) => memStorage.get(k) || null,
  setItem: (k, v) => memStorage.set(k, String(v)),
  removeItem: (k) => memStorage.delete(k),
  clear: () => memStorage.clear()
};
global.window = {
  location: { search: "" },
  localStorage: global.localStorage,
  addEventListener: () => {},
  removeEventListener: () => {},
  URL: {
    createObjectURL: (blob) => "blob:mock_" + Date.now(),
    revokeObjectURL: () => {}
  }
};
let capturedToast = "";
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    id,
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    addEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: (child) => {
      capturedToast = (child && (child.innerHTML || child.textContent)) || "";
    },
    removeChild: () => {},
    contains: () => false,
    innerHTML: "",
    textContent: "",
    value: ""
  }),
  querySelectorAll: () => [],
  body: { appendChild: () => {}, removeChild: () => {}, contains: () => false },
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    querySelector: () => ({ addEventListener: () => {} }),
    querySelectorAll: () => [],
    appendChild: () => {},
    removeChild: () => {},
    contains: () => false,
    click: () => {}
  })
};
global.navigator = { userAgent: "NodeTest" };

async function runAllTests() {
  // 1. Load MusicDB
  const dbCode = fs.readFileSync(path.join(__dirname, "..", "static", "js", "db.js"), "utf-8");
  eval(dbCode);
  const MusicDB = global.window.MusicDB || global.MusicDB;
  assert(MusicDB, "MusicDB should be initialized");
  global.MusicDB = MusicDB;
  console.log("[PASS] Test 1: MusicDB initialized successfully with fallback in-memory stores.");

  // 2. Load ImportEngine
  const importEngineCode = fs.readFileSync(path.join(__dirname, "..", "static", "js", "import_engine.js"), "utf-8");
  eval(importEngineCode);
  const ImportEngine = global.window.ImportEngine || global.ImportEngine;
  assert(ImportEngine, "ImportEngine should be initialized");
  global.ImportEngine = ImportEngine;
  console.log("[PASS] Test 2: MultiSourceImportEngine initialized successfully.");

  // 3. Load 100k Catalogue Generator
  const cat100kCode = fs.readFileSync(path.join(__dirname, "..", "static", "js", "indian_massive_catalogue.js"), "utf-8");
  eval(cat100kCode);
  const generateMassiveIndianCatalogue = global.window.generateMassiveIndianCatalogue || global.generateMassiveIndianCatalogue;
  assert(typeof generateMassiveIndianCatalogue === "function", "generateMassiveIndianCatalogue function available");
  global.generateMassiveIndianCatalogue = generateMassiveIndianCatalogue;
  console.log("[PASS] Test 3: Scalable Indian Music Library generator loaded successfully.");

  // 4. Test Duplicate Detection with Version Separation
  console.log("\nTesting Duplicate Detection & Version Separation...");
  const baseTrack = {
    id: "track_orig_1",
    title: "Aalaporan Thamizhan",
    artist: "A. R. Rahman, Kailash Kher",
    album: "Mersal",
    language: "Tamil"
  };
  const exactDup = {
    id: "track_dup_2",
    title: "aalaporan thamizhan",
    artist: "A.R. Rahman",
    album: "Mersal",
    language: "Tamil"
  };
  const remixVersion = {
    id: "track_remix_3",
    title: "Aalaporan Thamizhan (Remix / DJ Mix)",
    artist: "A. R. Rahman",
    album: "Mersal Club Remixes",
    language: "Tamil"
  };
  const acousticVersion = {
    id: "track_acoustic_4",
    title: "Aalaporan Thamizhan - Acoustic Unplugged",
    artist: "A. R. Rahman",
    album: "Acoustic Sessions",
    language: "Tamil"
  };

  const d1 = global.ImportEngine.isDuplicate(exactDup, [baseTrack]);
  assert(d1.isDup === true, "Exact duplicate should be detected and flagged");

  const d2 = global.ImportEngine.isDuplicate(remixVersion, [baseTrack]);
  assert(d2.isDup === false, "Remix version must NOT be flagged as duplicate; must be preserved as distinct!");

  const d3 = global.ImportEngine.isDuplicate(acousticVersion, [baseTrack]);
  assert(d3.isDup === false, "Acoustic version must NOT be flagged as duplicate; must be preserved as distinct!");
  console.log("[PASS] Test 4: Duplicate detection accurately identifies exact duplicates while preserving Remix & Acoustic versions distinctly!");

  // 5. Test Local File Metadata Parser (Phone & Computer)
  console.log("\nTesting Local File Metadata Parser...");
  const p1 = global.ImportEngine.parseLocalFileName("01. Manithan Manithan - Malaysia Vasudevan [320kbps].mp3");
  assert(p1.title.toLowerCase().includes("manithan"), "Title parsed");
  assert(p1.artist.toLowerCase().includes("malaysia vasudevan"), "Artist parsed");

  const p2 = global.ImportEngine.parseLocalFileName("Naatu Naatu - RRR - Rahul Sipligunj.m4a");
  assert(p2.language === "Telugu", "Language inferred as Telugu");

  const p3 = global.ImportEngine.parseLocalFileName("Tum Hi Ho - Arijit Singh.flac");
  assert(p3.language === "Hindi", "Language inferred as Hindi");
  console.log("[PASS] Test 5: Local filename metadata parser parses Title, Artist, Album & Language from diverse filename formats!");

  // 6. Test Spotify and YouTube Non-Downloadable Restrictions
  console.log("\nTesting Spotify & YouTube Non-Downloadable Restrictions...");
  const spotifyTrack = {
    id: "spotify_123",
    title: "Hukum - Alappara",
    artist: "Anirudh Ravichander",
    album: "Jailer",
    source: "spotify",
    download_authorized: false
  };
  const ytTrack = {
    id: "yt_456",
    title: "Illuminati",
    artist: "Sushin Shyam",
    album: "Aavesham",
    source: "youtube",
    download_authorized: false
  };

  // Load app.js
  const songsDataCode = fs.readFileSync(path.join(__dirname, "..", "static", "js", "songs_data.js"), "utf-8");
  eval(songsDataCode);
  const appCode = fs.readFileSync(path.join(__dirname, "..", "static", "js", "app.js"), "utf-8");
  eval(appCode);

  capturedToast = "";
  global.showToast = (msg) => { capturedToast = msg; };
  if (typeof window !== "undefined") window.showToast = global.showToast;

  const okSpot = await global.window.DownloadManager.downloadSong(spotifyTrack);
  console.log("okSpot:", okSpot, "capturedToast:", JSON.stringify(capturedToast));
  assert(okSpot === false, "Spotify track download MUST be blocked");
  assert(capturedToast.includes("licensed for authorized online streaming only"), "Should show streaming license message for Spotify");
  console.log("[PASS] Test 6A: Spotify track download blocked according to streaming licensing requirements.");

  capturedToast = "";
  const okYt = await global.window.DownloadManager.downloadSong(ytTrack);
  assert(okYt === false, "YouTube track download MUST be blocked");
  assert(capturedToast.includes("licensed for authorized online streaming only"), "Should show streaming license message for YouTube");
  console.log("[PASS] Test 6B: YouTube Music track download blocked according to streaming licensing requirements.");

  // 7. Test Scalable 100,000+ Indian Music Dataset & Inverted Index Benchmark
  console.log("\nGenerating and benchmarking 100,000+ Indian Music Library...");
  console.time("Generate 100k Indian Songs");
  const library100k = global.generateMassiveIndianCatalogue(100000);
  console.timeEnd("Generate 100k Indian Songs");
  assert(library100k.length >= 100000, "Should generate at least 100,000 songs");

  const langs = new Set(library100k.map(s => s.language));
  const requiredLangs = ["Tamil", "Telugu", "Hindi", "Malayalam", "Kannada", "Punjabi", "Bengali", "Marathi", "Gujarati", "Urdu", "Odia", "Assamese", "Sanskrit"];
  for (const reqLang of requiredLangs) {
    assert(langs.has(reqLang), `Language ${reqLang} must be present in the dataset`);
  }
  console.log(`[PASS] Test 7A: 100,000+ songs verified across all 13 Indian languages: ${Array.from(langs).join(", ")}`);

  console.time("Merge 50k songs into AppState and build inverted index");
  global.window.mergeImportedSongs(library100k.slice(0, 50000));
  console.timeEnd("Merge 50k songs into AppState and build inverted index");
  console.log("Master catalogue size after merge:", global.window.AppState.masterSongs.length);

  console.time("Search 'Thavani' across expanded catalogue");
  const s1 = global.window.searchCatalogue("Thavani");
  console.timeEnd("Search 'Thavani' across expanded catalogue");
  assert(s1.length > 0, "Should find matching songs");
  console.log(`[PASS] Test 7B: Search 'Thavani' returned ${s1.length} matches instantly.`);

  console.time("Search Telugu 'Pushpa' across expanded catalogue");
  const s2 = global.window.searchCatalogue("Pushpa");
  console.timeEnd("Search Telugu 'Pushpa' across expanded catalogue");
  assert(s2.length > 0, "Should find Pushpa songs");
  console.log(`[PASS] Test 7C: Search 'Pushpa' returned ${s2.length} matches instantly.`);

  console.time("Search Hindi 'Rockstar' across expanded catalogue");
  const s3 = global.window.searchCatalogue("Rockstar");
  console.timeEnd("Search Hindi 'Rockstar' across expanded catalogue");
  assert(s3.length > 0, "Should find Rockstar songs");
  console.log(`[PASS] Test 7D: Search 'Rockstar' returned ${s3.length} matches instantly.`);

  // 8. Test Pause, Resume, and Cancel State Machine
  console.log("\nTesting Import Engine State Machine (Pause, Resume, Cancel)...");
  const IMPORT_STATES = global.window.IMPORT_STATES || global.IMPORT_STATES || { IDLE: "IDLE", RUNNING: "RUNNING", PAUSED: "PAUSED", CANCELLED: "CANCELLED" };
  global.ImportEngine.initStats(100);
  global.ImportEngine.state = IMPORT_STATES.RUNNING;

  global.ImportEngine.pause();
  assert(global.ImportEngine.state === IMPORT_STATES.PAUSED, "Should transition to PAUSED");
  assert(global.ImportEngine.pauseRequested === true, "pauseRequested flag set");

  global.ImportEngine.resume();
  assert(global.ImportEngine.state === IMPORT_STATES.RUNNING, "Should transition to RUNNING");
  assert(global.ImportEngine.pauseRequested === false, "pauseRequested flag cleared");

  global.ImportEngine.cancel();
  assert(global.ImportEngine.state === IMPORT_STATES.CANCELLED, "Should transition to CANCELLED");
  assert(global.ImportEngine.cancelRequested === true, "cancelRequested flag set");
  console.log("[PASS] Test 8: Pause, Resume, and Cancel state machine transitions verified.");

  // 9. Test IndexedDB Persistence Operations
  console.log("\nTesting Database Storage & Persistence...");
  await global.MusicDB.init();
  const testSong = { id: "test_db_song_1", title: "Db Song", artist: "Db Artist", album: "Db Album", language: "Tamil" };
  await global.MusicDB.putSong(testSong);
  const fetched = await global.MusicDB.getSong("test_db_song_1");
  assert(fetched && fetched.title === "Db Song", "Should fetch song from DB");

  await global.MusicDB.addHistory({ source: "Unit Test", count: 10, addedCount: 10, duplicateCount: 0 });
  const hist = await global.MusicDB.getHistory();
  assert(hist.length > 0 && hist[0].source === "Unit Test", "Should retrieve history");

  await global.MusicDB.logDuplicate({ incoming: "Dup 1", matched: "Orig 1", reason: "Title match" });
  const dupes = await global.MusicDB.getDuplicates();
  assert(dupes.length > 0 && dupes[0].incoming === "Dup 1", "Should retrieve duplicate log");
  console.log("[PASS] Test 9: Database put, get, history logging, and duplicate tracking fully verified.");

  console.log("\n==================================================");
  console.log("ALL MULTI-SOURCE IMPORT ENGINE & 100K+ SCALABLE DATABASE TESTS PASSED!");
  console.log("==================================================");
}

runAllTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
