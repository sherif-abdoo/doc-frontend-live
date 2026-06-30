import React, { useEffect, useRef, useState } from "react";
import PdfDropzone from "./pdf_drap_drop";
import AlertBanner from "../alert_banner";

export default function MarkSubmissionModal({
  open,
  onClose,
  submissionId,
  onMarked,
  authFetch,
  mode = "mark", // "mark" | "remark"
  initialScore = null,
}) {
  const dialogRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [existingPdfUrl, setExistingPdfUrl] = useState("");
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", error: false });

  const isRemark = mode === "remark";

  // 🔥 the hosted blank PDF fallback link (replace with yours)
  const BLANK_MARKED_PDF = "https://mag.wcoomd.org/uploads/2018/05/blank.pdf";

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();

    if (open) {
      setPdfUrl("");
      setExistingPdfUrl("");
      setScore(initialScore != null ? String(initialScore) : "");
      setSubmitting(false);
      setAlert({ open: false, message: "", error: false });
    }
  }, [open, initialScore]);

  // On a re-mark, grab the current marked PDF so we can keep it when no new
  // file is uploaded (backend always overwrites `marked`, so we must re-send it).
  useEffect(() => {
    if (!open || !isRemark || submissionId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          "GET",
          `/admin/findSubmissionById/${encodeURIComponent(submissionId)}`
        );
        const current =
          res?.data?.found?.marked || res?.found?.marked || res?.data?.marked || "";
        if (!cancelled) setExistingPdfUrl(current || "");
      } catch {
        if (!cancelled) setExistingPdfUrl("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isRemark, submissionId, authFetch]);

  const handleBackdrop = (e) => {
    if (e.target === dialogRef.current && !submitting) onClose?.();
  };

  const validScore =
    Number.isFinite(Number(score)) && Number(score) >= 0 && score !== "";

  const canSubmit = validScore && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setAlert({ open: false, message: "", error: false });

      // New upload wins. On a re-mark with no new file, keep the existing PDF.
      // Otherwise (first mark, no file) fall back to the hosted blank PDF.
      const finalPdfUrl = pdfUrl || existingPdfUrl || BLANK_MARKED_PDF;

      const res = await authFetch(
        "PATCH",
        `/admin/markSubmission/${encodeURIComponent(submissionId)}`,
        {
          marked: finalPdfUrl,
          score: Number(score),
        }
      );

      if (res?.status !== "success") {
        const msg = res?.message || res?.error || "Marking failed";
        throw new Error(msg);
      }

      setAlert({ open: true, message: "✅ Mark saved!", error: false });

      onMarked?.(finalPdfUrl, score);
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
        <h3 className="ctm-title">{isRemark ? "Re-mark Submission" : "Mark Submission"}</h3>

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
          <p className="ctm-label">Marked PDF File (Optional)</p>

          <PdfDropzone
            onUploadComplete={(url) => {
              console.log("✅ PDF uploaded:", url);
              setPdfUrl(url);
            }}
          />

          {pdfUrl ? (
            <small style={{ color: "green" }}>✅ Marked file uploaded</small>
          ) : isRemark ? (
            <small style={{ opacity: 0.7 }}>
              No new file → the current marked PDF is kept unchanged.
            </small>
          ) : (
            <small style={{ opacity: 0.7 }}>
              No file uploaded → will use hosted blank PDF
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
            disabled={!canSubmit}
          >
            {submitting ? "Saving…" : isRemark ? "Re-mark" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
