import os
import json
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_DATA_PATH = os.path.join(BASE_DIR, "static", "js", "songs_data.js")

# Load existing songs
with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
if not m:
    print("Could not find window.CATALOGUE_SONGS in songs_data.js")
    exit(1)

existing_songs = json.loads(m.group(1))
print(f"Loaded {len(existing_songs)} existing songs.")

# Additional curated songs to guarantee full language & movie coverage
NEW_SONGS = [
    # ==================== TELUGU BLOCKBUSTERS ====================
    {
        "id": "tel_bb_01",
        "title": "Butta Bomma",
        "artist": "Armaan Malik, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 198,
        "duration_str": "3:18",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/973/Ala-Vaikunthapurramuloo-Telugu-2019-20200113175820-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/973/686fcb2756d11f62bbf18cbfa7b1f5f4_320.mp4",
        "download_authorized": False,
        "tags": ["butta bomma", "ala vaikunthapurramuloo", "allu arjun", "pooja hegde", "armaan malik", "thaman s", "telugu", "trending"]
    },
    {
        "id": "tel_bb_02",
        "title": "Samajavaragamana",
        "artist": "Sid Sriram, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 214,
        "duration_str": "3:34",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/973/Ala-Vaikunthapurramuloo-Telugu-2019-20200113175820-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/973/59bfa181827eb0c1693df38e68cf608c_320.mp4",
        "download_authorized": False,
        "tags": ["samajavaragamana", "ala vaikunthapurramuloo", "allu arjun", "sid sriram", "thaman s", "telugu"]
    },
    {
        "id": "tel_bb_03",
        "title": "Ramuloo Ramulaa",
        "artist": "Anurag Kulkarni, Mangli, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 257,
        "duration_str": "4:17",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/973/Ala-Vaikunthapurramuloo-Telugu-2019-20200113175820-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/973/452cf847d06ee29f455e9ba553e19a4e_320.mp4",
        "download_authorized": False,
        "tags": ["ramuloo ramulaa", "ala vaikunthapurramuloo", "allu arjun", "mangli", "anurag kulkarni", "telugu"]
    },
    {
        "id": "tel_bb_04",
        "title": "Inkem Inkem Inkem Kaavaale",
        "artist": "Sid Sriram, Gopi Sundar",
        "album": "Geetha Govindam",
        "duration": 267,
        "duration_str": "4:27",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/023/Geetha-Govindam-Telugu-2018-20180813-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/023/b587f7396a84ebffbfca177a4128fe27_320.mp4",
        "download_authorized": False,
        "tags": ["inkem inkem", "geetha govindam", "vijay devarakonda", "rashmika mandanna", "sid sriram", "telugu"]
    },
    {
        "id": "tel_bb_05",
        "title": "Vachindamma",
        "artist": "Sid Sriram, Gopi Sundar",
        "album": "Geetha Govindam",
        "duration": 243,
        "duration_str": "4:03",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/023/Geetha-Govindam-Telugu-2018-20180813-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/023/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["vachindamma", "geetha govindam", "sid sriram", "telugu"]
    },
    {
        "id": "tel_bb_06",
        "title": "Pushpa Pushpa",
        "artist": "Nakash Aziz, Deepak Blue, Devi Sri Prasad",
        "album": "Pushpa 2: The Rule",
        "duration": 254,
        "duration_str": "4:14",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/978/Pushpa-2-The-Rule-Telugu-2024-20240501171018-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/978/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["pushpa pushpa", "pushpa 2 the rule", "allu arjun", "devi sri prasad", "dsp", "telugu"]
    },
    {
        "id": "tel_bb_07",
        "title": "Sooseki (The Couple Song)",
        "artist": "Shreya Ghoshal, Devi Sri Prasad",
        "album": "Pushpa 2: The Rule",
        "duration": 260,
        "duration_str": "4:20",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/096/Sooseki-From-Pushpa-2-The-Rule-Telugu-2024-20240529111003-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/096/8ebff0ba95ca8a4192666d9258aa416f_320.mp4",
        "download_authorized": False,
        "tags": ["sooseki", "couple song", "pushpa 2 the rule", "shreya ghoshal", "allu arjun", "rashmika", "telugu"]
    },
    {
        "id": "tel_bb_08",
        "title": "Fear Song",
        "artist": "Anirudh Ravichander",
        "album": "Devara Part 1",
        "duration": 196,
        "duration_str": "3:16",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/626/Fear-Song-From-Devara-Part-1-Telugu-2024-20240519181040-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/626/62c96c4d87452d3a95ce5e6f6a73c330_320.mp4",
        "download_authorized": False,
        "tags": ["fear song", "devara", "ntr", "anirudh", "telugu"]
    },
    {
        "id": "tel_bb_09",
        "title": "Daavudi",
        "artist": "Nakash Aziz, Akasa, Anirudh Ravichander",
        "album": "Devara Part 1",
        "duration": 266,
        "duration_str": "4:26",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/082/Daavudi-From-Devara-Part-1-Telugu-2024-20240904174312-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/082/01b8e8f81394c8e74f141bf19542bf82_320.mp4",
        "download_authorized": False,
        "tags": ["daavudi", "devara", "ntr", "janhvi kapoor", "anirudh", "telugu"]
    },
    {
        "id": "tel_bb_10",
        "title": "Saranga Dariya",
        "artist": "Mangli, Pawan Ch",
        "album": "Love Story",
        "duration": 229,
        "duration_str": "3:49",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/393/Love-Story-Telugu-2021-20210924151834-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/393/941785501d51c3c99e4ad611f71dfb99_320.mp4",
        "download_authorized": False,
        "tags": ["saranga dariya", "love story", "sai pallavi", "naga chaitanya", "mangli", "telugu"]
    },

    # ==================== HINDI SUPERHITS ====================
    {
        "id": "hin_bb_01",
        "title": "Kesariya",
        "artist": "Arijit Singh, Pritam, Amitabh Bhattacharya",
        "album": "Brahmāstra",
        "duration": 268,
        "duration_str": "4:28",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/893/Brahmastra-Hindi-2022-20221006170642-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/893/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["kesariya", "brahmastra", "ranbir kapoor", "alia bhatt", "arijit singh", "pritam", "hindi", "trending"]
    },
    {
        "id": "hin_bb_02",
        "title": "Tum Hi Ho",
        "artist": "Arijit Singh, Mithoon",
        "album": "Aashiqui 2",
        "duration": 262,
        "duration_str": "4:22",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/079/Aashiqui-2-Hindi-2013-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/079/7c5034c4bf98a58eecdd3bfd839366df_320.mp4",
        "download_authorized": False,
        "tags": ["tum hi ho", "aashiqui 2", "arijit singh", "mithoon", "aditya roy kapur", "shraddha kapoor", "hindi"]
    },
    {
        "id": "hin_bb_03",
        "title": "Channa Mereya",
        "artist": "Arijit Singh, Pritam",
        "album": "Ae Dil Hai Mushkil",
        "duration": 289,
        "duration_str": "4:49",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["recent", "hindi"],
        "cover_url": "https://c.saavncdn.com/257/Ae-Dil-Hai-Mushkil-Hindi-2016-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/257/94f83b27b9c9f4d2f099cf9d4c728fb5_320.mp4",
        "download_authorized": False,
        "tags": ["channa mereya", "ae dil hai mushkil", "ranbir kapoor", "arijit singh", "pritam", "hindi"]
    },
    {
        "id": "hin_bb_04",
        "title": "Raataan Lambiyan",
        "artist": "Jubin Nautiyal, Asees Kaur, Tanishk Bagchi",
        "album": "Shershaah",
        "duration": 230,
        "duration_str": "3:50",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/348/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/348/8a25227181fc8da6548773950a4bf85d_320.mp4",
        "download_authorized": False,
        "tags": ["raataan lambiyan", "shershaah", "sidharth malhotra", "kiara advani", "jubin nautiyal", "asees kaur", "hindi"]
    },
    {
        "id": "hin_bb_05",
        "title": "Apna Bana Le",
        "artist": "Arijit Singh, Sachin-Jigar",
        "album": "Bhediya",
        "duration": 261,
        "duration_str": "4:21",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/814/Bhediya-Hindi-2022-20221125081014-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/814/7c0c4e7f33d72b21764121bcbbca9ce3_320.mp4",
        "download_authorized": False,
        "tags": ["apna bana le", "bhediya", "varun dhawan", "kriti sanon", "arijit singh", "sachin jigar", "hindi"]
    },
    {
        "id": "hin_bb_06",
        "title": "Chaleya",
        "artist": "Arijit Singh, Shilpa Rao, Anirudh Ravichander",
        "album": "Jawan",
        "duration": 200,
        "duration_str": "3:20",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814014339-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/026/3ff856fc4eb4f91129b87df7efefaa95_320.mp4",
        "download_authorized": False,
        "tags": ["chaleya", "jawan", "shah rukh khan", "nayanthara", "anirudh", "arijit singh", "hindi", "trending"]
    },
    {
        "id": "hin_bb_07",
        "title": "Zinda Banda",
        "artist": "Anirudh Ravichander",
        "album": "Jawan",
        "duration": 264,
        "duration_str": "4:24",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["recent", "hindi"],
        "cover_url": "https://c.saavncdn.com/909/Zinda-Banda-From-Jawan-Hindi-2023-20230731124403-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/909/be31e3fe1aeb134ffc1ea1c8413bcae5_320.mp4",
        "download_authorized": False,
        "tags": ["zinda banda", "jawan", "shah rukh khan", "anirudh", "hindi"]
    },
    {
        "id": "hin_bb_08",
        "title": "Jhoome Jo Pathaan",
        "artist": "Arijit Singh, Sukriti Kakar, Vishal-Shekhar",
        "album": "Pathaan",
        "duration": 208,
        "duration_str": "3:28",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/807/Pathaan-Hindi-2022-20221222104158-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/807/54ca71a6caecf696cf93021b332b735c_320.mp4",
        "download_authorized": False,
        "tags": ["jhoome jo pathaan", "pathaan", "shah rukh khan", "deepika padukone", "arijit singh", "vishal shekhar", "hindi"]
    },
    {
        "id": "hin_bb_09",
        "title": "Arjan Vailly",
        "artist": "Bhupinder Babbal, Manan Bhardwaj",
        "album": "Animal",
        "duration": 182,
        "duration_str": "3:02",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191438-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/092/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["arjan vailly", "animal", "ranbir kapoor", "bobby deol", "bhupinder babbal", "hindi"]
    },
    {
        "id": "hin_bb_10",
        "title": "Pehle Bhi Main",
        "artist": "Vishal Mishra, Raj Shekhar",
        "album": "Animal",
        "duration": 250,
        "duration_str": "4:10",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191438-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/092/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["pehle bhi main", "animal", "ranbir kapoor", "tripti dimri", "vishal mishra", "hindi"]
    },
    {
        "id": "hin_bb_11",
        "title": "Agar Tum Saath Ho",
        "artist": "Alka Yagnik, Arijit Singh, A.R. Rahman",
        "album": "Tamasha",
        "duration": 341,
        "duration_str": "5:41",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/836/Tamasha-Hindi-2015-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/836/5377f0a9448882ca251d9d97bfbc1256_320.mp4",
        "download_authorized": False,
        "tags": ["agar tum saath ho", "tamasha", "ranbir kapoor", "deepika padukone", "ar rahman", "a.r. rahman", "arijit singh", "alka yagnik", "hindi"]
    },
    {
        "id": "hin_bb_12",
        "title": "Chaiyya Chaiyya",
        "artist": "Sukhwinder Singh, Sapna Awasthi, A.R. Rahman",
        "album": "Dil Se..",
        "duration": 395,
        "duration_str": "6:35",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["recent", "hindi"],
        "cover_url": "https://c.saavncdn.com/050/Dil-Se-Hindi-1998-20221201083437-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/050/78f1ae43d831518f88cf508e6783818e_320.mp4",
        "download_authorized": False,
        "tags": ["chaiyya chaiyya", "dil se", "shah rukh khan", "malaika arora", "ar rahman", "a.r. rahman", "sukhwinder singh", "hindi"]
    },
    {
        "id": "hin_bb_13",
        "title": "Kun Faya Kun",
        "artist": "A.R. Rahman, Mohit Chauhan, Javed Ali",
        "album": "Rockstar",
        "duration": 473,
        "duration_str": "7:53",
        "language": "Hindi",
        "category": "Hindi Songs",
        "sections": ["trending", "hindi"],
        "cover_url": "https://c.saavncdn.com/712/Rockstar-Hindi-2011-20221212044810-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["kun faya kun", "rockstar", "ranbir kapoor", "ar rahman", "a.r. rahman", "mohit chauhan", "sufi", "hindi"]
    },

    # ==================== MALAYALAM SUPERHITS ====================
    {
        "id": "mal_bb_01",
        "title": "Illuminati",
        "artist": "Dabzee, Sushin Shyam",
        "album": "Aavesham",
        "duration": 193,
        "duration_str": "3:13",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "https://c.saavncdn.com/786/Illuminati-From-Aavesham-Malayalam-2024-20240329151025-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/786/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["illuminati", "aavesham", "fahadh faasil", "sushin shyam", "dabzee", "malayalam", "trending"]
    },
    {
        "id": "mal_bb_02",
        "title": "Jaada",
        "artist": "Sushin Shyam, Sreenath Bhasi",
        "album": "Aavesham",
        "duration": 221,
        "duration_str": "3:41",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["recent", "malayalam"],
        "cover_url": "https://c.saavncdn.com/786/Jaada-From-Aavesham-Malayalam-2024-20240315181023-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/786/01b8e8f81394c8e74f141bf19542bf82_320.mp4",
        "download_authorized": False,
        "tags": ["jaada", "aavesham", "sushin shyam", "malayalam"]
    },
    {
        "id": "mal_bb_03",
        "title": "Armadham",
        "artist": "Pranavam Sasi, Sushin Shyam",
        "album": "Aavesham",
        "duration": 185,
        "duration_str": "3:05",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "https://c.saavncdn.com/786/Armadham-From-Aavesham-Malayalam-2024-20240405181020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/786/941785501d51c3c99e4ad611f71dfb99_320.mp4",
        "download_authorized": False,
        "tags": ["armadham", "aavesham", "sushin shyam", "malayalam"]
    },
    {
        "id": "mal_bb_04",
        "title": "Kuthanthram",
        "artist": "Vedan, Sushin Shyam",
        "album": "Manjummel Boys",
        "duration": 204,
        "duration_str": "3:24",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "https://c.saavncdn.com/832/Kuthanthram-From-Manjummel-Boys-Malayalam-2024-20240126181020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/832/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["kuthanthram", "manjummel boys", "sushin shyam", "vedan", "malayalam"]
    },
    {
        "id": "mal_bb_05",
        "title": "Thaai Manam",
        "artist": "Ilaiyaraaja, Sushin Shyam",
        "album": "Manjummel Boys",
        "duration": 240,
        "duration_str": "4:00",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["recent", "malayalam"],
        "cover_url": "https://c.saavncdn.com/832/Manjummel-Boys-Malayalam-2024-20240222161020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/832/62c96c4d87452d3a95ce5e6f6a73c330_320.mp4",
        "download_authorized": False,
        "tags": ["thaai manam", "manjummel boys", "sushin shyam", "ilaiyaraaja", "malayalam"]
    },
    {
        "id": "mal_bb_06",
        "title": "Darshana",
        "artist": "Hesham Abdul Wahab, Darshana Rajendran",
        "album": "Hridayam",
        "duration": 268,
        "duration_str": "4:28",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "https://c.saavncdn.com/132/Darshana-From-Hridayam-Malayalam-2021-20211025171018-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/132/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["darshana", "hridayam", "pranav mohanlal", "hesham abdul wahab", "malayalam"]
    },
    {
        "id": "mal_bb_07",
        "title": "Neela Nilave",
        "artist": "Kapil Kapilan, Jakes Bejoy",
        "album": "RDX",
        "duration": 222,
        "duration_str": "3:42",
        "language": "Malayalam",
        "category": "Malayalam Songs",
        "sections": ["trending", "malayalam"],
        "cover_url": "https://c.saavncdn.com/079/Neela-Nilave-From-RDX-Malayalam-2023-20230725171020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/079/7c5034c4bf98a58eecdd3bfd839366df_320.mp4",
        "download_authorized": False,
        "tags": ["neela nilave", "rdx", "jakes bejoy", "kapil kapilan", "malayalam"]
    },

    # ==================== TAMIL EVERGREEN BLOCKBUSTERS ====================
    {
        "id": "tam_bb_01",
        "title": "Appadi Podu",
        "artist": "KK, Anuradha Sriram, Vidyasagar",
        "album": "Ghilli",
        "duration": 352,
        "duration_str": "5:52",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "https://c.saavncdn.com/832/Ghilli-Tamil-2004-20200812165030-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/832/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["appadi podu", "ghilli", "thalapathy", "vijay", "trisha", "vidyasagar", "kk", "tamil", "trending"]
    },
    {
        "id": "tam_bb_02",
        "title": "Arjunar Villu",
        "artist": "Sukhwinder Singh, Manikka Vinayagam, Vidyasagar",
        "album": "Ghilli",
        "duration": 268,
        "duration_str": "4:28",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "https://c.saavncdn.com/832/Ghilli-Tamil-2004-20200812165030-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/832/01b8e8f81394c8e74f141bf19542bf82_320.mp4",
        "download_authorized": False,
        "tags": ["arjunar villu", "ghilli", "vijay", "vidyasagar", "kabbadi", "tamil"]
    },
    {
        "id": "tam_bb_03",
        "title": "Vilayadu Mankatha",
        "artist": "Yuvan Shankar Raja, Anitha, Premgi Amaren",
        "album": "Mankatha",
        "duration": 361,
        "duration_str": "6:01",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "https://c.saavncdn.com/712/Mankatha-Tamil-2011-20200812165520-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/941785501d51c3c99e4ad611f71dfb99_320.mp4",
        "download_authorized": False,
        "tags": ["vilayadu mankatha", "mankatha", "ajith kumar", "thala", "yuvan shankar raja", "tamil"]
    },
    {
        "id": "tam_bb_04",
        "title": "Machi Open the Bottle",
        "artist": "Mano, Premgi Amaren, Tippu, Haricharan, Yuvan Shankar Raja",
        "album": "Mankatha",
        "duration": 286,
        "duration_str": "4:46",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "https://c.saavncdn.com/712/Mankatha-Tamil-2011-20200812165520-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["machi open the bottle", "mankatha", "ajith", "yuvan", "tamil"]
    },
    {
        "id": "tam_bb_05",
        "title": "Balleilakka",
        "artist": "S. P. Balasubrahmanyam, A.R. Reihana, A.R. Rahman",
        "album": "Sivaji",
        "duration": 368,
        "duration_str": "6:08",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "https://c.saavncdn.com/023/Sivaji-The-Boss-Tamil-2007-20200812165630-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/023/62c96c4d87452d3a95ce5e6f6a73c330_320.mp4",
        "download_authorized": False,
        "tags": ["balleilakka", "sivaji the boss", "rajinikanth", "spb", "ar rahman", "a.r. rahman", "tamil"]
    },
    {
        "id": "tam_bb_06",
        "title": "Sahana",
        "artist": "Udit Narayan, Chinmayi, A.R. Rahman",
        "album": "Sivaji",
        "duration": 328,
        "duration_str": "5:28",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "https://c.saavncdn.com/023/Sivaji-The-Boss-Tamil-2007-20200812165630-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/023/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["sahana", "sivaji the boss", "rajinikanth", "shriya saran", "ar rahman", "a.r. rahman", "udit narayan", "tamil"]
    },
    {
        "id": "tam_bb_07",
        "title": "Hey Minnale",
        "artist": "Haricharan, Shweta Mohan, G.V. Prakash Kumar",
        "album": "Amaran",
        "duration": 234,
        "duration_str": "3:54",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["trending", "tamil"],
        "cover_url": "https://c.saavncdn.com/082/Hey-Minnale-From-Amaran-Tamil-2024-20241004181023-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/082/7c5034c4bf98a58eecdd3bfd839366df_320.mp4",
        "download_authorized": False,
        "tags": ["hey minnale", "amaran", "sivakarthikeyan", "sai pallavi", "gv prakash", "g.v. prakash", "tamil", "trending"]
    },
    {
        "id": "tam_bb_08",
        "title": "Vennilavu Saaral",
        "artist": "Kapil Kapilan, Rakshita Suresh, G.V. Prakash Kumar",
        "album": "Amaran",
        "duration": 242,
        "duration_str": "4:02",
        "language": "Tamil",
        "category": "Tamil Songs",
        "sections": ["recent", "tamil"],
        "cover_url": "https://c.saavncdn.com/082/Amaran-Tamil-2024-20241022171010-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/082/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["vennilavu saaral", "amaran", "sivakarthikeyan", "sai pallavi", "gv prakash", "tamil"]
    },

    # ==================== GLOBAL ENGLISH HITS ====================
    {
        "id": "eng_bb_01",
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "album": "÷ (Divide)",
        "duration": 233,
        "duration_str": "3:53",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/026/Shape-of-You-English-2017-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/026/01b8e8f81394c8e74f141bf19542bf82_320.mp4",
        "download_authorized": False,
        "tags": ["shape of you", "ed sheeran", "divide", "pop", "english", "trending"]
    },
    {
        "id": "eng_bb_02",
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "duration": 200,
        "duration_str": "3:20",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/836/After-Hours-English-2020-20200320101530-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/836/941785501d51c3c99e4ad611f71dfb99_320.mp4",
        "download_authorized": False,
        "tags": ["blinding lights", "the weeknd", "synthwave", "after hours", "english"]
    },
    {
        "id": "eng_bb_03",
        "title": "Believer",
        "artist": "Imagine Dragons",
        "album": "Evolve",
        "duration": 204,
        "duration_str": "3:24",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/050/Evolve-English-2017-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/050/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["believer", "imagine dragons", "rock", "pop", "english"]
    },
    {
        "id": "eng_bb_04",
        "title": "Faded",
        "artist": "Alan Walker",
        "album": "Faded",
        "duration": 212,
        "duration_str": "3:32",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/712/Faded-English-2015-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/62c96c4d87452d3a95ce5e6f6a73c330_320.mp4",
        "download_authorized": False,
        "tags": ["faded", "alan walker", "edm", "electro", "english"]
    },
    {
        "id": "eng_bb_05",
        "title": "Stay",
        "artist": "The Kid LAROI, Justin Bieber",
        "album": "F*CK LOVE 3+: OVER YOU",
        "duration": 141,
        "duration_str": "2:21",
        "language": "English",
        "category": "English Songs",
        "sections": ["recent", "english"],
        "cover_url": "https://c.saavncdn.com/348/Stay-English-2021-20210709081020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/348/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["stay", "the kid laroi", "justin bieber", "pop", "english"]
    },
    {
        "id": "eng_bb_06",
        "title": "Levitating",
        "artist": "Dua Lipa",
        "album": "Future Nostalgia",
        "duration": 203,
        "duration_str": "3:23",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/257/Future-Nostalgia-English-2020-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/257/7c5034c4bf98a58eecdd3bfd839366df_320.mp4",
        "download_authorized": False,
        "tags": ["levitating", "dua lipa", "disco", "pop", "english"]
    },
    {
        "id": "eng_bb_07",
        "title": "As It Was",
        "artist": "Harry Styles",
        "album": "Harry's House",
        "duration": 167,
        "duration_str": "2:47",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/079/Harrys-House-English-2022-20220520081030-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/079/cf281a78e7275d27ee1c8d5503e0cebe_320.mp4",
        "download_authorized": False,
        "tags": ["as it was", "harry styles", "pop", "english"]
    },
    {
        "id": "eng_bb_08",
        "title": "Cruel Summer",
        "artist": "Taylor Swift",
        "album": "Lover",
        "duration": 178,
        "duration_str": "2:58",
        "language": "English",
        "category": "English Songs",
        "sections": ["trending", "english"],
        "cover_url": "https://c.saavncdn.com/092/Lover-English-2019-20190823081025-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/092/01b8e8f81394c8e74f141bf19542bf82_320.mp4",
        "download_authorized": False,
        "tags": ["cruel summer", "taylor swift", "lover", "pop", "english"]
    },

    # ==================== INSTRUMENTAL MASTERPIECES ====================
    {
        "id": "inst_bb_01",
        "title": "Interstellar Main Theme",
        "artist": "Hans Zimmer",
        "album": "Interstellar (Original Motion Picture Soundtrack)",
        "duration": 246,
        "duration_str": "4:06",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["trending", "instrumental"],
        "cover_url": "https://c.saavncdn.com/814/Interstellar-English-2014-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/814/941785501d51c3c99e4ad611f71dfb99_320.mp4",
        "download_authorized": False,
        "tags": ["interstellar", "hans zimmer", "organ", "space", "sci fi", "instrumental", "soundtrack"]
    },
    {
        "id": "inst_bb_02",
        "title": "Inception - Time",
        "artist": "Hans Zimmer",
        "album": "Inception (Original Motion Picture Soundtrack)",
        "duration": 275,
        "duration_str": "4:35",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["recent", "instrumental"],
        "cover_url": "https://c.saavncdn.com/893/Inception-English-2010-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/893/ad732ea9e04eb92dbf02271a37cb728c_320.mp4",
        "download_authorized": False,
        "tags": ["time", "inception", "hans zimmer", "orchestra", "instrumental"]
    },
    {
        "id": "inst_bb_03",
        "title": "He's a Pirate",
        "artist": "Klaus Badelt, Hans Zimmer",
        "album": "Pirates of the Caribbean: The Curse of the Black Pearl",
        "duration": 90,
        "duration_str": "1:30",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["trending", "instrumental"],
        "cover_url": "https://c.saavncdn.com/026/Pirates-Of-The-Caribbean-English-2003-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/026/62c96c4d87452d3a95ce5e6f6a73c330_320.mp4",
        "download_authorized": False,
        "tags": ["hes a pirate", "pirates of the caribbean", "hans zimmer", "jack sparrow", "instrumental"]
    },
    {
        "id": "inst_bb_04",
        "title": "Game of Thrones Main Theme",
        "artist": "Ramin Djawadi",
        "album": "Game of Thrones: Season 1 Soundtrack",
        "duration": 106,
        "duration_str": "1:46",
        "language": "Instrumental",
        "category": "Instrumental Music",
        "sections": ["trending", "instrumental"],
        "cover_url": "https://c.saavncdn.com/909/Game-Of-Thrones-English-2011-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/909/81e55047ae37fa05e6b5fe898ddb561c_320.mp4",
        "download_authorized": False,
        "tags": ["game of thrones", "ramin djawadi", "cello", "epic", "instrumental"]
    }
]

# Merge & Deduplicate
seen_ids = set()
seen_titles = set()
combined = []

# First priority: Existing catalogue (including offline authorized songs)
for s in existing_songs:
    sid = s.get("id")
    title = s.get("title", "").strip().lower()
    if sid not in seen_ids and title not in seen_titles:
        seen_ids.add(sid)
        seen_titles.add(title)
        combined.append(s)

# Second priority: New curated blockbusters
added_count = 0
for s in NEW_SONGS:
    sid = s.get("id")
    title = s.get("title", "").strip().lower()
    if sid not in seen_ids and title not in seen_titles:
        seen_ids.add(sid)
        seen_titles.add(title)
        combined.append(s)
        added_count += 1

print(f"Added {added_count} new blockbuster songs. Total catalogue: {len(combined)} songs.")

# Write updated songs_data.js
output = f"// Pranesh Music Hub - High-Definition Curated Catalogue (Fully Deduplicated)\nwindow.CATALOGUE_SONGS = {json.dumps(combined, indent=2, ensure_ascii=False)};\n"
with open(SONGS_DATA_PATH, "w", encoding="utf-8") as f:
    f.write(output)

print(f"Successfully saved updated catalogue to {SONGS_DATA_PATH}!")
