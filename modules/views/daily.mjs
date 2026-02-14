import { getWordData } from "../dictionary.mjs";
import { getThesaurusData } from "../thesaurus.mjs";
import { addFavorite, isFavorite, getFavorites } from "../favorites.mjs";
import { getQuizStats } from "../quiz.mjs";

const LS_KEY = "llc-daily";

function getDailySeed() {
  const words = ["example", "travel", "learn", "future", "practice", "focus", "simple", "progress"];
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const seed = Number(`${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`);
  return words[seed % words.length];
}

function readDailyCache() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDailyCache(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function renderLoading(root) {
  root.innerHTML = `
    <div class="loading">
      <span>Loading word</span>
      <span class="dots" aria-hidden="true"></span>
    </div>
  `;
}

function renderError(root, message) {
  root.innerHTML = `
    <div class="card">
      <h3>Couldn’t load that word</h3>
      <p class="meta">${escapeHtml(message)}</p>
      <p class="meta">Try a different search term.</p>
    </div>
  `;
}

function renderDashboard(root, data, thesaurus) {
  const examples = Array.isArray(data.examples) ? data.examples : [];
  const examplesHtml =
    examples.length > 0
      ? `<ul class="list">${examples.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`
      : `<p class="meta">No examples available for this word.</p>`;

  const allDefs = Array.isArray(data.allDefinitions) ? data.allDefinitions : [data.definition];
  const definitionsHtml = allDefs.length > 0
    ? `<ol class="definitions-list">${allDefs.map((def, i) => `<li><strong>${i + 1}.</strong> ${escapeHtml(def)}</li>`).join("")}</ol>`
    : `<p class="meta">—</p>`;

  const synonyms = Array.isArray(thesaurus?.synonyms) ? thesaurus.synonyms : [];
  const antonyms = Array.isArray(thesaurus?.antonyms) ? thesaurus.antonyms : [];

  const synonymsHtml =
    synonyms.length > 0
      ? `<ul class="list">${synonyms.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
      : `<p class="meta">No synonyms available.</p>`;

  const antonymsHtml =
    antonyms.length > 0
      ? `<ul class="list">${antonyms.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
      : `<p class="meta">No antonyms available.</p>`;

  const favorites = getFavorites();
  const quizStats = getQuizStats();

  const usageNotesHtml = Array.isArray(data.usageNotes) && data.usageNotes.length > 0
    ? `<div class="usage-notes"><h3>Usage Notes</h3><ul class="list">${data.usageNotes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></div>`
    : '';

  const etymologyHtml = data.etymology
    ? `<div class="etymology-section">
        <h3>Word Origin</h3>
        <p class="meta">${escapeHtml(data.etymology)}</p>
        ${data.dateFirstUsed ? `<p class="meta meta--sm">First known use: <strong>${escapeHtml(data.dateFirstUsed)}</strong></p>` : ''}
      </div>`
    : '';

  const variantsHtml = Array.isArray(data.variants) && data.variants.length > 0
    ? `<p class="meta meta--sm"><strong>Also spelled:</strong> ${data.variants.map(v => escapeHtml(v)).join(', ')}</p>`
    : '';

  root.innerHTML = `
    <div class="daily-word-container" aria-label="Dashboard">
      <article class="card daily-word-main" aria-label="Daily word">
        <h2>Daily Word</h2>

        <div class="word-header">
          <div class="word-title">
            <h3 class="word-display">${escapeHtml(data.word)}</h3>
            ${data.audioUrl
      ? `<button class="btn btn--secondary btn--icon" id="playAudio" type="button" aria-label="Play pronunciation" title="Hear pronunciation">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>`
      : ""
    }
          </div>
          <div class="word-meta">
            <span class="phonetic">${escapeHtml(data.phonetic || "—")}</span>
            <span class="part-of-speech">${escapeHtml(data.partOfSpeech || "—")}</span>
          </div>
          ${variantsHtml}
        </div>

        <div class="definitions-section">
          <h3>Definitions</h3>
          ${definitionsHtml}
        </div>

        ${etymologyHtml}

        <div class="daily-actions">
          <button class="btn btn--primary pill" id="saveBtn" type="button">
            <span class="star" aria-hidden="true" id="starIcon">★</span>
            Save to Favorites
          </button>
          <p class="meta save-hint" id="saveHint"></p>
        </div>
      </article>


      <article class="card examples-card" aria-label="Example sentences">
        <h2>Example Sentences</h2>
        ${examplesHtml}
        ${usageNotesHtml}
      </article>

       <article class="card thesaurus-card" aria-label="Thesaurus">
        <h2>Thesaurus</h2>
        <div class="meta meta--lg">
          <div><strong>Synonyms:</strong></div>
          ${synonymsHtml}
          <div style="margin-top: 12px;"><strong>Antonyms:</strong></div>
          ${antonymsHtml}
        </div>
      </article>

      
      <article class="card favorites-card" aria-label="Favorites recent">
        <h2>Favorites (Recent)</h2>
        <div id="recentFavoritesContainer"></div>
      </article>

      <article class="card progress-card" aria-label="Weekly progress">
        <h2>Progress</h2>
        <p class="meta meta--xl">
          Words saved: <strong>${favorites.length}</strong><br />
          Quizzes completed: <strong>${quizStats.totalQuizzes}</strong>
        </p>
        ${quizStats.totalQuizzes > 0
      ? `<p class="meta">Average score: <strong>${quizStats.averageScore}%</strong></p>`
      : `<p class="meta">Complete quizzes to track your progress!</p>`
    }
      </article>
    </div>
  `;

  // Save button - add favorite
  root.querySelector("#saveBtn")?.addEventListener("click", () => {
    const saveBtn = root.querySelector("#saveBtn");
    const saveHint = root.querySelector("#saveHint");
    const starIcon = root.querySelector("#starIcon");
    const recentContainer = root.querySelector("#recentFavoritesContainer");
    const progressCard = root.querySelector(".progress-card");

    const wordData = {
      word: data.word,
      definition: data.definition,
      phonetic: data.phonetic,
      partOfSpeech: data.partOfSpeech,
    };

    const added = addFavorite(wordData);

    if (added) {
      saveBtn.innerHTML = `<span class="star" aria-hidden="true" style="color: #1a1a1a;">★</span> Saved`;
      saveHint.textContent = "Added to your favorites.";
      saveBtn.disabled = true;

      if (recentContainer) {
        const favorites = getFavorites();
        const recent = favorites.slice(-5).reverse();
        const listHtml = recent
          .map(
            (fav) =>
              `<li><strong>${escapeHtml(fav.word)}</strong><br><span class="meta">${escapeHtml(fav.definition || "—")}</span></li>`
          )
          .join("");
        recentContainer.innerHTML = `<ul class="list">${listHtml}</ul>`;
      }

      if (progressCard) {
        const favorites = getFavorites();
        const quizStats = getQuizStats();
        progressCard.innerHTML = `
          <h2>Progress</h2>
          <p class="meta meta--xl">
            Words saved: <strong>${favorites.length}</strong><br />
            Quizzes completed: <strong>${quizStats.totalQuizzes}</strong>
          </p>
          ${quizStats.totalQuizzes > 0
            ? `<p class="meta">Average score: <strong>${quizStats.averageScore}%</strong></p>`
            : `<p class="meta">Complete quizzes to track your progress!</p>`
          }
        `;
      }
    } else {
      saveHint.textContent = "Already in your favorites!";
      if (starIcon) starIcon.style.color = "#1a1a1a";
    }
  });

  if (isFavorite(data.word)) {
    const starIcon = root.querySelector("#starIcon");
    const saveBtn = root.querySelector("#saveBtn");
    if (starIcon) starIcon.style.color = "#1a1a1a";
    if (saveBtn) {
      saveBtn.innerHTML = `<span class="star" aria-hidden="true" style="color: #1a1a1a;">★</span> Saved`;
      saveBtn.disabled = true;
    }
  }

  const recentContainer = root.querySelector("#recentFavoritesContainer");
  if (recentContainer) {
    const favorites = getFavorites();
    if (favorites.length === 0) {
      recentContainer.innerHTML = '<p class="meta">No favorites yet. Save words to get started!</p>';
    } else {
      const recent = favorites.slice(-5).reverse();
      const listHtml = recent
        .map(
          (fav) =>
            `<li><strong>${escapeHtml(fav.word)}</strong><br><span class="meta">${escapeHtml(fav.definition || "—")}</span></li>`
        )
        .join("");
      recentContainer.innerHTML = `<ul class="list">${listHtml}</ul>`;
    }
  }

  const playBtn = root.querySelector("#playAudio");
  if (playBtn && data.audioUrl) {
    const audio = new Audio(data.audioUrl);
    window.addEventListener(
      "hashchange",
      () => {
        audio.pause();
        audio.currentTime = 0;
      },
      { once: true }
    );

    playBtn.addEventListener("click", () => {
      playBtn.disabled = true;
      playBtn.textContent = "🔊";
      playBtn.setAttribute("aria-pressed", "true");
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(() => {
        console.warn("Audio playback failed (browser blocked it).");
        playBtn.disabled = false;
        playBtn.textContent = "▶️";
        playBtn.setAttribute("aria-pressed", "false");
      });
    });

    audio.addEventListener("ended", () => {
      playBtn.disabled = false;
      playBtn.textContent = "▶️";
      playBtn.setAttribute("aria-pressed", "false");
    });

    audio.addEventListener("error", () => {
      playBtn.disabled = false;
      playBtn.textContent = "▶️";
      playBtn.setAttribute("aria-pressed", "false");
    });
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[ch] || ch;
  });
}

export async function renderDaily(viewRoot, params) {
  const wordParam = (params.get("word") || "").trim();
  const wordToLoad = wordParam || getDailySeed();

  renderLoading(viewRoot);

  const cached = readDailyCache();
  if (cached?.word === wordToLoad && cached?.data) {
    renderDashboard(viewRoot, cached.data, cached.thesaurus);
    return;
  }

  try {
    const [dictResult, thesResult] = await Promise.allSettled([
      getWordData(wordToLoad),
      getThesaurusData(wordToLoad),
    ]);

    if (dictResult.status !== "fulfilled") {
      throw dictResult.reason || new Error("Dictionary request failed.");
    }

    const data = dictResult.value;
    const thesaurus = thesResult.status === "fulfilled" ? thesResult.value : null;

    writeDailyCache({ word: wordToLoad, data, thesaurus });
    renderDashboard(viewRoot, data, thesaurus);
  } catch (err) {
    renderError(viewRoot, err?.message || "Unknown error.");
  }
}
