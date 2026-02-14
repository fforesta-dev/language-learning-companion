import { translateText } from "../deepl.mjs";
import { getLangs, setLangs } from "../state.mjs";

export async function renderTranslate(viewRoot) {
  viewRoot.innerHTML = `
  <div class="translate-container">
    <div class="translate-form">
      <h2 style="margin: 0 0 24px; font-size: 28px; color: var(--primary); font-family: var(--font-heading); font-weight: 700;">Translate</h2>

      <div class="form-row">
        <div class="form-group">
          <label for="fromSel">From:</label>
          <select id="fromSel" class="select"></select>
        </div>

        <div class="form-group">
          <label for="toSel">To:</label>
          <select id="toSel" class="select"></select>
        </div>
      </div>

      <div class="textarea-group">
        <label for="srcText" id="srcLabel">Text:</label>
        <textarea id="srcText" placeholder="Type something..."></textarea>
      </div>

      <div style="display: flex; align-items: center; gap: 16px;">
        <button class="translate-btn" id="translateBtn" type="button">Translate</button>
        <span class="meta" id="status" aria-live="polite" style="font-size: 14px;"></span>
      </div>

      <div class="result-section">
        <h3>Result</h3>
        <div id="out" class="result-box"></div>
      </div>
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

  const navFrom = document.querySelector("#fromLang");
  const navTo = document.querySelector("#toLang");

  function cloneOptions(fromEl, toEl) {
    if (!fromEl || !toEl) return false;
    fromSel.innerHTML = fromEl.innerHTML;
    toSel.innerHTML = toEl.innerHTML;
    return true;
  }

  const copied = cloneOptions(navFrom, navTo);

  if (!copied) {
    fromSel.innerHTML = `
      <option value="ar">Arabic (AR)</option>
      <option value="bg">Bulgarian (BG)</option>
      <option value="zh">Chinese (ZH)</option>
      <option value="cs">Czech (CS)</option>
      <option value="da">Danish (DA)</option>
      <option value="de">German (DE)</option>
      <option value="nl">Dutch (NL)</option>
      <option value="en">English (EN)</option>
      <option value="et">Estonian (ET)</option>
      <option value="fi">Finnish (FI)</option>
      <option value="fr">French (FR)</option>
      <option value="el">Greek (EL)</option>
      <option value="hu">Hungarian (HU)</option>
      <option value="id">Indonesian (ID)</option>
      <option value="it">Italian (IT)</option>
      <option value="ja">Japanese (JA)</option>
      <option value="ko">Korean (KO)</option>
      <option value="lv">Latvian (LV)</option>
      <option value="lt">Lithuanian (LT)</option>
      <option value="nb">Norwegian Bokmål (NB)</option>
      <option value="pl">Polish (PL)</option>
      <option value="pt">Portuguese (PT)</option>
      <option value="ro">Romanian (RO)</option>
      <option value="ru">Russian (RU)</option>
      <option value="sk">Slovak (SK)</option>
      <option value="sl">Slovenian (SL)</option>
      <option value="es">Spanish (ES)</option>
      <option value="sv">Swedish (SV)</option>
      <option value="tr">Turkish (TR)</option>
      <option value="uk">Ukrainian (UK)</option>
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

  fromSel.addEventListener("change", () => {
    setLangs({ from: fromSel.value, to: toSel.value });
  });

  toSel.addEventListener("change", () => {
    setLangs({ from: fromSel.value, to: toSel.value });
  });

  window.addEventListener("llc:langs", syncTranslateUi);
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
      status.style.color = "var(--danger)";
      return;
    }

    try {
      btn.disabled = true;
      status.textContent = "Translating...";
      status.style.color = "var(--muted)";
      out.textContent = "";

      const { from, to } = getLangs();

      const translated = await translateText({
        text,
        source: from,
        target: to,
      });

      out.textContent = translated || "No result returned.";
      status.textContent = "Done!";
      status.style.color = "var(--success)";

      if (statusTimeoutId) clearTimeout(statusTimeoutId);
      statusTimeoutId = setTimeout(() => {
        status.textContent = "";
      }, 1500);
    } catch (err) {
      status.textContent = `Error: ${err?.message || "Unknown error"}`;
      status.style.color = "var(--danger)";
    } finally {
      btn.disabled = false;
    }
  });
}
