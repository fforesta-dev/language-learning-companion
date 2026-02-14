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

    view.classList.add("fade-out");
    await new Promise(resolve => setTimeout(resolve, 200));

    view.innerHTML = "";
    view.classList.remove("fade-out");

    await handler(view, params);

    const main = document.querySelector("#main");
    if (main) {
        try {
            main.focus({ preventScroll: true });
        } catch {
            main.focus();
        }
    }

    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
}

export function initRouter() {
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }
    window.addEventListener("hashchange", renderRoute);
    renderRoute();
}

export function navigate(path) {
    window.location.hash = `#${path.startsWith("/") ? path : `/${path}`}`;
}