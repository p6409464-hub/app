"""
Unit and Integration Tests for Pranesh Music Hub
"""

import sys
import os
import unittest

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, SONGS_CATALOGUE


class PraneshMusicHubTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_01_index_page(self):
        """Verify the main home page loads cleanly."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        html = res.get_data(as_text=True)
        self.assertIn("Pranesh Music Hub", html)
        self.assertIn("playerBar", html)
        self.assertIn("searchInput", html)

    def test_02_get_all_songs(self):
        """Verify the songs catalogue API returns valid data."""
        res = self.client.get("/api/songs")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        self.assertGreater(data["count"], 0)
        self.assertEqual(len(data["songs"]), data["count"])

        # Check required song properties
        first = data["songs"][0]
        for key in ["id", "title", "artist", "album", "duration_str", "language", "category", "cover_url"]:
            self.assertIn(key, first)

    def test_03_language_filter(self):
        """Verify filtering songs by language."""
        languages = ["tamil", "telugu", "hindi", "english", "malayalam", "instrumental", "only_friends"]
        for lang in languages:
            res = self.client.get(f"/api/songs?language={lang}")
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertGreater(data["count"], 0, f"No tracks found for language: {lang}")
            if lang == "only_friends":
                self.assertTrue(all(s["category"] == "Only Friends OST" for s in data["songs"]))
            else:
                self.assertTrue(all(s["language"].lower() == lang for s in data["songs"]))

    def test_04_search_songs(self):
        """Verify searching by song title, artist, and genre."""
        search_terms = ["friends", "tamil", "english", "flute", "piano", "only friends"]
        for q in search_terms:
            res = self.client.get(f"/api/songs?query={q}")
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertGreater(data["count"], 0, f"Search returned 0 results for query '{q}'")

    def test_05_audio_streaming(self):
        """Verify audio streaming with full content and HTTP 206 Partial Content."""
        song_id = SONGS_CATALOGUE[0]["id"]
        
        # 1. Full stream request
        res = self.client.get(f"/api/stream/{song_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, "audio/mpeg")
        self.assertGreater(len(res.data), 100000)

        # 2. HTTP 206 Partial Content (Range: bytes=0-1024)
        res_range = self.client.get(
            f"/api/stream/{song_id}",
            headers={"Range": "bytes=0-1024"}
        )
        self.assertEqual(res_range.status_code, 206)
        self.assertEqual(res_range.content_type, "audio/mpeg")
        self.assertEqual(len(res_range.data), 1025)
        self.assertIn("Content-Range", res_range.headers)

    def test_06_mp3_direct_download(self):
        """Verify direct MP3 download endpoint serves genuine attachment file."""
        song = SONGS_CATALOGUE[0]
        song_id = song["id"]
        res = self.client.get(f"/api/download/{song_id}")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, "audio/mpeg")
        
        # Verify Content-Disposition header is attachment
        disp = res.headers.get("Content-Disposition", "")
        self.assertIn("attachment", disp)
        self.assertIn(".mp3", disp)
        self.assertGreater(len(res.data), 100000)

    def test_07_source_inspection(self):
        """Verify the 'Only Friends MP3' source inspection API endpoint."""
        res = self.client.get("/api/source-inspection")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["requested_source"], "Only Friends MP3")
        self.assertIn("domain_checks", data)
        self.assertIn("inspection_summary", data)
        self.assertIn("compliance_action", data)
        self.assertFalse(data["authorized_api_found"])


if __name__ == "__main__":
    unittest.main()
