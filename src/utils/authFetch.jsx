// src/lib/authFetch.js

const TOKEN_KEY = "token";

// ✅ Allow same-origin by default
const BASE_URL = (process.env.REACT_APP_API_BASE || "").trim();

if (!process.env.REACT_APP_API_BASE) {
    // eslint-disable-next-line no-console
    console.warn("[authFetch] REACT_APP_API_BASE is empty → using same-origin.");
}

// Join base + endpoint without double slashes; pass through absolute URLs
const joinUrl = (base, endpoint) => {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    const b = String(base || "").replace(/\/+$/, "");   // "" when same-origin
    const e = String(endpoint || "").replace(/^\/+/, "");
    return b ? `${b}/${e}` : `/${e}`;                   // ensure leading slash
};

// Public helpers so the rest of the app never touches localStorage directly
export const getAccessToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
        return null;
    }
};

export const setAccessToken = (t) => {
    try {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {}
};

export const clearAccessToken = () => setAccessToken(null);

// Build query string for GET if data is provided
const appendQuery = (url, data) => {
    if (!data || typeof data !== "object") return url;
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === null) continue;
        if (Array.isArray(v)) v.forEach((item) => usp.append(k, String(item)));
        else usp.append(k, String(v));
    }
    const qs = usp.toString();
    if (!qs) return url;
    return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
};

/**
 * authFetch(method, endpoint, data?)
 * - method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
 * - endpoint: "/path" or absolute URL
 * - data: plain JSON object or FormData
 * - returns: parsed JSON (throws on non-2xx with err.status & err.payload)
 */
export async function authFetch(method, endpoint, data) {
    const m = String(method || "GET").toUpperCase();

    // ❌ removed the throw — empty base is valid (same-origin)
    let url = joinUrl(BASE_URL, endpoint);

    const headers = new Headers({ Accept: "application/json" });

    // Attach Bearer token (stored in localStorage)
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const init = { method: m, headers };

    // GET/HEAD → encode query params instead of sending a body
    if (m === "GET" || m === "HEAD") {
        if (data && typeof data === "object") {
            url = appendQuery(url, data);
        }
    } else {
        // Non-GET: support raw JSON or FormData
        if (data instanceof FormData) {
            init.body = data;
        } else if (data !== undefined) {
            headers.set("Content-Type", "application/json");
            init.body = JSON.stringify(data);
        }
    }

    const res = await fetch(url, init);

    // Prefer JSON payloads; fall back to text
    const ct = res.headers.get("content-type") || "";
    const payload = ct.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text();

    if (!res.ok) {
        const msg =
            (payload && typeof payload === "object" && (payload.message || payload.error)) ||
            (typeof payload === "string" && payload) ||
            `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.payload = payload;
        throw err;
    }

    return typeof payload === "object" && payload !== null ? payload : { data: payload };
}

export { BASE_URL };
