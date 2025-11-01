// src/shared/components/submission/submission_details.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../../style/submission/submission_details.css";
import SubmitButton from "./submit_button";
import PDFViewer from "./pdf_viewer";
import SubmittedMessage from "./submitted_message";
import { authFetch } from "../../../utils/authFetch";
import AlertBanner from "../alert_banner";
import Layout from "../layout";
import SubmitPdfModal from "./SubmitPdfModal";

// If you still normalize R2 URLs via read worker:
const READ_WORKER_BASE = "https://r2-read.dok-uploads.workers.dev";
function toEmbedPdfUrl(rawUrl) {
    if (!rawUrl) return null;
    try {
        const u = new URL(rawUrl);
        if (u.hostname.endsWith(".workers.dev") && u.pathname.startsWith("/get")) return rawUrl;
        if (u.hostname.endsWith(".r2.dev")) {
            const key = u.pathname.replace(/^\/+/, "");
            return `${READ_WORKER_BASE}/get?key=${encodeURIComponent(key)}`;
        }
        if (u.hostname.includes("drive.google.com")) {
            const fileIdMatch = rawUrl.match(/\/file\/d\/([^/]+)/);
            const idFromOpen = u.searchParams.get("id");
            const fileId = fileIdMatch?.[1] || idFromOpen;
            if (fileId) return `https://drive.google.com/file/d/${fileId}/preview`;
        }
    } catch {}
    return rawUrl;
}

const SubmissionDetails = ({ type }) => {
    const { id: routeId } = useParams(); // assignmentId | quizId | materialId | submissionId (when type="answer")

    const [loading, setLoading] = useState(true);

    // for assignment/quiz/material payloads
    const [assignData, setAssignData] = useState(null);
    const [subject, setSubject] = useState(null);

    // for answer view payload
    const [answerData, setAnswerData] = useState(null);

    const [alert, setAlert] = useState({ open: false, message: "", error: true });
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const t = String(type || "").toLowerCase();
    const isAnswer = t === "answer";

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            setAlert((a) => ({ ...a, open: false }));

            try {
                if (isAnswer) {
                    // 🔵 Answer view → fetch marked submission by submissionId
                    const res = await authFetch(
                        "GET",
                        `/student/showMarkedSubmission/${encodeURIComponent(routeId)}`
                    );

                    if (res?.status !== "success") {
                        throw new Error(res?.message || "Failed to load marked submission");
                    }

                    if (!mounted) return;
                    setAnswerData(res?.data || null);
                    setAssignData(null);
                    setSubject(null);
                } else {
                    // 🟢 Legacy flows (assignment/quiz/material)
                    const res = await authFetch(
                        "GET",
                        `${t}/get_${t}_by_id/${encodeURIComponent(routeId)}`
                    );

                    if (res?.status !== "success") {
                        setAlert({
                            open: true,
                            message: res?.message || "Failed to load",
                            error: true,
                        });
                    }

                    if (!mounted) return;
                    const data = res?.data || {};
                    let content = null;
                    if (t === "assignment") content = data.assignData;
                    else if (t === "quiz") content = data.quizData;
                    else if (t === "material") content = data.found;
                    else content = data.assignData || data.quizData || data.found || null;

                    setAssignData(content || null);
                    setSubject(res?.data?.subject || null);
                    setAnswerData(null);
                }
            } catch (e) {
                if (!mounted) return;
                setAlert({
                    open: true,
                    message: e?.message || (isAnswer ? "Failed to load marked submission" : "Failed to load"),
                    error: true,
                });
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [routeId, t, isAnswer]);

    // Title
    useEffect(() => {
        if (isAnswer) {
            document.title = "Marked Submission";
        } else if (assignData?.title) {
            document.title = assignData.title;
        }
    }, [assignData, isAnswer]);

    // Decide which PDF to show
    const pdfUrl = useMemo(() => {
        if (isAnswer) return toEmbedPdfUrl(answerData?.markedPdf);
        return toEmbedPdfUrl(assignData?.document);
    }, [isAnswer, answerData, assignData]);

    // ✅ For assignment/quiz pages: respect boolean "submitted", fallback to string state/status
    const submissionState = String(assignData?.state || assignData?.status || "").toLowerCase();
    const isSubmitted =
        assignData?.submitted === true || submissionState === "submitted";

    const handleAssignmentSubmitOpen = () => setShowSubmitModal(true);
    const handleQuizSubmitOpen = () => setShowSubmitModal(true);

    const handleSubmitted = () => {
        // optimistic UI update for both assignment and quiz
        setAssignData((prev) => ({
            ...(prev || {}),
            submitted: true,
            state: "submitted",
        }));
        setAlert({ open: true, message: "✅ Submission saved!", error: false });
    };

    const openMeeting = () => {
        window.open("https://zoom.us/j/4195543412", "_blank", "noopener,noreferrer");
    };

    return (
        <Layout>
            <div className="details-container">
                <main className="main">
                    <AlertBanner
                        message={alert.message}
                        open={alert.open}
                        onClose={() => setAlert((a) => ({ ...a, open: false }))}
                        error={alert.error}
                    />

                    {loading ? (
                        <div className="not-found">
                            <h2>Loading…</h2>
                            <p>Please wait while we fetch the {type}.</p>
                        </div>
                    ) : isAnswer ? (
                        // 🔵 ANSWER VIEW
                        !answerData ? (
                            <div className="not-found">
                                <h2>Marked submission not found</h2>
                                <p style={{ opacity: 0.8 }}>
                                    {alert.open ? "An error occurred above." : "We couldn't load this item."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2 className="assignment-title">Marked Submission</h2>

                                <div style={{ marginBottom: 12, opacity: 0.9 }}>
                                    <small>
                                        <strong>Marked by:</strong>{" "}
                                        <span>{answerData.assistant ?? "—"}</span>{" "}
                                        • <strong>Score:</strong>{" "}
                                        <span>{answerData.score ?? "—"}</span>{" "}
                                        {answerData.markedAt ? (
                                            <>
                                                • <strong>Marked at:</strong>{" "}
                                                <span>
                          {new Date(answerData.markedAt).toLocaleString("en-GB", {
                              hour12: false,
                          })}
                        </span>
                                            </>
                                        ) : null}
                                    </small>
                                </div>

                                <PDFViewer pdfUrl={pdfUrl} />
                            </>
                        )
                    ) : !assignData ? (
                        // 🟢 LEGACY VIEW (assignment/quiz/material) not found
                        <div className="not-found">
                            <h2>{type || "Item"} not found</h2>
                            <p style={{ opacity: 0.8 }}>
                                {alert.open ? "An error occurred above." : "We couldn't load this item."}
                            </p>
                        </div>
                    ) : (
                        // 🟢 LEGACY VIEW CONTENT
                        <>
                            <h2 className="assignment-title">{assignData.title}</h2>

                            {t !== "material" && (
                                <div style={{ marginBottom: 12, opacity: 0.85 }}>
                                    <small>
                                        Subject: <strong>{subject || "—"}</strong> • Semester:{" "}
                                        <strong>{assignData.semester || "—"}</strong> • Mark:{" "}
                                        <strong>{assignData.mark ?? "—"}</strong>
                                    </small>
                                </div>
                            )}

                            {t === "quiz" ? (
                                // QUIZ: Show centered larger buttons
                                isSubmitted ? (
                                    <SubmittedMessage type={type} />
                                ) : (
                                    <div className="quiz-buttons-container">
                                        <button
                                            type="button"
                                            className="quiz-btn"
                                            onClick={openMeeting}
                                            title="Join Meeting"
                                        >
                                            Join Meeting
                                        </button>
                                        <button
                                            type="button"
                                            className="quiz-btn"
                                            onClick={handleQuizSubmitOpen}
                                            title="Submit your quiz PDF"
                                        >
                                            Submit Solution
                                        </button>
                                    </div>
                                )
                            ) : (
                                <>
                                    <PDFViewer pdfUrl={pdfUrl} />

                                    {t !== "material" &&
                                        (isSubmitted ? (
                                            <SubmittedMessage type={type} />
                                        ) : (
                                            t === "assignment" && (
                                                <SubmitButton type={type} onClick={handleAssignmentSubmitOpen} />
                                            )
                                        ))}
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Modal for submission (assignment or quiz) */}
            {!isAnswer && (
                <SubmitPdfModal
                    open={showSubmitModal}
                    onClose={() => setShowSubmitModal(false)}
                    itemId={routeId}                  // assignmentId or quizId
                    type={t}                          // "assignment" | "quiz"
                    onSubmitted={handleSubmitted}
                    authFetch={authFetch}
                />
            )}
        </Layout>
    );
};

export default SubmissionDetails;