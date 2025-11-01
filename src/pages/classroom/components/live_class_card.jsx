// src/pages/classroom/components/live_class_card.jsx
import React, { useEffect, useState } from "react";
import SecondaryButton from "../../../shared/components/secondary_button";
import AlertBanner from "../../../shared/components/alert_banner";
import "../style/live_class_card_style.css";
import { useAuth } from "../../../hooks/useAuth";
import { isDoc, isAssistant } from "../../../utils/roles";
import { authFetch } from "../../../utils/authFetch";

const ZOOM_LINK = "https://zoom.us/j/4195543412";

const LiveClassCard = ({ liveClass }) => {
    const { user, isLoading } = useAuth();

    const isAdmin = !isLoading && isAssistant(user);
    const isTeacher = !isLoading && isDoc(user);
    const canControlSession = isAdmin || isTeacher;

    const [checking, setChecking] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // start/end session
    const [joinLoading, setJoinLoading] = useState(false);     // join class
    const [lastSession, setLastSession] = useState(null);      // null or { finished, sessionId, ... }
    const [alert, setAlert] = useState({ open: false, error: false, message: "" });

    // Fetch current session (for everyone now) and show banner if none
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setChecking(true);
                const res = await authFetch("GET", "/session/getLastCreatedSession");

                if (res?.status === "success" && res?.data?.lastSession) {
                    if (!mounted) return;
                    setLastSession(res.data.lastSession);
                } else {
                    if (!mounted) return;
                    setLastSession(null);
                    // 🔔 Show info banner when there is no active session
                    setAlert({
                        open: true,
                        error: false,
                        message: "No active sessions for now",
                    });
                }
            } catch {
                if (!mounted) return;
                setLastSession(null);
                // Optional: keep the same UX for network errors (silent) or show a message:
                // setAlert({ open: true, error: true, message: "Failed to check session" });
            } finally {
                if (mounted) setChecking(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // ========== SESSION ACTIONS ==========
    const handleStartSession = async () => {
        if (!canControlSession || actionLoading) return;
        try {
            setActionLoading(true);
            const res = await authFetch("POST", "/session/startSession");
            const ok =
                res?.status === "success" ||
                res?.ok === true ||
                res?.code === 200 ||
                res?.httpStatus === 200;

            if (ok) {
                setLastSession((prev) => ({
                    ...(prev || {}),
                    finished: false,
                    ...(res?.data?.session ? res.data.session : {}),
                }));
                setAlert({ open: true, error: false, message: "✅ Session started." });
            } else {
                throw new Error(res?.message || "Failed to start session");
            }
        } catch (e) {
            setAlert({ open: true, error: true, message: e?.message || "Failed to start session" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (!canControlSession || actionLoading) return;
        try {
            setActionLoading(true);
            const res = await authFetch("PATCH", "/session/endSession");
            const ok =
                res?.status === "success" ||
                res?.ok === true ||
                res?.code === 200 ||
                res?.httpStatus === 200;

            if (ok) {
                setLastSession((prev) => (prev ? { ...prev, finished: true } : null));
                setAlert({ open: true, error: false, message: "🛑 Session ended." });
            } else {
                throw new Error(res?.message || "Failed to end session");
            }
        } catch (e) {
            setAlert({ open: true, error: true, message: e?.message || "Failed to end session" });
        } finally {
            setActionLoading(false);
        }
    };

    // ========== JOIN CLASS (WAIT FOR 200, ELSE SHOW FAIL MESSAGE) ==========
    // replace your current handleJoinClass with this:
    const handleJoinClass = async () => {
        if (joinLoading) return;
        try {
            setJoinLoading(true);
            const res = await authFetch("POST", "/session/attendSession");

            // success → show success then open Zoom
            setAlert({ open: true, error: false, message: "✅ You joined the session successfully." });
            window.open(ZOOM_LINK, "_blank", "noopener,noreferrer");
        } catch (e) {
            // If backend returned 400, show friendly message
            const msg =
                e?.status === 400
                    ? "No active sessions yet"
                    : (e?.payload?.data?.message ||
                        e?.payload?.message ||
                        e?.message ||
                        "Failed to join class");

            setAlert({ open: true, error: true, message: msg });
        } finally {
            setJoinLoading(false);
        }
    };


    // ========== UI STATES ==========
    const hasActiveSession = !!lastSession && lastSession.finished === false;
    const sessionBtnLabel = hasActiveSession ? "End Session" : "Start Session";
    const sessionBtnOnClick = hasActiveSession ? handleEndSession : handleStartSession;
    const sessionBtnColor = hasActiveSession ? "#dc2626" : "#248866"; // red : green

    return (
        <section className="live-class">
            <AlertBanner
                open={alert.open}
                message={alert.message}
                error={alert.error}
                onClose={() => setAlert((a) => ({ ...a, open: false }))}
            />

            <div className="live-info">
                <h2>Join your class here</h2>
            </div>

            <img
                src="/assets/Classroom/Classroom-Image.png"
                alt="Teacher"
                className="teacher-img"
            />

            <div className="live-class-actions">
                <SecondaryButton
                    label={joinLoading ? "Joining…" : "Join Class"}
                    fontFamily="Montserrat Regular"
                    fontWeight="auto"
                    onClick={joinLoading ? undefined : handleJoinClass}
                    borderColor="#133643"
                    style={joinLoading ? { opacity: 0.7, pointerEvents: "none" } : undefined}
                />

                {canControlSession && (
                    <SecondaryButton
                        label={checking || actionLoading ? "Please wait…" : sessionBtnLabel}
                        fontFamily="Montserrat Regular"
                        fontWeight="auto"
                        onClick={checking || actionLoading ? undefined : sessionBtnOnClick}
                        borderColor={sessionBtnColor}
                        textColor="#fff"
                        fill
                        style={
                            checking || actionLoading
                                ? { opacity: 0.7, pointerEvents: "none" }
                                : undefined
                        }
                    />
                )}
            </div>
        </section>
    );
};

export default LiveClassCard;
