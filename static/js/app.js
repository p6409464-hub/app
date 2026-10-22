/**
 * Pranesh Music Hub - Main Application Script
 * Features:
 * - Direct in-page HTML5 audio streaming with seekable progress bar
 * - Real direct MP3 file downloads with byte progress tracking & toast feedback
 * - Universal search & multi-language filtering (Tamil, English, Malayalam, Instrumental, Only Friends OST)
 * - Persistent Favourites & Recently Played history (localStorage)
 * - Source Inspection verification tool for 'Only Friends MP3'
 */

// Application State
const AppState = {
  songs: [],
  currentSongIndex: -1,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  volume: 0.85,
  isMuted: false,
  activeLanguage: "all",
  activeSection: "all",
  searchQuery: "",
  favourites: JSON.parse(localStorage.getItem("pranesh_hub_favs") || "[]"),
  history: JSON.parse(localStorage.getItem("pranesh_hub_history") || "[]"),
  queue: []
};

// Global HTML5 Audio Element
const audioPlayer = new Audio();
audioPlayer.preload = "metadata";

// DOM Elements
const DOM = {
  // Search
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  
  // Navigation Pills & Chips
  langChips: document.querySelectorAll(".lang-chip"),
  sectionPills: document.querySelectorAll(".section-pill"),
  
  // Sections Container
  contentContainer: document.getElementById("contentContainer"),
  emptyState: document.getElementById("emptyState"),
  emptySearchQuery: document.getElementById("emptySearchQuery"),
  resetSearchBtn: document.getElementById("resetSearchBtn"),
  
  // Player Bar
  playerBar: document.getElementById("playerBar"),
  playerThumb: document.getElementById("playerThumb"),
  playerTitle: document.getElementById("playerTitle"),
  playerArtist: document.getElementById("playerArtist"),
  playerFavBtn: document.getElementById("playerFavBtn"),
  playerDownloadBtn: document.getElementById("playerDownloadBtn"),
  
  // Controls
  playPauseBtn: document.getElementById("playPauseBtn"),
  playPauseIcon: document.getElementById("playPauseIcon"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  repeatBtn: document.getElementById("repeatBtn"),
  
  // Seekbar
  currentTimeEl: document.getElementById("currentTime"),
  durationTimeEl: document.getElementById("durationTime"),
  seekbar: document.getElementById("seekbar"),
  
  // Volume
  volumeBtn: document.getElementById("volumeBtn"),
  volumeIcon: document.getElementById("volumeIcon"),
  volumeSlider: document.getElementById("volumeSlider"),
  
  // Inspection Modal
  inspectionModal: document.getElementById("inspectionModal"),
  openInspectionBtn: document.getElementById("openInspectionBtn"),
  closeInspectionBtn: document.getElementById("closeInspectionBtn"),
  inspectionContent: document.getElementById("inspectionContent"),
  
  // Toasts
  toastContainer: document.getElementById("toastContainer")
};

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadCatalogue();
});

// Setup All UI Event Listeners
function setupEventListeners() {
  // Search Bar
  DOM.searchInput.addEventListener("input", (e) => {
    AppState.searchQuery = e.target.value.trim().toLowerCase();
    DOM.clearSearchBtn.style.display = AppState.searchQuery ? "block" : "none";
    renderContent();
  });

  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    AppState.searchQuery = "";
    DOM.clearSearchBtn.style.display = "none";
    renderContent();
  });

  DOM.resetSearchBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    AppState.searchQuery = "";
    DOM.clearSearchBtn.style.display = "none";
    AppState.activeLanguage = "all";
    AppState.activeSection = "all";
    updateActivePills();
    renderContent();
  });

  // Language Chips
  DOM.langChips.forEach(chip => {
    chip.addEventListener("click", () => {
      DOM.langChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      AppState.activeLanguage = chip.dataset.lang;
      renderContent();
    });
  });

  // Section Navigation Pills
  DOM.sectionPills.forEach(pill => {
    pill.addEventListener("click", () => {
      DOM.sectionPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      AppState.activeSection = pill.dataset.section;
      renderContent();
    });
  });

  // Audio Player Event Listeners
  audioPlayer.addEventListener("timeupdate", updateSeekbar);
  audioPlayer.addEventListener("loadedmetadata", () => {
    DOM.durationTimeEl.textContent = formatTime(audioPlayer.duration || 0);
  });
  audioPlayer.addEventListener("ended", handleTrackEnded);
  audioPlayer.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    showToast("Error playing audio stream. Please try another track.", "error");
  });

  // Seekbar Control
  DOM.seekbar.addEventListener("input", (e) => {
    if (audioPlayer.duration) {
      const seekTo = (e.target.value / 100) * audioPlayer.duration;
      audioPlayer.currentTime = seekTo;
    }
  });

  // Playback Buttons
  DOM.playPauseBtn.addEventListener("click", togglePlayPause);
  DOM.prevBtn.addEventListener("click", playPreviousSong);
  DOM.nextBtn.addEventListener("click", playNextSong);
  
  DOM.shuffleBtn.addEventListener("click", () => {
    AppState.isShuffle = !AppState.isShuffle;
    DOM.shuffleBtn.classList.toggle("active", AppState.isShuffle);
    showToast(AppState.isShuffle ? "Shuffle Mode Enabled" : "Shuffle Mode Disabled");
  });

  DOM.repeatBtn.addEventListener("click", () => {
    AppState.isRepeat = !AppState.isRepeat;
    DOM.repeatBtn.classList.toggle("active", AppState.isRepeat);
    showToast(AppState.isRepeat ? "Repeat Track Enabled" : "Repeat Track Disabled");
  });

  // Volume Control
  DOM.volumeSlider.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    AppState.volume = val;
    audioPlayer.volume = val;
    AppState.isMuted = val === 0;
    updateVolumeIcon();
  });

  DOM.volumeBtn.addEventListener("click", () => {
    if (AppState.isMuted) {
      audioPlayer.volume = AppState.volume || 0.85;
      DOM.volumeSlider.value = AppState.volume || 0.85;
      AppState.isMuted = false;
    } else {
      audioPlayer.volume = 0;
      DOM.volumeSlider.value = 0;
      AppState.isMuted = true;
    }
    updateVolumeIcon();
  });

  // Player Bar Actions
  DOM.playerFavBtn.addEventListener("click", () => {
    if (AppState.currentSongIndex >= 0) {
      const current = AppState.queue[AppState.currentSongIndex];
      toggleFavourite(current.id);
    }
  });

  DOM.playerDownloadBtn.addEventListener("click", () => {
    if (AppState.currentSongIndex >= 0) {
      const current = AppState.queue[AppState.currentSongIndex];
      startDirectDownload(current);
    }
  });

  // Source Inspection Modal
  DOM.openInspectionBtn.addEventListener("click", runSourceInspection);
  DOM.closeInspectionBtn.addEventListener("click", () => {
    DOM.inspectionModal.classList.remove("active");
  });
  DOM.inspectionModal.addEventListener("click", (e) => {
    if (e.target === DOM.inspectionModal) {
      DOM.inspectionModal.classList.remove("active");
    }
  });

  // Hero Play Button
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  if (heroPlayBtn) {
    heroPlayBtn.addEventListener("click", () => {
      if (AppState.songs.length > 0) {
        playSong(AppState.songs[0]);
      }
    });
  }

  // Keyboard Shortcuts (Space to play/pause)
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    }
  });
}

// ==========================================================================
// Data Fetching & Content Rendering
// ==========================================================================
async function loadCatalogue() {
  try {
    const res = await fetch("/api/songs");
    const data = await res.json();
    if (data.status === "success") {
      AppState.songs = data.songs;
      AppState.queue = [...AppState.songs];
      renderContent();
    } else {
      showToast("Failed to load songs catalogue.", "error");
    }
  } catch (err) {
    console.error("Error loading catalogue:", err);
    showToast("Error connecting to server catalogue.", "error");
  }
}

function updateActivePills() {
  DOM.langChips.forEach(c => {
    c.classList.toggle("active", c.dataset.lang === AppState.activeLanguage);
  });
  DOM.sectionPills.forEach(p => {
    p.classList.toggle("active", p.dataset.section === AppState.activeSection);
  });
}

function renderContent() {
  let filtered = [...AppState.songs];

  // 1. Language Filter
  if (AppState.activeLanguage !== "all") {
    if (AppState.activeLanguage === "only_friends") {
      filtered = filtered.filter(s => s.category === "Only Friends OST");
    } else {
      filtered = filtered.filter(s => s.language.toLowerCase() === AppState.activeLanguage);
    }
  }

  // 2. Section Navigation Filter
  if (AppState.activeSection === "trending") {
    filtered = filtered.filter(s => (s.sections || []).includes("trending"));
  } else if (AppState.activeSection === "recent") {
    filtered = filtered.filter(s => (s.sections || []).includes("recent"));
  } else if (AppState.activeSection === "favourites") {
    filtered = filtered.filter(s => AppState.favourites.includes(s.id));
  } else if (AppState.activeSection === "history") {
    const histIds = AppState.history;
    filtered = histIds
      .map(id => AppState.songs.find(s => s.id === id))
      .filter(Boolean);
  }

  // 3. Search Query Filter
  if (AppState.searchQuery) {
    const q = AppState.searchQuery;
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      (s.tags && s.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // If no matching songs
  if (filtered.length === 0) {
    DOM.contentContainer.innerHTML = "";
    DOM.emptyState.style.display = "block";
    DOM.emptySearchQuery.textContent = AppState.searchQuery 
      ? `"${AppState.searchQuery}"` 
      : (AppState.activeSection === "favourites" ? "No favourites added yet" : "No songs found for this selection");
    return;
  }

  DOM.emptyState.style.display = "none";

  // When searching or viewing Favourites / History / Single Section: render single unified grid
  if (AppState.searchQuery || AppState.activeSection !== "all" || AppState.activeLanguage !== "all") {
    let headerTitle = "Search Results";
    let headerIcon = "🔍";

    if (AppState.activeSection === "favourites") {
      headerTitle = "My Favourite Songs";
      headerIcon = "❤️";
    } else if (AppState.activeSection === "history") {
      headerTitle = "Recently Played History";
      headerIcon = "🕒";
    } else if (AppState.activeSection === "trending") {
      headerTitle = "🔥 Trending Songs";
      headerIcon = "🔥";
    } else if (AppState.activeSection === "recent") {
      headerTitle = "🆕 Recently Added Songs";
      headerIcon = "🆕";
    } else if (AppState.activeLanguage !== "all") {
      headerTitle = `${capitalize(AppState.activeLanguage)} Music Collection`;
      headerIcon = "🎵";
    }

    DOM.contentContainer.innerHTML = `
      <section class="music-section">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-icon">${headerIcon}</span>
            <h2 class="section-title">${headerTitle}</h2>
            <span class="section-badge">${filtered.length} tracks</span>
          </div>
        </div>
        <div class="songs-grid">
          ${filtered.map(s => createSongCardHTML(s)).join("")}
        </div>
      </section>
    `;
    attachCardListeners();
    return;
  }

  // Default Home Page View: All Ordered Categorized Sections
  const sectionsDef = [
    { id: "trending", title: "🔥 Trending Songs", icon: "🔥", filter: s => (s.sections || []).includes("trending") },
    { id: "recent", title: "🆕 Recently Added", icon: "🆕", filter: s => (s.sections || []).includes("recent") },
    { id: "only_friends", title: "🎬 Only Friends OST & Themes", icon: "🎬", filter: s => s.category === "Only Friends OST" },
    { id: "tamil", title: "🌺 Tamil Songs", icon: "🌺", filter: s => s.language === "Tamil" },
    { id: "english", title: "🎸 English Songs", icon: "🎸", filter: s => s.language === "English" },
    { id: "malayalam", title: "🌴 Malayalam Songs", icon: "🌴", filter: s => s.language === "Malayalam" },
    { id: "instrumental", title: "🎹 Instrumental Music", icon: "🎹", filter: s => s.category === "Instrumental Music" },
  ];

  let fullHTML = "";
  sectionsDef.forEach(sec => {
    const secSongs = filtered.filter(sec.filter);
    if (secSongs.length > 0) {
      fullHTML += `
        <section class="music-section">
          <div class="section-header">
            <div class="section-title-wrap">
              <span class="section-icon">${sec.icon}</span>
              <h2 class="section-title">${sec.title}</h2>
              <span class="section-badge">${secSongs.length} tracks</span>
            </div>
          </div>
          <div class="songs-grid">
            ${secSongs.map(s => createSongCardHTML(s)).join("")}
          </div>
        </section>
      `;
    }
  });

  DOM.contentContainer.innerHTML = fullHTML;
  attachCardListeners();
}

// Generate HTML for a single song card
function createSongCardHTML(song) {
  const isPlayingNow = AppState.currentSongIndex >= 0 && 
    AppState.queue[AppState.currentSongIndex]?.id === song.id && 
    AppState.isPlaying;
  const isFav = AppState.favourites.includes(song.id);

  return `
    <div class="song-card ${isPlayingNow ? 'now-playing' : ''}" data-id="${song.id}">
      <div class="card-thumb-wrap">
        <img class="card-thumb-img" src="${song.cover_url}" alt="${escapeHTML(song.title)}" loading="lazy" />
        <span class="card-category-tag">${escapeHTML(song.language)}</span>
        <span class="card-duration-badge">${song.duration_str}</span>
        <div class="play-overlay">
          <button class="play-circle-btn card-play-trigger" data-id="${song.id}" title="Play in Hub">
            ${isPlayingNow ? '⏸' : '▶'}
          </button>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title" title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</h3>
        <p class="card-artist" title="${escapeHTML(song.artist)}">${escapeHTML(song.artist)}</p>
      </div>
      <div class="card-actions">
        <button class="fav-btn ${isFav ? 'favorited' : ''}" data-id="${song.id}" title="Add to Favourites">
          ${isFav ? '❤️' : '🤍'}
        </button>
        
        <div class="card-action-right">
          ${song.download_authorized 
            ? `<button class="download-btn card-download-trigger" data-id="${song.id}" title="Direct MP3 Download">
                 <span>⬇️</span> Download
               </button>`
            : `<a class="official-link-btn" href="${song.official_listening_url}" target="_blank" rel="noopener noreferrer" title="Official Stream Link">
                 <span>🔗</span> Official
               </a>`
          }
        </div>
      </div>
    </div>
  `;
}

// Attach event listeners to newly generated song cards
function attachCardListeners() {
  // Play Triggers
  document.querySelectorAll(".card-play-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const song = AppState.songs.find(s => s.id === songId);
      if (song) playSong(song);
    });
  });

  // Card click (whole card can trigger play)
  document.querySelectorAll(".song-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      const songId = card.dataset.id;
      const song = AppState.songs.find(s => s.id === songId);
      if (song) playSong(song);
    });
  });

  // Favorite Triggers
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      toggleFavourite(songId);
    });
  });

  // Direct Download Triggers
  document.querySelectorAll(".card-download-trigger").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const songId = btn.dataset.id;
      const song = AppState.songs.find(s => s.id === songId);
      if (song) startDirectDownload(song, btn);
    });
  });
}

// ==========================================================================
// In-Page HTML5 Music Player Engine
// ==========================================================================
function playSong(song) {
  // Update Queue and Index
  let idx = AppState.queue.findIndex(s => s.id === song.id);
  if (idx === -1) {
    AppState.queue.push(song);
    idx = AppState.queue.length - 1;
  }
  AppState.currentSongIndex = idx;

  // Add to History
  AppState.history = [song.id, ...AppState.history.filter(id => id !== song.id)].slice(0, 30);
  localStorage.setItem("pranesh_hub_history", JSON.stringify(AppState.history));

  // Update Audio Source and Play
  audioPlayer.src = `/api/stream/${song.id}`;
  audioPlayer.play().then(() => {
    AppState.isPlaying = true;
    updatePlayerBarUI(song);
    renderContent();
  }).catch(err => {
    console.error("Playback failed:", err);
    showToast("Unable to stream track. Try another track.", "error");
  });
}

function togglePlayPause() {
  if (AppState.currentSongIndex === -1 && AppState.songs.length > 0) {
    playSong(AppState.songs[0]);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().then(() => {
      AppState.isPlaying = true;
      DOM.playPauseIcon.textContent = "⏸";
      renderContent();
    }).catch(err => {
      console.error("Playback resume failed:", err);
    });
  } else {
    audioPlayer.pause();
    AppState.isPlaying = false;
    DOM.playPauseIcon.textContent = "▶";
    renderContent();
  }
}

function playNextSong() {
  if (AppState.queue.length === 0) return;
  if (AppState.isShuffle) {
    const nextIdx = Math.floor(Math.random() * AppState.queue.length);
    playSong(AppState.queue[nextIdx]);
  } else {
    let nextIdx = AppState.currentSongIndex + 1;
    if (nextIdx >= AppState.queue.length) nextIdx = 0;
    playSong(AppState.queue[nextIdx]);
  }
}

function playPreviousSong() {
  if (AppState.queue.length === 0) return;
  // If track played > 3s, restart track
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }
  let prevIdx = AppState.currentSongIndex - 1;
  if (prevIdx < 0) prevIdx = AppState.queue.length - 1;
  playSong(AppState.queue[prevIdx]);
}

function handleTrackEnded() {
  if (AppState.isRepeat) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  } else {
    playNextSong();
  }
}

function updateSeekbar() {
  if (!audioPlayer.duration || isNaN(audioPlayer.duration)) return;
  const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  DOM.seekbar.value = progressPercent;
  DOM.currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function updateVolumeIcon() {
  if (AppState.isMuted || audioPlayer.volume === 0) {
    DOM.volumeIcon.textContent = "🔇";
  } else if (audioPlayer.volume < 0.5) {
    DOM.volumeIcon.textContent = "🔉";
  } else {
    DOM.volumeIcon.textContent = "🔊";
  }
}

function updatePlayerBarUI(song) {
  DOM.playerBar.style.display = "flex";
  DOM.playerThumb.src = song.cover_url;
  DOM.playerTitle.textContent = song.title;
  DOM.playerArtist.textContent = song.artist;
  DOM.playPauseIcon.textContent = "⏸";

  const isFav = AppState.favourites.includes(song.id);
  DOM.playerFavBtn.textContent = isFav ? "❤️" : "🤍";

  if (song.download_authorized) {
    DOM.playerDownloadBtn.style.display = "block";
    DOM.playerDownloadBtn.title = `Download ${song.title} MP3`;
  } else {
    DOM.playerDownloadBtn.style.display = "none";
  }
}

// ==========================================================================
// Direct High-Speed MP3 Downloader Engine (Progress + No Redirection)
// ==========================================================================
function startDirectDownload(song, triggerBtn = null) {
  if (!song.download_authorized) {
    showToast("This song is restricted by copyright; use official link.", "error");
    return;
  }

  showToast(`Starting download: ${song.title}...`);

  if (triggerBtn) {
    triggerBtn.disabled = true;
    triggerBtn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span> 0%`;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `/api/download/${song.id}`, true);
  xhr.responseType = "blob";

  xhr.onprogress = (event) => {
    if (event.lengthComputable && triggerBtn) {
      const percent = Math.round((event.loaded / event.total) * 100);
      triggerBtn.innerHTML = `<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span> ${percent}%`;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = downloadUrl;
      
      const safeTitle = `${song.title} - ${song.artist}`.replace(/[/\\?%*:|"<>]/g, "");
      a.download = `${safeTitle}.mp3`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      showToast(`✅ "${song.title}.mp3" downloaded successfully!`, "success");
      
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `<span>✓</span> Done`;
        setTimeout(() => {
          triggerBtn.innerHTML = `<span>⬇️</span> Download`;
        }, 3000);
      }
    } else {
      showToast("Download failed. Please try again.", "error");
      if (triggerBtn) {
        triggerBtn.disabled = false;
        triggerBtn.innerHTML = `<span>⬇️</span> Download`;
      }
    }
  };

  xhr.onerror = () => {
    showToast("Network error occurred during download.", "error");
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = `<span>⬇️</span> Download`;
    }
  };

  xhr.send();
}

// ==========================================================================
// Favourites Manager
// ==========================================================================
function toggleFavourite(songId) {
  const idx = AppState.favourites.indexOf(songId);
  const song = AppState.songs.find(s => s.id === songId);
  const title = song ? song.title : "Song";

  if (idx === -1) {
    AppState.favourites.push(songId);
    showToast(`Added "${title}" to Favourites! ❤️`);
  } else {
    AppState.favourites.splice(idx, 1);
    showToast(`Removed "${title}" from Favourites.`);
  }

  localStorage.setItem("pranesh_hub_favs", JSON.stringify(AppState.favourites));
  
  // Update player bar heart if current
  if (AppState.currentSongIndex >= 0 && AppState.queue[AppState.currentSongIndex]?.id === songId) {
    DOM.playerFavBtn.textContent = idx === -1 ? "❤️" : "🤍";
  }

  renderContent();
}

// ==========================================================================
// Source Inspection: Only Friends MP3
// ==========================================================================
async function runSourceInspection() {
  DOM.inspectionModal.classList.add("active");
  DOM.inspectionContent.innerHTML = `
    <div style="text-align:center; padding: 30px;">
      <span class="spinner" style="width:36px; height:36px; border-width:3px;"></span>
      <p style="margin-top:14px; color: var(--text-muted);">Probing requested source: <strong>Only Friends MP3</strong>...</p>
    </div>
  `;

  try {
    const res = await fetch("/api/source-inspection");
    const data = await res.json();

    DOM.inspectionContent.innerHTML = `
      <div class="inspection-badge-status status-warning">
        <span>⚠️</span> Requested Source Inspection: <strong>Only Friends MP3</strong>
      </div>
      
      <p style="color:var(--text-main); font-size: 0.95rem; line-height:1.6; margin-bottom: 14px;">
        ${escapeHTML(data.inspection_summary)}
      </p>

      <h4 style="color:#fff; font-size:0.95rem; margin:16px 0 8px;">Domain & DNS Probing Report</h4>
      <table class="inspection-table">
        <thead>
          <tr>
            <th>Domain Endpoint</th>
            <th>DNS Status</th>
            <th>IP Resolution</th>
          </tr>
        </thead>
        <tbody>
          ${data.domain_checks.map(d => `
            <tr>
              <td><span class="code-pill">${escapeHTML(d.domain)}</span></td>
              <td style="color:${d.dns_resolved ? '#34d399' : '#f87171'}">${escapeHTML(d.status)}</td>
              <td><span class="code-pill">${d.ip_address || 'None'}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h4 style="color:#fff; font-size:0.95rem; margin:16px 0 8px;">Access Rules & Technical Setup</h4>
      <table class="inspection-table">
        <tbody>
          <tr>
            <td>Authorized Public REST API</td>
            <td style="color:#f87171"><strong>Not Provided / Restricted</strong></td>
          </tr>
          <tr>
            <td>Public Music RSS Feed</td>
            <td style="color:#f87171"><strong>None Detected</strong></td>
          </tr>
          <tr>
            <td>Direct Commercial MP3 Extraction</td>
            <td style="color:#fbbf24"><strong>Prohibited by Copyright Laws & Terms</strong></td>
          </tr>
          <tr>
            <td>Official Listening Links (GMMTV/YouTube/Spotify)</td>
            <td style="color:#34d399"><strong>Verified & Provided in Hub</strong></td>
          </tr>
        </tbody>
      </table>

      <div style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 14px; margin-top: 16px;">
        <h5 style="color:#c084fc; font-size:0.88rem; margin-bottom:6px;">Compliance Action Summary:</h5>
        <p style="color:var(--text-muted); font-size:0.85rem; line-height:1.5;">
          ${escapeHTML(data.compliance_action)}
        </p>
      </div>
    `;
  } catch (err) {
    DOM.inspectionContent.innerHTML = `
      <div class="toast-error" style="padding:16px; border-radius:10px;">
        <p>Failed to execute inspection probe: ${escapeHTML(err.message)}</p>
      </div>
    `;
  }
}

// ==========================================================================
// Toast Notification System
// ==========================================================================
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "🔔";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${escapeHTML(message)}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideInToast 0.3s ease reverse forwards";
    setTimeout(() => {
      if (DOM.toastContainer.contains(toast)) {
        DOM.toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

// ==========================================================================
// Utilities
// ==========================================================================
function formatTime(seconds) {
  const sec = Math.floor(seconds || 0);
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${min}:${remSec < 10 ? '0' : ''}${remSec}`;
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
