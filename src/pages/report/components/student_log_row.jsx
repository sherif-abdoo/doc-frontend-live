import React from "react";
import "../style/weekly_log_row_style.css";

/**
 * Styled like Week's Log rows, but 4 columns:
 * Student | Assignments | Quizzes | Attendance
 *
 * Props:
 * - student, assignments, quizzes, attendance, isHeader=false
 * Each of assignments/quizzes/attendance can be string or ReactNode.
 */
const StudentLogRow = ({ student, assignments, quizzes, attendance, isHeader = false }) => {
    const rowClass = isHeader ? "log-row header" : "log-row";
    return (
        <div className={rowClass}>
            <div className="log-cell student">{student}</div>
            <div className="log-cell assignments">{assignments}</div>
            <div className="log-cell quizzes">{quizzes}</div>
            <div className="log-cell attendance">{attendance}</div>
        </div>
    );
};

export default StudentLogRow;
