import { renderDaily } from "./views/daily.mjs";
import { renderTranslate } from "./views/translate.mjs";
import { renderFavorites } from "./views/favorites.mjs";
import { renderQuiz } from "./views/quiz.mjs";
import { renderProgress } from "./views/progress.mjs";

const routes = {
    daily: renderDaily,
    translate: renderTranslate,
    favorites: renderFavorites,
    quiz: renderQuiz,
    progress: renderProgress,
};

function parseHash() {
    const hash = window.location.hash || "#/daily";
    const cleaned = hash.replace(/^#\/?/, "");
    const [pathPart, queryPart] = cleaned.split("?");
    const path = (pathPart || "daily").toLowerCase();
    const params = new URLSearchParams(queryPart || "");
    return { path, params };
}

function setActiveNav(route) {
    document.querySelectorAll("[data-route]").forEach((a) => {
        a.classList.toggle("is-active", a.dataset.route === route);
    });
}

async function renderRoute() {
    const { path, params } = parseHash();
    const view = document.querySelector("#view");

    const handler = routes[path] || routes.daily;
    setActiveNav(path in routes ? path : "daily");

    view.innerHTML = "";
    await handler(view, params);

    const main = document.querySelector("#main");
    main.focus();
}

export function initRouter() {
    window.addEventListener("hashchange", renderRoute);
    renderRoute();
}

export function navigate(path) {
    window.location.hash = `#${path.startsWith("/") ? path : `/${path}`}`;
}