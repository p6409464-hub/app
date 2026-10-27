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

function searchJioSaavn(query, count = 8) {
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
  const targetTypeQueries = [
    // ==========================================
    // 1. MELODY & ROMANTIC SONGS (All Languages & Spotify Top)
    // ==========================================
    { query: 'Tamil Romantic Melody Hits Sid Sriram', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: 'now' },
    { query: 'Vaseegara Minnale Bombay Jayashri', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: '2k', year: '2001' },
    { query: 'Enna Solla Pogirai Kandukondain Shankar Mahadevan', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: '2k', year: '2000' },
    { query: 'Munbe Vaa Sillunu Oru Kaadhal Shreya Ghoshal', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: '2k', year: '2006' },
    { query: 'Ennavale Adi Ennavale Kadhalan Unnikrishnan', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: '90s', year: '1994' },
    { query: 'Pookkale Sattru Oyivedungal I AR Rahman', lang: 'Tamil', type: 'melody', cat: 'Tamil Songs', era: 'now', year: '2015' },
    { query: 'Samajavaragamana Ala Vaikunthapurramuloo Sid Sriram', lang: 'Telugu', type: 'melody', cat: 'Telugu Songs', era: 'now', year: '2020' },
    { query: 'Inkem Inkem Inkem Kaavaale Geetha Govindam', lang: 'Telugu', type: 'melody', cat: 'Telugu Songs', era: 'now', year: '2018' },
    { query: 'Kesariya Brahmastra Arijit Singh', lang: 'Hindi', type: 'melody', cat: 'Hindi Songs', era: 'now', year: '2022' },
    { query: 'Tum Hi Ho Aashiqui 2 Arijit Singh', lang: 'Hindi', type: 'melody', cat: 'Hindi Songs', era: 'now', year: '2013' },
    { query: 'Malare Premam Vijay Yesudas', lang: 'Malayalam', type: 'melody', cat: 'Malayalam Songs', era: 'now', year: '2015' },
    { query: 'Golden Hour Jvke', lang: 'English', type: 'melody', cat: 'English Songs', era: 'now', year: '2022' },
    { query: 'Until I Found You Stephen Sanchez', lang: 'English', type: 'melody', cat: 'English Songs', era: 'now', year: '2022' },

    // ==========================================
    // 2. KUTHU, FAST BEAT, DANCE & MASS PARTY HITS
    // ==========================================
    { query: 'Vaathi Coming Master Anirudh', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2021' },
    { query: 'Arabic Kuthu Beast Anirudh Jonita', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2022' },
    { query: 'Naa Ready Leo Vijay Anirudh', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2023' },
    { query: 'Rowdy Baby Maari 2 Dhanush Dhee', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2018' },
    { query: 'Aaluma Doluma Vedalam Anirudh Badshah', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2015' },
    { query: 'Appadi Podu Ghilli KK Anuradha Sriram', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: '2k', year: '2004' },
    { query: 'Jalabulanjangu Don Anirudh', lang: 'Tamil', type: 'kuthu', cat: 'Tamil Songs', era: 'now', year: '2022' },
    { query: 'Oo Antava Pushpa Indravathi Chauhan DSP', lang: 'Telugu', type: 'kuthu', cat: 'Telugu Songs', era: 'now', year: '2021' },
    { query: 'Kurchi Madathapetti Guntur Kaaram Thaman', lang: 'Telugu', type: 'kuthu', cat: 'Telugu Songs', era: 'now', year: '2024' },
    { query: 'Tauba Tauba Bad Newz Karan Aujla', lang: 'Hindi', type: 'kuthu', cat: 'Hindi Songs', era: 'now', year: '2024' },
    { query: 'Jhoome Jo Pathaan Arijit Singh Vishal', lang: 'Hindi', type: 'kuthu', cat: 'Hindi Songs', era: 'now', year: '2023' },
    { query: 'Illuminati Aavesham Sushin Shyam', lang: 'Malayalam', type: 'kuthu', cat: 'Malayalam Songs', era: 'now', year: '2024' },

    // ==========================================
    // 3. GAANA, VILLAGE FOLK & DAPPANKUTHU
    // ==========================================
    { query: 'Enjoy Enjaami Dhee Arivu Santhosh Narayanan', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now', year: '2021' },
    { query: 'Danga Maari Oodhari Anegan Dhanush', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now', year: '2015' },
    { query: 'Anthony Daasan Tamil Folk Songs', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now' },
    { query: 'Gana Bala Tamil Gaana Hits', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now' },
    { query: 'Asa Kooda Sai Abhyankkar Think Indie', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now', year: '2024' },
    { query: 'Katchi Sera Sai Abhyankkar', lang: 'Tamil', type: 'folk', cat: 'Tamil Songs', era: 'now', year: '2024' },
    { query: 'Bullet Song The Warriorr Silambarasan DSP', lang: 'Telugu', type: 'folk', cat: 'Telugu Songs', era: 'now', year: '2022' },
    { query: 'Ramuloo Ramulaa Ala Vaikunthapurramuloo Anurag', lang: 'Telugu', type: 'folk', cat: 'Telugu Songs', era: 'now', year: '2020' },

    // ==========================================
    // 4. SAD, HEARTBREAK & EMOTIONAL MELODIES
    // ==========================================
    { query: 'Po Nee Po 3 Dhanush Anirudh Mohit Chauhan', lang: 'Tamil', type: 'sad', cat: 'Tamil Songs', era: 'now', year: '2012' },
    { query: 'Amma Amma VIP Dhanush SPB Anirudh', lang: 'Tamil', type: 'sad', cat: 'Tamil Songs', era: 'now', year: '2014' },
    { query: 'Kanave Kanave David Anirudh', lang: 'Tamil', type: 'sad', cat: 'Tamil Songs', era: 'now', year: '2013' },
    { query: 'Poo Avizhum Pozhudhil Maryan Dhanush AR Rahman', lang: 'Tamil', type: 'sad', cat: 'Tamil Songs', era: 'now', year: '2013' },
    { query: 'Yennai Maatrum Kadhale Naanum Rowdy Dhaan Sid Sriram', lang: 'Tamil', type: 'sad', cat: 'Tamil Songs', era: 'now', year: '2015' },
    { query: 'Channa Mereya Ae Dil Hai Mushkil Arijit Singh', lang: 'Hindi', type: 'sad', cat: 'Hindi Songs', era: 'now', year: '2016' },
    { query: 'Agar Tum Saath Ho Tamasha Arijit Alka Yagnik', lang: 'Hindi', type: 'sad', cat: 'Hindi Songs', era: 'now', year: '2015' },
    { query: 'Bekhayali Kabir Singh Sachet Tandon', lang: 'Hindi', type: 'sad', cat: 'Hindi Songs', era: 'now', year: '2019' },
    { query: 'Someone You Loved Lewis Capaldi', lang: 'English', type: 'sad', cat: 'English Songs', era: 'now', year: '2019' },

    // ==========================================
    // 5. DEVOTIONAL & SPIRITUAL (Tamil, Telugu, Hindi)
    // ==========================================
    { query: 'Kanda Sashti Kavasam Mahanadhi Shobana', lang: 'Tamil', type: 'devotional', cat: 'Tamil Songs', era: '90s', year: '1995' },
    { query: 'Harivarasanam KJ Yesudas Sabarimala Ayyappa', lang: 'Malayalam', type: 'devotional', cat: 'Malayalam Songs', era: '80s', year: '1982' },
    { query: 'Vinayagar Agaval Seerkazhi Govindarajan', lang: 'Tamil', type: 'devotional', cat: 'Tamil Songs', era: '80s', year: '1980' },
    { query: 'Hanuman Chalisa Hariharan Gulshan Kumar', lang: 'Hindi', type: 'devotional', cat: 'Hindi Songs', era: '90s', year: '1992' },
    { query: 'Aigiri Nandini Mahishasura Mardini Stotram', lang: 'Tamil', type: 'devotional', cat: 'Tamil Songs', era: '2k', year: '2005' },
    { query: 'Shiva Tandava Stotram Shankar Mahadevan', lang: 'Hindi', type: 'devotional', cat: 'Hindi Songs', era: '2k', year: '2008' },
    { query: 'Namo Namo Kedarnath Amit Trivedi', lang: 'Hindi', type: 'devotional', cat: 'Hindi Songs', era: 'now', year: '2018' },
    { query: 'Venkateswara Suprabhatam MS Subbulakshmi', lang: 'Telugu', type: 'devotional', cat: 'Telugu Songs', era: '80s', year: '1980' },

    // ==========================================
    // 6. RAP, HIP-HOP & INDIE MUSIC
    // ==========================================
    { query: 'Arivu Tamil Rap Independent', lang: 'Tamil', type: 'rap', cat: 'Tamil Songs', era: 'now' },
    { query: 'Yogi B Natchatra Madai Thiranthu', lang: 'Tamil', type: 'rap', cat: 'Tamil Songs', era: '2k', year: '2006' },
    { query: 'Brodha V Aathma Raama Way Too Easy', lang: 'English', type: 'rap', cat: 'English Songs', era: 'now', year: '2015' },
    { query: 'Maan Meri Jaan King', lang: 'Hindi', type: 'rap', cat: 'Hindi Songs', era: 'now', year: '2022' },
    { query: 'Tu Aake Dekhle King The Carnival', lang: 'Hindi', type: 'rap', cat: 'Hindi Songs', era: 'now', year: '2020' },
    { query: 'DIVINE Mirchi Kohinoor Vivian', lang: 'Hindi', type: 'rap', cat: 'Hindi Songs', era: 'now', year: '2020' },
    { query: 'Eminem Lose Yourself Mockingbird', lang: 'English', type: 'rap', cat: 'English Songs', era: '2k', year: '2002' },
    { query: 'Post Malone Sunflower Circles', lang: 'English', type: 'rap', cat: 'English Songs', era: 'now', year: '2018' },

    // ==========================================
    // 7. LOFI, CHILL & ACOUSTIC BEATS
    // ==========================================
    { query: 'Tamil Lofi Chill Beats', lang: 'Tamil', type: 'lofi', cat: 'Tamil Songs', era: 'now' },
    { query: 'Bollywood Lofi Midnight Vibes', lang: 'Hindi', type: 'lofi', cat: 'Hindi Songs', era: 'now' },
    { query: 'Acoustic Guitar Melodies Calm', lang: 'Instrumental', type: 'lofi', cat: 'Instrumental Music', era: 'now' },
    { query: 'Coffee And Rain Chill Lofi', lang: 'Instrumental', type: 'lofi', cat: 'Instrumental Music', era: 'now' },

    // ==========================================
    // 8. EDM, REMIX & CLUB ANTHEMS
    // ==========================================
    { query: 'Alan Walker Faded Spectre On My Way', lang: 'English', type: 'edm', cat: 'English Songs', era: 'now', year: '2015' },
    { query: 'Avicii Wake Me Up The Nights', lang: 'English', type: 'edm', cat: 'English Songs', era: 'now', year: '2013' },
    { query: 'The Chainsmokers Closer Don t Let Me Down', lang: 'English', type: 'edm', cat: 'English Songs', era: 'now', year: '2016' },
    { query: 'DJ Snake Let Me Love You Taki Taki', lang: 'English', type: 'edm', cat: 'English Songs', era: 'now', year: '2016' },

    // ==========================================
    // 9. SPOTIFY GLOBAL TOP CHARTBUSTERS
    // ==========================================
    { query: 'Espresso Sabrina Carpenter', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2024' },
    { query: 'Birds Of A Feather Billie Eilish', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2024' },
    { query: 'Starboy The Weeknd Daft Punk', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2016' },
    { query: 'Cruel Summer Taylor Swift Lover', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2019' },
    { query: 'Blinding Lights The Weeknd After Hours', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2020' },
    { query: 'Believer Imagine Dragons Evolve', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2017' },
    { query: 'Heat Waves Glass Animals Dreamland', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2020' },
    { query: 'As It Was Harry Styles Harrys House', lang: 'English', type: 'spotify', cat: 'English Songs', era: 'now', year: '2022' }
  ];

  // Load existing catalogue
  const songsDataPath = path.join(__dirname, '..', 'static', 'js', 'songs_data.js');
  const txt = fs.readFileSync(songsDataPath, 'utf8');
  const start = txt.indexOf('[');
  const end = txt.lastIndexOf(']');
  const existingSongs = JSON.parse(txt.substring(start, end + 1));
  const seenIds = new Set(existingSongs.map(s => s.id));
  const seenKeys = new Set(existingSongs.map(s => `${(s.title || '').toLowerCase()}::${(s.album || '').toLowerCase()}`));

  console.log(`Starting with ${existingSongs.length} existing songs.`);

  const newTracks = [];

  for (let i = 0; i < targetTypeQueries.length; i++) {
    const item = targetTypeQueries[i];
    try {
      const results = await searchJioSaavn(item.query, 6);
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
        const trackYear = item.year || r.year || more.year || '2024';
        const dur = parseInt(more.duration || r.duration || 210, 10);
        const m = Math.floor(dur / 60);
        const s = dur % 60;
        const durStr = `${m}:${s < 10 ? '0' : ''}${s}`;
        const cover = (r.image || '').replace('150x150', '500x500');

        const trackKey = `${title.toLowerCase()}::${album.toLowerCase()}`;
        if (seenKeys.has(trackKey)) continue;

        const era = item.era || determineEra(trackYear);
        const langLower = item.lang.toLowerCase();

        const tags = [
          title.toLowerCase(),
          album.toLowerCase(),
          artist.toLowerCase(),
          item.lang.toLowerCase(),
          item.type,
          `${item.type} songs`,
          `${item.type} hits`,
          era,
          `${era} songs`,
          `${era} movie`,
          trackYear,
          `${trackYear} songs`,
          'movie',
          'movie songs',
          'all movie songs',
          '1980 to 2026',
          'jiosaavn',
          'spotify',
          'trending'
        ];

        const songObj = {
          id: `saavn_${r.id}`,
          title: title,
          artist: artist,
          album: album,
          year: trackYear,
          duration: dur,
          duration_str: durStr,
          language: item.lang,
          type: item.type,
          era: era,
          category: item.cat,
          sections: ['trending', 'recent', `type_${item.type}`, `era_${era}`, langLower],
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
      console.log(`[${i + 1}/${targetTypeQueries.length}] [${item.type.toUpperCase()}] "${item.query}" -> +${countAdded} tracks.`);
    } catch(err) {
      console.warn(`Error on query "${item.query}":`, err.message);
    }
  }

  console.log(`\nImported ${newTracks.length} new songs across all genres/types & Spotify chartbusters!`);

  // Also tag existing songs with their type if matched by keywords
  let taggedExisting = 0;
  existingSongs.forEach(s => {
    if (!s.tags) s.tags = [];
    const tSet = new Set(s.tags.map(t => String(t).toLowerCase()));
    const titleAndAlbum = `${s.title || ''} ${s.album || ''} ${s.artist || ''}`.toLowerCase();

    // Tag melody
    if (!s.type) {
      if (/melody|love|kadhale|kadhal|romantic|kanmani|malare|vaseegara|munbe|poove/i.test(titleAndAlbum)) {
        s.type = 'melody';
      } else if (/kuthu|dance|mass|party|danga|rowdy|aaluma|kurchi|arabic|vaathi/i.test(titleAndAlbum)) {
        s.type = 'kuthu';
      } else if (/folk|gaana|dappankuthu|enjoy|anthony|bala/i.test(titleAndAlbum)) {
        s.type = 'folk';
      } else if (/sad|pain|break|alone|po nee|kanave|amma amma|channa/i.test(titleAndAlbum)) {
        s.type = 'sad';
      } else if (/devotional|god|swamy|kavasam|agaval|chalisa|shiva|murugan|ayyappa/i.test(titleAndAlbum)) {
        s.type = 'devotional';
      } else if (/rap|hip hop|hiphop|arivu|divine|king|mc|badshah/i.test(titleAndAlbum)) {
        s.type = 'rap';
      } else if (/lofi|chill|acoustic|relax|sleep|peace/i.test(titleAndAlbum)) {
        s.type = 'lofi';
      } else if (/edm|remix|dj|alan walker|avicii|chainsmokers/i.test(titleAndAlbum)) {
        s.type = 'edm';
      } else if (s.language === 'English' || /spotify|billie|swift|weeknd/i.test(titleAndAlbum)) {
        s.type = 'spotify';
      } else {
        s.type = 'melody';
      }
    }

    if (s.type && !tSet.has(s.type)) {
      s.tags.push(s.type);
      s.tags.push(`${s.type} songs`);
      s.tags.push(`${s.type} hits`);
      s.tags.push('jiosaavn');
      s.tags.push('spotify');
      if (s.sections && !s.sections.includes(`type_${s.type}`)) {
        s.sections.push(`type_${s.type}`);
      }
      taggedExisting++;
    }
  });

  const mergedTotal = [...newTracks, ...existingSongs];
  console.log(`Writing ${mergedTotal.length} songs to static/js/songs_data.js...`);
  fs.writeFileSync(songsDataPath, 'window.CATALOGUE_SONGS = ' + JSON.stringify(mergedTotal) + ';\n', 'utf8');
  console.log(`Successfully updated static/js/songs_data.js! New Total: ${mergedTotal.length} tracks. (Tagged ${taggedExisting} existing songs)`);
}

run();
