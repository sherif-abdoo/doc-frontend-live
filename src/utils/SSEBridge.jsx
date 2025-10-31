// src/app/SSEBridge.jsx
import React, { useCallback, useState } from "react";
import { useAdminSSE } from "../utils/stablish_sse";
import { useAuth } from "../context/authContext";
import AppSnackBar from "../shared/components/snack_bar";

export default function SSEBridge() {
    const { user, isLoading } = useAuth();

    const [snack, setSnack] = useState({ open: false, message: "" });

    const handleOpen = useCallback(() => {
        console.log("[SSE] ready");
    }, []);

    const handleMessage = useCallback((payload, eventName, meta) => {
        console.log("[SSE][handler]", eventName, "id:", meta?.id, "payload:", payload);

        // Show snackbar when the server sends the `student_register` event
        if (eventName === "student_register") {
            setSnack({ open: true, message: "new student is waiting" });
        }
    }, []);

    const handleError = useCallback((err) => {
        console.warn("[SSE] stream error:", err?.message || err);
    }, []);

    const handleSnackClose = useCallback(() => {
        setSnack((s) => ({ ...s, open: false }));
    }, []);

    useAdminSSE({
        enabled: !!user && !isLoading,
        allowedRoles: ["assistant"], // add "admin" if needed
        onOpen: handleOpen,
        onMessage: handleMessage,
        onError: handleError,
    });

    return (
        <>
            <AppSnackBar
                open={snack.open}
                message={snack.message}
                onClose={handleSnackClose}
            />
        </>
    );
}
