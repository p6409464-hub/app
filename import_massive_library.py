import os
import sys
import json
import re
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import search_jiosaavn

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_DATA_PATH = os.path.join(BASE_DIR, "static", "js", "songs_data.js")

# 1. Load existing songs
with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.CATALOGUE_SONGS")
    sys.exit(1)

existing_songs = json.loads(m.group(1))
print(f"Loaded {len(existing_songs)} existing songs.")

seen_ids = set(s["id"] for s in existing_songs)
seen_titles = set(re.sub(r"[^a-z0-9]", "", s["title"].lower()) for s in existing_songs)
all_songs = list(existing_songs)

# Expanded queries for full coverage across Tamil, Telugu, Hindi, Malayalam, English
MASSIVE_QUERIES = [
    # --- TAMIL MOVIES & CLASSICS ---
    ("Leo Tamil", "Tamil"),
    ("Jailer Tamil", "Tamil"),
    ("Vikram Tamil", "Tamil"),
    ("Master Tamil", "Tamil"),
    ("Beast Tamil", "Tamil"),
    ("Varisu Tamil", "Tamil"),
    ("Thunivu Tamil", "Tamil"),
    ("GOAT Vijay Tamil", "Tamil"),
    ("Vettaiyan Rajini Tamil", "Tamil"),
    ("Amaran Sivakarthikeyan", "Tamil"),
    ("Raayan Dhanush", "Tamil"),
    ("Kanguva Suriya", "Tamil"),
    ("Viduthalai Ilaiyaraaja", "Tamil"),
    ("Ponniyin Selvan AR Rahman", "Tamil"),
    ("Mersal Vijay", "Tamil"),
    ("Bigil Vijay", "Tamil"),
    ("Sarkar Vijay", "Tamil"),
    ("Theri Vijay", "Tamil"),
    ("Kaththi Vijay", "Tamil"),
    ("Thuppakki Vijay", "Tamil"),
    ("Ghilli Vijay", "Tamil"),
    ("Pokkiri Vijay", "Tamil"),
    ("Mankatha Ajith", "Tamil"),
    ("Billa Ajith", "Tamil"),
    ("Viswasam Ajith", "Tamil"),
    ("Petta Rajini", "Tamil"),
    ("Kabali Rajini", "Tamil"),
    ("Enthiran Rajini", "Tamil"),
    ("Sivaji The Boss", "Tamil"),
    ("Anniyan Vikram", "Tamil"),
    ("I Vikram Shankar", "Tamil"),
    ("Roja AR Rahman", "Tamil"),
    ("Bombay AR Rahman", "Tamil"),
    ("Pudhupettai Yuvan", "Tamil"),
    ("Aayirathil Oruvan GV Prakash", "Tamil"),
    ("Vada Chennai Santhosh", "Tamil"),
    ("Asuran Dhanush", "Tamil"),
    ("Karnan Santhosh Narayanan", "Tamil"),
    ("Soorarai Pottru Suriya", "Tamil"),
    ("Kaithi Karthi", "Tamil"),
    ("Maanaadu Yuvan", "Tamil"),
    ("Doctor Anirudh", "Tamil"),
    ("Don Anirudh", "Tamil"),
    ("Love Today Yuvan", "Tamil"),
    ("Dragon Pradeep Ranganathan", "Tamil"),
    ("Vidaamuyarchi Anirudh", "Tamil"),
    ("Vaaranam Aayiram Harris Jayaraj", "Tamil"),
    ("Vinnaithaandi Varuvaayaa AR Rahman", "Tamil"),
    ("Neethaane En Ponvasantham Ilaiyaraaja", "Tamil"),
    ("Alaipayuthey AR Rahman", "Tamil"),
    ("Kannathil Muthamittal AR Rahman", "Tamil"),
    ("Mouna Ragam Ilaiyaraaja", "Tamil"),
    ("Nayakan Ilaiyaraaja", "Tamil"),
    ("Thalapathi Ilaiyaraaja", "Tamil"),
    ("Baasha Deva", "Tamil"),
    ("Padayappa AR Rahman", "Tamil"),
    ("Chandramukhi Vidyasagar", "Tamil"),
    ("Virumaandi Ilaiyaraaja", "Tamil"),
    ("Dheena Yuvan", "Tamil"),
    ("Run Vidyasagar", "Tamil"),
    ("Saamy Harris Jayaraj", "Tamil"),
    ("Dhool Vidyasagar", "Tamil"),
    ("Ghajini Harris Jayaraj", "Tamil"),
    ("Ayan Harris Jayaraj", "Tamil"),
    ("Singam Devi Sri Prasad", "Tamil"),
    ("Paiyaa Yuvan", "Tamil"),
    ("Siruthai Vidyasagar", "Tamil"),
    ("Ko Harris Jayaraj", "Tamil"),
    ("Nanban Harris Jayaraj", "Tamil"),
    ("Thani Oruvan Hip Hop Tamizha", "Tamil"),
    ("Vikram Vedha Sam CS", "Tamil"),
    ("96 Govind Vasantha", "Tamil"),
    ("Sarpatta Parambarai Santhosh", "Tamil"),
    ("Kadhalan AR Rahman", "Tamil"),
    ("Gentleman AR Rahman", "Tamil"),
    ("Mudhalvan AR Rahman", "Tamil"),
    ("Jeans AR Rahman", "Tamil"),
    ("Boys AR Rahman", "Tamil"),
    ("Aalaporaan Thamizhan", "Tamil"),
    ("Rowdy Baby Dhanush", "Tamil"),
    ("Why This Kolaveri Di", "Tamil"),
    ("Arabic Kuthu Anirudh", "Tamil"),
    ("Hukum Anirudh", "Tamil"),
    ("Naa Ready Anirudh", "Tamil"),
    ("Badass Anirudh", "Tamil"),
    ("Kaavaalaa Anirudh", "Tamil"),
    ("Pathala Pathala Anirudh", "Tamil"),
    ("Chuttamalle Anirudh", "Telugu"),
    ("Fear Song Devara", "Telugu"),
    ("Dheera Dheera KGF", "Tamil"),
    ("Sulthan KGF 2", "Tamil"),
    ("Adheeraa Cobra", "Tamil"),
    ("Megham Karukatha", "Tamil"),
    ("Thaensudare Lover", "Tamil"),
    ("Katchi Sera Sai Abhyankkar", "Tamil"),
    ("Aasa Kooda Sai Abhyankkar", "Tamil"),

    # --- TELUGU BLOCKBUSTERS ---
    ("Pushpa 2 Telugu", "Telugu"),
    ("Pushpa The Rise Telugu", "Telugu"),
    ("Devara NTR Telugu", "Telugu"),
    ("Kalki 2898 AD Telugu", "Telugu"),
    ("Salaar Prabhas Telugu", "Telugu"),
    ("Guntur Kaaram Mahesh Babu", "Telugu"),
    ("HanuMan Telugu", "Telugu"),
    ("Saripodhaa Sanivaaram Nani", "Telugu"),
    ("Ala Vaikunthapurramuloo Thaman", "Telugu"),
    ("RRR Naatu Naatu Telugu", "Telugu"),
    ("Baahubali Keeravani", "Telugu"),
    ("Baahubali 2 Keeravani", "Telugu"),
    ("Sarileru Neekevvaru DSP", "Telugu"),
    ("Bharat Ane Nenu DSP", "Telugu"),
    ("Geetha Govindam Gopi Sundar", "Telugu"),
    ("Dear Comrade Justin Prabhakaran", "Telugu"),
    ("Arjun Reddy Radhan", "Telugu"),
    ("Jersey Anirudh Telugu", "Telugu"),
    ("Dasara Santhosh Narayanan", "Telugu"),
    ("Waltair Veerayya DSP", "Telugu"),
    ("Rangasthalam DSP", "Telugu"),
    ("Magadheera Keeravani", "Telugu"),
    ("Samajavaragamana Thaman", "Telugu"),
    ("Butta Bomma Armaan Malik", "Telugu"),
    ("Ramuloo Ramulaa Thaman", "Telugu"),
    ("Inkem Inkem Sid Sriram", "Telugu"),
    ("Oo Antava Mawa DSP", "Telugu"),
    ("Srivalli Sid Sriram", "Telugu"),

    # --- HINDI / BOLLYWOOD HITS ---
    ("Stree 2 Hindi", "Hindi"),
    ("Jawan Anirudh Hindi", "Hindi"),
    ("Pathaan Vishal Shekhar", "Hindi"),
    ("Animal Pritam Hindi", "Hindi"),
    ("Dunki Pritam Hindi", "Hindi"),
    ("Fighter Vishal Shekhar", "Hindi"),
    ("Brahmastra Kesariya", "Hindi"),
    ("Bhool Bhulaiyaa 2 Pritam", "Hindi"),
    ("Kabir Singh Bekhayali", "Hindi"),
    ("War Ghungroo", "Hindi"),
    ("Shershaah Raataan Lambiyan", "Hindi"),
    ("Aashiqui 2 Tum Hi Ho", "Hindi"),
    ("Yeh Jawaani Hai Deewani Badtameez", "Hindi"),
    ("Rockstar AR Rahman Hindi", "Hindi"),
    ("Jab We Met Pritam", "Hindi"),
    ("Kal Ho Naa Ho Shankar Ehsaan Loy", "Hindi"),
    ("Channa Mereya Arijit Singh", "Hindi"),
    ("Apna Bana Le Arijit Singh", "Hindi"),
    ("Heeriye Jasleen Royal", "Hindi"),
    ("Pehle Bhi Main Animal", "Hindi"),
    ("O Maahi Dunki", "Hindi"),
    ("Chaleya Jawan", "Hindi"),

    # --- MALAYALAM HITS ---
    ("Manjummel Boys Sushin Shyam", "Malayalam"),
    ("Aavesham Sushin Shyam", "Malayalam"),
    ("Premalu Vishnu Vijay", "Malayalam"),
    ("Bramayugam Christo Xavier", "Malayalam"),
    ("ARM Jithin Laal", "Malayalam"),
    ("RDX Jakes Bejoy", "Malayalam"),
    ("2018 Movie Malayalam", "Malayalam"),
    ("Romancham Sushin Shyam", "Malayalam"),
    ("Hridayam Hesham Abdul Wahab", "Malayalam"),
    ("Minnal Murali Shaan Rahman", "Malayalam"),
    ("Lucifer Deepak Dev", "Malayalam"),
    ("Kumbalangi Nights Sushin Shyam", "Malayalam"),
    ("Premam Rajesh Murugesan", "Malayalam"),
    ("Illuminati Aavesham", "Malayalam"),
    ("Jaada Premalu", "Malayalam"),
    ("Darshana Hridayam", "Malayalam"),
    ("Kuthanthram Manjummel Boys", "Malayalam"),

    # --- ENGLISH GLOBAL HITS ---
    ("Shape of You Ed Sheeran", "English"),
    ("Blinding Lights The Weeknd", "English"),
    ("Cruel Summer Taylor Swift", "English"),
    ("Flowers Miley Cyrus", "English"),
    ("As It Was Harry Styles", "English"),
    ("Stay Kid LAROI Justin Bieber", "English"),
    ("Levitating Dua Lipa", "English"),
    ("Believer Imagine Dragons", "English"),
    ("Bad Guy Billie Eilish", "English"),
    ("Starboy The Weeknd", "English"),
    ("Perfect Ed Sheeran", "English"),
    ("Faded Alan Walker", "English"),
    ("Someone You Loved Lewis Capaldi", "English"),
    ("Sunflower Post Malone", "English")
]

print(f"Starting crawl for {len(MASSIVE_QUERIES)} queries...")
added_count = 0

for i, (q, lang) in enumerate(MASSIVE_QUERIES):
    try:
        results = search_jiosaavn(q, language=lang)
        q_added = 0
        for song in results:
            if not song.get("audio_url"):
                continue
            song_id = song["id"]
            title = song.get("title", "")
            norm_title = re.sub(r"[^a-z0-9]", "", title.lower())

            if song_id in seen_ids or (norm_title and norm_title in seen_titles):
                continue

            seen_ids.add(song_id)
            if norm_title:
                seen_titles.add(norm_title)

            # Ensure proper language tag
            song["language"] = lang.title()
            song["category"] = f"{lang.title()} Songs" if lang != "Instrumental" else "Instrumental Music"
            song["download_authorized"] = True

            all_songs.append(song)
            q_added += 1
            added_count += 1

        print(f"[{i+1}/{len(MASSIVE_QUERIES)}] Query '{q}': Added {q_added} tracks (Total: {len(all_songs)})")
        time.sleep(0.1)
    except Exception as e:
        print(f"Error querying '{q}': {e}")

print(f"\n==========================================")
print(f"Crawling complete! Added {added_count} new high-quality tracks.")
print(f"Total Catalogue Size: {len(all_songs)} tracks.")
print(f"==========================================")

# Write back to static/js/songs_data.js
output_code = "// Pranesh Music Hub - Complete Master Song Catalogue (Deduplicated)\n"
output_code += f"window.CATALOGUE_SONGS = {json.dumps(all_songs, ensure_ascii=False, indent=2)};\n"

with open(SONGS_DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output_code)

print(f"Successfully updated {SONGS_DATA_PATH}!")
