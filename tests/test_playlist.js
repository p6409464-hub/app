/**
 * Automated Test Suite for Up Next & Related Songs Playlist Engine
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

// Mock browser
global.window = {
  location: { search: "" },
  addEventListener() {},
  removeEventListener() {}
};
global.Audio = function() {
  return {
    preload: "",
    volume: 1,
    src: "",
    currentTime: 0,
    duration: 200,
    addEventListener() {},
    play() { return Promise.resolve(); },
    pause() {}
  };
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; }
};

function createMockElement(id, tag = "div") {
  return {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) this.classes.delete(c);
          else this.classes.add(c);
        } else if (force) {
          this.classes.add(c);
        } else {
          this.classes.delete(c);
        }
      },
      contains(c) { return this.classes.has(c); }
    },
    dataset: {},
    innerHTML: "",
    textContent: "",
    value: "",
    children: [],
    listeners: {},
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    },
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
    },
    contains(child) { return this.children.includes(child); },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    focus() {},
    play() { return Promise.resolve(); },
    pause() {}
  };
}

global.document = {
  getElementById(id) {
    if (!this._elements[id]) {
      this._elements[id] = createMockElement(id);
    }
    return this._elements[id];
  },
  querySelectorAll() { return []; },
  addEventListener() {},
  removeEventListener() {},
  createElement(tag) { return createMockElement("", tag); },
  body: createMockElement("body"),
  _elements: {}
};

// Load songs_data.js & app.js
const songsDataPath = path.join(__dirname, "..", "static", "js", "songs_data.js");
eval(fs.readFileSync(songsDataPath, "utf-8"));

const appJsPath = path.join(__dirname, "..", "static", "js", "app.js");
vm.runInThisContext(fs.readFileSync(appJsPath, "utf-8"));

console.log("\n==================================================");
console.log("RUNNING PRANESH MUSIC HUB PLAYLIST TEST SUITE");
console.log("==================================================\n");

// Test 1: Initialize App
console.log("Test 1: App initialization...");
if (typeof global.initializeApp === "function") global.initializeApp();
assert(AppState.masterSongs.length > 0, "Master catalogue should be loaded");
console.log(`[PASS] Master catalogue loaded with ${AppState.masterSongs.length} tracks.`);

// Test 2: Build Related Queue for Leo track
console.log("Test 2: Verifying related queue generation...");
const leoSong = AppState.masterSongs.find(s => s.album && s.album.toLowerCase() === "leo");
assert(leoSong, "Should find a song from Leo");
const leoQueue = buildRelatedQueue(leoSong);
assert(Array.isArray(leoQueue) && leoQueue.length > 1, "Queue should contain multiple tracks");
assert.strictEqual(leoQueue[0].id, leoSong.id, "First track in queue must be the selected song");

// Check that other Leo tracks are included immediately
const otherLeo = leoQueue.filter(s => s.album && s.album.toLowerCase() === "leo");
assert(otherLeo.length > 1, "Other songs from movie Leo should be in the queue");
console.log(`[PASS] Related queue built: ${leoQueue.length} tracks, including ${otherLeo.length} from Leo album.`);

// Test 3: Deduplication in queue
console.log("Test 3: Queue deduplication...");
const seen = new Set();
let hasDuplicates = false;
for (const s of leoQueue) {
  if (seen.has(s.id)) { hasDuplicates = true; break; }
  seen.add(s.id);
}
assert(!hasDuplicates, "Queue must not have duplicate tracks");
console.log("[PASS] Queue is 100% deduplicated.");

// Test 4: playSong populates queue and updates active index
console.log("Test 4: playSong updates state and playlist...");
playSong(leoSong);
assert.strictEqual(AppState.currentSong.id, leoSong.id);
assert.strictEqual(AppState.currentSongIndex, 0);
assert(AppState.queue.length > 0);
console.log(`[PASS] playSong set current track and populated ${AppState.queue.length} related tracks.`);

// Test 5: playNextSong moves sequentially through related tracks
console.log("Test 5: playNextSong sequential traversal...");
const initialId = AppState.currentSong.id;
const expectedNextSong = AppState.queue[1];
playNextSong();
assert.strictEqual(AppState.currentSong.id, expectedNextSong.id, "Should move to next related song");
assert.strictEqual(AppState.currentSongIndex, 1, "Current index should increment to 1");
console.log(`[PASS] Successfully moved to next related track: "${AppState.currentSong.title}" (${AppState.currentSong.album}).`);

// Test 6: togglePlaylistDrawer state changes
console.log("Test 6: togglePlaylistDrawer opens/closes drawer...");
assert.strictEqual(AppState.isPlaylistOpen, false);
togglePlaylistDrawer(true);
assert.strictEqual(AppState.isPlaylistOpen, true);
togglePlaylistDrawer(false);
assert.strictEqual(AppState.isPlaylistOpen, false);
console.log("[PASS] Playlist drawer toggle verified.");

// Test 7: Search and Related Queue interplay
console.log("Test 7: Search interplay with related queue...");
executeSearch("Kodi");
assert(AppState.searchResults.length > 0, "Kodi search should return tracks");
const kodiSong = AppState.searchResults[0];
playSong(kodiSong);
assert.strictEqual(AppState.currentSong.id, kodiSong.id);
assert(AppState.queue.length > 1, "Should auto-populate related tracks even from search");
console.log(`[PASS] Searched song "${kodiSong.title}" played with ${AppState.queue.length} related tracks queued.`);

console.log("\n==================================================");
console.log("ALL PLAYLIST & RELATED TRACK TESTS PASSED!");
console.log("==================================================\n");
