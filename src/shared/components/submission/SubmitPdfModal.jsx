// src/shared/components/submission/SubmitPdfModal.jsx
import React, { useEffect, useRef, useState } from "react";
import PdfDropzone from "./pdf_drap_drop";
import AlertBanner from "../alert_banner";

export default function SubmitPdfModal({
                                           open,
                                           onClose,
                                           itemId,            // 🔁 was assignmentId; now generic (assignmentId or quizId)
                                           type = "assignment", // "assignment" | "quiz"
                                           onSubmitted,       // callback(url) on success
                                           authFetch,         // pass your authFetch from parent
                                       }) {
    const dialogRef = useRef(null);
    const [pdfUrl, setPdfUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", error: false });

    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
        if (open) {
            setPdfUrl("");
            setSubmitting(false);
            setAlert({ open: false, message: "", error: false });
        }
    }, [open]);

    const handleBackdrop = (e) => {
        if (e.target === dialogRef.current && !submitting) onClose?.();
    };

    const handleSubmit = async () => {
        if (!pdfUrl || submitting) return;
        try {
            setSubmitting(true);
            setAlert({ open: false, message: "", error: false });

            // pick endpoint by type
            const lower = String(type || "").toLowerCase();
            const endpoint =
                lower === "quiz"
                    ? `/quiz/submitQuiz/${encodeURIComponent(itemId)}`
                    : `/assignment/submitAssignment/${encodeURIComponent(itemId)}`;

            const res = await authFetch("POST", endpoint, { answers: pdfUrl });

            if (res?.status !== "success") {
                const msg = res?.message || res?.error || "Submission failed";
                throw new Error(msg);
            }

            setAlert({ open: true, message: "✅ Submitted successfully!", error: false });
            onSubmitted?.(pdfUrl);
            onClose?.();
        } catch (e) {
            setAlert({ open: true, message: e?.message || "Submission failed", error: true });
        } finally {
            setSubmitting(false);
        }
    };

    const niceTitle = String(type).toLowerCase() === "quiz" ? "Submit Quiz" : "Submit Assignment";

    return (
        <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
            <form className="ctm-card" method="dialog" onSubmit={(e) => e.preventDefault()}>
                <h3 className="ctm-title">{niceTitle}</h3>

                <p style={{ marginBottom: 8, opacity: 0.85 }}>
                    Upload your PDF solution
                </p>

                <div style={{ marginTop: 12 }}>
                    <PdfDropzone
                        onUploadComplete={(url) => {
                            console.log("📤 Upload finished with URL:", url);
                            setPdfUrl(url);
                        }}
                    />
                    {pdfUrl ? (
                        <small style={{ color: "green" }}>
                            ✅ Uploaded! Ready to submit.
                        </small>
                    ) : (
                        <small style={{ opacity: 0.7 }}>
                            Upload a PDF to enable Submit.
                        </small>
                    )}
                </div>

                <AlertBanner
                    open={alert.open}
                    message={alert.message}
                    error={alert.error}
                    onClose={() => setAlert((a) => ({ ...a, open: false }))}
                    duration={3000}
                />

                <div className="ctm-actions" style={{ marginTop: 16 }}>
                    <button
                        type="button"
                        className="ctm-btn ctm-btn-ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="ctm-btn ctm-btn-primary"
                        onClick={handleSubmit}
                        disabled={!pdfUrl?.startsWith("http") || submitting}
                        title={!pdfUrl ? "Upload a PDF first" : "Submit"}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
