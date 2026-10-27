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
  const targetMovieAlbums = [
    // ==========================================
    // 1980 - 1989 (80s CLASSIC MOVIES)
    // ==========================================
    { query: 'Billa 1980 Rajinikanth MSV', lang: 'Tamil', year: '1980', era: '80s' },
    { query: 'Murattu Kaalai 1980 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1980', era: '80s' },
    { query: 'Johnny 1980 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1980', era: '80s' },
    { query: 'Varumayin Niram Sivappu 1980 Kamal Haasan', lang: 'Tamil', year: '1980', era: '80s' },
    { query: 'Nenjathai Killathe 1980 Ilaiyaraaja', lang: 'Tamil', year: '1980', era: '80s' },
    { query: 'Karz 1980 Kishore Kumar Laxmikant Pyarelal', lang: 'Hindi', year: '1980', era: '80s' },
    { query: 'Thee 1981 Rajinikanth MSV', lang: 'Tamil', year: '1981', era: '80s' },
    { query: 'Netrikann 1981 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1981', era: '80s' },
    { query: 'Tik Tik Tik 1981 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1981', era: '80s' },
    { query: 'Silsila 1981 Amitabh Shiv Hari', lang: 'Hindi', year: '1981', era: '80s' },
    { query: 'Moondram Pirai 1982 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1982', era: '80s' },
    { query: 'Sakalakala Vallavan 1982 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1982', era: '80s' },
    { query: 'Payanangal Mudivathillai 1982 Mohan Ilaiyaraaja', lang: 'Tamil', year: '1982', era: '80s' },
    { query: 'Moondru Mugam 1982 Rajinikanth', lang: 'Tamil', year: '1982', era: '80s' },
    { query: 'Sagara Sangamam 1983 Kamal Haasan Ilaiyaraaja', lang: 'Telugu', year: '1983', era: '80s' },
    { query: 'Mundhanai Mudichu 1983 Bhagyaraj Ilaiyaraaja', lang: 'Tamil', year: '1983', era: '80s' },
    { query: 'Nooravathu Naal 1984 Mohan Ilaiyaraaja', lang: 'Tamil', year: '1984', era: '80s' },
    { query: 'Vaidhegi Kaathirundhal 1984 Vijayakanth Ilaiyaraaja', lang: 'Tamil', year: '1984', era: '80s' },
    { query: 'Nallavanuku Nallavan 1984 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1984', era: '80s' },
    { query: 'Mudhal Mariyadhai 1985 Sivaji Ganesan Ilaiyaraaja', lang: 'Tamil', year: '1985', era: '80s' },
    { query: 'Sindhu Bhairavi 1985 Sivakumar Ilaiyaraaja', lang: 'Tamil', year: '1985', era: '80s' },
    { query: 'Kaakki Sattai 1985 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1985', era: '80s' },
    { query: 'Mouna Raagam 1986 Mohan Revathi Ilaiyaraaja', lang: 'Tamil', year: '1986', era: '80s' },
    { query: 'Punnagai Mannan 1986 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1986', era: '80s' },
    { query: 'Mr Bharath 1986 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1986', era: '80s' },
    { query: 'Nayakan 1987 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1987', era: '80s' },
    { query: 'Manithan 1987 Rajinikanth Chandrabose', lang: 'Tamil', year: '1987', era: '80s' },
    { query: 'Velaikkaran 1987 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1987', era: '80s' },
    { query: 'Agni Natchathiram 1988 Prabhu Karthik Ilaiyaraaja', lang: 'Tamil', year: '1988', era: '80s' },
    { query: 'Sathya 1988 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1988', era: '80s' },
    { query: 'Dharmathin Thalaivan 1988 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1988', era: '80s' },
    { query: 'Qayamat Se Qayamat Tak 1988 Aamir Khan', lang: 'Hindi', year: '1988', era: '80s' },
    { query: 'Apoorva Sagodharargal 1989 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1989', era: '80s' },
    { query: 'Geethanjali 1989 Nagarjuna Ilaiyaraaja', lang: 'Telugu', year: '1989', era: '80s' },
    { query: 'Maine Pyar Kiya 1989 Salman Khan SPB', lang: 'Hindi', year: '1989', era: '80s' },
    { query: 'Shiva 1989 Nagarjuna Ilaiyaraaja', lang: 'Telugu', year: '1989', era: '80s' },

    // ==========================================
    // 1990 - 1999 (90s GOLDEN DECADE MOVIES)
    // ==========================================
    { query: 'Michael Madana Kama Rajan 1990 Kamal Haasan', lang: 'Tamil', year: '1990', era: '90s' },
    { query: 'Anjali 1990 Ilaiyaraaja Mani Ratnam', lang: 'Tamil', year: '1990', era: '90s' },
    { query: 'Kizhakku Vaasal 1990 Karthik Ilaiyaraaja', lang: 'Tamil', year: '1990', era: '90s' },
    { query: 'Aashiqui 1990 Kumar Sanu Nadeem Shravan', lang: 'Hindi', year: '1990', era: '90s' },
    { query: 'Thalapathi 1991 Rajinikanth Mammootty Ilaiyaraaja', lang: 'Tamil', year: '1991', era: '90s' },
    { query: 'Chinna Thambi 1991 Prabhu Ilaiyaraaja', lang: 'Tamil', year: '1991', era: '90s' },
    { query: 'Guna 1991 Kamal Haasan Ilaiyaraaja Kanmani Anbodu', lang: 'Tamil', year: '1991', era: '90s' },
    { query: 'Captain Prabhakaran 1991 Vijayakanth Ilaiyaraaja', lang: 'Tamil', year: '1991', era: '90s' },
    { query: 'Roja 1992 AR Rahman Mani Ratnam', lang: 'Tamil', year: '1992', era: '90s' },
    { query: 'Thevar Magan 1992 Kamal Haasan Sivaji Ilaiyaraaja', lang: 'Tamil', year: '1992', era: '90s' },
    { query: 'Annamalai 1992 Rajinikanth Deva', lang: 'Tamil', year: '1992', era: '90s' },
    { query: 'Mannan 1992 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1992', era: '90s' },
    { query: 'Gentleman 1993 AR Rahman Shankar', lang: 'Tamil', year: '1993', era: '90s' },
    { query: 'Ejamaan 1993 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1993', era: '90s' },
    { query: 'Kizhakku Cheemayile 1993 AR Rahman', lang: 'Tamil', year: '1993', era: '90s' },
    { query: 'Baazigar 1993 Shah Rukh Khan Anu Malik', lang: 'Hindi', year: '1993', era: '90s' },
    { query: 'Kaadhalan 1994 AR Rahman Prabhu Deva', lang: 'Tamil', year: '1994', era: '90s' },
    { query: 'Mahanadhi 1994 Kamal Haasan Ilaiyaraaja', lang: 'Tamil', year: '1994', era: '90s' },
    { query: 'Veera 1994 Rajinikanth Ilaiyaraaja', lang: 'Tamil', year: '1994', era: '90s' },
    { query: 'Hum Aapke Hain Koun 1994 Salman Madhuri SPB', lang: 'Hindi', year: '1994', era: '90s' },
    { query: 'Baashha 1995 Rajinikanth Deva', lang: 'Tamil', year: '1995', era: '90s' },
    { query: 'Bombay 1995 AR Rahman Mani Ratnam', lang: 'Tamil', year: '1995', era: '90s' },
    { query: 'Muthu 1995 Rajinikanth AR Rahman', lang: 'Tamil', year: '1995', era: '90s' },
    { query: 'Aasai 1995 Ajith Kumar Deva', lang: 'Tamil', year: '1995', era: '90s' },
    { query: 'Dilwale Dulhania Le Jayenge DDLJ 1995', lang: 'Hindi', year: '1995', era: '90s' },
    { query: 'Indian 1996 Kamal Haasan AR Rahman', lang: 'Tamil', year: '1996', era: '90s' },
    { query: 'Poove Unakkaga 1996 Vijay SA Rajkumar', lang: 'Tamil', year: '1996', era: '90s' },
    { query: 'Kadhal Kottai 1996 Ajith Deva', lang: 'Tamil', year: '1996', era: '90s' },
    { query: 'Ullathai Allitha 1996 Karthik Sirpy', lang: 'Tamil', year: '1996', era: '90s' },
    { query: 'Avvai Shanmughi 1996 Kamal Haasan Deva', lang: 'Tamil', year: '1996', era: '90s' },
    { query: 'Minsara Kanavu 1997 AR Rahman Prabhu Deva', lang: 'Tamil', year: '1997', era: '90s' },
    { query: 'Suryavamsam 1997 Sarathkumar SA Rajkumar', lang: 'Tamil', year: '1997', era: '90s' },
    { query: 'Nerukku Ner 1997 Vijay Suriya Deva', lang: 'Tamil', year: '1997', era: '90s' },
    { query: 'Kadhalukku Mariyadhai 1997 Vijay Ilaiyaraaja', lang: 'Tamil', year: '1997', era: '90s' },
    { query: 'Jeans 1998 Prashanth Aishwarya Rai AR Rahman', lang: 'Tamil', year: '1998', era: '90s' },
    { query: 'Natpukkaga 1998 Sarathkumar Deva', lang: 'Tamil', year: '1998', era: '90s' },
    { query: 'Unnidathil Ennai Koduthen 1998 Karthik SA Rajkumar', lang: 'Tamil', year: '1998', era: '90s' },
    { query: 'Kuch Kuch Hota Hai 1998 Shah Rukh Khan', lang: 'Hindi', year: '1998', era: '90s' },
    { query: 'Dil Se 1998 AR Rahman Shah Rukh Khan', lang: 'Hindi', year: '1998', era: '90s' },
    { query: 'Padayappa 1999 Rajinikanth AR Rahman', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Mudhalvan 1999 Arjun Shankar AR Rahman', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Vaali 1999 Ajith Simran Deva', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Thulladha Manamum Thullum 1999 Vijay SA Rajkumar', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Sethu 1999 Vikram Ilaiyaraaja', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Sangamam 1999 AR Rahman', lang: 'Tamil', year: '1999', era: '90s' },
    { query: 'Hum Dil De Chuke Sanam 1999 Ismail Darbar', lang: 'Hindi', year: '1999', era: '90s' },

    // ==========================================
    // 2000 - 2009 (2K ERA BLOCKBUSTERS)
    // ==========================================
    { query: 'Alaipayuthey 2000 Madhavan AR Rahman', lang: 'Tamil', year: '2000', era: '2k' },
    { query: 'Kandukondain Kandukondain 2000 AR Rahman', lang: 'Tamil', year: '2000', era: '2k' },
    { query: 'Kushi 2000 Vijay Jyothika Deva', lang: 'Tamil', year: '2000', era: '2k' },
    { query: 'Rhythm 2000 Arjun AR Rahman', lang: 'Tamil', year: '2000', era: '2k' },
    { query: 'Kaho Naa Pyaar Hai 2000 Hrithik Roshan', lang: 'Hindi', year: '2000', era: '2k' },
    { query: 'Minnale 2001 Madhavan Harris Jayaraj', lang: 'Tamil', year: '2001', era: '2k' },
    { query: 'Dheena 2001 Ajith Yuvan Shankar Raja', lang: 'Tamil', year: '2001', era: '2k' },
    { query: 'Citizen 2001 Ajith Deva', lang: 'Tamil', year: '2001', era: '2k' },
    { query: 'Lagaan 2001 Aamir Khan AR Rahman', lang: 'Hindi', year: '2001', era: '2k' },
    { query: 'Dil Chahta Hai 2001 Shankar Ehsaan Loy', lang: 'Hindi', year: '2001', era: '2k' },
    { query: 'Kabhi Khushi Kabhie Gham 2001 SRK', lang: 'Hindi', year: '2001', era: '2k' },
    { query: 'Run 2002 Madhavan Vidyasagar', lang: 'Tamil', year: '2002', era: '2k' },
    { query: 'Gemini 2002 Vikram Bharathwaj', lang: 'Tamil', year: '2002', era: '2k' },
    { query: 'Kannathil Muthamittal 2002 Madhavan AR Rahman', lang: 'Tamil', year: '2002', era: '2k' },
    { query: 'Indra 2002 Chiranjeevi Mani Sharma', lang: 'Telugu', year: '2002', era: '2k' },
    { query: 'Dhool 2003 Vikram Vidyasagar', lang: 'Tamil', year: '2003', era: '2k' },
    { query: 'Saamy 2003 Vikram Harris Jayaraj', lang: 'Tamil', year: '2003', era: '2k' },
    { query: 'Kaakha Kaakha 2003 Suriya Harris Jayaraj', lang: 'Tamil', year: '2003', era: '2k' },
    { query: 'Boys 2003 Siddharth AR Rahman', lang: 'Tamil', year: '2003', era: '2k' },
    { query: 'Pithamagan 2003 Vikram Surya Ilaiyaraaja', lang: 'Tamil', year: '2003', era: '2k' },
    { query: 'Kal Ho Naa Ho 2003 SRK Shankar Ehsaan Loy', lang: 'Hindi', year: '2003', era: '2k' },
    { query: 'Okkadu 2003 Mahesh Babu Mani Sharma', lang: 'Telugu', year: '2003', era: '2k' },
    { query: 'Ghilli 2004 Vijay Vidyasagar', lang: 'Tamil', year: '2004', era: '2k' },
    { query: 'Autograph 2004 Cheran Bharathwaj', lang: 'Tamil', year: '2004', era: '2k' },
    { query: '7G Rainbow Colony 2004 Yuvan Shankar Raja', lang: 'Tamil', year: '2004', era: '2k' },
    { query: 'Aayutha Ezhuthu 2004 AR Rahman Suriya Madhavan', lang: 'Tamil', year: '2004', era: '2k' },
    { query: 'M Kumaran Son of Mahalakshmi 2004 Srikanth Deva', lang: 'Tamil', year: '2004', era: '2k' },
    { query: 'Veer Zaara 2004 Shah Rukh Khan Madan Mohan', lang: 'Hindi', year: '2004', era: '2k' },
    { query: 'Arya 2004 Allu Arjun Devi Sri Prasad', lang: 'Telugu', year: '2004', era: '2k' },
    { query: 'Chandramukhi 2005 Rajinikanth Vidyasagar', lang: 'Tamil', year: '2005', era: '2k' },
    { query: 'Anniyan 2005 Vikram Shankar Harris Jayaraj', lang: 'Tamil', year: '2005', era: '2k' },
    { query: 'Ghajini 2005 Suriya Harris Jayaraj', lang: 'Tamil', year: '2005', era: '2k' },
    { query: 'Sachein 2005 Vijay Devi Sri Prasad', lang: 'Tamil', year: '2005', era: '2k' },
    { query: 'Chatrapathi 2005 Prabhas MM Keeravaani', lang: 'Telugu', year: '2005', era: '2k' },
    { query: 'Vettaiyaadu Vilaiyaadu 2006 Kamal Harris Jayaraj', lang: 'Tamil', year: '2006', era: '2k' },
    { query: 'Pudhupettai 2006 Dhanush Yuvan Shankar Raja', lang: 'Tamil', year: '2006', era: '2k' },
    { query: 'Pokiri 2006 Mahesh Babu Mani Sharma', lang: 'Telugu', year: '2006', era: '2k' },
    { query: 'Rang De Basanti 2006 AR Rahman Aamir Khan', lang: 'Hindi', year: '2006', era: '2k' },
    { query: 'Dhoom 2 2006 Hrithik Roshan Pritam', lang: 'Hindi', year: '2006', era: '2k' },
    { query: 'Sivaji The Boss 2007 Rajinikanth AR Rahman', lang: 'Tamil', year: '2007', era: '2k' },
    { query: 'Pokkiri 2007 Vijay Asin Mani Sharma', lang: 'Tamil', year: '2007', era: '2k' },
    { query: 'Billa 2007 Ajith Yuvan Shankar Raja', lang: 'Tamil', year: '2007', era: '2k' },
    { query: 'Polladhavan 2007 Dhanush GV Prakash', lang: 'Tamil', year: '2007', era: '2k' },
    { query: 'Om Shanti Om 2007 SRK Vishal Shekhar', lang: 'Hindi', year: '2007', era: '2k' },
    { query: 'Jab We Met 2007 Shahid Kareena Pritam', lang: 'Hindi', year: '2007', era: '2k' },
    { query: 'Dasavathaaram 2008 Kamal Haasan Himesh Reshammiya', lang: 'Tamil', year: '2008', era: '2k' },
    { query: 'Vaaranam Aayiram 2008 Suriya Harris Jayaraj', lang: 'Tamil', year: '2008', era: '2k' },
    { query: 'Subramaniapuram 2008 Sasikumar James Vasanthan', lang: 'Tamil', year: '2008', era: '2k' },
    { query: 'Jalsa 2008 Pawan Kalyan Devi Sri Prasad', lang: 'Telugu', year: '2008', era: '2k' },
    { query: 'Ayan 2009 Suriya Harris Jayaraj', lang: 'Tamil', year: '2009', era: '2k' },
    { query: 'Padikkadavan 2009 Dhanush Mani Sharma', lang: 'Tamil', year: '2009', era: '2k' },
    { query: 'Aadhavan 2009 Suriya Harris Jayaraj', lang: 'Tamil', year: '2009', era: '2k' },
    { query: 'Paiyaa 2010 Karthi Yuvan Shankar Raja', lang: 'Tamil', year: '2010', era: 'now' },
    { query: 'Magadheera 2009 Ram Charan MM Keeravaani', lang: 'Telugu', year: '2009', era: '2k' },
    { query: '3 Idiots 2009 Aamir Khan Shantanu Moitra', lang: 'Hindi', year: '2009', era: '2k' },

    // ==========================================
    // 2010 - 2019 (2010s MODERN BLOCKBUSTERS)
    // ==========================================
    { query: 'Vinnaithaandi Varuvaayaa 2010 Simbu Trisha AR Rahman', lang: 'Tamil', year: '2010', era: 'now' },
    { query: 'Enthiran 2010 Rajinikanth AR Rahman', lang: 'Tamil', year: '2010', era: 'now' },
    { query: 'Singam 2010 Suriya Devi Sri Prasad', lang: 'Tamil', year: '2010', era: 'now' },
    { query: 'Madrasapattinam 2010 Arya GV Prakash', lang: 'Tamil', year: '2010', era: 'now' },
    { query: 'Mankatha 2011 Ajith Yuvan Shankar Raja', lang: 'Tamil', year: '2011', era: 'now' },
    { query: 'Ko 2011 Jiiva Harris Jayaraj', lang: 'Tamil', year: '2011', era: 'now' },
    { query: 'Mayakkam Enna 2011 Dhanush GV Prakash', lang: 'Tamil', year: '2011', era: 'now' },
    { query: 'Rockstar 2011 Ranbir Kapoor AR Rahman', lang: 'Hindi', year: '2011', era: 'now' },
    { query: '3 2012 Dhanush Anirudh Kolaveri Di', lang: 'Tamil', year: '2012', era: 'now' },
    { query: 'Thuppakki 2012 Vijay Harris Jayaraj', lang: 'Tamil', year: '2012', era: 'now' },
    { query: 'Nanban 2012 Vijay Harris Jayaraj', lang: 'Tamil', year: '2012', era: 'now' },
    { query: 'Barfi 2012 Ranbir Pritam', lang: 'Hindi', year: '2012', era: 'now' },
    { query: 'Eega 2012 Nani Keeravaani', lang: 'Telugu', year: '2012', era: 'now' },
    { query: 'Kadal 2013 AR Rahman Mani Ratnam', lang: 'Tamil', year: '2013', era: 'now' },
    { query: 'Maryan 2013 Dhanush AR Rahman', lang: 'Tamil', year: '2013', era: 'now' },
    { query: 'Raja Rani 2013 Arya Nayanthara GV Prakash', lang: 'Tamil', year: '2013', era: 'now' },
    { query: 'Soodhu Kavvum 2013 Vijay Sethupathi Santhosh Narayanan', lang: 'Tamil', year: '2013', era: 'now' },
    { query: 'Yeh Jawaani Hai Deewani 2013 Pritam', lang: 'Hindi', year: '2013', era: 'now' },
    { query: 'Aashiqui 2 2013 Mithoon Arijit Singh', lang: 'Hindi', year: '2013', era: 'now' },
    { query: 'Kaththi 2014 Vijay Samantha Anirudh', lang: 'Tamil', year: '2014', era: 'now' },
    { query: 'VIP Velaiilla Pattadhari 2014 Dhanush Anirudh', lang: 'Tamil', year: '2014', era: 'now' },
    { query: 'Jilla 2014 Vijay Mohanlal D Imman', lang: 'Tamil', year: '2014', era: 'now' },
    { query: 'Veeram 2014 Ajith Devi Sri Prasad', lang: 'Tamil', year: '2014', era: 'now' },
    { query: 'Bangalore Days 2014 Gopi Sundar', lang: 'Malayalam', year: '2014', era: 'now' },
    { query: 'I 2015 Vikram Shankar AR Rahman', lang: 'Tamil', year: '2015', era: 'now' },
    { query: 'Yennai Arindhaal 2015 Ajith Harris Jayaraj', lang: 'Tamil', year: '2015', era: 'now' },
    { query: 'OK Kanmani 2015 Dulquer Salmaan AR Rahman', lang: 'Tamil', year: '2015', era: 'now' },
    { query: 'Naanum Rowdy Dhaan 2015 Vijay Sethupathi Anirudh', lang: 'Tamil', year: '2015', era: 'now' },
    { query: 'Baahubali The Beginning 2015 Prabhas MM Keeravaani', lang: 'Telugu', year: '2015', era: 'now' },
    { query: 'Premam 2015 Nivin Pauly Rajesh Murugesan', lang: 'Malayalam', year: '2015', era: 'now' },
    { query: 'Theri 2016 Vijay Samantha GV Prakash', lang: 'Tamil', year: '2016', era: 'now' },
    { query: 'Kabali 2016 Rajinikanth Santhosh Narayanan', lang: 'Tamil', year: '2016', era: 'now' },
    { query: '24 2016 Suriya AR Rahman', lang: 'Tamil', year: '2016', era: 'now' },
    { query: 'Kirik Party 2016 Rakshit Shetty Ajaneesh', lang: 'Kannada', year: '2016', era: 'now' },
    { query: 'Vikram Vedha 2017 Vijay Sethupathi Madhavan Sam CS', lang: 'Tamil', year: '2017', era: 'now' },
    { query: 'Mersal 2017 Vijay AR Rahman', lang: 'Tamil', year: '2017', era: 'now' },
    { query: 'Baahubali 2 The Conclusion 2017 Keeravaani', lang: 'Telugu', year: '2017', era: 'now' },
    { query: 'Arjun Reddy 2017 Vijay Deverakonda Radhan', lang: 'Telugu', year: '2017', era: 'now' },
    { query: 'Sarkar 2018 Vijay AR Rahman', lang: 'Tamil', year: '2018', era: 'now' },
    { query: 'Chekka Chivantha Vaanam CCV 2018 AR Rahman', lang: 'Tamil', year: '2018', era: 'now' },
    { query: '96 2018 Vijay Sethupathi Trisha Govind Vasantha', lang: 'Tamil', year: '2018', era: 'now' },
    { query: 'Kaala 2018 Rajinikanth Santhosh Narayanan', lang: 'Tamil', year: '2018', era: 'now' },
    { query: 'Rangasthalam 2018 Ram Charan DSP', lang: 'Telugu', year: '2018', era: 'now' },
    { query: 'Geetha Govindam 2018 Vijay Deverakonda Gopi Sundar', lang: 'Telugu', year: '2018', era: 'now' },
    { query: 'KGF Chapter 1 2018 Yash Ravi Basrur', lang: 'Kannada', year: '2018', era: 'now' },
    { query: 'Petta 2019 Rajinikanth Anirudh', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Viswasam 2019 Ajith D Imman', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Asuran 2019 Dhanush GV Prakash', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Kaithi 2019 Karthi Sam CS', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Bigil 2019 Vijay AR Rahman', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Super Deluxe 2019 Yuvan Shankar Raja', lang: 'Tamil', year: '2019', era: 'now' },
    { query: 'Kabir Singh 2019 Shahid Kapoor', lang: 'Hindi', year: '2019', era: 'now' },

    // ==========================================
    // 2020 - 2026 (2020s TO 2026 MODERN & NEW)
    // ==========================================
    { query: 'Darbar 2020 Rajinikanth Anirudh', lang: 'Tamil', year: '2020', era: 'now' },
    { query: 'Soorarai Pottru 2020 Suriya GV Prakash', lang: 'Tamil', year: '2020', era: 'now' },
    { query: 'Ala Vaikunthapurramuloo 2020 Allu Arjun Thaman', lang: 'Telugu', year: '2020', era: 'now' },
    { query: 'Master 2021 Vijay Vijay Sethupathi Anirudh', lang: 'Tamil', year: '2021', era: 'now' },
    { query: 'Karnan 2021 Dhanush Santhosh Narayanan', lang: 'Tamil', year: '2021', era: 'now' },
    { query: 'Doctor 2021 Sivakarthikeyan Anirudh', lang: 'Tamil', year: '2021', era: 'now' },
    { query: 'Jai Bhim 2021 Suriya Sean Roldan', lang: 'Tamil', year: '2021', era: 'now' },
    { query: 'Maanaadu 2021 Simbu Yuvan Shankar Raja', lang: 'Tamil', year: '2021', era: 'now' },
    { query: 'Pushpa The Rise 2021 Allu Arjun Devi Sri Prasad', lang: 'Telugu', year: '2021', era: 'now' },
    { query: 'Vikram 2022 Kamal Haasan Anirudh', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'Beast 2022 Vijay Pooja Hegde Anirudh', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'Don 2022 Sivakarthikeyan Anirudh', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'Ponniyin Selvan 1 2022 AR Rahman Mani Ratnam', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'Thiruchitrambalam 2022 Dhanush Anirudh', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'Love Today 2022 Pradeep Ranganathan Yuvan', lang: 'Tamil', year: '2022', era: 'now' },
    { query: 'RRR 2022 NTR Ram Charan MM Keeravaani', lang: 'Telugu', year: '2022', era: 'now' },
    { query: 'KGF Chapter 2 2022 Yash Ravi Basrur', lang: 'Kannada', year: '2022', era: 'now' },
    { query: 'Kantara 2022 Rishab Shetty Ajaneesh', lang: 'Kannada', year: '2022', era: 'now' },
    { query: 'Varisu 2023 Vijay Rashmika Thaman', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Thunivu 2023 Ajith Ghibran', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Ponniyin Selvan 2 2023 AR Rahman', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Maaveeran 2023 Sivakarthikeyan Bharath Sankar', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Jailer 2023 Rajinikanth Anirudh', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Jawan 2023 Shah Rukh Khan Anirudh', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Leo 2023 Vijay Anirudh Badass Naa Ready', lang: 'Tamil', year: '2023', era: 'now' },
    { query: 'Animal 2023 Ranbir Kapoor Pritam', lang: 'Hindi', year: '2023', era: 'now' },
    { query: 'Salaar 2023 Prabhas Ravi Basrur', lang: 'Telugu', year: '2023', era: 'now' },
    { query: 'The Greatest of All Time GOAT 2024 Vijay Yuvan', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Vettaiyan 2024 Rajinikanth Anirudh Manasilaayo', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Amaran 2024 Sivakarthikeyan Sai Pallavi GV Prakash', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Kanguva 2024 Suriya Devi Sri Prasad', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Raayan 2024 Dhanush AR Rahman', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Captain Miller 2024 Dhanush GV Prakash', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Ayalaan 2024 Sivakarthikeyan AR Rahman', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Maharaja 2024 Vijay Sethupathi Ajaneesh', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Aavesham 2024 Fahadh Faasil Sushin Shyam', lang: 'Malayalam', year: '2024', era: 'now' },
    { query: 'Manjummel Boys 2024 Sushin Shyam', lang: 'Malayalam', year: '2024', era: 'now' },
    { query: 'Premalu 2024 Vishnu Vijay', lang: 'Malayalam', year: '2024', era: 'now' },
    { query: 'Pushpa 2 The Rule 2024 Allu Arjun Devi Sri Prasad', lang: 'Telugu', year: '2024', era: 'now' },
    { query: 'Devara Part 1 2024 Jr NTR Anirudh', lang: 'Telugu', year: '2024', era: 'now' },
    { query: 'Kalki 2898 AD 2024 Prabhas Santhosh Narayanan', lang: 'Telugu', year: '2024', era: 'now' },
    { query: 'Viduthalai Part 2 2024 Ilaiyaraaja Vetrimaaran', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Thug Life 2025 Kamal Haasan Mani Ratnam AR Rahman', lang: 'Tamil', year: '2025', era: 'now' },
    { query: 'Coolie 2025 Rajinikanth Lokesh Kanagaraj Anirudh', lang: 'Tamil', year: '2025', era: 'now' },
    { query: 'Good Bad Ugly 2025 Ajith Kumar Devi Sri Prasad', lang: 'Tamil', year: '2025', era: 'now' },
    { query: 'Vidaamuyarchi 2025 Ajith Kumar Anirudh', lang: 'Tamil', year: '2025', era: 'now' },
    { query: 'Indian 2 2024 Kamal Haasan Shankar Anirudh', lang: 'Tamil', year: '2024', era: 'now' },
    { query: 'Game Changer 2025 Ram Charan Shankar Thaman', lang: 'Telugu', year: '2025', era: 'now' },
    { query: 'Kantara Chapter 1 2025 Rishab Shetty', lang: 'Kannada', year: '2025', era: 'now' },
    { query: 'Toxic 2025 Yash Geetu Mohandas', lang: 'Kannada', year: '2025', era: 'now' },
    { query: 'Dragon 2025 Pradeep Ranganathan Leon James', lang: 'Tamil', year: '2025', era: 'now' }
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

  for (let i = 0; i < targetMovieAlbums.length; i++) {
    const item = targetMovieAlbums[i];
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
        const trackYear = r.year || more.year || item.year || '2024';
        const dur = parseInt(more.duration || r.duration || 240, 10);
        const m = Math.floor(dur / 60);
        const s = dur % 60;
        const durStr = `${m}:${s < 10 ? '0' : ''}${s}`;
        const cover = (r.image || '').replace('150x150', '500x500');

        const trackKey = `${title.toLowerCase()}::${album.toLowerCase()}`;
        if (seenKeys.has(trackKey)) continue;

        const era = determineEra(trackYear);
        const langLower = item.lang.toLowerCase();
        const cat = `${item.lang} Songs`;

        const tags = [
          title.toLowerCase(),
          album.toLowerCase(),
          artist.toLowerCase(),
          item.lang.toLowerCase(),
          era,
          `${era} movie`,
          `${era} songs`,
          `${era} hits`,
          trackYear,
          `${trackYear} movie`,
          `${trackYear} songs`,
          'movie',
          'movie songs',
          'all movie songs',
          '1980 to 2026',
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
          era: era,
          category: cat,
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
      console.log(`[${i + 1}/${targetMovieAlbums.length}] ${item.year} (${item.lang}) "${item.query}" -> +${countAdded} tracks.`);
    } catch(err) {
      console.warn(`Error on "${item.query}":`, err.message);
    }
  }

  console.log(`\nNew movie tracks to add: ${newTracks.length}`);

  // Now ensure all existing songs also have movie, movie songs, 1980 to 2026 tags if they belong to a movie/era
  let updatedExistingCount = 0;
  for (const s of existingSongs) {
    if (!s.tags) s.tags = [];
    const tSet = new Set(s.tags.map(t => String(t).toLowerCase()));
    
    // Check if song has an era or year
    const era = s.era || determineEra(s.year || '');
    if (!s.era) s.era = era;
    
    let addedTag = false;
    if (!tSet.has('movie') && (s.album || s.category.includes('Songs') || s.era)) {
      s.tags.push('movie');
      s.tags.push('movie songs');
      s.tags.push('all movie songs');
      s.tags.push('1980 to 2026');
      s.tags.push(`${era} movie`);
      s.tags.push(`${era} songs`);
      addedTag = true;
    }
    if (s.year && !tSet.has(s.year)) {
      s.tags.push(s.year);
      s.tags.push(`${s.year} movie`);
      s.tags.push(`${s.year} songs`);
      addedTag = true;
    }
    if (addedTag) updatedExistingCount++;
  }

  const allSongs = [...newTracks, ...existingSongs];
  console.log(`Writing ${allSongs.length} total tracks to static/js/songs_data.js...`);
  fs.writeFileSync(songsDataPath, 'window.CATALOGUE_SONGS = ' + JSON.stringify(allSongs) + ';\n', 'utf8');
  console.log(`Successfully updated static/js/songs_data.js! Total: ${allSongs.length} songs. (Tagged ${updatedExistingCount} existing songs)`);
}

run();
