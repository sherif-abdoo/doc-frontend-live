// src/shared/utils/pdfUrls.js
const R2_READER_BASE =
    (import.meta?.env?.VITE_R2_READER_BASE) ||
    (typeof process !== "undefined" ? process.env?.VITE_R2_READER_BASE : "") ||
    "";

// Extract the R2 key from:
// - A full r2-read URL (…/get|raw|view?key=...)
// - A plain path like /uploads/.../file.pdf
// - Any absolute URL (we'll use its pathname as the key)
function extractKey(inputUrl) {
    if (!inputUrl) return "";
    try {
        const u = new URL(inputUrl, typeof window !== "undefined" ? window.location.origin : "https://local.test");
        if (R2_READER_BASE && u.origin === new URL(R2_READER_BASE).origin) {
            return decodeURIComponent(u.searchParams.get("key") || u.pathname.replace(/^\/+/, ""));
        }
        return decodeURIComponent(u.pathname.replace(/^\/+/, ""));
    } catch {
        return String(inputUrl).replace(/^\/+/, "");
    }
}

export function toRawUrl(inputUrl) {
    if (!R2_READER_BASE) return inputUrl;
    const key = extractKey(inputUrl);
    const u = new URL("/raw", R2_READER_BASE);
    u.searchParams.set("key", encodeURIComponent(key));
    return u.toString();
}

export function toViewUrl(inputUrl) {
    if (!R2_READER_BASE) return inputUrl;
    const key = extractKey(inputUrl);
    const u = new URL("/view", R2_READER_BASE);
    u.searchParams.set("key", encodeURIComponent(key));
    return u.toString();
}
