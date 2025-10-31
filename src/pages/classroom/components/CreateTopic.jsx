import { useEffect, useRef, useState } from "react";
import "../style/create_topic.css";

export default function CreateTopicModal({
                                             open,
                                             onClose,
                                             onSubmit, // ({ title, semester, subject }) => Promise<void> | void
                                             initialTitle = "",
                                             submitting = false,
                                             error = "",
                                         }) {
    const [title, setTitle] = useState(initialTitle);
    const [semester, setSemester] = useState("");
    const [subject, setSubject] = useState("");

    const dialogRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
    }, [open]);

    useEffect(() => {
        if (open) {
            const id = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(id);
        }
    }, [open]);

    const onBackdrop = (e) => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        const rect = dlg.getBoundingClientRect();
        const clickedOutside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
        if (clickedOutside && !submitting) onClose?.();
    };

    // single-select behavior but with checkboxes (click again to unselect)
    const toggleSemester = (value) => {
        setSemester((prev) => (prev === value ? "" : value));
    };
    const toggleSubject = (value) => {
        setSubject((prev) => (prev === value ? "" : value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !semester || !subject || submitting) return;
        await onSubmit?.({ title: title.trim(), semester, subject });
    };

    return (
        <dialog ref={dialogRef} className="ctm-dialog" onClick={onBackdrop}>
            <form className="ctm-card" onSubmit={handleSubmit} method="dialog">
                <h3 className="ctm-title">Create New Topic</h3>

                <label className="ctm-label">
                    Title
                    <input
                        ref={inputRef}
                        type="text"
                        className="ctm-input"
                        placeholder="e.g., Artificial Intelligence Overview"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={submitting}
                        required
                        minLength={2}
                    />
                </label>

                {/* Semester row */}
                <div className="ctm-checkrow">
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

                {/* Subject row */}
                <div className="ctm-checkrow">
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={subject === "Physics"}
                            onChange={() => toggleSubject("Physics")}
                            disabled={submitting}
                        />
                        Physics
                    </label>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={subject === "Biology"}
                            onChange={() => toggleSubject("Biology")}
                            disabled={submitting}
                        />
                        Biology
                    </label>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={subject === "Chemistry"}
                            onChange={() => toggleSubject("Chemistry")}
                            disabled={submitting}
                        />
                        Chemistry
                    </label>
                </div>

                {error ? <p className="ctm-error">{error}</p> : null}

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
                        type="submit"
                        className="ctm-btn ctm-btn-primary"
                        disabled={!title.trim() || !semester || !subject || submitting}
                    >
                        {submitting ? "Creating…" : "Create"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
