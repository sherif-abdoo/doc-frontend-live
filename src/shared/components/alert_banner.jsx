// src/components/alerts/AlertError.jsx
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import "../style/alert_style.css";

export default function AlertBanner({
    message,
    open,                  // optional controlled flag; if omitted, uses !!message
    onClose,               // optional callback to clear message in parent
    duration = 5000,       // auto-hide after 5s
    severity = "error",    // fallback severity if `error` isn't provided
    error,                 // <-- boolean: true => error, false => success
}) {
    const computedOpen = open ?? !!message;
    const [visible, setVisible] = useState(computedOpen);

    useEffect(() => {
        setVisible(computedOpen);
        if (!computedOpen) return;

        const t = setTimeout(() => {
            if (onClose) onClose();
            else setVisible(false);
        }, duration);

        return () => clearTimeout(t);
    }, [computedOpen, duration, onClose]);

    if (!visible) return null;

    // decide severity: boolean `error` wins; otherwise use provided `severity`
    const computedSeverity =
        typeof error === "boolean" ? (error ? "error" : "success") : severity;

    return (
        <div className="alert-fixed-top">
            <Alert variant="filled" severity={computedSeverity}
                sx={{
                    width: "100%", 
                    fontSize: "25px",       // change font size here
                    fontFamily: "Montserrat Regular",
                    "& .MuiAlert-icon": {
                        fontSize: "40px", // ⬅️ increase icon size here
                    },
                }}>
                {message}
            </Alert>
        </div>
    );
}
