import { useEffect, useRef, useState } from "react";
import "./forget_password.css";

// ✅ use env var instead of hardcoded URL
const API_BASE = process.env.REACT_APP_API_BASE;

export default function ForgotPasswordModal({
                                                open,
                                                onClose,
                                                initialEmail = "",
                                                onSuccess, // (msg) => void
                                            }) {
    const dlgRef = useRef(null);

    // steps: "email" -> "otp" -> "reset" -> "done"
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState(initialEmail || "");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    // countdown (5 minutes = 300s)
    const [secondsLeft, setSecondsLeft] = useState(300);
    const [timerActive, setTimerActive] = useState(false);

    // open/close <dialog>
    useEffect(() => {
        const dlg = dlgRef.current;
        if (!dlg) return;
        if (open && !dlg.open) {
            dlg.showModal();
            // reset state on open
            setStep("email");
            setErr("");
            setOtp("");
            setPassword("");
            setConfirm("");
            setSecondsLeft(300);
            setTimerActive(false);
            setEmail(initialEmail || "");
        }
        if (!open && dlg.open) dlg.close();
    }, [open, initialEmail]);

    // countdown
    useEffect(() => {
        if (!timerActive) return;
        if (step !== "otp") return;
        if (secondsLeft <= 0) {
            setTimerActive(false);
            return;
        }
        const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(id);
    }, [timerActive, secondsLeft, step]);

    const formatMMSS = (s) => {
        const m = Math.floor(s / 60);
        const ss = s % 60;
        return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    };

    const isEmail = (val) =>
        typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

    const requestOtp = async () => {
        setErr("");
        if (!isEmail(email)) {
            setErr("Enter a valid email.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/forgetPassword`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(json?.message || "Could not send OTP.");
            }

            // Move to OTP step, start 5-min timer
            setStep("otp");
            setSecondsLeft(300);
            setTimerActive(true);
        } catch (e) {
            setErr(e.message || "Could not send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setErr("");
        if (!otp?.trim()) {
            setErr("Enter the OTP.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(json?.message || "Invalid or expired OTP.");
            }

            // proceed to reset
            setStep("reset");
            setTimerActive(false);
        } catch (e) {
            setErr(e.message || "OTP verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        setErr("");
        if (!password || password.length < 6) {
            setErr("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setErr("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/login/resetPassword/${encodeURIComponent(email.trim())}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({ email: email.trim(), password }),
                }
            );
            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(json?.message || "Could not reset password.");
            }

            setStep("done");
            onSuccess?.("Password updated. You can now log in.");
        } catch (e) {
            setErr(e.message || "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        // allow re-request only when timer expired or user wants a new OTP
        setSecondsLeft(300);
        setTimerActive(false);
        await requestOtp();
    };

    const closeIfAllowed = () => {
        if (!loading) onClose?.();
    };

    return (
        <dialog ref={dlgRef} className="fp-dialog" onClick={closeIfAllowed}>
            <form
                className="fp-card"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => e.preventDefault()}
            >
                <h3 className="fp-title">Forgot Password</h3>

                {step === "email" && (
                    <>
                        <p className="fp-sub">
                            Enter your email and we’ll send you a 6-digit code.
                        </p>
                        <label className="fp-label">
                            Email
                            <input
                                className="fp-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </label>

                        {err && <div className="fp-error">{err}</div>}

                        <div className="fp-actions">
                            <button
                                type="button"
                                className="fp-btn fp-ghost"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="fp-btn fp-primary"
                                onClick={requestOtp}
                                disabled={loading}
                            >
                                {loading ? "Sending…" : "Send OTP"}
                            </button>
                        </div>
                    </>
                )}

                {step === "otp" && (
                    <>
                        <p className="fp-sub">
                            We sent a code to <strong>{email}</strong>. It expires in{" "}
                            <strong className="fp-count">{formatMMSS(secondsLeft)}</strong>.
                        </p>

                        <label className="fp-label">
                            OTP
                            <input
                                className="fp-input"
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={loading}
                                maxLength={6}
                            />
                        </label>

                        {err && <div className="fp-error">{err}</div>}

                        <div className="fp-row">
                            <button
                                type="button"
                                className="fp-link"
                                onClick={resendOtp}
                                disabled={loading}
                                title="Resend a new OTP"
                            >
                                Resend code
                            </button>
                            <span className="fp-count">{formatMMSS(secondsLeft)}</span>
                        </div>

                        <div className="fp-actions">
                            <button
                                type="button"
                                className="fp-btn fp-ghost"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="fp-btn fp-primary"
                                onClick={verifyOtp}
                                disabled={loading}
                            >
                                {loading ? "Verifying…" : "Verify"}
                            </button>
                        </div>
                    </>
                )}

                {step === "reset" && (
                    <>
                        <p className="fp-sub">
                            Create your new password for <strong>{email}</strong>.
                        </p>

                        <label className="fp-label">
                            New Password
                            <input
                                className="fp-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </label>

                        <label className="fp-label">
                            Confirm Password
                            <input
                                className="fp-input"
                                type="password"
                                placeholder="••••••••"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                disabled={loading}
                            />
                        </label>

                        {err && <div className="fp-error">{err}</div>}

                        <div className="fp-actions">
                            <button
                                type="button"
                                className="fp-btn fp-ghost"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="fp-btn fp-primary"
                                onClick={resetPassword}
                                disabled={loading}
                            >
                                {loading ? "Saving…" : "Save Password"}
                            </button>
                        </div>
                    </>
                )}

                {step === "done" && (
                    <>
                        <div className="fp-success">
                            ✅ Password updated successfully!
                        </div>
                        <div className="fp-actions">
                            <button
                                type="button"
                                className="fp-btn fp-primary"
                                onClick={onClose}
                            >
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </form>
        </dialog>
    );
}
