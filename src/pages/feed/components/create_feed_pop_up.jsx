import { useEffect, useRef, useState } from "react";
import "../../classroom/style/create_topic.css"
export default function CreateFeedModal({
                                            open,
                                            onClose,
                                            onSubmit,
                                            submitting = false,
                                            error = "",
                                        }) {
    const [text, setText] = useState("");
    const [semester, setSemester] = useState(""); // "June" | "November"

    const dialogRef = useRef(null);
    const textRef = useRef(null);

    // open/close <dialog>
    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
    }, [open]);

    // reset on open + focus textarea
    useEffect(() => {
        if (open) {
            setText("");
            setSemester("");
            const id = setTimeout(() => textRef.current?.focus(), 0);
            return () => clearTimeout(id);
        }
    }, [open]);

    const canSave = !!text.trim() && !!semester && !submitting;

    const handleBackdrop = (e) => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        const rect = dlg.getBoundingClientRect();
        const outside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
        if (outside && !submitting) onClose?.();
    };

    const toggleSemester = (val) => setSemester((prev) => (prev === val ? "" : val));

    const handleSave = async () => {
        if (!canSave) return;
        await onSubmit?.({ text: text.trim(), semester });
    };

    return (
        <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
            <form className="ctm-card" method="dialog" onSubmit={(e) => e.preventDefault()}>
                <h3 className="ctm-title">Create Feed Announcement</h3>

                <label className="ctm-label">
                    Message
                    <textarea
                        ref={textRef}
                        className="ctm-input"
                        placeholder="Type the announcement…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={submitting}
                        rows={4}
                        style={{ resize: "vertical" }}
                    />
                </label>

                <div className="ctm-checkrow" style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 14, marginRight: 6 }}>Semester:</span>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={semester === "June"}
                            onChange={() => toggleSemester("June")}
                            disabled={submitting}
                        />
                        June
                    </label>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={semester === "November"}
                            onChange={() => toggleSemester("November")}
                            disabled={submitting}
                        />
                        November
                    </label>
                </div>

                <div className="ctm-actions">
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
                        disabled={!canSave}
                        onClick={handleSave}
                        title={!canSave ? "Fill message and select semester" : "Create feed"}
                    >
                        {submitting ? "Creating…" : "Create"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
