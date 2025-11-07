import { useEffect, useRef, useState } from "react";
import "../style/create_topic.css";

export default function CreateTopicModal({
  open,
  onClose,
  onSubmit, // ({ title, semester, subject }) => Promise
  mode = "create", // ← NEW
  initialData = null, // { title, semester, subject } ← NEW
  submitting = false,
  error = "",
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [semester, setSemester] = useState(initialData?.semester || "");
  const [subject, setSubject] = useState(initialData?.subject || "");

  const dialogRef = useRef(null);
  const inputRef = useRef(null);

  // open / close dialog state
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // focus input on open
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  // when initialData changes (edit), reset fields
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSemester(initialData.semester || "");
      setSubject(initialData.subject || "");
    }
  }, [initialData]);

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

  const toggleSemester = (value) => setSemester((prev) => (prev === value ? "" : value));
  const toggleSubject = (value) => setSubject((prev) => (prev === value ? "" : value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !semester || !subject || submitting) return;
    await onSubmit?.({ title: title.trim(), semester, subject });
  };

  const isEdit = mode === "edit";

  return (
    <dialog ref={dialogRef} className="ctm-dialog" onClick={onBackdrop}>
      <form className="ctm-card" onSubmit={handleSubmit} method="dialog">
        <h3 className="ctm-title">
          {isEdit ? "Edit Topic" : "Create New Topic"}
        </h3>

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
              checked={semester === "Jun"}
              onChange={() => toggleSemester("Jun")}
              disabled={submitting}
            />
            June
          </label>
          <label className="ctm-check">
            <input
              type="checkbox"
              checked={semester === "Nov"}
              onChange={() => toggleSemester("Nov")}
              disabled={submitting}
            />
            November
          </label>
        </div>

        {/* Subject row */}
        <div className="ctm-checkrow">
          {["Physics", "Biology", "Chemistry"].map((s) => (
            <label key={s} className="ctm-check">
              <input
                type="checkbox"
                checked={subject === s}
                onChange={() => toggleSubject(s)}
                disabled={submitting}
              />
              {s}
            </label>
          ))}
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
            {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
