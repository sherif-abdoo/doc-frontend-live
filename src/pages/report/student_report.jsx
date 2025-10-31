// student_report.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./report.css";

import StatCard from "./components/stat_card";
import WeeklyLogRow from "./components/weekly_log_row";
import StatCardSkeleton from "./components/stat_card_skeleton";
import WeeklyLogRowSkeleton from "./components/weekly_log_row_skeleton";
import { authFetch } from "../../utils/authFetch";

const StudentReport = ({ topicId }) => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    // Fetch student's weekly report for selected topic
    useEffect(() => {
        if (!topicId) return;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch("GET", `student/getMyWeeklyReport/${encodeURIComponent(topicId)}`);
                setReport(res?.data ?? null);
            } catch (e) {
                console.error(e);
                setError(typeof e?.message === "string" && e.message.trim() ? e.message : "Failed to load report");
            } finally {
                setLoading(false);
            }
        })();
    }, [topicId]);

    // Helpers
    const toDate = (iso) => {
        try {
            if (!iso) return "N/A";
            const d = new Date(iso);
            return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
        } catch {
            return "N/A";
        }
    };
    const pretty = (v) => (v === 0 ? 0 : v ? String(v) : "N/A");

    // Stats (includes quiz score/max on first card)
    const stats = useMemo(() => {
        if (!report) return [];

        const totalAssignments = Number(report.totalAssignments ?? 0);
        const submittedAssignments = Number(report.submittedAssignments ?? 0);
        const totalSessions = Number(report.totalSessions ?? 0);
        const sessionsAttended = Number(report.sessionsAttended ?? 0);

        const quizGrade = report.quizGrade ?? report.quizData?.grade ?? "N/A";
        const qScore = report?.quizData?.score;
        const qMax = report?.quizData?.maxPoints;
        const quizScoreText =
            qScore == null && qMax == null ? "N/A" : `${pretty(qScore)}${qMax != null ? `/${qMax}` : ""}`;

        const quizStatus = String(report?.quizData?.status || "").toLowerCase();
        const quizExists = !!report?.quizData;
        const quizDone =
            quizExists &&
            (quizStatus === "marked" ||
                quizStatus.startsWith("submitted") ||
                quizStatus === "pending review");

        return [
            { title: "Quiz Grade:", grade: quizGrade, scoreText: quizScoreText },
            {
                title: "Homework Submissions:",
                value: submittedAssignments,
                maxValue: totalAssignments,
                showProgress: true,
            },
            {
                title: "Attended Classes:",
                value: sessionsAttended,
                maxValue: totalSessions,
                showProgress: true,
            },
            {
                title: "Quizzes Completed:",
                value: quizDone ? 1 : 0,
                maxValue: quizExists ? 1 : 0,
                showProgress: true,
            },
        ];
    }, [report]);

    // Week's log
    // student_report.jsx (snippet - keep the rest of your file the same)
    const weeklyLog = useMemo(() => {
        if (!report) return [];

        const sessionRows = (Array.isArray(report.sessions) ? report.sessions : []).map((s) => ({
            date: toDate(s?.date),
            type: "Session",
            action: s?.status ? String(s.status) : "Session",
            sessionId: s?.sessionId ?? "N/A",
        }));

        // ✅ Quiz row — now includes submissionId from backend
        const quizRow = report.quizData
            ? [
                {
                    date: "N/A",
                    type: "Quiz",
                    action: `Quiz: ${report.quizData?.title ?? "Untitled"}`,
                    qStatus: pretty(report.quizData?.status)?.toLowerCase(),
                    qGrade: pretty(report.quizData?.grade),
                    qScoreText: (() => {
                        const s = report.quizData?.score;
                        const m = report.quizData?.maxPoints;
                        if (s == null && m == null) return "N/A";
                        return `${pretty(s)}${m != null ? `/${m}` : ""}`;
                    })(),
                    qFeedback: report.quizData?.feedback ? String(report.quizData.feedback) : null,
                    submissionId:
                        report.quizData?.submissionId &&
                        String(report.quizData.submissionId).toLowerCase() !== "n/a"
                            ? report.quizData.submissionId
                            : null, // ✅ use the backend's submissionId safely
                },
            ]
            : [];

        // ✅ Assignments (materials)
        const assignmentRows = (Array.isArray(report.materials) ? report.materials : []).map((m) => {
            const isMarked = String(m?.status || "").trim().toLowerCase() === "marked";
            const rawId = m?.submissionId;
            const hasValidId = rawId != null && String(rawId).toLowerCase() !== "n/a";

            return {
                date: toDate(m?.date),
                type: "Assignment",
                action: `Assignment: ${m?.title ?? "Untitled"}`,
                score: pretty(m?.score),
                status: pretty(m?.status),
                feedback: pretty(m?.feedback),
                submissionId: isMarked && hasValidId ? rawId : null,
            };
        });

        return [...sessionRows, ...quizRow, ...assignmentRows];
    }, [report]);



    return (
        <>
            <div className="stats-grid">
                {loading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <StatCardSkeleton key={index} showProgress={index > 0} />
                    ))
                    : stats.map((stat, index) => <StatCard key={index} {...stat} />)}
            </div>

            <div className="weekly-log">
                <h2 className="log-title">Week&apos;s Log:</h2>
                <div className="log-table">
                    <WeeklyLogRow date="Date" action="Action" description="Description" isHeader />
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => <WeeklyLogRowSkeleton key={index} />)
                    ) : error ? (
                        <WeeklyLogRow date="—" action="Error" description={error} />
                    ) : weeklyLog.length === 0 ? (
                        <WeeklyLogRow date="—" action="No items" description="No activity yet." />
                    ) : (
                        weeklyLog.map((entry, idx) => (
                            <WeeklyLogRow
                                key={idx}
                                date={entry.date}
                                action={entry.action}
                                type={entry.type}       // "Session" | "Assignment" | "Quiz"
                                sessionId={entry.sessionId}
                                score={entry.score}
                                status={entry.status}
                                feedback={entry.feedback}
                                description={entry.description}
                                // ✅ quiz fields for multi-line
                                qStatus={entry.qStatus}
                                qGrade={entry.qGrade}
                                qScoreText={entry.qScoreText}
                                qFeedback={entry.qFeedback}
                                // ✅ pass it down so Show Answers can navigate correctly
                                submissionId={entry.submissionId}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentReport;
