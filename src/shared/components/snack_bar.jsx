// src/shared/components/AppSnackBar.jsx
import React from "react";
import Snackbar from "@mui/material/Snackbar";

export default function AppSnackBar({
                                        open,
                                        message,
                                        onClose,
                                        autoHideDuration = 4000,
                                    }) {
    return (
        <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={!!open}
            onClose={onClose}
            message={message}
            key="topcenter"
            autoHideDuration={autoHideDuration}
            sx={{
                "& .MuiSnackbarContent-root": {
                    backgroundColor: "#2a5ab3",   // white background
                    color: "#fff",             // dark text for contrast
                    border: "1px solid #e5e7eb",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
                    fontWeight: 600,
                    fontSize: "1.4rem",        // make text bigger
                    padding: "16px 32px",      // add more padding
                    minWidth: "350px",         // make the snackbar wider
                    borderRadius: "12px",      // smooth rounded corners
                    textAlign: "center",
                },
            }}
        />
    );
}
