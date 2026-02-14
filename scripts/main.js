import { initRouter, navigate } from "../modules/router.mjs";
import { setLangs, getLangs } from "../modules/state.mjs";

initRouter();

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (searchInput.value || "").trim();
    if (!q) return;
    navigate(`/daily?word=${encodeURIComponent(q)}`);
    searchInput.blur();
});

const fromLang = document.querySelector("#fromLang");
const toLang = document.querySelector("#toLang");
const goTranslateBtn = document.querySelector("#goTranslateBtn");

const langs = getLangs();
fromLang.value = langs.from;
toLang.value = langs.to;

fromLang.addEventListener("change", () => setLangs({ from: fromLang.value, to: toLang.value }));
toLang.addEventListener("change", () => setLangs({ from: fromLang.value, to: toLang.value }));

goTranslateBtn.addEventListener("click", () => {
    setLangs({ from: fromLang.value, to: toLang.value });
    navigate("/translate");
});