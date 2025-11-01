import { useEffect, useMemo, useState } from "react";
import "../style/string_input.css";

/**
 * Props:
 * - title: string
 * - placeholder?: string
 * - isPassword?: boolean
 * - validate?: (value: string) => boolean
 * - value?: string            // OPTIONAL: controlled value from parent
 * - onChange?: (v: string) => void
 * - name?: string
 * - autoComplete?: string     // defaults to "off"
 * - disabled?: boolean
 */
export default function StringInput({
                                        title,
                                        placeholder = "",
                                        isPassword = false,
                                        validate = () => false,
                                        value,
                                        onChange,
                                        name,
                                        autoComplete = "off",
                                        disabled = false,
                                        ...rest
                                    }) {
    const [inner, setInner] = useState(value ?? "");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (value !== undefined) setInner(value);
    }, [value]);

    const current = value !== undefined ? value : inner;

    const valid = useMemo(() => {
        if (!current) return false;
        try {
            return !!validate(current);
        } catch {
            return false;
        }
    }, [current, validate]);

    const handleChange = (e) => {
        const next = e.target.value;
        if (value === undefined) setInner(next);
        onChange?.(next);
    };

    return (
        <div className="si-wrap">
            {title ? <label className="si-label">{title.toUpperCase()}</label> : null}

            <div className={`si-input-row ${valid ? "valid" : ""}`} style={{ position: "relative" }}>
                <input
                    className="si-input"
                    type={isPassword && !showPassword ? "password" : "text"}
                    name={name}
                    placeholder={placeholder}
                    value={current}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    {...rest}
                />

                {/* ✅ show/hide password toggle (only if isPassword) */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            opacity: 0.75,
                        }}
                    >
                        {showPassword ? (
                            /* 👁️ HIDE ICON */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 viewBox="0 0 24 24">
                                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.16 21.16 0 0 1 5.06-7.94"/>
                                <path d="M1 1l22 22"/>
                                <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/>
                            </svg>
                        ) : (
                            /* 👁️ SHOW ICON */
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                 viewBox="0 0 24 24">
                                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        )}
                    </button>
                )}

                {/* ✅ cyan check */}
                <svg className="si-check" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </div>
    );
}
