const https = require('https');
const crypto = require('crypto');

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

function searchJioSaavn(query) {
  const url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=5&p=1&q=' + encodeURIComponent(query);
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

async function test() {
  const results = await searchJioSaavn('Sivaji The Boss');
  console.log('Results:', results.length);
  for (const r of results.slice(0, 3)) {
    const url = decryptSaavnUrl(r.more_info?.encrypted_media_url);
    console.log(r.title, '| Album:', r.more_info?.album, '| Audio:', url);
  }
}
test();
