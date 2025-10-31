import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {authFetch, getAccessToken, setAccessToken} from "../utils/authFetch";

const TOKEN_KEY = "token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);          // memory only
    const [isLoading, setIsLoading] = useState(true);
    const rehydratingRef = useRef(false);            // avoid duplicate /me calls

    const setAuthUser = useCallback((nextUser) => {
        setUser(nextUser || null);
    }, []);

    // Never expose token in context. Only provide a way to clear it.
    const clearToken = useCallback(() => setAccessToken(null), []);

    const logout = useCallback(() => {
        setUser(null);
        clearToken();
    }, [clearToken]);

    const reloadUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) { setUser(null); return; }
        if (rehydratingRef.current) return;
        rehydratingRef.current = true;
        try {
            // ✅ call /login/me through authFetch (adds Bearer from localStorage)
            const resp = await authFetch("GET", "/login/me");
            setUser(resp?.data || resp || null);
        } catch (err) {
            setUser(null);
        } finally {
            rehydratingRef.current = false;
        }
    }, []);

    // 1) Boot: if token exists, hydrate user from /login/me
    useEffect(() => {
        (async () => {
            try {
                if (getAccessToken()) {
                    await reloadUser();
                } else {
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, [reloadUser]);

    // 2) If context becomes null while a token exists, try rehydration automatically
    useEffect(() => {
        if (!user && getAccessToken()) {
            reloadUser(); // fire & forget
        }
    }, [user, reloadUser]);

    // 3) Multi-tab support: react to token changes from other tabs
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === TOKEN_KEY) {
                if (e.newValue) reloadUser();
                else setUser(null);
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [reloadUser]);

    const value = useMemo(
        () => ({
            user,
            isAuthed: !!user,
            isLoading,
            setAuthUser,                 // set memory user
            setTokenInStorage: setAccessToken, // (optional) for places that need to set/clear token
            clearTokenInStorage: clearToken,
            reloadUser,
            logout,
        }),
        [user, isLoading, setAuthUser, clearToken, reloadUser, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
