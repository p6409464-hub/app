/**
 * Pranesh Music Hub - IndexedDB Database & Persistent Storage Module
 * Database: PraneshMusicHubDB (v1)
 * Object Stores:
 *   - songs: Persistent metadata for all imported tracks (Phone, PC, APIs, Spotify, YT)
 *   - local_audio: Binary audio Blobs for phone & PC uploads (retained across page reloads!)
 *   - import_history: Audit log of past import sessions
 *   - import_queue: Checkpoints for resuming interrupted / paused imports
 *   - duplicates_log: Audit log of detected and skipped duplicate records
 *   - failed_imports: Log of failed tracks with retry capability
 */

(function(global) {
  "use strict";

  const DB_NAME = "PraneshMusicHubDB";
  const DB_VERSION = 1;

  // In-memory fallback for environments without IndexedDB (e.g. Node.js unit tests)
  const MemoryStore = {
    songs: new Map(),
    local_audio: new Map(),
    import_history: [],
    import_queue: new Map(),
    duplicates_log: [],
    failed_imports: []
  };

  class MusicDBManager {
    constructor() {
      this.db = null;
      this.isIndexedDBAvailable = typeof indexedDB !== "undefined";
      this._initPromise = null;
    }

    async init() {
      if (this._initPromise) return this._initPromise;
      this._initPromise = new Promise((resolve) => {
        if (!this.isIndexedDBAvailable) {
          console.info("[MusicDB] IndexedDB not supported; utilizing High-Speed In-Memory Store.");
          return resolve(false);
        }

        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // 1. Songs Store
            if (!db.objectStoreNames.contains("songs")) {
              const songStore = db.createObjectStore("songs", { keyPath: "id" });
              songStore.createIndex("title", "title", { unique: false });
              songStore.createIndex("artist", "artist", { unique: false });
              songStore.createIndex("album", "album", { unique: false });
              songStore.createIndex("language", "language", { unique: false });
              songStore.createIndex("type", "type", { unique: false });
              songStore.createIndex("era", "era", { unique: false });
              songStore.createIndex("source", "source", { unique: false });
              songStore.createIndex("isrc", "isrc", { unique: false });
            }

            // 2. Local Audio Binary Blob Store
            if (!db.objectStoreNames.contains("local_audio")) {
              db.createObjectStore("local_audio", { keyPath: "id" });
            }

            // 3. Import History
            if (!db.objectStoreNames.contains("import_history")) {
              db.createObjectStore("import_history", { keyPath: "id", autoIncrement: true });
            }

            // 4. Import Queue (Pause/Resume Checkpoints)
            if (!db.objectStoreNames.contains("import_queue")) {
              db.createObjectStore("import_queue", { keyPath: "id" });
            }

            // 5. Duplicates Log
            if (!db.objectStoreNames.contains("duplicates_log")) {
              db.createObjectStore("duplicates_log", { keyPath: "id", autoIncrement: true });
            }

            // 6. Failed Imports Log
            if (!db.objectStoreNames.contains("failed_imports")) {
              db.createObjectStore("failed_imports", { keyPath: "id", autoIncrement: true });
            }
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log("[MusicDB] PraneshMusicHubDB v1 connected successfully.");
            resolve(true);
          };

          request.onerror = (err) => {
            console.warn("[MusicDB] IndexedDB open error, falling back to memory:", err);
            this.isIndexedDBAvailable = false;
            resolve(false);
          };
        } catch (e) {
          console.warn("[MusicDB] IndexedDB exception:", e);
          this.isIndexedDBAvailable = false;
          resolve(false);
        }
      });
      return this._initPromise;
    }

    // =========================================================================
    // Songs Object Store Methods
    // =========================================================================

    async getAllSongs() {
      await this.init();
      if (!this.db) {
        return Array.from(MemoryStore.songs.values());
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("songs", "readonly");
          const store = tx.objectStore("songs");
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async getSong(id) {
      await this.init();
      if (!this.db) {
        return MemoryStore.songs.get(id) || null;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("songs", "readonly");
          const store = tx.objectStore("songs");
          const req = store.get(id);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async putSong(song) {
      if (!song || !song.id) return false;
      await this.init();
      if (!this.db) {
        MemoryStore.songs.set(song.id, song);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("songs", "readwrite");
          const store = tx.objectStore("songs");
          const req = store.put(song);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async putSongsBatch(songsArray) {
      if (!Array.isArray(songsArray) || songsArray.length === 0) return 0;
      await this.init();
      if (!this.db) {
        songsArray.forEach(s => {
          if (s && s.id) MemoryStore.songs.set(s.id, s);
        });
        return songsArray.length;
      }

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("songs", "readwrite");
          const store = tx.objectStore("songs");
          let count = 0;
          for (const s of songsArray) {
            if (s && s.id) {
              store.put(s);
              count++;
            }
          }
          tx.oncomplete = () => resolve(count);
          tx.onerror = () => resolve(0);
        } catch (_) {
          resolve(0);
        }
      });
    }

    async countSongs() {
      await this.init();
      if (!this.db) return MemoryStore.songs.size;
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("songs", "readonly");
          const req = tx.objectStore("songs").count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => resolve(0);
        } catch (_) {
          resolve(0);
        }
      });
    }

    async deleteSong(id) {
      await this.init();
      if (!this.db) {
        MemoryStore.songs.delete(id);
        MemoryStore.local_audio.delete(id);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(["songs", "local_audio"], "readwrite");
          tx.objectStore("songs").delete(id);
          tx.objectStore("local_audio").delete(id);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    // =========================================================================
    // Local Audio Binary Blob Store Methods (Phone & PC Offline Persistence)
    // =========================================================================

    async putAudioBlob(songId, blob, meta = {}) {
      if (!songId || !blob) return false;
      await this.init();
      const record = {
        id: songId,
        blob: blob,
        mimeType: blob.type || meta.mimeType || "audio/mpeg",
        filename: meta.filename || `${songId}.mp3`,
        size: blob.size || 0,
        updatedAt: Date.now()
      };

      if (!this.db) {
        MemoryStore.local_audio.set(songId, record);
        return true;
      }

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("local_audio", "readwrite");
          const store = tx.objectStore("local_audio");
          const req = store.put(record);
          req.onsuccess = () => resolve(true);
          req.onerror = (e) => {
            console.warn("[MusicDB] putAudioBlob failed:", e);
            resolve(false);
          };
        } catch (err) {
          console.warn("[MusicDB] putAudioBlob err:", err);
          resolve(false);
        }
      });
    }

    async getAudioBlob(songId) {
      if (!songId) return null;
      await this.init();
      if (!this.db) {
        const item = MemoryStore.local_audio.get(songId);
        return item ? item.blob : null;
      }

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("local_audio", "readonly");
          const req = tx.objectStore("local_audio").get(songId);
          req.onsuccess = () => {
            if (req.result && req.result.blob) {
              resolve(req.result.blob);
            } else {
              resolve(null);
            }
          };
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async countLocalAudios() {
      await this.init();
      if (!this.db) return MemoryStore.local_audio.size;
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("local_audio", "readonly");
          const req = tx.objectStore("local_audio").count();
          req.onsuccess = () => resolve(req.result || 0);
          req.onerror = () => resolve(0);
        } catch (_) {
          resolve(0);
        }
      });
    }

    // =========================================================================
    // Import History Methods
    // =========================================================================

    async addHistory(record) {
      await this.init();
      const entry = {
        ...record,
        timestamp: record.timestamp || Date.now(),
        dateStr: new Date().toLocaleString()
      };
      if (!this.db) {
        MemoryStore.import_history.unshift(entry);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("import_history", "readwrite");
          tx.objectStore("import_history").add(entry);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getHistory(limit = 50) {
      await this.init();
      if (!this.db) {
        return MemoryStore.import_history.slice(0, limit);
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("import_history", "readonly");
          const req = tx.objectStore("import_history").getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            resolve(list.slice(0, limit));
          };
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    // =========================================================================
    // Duplicates & Failed Records Methods
    // =========================================================================

    async logDuplicate(duplicateRecord) {
      await this.init();
      const entry = {
        ...duplicateRecord,
        timestamp: Date.now()
      };
      if (!this.db) {
        MemoryStore.duplicates_log.unshift(entry);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("duplicates_log", "readwrite");
          tx.objectStore("duplicates_log").add(entry);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getDuplicates(limit = 100) {
      await this.init();
      if (!this.db) return MemoryStore.duplicates_log.slice(0, limit);
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("duplicates_log", "readonly");
          const req = tx.objectStore("duplicates_log").getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            resolve(list.slice(0, limit));
          };
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async clearDuplicates() {
      await this.init();
      if (!this.db) {
        MemoryStore.duplicates_log = [];
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("duplicates_log", "readwrite");
          tx.objectStore("duplicates_log").clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async logFailed(failedRecord) {
      await this.init();
      const entry = {
        ...failedRecord,
        timestamp: Date.now()
      };
      if (!this.db) {
        MemoryStore.failed_imports.unshift(entry);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("failed_imports", "readwrite");
          tx.objectStore("failed_imports").add(entry);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getFailed() {
      await this.init();
      if (!this.db) return [...MemoryStore.failed_imports];
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("failed_imports", "readonly");
          const req = tx.objectStore("failed_imports").getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        } catch (_) {
          resolve([]);
        }
      });
    }

    async clearFailed() {
      await this.init();
      if (!this.db) {
        MemoryStore.failed_imports = [];
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("failed_imports", "readwrite");
          tx.objectStore("failed_imports").clear();
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    // =========================================================================
    // Import Queue & Checkpoints (Pause / Resume Support)
    // =========================================================================

    async saveQueueCheckpoint(queueId, queueData) {
      await this.init();
      const record = { id: queueId, data: queueData, updatedAt: Date.now() };
      if (!this.db) {
        MemoryStore.import_queue.set(queueId, record);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("import_queue", "readwrite");
          tx.objectStore("import_queue").put(record);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }

    async getQueueCheckpoint(queueId) {
      await this.init();
      if (!this.db) {
        const item = MemoryStore.import_queue.get(queueId);
        return item ? item.data : null;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("import_queue", "readonly");
          const req = tx.objectStore("import_queue").get(queueId);
          req.onsuccess = () => resolve(req.result ? req.result.data : null);
          req.onerror = () => resolve(null);
        } catch (_) {
          resolve(null);
        }
      });
    }

    async removeQueueCheckpoint(queueId) {
      await this.init();
      if (!this.db) {
        MemoryStore.import_queue.delete(queueId);
        return true;
      }
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction("import_queue", "readwrite");
          tx.objectStore("import_queue").delete(queueId);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (_) {
          resolve(false);
        }
      });
    }
  }

  // Export singleton instance
  const MusicDB = new MusicDBManager();
  global.MusicDB = MusicDB;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { MusicDB, MusicDBManager };
  }
})(typeof window !== "undefined" ? window : global);
