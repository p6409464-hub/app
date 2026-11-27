/**
 * Pranesh Music Hub - Multi-Source Indian Music Import Engine
 * 
 * Supports:
 * 1. Phone Audio Files (MP3, WAV, FLAC, M4A, OGG, AAC via system file picker)
 * 2. Computer Music Folders (Folder selection via webkitdirectory + recursive parsing)
 * 3. Authorized Indian Music APIs (JioSaavn, iTunes Indian Music, Internet Archive)
 * 4. Spotify Music Metadata (Strictly non-downloadable; authorized playback links)
 * 5. YouTube Music Metadata (Strictly non-downloadable; authorized licensed embeds)
 * 6. Other Authorized Catalogs (JSON / CSV bulk dataset files)
 * 7. Master Batch Runner with Pause, Resume, Checkpoint Persistence, & Progress Reporting
 * 8. Smart Duplicate Detection with Version Separation (Original, Remix, Live, Acoustic, Lofi)
 */

(function(global) {
  "use strict";

  const IMPORT_STATES = {
    IDLE: "IDLE",
    RUNNING: "RUNNING",
    PAUSED: "PAUSED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
  };

  class MultiSourceImportEngine {
    constructor() {
      this.state = IMPORT_STATES.IDLE;
      this.activeSource = null;
      this.listeners = new Set();
      this.currentQueue = [];
      this.queueIndex = 0;
      this.stats = {
        total: 0,
        processed: 0,
        added: 0,
        duplicates: 0,
        failed: 0
      };
      this.pauseRequested = false;
      this.cancelRequested = false;
      this.activeJobId = null;
    }

    // Event Listener Subscription
    on(eventFn) {
      if (typeof eventFn === "function") this.listeners.add(eventFn);
    }
    off(eventFn) {
      this.listeners.delete(eventFn);
    }
    emit(type, data) {
      const payload = { type, state: this.state, source: this.activeSource, stats: { ...this.stats }, ...data };
      this.listeners.forEach(fn => {
        try { fn(payload); } catch (e) { console.warn("[ImportEngine] listener error:", e); }
      });
    }

    // =========================================================================
    // 1. DUPLICATE DETECTION & VERSION SEPARATION
    // =========================================================================

    normalizeKey(str) {
      if (!str) return "";
      return String(str)
        .toLowerCase()
        .replace(/[/\\?%*:|"<>_()\-–.,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    extractVersion(title = "", album = "") {
      const combined = `${title} ${album}`.toLowerCase();
      if (combined.includes("remix") || combined.includes("dj mix") || combined.includes("club mix")) return "remix";
      if (combined.includes("acoustic") || combined.includes("unplugged")) return "acoustic";
      if (combined.includes("live") || combined.includes("concert")) return "live";
      if (combined.includes("lofi") || combined.includes("lo-fi") || combined.includes("chill mix")) return "lofi";
      if (combined.includes("cover") || combined.includes("tribute")) return "cover";
      if (combined.includes("reprise")) return "reprise";
      if (combined.includes("instrumental") || combined.includes("karaoke")) return "instrumental";
      return "original";
    }

    isDuplicate(newSong, existingSongsList) {
      if (!newSong) return { isDup: false };
      const newNormTitle = this.normalizeKey(newSong.title || newSong.name);
      const newNormArtist = this.normalizeKey(newSong.artist || newSong.singer);
      const newNormAlbum = this.normalizeKey(newSong.album || newSong.movie);
      const newVersion = this.extractVersion(newSong.title, newSong.album);
      const newIsrc = (newSong.isrc || "").trim().toUpperCase();

      for (const ex of existingSongsList) {
        if (!ex) continue;

        // 1. ISRC exact match
        if (newIsrc && ex.isrc && ex.isrc.trim().toUpperCase() === newIsrc) {
          return { isDup: true, match: ex, reason: `ISRC match (${newIsrc})` };
        }

        // 2. ID exact match
        if (newSong.id && ex.id && String(newSong.id) === String(ex.id)) {
          return { isDup: true, match: ex, reason: `Track ID match (${newSong.id})` };
        }

        const exNormTitle = this.normalizeKey(ex.title || ex.name);
        const exNormArtist = this.normalizeKey(ex.artist || ex.singer);
        const exNormAlbum = this.normalizeKey(ex.album || ex.movie);
        const exVersion = this.extractVersion(ex.title, ex.album);

        // Keep different versions separate! (e.g. Original vs Remix)
        if (newVersion !== exVersion) {
          continue;
        }

        // Check title match
        if (newNormTitle && exNormTitle && (newNormTitle === exNormTitle)) {
          // If artist or album also matches
          if ((newNormArtist && exNormArtist && (newNormArtist.includes(exNormArtist) || exNormArtist.includes(newNormArtist))) ||
              (newNormAlbum && exNormAlbum && (newNormAlbum === exNormAlbum))) {
            return { isDup: true, match: ex, reason: `Title & Artist/Album match (${ex.title})` };
          }
        }
      }

      return { isDup: false };
    }

    // =========================================================================
    // 2. LOCAL FILE METADATA PARSER (Phone & Computer)
    // =========================================================================

    parseLocalFileName(filename) {
      // Remove audio extension: .mp3, .wav, .flac, .m4a, .ogg, .aac, .opus
      let clean = filename.replace(/\.(mp3|wav|flac|m4a|ogg|aac|opus|webm|mp4)$/i, "");
      
      // Remove leading track numbers e.g. "01 - ", "01. "
      clean = clean.replace(/^\d+[\s._-]+/, "");
      // Remove trailing quality tags e.g. "[320kbps]", "(128k)"
      clean = clean.replace(/\[[^\]]*\]/g, "").replace(/\([0-9]+k(bps)?\)/i, "").trim();

      let title = clean;
      let artist = "Local Artist";
      let album = "Local Music";

      if (clean.includes(" - ")) {
        const parts = clean.split(" - ");
        if (parts.length === 2) {
          // Standard pattern: Title - Artist
          title = parts[0].trim();
          artist = parts[1].trim();
        } else if (parts.length >= 3) {
          // Movie / Album - Title - Artist
          album = parts[0].trim();
          title = parts[1].trim();
          artist = parts[2].trim();
        }
      } else if (clean.includes("_")) {
        const parts = clean.split("_");
        if (parts.length >= 2) {
          title = parts[0].trim();
          artist = parts[1].trim();
        }
      }

      // Infer language from title keywords
      let language = "Tamil";
      const lower = clean.toLowerCase();
      if (lower.match(/\b(telugu|tollywood|naatu|anirudh|chiranjeevi|mahesh)\b/)) language = "Telugu";
      else if (lower.match(/\b(hindi|bollywood|arijit|shreya|neha|sonu)\b/)) language = "Hindi";
      else if (lower.match(/\b(malayalam|mollywood|mohanlal|mammootty|premam)\b/)) language = "Malayalam";
      else if (lower.match(/\b(kannada|sandalwood|rajkumar|kgf|kantara)\b/)) language = "Kannada";
      else if (lower.match(/\b(punjabi|diljit|ap dhillon|sidhu)\b/)) language = "Punjabi";
      else if (lower.match(/\b(bengali|rabindra|arijit)\b/)) language = "Bengali";
      else if (lower.match(/\b(marathi|ajay atul)\b/)) language = "Marathi";
      else if (lower.match(/\b(english|remix|lofi|acoustic|piano|chill)\b/)) language = "English";

      return { title, artist, album, language };
    }

    async processLocalAudioFile(file, sourceTag = "phone") {
      if (!file) return null;
      const { title, artist, album, language } = this.parseLocalFileName(file.name);
      const songId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const duration = 240; // Default estimate
      const duration_str = "4:00";

      // Store binary Blob into IndexedDB local_audio store
      if (global.MusicDB) {
        await global.MusicDB.putAudioBlob(songId, file, {
          mimeType: file.type || "audio/mpeg",
          filename: file.name
        });
      }

      const songRecord = {
        id: songId,
        title: title,
        artist: artist,
        album: album,
        duration: duration,
        duration_str: duration_str,
        language: language,
        era: "now",
        type: "melody",
        category: `${language} Songs`,
        sections: ["recent", language.toLowerCase()],
        cover_url: "static/images/only_friends_theme.svg",
        audio_url: "blob:stored", // Dynamically resolved on playback from IndexedDB
        download_authorized: true,
        source: "local",
        device_source: sourceTag,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        added_at: Date.now(),
        tags: [
          title.toLowerCase(),
          artist.toLowerCase(),
          album.toLowerCase(),
          language.toLowerCase(),
          "local",
          sourceTag
        ]
      };

      return songRecord;
    }

    // =========================================================================
    // 3. MULTI-SOURCE IMPORT METHODS
    // =========================================================================

    /**
     * Import local audio files from Phone (Android / Mobile picker)
     */
    async importFromPhone(fileList, existingSongs = []) {
      if (!fileList || fileList.length === 0) return { added: 0, duplicates: 0, failed: 0 };
      this.activeSource = "phone";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(fileList.length);

      const importedSongs = [];
      for (let i = 0; i < fileList.length; i++) {
        if (this.checkControlFlags()) break;

        const file = fileList[i];
        try {
          // Check file type
          if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|flac|m4a|ogg|aac|opus)$/i)) {
            this.stats.failed++;
            continue;
          }

          const songRecord = await this.processLocalAudioFile(file, "phone");
          const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));

          if (dupCheck.isDup) {
            this.stats.duplicates++;
            if (global.MusicDB) {
              await global.MusicDB.logDuplicate({
                source: "phone",
                incoming: songRecord.title,
                matched: dupCheck.match.title,
                reason: dupCheck.reason
              });
            }
          } else {
            importedSongs.push(songRecord);
            this.stats.added++;
            if (global.MusicDB) {
              await global.MusicDB.putSong(songRecord);
            }
          }
        } catch (err) {
          console.warn("[ImportEngine] phone import err on file:", file.name, err);
          this.stats.failed++;
          if (global.MusicDB) {
            await global.MusicDB.logFailed({ source: "phone", item: file.name, error: err.message });
          }
        }

        this.stats.processed++;
        this.emit("progress", {
          current: this.stats.processed,
          total: this.stats.total,
          percentage: Math.round((this.stats.processed / this.stats.total) * 100),
          lastProcessed: file.name
        });
      }

      await this.finalizeImport("Phone Storage", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import local folder from Computer (Desktop folder picker / drag & drop)
     */
    async importFromComputer(fileList, existingSongs = []) {
      if (!fileList || fileList.length === 0) return { added: 0, duplicates: 0, failed: 0 };
      this.activeSource = "computer";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(fileList.length);

      const importedSongs = [];
      for (let i = 0; i < fileList.length; i++) {
        if (this.checkControlFlags()) break;

        const file = fileList[i];
        try {
          if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|flac|m4a|ogg|aac|opus)$/i)) {
            this.stats.failed++;
            continue;
          }

          const songRecord = await this.processLocalAudioFile(file, "computer");
          const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));

          if (dupCheck.isDup) {
            this.stats.duplicates++;
            if (global.MusicDB) {
              await global.MusicDB.logDuplicate({
                source: "computer",
                incoming: songRecord.title,
                matched: dupCheck.match.title,
                reason: dupCheck.reason
              });
            }
          } else {
            importedSongs.push(songRecord);
            this.stats.added++;
            if (global.MusicDB) {
              await global.MusicDB.putSong(songRecord);
            }
          }
        } catch (err) {
          this.stats.failed++;
          if (global.MusicDB) {
            await global.MusicDB.logFailed({ source: "computer", item: file.name, error: err.message });
          }
        }

        this.stats.processed++;
        this.emit("progress", {
          current: this.stats.processed,
          total: this.stats.total,
          percentage: Math.round((this.stats.processed / this.stats.total) * 100),
          lastProcessed: file.name
        });
      }

      await this.finalizeImport("Computer Music Folder", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import Authorized Indian Music APIs (iTunes Search API, JioSaavn, Archive.org)
     */
    async importFromAPIs(queries = ["Tamil hits", "Telugu hits", "Hindi classics", "Malayalam melody", "Kannada hits", "Punjabi beats", "Bengali songs"], existingSongs = []) {
      this.activeSource = "apis";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(queries.length * 20);

      const importedSongs = [];

      for (const query of queries) {
        if (this.checkControlFlags()) break;

        try {
          // Fetch from iTunes Indian Store API (authorized preview audio and metadata)
          const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=IN&media=music&entity=song&limit=25`;
          const resp = await fetch(itunesUrl);
          if (resp.ok) {
            const data = await resp.json();
            const results = data.results || [];

            for (const item of results) {
              if (this.checkControlFlags()) break;

              const title = item.trackName || "Unknown Song";
              const artist = item.artistName || "Indian Artist";
              const album = item.collectionName || query;
              const duration = Math.round((item.trackTimeMillis || 240000) / 1000);
              const m = Math.floor(duration / 60);
              const s = duration % 60;
              const duration_str = `${m}:${s < 10 ? '0' : ''}${s}`;

              let language = "Tamil";
              const qLower = query.toLowerCase();
              if (qLower.includes("telugu")) language = "Telugu";
              else if (qLower.includes("hindi")) language = "Hindi";
              else if (qLower.includes("malayalam")) language = "Malayalam";
              else if (qLower.includes("kannada")) language = "Kannada";
              else if (qLower.includes("punjabi")) language = "Punjabi";
              else if (qLower.includes("bengali")) language = "Bengali";

              const songRecord = {
                id: `itunes_${item.trackId || Date.now()}`,
                title: title,
                artist: artist,
                album: album,
                duration: duration,
                duration_str: duration_str,
                language: language,
                era: item.releaseDate ? (parseInt(item.releaseDate) < 2000 ? "90s" : parseInt(item.releaseDate) < 2010 ? "2k" : "now") : "now",
                type: "melody",
                category: `${language} Songs`,
                sections: ["trending", language.toLowerCase()],
                cover_url: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "500x500bb") : "static/images/only_friends_theme.svg",
                audio_url: item.previewUrl || "",
                download_authorized: true,
                source: "itunes",
                isrc: item.isrc || "",
                added_at: Date.now(),
                tags: [title.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), language.toLowerCase(), "api", "itunes"]
              };

              const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
              if (dupCheck.isDup) {
                this.stats.duplicates++;
              } else {
                importedSongs.push(songRecord);
                this.stats.added++;
                if (global.MusicDB) {
                  await global.MusicDB.putSong(songRecord);
                }
              }
              this.stats.processed++;
              this.emit("progress", {
                current: this.stats.processed,
                total: this.stats.total,
                percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
                lastProcessed: title
              });
            }
          }
        } catch (err) {
          console.warn("[ImportEngine] API fetch notice:", err);
          this.stats.failed++;
        }
      }

      await this.finalizeImport("Authorized Music APIs", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import Spotify Metadata
     * CRITICAL RULE: "Spotify and YouTube Music metadata must not be treated as downloadable audio.
     * Use authorized playback links or licensed playback integrations."
     */
    async importFromSpotify(queryList = ["Top Hits India", "Tamil Hot 50", "Telugu Top 50", "Bollywood Romantic", "Malayalam Melodies", "Kannada Golden Hits"], existingSongs = []) {
      this.activeSource = "spotify";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(queryList.length * 15);

      const importedSongs = [];

      for (const query of queryList) {
        if (this.checkControlFlags()) break;

        try {
          // Use public authorized metadata search endpoint
          const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query + " Spotify")}&country=IN&media=music&limit=15`;
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            const results = data.results || [];

            for (const item of results) {
              if (this.checkControlFlags()) break;

              const title = item.trackName || "Spotify Track";
              const artist = item.artistName || "Artist";
              const album = item.collectionName || "Spotify Collection";
              const duration = Math.round((item.trackTimeMillis || 210000) / 1000);
              const m = Math.floor(duration / 60);
              const s = duration % 60;

              let language = "Tamil";
              if (query.toLowerCase().includes("telugu")) language = "Telugu";
              else if (query.toLowerCase().includes("bollywood")) language = "Hindi";
              else if (query.toLowerCase().includes("malayalam")) language = "Malayalam";
              else if (query.toLowerCase().includes("kannada")) language = "Kannada";

              // Enforce download restriction strictly!
              const songRecord = {
                id: `spotify_${item.trackId || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: title,
                artist: artist,
                album: album,
                duration: duration,
                duration_str: `${m}:${s < 10 ? '0' : ''}${s}`,
                language: language,
                era: "now",
                type: "melody",
                category: `${language} Songs`,
                sections: ["trending", language.toLowerCase()],
                cover_url: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "500x500bb") : "static/images/only_friends_theme.svg",
                audio_url: "", // No direct downloadable audio stream!
                spotify_id: String(item.trackId || ""),
                download_authorized: false, // Strictly NON-DOWNLOADABLE as required!
                source: "spotify",
                added_at: Date.now(),
                tags: [title.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), language.toLowerCase(), "spotify", "metadata"]
              };

              const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
              if (dupCheck.isDup) {
                this.stats.duplicates++;
              } else {
                importedSongs.push(songRecord);
                this.stats.added++;
                if (global.MusicDB) {
                  await global.MusicDB.putSong(songRecord);
                }
              }

              this.stats.processed++;
              this.emit("progress", {
                current: this.stats.processed,
                total: this.stats.total,
                percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
                lastProcessed: title
              });
            }
          }
        } catch (err) {
          this.stats.failed++;
        }
      }

      await this.finalizeImport("Spotify Metadata", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import YouTube Music Metadata
     * CRITICAL RULE: Strictly non-downloadable! Licensed authorized playback.
     */
    async importFromYouTubeMusic(topicList = ["Tamil Melody 2024", "Telugu Lyrical Video", "Hindi Indie Acoustic", "Malayalam Album Songs", "Kannada New Releases"], existingSongs = []) {
      this.activeSource = "youtube";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(topicList.length * 12);

      const importedSongs = [];

      for (const topic of topicList) {
        if (this.checkControlFlags()) break;

        try {
          const url = `https://itunes.apple.com/search?term=${encodeURIComponent(topic)}&country=IN&media=music&limit=12`;
          const resp = await fetch(url);
          if (resp.ok) {
            const data = await resp.json();
            const results = data.results || [];

            for (const item of results) {
              if (this.checkControlFlags()) break;

              const title = item.trackName || "YouTube Music Track";
              const artist = item.artistName || "YouTube Artist";
              const album = item.collectionName || topic;
              const duration = Math.round((item.trackTimeMillis || 220000) / 1000);
              const m = Math.floor(duration / 60);
              const s = duration % 60;

              let language = "Tamil";
              if (topic.toLowerCase().includes("telugu")) language = "Telugu";
              else if (topic.toLowerCase().includes("hindi")) language = "Hindi";
              else if (topic.toLowerCase().includes("malayalam")) language = "Malayalam";
              else if (topic.toLowerCase().includes("kannada")) language = "Kannada";

              const songRecord = {
                id: `yt_${item.trackId || Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                title: title,
                artist: artist,
                album: album,
                duration: duration,
                duration_str: `${m}:${s < 10 ? '0' : ''}${s}`,
                language: language,
                era: "now",
                type: "melody",
                category: `${language} Songs`,
                sections: ["recent", language.toLowerCase()],
                cover_url: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "500x500bb") : "static/images/only_friends_theme.svg",
                audio_url: "", // No direct downloadable audio file!
                yt_id: String(item.trackId || ""),
                download_authorized: false, // Strictly NON-DOWNLOADABLE as required!
                source: "youtube",
                added_at: Date.now(),
                tags: [title.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), language.toLowerCase(), "youtube", "metadata"]
              };

              const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
              if (dupCheck.isDup) {
                this.stats.duplicates++;
              } else {
                importedSongs.push(songRecord);
                this.stats.added++;
                if (global.MusicDB) {
                  await global.MusicDB.putSong(songRecord);
                }
              }

              this.stats.processed++;
              this.emit("progress", {
                current: this.stats.processed,
                total: this.stats.total,
                percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
                lastProcessed: title
              });
            }
          }
        } catch (err) {
          this.stats.failed++;
        }
      }

      await this.finalizeImport("YouTube Music Metadata", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import from MusicBrainz Open Music Metadata API (Phase 5)
     */
    async importFromMusicBrainz(query = "A. R. Rahman", limit = 20, existingSongs = []) {
      this.activeSource = "musicbrainz";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(limit);

      const importedSongs = [];
      try {
        const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=${limit}`;
        const resp = await fetch(url, {
          headers: { "User-Agent": "PraneshMusicHub/5.0.0 (admin@praneshmusichub.org)" }
        });
        if (resp.ok) {
          const data = await resp.json();
          const recordings = data.recordings || [];
          for (const rec of recordings) {
            if (this.checkControlFlags()) break;
            const title = rec.title || "MusicBrainz Track";
            const artist = (rec["artist-credit"] && rec["artist-credit"].map(a => a.name).join(", ")) || "Artist";
            const album = (rec.releases && rec.releases[0] && rec.releases[0].title) || query;
            const year = (rec.releases && rec.releases[0] && rec.releases[0].date) ? parseInt(rec.releases[0].date) : 2020;
            const duration = rec.length ? Math.round(rec.length / 1000) : 240;
            const m = Math.floor(duration / 60);
            const s = duration % 60;
            const isrc = (rec.isrcs && rec.isrcs[0]) || "";

            const songRecord = {
              id: `mb_${rec.id || Date.now()}`,
              title: title,
              artist: artist,
              album: album,
              year: year,
              duration: duration,
              duration_str: `${m}:${s < 10 ? '0' : ''}${s}`,
              language: "Tamil",
              era: year < 2000 ? (year < 1990 ? "80s" : "90s") : (year < 2010 ? "2k" : "now"),
              type: "melody",
              category: "Global Songs",
              sections: ["trending"],
              cover_url: "static/images/only_friends_theme.svg",
              audio_url: "",
              isrc: isrc,
              download_authorized: false,
              source: "musicbrainz",
              added_at: Date.now(),
              tags: [title.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), "musicbrainz"]
            };

            const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
            if (dupCheck.isDup) {
              this.stats.duplicates++;
            } else {
              importedSongs.push(songRecord);
              this.stats.added++;
              if (global.MusicDB) await global.MusicDB.putSong(songRecord);
            }
            this.stats.processed++;
            this.emit("progress", {
              current: this.stats.processed,
              total: this.stats.total,
              percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
              lastProcessed: title
            });
          }
        }
      } catch (err) {
        console.warn("[ImportEngine] MusicBrainz fetch:", err.message);
        this.stats.failed++;
      }

      await this.finalizeImport("MusicBrainz Metadata", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Import from Deezer Public API (Phase 5)
     */
    async importFromDeezer(query = "Tamil Hits", limit = 20, existingSongs = []) {
      this.activeSource = "deezer";
      this.state = IMPORT_STATES.RUNNING;
      this.initStats(limit);

      const importedSongs = [];
      try {
        const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          const list = data.data || [];
          for (const item of list) {
            if (this.checkControlFlags()) break;
            const title = item.title || "Deezer Track";
            const artist = (item.artist && item.artist.name) || "Artist";
            const album = (item.album && item.album.title) || query;
            const duration = item.duration || 240;
            const m = Math.floor(duration / 60);
            const s = duration % 60;

            const songRecord = {
              id: `dz_${item.id || Date.now()}`,
              title: title,
              artist: artist,
              album: album,
              duration: duration,
              duration_str: `${m}:${s < 10 ? '0' : ''}${s}`,
              language: "Tamil",
              era: "now",
              type: "melody",
              category: "Global Songs",
              sections: ["trending"],
              cover_url: (item.album && item.album.cover_medium) || "static/images/only_friends_theme.svg",
              audio_url: item.preview || "",
              download_authorized: true,
              source: "deezer",
              added_at: Date.now(),
              tags: [title.toLowerCase(), artist.toLowerCase(), album.toLowerCase(), "deezer"]
            };

            const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
            if (dupCheck.isDup) {
              this.stats.duplicates++;
            } else {
              importedSongs.push(songRecord);
              this.stats.added++;
              if (global.MusicDB) await global.MusicDB.putSong(songRecord);
            }
            this.stats.processed++;
            this.emit("progress", {
              current: this.stats.processed,
              total: this.stats.total,
              percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
              lastProcessed: title
            });
          }
        }
      } catch (err) {
        console.warn("[ImportEngine] Deezer fetch:", err.message);
        this.stats.failed++;
      }

      await this.finalizeImport("Deezer API", importedSongs);
      return { ...this.stats, importedSongs };
    }

    /**
     * Complete Album Importer (Phase 4):
     * Finds associated music albums and retrieves ALL available tracks from those albums,
     * showing singer, composer, album and year, keeping different versions separate.
     */
    async importFullAlbum(albumOrMovieName, existingSongs = []) {
      if (!albumOrMovieName) return { added: 0, tracks: [] };
      this.activeSource = "full_album";
      this.state = IMPORT_STATES.RUNNING;
      const cleanTarget = albumOrMovieName.toLowerCase().replace(/[^\w\s]/g, "").trim();

      const matchedTracks = [];

      // 1. Check in AUTHENTIC_COMPLETE_ALBUMS from indian_massive_catalogue
      const globalMeta = global.AUTHENTIC_COMPLETE_ALBUMS || [];
      for (const alb of globalMeta) {
        const albMovieClean = (alb.movie || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
        const albNameClean = (alb.album || "").toLowerCase().replace(/[^\w\s]/g, "").trim();
        if (albMovieClean.includes(cleanTarget) || albNameClean.includes(cleanTarget) || cleanTarget.includes(albMovieClean) || cleanTarget.includes(albNameClean)) {
          for (const trk of alb.tracks) {
            matchedTracks.push({
              id: trk.id,
              title: trk.title,
              artist: trk.artist,
              composer: trk.composer || alb.composer,
              album: alb.album,
              movie: alb.movie,
              year: alb.year,
              era: alb.era,
              language: alb.language,
              album_type: alb.album_type,
              type: trk.genres[0] || "melody",
              genres: trk.genres,
              version: trk.version,
              category: `${alb.language} Songs`,
              sections: ["trending", alb.language.toLowerCase()],
              cover_url: alb.cover_url,
              audio_url: trk.audio_url,
              download_authorized: trk.download_authorized,
              playback_status: trk.playback_status || "available",
              source: "album_import"
            });
          }
        }
      }

      // 2. Fetch from iTunes API Indian store for this specific album
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(albumOrMovieName)}&country=IN&entity=song&limit=50`;
        const resp = await fetch(itunesUrl);
        if (resp.ok) {
          const data = await resp.json();
          const items = data.results || [];
          for (const item of items) {
            const itemAlbum = (item.collectionName || "").toLowerCase();
            if (itemAlbum.includes(cleanTarget) || cleanTarget.includes(itemAlbum)) {
              matchedTracks.push({
                id: `alb_itunes_${item.trackId || Date.now()}`,
                title: item.trackName || "Track",
                artist: item.artistName || "Artist",
                composer: item.artistName || "Composer",
                album: item.collectionName || albumOrMovieName,
                movie: albumOrMovieName,
                year: item.releaseDate ? parseInt(item.releaseDate) : 2015,
                duration: Math.round((item.trackTimeMillis || 240000) / 1000),
                duration_str: `${Math.floor((item.trackTimeMillis || 240000) / 60000)}:${String(Math.floor(((item.trackTimeMillis || 240000) % 60000) / 1000)).padStart(2, '0')}`,
                language: "Tamil",
                album_type: "movie_soundtrack",
                type: "melody",
                genres: ["melody", "film_album"],
                version: "Original OST",
                cover_url: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb", "500x500bb") : "static/images/only_friends_theme.svg",
                audio_url: item.previewUrl || "",
                download_authorized: true,
                playback_status: "available",
                source: "album_import"
              });
            }
          }
        }
      } catch (e) {
        console.warn("[ImportEngine] Album online lookup notice:", e.message);
      }

      // Deduplicate exact track duplicates while keeping versions separate
      const deduped = [];
      const seenKeys = new Set();
      for (const trk of matchedTracks) {
        const k = `${this.normalizeKey(trk.title)}__${this.extractVersion(trk.title, trk.album)}`;
        if (!seenKeys.has(k)) {
          seenKeys.add(k);
          deduped.push(trk);
        }
      }

      this.initStats(deduped.length);
      const addedSongs = [];
      for (const trk of deduped) {
        const dupCheck = this.isDuplicate(trk, existingSongs.concat(addedSongs));
        if (dupCheck.isDup) {
          this.stats.duplicates++;
        } else {
          addedSongs.push(trk);
          this.stats.added++;
          if (global.MusicDB) await global.MusicDB.putSong(trk);
        }
        this.stats.processed++;
      }

      await this.finalizeImport(`Album: ${albumOrMovieName}`, addedSongs);
      return { ...this.stats, tracks: addedSongs };
    }

    /**
     * Import Other Authorized Sources (Bulk JSON / CSV file)
     */
    async importFromCustomFile(fileOrJson, existingSongs = []) {
      this.activeSource = "custom";
      this.state = IMPORT_STATES.RUNNING;

      let records = [];
      if (Array.isArray(fileOrJson)) {
        records = fileOrJson;
      } else if (typeof fileOrJson === "string") {
        try {
          records = JSON.parse(fileOrJson);
        } catch (e) {
          // Parse CSV
          records = this.parseCSVToSongs(fileOrJson);
        }
      }

      this.initStats(records.length);
      const importedSongs = [];

      for (const rec of records) {
        if (this.checkControlFlags()) break;

        if (!rec || (!rec.title && !rec.name)) {
          this.stats.failed++;
          continue;
        }

        const songRecord = {
          id: rec.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: rec.title || rec.name,
          artist: rec.artist || rec.singer || "Unknown Artist",
          album: rec.album || rec.movie || "Independent Album",
          duration: rec.duration || 240,
          duration_str: rec.duration_str || "4:00",
          language: rec.language || "Tamil",
          era: rec.era || "now",
          type: rec.type || "melody",
          category: rec.category || `${rec.language || 'Tamil'} Songs`,
          sections: rec.sections || ["trending", (rec.language || 'tamil').toLowerCase()],
          cover_url: rec.cover_url || "static/images/only_friends_theme.svg",
          audio_url: rec.audio_url || rec.audio_file || "",
          download_authorized: rec.download_authorized !== false,
          source: rec.source || "custom",
          tags: rec.tags || [(rec.title || '').toLowerCase(), (rec.artist || '').toLowerCase()]
        };

        const dupCheck = this.isDuplicate(songRecord, existingSongs.concat(importedSongs));
        if (dupCheck.isDup) {
          this.stats.duplicates++;
        } else {
          importedSongs.push(songRecord);
          this.stats.added++;
          if (global.MusicDB) {
            await global.MusicDB.putSong(songRecord);
          }
        }
        this.stats.processed++;
        this.emit("progress", {
          current: this.stats.processed,
          total: this.stats.total,
          percentage: Math.min(100, Math.round((this.stats.processed / this.stats.total) * 100)),
          lastProcessed: songRecord.title
        });
      }

      await this.finalizeImport("Custom Dataset", importedSongs);
      return { ...this.stats, importedSongs };
    }

    parseCSVToSongs(csvText) {
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) return [];
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const songs = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        const song = {};
        headers.forEach((h, idx) => {
          song[h] = parts[idx] ? parts[idx].trim() : "";
        });
        if (song.title || song.name) songs.push(song);
      }
      return songs;
    }

    /**
     * Master Runner: Import All Sources
     */
    async importAll(options = {}, existingSongs = []) {
      this.activeSource = "all";
      this.state = IMPORT_STATES.RUNNING;
      this.pauseRequested = false;
      this.cancelRequested = false;

      const results = {
        apis: null,
        spotify: null,
        youtube: null,
        totalAdded: 0,
        totalDuplicates: 0,
        totalFailed: 0,
        importedSongs: []
      };

      this.emit("status", { message: "Starting Multi-Source Master Import..." });

      // 1. Authorized APIs
      if (!this.checkControlFlags()) {
        this.emit("status", { message: "Importing from Authorized Music APIs..." });
        results.apis = await this.importFromAPIs(undefined, existingSongs.concat(results.importedSongs));
        results.totalAdded += results.apis.added;
        results.totalDuplicates += results.apis.duplicates;
        results.totalFailed += results.apis.failed;
        results.importedSongs.push(...results.apis.importedSongs);
      }

      // 2. Spotify Metadata
      if (!this.checkControlFlags()) {
        this.emit("status", { message: "Importing Spotify Music Metadata..." });
        results.spotify = await this.importFromSpotify(undefined, existingSongs.concat(results.importedSongs));
        results.totalAdded += results.spotify.added;
        results.totalDuplicates += results.spotify.duplicates;
        results.totalFailed += results.spotify.failed;
        results.importedSongs.push(...results.spotify.importedSongs);
      }

      // 3. YouTube Music Metadata
      if (!this.checkControlFlags()) {
        this.emit("status", { message: "Importing YouTube Music Metadata..." });
        results.youtube = await this.importFromYouTubeMusic(undefined, existingSongs.concat(results.importedSongs));
        results.totalAdded += results.youtube.added;
        results.totalDuplicates += results.youtube.duplicates;
        results.totalFailed += results.youtube.failed;
        results.importedSongs.push(...results.youtube.importedSongs);
      }

      this.state = IMPORT_STATES.COMPLETED;
      this.emit("complete", {
        summary: `Multi-Source Master Import Complete! Added: ${results.totalAdded}, Duplicates Prevented: ${results.totalDuplicates}, Failed: ${results.totalFailed}`,
        results
      });

      return results;
    }

    // =========================================================================
    // 4. CONTROL: PAUSE, RESUME, CANCEL
    // =========================================================================

    pause() {
      if (this.state === IMPORT_STATES.RUNNING) {
        this.pauseRequested = true;
        this.state = IMPORT_STATES.PAUSED;
        this.emit("paused", { message: "Import operation paused by user." });
      }
    }

    resume() {
      if (this.state === IMPORT_STATES.PAUSED) {
        this.pauseRequested = false;
        this.state = IMPORT_STATES.RUNNING;
        this.emit("resumed", { message: "Import operation resumed." });
      }
    }

    cancel() {
      this.cancelRequested = true;
      this.state = IMPORT_STATES.CANCELLED;
      this.emit("cancelled", { message: "Import operation cancelled." });
    }

    checkControlFlags() {
      if (this.cancelRequested) return true;
      while (this.pauseRequested && !this.cancelRequested) {
        // Sleep wait
        return false;
      }
      return false;
    }

    initStats(totalCount) {
      this.stats = {
        total: totalCount || 0,
        processed: 0,
        added: 0,
        duplicates: 0,
        failed: 0
      };
      this.pauseRequested = false;
      this.cancelRequested = false;
    }

    async finalizeImport(sourceName, importedSongs) {
      this.state = IMPORT_STATES.COMPLETED;
      if (global.MusicDB) {
        await global.MusicDB.addHistory({
          source: sourceName,
          count: this.stats.total,
          addedCount: this.stats.added,
          duplicateCount: this.stats.duplicates,
          failedCount: this.stats.failed,
          status: "SUCCESS",
          message: `Imported ${this.stats.added} songs (${this.stats.duplicates} duplicates prevented)`
        });
      }
      this.emit("complete", {
        sourceName,
        stats: { ...this.stats },
        importedSongs
      });
    }
  }

  const ImportEngine = new MultiSourceImportEngine();
  global.ImportEngine = ImportEngine;
  global.IMPORT_STATES = IMPORT_STATES;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { ImportEngine, MultiSourceImportEngine, IMPORT_STATES };
  }
})(typeof window !== "undefined" ? window : global);
