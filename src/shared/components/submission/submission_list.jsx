// src/shared/components/submission/submission_list.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SubmissionCard from "./submission_card";
import SubmissionCardSkeleton from "./submission_card_skeleton";
import CreateSubmissionCard from "./create_submission_card";
import FilterDropdown from "../filter_dropdown";
import { useAuth } from "../../../hooks/useAuth";
import { isAssistant, isDoc } from "../../../utils/roles";
import { authFetch } from "../../../utils/authFetch";
import AlertBanner from "../alert_banner";
import AreYouSureModal from "../are_you_sure";
import CreateAssignmentModal from "./create_submission_pop_up";
import CreateQuizModal from "./create_quiz_popup";
import "../../../pages/classroom/style/create_topic.css";
import MarkSubmissionModal from "./markSubmissionModal";
import appColors from "../app_colors";

const redirection = {
    Assignment: "/homework",
    Quiz: "/quiz",
};

const SUBJECTS = ["Biology", "Chemistry", "Physics"];
const STATES = ["submitted", "unsubmitted", "missing"];

// M/D/YYYY -> YYYY-MM-DD
const mdyToISODate = (mdy) => {
    if (!mdy || typeof mdy !== "string") return null;
    const parts = mdy.split("/");
    if (parts.length !== 3) return null;
    const m = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!m || !d || !y) return null;
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
};

const SubmissionList = ({
                            submissions,
                            type,
                            loading = false,
                            onCreateSubmission = null,
                            creatingSubmission = false,
                        }) => {
    const { user, isLoading: authLoading } = useAuth();
    const role = user?.role ?? null;

    const isAdmin = String(user?.role || "").toLowerCase() === "assistant";

    const normalize = (arr) =>
        (arr || []).map((s) => {
            const hasStringState = typeof s.state === "string" && s.state.length > 0;
            const normalizedState = hasStringState
                ? s.state
                : (typeof s.submitted === "boolean"
                ? s.submitted
                    ? "submitted"
                    : "unsubmitted"
                : s.state) || "unsubmitted";

            return { ...s, state: String(normalizedState).toLowerCase() };
        });

    const [localSubs, setLocalSubs] = useState(() => normalize(submissions));
    useEffect(() => {
        setLocalSubs(normalize(submissions));
    }, [submissions]);

    const [subjectFilter, setSubjectFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");

    const [alertState, setAlertState] = useState({
        open: false,
        message: "",
        error: false,
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const [adminView, setAdminView] = useState(false);
    const [adminSubs, setAdminSubs] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState("");

    const [markModalOpen, setMarkModalOpen] = useState(false);
    const [markRow, setMarkRow] = useState(null);

    const [viewPdfLoadingId, setViewPdfLoadingId] = useState(null);

    const SUBJECT_OPTIONS = useMemo(
        () =>
            [{ label: "All subjects", value: "all" }].concat(
                SUBJECTS.map((s) => ({ label: s, value: s.toLowerCase() }))
            ),
        []
    );

    const STATES_OPTIONS = useMemo(
        () =>
            [{ label: "All states", value: "all" }].concat(
                STATES.map((s) => ({ label: s[0].toUpperCase() + s.slice(1), value: s }))
            ),
        []
    );

    const filteredSubmissions = useMemo(() => {
        return localSubs.filter((s) => {
            const bySubject =
                subjectFilter === "all" ||
                (s.subject && String(s.subject).toLowerCase() === subjectFilter);
            const byState =
                stateFilter === "all" ||
                (s.state && String(s.state).toLowerCase() === stateFilter);
            return bySubject && byState;
        });
    }, [localSubs, subjectFilter, stateFilter]);

    const canCreate = !!user && (isAssistant(user) || isDoc(user));
    const canManage = canCreate;

    const handleCreateSubmission = async (form) => {
        if (!onCreateSubmission) return;
        const result = await onCreateSubmission(form);
        const newId = result?.data?.id ?? result?.id;

        if (newId == null) {
            setAlertState({
                open: true,
                message: `Failed to create ${type.toLowerCase()}`,
                error: true,
            });
            return;
        }

        let newItem;
        if (type === "Quiz") {
            const isoDate = mdyToISODate(form.dateMDY) ?? form.dateMDY;
            newItem = {
                id: newId,
                title: form.title,
                description: "",
                mark: form.mark,
                semester: form.semester,
                endDate: isoDate,
                topicId: form.topicId,
                document: form.quizPdf,
                durationInMin: form.durationInMin,
                subject: form.subject || undefined,
                state: "unsubmitted",
            };
        } else {
            const isoEndDate = mdyToISODate(form.endDateMDY) ?? form.endDateMDY;
            newItem = {
                id: newId,
                title: form.title,
                description: form.description,
                mark: form.mark,
                semester: form.semester,
                endDate: isoEndDate,
                topicId: form.topicId,
                document: form.document,
                subject: form.subject || undefined,
                state: "unsubmitted",
            };
        }

        setLocalSubs((prev) => [newItem, ...prev]);
        setAlertState({ open: true, message: `${type} created`, error: false });
    };

    const requestDelete = (submission) => {
        setPendingDelete(submission);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        const id = pendingDelete.id;

        const endpoint =
            type === "Quiz"
                ? `/quiz/deleteQuiz/${id}`
                : `/assignment/deleteAssignment/${id}`;

        try {
            await authFetch("DELETE", endpoint);
            setLocalSubs((prev) => prev.filter((s) => s.id !== id));
            setAlertState({ open: true, message: `${type} deleted`, error: false });
        } catch (e) {
            setAlertState({
                open: true,
                message: e?.message || `Failed to delete ${type.toLowerCase()}`,
                error: true,
            });
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
            setPendingDelete(null);
        }
    };

    const requestEdit = (submission) => {
        setEditingItem(submission);
        setEditOpen(true);
    };

    const submitEdit = async ({ title, description }) => {
        if (!editingItem) return;
        setSavingEdit(true);
        try {
            if (type === "Quiz") {
                await authFetch("PATCH", `/quiz/modifyQuiz/${editingItem.id}`, {
                    title,
                    description,
                });
            } else {
                await authFetch(
                    "PATCH",
                    `/assignment/modifyAssignment/${editingItem.id}`,
                    { title, description }
                );
            }
            setLocalSubs((prev) =>
                prev.map((s) => (s.id === editingItem.id ? { ...s, title, description } : s))
            );
            setAlertState({ open: true, message: `${type} updated`, error: false });
            setEditOpen(false);
            setEditingItem(null);
        } catch (e) {
            setAlertState({
                open: true,
                message: e?.message || `Failed to update ${type.toLowerCase()}`,
                error: true,
            });
        } finally {
            setSavingEdit(false);
        }
    };

    const loadAdminSubs = useCallback(async () => {
        setAdminLoading(true);
        setAdminError("");
        try {
            const res = await authFetch("GET", "/admin/showUnmarkedSubmissions");
            if (res?.status !== "success") {
                throw new Error(res?.message || "Failed to load unmarked submissions");
            }
            const list = Array.isArray(res?.data?.submissions) ? res.data.submissions : [];
            const mapped = list.map((s, idx) => ({
                rowId: s.id ?? idx,
                submissionId: s.id ?? null,
                type: String(s.type || "").toLowerCase(),
                subject: s.subject || undefined,
                studentName: s.studentName || "Unknown",
                studentGroup: s.studentGroup || "",
                submittedAt: s.submittedAt,
                title:
                    s.assignmentTitle ||
                    s.quizTitle ||
                    (s.type ? `${s.type} #${s.id ?? idx}` : `Submission #${idx + 1}`),
                targetId: s.assignmentId ?? s.quizId ?? null,
            }));
            setAdminSubs(mapped);
            setAdminView(true);
        } catch (e) {
            setAdminError(e?.message || "Failed to load unmarked submissions");
            setAdminSubs([]);
            setAdminView(true);
        } finally {
            setAdminLoading(false);
        }
    }, []);

    const leaveAdminView = () => {
        setAdminView(false);
        setAdminError("");
        setAdminSubs([]);
    };

    const formatDateTime = (val) => {
        if (!val) return "—";
        const d = new Date(val);
        return Number.isNaN(d.getTime())
            ? String(val)
            : d.toLocaleString("en-CA", { hour12: false });
    };

    const openMarkModal = (row) => {
        const assignmentId = row?.targetId ?? null;
        if (!assignmentId) {
            setAlertState({
                open: true,
                message: "Missing assignment id for marking",
                error: true,
            });
            return;
        }
        setMarkRow(row);
        setMarkModalOpen(true);
    };

    const handleMarkedSuccess = () => {
        const removedId = markRow?.submissionId;
        if (removedId == null) return;

        setAdminSubs((prev) => prev.filter((s) => s.submissionId !== removedId));
        setMarkModalOpen(false);
        setMarkRow(null);

        setAlertState({
            open: true,
            error: false,
            message: "✅ Submission marked and removed from the list.",
        });
    };

    const handleViewPdf = async (row) => {
        const subId = row?.submissionId;
        if (subId == null) {
            setAlertState({ open: true, error: true, message: "Missing submission id" });
            return;
        }
        try {
            setViewPdfLoadingId(subId);
            const res = await authFetch(
                "GET",
                `/admin/findSubmissionById/${encodeURIComponent(subId)}`
            );
            const url =
                res?.data?.found?.answers ||
                res?.found?.answers ||
                res?.data?.answers ||
                null;

            if (url) {
                window.open(url, "_blank", "noopener,noreferrer");
            } else {
                setAlertState({
                    open: true,
                    error: true,
                    message: "No PDF URL found for this submission.",
                });
            }
        } catch (e) {
            const msg =
                e?.payload?.data?.message ||
                e?.payload?.message ||
                e?.message ||
                "Failed to fetch submission";
            setAlertState({ open: true, error: true, message: msg });
        } finally {
            setViewPdfLoadingId(null);
        }
    };

    if (loading) {
        return (
            <>
                <div
                    className="submissions-filter-bar"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        margin: "14px 0 10px",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div className="filters" style={{ display: "flex", gap: 10 }}>
                        <FilterDropdown label="Subject" options={SUBJECT_OPTIONS} value="all" disabled />
                        <FilterDropdown label="State" options={STATES_OPTIONS} value="all" disabled />
                    </div>
                    <div className="filter-meta" style={{ opacity: 0.85 }}>Loading…</div>
                </div>

                <div className="submissions-list">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <SubmissionCardSkeleton key={index} />
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <AlertBanner
                open={alertState.open || !!adminError}
                message={adminError || alertState.message}
                error={alertState.error || !!adminError}
                onClose={() => {
                    if (adminError) setAdminError("");
                    setAlertState((p) => ({ ...p, open: false }));
                }}
            />

            <AreYouSureModal
                open={confirmOpen}
                message={`Delete "${pendingDelete?.title ?? `this ${type.toLowerCase()}`}"?`}
                onConfirm={confirmDelete}
                onClose={() => {
                    if (!deleting) {
                        setConfirmOpen(false);
                        setPendingDelete(null);
                    }
                }}
                submitting={deleting}
                confirmLabel={deleting ? "Deleting…" : "Sure"}
                cancelLabel="No"
            />

            {type === "Quiz" ? (
                <CreateQuizModal
                    open={editOpen}
                    onClose={() => {
                        if (!savingEdit) {
                            setEditOpen(false);
                            setEditingItem(null);
                        }
                    }}
                    onSubmit={submitEdit}
                    submitting={savingEdit}
                    mode="edit"
                    initialData={editingItem || undefined}
                    lockNonEditable
                />
            ) : (
                <CreateAssignmentModal
                    open={editOpen}
                    onClose={() => {
                        if (!savingEdit) {
                            setEditOpen(false);
                            setEditingItem(null);
                        }
                    }}
                    onSubmit={submitEdit}
                    submitting={savingEdit}
                    mode="edit"
                    initialData={editingItem || undefined}
                    lockNonEditable
                />
            )}

            <div
                className="submissions-filter-bar"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "14px 0 10px",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div className="filters" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <FilterDropdown
                        label="Subject"
                        options={SUBJECT_OPTIONS}
                        value={subjectFilter}
                        onChange={setSubjectFilter}
                        disabled={adminView}
                    />
                    <FilterDropdown
                        label="State"
                        options={STATES_OPTIONS}
                        value={stateFilter}
                        onChange={setStateFilter}
                        disabled={adminView}
                    />
                </div>

                {!authLoading && canCreate && (
                    <div style={{ display: "flex", gap: 8 }}>
                        {!adminView ? (
                            <button
                                type="button"
                                onClick={loadAdminSubs}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 10,
                                    border: "1px solid #dcdcdc",
                                    background: "#111827",
                                    color: "#fff",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                                disabled={adminLoading}
                                title="Show unmarked submissions"
                            >
                                {adminLoading ? "Loading…" : "Show submissions"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={leaveAdminView}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 10,
                                    border: "1px solid #dcdcdc",
                                    background: "transparent",
                                    color: "#111827",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                                title={`Back to ${type}`}
                            >
                                Back to {type}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="submissions-list">
                {adminView ? (
                    adminLoading ? (
                        <>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <SubmissionCardSkeleton key={`admin-skel-${index}`} />
                            ))}
                        </>
                    ) : adminSubs.length === 0 ? (
                        <div className="empty-topic-grid">
                            <img
                                src="/assets/Classroom/notfound.png"
                                alt="No unmarked submissions"
                                className="empty-topic-image"
                            />
                            <p>No unmarked submissions found</p>
                        </div>
                    ) : (
                        adminSubs.map((s) => {
                            const opening = viewPdfLoadingId === s.submissionId;
                            const canView = s.submissionId != null;
                            return (
                                <div
                                    key={s.rowId}
                                    className="submission-card"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "14px 16px",
                                        borderRadius: 12,
                                        border: "1px solid #e6e6e6",
                                        background:
                                            s.type?.toLowerCase() === "assignment"
                                                ? appColors.chemCard
                                                : s.type?.toLowerCase() === "quiz"
                                                ? appColors.physCard
                                                : "#fff",
                                        marginBottom: 10,
                                        gap: 14,
                                    }}
                                >
                                    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.2 }}>
                                            {s.title}{" "}
                                            <span style={{ opacity: 0.6, fontWeight: 600, fontSize: 14 }}>
                                                ({s.type})
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                display: "grid",
                                                gap: 6,
                                                fontSize: 16,
                                                lineHeight: 1.3,
                                                opacity: 0.95,
                                            }}
                                        >
                                            <div><strong>Student:</strong> {s.studentName}</div>
                                            {s.studentGroup ? <div><strong>Group:</strong> {s.studentGroup}</div> : null}
                                            {s.subject ? <div><strong>Subject:</strong> {s.subject}</div> : null}
                                        </div>
                                    </div>

                                    <div style={{ textAlign: "right", minWidth: 220, display: "grid", gap: 10 }}>
                                        <div style={{ fontSize: 15 }}>
                                            <strong>Submitted:</strong> {formatDateTime(s.submittedAt)}
                                        </div>
                                        {!authLoading && isAdmin && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openMarkModal(s)}
                                                    style={{
                                                        padding: "8px 12px",
                                                        borderRadius: 10,
                                                        border: "1px solid #dcdcdc",
                                                        background: "#111827",
                                                        color: "#fff",
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        width: 140,
                                                        justifySelf: "end",
                                                    }}
                                                    title="Mark this submission"
                                                >
                                                    Mark
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={opening ? undefined : () => handleViewPdf(s)}
                                                    disabled={!canView || opening}
                                                    style={{
                                                        padding: "8px 12px",
                                                        borderRadius: 10,
                                                        border: "1px solid #dcdcdc",
                                                        background: "#111827",
                                                        color: "#fff",
                                                        fontWeight: 600,
                                                        cursor: opening ? "default" : "pointer",
                                                        width: 140,
                                                        justifySelf: "end",
                                                        opacity: !canView || opening ? 0.7 : 1,
                                                    }}
                                                    title={canView ? "View submission" : "No submission id"}
                                                >
                                                    {opening ? "Opening…" : "View Pdf"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    <>
                        {!authLoading && canCreate && (
                            <CreateSubmissionCard
                                type={type}
                                onSubmit={handleCreateSubmission}
                                loading={creatingSubmission}
                            />
                        )}

                        {/* ✅ Empty state when no submissions at all */}
                        {localSubs.length === 0 ? (
                            <div className="empty-topic-grid">
                                <img
                                    src="/assets/Classroom/notfound.png"
                                    alt={`No ${type === "Quiz" ? "quizzes" : type.toLowerCase() + "s"} found`}
                                    className="empty-topic-image"
                                />
                                <p>Looks like there are no {type === "Quiz" ? "quizzes" : type.toLowerCase() + "s"} yet</p>
                            </div>
                        ) : filteredSubmissions.length === 0 ? (
                            <p style={{ opacity: 0.7, marginTop: 12 }}>
                                No {type === "Quiz" ? "quizzes" : type.toLowerCase() + "s"} match your filters.
                            </p>
                        ) : (
                            filteredSubmissions.map((submission) => (
                                <Link
                                    key={submission.id}
                                    to={`${redirection[type] ?? "/"}${redirection[type] ? `/${submission.id}` : ""}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <SubmissionCard
                                        submission={submission}
                                        type={type}
                                        role={role}
                                        canManage={canManage}
                                        onEdit={(sub) => requestEdit(sub)}
                                        onDelete={(sub) => requestDelete(sub)}
                                    />
                                </Link>
                            ))
                        )}
                    </>
                )}
            </div>

            <MarkSubmissionModal
                open={markModalOpen}
                onClose={() => setMarkModalOpen(false)}
                submissionId={markRow?.submissionId}
                authFetch={authFetch}
                onMarked={handleMarkedSuccess}
            />
        </>
    );
};

export default SubmissionList;