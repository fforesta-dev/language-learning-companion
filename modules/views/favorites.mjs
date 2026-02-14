import { getFavorites, removeFavorite, clearFavorites } from "../favorites.mjs";
import { navigate } from "../router.mjs";

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return map[ch] || ch;
  });
}

export async function renderFavorites(viewRoot) {
  const favorites = getFavorites();

  if (favorites.length === 0) {
    viewRoot.innerHTML = `
      <div class="card">
        <h3>Favorites</h3>
        <p class="meta">No favorite words yet. Save words from the Daily Word page to build your collection!</p>
      </div>
    `;
    return;
  }

  const favoritesList = favorites
    .map(
      (fav, index) => `
        <article class="favorite-item card" data-index="${index}">
          <div class="favorite-content">
            <h4 style="margin: 0 0 4px;">${escapeHtml(fav.word)}</h4>
            <p class="meta" style="margin: 0;">${escapeHtml(fav.definition || "—")}</p>
            ${fav.phonetic ? `<p class="meta" style="margin: 4px 0 0; font-size: 12px;">/${escapeHtml(fav.phonetic)}/</p>` : ""}
          </div>
          <div class="favorite-actions">
            <button 
              class="btn btn--secondary favorite-view-btn" 
              type="button"
              data-word="${escapeHtml(fav.word)}"
            >
              View Details
            </button>
            <button 
              class="btn btn--icon favorites-remove" 
              type="button" 
              aria-label="Remove from favorites"
              data-word="${escapeHtml(fav.word)}"
            >
              ✕
            </button>
          </div>
        </article>
      `
    )
    .join("");

  viewRoot.innerHTML = `
    <section class="favorites-container">
      <div class="card" style="grid-column: 1 / -1;">
        <h2>My Favorites (${favorites.length})</h2>
        <button class="reset-btn" id="clearAllBtn" type="button">Clear All</button>
      </div>
      <div class="favorites-grid">
        ${favoritesList}
      </div>
    </section>
  `;

  viewRoot.querySelectorAll(".favorites-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const word = btn.dataset.word;
      if (removeFavorite(word)) {
        renderFavorites(viewRoot);
      }
    });
  });

  viewRoot.querySelectorAll(".favorite-view-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(`/search?word=${encodeURIComponent(btn.dataset.word)}`);
    });
  });

  const clearBtn = viewRoot.querySelector("#clearAllBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all favorites? This cannot be undone.")) {
        clearFavorites();
        renderFavorites(viewRoot);
      }
    });
  }
}
