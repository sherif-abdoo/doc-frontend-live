// src/utils/validators.js
import DOMPurify from "dompurify";

/* ---------------------------------------
   DOMPurify helpers (sanitization)
   --------------------------------------- */

/** Strip ALL HTML, collapse spaces, trim, normalize unicode. */
export const sanitizeText = (input, { maxLen = 500, collapseWhitespace = true } = {}) => {
    let s = String(input ?? "");
    try { s = s.normalize("NFKC"); } catch {}
    // Remove any HTML tags/attrs entirely
    s = DOMPurify.sanitize(s, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (collapseWhitespace) s = s.replace(/\s+/g, " ").trim();
    if (s.length > maxLen) s = s.slice(0, maxLen);
    return s;
};

/** Sanitize user-provided rich HTML (e.g., descriptions) before rendering with dangerouslySetInnerHTML. */
export const sanitizeHTML = (html, config) => {
    const defaultCfg = {
        // keep a small allowlist; add more if you need
        ALLOWED_TAGS: ["b", "i", "strong", "em", "u", "br", "p", "ul", "ol", "li", "a", "code", "pre"],
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOW_DATA_ATTR: false,
        FORBID_ATTR: ["style"], // avoid inline styles; remove if you need styling
    };
    return DOMPurify.sanitize(String(html ?? ""), { ...defaultCfg, ...(config || {}) });
};

/** Guard URLs for href/src attributes (allows http/https/mailto/tel and # anchors). */
export const sanitizeURL = (url) => {
    const u = sanitizeText(url, { maxLen: 2048 });
    return /^(https?:|mailto:|tel:|#)/i.test(u) ? u : "";
};

/* Optional hardening: ensure rel=noopener on target=_blank links */
try {
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if ("target" in node) {
            const t = node.getAttribute("target");
            if (t && t.toLowerCase() === "_blank") {
                node.setAttribute("rel", "noopener noreferrer");
            }
        }
        if (node.tagName === "A") {
            const href = node.getAttribute("href");
            if (href && !/^(https?:|mailto:|tel:|#)/i.test(href)) node.removeAttribute("href");
        }
    });
} catch { /* no-op in non-browser envs */ }

/* ---------------------------------------
   Validators (pure booleans)
   --------------------------------------- */

export const isNonEmpty = (s) => sanitizeText(s).length > 0;

export const isEmail = (s) => {
    const e = sanitizeText(String(s ?? ""), { maxLen: 254 });
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(e);
};


/** Egypt: exactly 11 digits and starts with 01 */
export const isPhoneEG11 = (s) => /^01\d{9}$/.test(String(s ?? "").replace(/\D/g, ""));

export const isDateYMD = (s) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(sanitizeText(s));

export const minLength = (n) => (s) => sanitizeText(s, { collapseWhitespace: false }).length >= n;
export const passwordMin = (n) => (s = "") => String(s).length >= n;
export const matches = (other) => (s) => String(s) === String(other);