// src/utils/stablish_sse.js
import { useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getAccessToken } from "../utils/authFetch";

// Resolve API base (env → fallback to localhost:4000)
const API_BASE = process.env.REACT_APP_API_BASE;

const joinUrl = (base, endpoint) => {
    if (/^https?:\/\//i.test(endpoint)) return endpoint;
    const b = base.replace(/\/+$/, "");
    const e = endpoint.replace(/^\/+/, "");
    return `${b}/${e}`;
};

/**
 * useAdminSSE
 * Hook to establish an SSE connection to /admin/adminSSE for certain roles.
 *
 * @param {Object}   opts
 * @param {boolean}  [opts.enabled=true]
 * @param {string[]} [opts.allowedRoles=["admin"]]
 * @param {Function} [opts.onOpen]
 * @param {Function} [opts.onMessage] - (payload, eventName, { id, raw })
 * @param {Function} [opts.onError]
 */
export function useAdminSSE({
                                enabled = true,
                                allowedRoles = ["admin"],
                                onOpen,
                                onMessage,
                                onError,
                            } = {}) {
    const { user, isLoading } = useAuth();
    const abortRef = useRef(null);
    const reconnectAttemptRef = useRef(0);

    useEffect(() => {
        if (!enabled || isLoading) return;

        const roleStr = String(user?.role || "").toLowerCase();
        const canConnect = allowedRoles.some(
            (r) => roleStr === String(r).toLowerCase()
        );
        if (!user || !canConnect) return;

        let cancelled = false;
        let reader;
        const controller = new AbortController();
        abortRef.current = controller;

        const parseAndDispatch = (rawEventBlock) => {
            const normalized = rawEventBlock.replace(/\r\n/g, "\n");
            const lines = normalized.split("\n");
            const evt = { raw: rawEventBlock };
            let hasData = false;

            for (const line of lines) {
                if (!line) continue;
                if (line.startsWith(":")) {
                    // comment / heartbeat
                    // console.debug("[SSE] <- heartbeat");
                    continue;
                }
                const idx = line.indexOf(":");
                if (idx === -1) continue;
                const field = line.slice(0, idx).trim();
                const val = line.slice(idx + 1).trimStart();

                if (field === "event") evt.event = val;
                else if (field === "id") evt.id = val;
                else if (field === "data") {
                    hasData = true;
                    evt.data = (evt.data ? evt.data + "\n" : "") + val;
                }
            }

            if (hasData && evt.data != null) {
                let payload = evt.data;
                try {
                    payload = JSON.parse(evt.data);
                } catch {}
                console.log(
                    "[SSE] <- event:",
                    evt.event || "message",
                    "id:",
                    evt.id,
                    "payload:",
                    payload
                );
                onMessage?.(payload, evt.event || "message", { id: evt.id, raw: evt.raw });
            } else if (normalized.trim() !== "") {
                console.log("[SSE] <- raw block (no data):", normalized);
            }
        };

        const connect = async () => {
            const url = joinUrl(API_BASE, "/admin/adminSSE");
            try {
                const token = getAccessToken?.();
                const resp = await fetch(url, {
                    method: "GET",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        Accept: "text/event-stream",
                    },
                    mode: "cors",
                    signal: controller.signal,
                });

                if (!resp.ok) throw new Error(`SSE HTTP ${resp.status}`);

                const ct = (resp.headers.get("content-type") || "").toLowerCase();
                if (!ct.includes("text/event-stream")) {
                    const snippet = await resp.clone().text().catch(() => "");
                    console.warn(
                        "[SSE] Non-SSE response (content-type:",
                        ct,
                        "). First 300 chars:",
                        snippet.slice(0, 300)
                    );
                    throw new Error("SSE endpoint did not return text/event-stream");
                }

                console.log("[SSE] ready");
                onOpen?.();
                reconnectAttemptRef.current = 0;

                const stream = resp.body;
                const textDecoder = new TextDecoder("utf-8");
                reader = stream.getReader();

                let buffer = "";
                while (!cancelled) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += textDecoder.decode(value, { stream: true });

                    while (true) {
                        const match = buffer.match(/^(.*?)(\r?\n\r?\n)/s);
                        if (!match) break;
                        const chunk = match[1];
                        buffer = buffer.slice(match[0].length);
                        const trimmed = chunk.trim();
                        if (trimmed) parseAndDispatch(chunk);
                    }
                }
            } catch (err) {
                if (controller.signal.aborted || cancelled) return;
                console.warn("[SSE] error:", err?.message || err);
                onError?.(err);

                const attempt = (reconnectAttemptRef.current =
                    (reconnectAttemptRef.current || 0) + 1);
                const delay = Math.min(30000, 1000 * Math.pow(2, attempt - 1));
                setTimeout(() => {
                    if (!cancelled) connect();
                }, delay);
            }
        };

        connect();

        return () => {
            cancelled = true;
            try {
                reader?.cancel();
            } catch {}
            controller.abort();
            abortRef.current = null;
            reconnectAttemptRef.current = 0;
            console.log("[SSE] connection closed");
        };
    }, [enabled, isLoading, user?.role, onOpen, onMessage, onError, allowedRoles]);
}
