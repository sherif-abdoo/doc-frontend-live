import React, { useEffect, useRef, useState } from "react";
import PdfDropzone from "./pdf_drap_drop";
import AlertBanner from "../alert_banner";

export default function MarkSubmissionModal({
                                                open,
                                                onClose,
                                                submissionId,   // ✅ now uses submissionId instead of assignmentId
                                                onMarked,       // callback(pdfUrl, score) on success
                                                authFetch,      // pass your authFetch from parent
                                            }) {
    const dialogRef = useRef(null);
    const [pdfUrl, setPdfUrl] = useState("");
    const [score, setScore] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", error: false });

    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
        if (open) {
            setPdfUrl("");
            setScore("");
            setSubmitting(false);
            setAlert({ open: false, message: "", error: false });
        }
    }, [open]);

    const handleBackdrop = (e) => {
        if (e.target === dialogRef.current && !submitting) onClose?.();
    };

    const validScore =
        Number.isFinite(Number(score)) && Number(score) >= 0 && score !== "";

    const handleSubmit = async () => {
        if (!pdfUrl || !validScore || submitting) return;

        try {
            setSubmitting(true);
            setAlert({ open: false, message: "", error: false });

            // ✅ use submissionId instead of assignmentId
            const res = await authFetch(
                "PATCH",
                `/admin/markSubmission/${encodeURIComponent(submissionId)}`,
                {
                    marked: pdfUrl,
                    score: Number(score),
                }
            );

            if (res?.status !== "success") {
                const msg = res?.message || res?.error || "Marking failed";
                throw new Error(msg);
            }

            setAlert({ open: true, message: "✅ Mark saved successfully!", error: false });
            onMarked?.(pdfUrl, score);
            onClose?.();
        } catch (e) {
            setAlert({
                open: true,
                message: e?.message || "Failed to save mark",
                error: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
            <form className="ctm-card" method="dialog" onSubmit={(e) => e.preventDefault()}>
                <h3 className="ctm-title">Mark Submission</h3>

                <label className="ctm-label">
                    Score
                    <input
                        type="number"
                        className="ctm-input"
                        placeholder="e.g., 30"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        min={0}
                        disabled={submitting}
                    />
                </label>

                <div style={{ marginTop: 12 }}>
                    <p className="ctm-label">Marked PDF File</p>
                    <PdfDropzone
                        onUploadComplete={(url) => {
                            console.log("✅ Marked PDF uploaded:", url);
                            setPdfUrl(url);
                        }}
                    />
                    {pdfUrl ? (
                        <small style={{ color: "green" }}>
                            ✅ Uploaded marked file successfully
                        </small>
                    ) : (
                        <small style={{ opacity: 0.7 }}>
                            Upload the marked PDF before saving
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
                        disabled={!validScore || !pdfUrl?.startsWith("http") || submitting}
                        title={
                            !validScore
                                ? "Enter a valid non-negative score"
                                : !pdfUrl
                                    ? "Upload a marked PDF first"
                                    : "Save mark"
                        }
                    >
                        {submitting ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
