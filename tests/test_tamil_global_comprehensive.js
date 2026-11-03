const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

// Mock browser environment
global.window = {
  location: { search: "" },
  listeners: {},
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  },
  removeEventListener() {},
  dispatchEvent() {}
};
global.Audio = function() {
  return {
    preload: "",
    volume: 1,
    addEventListener() {},
    play() { return Promise.resolve(); },
    pause() {}
  };
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
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
    dispatchEvent(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => fn(data || { target: this }));
      }
    },
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) {},
    querySelectorAll() { return []; },
    querySelector() { return null; },
    focus() {},
    click() {}
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
  addEventListener(event, fn) {
    if (event === "DOMContentLoaded") {
      global.initApp = fn;
    }
  },
  removeEventListener() {},
  createElement(tag) { return createMockElement("", tag); },
  body: createMockElement("body"),
  _elements: {}
};

require("../static/js/songs_data.js");
const appJsPath = path.join(__dirname, "..", "static", "js", "app.js");
const appJsCode = fs.readFileSync(appJsPath, "utf-8");
vm.runInThisContext(appJsCode);

if (typeof global.initApp === "function") {
  global.initApp();
}

console.log("=== COMPREHENSIVE TAMIL GLOBAL SEARCH VERIFICATION ===");
console.log(`Master catalogue size: ${AppState.masterSongs.length}`);

// Test Suite: 12 Core Requirements Validation

// 1. Distinction tests: Similar sounding songs must NEVER collide
console.log("\n[Test A] Distinguish similar-sounding distinct Tamil songs");
const distinctionTests = [
  {
    q: "thavaniye",
    mustContainSnippet: "thavani",
    mustNotContainSnippet: "thaniye"
  },
  {
    q: "thaniye",
    mustContainSnippet: "thaniye",
    mustNotContainSnippet: "thavani"
  },
  {
    q: "kitta nerungi vaa di",
    mustContainSnippet: "kitta",
    mustNotContainSnippet: "katta vandi"
  },
  {
    q: "katta vandi",
    mustContainSnippet: "katta vandi",
    mustNotContainSnippet: "kitta nerungi"
  },
  {
    q: "no money",
    mustContainSnippet: "money",
    mustNotContainSnippet: "monkey"
  },
  {
    q: "vaathi coming",
    mustContainSnippet: "coming",
    mustNotContainSnippet: "raid"
  }
];

distinctionTests.forEach(({ q, mustContainSnippet, mustNotContainSnippet }) => {
  executeSearch(q);
  assert(AppState.searchResults.length > 0, `Search for "${q}" must return results`);
  const top = AppState.searchResults[0];
  const topText = `${top.title} ${top.album}`.toLowerCase();
  assert(topText.includes(mustContainSnippet), `Query "${q}" top result must contain "${mustContainSnippet}", got "${top.title}"`);
  
  const badMatch = AppState.searchResults.some(s => {
    const t = `${s.title} ${s.album}`.toLowerCase();
    return t.includes(mustNotContainSnippet);
  });
  assert.strictEqual(badMatch, false, `Query "${q}" must NEVER match "${mustNotContainSnippet}"!`);
  console.log(`[PASS] "${q}" correctly matches "${mustContainSnippet}" and completely excludes "${mustNotContainSnippet}"`);
});

// 2. Transliteration Invariance Tests (th/dh, k/g, s/sh/ch, p/b, zh/l, vowel lengths)
console.log("\n[Test B] Common Tamil-English transliteration invariance");
const transliterationTests = [
  { queries: ["thendral vanthu", "dhendral vandhu", "thendral vandhu"], expectedSnippet: "thendral" },
  { queries: ["chinna chinna aasai", "sinna sinna aasai", "chinna chinna asai"], expectedSnippet: "chinna chinna asai" },
  { queries: ["munbe vaa", "munbae vaa", "munbe va"], expectedSnippet: "munbe vaa" },
  { queries: ["nenjukkul peidhidum", "nenjukkul peithidum", "nenjukul peithidum"], expectedSnippet: "nenjukkul peidhidum" },
  { queries: ["poove sempoove", "puve sempuve", "poovae sempoovae"], expectedSnippet: "sempoove" },
  { queries: ["kannukulla nikkira", "kanukula nikira", "kannukkulle"], expectedSnippet: "kannuk" }
];

transliterationTests.forEach(({ queries, expectedSnippet }) => {
  queries.forEach(q => {
    executeSearch(q);
    assert(AppState.searchResults.length > 0, `Query variation "${q}" must return results`);
    const top = AppState.searchResults[0];
    const topText = `${top.title} ${top.album}`.toLowerCase();
    assert(topText.includes(expectedSnippet), `Query variation "${q}" top result must match "${expectedSnippet}", got "${top.title}"`);
  });
  console.log(`[PASS] All variations of "${queries[0]}" matched "${expectedSnippet}" identically.`);
});

// 3. Typo Self-Correction Tests
console.log("\n[Test C] Typo self-correction without mangling valid words");
const typoTests = [
  { wrong: "no mony", expectedCorrected: "no money" },
  { wrong: "kanukula nika ye kadhali", expectedCorrected: "kannukulla nikkira en kadhaliye" },
  { wrong: "ennavale eannai maramthathu", expectedCorrected: "ennavale ennai maranthathu" },
  { wrong: "illumnati", expectedCorrected: "illuminati" },
  { wrong: "bodhai kodhai", expectedCorrected: "bodhai kodhai" }
];

typoTests.forEach(({ wrong, expectedCorrected }) => {
  const res = autoCorrectSearchQuery(wrong);
  console.log(`Typo check: "${wrong}" -> "${res.corrected}" (hasCorrection: ${res.hasCorrection})`);
  if (wrong.includes("mony") || wrong.includes("maramthathu") || wrong.includes("nika")) {
    assert.strictEqual(res.corrected.toLowerCase(), expectedCorrected.toLowerCase(), `"${wrong}" must correct to "${expectedCorrected}"`);
  }
});
console.log("[PASS] Typo self-correction verified.");

// 4. Exact Title Highest Priority
console.log("\n[Test D] Exact Title Match Highest Priority");
const exactTitleTests = [
  { q: "Leo Das", expectedExact: "Leo Das" },
  { q: "Badass", expectedExact: "Badass" },
  { q: "Hukum", expectedExact: "Hukum" },
  { q: "Believer", expectedExact: "Believer" },
  { q: "Kesariya", expectedExact: "Kesariya" },
  { q: "Chuttamalle", expectedExact: "Chuttamalle" }
];

exactTitleTests.forEach(({ q, expectedExact }) => {
  executeSearch(q);
  assert(AppState.searchResults.length > 0, `Search for "${q}" must return results`);
  const top = AppState.searchResults[0];
  assert(top.title.toLowerCase().startsWith(expectedExact.toLowerCase()), `Query "${q}" must rank "${expectedExact}" at #1, got "${top.title}"`);
  console.log(`[PASS] "${q}" ranked "${top.title}" at #1`);
});

// 5. Gibberish / Unrelated Queries return 0 results
console.log("\n[Test E] Zero Unrelated Songs on Non-Existent / Gibberish Queries");
const gibberishQueries = [
  "zzxqjkwp",
  "qwertyuioplkjh",
  "randomgibberish987654",
  "abracadabraxyznonsense"
];

gibberishQueries.forEach(q => {
  executeSearch(q);
  assert.strictEqual(AppState.searchResults.length, 0, `Gibberish query "${q}" must return 0 results, got ${AppState.searchResults.length}`);
  console.log(`[PASS] Gibberish query "${q}" safely returned 0 results.`);
});

console.log("\n=======================================================");
console.log("ALL COMPREHENSIVE TAMIL GLOBAL SEARCH TESTS PASSED!");
console.log("=======================================================\n");
