import { translateText } from "../deepl.mjs";
import { getLangs, setLangs } from "../state.mjs";

export async function renderTranslate(viewRoot) {
  viewRoot.innerHTML = `
  <div class="card">
    <h3>Translate</h3>

    <div class="actions-row" style="justify-content:flex-start; gap:12px; margin-bottom:12px;">
      <label class="meta form-label" for="fromSel">From:</label>
      <select id="fromSel" class="select" style="height:38px;"></select>

      <label class="meta form-label" for="toSel">To:</label>
      <select id="toSel" class="select" style="height:38px;"></select>
    </div>

    <label class="meta form-label" for="srcText" id="srcLabel">Text:</label>
    <textarea id="srcText" class="textarea" rows="4" placeholder="Type something..."></textarea>

    <div class="actions-row">
      <button class="btn btn--secondary" id="translateBtn" type="button">Translate</button>
      <span class="meta" id="status" aria-live="polite"></span>
    </div>

    <div style="margin-top:14px;">
      <h4 style="margin:0 0 8px;">Result</h4>
      <div id="out" class="meta result-box"></div>
    </div>
  </div>
`;

  const srcText = viewRoot.querySelector("#srcText");
  const btn = viewRoot.querySelector("#translateBtn");
  const out = viewRoot.querySelector("#out");
  const status = viewRoot.querySelector("#status");
  const srcLabel = viewRoot.querySelector("#srcLabel");
  const fromSel = viewRoot.querySelector("#fromSel");
  const toSel = viewRoot.querySelector("#toSel");

  if (srcLabel) {
    const { from, to } = getLangs();
    srcLabel.textContent = `Text (${from.toUpperCase()} → ${to.toUpperCase()}):`;
  }

  let statusTimeoutId = null;

  if (!srcText || !btn || !out || !status || !fromSel || !toSel || !srcLabel) return;

  // --- Step 3: keep Translate view in sync with global language state ---

  // Try to copy the exact options from navbar selects (if they exist)
  const navFrom = document.querySelector("#langFrom");
  const navTo = document.querySelector("#langTo");

  function cloneOptions(fromEl, toEl) {
    if (!fromEl || !toEl) return false;
    fromSel.innerHTML = fromEl.innerHTML;
    toSel.innerHTML = toEl.innerHTML;
    return true;
  }

  const copied = cloneOptions(navFrom, navTo);

  // Fallback options if navbar IDs don't exist
  if (!copied) {
    fromSel.innerHTML = `
      <option value="en">EN</option>
      <option value="it">IT</option>
      <option value="fr">FR</option>
      <option value="es">ES</option>
      <option value="de">DE</option>
    `;
    toSel.innerHTML = fromSel.innerHTML;
  }

  function syncTranslateUi() {
    const { from, to } = getLangs();

    fromSel.value = from;
    toSel.value = to;

    srcLabel.textContent = `Text (${from.toUpperCase()} → ${to.toUpperCase()}):`;
    btn.textContent = `Translate to ${to.toUpperCase()}`;
  }

  // When user changes languages INSIDE Translate page
  fromSel.addEventListener("change", () => {
    setLangs({ from: fromSel.value, to: toSel.value });
  });

  toSel.addEventListener("change", () => {
    setLangs({ from: fromSel.value, to: toSel.value });
  });

  // When languages change elsewhere (navbar, other pages)
  window.addEventListener("llc:langs", syncTranslateUi);

  // Initial sync
  syncTranslateUi();

  srcText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      btn.click();
    }
  });

  btn.addEventListener("click", async () => {
    const text = srcText.value.trim();
    if (!text) {
      status.textContent = "Type something first.";
      status.className = "meta meta--error";
      return;
    }

    try {
      btn.disabled = true;
      status.textContent = "Translating...";
      status.className = "meta";
      out.textContent = "";

      const { from, to } = getLangs();

      const translated = await translateText({
        text,
        source: from,
        target: to,
      });

      out.textContent = translated || "No result returned.";
      status.textContent = "Done.";
      status.className = "meta meta--success";

      if (statusTimeoutId) clearTimeout(statusTimeoutId);
      statusTimeoutId = setTimeout(() => {
        status.textContent = "";
        status.className = "meta";
      }, 1500);
    } catch (err) {
      status.textContent = `Error: ${err?.message || "Unknown error"}`;
      status.className = "meta meta--error";
    } finally {
      btn.disabled = false;
    }
  });
}
