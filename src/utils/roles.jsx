// src/utils/roles.js

/**
 * Normalizes roles from user objects of various shapes.
 * Supports:
 *   - user.role => "teacher" | "student" | { name: "teacher" } | etc.
 *   - user.roles => ["assistant", "student"] | [{ name: "teacher" }, ...]
 *   - Handles variants like ROLE_TEACHER, role-student, etc.
 */

/** @typedef {{ roles?: Array<string|{name?:string,role?:string,code?:string}>, role?: string|{name?:string,role?:string,code?:string} }} User */

// Central aliases so you don’t sprinkle strings everywhere
export const ROLE_ALIASES = Object.freeze({
    student: ["student", "std", "role_student"],
    assistant: [
        "assistant",
        "ta",
        "teacher_assistant",
        "teaching_assistant",
        "assistant_teacher",
        "role_assistant",
    ],
    doc: [
        "doc",
        "doctor",
        "instructor",
        "prof",
        "teacher",
        "role_teacher", // ✅ now teacher also maps to "doc"
    ],
});

/** Extract a role name string from mixed inputs (string or object). */
function extractRoleName(r) {
    if (!r) return "";
    if (typeof r === "string") return r;
    if (typeof r === "object") return r.name ?? r.role ?? r.code ?? "";
    return "";
}

/** Build a lowercased Set of normalized role names. */
export function normalizeRoles(user /** @type {User|null|undefined} */) {
    if (!user) return new Set();
    const raw = user.roles ?? user.role ?? [];
    const arr = Array.isArray(raw) ? raw : [raw];

    // Map to strings, normalize casing, strip common prefixes like ROLE_
    const names = arr
        .map(extractRoleName)
        .map((s) => String(s).trim())
        .filter(Boolean)
        .map((s) => s.replace(/^role[_:-]/i, "")) // ROLE_, role- , role:
        .map((s) => s.toLowerCase());

    return new Set(names);
}

/** Generic checker against a canonical key (uses aliases). */
export function hasRole(user, canonicalKey /* 'student' | 'assistant' | 'doc' */) {
    const set = normalizeRoles(user);
    const aliases = (ROLE_ALIASES[canonicalKey] || []).map((a) => a.toLowerCase());

    // Exact alias hit
    if (aliases.some((a) => set.has(a))) return true;

    // Soft match (e.g., "role_student", "app:assistant")
    for (const r of set) {
        if (aliases.some((a) => r.endsWith(a))) return true;
    }
    return false;
}

/** Convenience wrappers — use these across the app */
export const isStudent = (user) => hasRole(user, "student");
export const isAssistant = (user) => hasRole(user, "assistant");
export const isDoc = (user) => hasRole(user, "doc"); // ✅ will now match "teacher"
