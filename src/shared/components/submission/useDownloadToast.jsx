import { useState } from "react";

export default function useDownloadToast() {
    const [msg, setMsg] = useState("");

    const show = (text, ms = 2400) => {
        setMsg(text);
        window.setTimeout(() => setMsg(""), ms);
    };

    const Toast = () =>
        msg ? (
            <div
                style={{
                    position: "fixed",
                    left: "50%",
                    bottom: 20,
                    transform: "translateX(-50%)",
                    background: "#111",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: 8,
                    zIndex: 9999,
                    boxShadow: "0 6px 20px rgba(0,0,0,.25)",
                    font: "14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                }}
            >
                {msg}
            </div>
        ) : null;

    return { show, Toast };
}
