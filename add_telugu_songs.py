import os
import json
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SONGS_DATA_PATH = os.path.join(BASE_DIR, "static", "js", "songs_data.js")

TELUGU_SONGS = [
    {
        "id": "saavn_tel_01",
        "title": "Naatu Naatu",
        "artist": "Rahul Sipligunj, Kaala Bhairava, M. M. Keeravani",
        "album": "RRR",
        "duration": 215,
        "duration_str": "3:35",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/152/Naatu-Naatu-From-RRR-Telugu-2021-20211110130540-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/152/40c49cf52ae2c140c83a718b5257545b_320.mp4",
        "download_authorized": False,
        "tags": ["naatu naatu", "rrr", "telugu", "rahul sipligunj", "kaala bhairava", "m. m. keeravani", "ntr", "ram charan", "oscar"]
    },
    {
        "id": "saavn_tel_02",
        "title": "Dosti",
        "artist": "Hemachandra, M. M. Keeravani",
        "album": "RRR",
        "duration": 341,
        "duration_str": "5:41",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/152/Dosti-From-RRR-Telugu-2021-20210801124840-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/152/cbfa87da2ba5c9076f82791444e7bf53_320.mp4",
        "download_authorized": False,
        "tags": ["dosti", "rrr", "telugu", "hemachandra", "m. m. keeravani", "friendship"]
    },
    {
        "id": "saavn_tel_03",
        "title": "Komuram Bheemudo",
        "artist": "Kaala Bhairava, M. M. Keeravani",
        "album": "RRR",
        "duration": 255,
        "duration_str": "4:15",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/152/RRR-Telugu-2022-20220325150830-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/152/78f1ae43d831518f88cf508e6783818e_320.mp4",
        "download_authorized": False,
        "tags": ["komuram bheemudo", "rrr", "telugu", "kaala bhairava", "ntr", "emotional"]
    },
    {
        "id": "saavn_tel_04",
        "title": "Oo Antava Mawa Oo Oo Antava",
        "artist": "Indravathi Chauhan, Devi Sri Prasad",
        "album": "Pushpa - The Rise",
        "duration": 223,
        "duration_str": "3:43",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/830/Pushpa-The-Rise-Telugu-2021-20211230150912-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/830/f0b784cf05d6cb46f79be2768565b95d_320.mp4",
        "download_authorized": False,
        "tags": ["oo antava", "pushpa", "telugu", "allu arjun", "samantha", "dsp", "devi sri prasad", "dance"]
    },
    {
        "id": "saavn_tel_05",
        "title": "Srivalli",
        "artist": "Sid Sriram, Devi Sri Prasad",
        "album": "Pushpa - The Rise",
        "duration": 224,
        "duration_str": "3:44",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/830/Pushpa-The-Rise-Telugu-2021-20211230150912-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/830/8a719d3637e1694f4c8e76a1470550cb_320.mp4",
        "download_authorized": False,
        "tags": ["srivalli", "pushpa", "telugu", "sid sriram", "allu arjun", "rashmika mandanna", "melody"]
    },
    {
        "id": "saavn_tel_06",
        "title": "Saami Saami",
        "artist": "Mounika Yadav, Devi Sri Prasad",
        "album": "Pushpa - The Rise",
        "duration": 223,
        "duration_str": "3:43",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/830/Pushpa-The-Rise-Telugu-2021-20211230150912-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/830/23d45c5890b9fa54817a0273a5a7ad7b_320.mp4",
        "download_authorized": False,
        "tags": ["saami saami", "pushpa", "telugu", "mounika yadav", "rashmika", "folk"]
    },
    {
        "id": "saavn_tel_07",
        "title": "Pushpa Pushpa",
        "artist": "Nakash Aziz, Deepak Blue, Devi Sri Prasad",
        "album": "Pushpa 2 The Rule",
        "duration": 256,
        "duration_str": "4:16",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/264/Pushpa-2-The-Rule-Telugu-2024-20240501171018-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/264/bfd64fa5880b27236d3f295b922a106e_320.mp4",
        "download_authorized": False,
        "tags": ["pushpa pushpa", "pushpa 2", "telugu", "allu arjun", "dsp", "mass beat"]
    },
    {
        "id": "saavn_tel_08",
        "title": "Sooseki (The Couple Song)",
        "artist": "Shreya Ghoshal, Devi Sri Prasad",
        "album": "Pushpa 2 The Rule",
        "duration": 260,
        "duration_str": "4:20",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/264/Pushpa-2-The-Rule-Telugu-2024-20240501171018-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/264/8da23326f582fef52ecad18b958c8a14_320.mp4",
        "download_authorized": False,
        "tags": ["sooseki", "pushpa 2", "telugu", "shreya ghoshal", "allu arjun", "rashmika", "romance"]
    },
    {
        "id": "saavn_tel_09",
        "title": "Butta Bomma",
        "artist": "Armaan Malik, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 198,
        "duration_str": "3:18",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/090/Ala-Vaikunthapurramuloo-Telugu-2019-20200113151121-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/090/3b4d455d3159345e69e06180a4b64e0a_320.mp4",
        "download_authorized": False,
        "tags": ["butta bomma", "ala vaikunthapurramuloo", "telugu", "armaan malik", "allu arjun", "pooja hegde", "thaman"]
    },
    {
        "id": "saavn_tel_10",
        "title": "Samajavaragamana",
        "artist": "Sid Sriram, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 214,
        "duration_str": "3:34",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/090/Ala-Vaikunthapurramuloo-Telugu-2019-20200113151121-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/090/07ea1ec85c07b01b2289ee0c313a48e7_320.mp4",
        "download_authorized": False,
        "tags": ["samajavaragamana", "ala vaikunthapurramuloo", "telugu", "sid sriram", "thaman", "allu arjun"]
    },
    {
        "id": "saavn_tel_11",
        "title": "Ramuloo Ramulaa",
        "artist": "Anurag Kulkarni, Mangli, Thaman S",
        "album": "Ala Vaikunthapurramuloo",
        "duration": 244,
        "duration_str": "4:04",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/090/Ala-Vaikunthapurramuloo-Telugu-2019-20200113151121-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/090/e33d262193b2a3a5d85ec1ef87bc7a2d_320.mp4",
        "download_authorized": False,
        "tags": ["ramuloo ramulaa", "ala vaikunthapurramuloo", "telugu", "anurag kulkarni", "mangli", "thaman"]
    },
    {
        "id": "saavn_tel_12",
        "title": "Chuttamalle",
        "artist": "Shilpa Rao, Anirudh Ravichander",
        "album": "Devara Part 1 (Telugu)",
        "duration": 222,
        "duration_str": "3:42",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/793/Chuttamalle-From-Devara-Part-1-Telugu-2024-20240805174003-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/793/d1be5fc51cf57662c5950e6912389146_320.mp4",
        "download_authorized": False,
        "tags": ["chuttamalle", "devara part 1", "telugu", "shilpa rao", "anirudh ravichander", "jr ntr", "janhvi kapoor"]
    },
    {
        "id": "saavn_tel_13",
        "title": "Fear Song (Telugu)",
        "artist": "Anirudh Ravichander",
        "album": "Devara Part 1 (Telugu)",
        "duration": 195,
        "duration_str": "3:15",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/264/Fear-Song-From-Devara-Part-1-Telugu-2024-20240519191024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/264/88c222ffda588147d3d20ebba87a54a7_320.mp4",
        "download_authorized": False,
        "tags": ["fear song", "devara part 1", "telugu", "anirudh", "jr ntr", "mass"]
    },
    {
        "id": "saavn_tel_14",
        "title": "Daavudi",
        "artist": "Nakash Aziz, Akasa, Anirudh Ravichander",
        "album": "Devara Part 1 (Telugu)",
        "duration": 266,
        "duration_str": "4:26",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/830/Daavudi-From-Devara-Part-1-Telugu-2024-20240904171024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/830/45abfa20c754d0482dae1069b18365ef_320.mp4",
        "download_authorized": False,
        "tags": ["daavudi", "devara part 1", "telugu", "anirudh", "jr ntr", "janhvi kapoor", "party"]
    },
    {
        "id": "saavn_tel_15",
        "title": "Ta Takkara",
        "artist": "Sanjith Hegde, Dhibu Ninan Thomas, Santhosh Narayanan",
        "album": "Kalki 2898 AD (Telugu)",
        "duration": 208,
        "duration_str": "3:28",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/892/Ta-Takkara-From-Kalki-2898-AD-Telugu-2024-20240629161025-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/892/7d56e7e5944ea5954a1be2e6fca78e82_320.mp4",
        "download_authorized": False,
        "tags": ["ta takkara", "kalki 2898 ad", "telugu", "prabhas", "disha patani", "santhosh narayanan", "sanjith hegde"]
    },
    {
        "id": "saavn_tel_16",
        "title": "Theme of Kalki",
        "artist": "Kaala Bhairava, Gowtham Bharadwaj",
        "album": "Kalki 2898 AD (Telugu)",
        "duration": 204,
        "duration_str": "3:24",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/892/Kalki-2898-AD-Telugu-2024-20240710181025-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/892/5ba9fa62ce095aa128e441cbdfa5108b_320.mp4",
        "download_authorized": False,
        "tags": ["theme of kalki", "kalki 2898 ad", "telugu", "kaala bhairava", "prabhas", "epic"]
    },
    {
        "id": "saavn_tel_17",
        "title": "Inkem Inkem Inkem Kaavaale",
        "artist": "Sid Sriram, Gopi Sundar",
        "album": "Geetha Govindam",
        "duration": 268,
        "duration_str": "4:28",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/712/Geetha-Govindam-Telugu-2018-20180812-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/e8f7cb679ad30e4612347bc8da8fa5ea_320.mp4",
        "download_authorized": False,
        "tags": ["inkem inkem", "geetha govindam", "telugu", "sid sriram", "vijay deverakonda", "rashmika", "romance"]
    },
    {
        "id": "saavn_tel_18",
        "title": "Vachindamma",
        "artist": "Sid Sriram, Gopi Sundar",
        "album": "Geetha Govindam",
        "duration": 242,
        "duration_str": "4:02",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/712/Geetha-Govindam-Telugu-2018-20180812-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/712/5fa4c2dae4bc0b3969542ae1629d892d_320.mp4",
        "download_authorized": False,
        "tags": ["vachindamma", "geetha govindam", "telugu", "sid sriram", "vijay deverakonda"]
    },
    {
        "id": "saavn_tel_19",
        "title": "Dheevara",
        "artist": "Ramya Behara, Deepu, M. M. Keeravani",
        "album": "Baahubali - The Beginning",
        "duration": 343,
        "duration_str": "5:43",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/152/Baahubali-The-Beginning-Telugu-2015-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/152/35928dce593258c8dbcae09646b2b515_320.mp4",
        "download_authorized": False,
        "tags": ["dheevara", "baahubali", "telugu", "prabhas", "tamannaah", "m. m. keeravani", "waterfall"]
    },
    {
        "id": "saavn_tel_20",
        "title": "Saahore Baahubali",
        "artist": "Daler Mehndi, M. M. Keeravani, Mounima",
        "album": "Baahubali 2 - The Conclusion",
        "duration": 203,
        "duration_str": "3:23",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/832/Baahubali-2-The-Conclusion-Telugu-2017-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/832/90e7223bdf33cfcf484d50bf6c364132_320.mp4",
        "download_authorized": False,
        "tags": ["saahore baahubali", "baahubali 2", "telugu", "prabhas", "m. m. keeravani", "daler mehndi", "anthem"]
    },
    {
        "id": "saavn_tel_21",
        "title": "Kurchi Madathapetti",
        "artist": "Sahithi Chaganti, Sri Krishna, Thaman S",
        "album": "Guntur Kaaram",
        "duration": 218,
        "duration_str": "3:38",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/524/Kurchi-Madathapetti-From-Guntur-Kaaram-Telugu-2023-20231230181024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/524/e98bf75239ad00ef4caae5f850284ab9_320.mp4",
        "download_authorized": False,
        "tags": ["kurchi madathapetti", "guntur kaaram", "telugu", "mahesh babu", "sreeleela", "thaman", "dance"]
    },
    {
        "id": "saavn_tel_22",
        "title": "Dum Masala",
        "artist": "Sanjith Hegde, Thaman S",
        "album": "Guntur Kaaram",
        "duration": 206,
        "duration_str": "3:26",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/524/Dum-Masala-From-Guntur-Kaaram-Telugu-2023-20231107181024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/524/60cbdecf9066cb1dfd462ab9e19a4e3b_320.mp4",
        "download_authorized": False,
        "tags": ["dum masala", "guntur kaaram", "telugu", "mahesh babu", "thaman"]
    },
    {
        "id": "saavn_tel_23",
        "title": "Kalaavathi",
        "artist": "Sid Sriram, Thaman S",
        "album": "Sarkaru Vaari Paata",
        "duration": 242,
        "duration_str": "4:02",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["trending", "telugu"],
        "cover_url": "https://c.saavncdn.com/524/Kalaavathi-From-Sarkaru-Vaari-Paata-Telugu-2022-20220213121024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/524/92abde55c0aefb4d9a24ca18a7c1328f_320.mp4",
        "download_authorized": False,
        "tags": ["kalaavathi", "sarkaru vaari paata", "telugu", "mahesh babu", "keerthy suresh", "sid sriram", "thaman"]
    },
    {
        "id": "saavn_tel_24",
        "title": "Saranga Dariya",
        "artist": "Mangli, Pawan Ch",
        "album": "Love Story",
        "duration": 229,
        "duration_str": "3:49",
        "language": "Telugu",
        "category": "Telugu Songs",
        "sections": ["recent", "telugu"],
        "cover_url": "https://c.saavncdn.com/152/Saranga-Dariya-From-Love-Story-Telugu-2021-20210228111024-500x500.jpg",
        "audio_url": "https://aac.saavncdn.com/152/45cbf9ea71628d0eb9f972b21703e39b_320.mp4",
        "download_authorized": False,
        "tags": ["saranga dariya", "love story", "telugu", "mangli", "sai pallavi", "naga chaitanya", "folk"]
    }
]

def merge():
    with open(SONGS_DATA_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    m = re.search(r"window\.CATALOGUE_SONGS\s*=\s*(\[.*?\]);", content, re.DOTALL)
    if not m:
        print("Could not find window.CATALOGUE_SONGS")
        return

    existing = json.loads(m.group(1))
    seen_ids = set(s["id"] for s in existing)
    seen_titles = set(s["title"].lower().strip() for s in existing)

    added = 0
    for s in TELUGU_SONGS:
        if s["id"] not in seen_ids and s["title"].lower().strip() not in seen_titles:
            existing.append(s)
            seen_ids.add(s["id"])
            seen_titles.add(s["title"].lower().strip())
            added += 1

    new_content = f"// Pranesh Music Hub - High-Definition Curated Catalogue (Fully Deduplicated)\nwindow.CATALOGUE_SONGS = {json.dumps(existing, indent=2, ensure_ascii=False)};\n"
    with open(SONGS_DATA_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Successfully added {added} Telugu tracks! Total songs now: {len(existing)}")

if __name__ == "__main__":
    merge()
