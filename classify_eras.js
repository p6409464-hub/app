const fs = require("fs");
const path = require("path");

const songsDataPath = path.join(__dirname, "static", "js", "songs_data.js");
const content = fs.readFileSync(songsDataPath, "utf8");

const start = content.indexOf("[");
const end = content.lastIndexOf("]") + 1;
const songs = JSON.parse(content.substring(start, end));

console.log(`Loaded ${songs.length} tracks.`);

const ERA_80S_KEYWORDS = [
  "1980", "1981", "1982", "1983", "1984", "1985", "1986", "1987", "1988", "1989",
  "mouna ragam", "nayakan", "agni natchathiram", "sindhu bhairavi", "moondram pirai",
  "sakalakala vallavan", "karakattakkaran", "payanangal mudivadhillai", "johnny",
  "punnagai mannan", "gopura vasalile", "kizhakku vaasal", "nenjathai killathe",
  "panneer pushpangal", "tik tik tik", "murattu kaalai", "netrikkan", "thillu mullu",
  "vellai roja", "anbulla rajinikanth", "ooru vittu ooru vandhu", "rajathi raja",
  "sigappu rojakkal", "nizhalgal", "guru", "varumayin niram sivappu", "sagalakala",
  "nallavanukku nallavan", "vetri vizha", "guru sishyan", "dharmathin thalaivan",
  "apoorva sagodharargal", "padikkadavan (1985)"
];

const ERA_90S_KEYWORDS = [
  "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999",
  "roja", "gentleman", "kadhalan", "bombay", "muthu", "baasha", "indian", "annamalai",
  "padayappa", "jeans", "mudhalvan", "kadhal desam", "iruvar", "minsara kanavu",
  "chinna thambi", "ejamaan", "sethu", "kadhalukku mariyadhai", "suryavamsam",
  "poove unakkaga", "thulladha manamum thullum", "deva", "sa rajkumar", "karthik raja",
  "sirpy", "avvai shanmugi", "thevar magan", "michael madana kama rajan", "panchatanthiram",
  "ullathai allitha", "mettu kudi", "natpukkaga", "kannedhirey thondrinal",
  "ninaithen vandhai", "un nidathil ennai koduthen", "priyamudan", "vaali",
  "endrendrum kadhal", "sangamam", "jodi", "poovellam kettuppar", "taal", "rangeela",
  "kizhakku cheemayile", "mahanadhi", "duet", "may madham", "karuthamma", "kadhalan",
  "vellithirai", "pudhiya mugam", "thiruda thiruda", "captain prabhakaran", "chinna gounder",
  "brahma", "rickshaw mama", "singaravelan", "suriyan", "walter vetrivel", "chinna thambi periya thambi"
];

const ERA_2K_KEYWORDS = [
  "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009",
  "alaipayuthey", "kandukondain", "minnale", "dheena", "kushi", "run", "dhill",
  "dhool", "saamy", "kaakha kaakha", "ghilli", "7g rainbow", "manmadhan", "chandramukhi",
  "anniyan", "ghajini", "pudhupettai", "vettaiyaadu vilaiyaadu", "pokkiri", "sivaji",
  "billa", "vaaranam aayiram", "ayan", "paiyaa", "vinnaithaandi", "polladhavan",
  "paruthiveeran", "subramaniapuram", "saroja", "chennai 600028", "kattradhu thamizh",
  "mozhi", "unnale unnale", "pachaikili muthucharam", "bheema", "santosh subramaniam",
  "yaaradi nee mohini", "kuruvi", "villu", "padikkadavan", "aadhavan", "kandhasamy",
  "naan kadavul", "peranmai", "vettaikaaran", "siruthai", "singam", "tenali",
  "new", "boys", "aayitha ezhuthu", "azhagiya tamil magan", "friends", "priyamanavale",
  "badri", "shahjahan", "thamizhan", "youth", "bagavathi", "vaseegara", "thirumalai",
  "udhaya", "madhurey", "thirupaachi", "sachein", "sivakasi", "aathi", "azagiya",
  "citizen", "red", "villain", "anjeneya", "jana", "attahasam", "ji", "paramasivan",
  "thirupathi", "varalaru", "aalwar", "kireedam", "aegan", "asai", "mugavaree"
];

const counts = { "80s": 0, "90s": 0, "2k": 0, "now": 0 };

for (const s of songs) {
  const corpus = `${s.title || ""} ${s.artist || ""} ${s.album || ""} ${(s.tags || []).join(" ")}`.toLowerCase();

  let era = "now";
  if (ERA_80S_KEYWORDS.some(k => corpus.includes(k)) || (corpus.includes("ilaiyaraaja") && !ERA_90S_KEYWORDS.some(k => corpus.includes(k)) && !ERA_2K_KEYWORDS.some(k => corpus.includes(k)))) {
    era = "80s";
  } else if (ERA_90S_KEYWORDS.some(k => corpus.includes(k))) {
    era = "90s";
  } else if (ERA_2K_KEYWORDS.some(k => corpus.includes(k))) {
    era = "2k";
  } else {
    era = "now";
  }

  s.era = era;
  counts[era]++;

  // Enrich tags
  const tagsSet = new Set(s.tags || []);
  if (era === "80s") {
    ["80s", "80s hits", "golden classics", "80s songs", "80s tamil"].forEach(t => tagsSet.add(t));
  } else if (era === "90s") {
    ["90s", "90s hits", "nostalgia", "90s songs", "90s tamil"].forEach(t => tagsSet.add(t));
  } else if (era === "2k") {
    ["2k", "2000s", "2k hits", "2k songs", "2000s hits"].forEach(t => tagsSet.add(t));
  } else {
    ["now", "latest", "trending", "2010s", "2020s", "latest songs"].forEach(t => tagsSet.add(t));
  }
  s.tags = Array.from(tagsSet);
}

console.log("\nEra breakdown across 5,763 tracks:");
console.log(`  80s Classics: ${counts["80s"]} tracks`);
console.log(`  90s Hits: ${counts["90s"]} tracks`);
console.log(`  2K Hits (2000s): ${counts["2k"]} tracks`);
console.log(`  2010s to Now: ${counts["now"]} tracks`);

const outputCode = `// Pranesh Music Hub - Complete Master Song Catalogue (Deduplicated with Eras)\nwindow.CATALOGUE_SONGS = ${JSON.stringify(songs)};\n`;

fs.writeFileSync(songsDataPath, outputCode, "utf8");
console.log(`Successfully saved to ${songsDataPath}!`);
