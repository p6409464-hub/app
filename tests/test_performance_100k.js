const fs = require("fs");
const path = require("path");

const songsDataPath = path.join(__dirname, "..", "static", "js", "songs_data.js");
global.window = {};
eval(fs.readFileSync(songsDataPath, "utf-8"));
const baseSongs = global.window.CATALOGUE_SONGS;

console.log("Base catalogue size:", baseSongs.length);

// Generate 100,000 songs
const synthetic100k = [];
const titles = ["Thavani Pootta", "Thaniye", "Kitta Nerungi", "Katta Vandi", "Leo Das", "Kannukulla Nikkira", "Ennavaley Ennai", "Roja Poo", "Aalaporan Thamizhan", "Vaathi Coming"];
for (let i = 0; i < 100000; i++) {
  const base = baseSongs[i % baseSongs.length];
  const t = titles[i % titles.length] + " " + (i + 1);
  synthetic100k.push({
    ...base,
    id: "syn_" + i,
    title: t,
    _normTitle: t.toLowerCase(),
    _titleTokens: t.toLowerCase().split(" ")
  });
}

console.log("Synthetic database size:", synthetic100k.length);

// Inverted token index
console.time("Build Inverted Index (100k songs)");
const invertedIndex = new Map();
for (let i = 0; i < synthetic100k.length; i++) {
  const s = synthetic100k[i];
  for (const tok of s._titleTokens) {
    if (!invertedIndex.has(tok)) invertedIndex.set(tok, []);
    invertedIndex.get(tok).push(i);
  }
}
console.timeEnd("Build Inverted Index (100k songs)");

console.log("Unique indexed tokens:", invertedIndex.size);

// Benchmark Search
function fastLookup(query) {
  const qTokens = query.toLowerCase().trim().split(" ");
  if (qTokens.length === 0) return [];
  const candidateIndices = invertedIndex.get(qTokens[0]) || [];
  const matches = [];
  for (let idx of candidateIndices) {
    const song = synthetic100k[idx];
    matches.push(song);
    if (matches.length >= 50) break;
  }
  return matches;
}

console.time("Search 'Thavani' (100k songs)");
const r1 = fastLookup("Thavani");
console.timeEnd("Search 'Thavani' (100k songs)");
console.log("Found matches:", r1.length, "first title:", r1[0] ? r1[0].title : "none");

console.time("Search 'Thaniye' (100k songs)");
const r2 = fastLookup("Thaniye");
console.timeEnd("Search 'Thaniye' (100k songs)");
console.log("Found matches:", r2.length, "first title:", r2[0] ? r2[0].title : "none");
