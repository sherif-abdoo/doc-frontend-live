// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {authFetch} from "../utils/authFetch";

export const useAuth = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadMe = useCallback(async () => {
        setIsLoading(true);
        try {
            // authFetch returns parsed JSON or throws on non-2xx
            const res = await authFetch("GET", "/login/me");
            const me = res?.data ?? res ?? null; // tolerate both {data: {...}} or direct object
            setUser(me);
        } catch (err) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadMe(); }, [loadMe]);

    // Optional: convenience wrapper if you want it around authFetch
    const fetchAuthed = useCallback((method, path, data) => {
        return authFetch(method, path, data);
    }, []);

    return { user, isLoggedIn: !!user, isLoading, reloadUser: loadMe, fetchAuthed };
};
