// src/utils/pdfUrls.js
// Robust helpers that keep the original origin + path prefix (works with /r2/*, /files/*, etc.)

function sanitizeFilename(name) {
    if (!name) return "file.pdf";

    return name.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 200);
}

function asURL(url) {
    return new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
}

function withQueryString(u, params) {
    Object.entries(params || {}).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        u.searchParams.set(k, String(v));
    });
    return u;
}

function swapLastPathSegment(u, newSegment) {
    const parts = u.pathname.split("/");
    if (parts.length === 0) return u;
    parts[parts.length - 1] = newSegment.startsWith("/") ? newSegment.slice(1) : newSegment;
    u.pathname = parts.join("/");
    return u;
}

export function toViewUrl(url) {
    try {
        const u = asURL(url);
        const last = u.pathname.split("/").pop() || "";
        const key = u.searchParams.get("key");
        if (!key) return url;

        if (last === "view") return u.toString();
        if (last === "get" || last === "download") {
            return swapLastPathSegment(u, "view").toString();
        }
        return swapLastPathSegment(u, "view").toString();
    } catch {
        return url;
    }
}

export function toRawUrl(url) {
    try {
        const u = asURL(url);
        const last = u.pathname.split("/").pop() || "";
        const key = u.searchParams.get("key");
        if (!key) return url;

        if (last === "get") return u.toString();
        if (last === "view" || last === "download") {
            return swapLastPathSegment(u, "get").toString();
        }
        return swapLastPathSegment(u, "get").toString();
    } catch {
        return url;
    }
}

export function toDownloadUrl(url, filename) {
    // Always prefer GET + dl=1 (works everywhere with your updated worker)
    const safe = sanitizeFilename(filename || "file.pdf");
    try {
        const u = asURL(url);
        const key = u.searchParams.get("key");
        if (key) {
            // whatever the tail is, make it /get and add dl + filename
            return withQueryString(swapLastPathSegment(u, "get"), { dl: 1, filename: safe }).toString();
        }
        // fallback
        return withQueryString(u, { dl: 1, filename: safe }).toString();
    } catch {
        try {
            const u2 = asURL(url);
            return withQueryString(u2, { dl: 1, filename: safe }).toString();
        } catch {
            return url;
        }
    }
}
