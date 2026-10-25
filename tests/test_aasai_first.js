const fs = require('fs');
const assert = require('assert');

// Load songs_data.js
global.window = {};
require('../static/js/songs_data.js');

const songs = window.CATALOGUE_SONGS;
console.log('Loaded CATALOGUE_SONGS:', songs.length);

// Read app.js functions
const appJs = fs.readFileSync('static/js/app.js', 'utf8');

// Extract functions
const normalizeSearchText = new Function(appJs.match(/function normalizeSearchText\(str\) {[\s\S]*?\n}/)[0] + '; return normalizeSearchText;')();
const normalizeCompact = new Function(appJs.match(/function normalizeCompact\(str\) {[\s\S]*?\n}/)[0] + '; return normalizeCompact;')();
const toPhonetic = new Function(appJs.match(/function toPhonetic\(s\) {[\s\S]*?\n}/)[0] + '; return toPhonetic;')();
const boundedLevenshtein = new Function(appJs.match(/function boundedLevenshtein\(a, b, maxDist\) {[\s\S]*?\n}/)[0] + '; return boundedLevenshtein;')();
const prepareSongSearchMetadata = new Function('normalizeSearchText', 'normalizeCompact', 'toPhonetic',
  appJs.match(/function prepareSongSearchMetadata\(song\) {[\s\S]*?\n}/)[0] + '; return prepareSongSearchMetadata;')(normalizeSearchText, normalizeCompact, toPhonetic);
const scoreAndMatchSong = new Function('normalizeSearchText', 'normalizeCompact', 'toPhonetic', 'boundedLevenshtein',
  appJs.match(/function scoreAndMatchSong\(song, rawQuery\) {[\s\S]*?\n}/)[0] + '; return scoreAndMatchSong;')(normalizeSearchText, normalizeCompact, toPhonetic, boundedLevenshtein);

const preparedSongs = songs.map(s => prepareSongSearchMetadata(s));

function search(query) {
  const scored = [];
  for (const song of preparedSongs) {
    const res = scoreAndMatchSong(song, query);
    if (res.matched) {
      scored.push({ song, score: res.score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map(item => item.song);
}

const testQueries = [
  "aasai machaan",
  "aasai machaan song",
  "aasai machan",
  "aasa machan",
  "aasa machaan song",
  "aasai machan song",
  "adi aasa machan"
];

let allPassed = true;
for (const q of testQueries) {
  const results = search(q);
  if (results.length === 0) {
    console.error(`FAILED: "${q}" returned 0 results!`);
    allPassed = false;
    continue;
  }
  const first = results[0];
  const isAasaiMachaan = first.title.toLowerCase().startsWith("aasai machaan");
  console.log(`Query: "${q}" -> #1: "${first.title}" by ${first.artist} (${first.album}) [id: ${first.id}] -> ${isAasaiMachaan ? 'PASSED ✅' : 'FAILED ❌'}`);
  if (!isAasaiMachaan) {
    allPassed = false;
  }
}

if (!allPassed) {
  console.error("Some queries failed!");
  process.exit(1);
} else {
  console.log("All Aasai Machaan queries ranked #1 successfully! 🚀");
}
