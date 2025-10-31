// src/shared/components/submission/create_submission_pop_up.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { authFetch } from "../../../utils/authFetch";
import "../../../pages/classroom/style/create_topic.css";
import AlertBanner from "../alert_banner";
import PdfDropzone from "./pdf_drap_drop";

/** "YYYY-MM-DD" -> "M/D/YYYY" (no leading zeros) */
const toMDY = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const parts = yyyy_mm_dd.split("-");
    if (parts.length !== 3) return "";
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!y || !m || !d) return "";
    return `${m}/${d}/${y}`;
};

/** Accept ISO "YYYY-MM-DD" or Date string -> "YYYY-MM-DD" for <input type="date"> */
const toYYYYMMDD = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    } catch {
        return "";
    }
};

export default function CreateAssignmentModal({
                                                  open,
                                                  onClose,
                                                  onSubmit,                 // Create OR Edit callback (we decide by mode)
                                                  submitting = false,
                                                  error = "",
                                                  // NEW:
                                                  mode = "create",          // "create" | "edit"
                                                  initialData = null,       // { id, title, description, mark, semester, endDate, topicId, subject, document }
                                                  lockNonEditable = false,  // when editing: disable all except title & description
                                              }) {
    const isEdit = mode === "edit";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mark, setMark] = useState("");
    const [semester, setSemester] = useState("");
    const [endDate, setEndDate] = useState("");  // "YYYY-MM-DD"
    const [pdfUrl, setPdfUrl] = useState("");


    // topics (keep inside the modal like before)
    const [topics, setTopics] = useState([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState("");
    const [selectedTopicId, setSelectedTopicId] = useState("");

    const dialogRef = useRef(null);
    const titleRef = useRef(null);

    // open/close <dialog>
    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
    }, [open]);

    // focus + when opening, load initial data if edit; when closing, reset
    useEffect(() => {
        if (open) {
            // Prefill
            if (isEdit && initialData) {
                setTitle(initialData.title ?? "");
                setDescription(initialData.description ?? "");
                setMark(initialData.mark ?? "");
                setSemester(initialData.semester ?? "");
                setEndDate(toYYYYMMDD(initialData.endDate) || "");
                setSelectedTopicId(
                    initialData.topicId != null ? String(initialData.topicId) : ""
                );
            } else {
                setTitle("");
                setDescription("");
                setMark("");
                setSemester("");
                setEndDate("");
                // topic preselect happens after fetch
            }

            const id = setTimeout(() => titleRef.current?.focus(), 0);
            return () => clearTimeout(id);
        } else {
            setTopicsError("");
        }
    }, [open, isEdit, initialData]);

    // fetch topics when modal opens (unchanged)
    useEffect(() => {
        const fetchTopics = async () => {
            if (!open) return;
            setTopicsLoading(true);
            setTopicsError("");
            try {
                const res = await authFetch("GET", "/topic/getAllTopics");
                if (res?.status !== "success") {
                    const msg = res?.message || res?.error || "Failed to load topics";
                    throw new Error(msg);
                }
                const list = Array.isArray(res?.data?.topics) ? res.data.topics : [];
                setTopics(list);

                // Preselect: if editing and we already set topicId, keep it;
                // else choose first available
                if (list.length) {
                    setSelectedTopicId((prev) => {
                        if (prev) return prev;
                        return String(list[0].topicId);
                    });
                }
            } catch (e) {
                setTopicsError(e?.message || "Could not load topics.");
                setTopics([]);
                if (!isEdit) setSelectedTopicId("");
            } finally {
                setTopicsLoading(false);
            }
        };
        fetchTopics();
    }, [open, isEdit]);

    const markNumber = useMemo(() => {
        const n = Number(mark);
        return Number.isFinite(n) ? n : NaN;
    }, [mark]);

    const canSaveCreate =
        !!title.trim() &&
        !!semester &&
        !!selectedTopicId &&
        !!endDate &&
        Number.isFinite(markNumber) &&
        markNumber >= 0 &&
        !!pdfUrl &&
        !submitting;


    // in edit, only need title
    const canSaveEdit = !!title.trim() && !submitting;

    const canSave = isEdit ? canSaveEdit : canSaveCreate;

    const toggleSemester = (value) =>
        setSemester((prev) => (prev === value ? "" : value));

    // Backdrop click: only close if the click target IS the dialog (true backdrop)
    const handleBackdrop = (e) => {
        if (e.target === dialogRef.current && !submitting) onClose?.();
    };

    const handleSave = async () => {
        if (!canSave) return;

        if (isEdit) {
            // EDIT MODE: only return the editable fields
            const patchBody = {
                title: title.trim(),
                description: description?.trim() || "",
            };
            await onSubmit?.(patchBody);
            return;
        }

        // CREATE MODE (unchanged)
        const form = {
            title: title.trim(),
            description: description?.trim() || "",
            mark: markNumber,
            semester,
            endDateMDY: toMDY(endDate), // parent converts to endDate
            topicId: Number(selectedTopicId),
            document: pdfUrl,
        };
        await onSubmit?.(form);
    };

    // helpers for disabling non-editable fields
    const nonEditableDisabled = submitting || (isEdit && lockNonEditable);

    return (
        <>
            {error ? (
                <AlertBanner open message={error} error onClose={() => {}} duration={4000} />
            ) : null}

            <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
                <form className="ctm-card" method="dialog" onSubmit={(e) => e.preventDefault()}>
                    <h3 className="ctm-title">
                        {isEdit ? "Edit Assignment" : "Create New Assignment"}
                    </h3>

                    {/* Topic */}
                    <label className="ctm-label">
                        Topic
                        <select
                            className="ctm-input"
                            value={selectedTopicId}
                            onChange={(e) => setSelectedTopicId(e.target.value)}
                            disabled={nonEditableDisabled || topicsLoading}
                        >
                            {topicsLoading && <option value="">Loading topics…</option>}
                            {!topicsLoading && topics.length === 0 && (
                                <option value="">No topics found</option>
                            )}
                            {!topicsLoading &&
                                topics.map((t) => (
                                    <option key={t.topicId} value={String(t.topicId)}>
                                        {t.topicName}
                                    </option>
                                ))}
                        </select>
                    </label>

                    {topicsError ? (
                        <p className="ctm-error" style={{ marginTop: 6 }}>{topicsError}</p>
                    ) : null}

                    {/* Title (editable in edit mode) */}
                    <label className="ctm-label">
                        Title
                        <input
                            ref={titleRef}
                            type="text"
                            className="ctm-input"
                            placeholder="e.g., Quantum Mechanic Ass2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={submitting /* keep editable in edit */}
                            minLength={2}
                        />
                    </label>

                    {/* Description (editable in edit mode) */}
                    <label className="ctm-label">
                        Description
                        <textarea
                            className="ctm-input"
                            placeholder="Short description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={submitting /* keep editable in edit */}
                            rows={3}
                            style={{ resize: "vertical" }}
                        />
                    </label>

                    {/* Mark */}
                    <label className="ctm-label">
                        Mark
                        <input
                            type="number"
                            className="ctm-input"
                            placeholder="50"
                            value={mark}
                            onChange={(e) => setMark(e.target.value)}
                            disabled={nonEditableDisabled}
                            min={0}
                        />
                    </label>

                    {/* Semester */}
                    <div className="ctm-checkrow" style={{ marginTop: 12 }}>
                        <span style={{ fontSize: 14, marginRight: 6 }}>Semester:</span>
                        <label className="ctm-check">
                            <input
                                type="checkbox"
                                checked={semester === "June"}
                                onChange={() => !nonEditableDisabled && toggleSemester("June")}
                                disabled={nonEditableDisabled}
                            />
                            June
                        </label>
                        <label className="ctm-check">
                            <input
                                type="checkbox"
                                checked={semester === "November"}
                                onChange={() => !nonEditableDisabled && toggleSemester("November")}
                                disabled={nonEditableDisabled}
                            />
                            November
                        </label>
                    </div>

                    {/* End Date */}
                    <label className="ctm-label" style={{ marginTop: 12 }}>
                        End date
                        <input
                            type="date"
                            className="ctm-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={nonEditableDisabled}
                        />
                    </label>

                    {/* Drag-n-drop */}
                    <div className="ctm-label" style={{ marginTop: 12 }}>
                        <PdfDropzone onUploadComplete={(url) => setPdfUrl(url)} />
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
                            title={!canSave ? "Fill all required fields" : isEdit ? "Save changes" : "Create assignment"}
                        >
                            {submitting ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save" : "Create")}
                        </button>
                    </div>
                </form>
            </dialog>
        </>
    );
}
