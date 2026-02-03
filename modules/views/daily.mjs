import { getWordData } from "../dictionary.mjs";
import { getThesaurusData } from "../thesaurus.mjs";

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

  root.innerHTML = `
    <section class="grid" aria-label="Dashboard">
      <article class="card" aria-label="Daily word">
        <h2>Daily Word</h2>

        <div class="meta meta--lg">
          <div>
            <strong>Word:</strong> ${escapeHtml(data.word)}
            ${data.audioUrl
      ? `
                  <button
                    class="btn btn--secondary btn--icon"
                    id="playAudio"
                    type="button"
                    aria-label="Play pronunciation"
                    aria-pressed="false"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                `
      : ""
    }
          </div>

          <div><strong>Phonetic:</strong> ${escapeHtml(data.phonetic || "—")}</div>
          <div><strong>Part of speech:</strong> ${escapeHtml(data.partOfSpeech || "—")}</div>
          <div><strong>Definition:</strong> ${escapeHtml(data.definition || "—")}</div>
        </div>

        <div class="daily-actions">
          <span class="pill">
            <span class="star" aria-hidden="true">★</span>
            <button class="btn btn--primary" id="saveBtn" type="button">Save</button>
          </span>
          <p class="meta save-hint" id="saveHint">(Favorites feature starts Week 6.)</p>
        </div>
      </article>

      <article class="card" aria-label="Favorites recent">
        <h2>Favorites (Recent)</h2>
        <ul class="list">
          <li>word 1</li>
          <li>word 2</li>
        </ul>
        <p class="meta">This area will be dynamic in Week 6.</p>
      </article>

      <article class="card" aria-label="Example sentences">
        <h2>Example Sentences</h2>
        ${examplesHtml}
      </article>

      <article class="card" aria-label="Thesaurus">
        <h2>Thesaurus</h2>
        <div class="meta meta--lg">
          <div><strong>Synonyms:</strong></div>
          ${synonymsHtml}
          <div style="margin-top: 12px;"><strong>Antonyms:</strong></div>
          ${antonymsHtml}
        </div>
      </article>

      <article class="card" aria-label="Weekly progress">
        <h2>Weekly Progress</h2>
        <p class="meta meta--xl">
          Words reviewed: —<br />
          Quizzes completed: —
        </p>
        <p class="meta">Progress tracking starts Week 7.</p>
      </article>
    </section>
  `;

  // Save placeholder
  root.querySelector("#saveBtn")?.addEventListener("click", () => {
    const hint = root.querySelector("#saveHint");
    if (hint) hint.textContent = "Saved (placeholder). Favorites module will be implemented in Week 6.";
  });

  // Pronunciation audio (Step 2c – disable while playing)
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
