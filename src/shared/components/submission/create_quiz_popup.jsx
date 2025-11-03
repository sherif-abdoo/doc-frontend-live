// src/shared/components/submission/create_quiz_pop_up.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { authFetch } from "../../../utils/authFetch";
import "../../../pages/classroom/style/create_topic.css";

// "YYYY-MM-DD" -> "M/D/YYYY"
const toMDY = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const [y, m, d] = yyyy_mm_dd.split("-").map((x) => parseInt(x, 10));
    if (!y || !m || !d) return "";
    return `${m}/${d}/${y}`;
};

// various -> "YYYY-MM-DD" (for <input type="date">)
const toISODate = (value) => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }
    if (typeof value === "string" && value.includes("/")) {
        const [m, d, y] = value.split("/").map((x) => parseInt(x, 10));
        if (m && d && y) {
            const dt = new Date(y, m - 1, d);
            return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
        }
    }
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
};

const PLACEHOLDER_PDF = "https://www.africau.edu/images/default/sample.pdf";

export default function CreateQuizModal({
                                            open,
                                            onClose,
                                            onSubmit,            // create: ({ title, mark, semester, dateMDY, durationInMin, topicId, quizPdf, subject })
                                                                 // edit:   ({ title })
                                            submitting = false,
                                            error = "",
                                            // edit props
                                            mode = "create",     // "create" | "edit"
                                            initialData,         // object with fields to prefill in edit mode
                                            lockNonEditable = true, // when edit, lock everything except title
                                        }) {
    const isEdit = mode === "edit";

    const [title, setTitle] = useState("");
    const [mark, setMark] = useState("");
    const [semester, setSemester] = useState(""); // June | November
    const [date, setDate] = useState("");         // "YYYY-MM-DD"
    const [durationInMin, setDurationInMin] = useState(""); // number string

    const [topics, setTopics] = useState([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState("");
    const [selectedTopicId, setSelectedTopicId] = useState("");

    const [isDragOver, setIsDragOver] = useState(false);

    const dialogRef = useRef(null);
    const titleRef = useRef(null);

    // open/close <dialog>
    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
    }, [open]);

    // focus + reset on close; prefill on open in edit mode
    useEffect(() => {
        if (open) {
            const id = setTimeout(() => titleRef.current?.focus(), 0);
            // prefill if edit
            if (isEdit && initialData) {
                setTitle(initialData.title ?? "");
                setMark(initialData.mark ?? "");
                setSemester(initialData.semester ?? "");
                setDate(toISODate(initialData.endDate || initialData.startDate || initialData.createdAt) || "");
                setDurationInMin(
                    initialData.durationInMin != null ? String(initialData.durationInMin) : ""
                );
                setSelectedTopicId(
                    initialData.topicId != null ? String(initialData.topicId) : ""
                );
            }
            return () => clearTimeout(id);
        } else {
            // reset when closed
            setTitle("");
            setMark("");
            setSemester("");
            setDate("");
            setDurationInMin("");
            setTopicsError("");
            // keep selectedTopicId as-is for next open
        }
    }, [open, isEdit, initialData]);

    // fetch topics when modal opens
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
                // If not editing, or editing without preset topic, preselect first
                if (!selectedTopicId && list.length) {
                    setSelectedTopicId(String(list[0].topicId));
                }
            } catch (e) {
                setTopicsError(e?.message || "Could not load topics.");
                setTopics([]);
            } finally {
                setTopicsLoading(false);
            }
        };

        fetchTopics();
    }, [open, selectedTopicId]);

    const markNumber = useMemo(() => {
        const n = Number(mark);
        return Number.isFinite(n) ? n : NaN;
    }, [mark]);

    const durationNumber = useMemo(() => {
        const n = Number(durationInMin);
        return Number.isFinite(n) ? n : NaN;
    }, [durationInMin]);

    const canSaveCreate =
        !!title.trim() &&
        !!semester &&
        !!selectedTopicId &&
        !!date &&
        Number.isFinite(markNumber) &&
        markNumber >= 0 &&
        Number.isFinite(durationNumber) &&
        durationNumber > 0 &&
        !submitting;

    // In edit mode only title is required & editable
    const canSaveEdit = !!title.trim() && !submitting;

    const canSave = isEdit ? canSaveEdit : canSaveCreate;

    const toggleSemester = (value) =>
        setSemester((prev) => (prev === value ? "" : value));

    const handleBackdrop = (e) => {
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

    const prevent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const onDragEnter = (e) => { prevent(e); setIsDragOver(true); };
    const onDragLeave = (e) => { prevent(e); setIsDragOver(false); };
    const onDrop = (e) => { prevent(e); setIsDragOver(false); /* no-op */ };

    const handleSave = async () => {
        if (!canSave) return;

        if (isEdit) {
            // Only send the editable field (title)
            await onSubmit?.({
                title: title.trim(),
            });
            return;
        }

        // CREATE
        const chosen = topics.find((t) => String(t.topicId) === String(selectedTopicId));
        const subject = chosen?.subject;

        const form = {
            title: title.trim(),
            mark: markNumber,
            semester,
            dateMDY: toMDY(date),           // backend wants M/D/YYYY
            durationInMin: durationNumber,
            topicId: Number(selectedTopicId),
            quizPdf: PLACEHOLDER_PDF,
            subject,                        // used for local render color
        };

        await onSubmit?.(form);
    };

    const disableWhenEdit = (defaultDisabled = false) =>
        isEdit && lockNonEditable ? true : defaultDisabled;

    return (
        <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
            <form className="ctm-card" method="dialog" onSubmit={(e) => e.preventDefault()}>
                <h3 className="ctm-title">{isEdit ? "Edit Quiz" : "Create New Quiz"}</h3>

                {/* Topic */}
                <label className="ctm-label">
                    Topic
                    <select
                        className="ctm-input"
                        value={selectedTopicId}
                        onChange={(e) => setSelectedTopicId(e.target.value)}
                        disabled={disableWhenEdit(submitting || topicsLoading)}
                    >
                        {topicsLoading && <option value="">Loading topics…</option>}
                        {!topicsLoading && topics.length === 0 && <option value="">No topics found</option>}
                        {!topicsLoading &&
                            topics.map((t) => (
                                <option key={t.topicId} value={String(t.topicId)}>
                                    {t.topicName}
                                </option>
                            ))}
                    </select>
                </label>

                {topicsError ? <p className="ctm-error" style={{ marginTop: 6 }}>{topicsError}</p> : null}

                {/* Title (only editable field in edit mode) */}
                <label className="ctm-label">
                    Title
                    <input
                        ref={titleRef}
                        type="text"
                        className="ctm-input"
                        placeholder="e.g., Biology Quiz 1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={submitting /* remains editable in edit mode */}
                        minLength={2}
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
                        disabled={disableWhenEdit(submitting)}
                        min={0}
                    />
                </label>

                {/* Semester */}
                <div className="ctm-checkrow" style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 14, marginRight: 6 }}>Semester:</span>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={semester === "Jun"}
                            onChange={() => toggleSemester("Jun")}
                            disabled={disableWhenEdit(submitting)}
                        />
                        June
                    </label>
                    <label className="ctm-check">
                        <input
                            type="checkbox"
                            checked={semester === "Nov"}
                            onChange={() => toggleSemester("Nov")}
                            disabled={disableWhenEdit(submitting)}
                        />
                        November
                    </label>
                </div>

                {/* Date */}
                <label className="ctm-label" style={{ marginTop: 12 }}>
                    Date
                    <input
                        type="date"
                        className="ctm-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={disableWhenEdit(submitting)}
                    />
                </label>

                {/* Duration */}
                <label className="ctm-label">
                    Duration (minutes)
                    <input
                        type="number"
                        className="ctm-input"
                        placeholder="60"
                        value={durationInMin}
                        onChange={(e) => setDurationInMin(e.target.value)}
                        disabled={disableWhenEdit(submitting)}
                        min={1}
                    />
                </label>

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
                        title={
                            !canSave
                                ? isEdit
                                    ? "Enter a title"
                                    : "Fill all required fields"
                                : isEdit
                                    ? "Save changes"
                                    : "Create quiz"
                        }
                    >
                        {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save" : "Create"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
