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
                                        value,                 // controlled (optional)
                                        onChange,              // controlled callback (optional)
                                        name,
                                        autoComplete = "off",
                                        disabled = false,
                                        ...rest
                                    }) {
    // internal state only used when "value" is undefined (uncontrolled mode)
    const [inner, setInner] = useState(value ?? "");

    // keep internal state in sync if parent switches from uncontrolled -> controlled or updates value
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
        // update internal state only when uncontrolled
        if (value === undefined) setInner(next);
        // always notify parent if provided
        onChange?.(next);
    };

    return (
        <div className="si-wrap">
            {title ? <label className="si-label">{title.toUpperCase()}</label> : null}

            <div className={`si-input-row ${valid ? "valid" : ""}`}>
                <input
                    className="si-input"
                    type={isPassword ? "password" : "text"}
                    name={name}
                    placeholder={placeholder}
                    value={current}
                    onChange={handleChange}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    {...rest}
                />

                {/* cyan check when valid */}
                <svg className="si-check" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </div>
    );
}
