import { initRouter, navigate } from "../modules/router.mjs";
import { setLangs, getLangs } from "../modules/state.mjs";
import { initTheme, toggleTheme, getCurrentTheme } from "../modules/theme.mjs";

// Initialize theme
initTheme();

initRouter();

// Theme toggle button
const themeToggle = document.querySelector("#themeToggle");
const lightIcon = document.querySelector(".theme-icon--light");
const darkIcon = document.querySelector(".theme-icon--dark");

function updateThemeIcons() {
    const currentTheme = getCurrentTheme();
    if (currentTheme === 'dark') {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
    } else {
        lightIcon.style.display = 'block';
        darkIcon.style.display = 'none';
    }
}

themeToggle.addEventListener("click", () => {
    toggleTheme();
    updateThemeIcons();
});

updateThemeIcons();

// Header: dictionary search
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (searchInput.value || "").trim();
    if (!q) return;
    navigate(`/daily?word=${encodeURIComponent(q)}`);
    searchInput.blur();
});

// Language selects
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