// assistant_report.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./report.css";
import { authFetch, getAccessToken } from "../../utils/authFetch";
import StudentTableRow from "./components/student_table_row";
import WeeklyLogRowSkeleton from "./components/weekly_log_row_skeleton";

const AssistantReport = ({ topicId }) => {
    const [loading, setLoading] = useState(true);
    const [assistantReport, setAssistantReport] = useState(null);
    const [error, setError] = useState("");
    const [copiedAll, setCopiedAll] = useState(false);
    const [userGroup, setUserGroup] = useState(null);

    // Decode JWT token to get user group
    useEffect(() => {
        try {
            const token = getAccessToken();
            if (token) {
                // Decode JWT token (format: header.payload.signature)
                const payload = token.split('.')[1];
                if (payload) {
                    const decoded = JSON.parse(atob(payload));
                    const group = decoded?.group;
                    setUserGroup(group);
                }
            }
        } catch (e) {
            console.error("Failed to decode token:", e);
            setUserGroup(null);
        }
    }, []);

    useEffect(() => {
        if (!topicId) return;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const res = await authFetch("GET", `admin/createReport/${encodeURIComponent(topicId)}`);
                setAssistantReport(res || null);
            } catch (e) {
                console.error(e);
                setError(typeof e?.message === "string" && e.message.trim() ? e.message : "Failed to load report");
            } finally {
                setLoading(false);
            }
        })();
    }, [topicId]);

    const pretty = (v) => {
        if (v === 0) return 0;
        if (v === "missing" || v === null || v === undefined || v === "") return "N/A";
        return String(v);
    };

    const cap = (s) => (typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : pretty(s));

    // Check if group is a single letter
    const showAttendance = useMemo(() => {
        return typeof userGroup === "string" && userGroup.length === 1;
    }, [userGroup]);

    const assignmentCount = useMemo(() => {
        const declared = Number(assistantReport?.numberOfAssignments ?? 0);
        const fromStudents =
            assistantReport?.students?.reduce(
                (mx, stu) => Math.max(mx, Array.isArray(stu.assignments) ? stu.assignments.length : 0),
                0
            ) ?? 0;
        return Math.max(declared, fromStudents);
    }, [assistantReport]);

    const headerCells = useMemo(() => {
        const quizTitle = assistantReport?.quizTitle || "Quiz";
        const totalSessions = assistantReport?.totalSession;
        const attendanceHeader = totalSessions ? `Attendance (/${totalSessions})` : "Attendance";
        
        const base = ["Student name", quizTitle, "Percent", "Grade"];
        
        // Add attendance column if group is single letter
        if (showAttendance) {
            base.push(attendanceHeader);
        }
        
        const hwCols = Array.from({ length: assignmentCount }, (_, i) => `HW ${i + 1}`);
        return [...base, ...hwCols];
    }, [assistantReport, assignmentCount, showAttendance]);

    const gridTemplateColumns = useMemo(() => {
        const fixed = ["3fr", "2fr", "2fr", "2fr"];
        
        // Add attendance column width if showing
        if (showAttendance) {
            fixed.push("2fr");
        }
        
        const hw = Array.from({ length: assignmentCount }, () => "2fr");
        return [...fixed, ...hw].join(" ");
    }, [assignmentCount, showAttendance]);

    const rows = useMemo(() => {
        if (!assistantReport?.students) return [];
        return assistantReport.students.map((stu) => {
            const studentName = stu?.studentName ?? "N/A";
            const quizScore = pretty(stu?.quizScore);
            const percentage = pretty(stu?.percentage);
            const grade = pretty(stu?.grade);
            const attended = pretty(stu?.attended);
            
            const asns = Array.isArray(stu?.assignments) ? stu.assignments : [];
            const asnCells = Array.from(
                { length: assignmentCount },
                (_, i) => cap(pretty(asns[i]?.status ?? "missing"))
            );
            
            // Build cells array with conditional attendance
            const cells = [studentName, quizScore, percentage, grade];
            
            if (showAttendance) {
                cells.push(attended);
            }
            
            cells.push(...asnCells);
            
            const copyText = cells.join(", ");
            return { cells, copyText };
        });
    }, [assistantReport, assignmentCount, showAttendance]);

    const handleCopyAll = async () => {
        const headerCopyText = headerCells.join(", ");
        const text = [headerCopyText, ...rows.map((r) => r.copyText)].join("\n");

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
            }
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 1200);
        } catch (e) {
            console.error("Copy all failed", e);
        }
    };

    return (
        <div className="weekly-log">
            <div className="log-header">
                <h2 className="log-title">Class Report:</h2>
                {!loading && !error && rows.length > 0 && (
                    <button
                        type="button"
                        className={`copy-all-btn ${copiedAll ? "copied" : ""}`}
                        onClick={handleCopyAll}
                        aria-label="Copy all rows"
                        title="Copy all rows"
                    >
                        {copiedAll ? "Copied!" : "Copy All"}
                    </button>
                )}
            </div>

            <div className="log-table student-flat-table">
                <StudentTableRow isHeader cells={headerCells} style={{ gridTemplateColumns }} />

                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => <WeeklyLogRowSkeleton key={index} />)
                ) : error ? (
                    <StudentTableRow
                        cells={["—", error, ...Array(Math.max(0, headerCells.length - 2)).fill("—")]}
                        style={{ gridTemplateColumns }}
                    />
                ) : rows.length === 0 ? (
                    <StudentTableRow
                        cells={["—", "No data", ...Array(Math.max(0, headerCells.length - 2)).fill("—")]}
                        style={{ gridTemplateColumns }}
                    />
                ) : (
                    rows.map(({ cells, copyText }, idx) => (
                        <StudentTableRow key={idx} cells={cells} copyText={copyText} style={{ gridTemplateColumns }} />
                    ))
                )}
            </div>
        </div>
    );
};

export default AssistantReport;