import { getWordData } from "../dictionary.mjs";

const LS_KEY = "llc-daily";

function getDailySeed() {
    // Simple deterministic “daily word”
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
      <p class="meta">${message}</p>
      <p class="meta">Try a different search term.</p>
    </div>
  `;
}

function renderDashboard(root, data) {
    const examplesHtml =
        data.examples.length > 0
            ? `<ul class="list">${data.examples.map((e) => `<li>${e}</li>`).join("")}</ul>`
            : `<p class="meta">No examples available for this word.</p>`;

    root.innerHTML = `
    <section class="grid" aria-label="Dashboard">
      <article class="card" aria-label="Daily word">
        <h2>Daily Word</h2>

        <div class="meta" style="font-size: 20px;">
          <div><strong>Word:</strong> ${escapeHtml(data.word)}</div>
          <div><strong>Phonetic:</strong> ${escapeHtml(data.phonetic || "—")}</div>
          <div><strong>Part of speech:</strong> ${escapeHtml(data.partOfSpeech || "—")}</div>
          <div><strong>Definition:</strong> ${escapeHtml(data.definition || "—")}</div>
        </div>

        <div style="margin-top: 14px;">
          <span class="pill">
            <span class="star" aria-hidden="true">★</span>
            <button class="btn btn--primary" id="saveBtn" type="button">Save</button>
          </span>
          <p class="meta" id="saveHint" style="margin-top: 8px;">(Favorites feature starts Week 6.)</p>
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

      <article class="card" aria-label="Weekly progress">
        <h2>Weekly Progress</h2>
        <p class="meta" style="font-size: 22px;">
          Words reviewed: —<br />
          Quizzes completed: —
        </p>
        <p class="meta">Progress tracking starts Week 7.</p>
      </article>
    </section>
  `;

    root.querySelector("#saveBtn")?.addEventListener("click", () => {
        const hint = root.querySelector("#saveHint");
        if (hint) hint.textContent = "Saved (placeholder). Favorites module will be implemented in Week 6.";
    });
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
        renderDashboard(viewRoot, cached.data);
        return;
    }

    try {
        const data = await getWordData(wordToLoad);
        writeDailyCache({ word: wordToLoad, data });
        renderDashboard(viewRoot, data);
    } catch (err) {
        renderError(viewRoot, err?.message || "Unknown error.");
    }
}