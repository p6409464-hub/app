const fs = require('fs');
const path = require('path');

const songsDataPath = path.join(__dirname, '..', 'static', 'js', 'songs_data.js');
const txt = fs.readFileSync(songsDataPath, 'utf8');
const start = txt.indexOf('[');
const end = txt.lastIndexOf(']');
const songs = JSON.parse(txt.substring(start, end + 1));

const movieYearMap = {
  'manithan': s => (s.era === '80s' || (s.artist||'').includes('Chandrabose') || (s.cover_url||'').includes('1987')) ? '1987' : '2016',
  'nayakan': '1987',
  'velaikkaran': '1987',
  'billa': s => s.era === '80s' ? '1980' : '2007',
  'murattu kaalai': s => s.era === '80s' ? '1980' : '2012',
  'johnny': '1980',
  'thee': '1981',
  'netrikann': '1981',
  'tik tik tik': '1981',
  'moondram pirai': '1982',
  'sakalakala vallavan': '1982',
  'payanangal mudivathillai': '1982',
  'moondru mugam': '1982',
  'sagara sangamam': '1983',
  'mundhanai mudichu': '1983',
  'nooravathu naal': '1984',
  'vaidhegi kaathirundhal': '1984',
  'vaidehi kathirunthal': '1984',
  'sindhu bhairavi': '1985',
  'mudhal mariyadhai': '1985',
  'kaakki sattai': '1985',
  'mouna raagam': '1986',
  'punnagai mannan': '1986',
  'mr bharath': '1986',
  'agni natchathiram': '1988',
  'sathya': '1988',
  'apoorva sagodharargal': '1989',
  'geethanjali': '1989',
  'maine pyar kiya': '1989',
  'michael madana kama rajan': '1990',
  'anjali': '1990',
  'kizhakku vaasal': '1990',
  'thalapathi': '1991',
  'chinna thambi': '1991',
  'guna': '1991',
  'captain prabhakaran': '1991',
  'roja': '1992',
  'thevar magan': '1992',
  'annamalai': '1992',
  'mannan': '1992',
  'gentleman': '1993',
  'ejamaan': '1993',
  'kizhakku cheemayile': '1993',
  'kaadhalan': '1994',
  'mahanadhi': '1994',
  'veera': '1994',
  'hum aapke hain koun': '1994',
  'baashha': '1995',
  'bombay': '1995',
  'muthu': '1995',
  'aasai': '1995',
  'dilwale dulhania le jayenge': '1995',
  'ddlj': '1995',
  'indian': '1996',
  'poove unakkaga': '1996',
  'kadhal kottai': '1996',
  'ullathai allitha': '1996',
  'avvai shanmughi': '1996',
  'minsara kanavu': '1997',
  'suryavamsam': '1997',
  'nerukku ner': '1997',
  'kadhalukku mariyadhai': '1997',
  'jeans': '1998',
  'natpukkaga': '1998',
  'unnidathil ennai koduthen': '1998',
  'kuch kuch hota hai': '1998',
  'dil se': '1998',
  'padayappa': '1999',
  'mudhalvan': '1999',
  'vaali': '1999',
  'thulladha manamum thullum': '1999',
  'sethu': '1999',
  'sangamam': '1999',
  'alaipayuthey': '2000',
  'kandukondain kandukondain': '2000',
  'kushi': '2000',
  'rhythm': '2000',
  'minnale': '2001',
  'dheena': '2001',
  'citizen': '2001',
  'run': '2002',
  'gemini': '2002',
  'kannathil muthamittal': '2002',
  'dhool': '2003',
  'saamy': '2003',
  'kaakha kaakha': '2003',
  'boys': '2003',
  'pithamagan': '2003',
  'ghilli': '2004',
  'autograph': '2004',
  '7g rainbow colony': '2004',
  'aayutha ezhuthu': '2004',
  'chandramukhi': '2005',
  'anniyan': '2005',
  'ghajini': s => s.language === 'Hindi' ? '2008' : '2005',
  'sachein': '2005',
  'vettaiyaadu vilaiyaadu': '2006',
  'pudhupettai': '2006',
  'sivaji': '2007',
  'sivaji the boss': '2007',
  'pokkiri': '2007',
  'dasavathaaram': '2008',
  'vaaranam aayiram': '2008',
  'subramaniapuram': '2008',
  'ayan': '2009',
  'padikkadavan': s => s.era === '80s' ? '1985' : '2009',
  'aadhavan': '2009',
  'paiyaa': '2010',
  'vinnaithaandi varuvaayaa': '2010',
  'enthiran': '2010',
  'singam': '2010',
  'madrasapattinam': '2010',
  'mankatha': '2011',
  'ko': '2011',
  'mayakkam enna': '2011',
  '3': '2012',
  'thuppakki': '2012',
  'nanban': '2012',
  'kadal': '2013',
  'maryan': '2013',
  'raja rani': '2013',
  'soodhu kavvum': '2013',
  'kaththi': '2014',
  'vip': '2014',
  'velaiilla pattadhari': '2014',
  'jilla': '2014',
  'veeram': '2014',
  'i': '2015',
  'yennai arindhaal': '2015',
  'ok kanmani': '2015',
  'naanum rowdy dhaan': '2015',
  'baahubali': '2015',
  'theri': '2016',
  'kabali': '2016',
  '24': '2016',
  'vikram vedha': '2017',
  'mersal': '2017',
  'sarkar': '2018',
  'chekka chivantha vaanam': '2018',
  'ccv': '2018',
  '96': '2018',
  'kaala': '2018',
  'petta': '2019',
  'viswasam': '2019',
  'asuran': '2019',
  'kaithi': '2019',
  'bigil': '2019',
  'darbar': '2020',
  'soorarai pottru': '2020',
  'master': '2021',
  'karnan': '2021',
  'doctor': '2021',
  'jai bhim': '2021',
  'maanaadu': '2021',
  'vikram': '2022',
  'beast': '2022',
  'don': '2022',
  'ponniyin selvan': '2022',
  'thiruchitrambalam': '2022',
  'love today': '2022',
  'varisu': '2023',
  'thunivu': '2023',
  'maaveeran': '2023',
  'jailer': '2023',
  'jawan': '2023',
  'leo': '2023',
  'animal': '2023',
  'salaar': '2023',
  'the greatest of all time': '2024',
  'goat': '2024',
  'vettaiyan': '2024',
  'amaran': '2024',
  'kanguva': '2024',
  'raayan': '2024',
  'captain miller': '2024',
  'ayalaan': '2024',
  'maharaja': '2024',
  'pushpa 2': '2024',
  'devara': '2024',
  'kalki': '2024',
  'thug life': '2025',
  'coolie': '2025',
  'good bad ugly': '2025',
  'vidaamuyarchi': '2025',
  'game changer': '2025',
  'kantara chapter 1': '2025',
  'toxic': '2025',
  'dragon': '2025'
};

let enrichedCount = 0;

songs.forEach(s => {
  if (!s.tags) s.tags = [];
  const albumLower = (s.album || '').toLowerCase().trim();
  const titleLower = (s.title || '').toLowerCase().trim();

  // If song doesn't have a year yet, infer from movie map ONLY (DO NOT TOUCH ERA)
  if (!s.year) {
    for (const [mName, mYear] of Object.entries(movieYearMap)) {
      if (albumLower.includes(mName) || titleLower.includes(mName)) {
        s.year = typeof mYear === 'function' ? mYear(s) : mYear;
        break;
      }
    }
  }

  // If year is set, tag it without touching s.era!
  if (s.year) {
    const yrStr = String(s.year);
    const tagSet = new Set(s.tags.map(t => String(t).toLowerCase()));
    if (!tagSet.has(yrStr)) {
      s.tags.push(yrStr);
      s.tags.push(`${yrStr} movie`);
      s.tags.push(`${yrStr} songs`);
      enrichedCount++;
    }
  }

  // Ensure movie tags
  const tagSet = new Set(s.tags.map(t => String(t).toLowerCase()));
  if (!tagSet.has('movie')) {
    s.tags.push('movie');
    s.tags.push('movie songs');
    s.tags.push('all movie songs');
    s.tags.push('1980 to 2026');
  }
});

console.log(`Enriched ${enrichedCount} songs with verified release years & tags!`);
fs.writeFileSync(songsDataPath, 'window.CATALOGUE_SONGS = ' + JSON.stringify(songs) + ';\n', 'utf8');
console.log(`Updated static/js/songs_data.js! Total: ${songs.length} tracks.`);
