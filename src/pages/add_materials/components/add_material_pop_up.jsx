import { useEffect, useRef, useState } from "react";
import { authFetch } from "../../../utils/authFetch";
import "../../classroom/style/create_topic.css";
import PdfDropzone from "../../../shared/components/submission/pdf_drap_drop";

export default function CreateMaterialModal({
                                              open,
                                              onClose,
                                              onSubmit,
                                              submitting = false,
                                              setSubmitting,
                                              setAlertState,
                                              mode = "create",
                                              initialData,
                                            }) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState("");

  const [pdfUrl, setPdfUrl] = useState(""); // ✅ holds uploaded file URL
  const [linkUrl, setLinkUrl] = useState(""); // ✅ holds the URL input

  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  // open/close
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // reset/prefill
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => titleRef.current?.focus(), 0);
      if (isEdit && initialData) {
        setTitle(initialData.title ?? "");
        setDescription(initialData.description ?? "");
        setSelectedTopicId(
            initialData.topicId != null ? String(initialData.topicId) : ""
        );
        setPdfUrl(initialData.document ?? "");
      } else {
        setTitle("");
        setDescription("");
        setSelectedTopicId("");
        setPdfUrl("");
        setLinkUrl("");
      }
      setTopicsError("");
      return () => clearTimeout(id);
    }
  }, [open, isEdit, initialData]);

  // fetch topics when opened
  useEffect(() => {
    const fetchTopics = async () => {
      if (!open) return;
      setTopicsLoading(true);
      setTopicsError("");
      try {
        const res = await authFetch("GET", "/topic/getAllTopics");
        if (res?.status !== "success") {
          throw new Error(res?.message || "Failed to load topics");
        }
        const list = Array.isArray(res?.data?.topics) ? res.data.topics : [];
        setTopics(list);
        if (!selectedTopicId) {
          if (isEdit && initialData?.topicId != null) {
            setSelectedTopicId(String(initialData.topicId));
          } else if (list.length) {
            setSelectedTopicId(String(list[0].topicId));
          }
        }
      } catch (e) {
        setTopicsError(e?.message || "Could not load topics.");
        setTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, [open, selectedTopicId, isEdit, initialData]);

  const canSave =
      !!title.trim() &&
      !!selectedTopicId &&
      ((isEdit && pdfUrl?.startsWith("http")) || linkUrl) && // ✅ Check either pdfUrl or linkUrl
      !submitting;

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

  const handleSave = async () => {
    if (!canSave) return;
    setSubmitting?.(true);
    try {
      const tObj = topics.find((t) => String(t.topicId) === String(selectedTopicId));
      const topicName = tObj?.topicName ?? initialData?.topicName ?? "Default";

      await onSubmit?.({
        title: title.trim(),
        description: (description ?? "").trim(),
        topicId: Number(selectedTopicId),
        topicName,
        document: pdfUrl || linkUrl, // use whichever URL is available
        materialId: initialData?.materialId,
      });

      onClose?.();
    } catch (e) {
      setAlertState?.({
        open: true,
        error: true,
        message:
            e?.message ||
            (isEdit ? "Could not update material" : "Could not create material"),
      });
    } finally {
      setSubmitting?.(false);
    }
  };

  return (
      <dialog ref={dialogRef} className="ctm-dialog" onClick={handleBackdrop}>
        {/* ✅ stop click bubbling from closing the dialog */}
        <form
            className="ctm-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => e.preventDefault()}
        >
          <h3 className="ctm-title">
            {isEdit ? "Edit Material" : "Create New Material"}
          </h3>

          <label className="ctm-label">
            Topic
            <select
                className="ctm-input"
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={submitting || topicsLoading}
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
          {topicsError && <p className="ctm-error">{topicsError}</p>}

          <label className="ctm-label">
            Title
            <input
                ref={titleRef}
                type="text"
                className="ctm-input"
                placeholder="e.g., Basics of Chemistry"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                minLength={2}
            />
          </label>

          <label className="ctm-label">
            Description
            <input
                type="text"
                className="ctm-input"
                placeholder="Description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
            />
          </label>

          {/* ✅ Show PDF uploader or Link input field only for Create mode */}
          {!isEdit && (
              <div className="ctm-label" style={{ marginTop: 12 }}>
                <div>
                  {/* PDF Upload */}
                  <label>Document (PDF)</label>
                  <PdfDropzone
                      disabled={submitting || !!linkUrl} // Disable PDF drop if link URL exists
                      onUploadComplete={(url) => {
                        console.log("📤 Uploaded material PDF:", url);
                        setPdfUrl(url);
                        setLinkUrl(""); // Ensure PDF URL clears the link input
                      }}
                  />
                  {pdfUrl ? (
                      <small style={{ color: "green" }}>✅ File uploaded successfully</small>
                  ) : (
                      <small style={{ opacity: 0.7 }}>Upload a PDF to enable Create</small>
                  )}
                </div>

                <div>
                  <label htmlFor="linkUrl">Or Upload via Link:</label>
                  <input
                      type="url"
                      className="ctm-input"
                      id="linkUrl"
                      placeholder="Paste the link here"
                      value={linkUrl}
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        setPdfUrl(""); // Ensure the link clears the PDF URL
                      }}
                      disabled={submitting || !!pdfUrl} // Disable link input if PDF is uploaded
                  />
                  {linkUrl && (
                      <small style={{ color: "green" }}>✅ Link uploaded successfully</small>
                  )}
                </div>
              </div>
          )}

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
            >
              {submitting
                  ? isEdit
                      ? "Saving…"
                      : "Creating…"
                  : isEdit
                      ? "Save"
                      : "Create"}
            </button>
          </div>
        </form>
      </dialog>
  );
}
