// components/weekly_log_row.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/weekly_log_row_style.css";

const WeeklyLogRow = ({
                          date,
                          action,
                          description,
                          isHeader = false,
                          type,
                          sessionId,
                          score,
                          status,
                          feedback,
                          qStatus,
                          qGrade,
                          qScoreText,
                          qFeedback,
                          submissionId, // 👈 now used safely
                      }) => {
    const navigate = useNavigate();
    const rowClass = isHeader ? "log-row header" : "log-row";

    const normalizeStatus = (raw) => {
        const s = String(raw || "").toLowerCase().trim();
        if (s === "marked" || s === "graded") return "marked";
        if (s === "unmarked" || s === "not marked" || s === "missing") return "unmarked";
        if (s === "pending review") return "pending";
        return "neutral";
    };

    const renderLine = (label, value, extraClass = "") => {
        if (!value || String(value).trim() === "" || String(value).toLowerCase() === "n/a") return null;
        return (
            <div className="desc-line">
                <span className="field-label">{label}</span>
                <span className={`field-value ${extraClass}`}>{value}</span>
            </div>
        );
    };

    const currentStatus = normalizeStatus(type === "Quiz" ? qStatus : status);
    const isMarked = currentStatus === "marked";
    const hasSubmissionId = submissionId != null && String(submissionId).toLowerCase() !== "n/a";
    const canShowAnswers = isMarked && hasSubmissionId;
    console.log(submissionId);
    const renderDescription = () => {
        if (isHeader) return <span className="desc-text">{description ?? "N/A"}</span>;

        if (type === "Session") {
            return <span className="desc-text">Session id : {String(sessionId ?? "N/A")}</span>;
        }

        if (type === "Assignment") {
            return (
                <div className="desc-block">
                    {renderLine("Status:", status, `status-text ${normalizeStatus(status)}`)}
                    {renderLine("Score:", score)}
                    {renderLine("Feedback:", feedback)}
                </div>
            );
        }

        if (type === "Quiz") {
            return (
                <div className="desc-block">
                    {renderLine("Status:", qStatus, `status-text ${normalizeStatus(qStatus)}`)}
                    {renderLine("Grade:", qGrade)}
                    {renderLine("Score:", qScoreText)}
                    {renderLine("Feedback:", qFeedback)}
                </div>
            );
        }

        return <span className="desc-text">{description ?? "N/A"}</span>;
    };

    const handleShowAnswers = () => {
        if (!canShowAnswers) return;
        navigate(`/answer/${encodeURIComponent(submissionId)}`);
    };

    return (
        <div className={rowClass}>
            <div className="log-cell date">{date}</div>

            <div className="log-cell action">
        <span className="action-text" title={action}>
          {action}
        </span>
                {canShowAnswers && (
                    <button className="show-answers-btn" type="button" onClick={handleShowAnswers}>
                        Show Answers
                    </button>
                )}
            </div>

            <div className="log-cell description">{renderDescription()}</div>
        </div>
    );
};

export default WeeklyLogRow;
