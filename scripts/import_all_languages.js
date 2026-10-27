const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function decryptSaavnUrl(encUrl) {
  if (!encUrl) return '';
  try {
    const key = Buffer.from('38346591');
    const decipher = crypto.createDecipheriv('des-ecb', key, null);
    decipher.setAutoPadding(true);
    let dec = decipher.update(encUrl.trim(), 'base64', 'utf8');
    dec += decipher.final('utf8');
    return dec.replace(/_96\.mp4/, '_320.mp4').replace(/_160\.mp4/, '_320.mp4');
  } catch (e) {
    try {
      const key = Buffer.from('38346591');
      const decipher = crypto.createDecipheriv('des-ecb', key, null);
      decipher.setAutoPadding(false);
      let dec = decipher.update(encUrl.trim(), 'base64', 'utf8');
      dec += decipher.final('utf8');
      return dec.replace(/[\x00-\x1F\x7F-\x9F]/g, '').replace(/_96\.mp4/, '_320.mp4').replace(/_160\.mp4/, '_320.mp4');
    } catch(err) {
      return '';
    }
  }
}

function searchJioSaavn(query, count = 10) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${count}&p=1&q=${encodeURIComponent(query)}`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

function determineEra(year) {
  const y = parseInt(year, 10);
  if (!y) return 'now';
  if (y < 1990) return '80s';
  if (y < 2000) return '90s';
  if (y < 2010) return '2k';
  return 'now';
}

function cleanHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function run() {
  const targetAlbums = [
    // --- TAMIL MORE ALBUMS ---
    { query: 'Sivaji The Boss Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Mankatha Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Enthiran Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Vinnaithaandi Varuvaayaa Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Paiyaa Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Ayan Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Ghilli Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Pokkiri Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Thiruchitrambalam Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Vikram Vedha Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kaithi Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Thani Oruvan Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Amaran Tamil Sivakarthikeyan', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kanguva Tamil Suriya', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'The Greatest Of All Time GOAT Tamil', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Mouna Raagam Ilaiyaraaja', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Nayagan Ilaiyaraaja', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Thalapathi Ilaiyaraaja', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Roja AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Bombay AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Baashha Deva', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Padayappa AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Muthu AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Annamalai Deva', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kaadhalan AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Jeans AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Alaipayuthey AR Rahman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Minnale Harris Jayaraj', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kaakha Kaakha Harris Jayaraj', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Vettaiyaadu Vilaiyaadu Harris Jayaraj', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Vaaranam Aayiram Harris Jayaraj', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Anniyan Harris Jayaraj', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Dhool Vidyasagar', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Chandramukhi Vidyasagar', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Pudhupettai Yuvan Shankar Raja', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: '7G Rainbow Colony Yuvan', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Billa Yuvan Shankar Raja', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Viswasam D Imman', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Sarpatta Parambarai Santhosh Narayanan', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Vada Chennai Santhosh Narayanan', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kabali Santhosh Narayanan', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Asuran GV Prakash', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Soorarai Pottru GV Prakash', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Theri GV Prakash', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Kaththi Anirudh', lang: 'Tamil', cat: 'Tamil Songs' },
    { query: 'Petta Anirudh', lang: 'Tamil', cat: 'Tamil Songs' },

    // --- TELUGU ALBUMS ---
    { query: 'Pushpa 2 The Rule Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Pushpa The Rise Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Devara Part 1 Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Guntur Kaaram Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Kalki 2898 AD Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Ala Vaikunthapurramuloo Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'RRR Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Baahubali 2 The Conclusion Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Geetha Govindam Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Rangasthalam Telugu', lang: 'Telugu', cat: 'Telugu Songs' },
    { query: 'Jersey Telugu', lang: 'Telugu', cat: 'Telugu Songs' },

    // --- HINDI / BOLLYWOOD ALBUMS ---
    { query: 'Animal Hindi Ranbir Kapoor', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Jawan Hindi Anirudh', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Pathaan Hindi Vishal Shekhar', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Kabir Singh Hindi', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Brahmastra Hindi Pritam', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Stree 2 Hindi', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Fighter Hindi Hrithik', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Rockstar Hindi AR Rahman', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Yeh Jawaani Hai Deewani Pritam', lang: 'Hindi', cat: 'Hindi Songs' },
    { query: 'Aashiqui 2 Mithoon Arijit', lang: 'Hindi', cat: 'Hindi Songs' },

    // --- MALAYALAM ALBUMS ---
    { query: 'Aavesham Malayalam Sushin Shyam', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Premam Malayalam Nivin Pauly', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Manjummel Boys Malayalam', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Hridayam Malayalam Hesham Abdul Wahab', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Minnal Murali Malayalam Shaan Rahman', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'RDX Malayalam Jakes Bejoy', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Bangalore Days Gopi Sundar', lang: 'Malayalam', cat: 'Malayalam Songs' },
    { query: 'Charlie Malayalam Gopi Sundar', lang: 'Malayalam', cat: 'Malayalam Songs' },

    // --- KANNADA ALBUMS ---
    { query: 'KGF Chapter 1 Kannada Ravi Basrur', lang: 'Kannada', cat: 'Kannada Songs' },
    { query: 'KGF Chapter 2 Kannada Ravi Basrur', lang: 'Kannada', cat: 'Kannada Songs' },
    { query: 'Kantara Kannada Ajaneesh Loknath', lang: 'Kannada', cat: 'Kannada Songs' },
    { query: '777 Charlie Kannada Nobin Paul', lang: 'Kannada', cat: 'Kannada Songs' },
    { query: 'Vikrant Rona Kannada Ajaneesh Loknath', lang: 'Kannada', cat: 'Kannada Songs' },
    { query: 'Kirik Party Kannada Ajaneesh Loknath', lang: 'Kannada', cat: 'Kannada Songs' },

    // --- ENGLISH GLOBAL ALBUMS ---
    { query: 'Ed Sheeran Divide', lang: 'English', cat: 'English Songs' },
    { query: 'The Weeknd After Hours', lang: 'English', cat: 'English Songs' },
    { query: 'Taylor Swift 1989', lang: 'English', cat: 'English Songs' },
    { query: 'Billie Eilish Happier Than Ever', lang: 'English', cat: 'English Songs' },
    { query: 'Imagine Dragons Mercury', lang: 'English', cat: 'English Songs' }
  ];

  // Load existing songs
  const songsDataPath = path.join(__dirname, '..', 'static', 'js', 'songs_data.js');
  const txt = fs.readFileSync(songsDataPath, 'utf8');
  const start = txt.indexOf('[');
  const end = txt.lastIndexOf(']');
  const existingSongs = JSON.parse(txt.substring(start, end + 1));
  const seenIds = new Set(existingSongs.map(s => s.id));
  const seenKeys = new Set(existingSongs.map(s => `${(s.title || '').toLowerCase()}::${(s.album || '').toLowerCase()}`));

  console.log(`Initial catalogue has ${existingSongs.length} songs.`);

  const newTracks = [];

  for (const item of targetAlbums) {
    try {
      const results = await searchJioSaavn(item.query, 8);
      let countAdded = 0;
      for (const r of results) {
        if (!r.id || seenIds.has(`saavn_${r.id}`)) continue;

        const more = r.more_info || {};
        const encUrl = more.encrypted_media_url;
        const audioUrl = decryptSaavnUrl(encUrl);
        if (!audioUrl) continue;

        const title = cleanHtml(r.title);
        const album = cleanHtml(more.album || r.album || 'Single');
        const artist = cleanHtml(more.singers || r.subtitle || 'Artist');
        const year = r.year || more.year || '2024';
        const dur = parseInt(more.duration || r.duration || 210, 10);
        const m = Math.floor(dur / 60);
        const s = dur % 60;
        const durStr = `${m}:${s < 10 ? '0' : ''}${s}`;
        const cover = (r.image || '').replace('150x150', '500x500');

        const trackKey = `${title.toLowerCase()}::${album.toLowerCase()}`;
        if (seenKeys.has(trackKey)) continue;

        const era = determineEra(year);
        const langLower = item.lang.toLowerCase();
        const tags = [
          title.toLowerCase(),
          album.toLowerCase(),
          artist.toLowerCase(),
          item.lang.toLowerCase(),
          era,
          `${era} movie`,
          `${era} songs`,
          'trending'
        ];

        const songObj = {
          id: `saavn_${r.id}`,
          title: title,
          artist: artist,
          album: album,
          duration: dur,
          duration_str: durStr,
          language: item.lang,
          era: era,
          category: item.cat,
          sections: ['trending', 'recent', `era_${era}`, langLower],
          cover_url: cover || 'static/images/only_friends_theme.svg',
          audio_url: audioUrl,
          download_authorized: true,
          tags: tags
        };

        seenIds.add(songObj.id);
        seenKeys.add(trackKey);
        newTracks.push(songObj);
        countAdded++;
      }
      console.log(`Fetched [${item.lang}] "${item.query}" -> added ${countAdded} tracks.`);
    } catch(err) {
      console.warn(`Error on "${item.query}":`, err.message);
    }
  }

  console.log(`\nTotal new tracks to add: ${newTracks.length}`);
  if (newTracks.length > 0) {
    const updatedSongs = [...newTracks, ...existingSongs];
    fs.writeFileSync(songsDataPath, 'window.CATALOGUE_SONGS = ' + JSON.stringify(updatedSongs) + ';\n', 'utf8');
    console.log(`Successfully updated static/js/songs_data.js! New Total: ${updatedSongs.length} songs.`);
  }
}

run();
