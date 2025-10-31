// src/pages/quiz/Quiz.jsx
import appColors from "../../shared/components/app_colors";
import Layout from "../../shared/components/layout";
import React, { useState, useEffect } from "react";
import SubmissionList from "../../shared/components/submission/submission_list";
import { authFetch } from "../../utils/authFetch";
import AlertBanner from "../../shared/components/alert_banner";
import "../homework/homework.css";

// helper -> "YYYY-MM-DD"
const toISODate = (value) => {
    if (!value) return null;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    if (typeof value === "string" && value.includes("/")) {
        const [m, d, y] = value.split("/").map((x) => parseInt(x, 10));
        if (m && d && y) {
            const dt = new Date(y, m - 1, d);
            return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
        }
    }
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
};

const Quiz = () => {
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [creatingQuiz, setCreatingQuiz] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", error: false });

    useEffect(() => {
        document.title = "Quiz - Dr. Omar Khalid";

        const loadQuizzes = async () => {
            setLoading(true);
            try {
                const res = await authFetch("GET", "/quiz/getAllQuizzes");
                const raw = Array.isArray(res?.data?.quizzes) ? res.data.quizzes : [];
                const normalized = raw.map((q) => ({
                    id: q.id ?? q.quizId ?? q._id,
                    title: q.title ?? "Untitled Quiz",
                    description: q.description ?? "",
                    mark: q.mark ?? null,
                    semester: q.semester ?? null,

                    // SubmissionCard expects 'endDate' -> map startDate/createdAt
                    endDate: toISODate(q.startDate) ?? toISODate(q.createdAt),

                    topicId: q.topicId ?? null,
                    document: "",

                    subject: q.subject ?? undefined,

                    // ✅ reflect backend boolean to UI string
                    state: q.submitted ? "submitted" : "unsubmitted",

                    durationInMin: q.durationInMin ?? null,

                    // Keep the raw boolean too (optional, for robustness)
                    submitted: !!q.submitted,
                }));
                setQuizzes(normalized);
                console.log(normalized);
            } catch (err) {
                console.error("[Quiz] loadQuizzes error:", err);
                setQuizzes([]);
                setAlert({ open: true, message: err?.message || "Failed to load quizzes", error: true });
            } finally {
                setLoading(false);
            }
        };

        loadQuizzes();
    }, []);

    // Create quiz — SubmissionList will show success/error AlertBanner and do local prepend
    const handleCreateQuiz = async (form) => {
        setCreatingQuiz(true);
        try {
            // form: { title, mark, semester, dateMDY, durationInMin, topicId, quizPdf, subject }
            const payload = {
                mark: form.mark,
                title: form.title,
                quizPdf: form.quizPdf,
                date: form.dateMDY, // backend expects M/D/YYYY
                semester: form.semester,
                durationInMin: form.durationInMin,
                topicId: form.topicId,
            };
            const res = await authFetch("POST", "/quiz/createQuiz", payload);
            return res; // SubmissionList expects res?.data?.id
        } catch (e) {
            return { status: "error", message: e?.message || "Failed to create quiz" };
        } finally {
            setCreatingQuiz(false);
        }
    };

    const notSubmittedCount = quizzes.filter((q) => {
        const status = String(q.state || q.status || "").toLowerCase();
        return status === "unsubmitted" || status === "not submitted";
    }).length;

    return (
        <Layout bgColor={appColors.chemCard}>
            <div className="screen">
                <main className="main-content">
                    <AlertBanner
                        open={alert.open}
                        message={alert.message}
                        error={alert.error}
                        onClose={() => setAlert((p) => ({ ...p, open: false }))}
                    />
                    <h2 className="section-title">
                        {loading
                            ? "Loading quizzes..."
                            : notSubmittedCount > 0
                                ? `You have ${notSubmittedCount} quiz${notSubmittedCount > 1 ? "zes" : ""} not submitted. Let's get started!`
                                : "All quizzes submitted! 🎉"}
                    </h2>

                    <SubmissionList
                        submissions={quizzes}
                        type="Quiz"
                        loading={loading}
                        onCreateSubmission={handleCreateQuiz}
                        creatingSubmission={creatingQuiz}
                    />
                </main>
            </div>
        </Layout>
    );
};

export default Quiz;
