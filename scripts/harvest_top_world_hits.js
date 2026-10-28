const https = require('https');
const fs = require('fs');
const path = require('path');

const targetHits = [
  // Tamil Blockbusters & Sensations
  { q: 'maruvaarthai sid sriram', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'rowdy baby maari 2', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'arabic kuthu beast', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'kaavaalaa jailer', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'hukum jailer', lang: 'Tamil', type: 'Rap', era: 'now', category: 'Tamil Songs' },
  { q: 'badass leo', lang: 'Tamil', type: 'Rap', era: 'now', category: 'Tamil Songs' },
  { q: 'naa ready leo', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'ordinary person leo', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'katchi sera sai abhyankkar', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'aasa kooda sai abhyankkar', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'golden sparrow gv prakash', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'vaathi coming master', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'porkanda singam vikram', lang: 'Tamil', type: 'Sad', era: 'now', category: 'Tamil Songs' },
  { q: 'pathala pathala vikram', lang: 'Tamil', type: 'Kuthu', era: 'now', category: 'Tamil Songs' },
  { q: 'chaleya jawan anirudh', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'hayyoda jawan', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'nenjukkul peidhidum harris jayaraj', lang: 'Tamil', type: 'Melody', era: '2k', category: 'Tamil Songs' },
  { q: 'hosanna vinnaithaandi varuvaayaa', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'why this kolaveri di anirudh', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'enjoy enjaami dhee arivu', lang: 'Tamil', type: 'Folk', era: 'now', category: 'Tamil Songs' },
  { q: 'megham karukatha thiruchitrambalam', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'thaensudare lover', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'uyire uyire bombay ar rahman', lang: 'Tamil', type: 'Melody', era: '90s', category: 'Tamil Songs' },
  { q: 'chinna chinna aasai roja ar rahman', lang: 'Tamil', type: 'Melody', era: '90s', category: 'Tamil Songs' },
  { q: 'kannalane bombay ar rahman', lang: 'Tamil', type: 'Melody', era: '90s', category: 'Tamil Songs' },
  { q: 'pudhu vellai mazhai roja', lang: 'Tamil', type: 'Melody', era: '90s', category: 'Tamil Songs' },
  { q: 'senthoora bogan', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'yaar azhaippadhu maara', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'kannazhaga 3 dhanush', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },
  { q: 'naan gaali good night', lang: 'Tamil', type: 'Melody', era: 'now', category: 'Tamil Songs' },

  // Telugu Chartbusters
  { q: 'naatu naatu rrr', lang: 'Telugu', type: 'Kuthu', era: 'now', category: 'Telugu Songs' },
  { q: 'dosti rrr', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'chuttamalle devara', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'fear song devara', lang: 'Telugu', type: 'Rap', era: 'now', category: 'Telugu Songs' },
  { q: 'daavudi devara', lang: 'Telugu', type: 'Kuthu', era: 'now', category: 'Telugu Songs' },
  { q: 'butta bomma ala vaikunthapurramuloo', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'ramuloo ramulaa ala vaikunthapurramuloo', lang: 'Telugu', type: 'Kuthu', era: 'now', category: 'Telugu Songs' },
  { q: 'samajavaragamana ala vaikunthapurramuloo', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'oo antava mava pushpa', lang: 'Telugu', type: 'Kuthu', era: 'now', category: 'Telugu Songs' },
  { q: 'srivalli pushpa', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'saami saami pushpa', lang: 'Telugu', type: 'Folk', era: 'now', category: 'Telugu Songs' },
  { q: 'pushpa pushpa pushpa 2', lang: 'Telugu', type: 'Rap', era: 'now', category: 'Telugu Songs' },
  { q: 'sooseki pushpa 2', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'inkem inkem geetha govindam', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'kalavathi sarkaru vaari paata', lang: 'Telugu', type: 'Melody', era: 'now', category: 'Telugu Songs' },
  { q: 'kurchi madathapetti guntur kaaram', lang: 'Telugu', type: 'Kuthu', era: 'now', category: 'Telugu Songs' },
  { q: 'dum masala guntur kaaram', lang: 'Telugu', type: 'Rap', era: 'now', category: 'Telugu Songs' },

  // Hindi Mega Hits
  { q: 'kesariya brahmastra arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'apna bana le bhediya arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'tum hi ho aashiqui 2 arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'sunn raha hai aashiqui 2 ankit tiwari', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'chahun main yaa naa aashiqui 2', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'raataan lambiyan shershaah', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'ranjha shershaah', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'shayad love aaj kal arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'agar tum saath ho tamasha arijit singh', lang: 'Hindi', type: 'Sad', era: 'now', category: 'Hindi Songs' },
  { q: 'kal ho naa ho sonu nigam', lang: 'Hindi', type: 'Melody', era: '2k', category: 'Hindi Songs' },
  { q: 'tere vaaste zara hatke zara bachke', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'o maahi dunki arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'satranga animal arijit singh', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'pehle bhi main animal vishal mishra', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'arjan vailly animal', lang: 'Hindi', type: 'Rap', era: 'now', category: 'Hindi Songs' },
  { q: 'jhoome jo pathaan arijit singh', lang: 'Hindi', type: 'Kuthu', era: 'now', category: 'Hindi Songs' },
  { q: 'tauba tauba bad newz karan aujla', lang: 'Hindi', type: 'EDM', era: 'now', category: 'Hindi Songs' },
  { q: 've kamleya arijit singh shreya ghoshal', lang: 'Hindi', type: 'Melody', era: 'now', category: 'Hindi Songs' },
  { q: 'tum se hi jab we met mohit chauhan', lang: 'Hindi', type: 'Melody', era: '2k', category: 'Hindi Songs' },

  // English & Global Classics
  { q: 'shape of you ed sheeran', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'perfect ed sheeran', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'believer imagine dragons', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'bones imagine dragons', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'faded alan walker', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'alone alan walker', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'stay the kid laroi justin bieber', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'blinding lights the weeknd', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'starboy the weeknd daft punk', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'something just like this the chainsmokers coldplay', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'closer the chainsmokers halsey', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'senorita shawn mendes camila cabello', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'levitating dua lipa', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'as it was harry styles', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'flowers miley cyrus', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'espresso sabrina carpenter', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'bad guy billie eilish', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'memories maroon 5', lang: 'English', type: 'Melody', era: 'now', category: 'English Songs' },
  { q: 'counting stars onerepublic', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },
  { q: 'let me love you dj snake justin bieber', lang: 'English', type: 'EDM', era: 'now', category: 'English Songs' },

  // Malayalam Hits
  { q: 'illuminati aavesham sushin shyam', lang: 'Malayalam', type: 'Kuthu', era: 'now', category: 'Malayalam Songs' },
  { q: 'jaada aavesham', lang: 'Malayalam', type: 'Rap', era: 'now', category: 'Malayalam Songs' },
  { q: 'kuthanthram manjummel boys sushin shyam', lang: 'Malayalam', type: 'Rap', era: 'now', category: 'Malayalam Songs' },
  { q: 'darshana hridayam hesham abdul wahab', lang: 'Malayalam', type: 'Melody', era: 'now', category: 'Malayalam Songs' },
  { q: 'malare premam vijay yesudas', lang: 'Malayalam', type: 'Melody', era: 'now', category: 'Malayalam Songs' },
  { q: 'aluva puzhayude premam vineeth sreenivasan', lang: 'Malayalam', type: 'Melody', era: 'now', category: 'Malayalam Songs' },
  { q: 'jimikki kammal velipadinte pusthakam', lang: 'Malayalam', type: 'Folk', era: 'now', category: 'Malayalam Songs' },
  { q: 'parudeesa bheeshma parvam sushin shyam', lang: 'Malayalam', type: 'EDM', era: 'now', category: 'Malayalam Songs' },

  // Kannada Hits
  { q: 'singara siriye kantara ajaneesh loknath', lang: 'Kannada', type: 'Melody', era: 'now', category: 'Kannada Songs' },
  { q: 'varaha roopam kantara', lang: 'Kannada', type: 'Devotional', era: 'now', category: 'Kannada Songs' },
  { q: 'ra ra rakkamma vikrant rona', lang: 'Kannada', type: 'Kuthu', era: 'now', category: 'Kannada Songs' },
  { q: 'mehabooba kgf chapter 2 ravi basrur', lang: 'Kannada', type: 'Melody', era: 'now', category: 'Kannada Songs' },
  { q: 'toofan kgf chapter 2 ravi basrur', lang: 'Kannada', type: 'Rap', era: 'now', category: 'Kannada Songs' },
  { q: 'salaam rocky bhai kgf chapter 1', lang: 'Kannada', type: 'Rap', era: 'now', category: 'Kannada Songs' },
  { q: 'dheera dheera kgf chapter 1', lang: 'Kannada', type: 'Rap', era: 'now', category: 'Kannada Songs' },
  { q: 'neene modalu love mocktail', lang: 'Kannada', type: 'Melody', era: 'now', category: 'Kannada Songs' }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function queryJioSaavn(query) {
  const mirrors = [
    'https://jiosaavn-api-sage.vercel.app/api/search/songs?query=',
    'https://jiosaavn-api-nine.vercel.app/api/search/songs?query='
  ];
  for (const base of mirrors) {
    try {
      const data = await fetchJson(base + encodeURIComponent(query));
      if (data && data.data && Array.isArray(data.data.results) && data.data.results.length > 0) {
        return data.data.results;
      }
    } catch (_) {}
  }
  return [];
}

async function run() {
  console.log(`Starting harvest for ${targetHits.length} top world hits...`);
  const harvested = [];

  for (let i = 0; i < targetHits.length; i++) {
    const item = targetHits[i];
    console.log(`[${i + 1}/${targetHits.length}] Searching: ${item.q}...`);
    try {
      const results = await queryJioSaavn(item.q);
      if (results && results.length > 0) {
        // Find best match (avoid teasers / 30s clips)
        const best = results.find(r => r.duration >= 90) || results[0];
        const dl = best.downloadUrl && (best.downloadUrl.find(u => u.quality === '320kbps') || best.downloadUrl[best.downloadUrl.length - 1]);
        const img = best.image && (best.image.find(u => u.quality === '500x500') || best.image[best.image.length - 1]);

        if (dl && dl.url && best.duration >= 60) {
          const primaryArtists = (best.artists && best.artists.primary) ? best.artists.primary.map(a => a.name).join(', ') : '';
          const albumName = best.album ? best.album.name : '';
          const duration = parseInt(best.duration, 10) || 240;

          const songObj = {
            id: `saavn_${best.id || Date.now()}`,
            title: best.name,
            artist: primaryArtists || albumName || 'Original Soundtrack',
            album: albumName || best.name,
            year: best.year || '2024',
            duration: duration,
            duration_str: formatDuration(duration),
            language: item.lang,
            type: item.type.toLowerCase(),
            era: item.era,
            category: item.category,
            sections: ['trending', item.lang.toLowerCase(), `era_${item.era}`],
            cover_url: img ? img.url : 'static/images/only_friends_theme.svg',
            audio_url: dl.url,
            audio_file: '',
            download_authorized: true,
            tags: [
              best.name.toLowerCase(),
              item.lang.toLowerCase(),
              albumName.toLowerCase(),
              primaryArtists.toLowerCase(),
              item.era,
              item.type.toLowerCase()
            ]
          };
          harvested.push(songObj);
          console.log(`  -> Harvested: "${songObj.title}" by ${songObj.artist} (${songObj.duration_str})`);
        }
      }
    } catch (e) {
      console.warn(`  -> Error querying ${item.q}:`, e.message);
    }
  }

  console.log(`Harvest complete! Total new full-length tracks: ${harvested.length}`);

  // Now merge into static/js/songs_data.js
  const songsDataPath = path.join(__dirname, '..', 'static', 'js', 'songs_data.js');
  let content = fs.readFileSync(songsDataPath, 'utf8');

  // Parse existing catalogue
  const prefix = 'window.CATALOGUE_SONGS = ';
  const jsonStr = content.slice(prefix.length).trim().replace(/;$/, '');
  const existingSongs = JSON.parse(jsonStr);
  console.log(`Existing catalogue: ${existingSongs.length} tracks.`);

  const existingMap = new Map();
  existingSongs.forEach(s => {
    const key = (s.title + ' ' + (s.artist || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    existingMap.set(key, s);
    if (s.id) existingMap.set(s.id, s);
  });

  let addedCount = 0;
  for (const song of harvested) {
    const key = (song.title + ' ' + (song.artist || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!existingMap.has(key) && !existingMap.has(song.id)) {
      existingSongs.unshift(song); // Put top hits right at the front!
      existingMap.set(key, song);
      existingMap.set(song.id, song);
      addedCount++;
    }
  }

  console.log(`Successfully added ${addedCount} brand new top hits to CATALOGUE_SONGS!`);
  console.log(`New total in CATALOGUE_SONGS: ${existingSongs.length} tracks.`);

  fs.writeFileSync(songsDataPath, prefix + JSON.stringify(existingSongs) + ';\n');
  console.log(`Updated ${songsDataPath} successfully!`);
}

run();
