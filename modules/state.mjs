const LS_KEY = "llc-state";

function readState() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function writeState(next) {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
}

export function getLangs() {
    const s = readState();
    return {
        from: s.from || "en",
        to: s.to || "it",
    };
}

export function setLangs({ from, to }) {
    const s = readState();
    const next = { ...s, from, to };
    writeState(next);

    window.dispatchEvent(
        new CustomEvent("llc:langs", { detail: { from: next.from, to: next.to } })
    );
}