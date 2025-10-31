import { useEffect, useState } from "react";
import "./sign_up_style.css";
import { Link, useNavigate } from "react-router-dom";
import StringInput from "../../shared/components/string_input";
import PrimaryButton from "../../shared/components/primary_button";
import FeatureCardsSlider from "../../shared/components/feature-cards-slider";
import app_colors from "../../shared/components/app_colors";
import AlertBanner from "../../shared/components/alert_banner";

import { isEmail, passwordMin, sanitizeText } from "../../utils/validator";
import AUTH_FEATURE_CARDS from "./cards";
import { useAuth } from "../../context/authContext";
import { setAccessToken } from "../../utils/authFetch";
import ForgotPasswordModal from "./forget_password_model";

const API_BASE = process.env.REACT_APP_API_BASE;


export default function Login() {
    useEffect(() => {
        document.title = "Login - Dr. Omar Khalid";
    }, []);

    const navigate = useNavigate();
    const { setAuthUser, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [alertState, setAlertState] = useState({
        open: false,
        message: "",
        error: true,
    });

    const [forgotOpen, setForgotOpen] = useState(false);

    const passOk = passwordMin(5);

    useEffect(() => {
        if (user) console.log("[AuthContext] user:", user);
    }, [user]);

    const onLogin = async () => {
        setShowErrors(true);
        if (!isEmail(email) || !passOk(password) || loading) return;

        const payload = {
            email: sanitizeText(email, { maxLen: 254 }),
            password: String(password ?? ""),
        };

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            });

            const raw = await res.clone().text().catch(() => "");
            let data = {};
            try {
                data = raw ? JSON.parse(raw) : {};
            } catch {}

            if (res.status === 200) {
                const token = data?.token || null;
                const nextUser = data?.data || null;

                if (token) setAccessToken(token);
                setAuthUser(nextUser);
                navigate("/classroom");
                return;
            }

            const msg =
                (typeof data?.data?.message === "string" && data.data.message) ||
                (typeof data?.message === "string" && data.message) ||
                "Login failed";
            setAlertState({ open: true, message: msg, error: true });
        } catch (e) {
            console.error("[Login] error:", e);
            setAlertState({ open: true, message: e.message, error: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={"sign_up_container"}>
            {/* top-center alert */}
            <AlertBanner
                open={alertState.open}
                message={alertState.message}
                error={alertState.error}
                onClose={() => setAlertState((p) => ({ ...p, open: false }))}
            />

            <div className="sign_up_left">
                <h1 className={"sign_up_header"}>Log in</h1>

                <div className={`sign_up_inputs ${showErrors ? "show-errors" : ""}`}>
                    <StringInput
                        title={"Email"}
                        placeholder={"student@example.com"}
                        onChange={setEmail}
                        value={email}
                        validate={isEmail}
                    />
                    <StringInput
                        title={"Password"}
                        isPassword
                        placeholder={"********"}
                        onChange={setPassword}
                        value={password}
                        validate={passOk}
                    />
                </div>

                <div className="sign_up_footer">
                    <PrimaryButton
                        label={loading ? "Logging in..." : "Log in"}
                        bgColor={app_colors.heroPrimaryButton}
                        onClick={onLogin}
                        disabled={loading}
                        className="btn-register"
                    />

                    <p className="sign_up_sure">
                        Don’t have an account? <Link to="/signup">Register</Link>
                        <span className="divider">•</span>
                        <button
                            type="button"
                            className="forgot-link"
                            onClick={() => setForgotOpen(true)}
                        >
                            Forgot password?
                        </button>
                    </p>
                </div>
            </div>

            <div className={"sign_up_right"}>
                <FeatureCardsSlider items={AUTH_FEATURE_CARDS} />
            </div>

            {/* Forgot Password modal */}
            <ForgotPasswordModal
                open={forgotOpen}
                onClose={() => setForgotOpen(false)}
                initialEmail={email}
                onSuccess={(msg) => {
                    setAlertState({ open: true, message: msg, error: false });
                }}
            />
        </div>
    );
}
