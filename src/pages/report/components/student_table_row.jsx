// components/student_table_row.jsx
import React, { useState } from "react";
import "../style/weekly_log_row_style.css";

/**
 * Generic table row matching Week's Log styling.
 * - Any number of columns via `cells` array.
 * - If `copyText` is provided (and not header), a "Copy" button appears in the first cell.
 * - Copy now uses plain space-separated row values (no labels, no dividers).
 */
const StudentTableRow = ({ cells = [], isHeader = false, style, copyText }) => {
    const rowClass = isHeader ? "log-row header" : "log-row";
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        // If copyText provided, use it; else default to joining cell strings with a single space.
        const text =
            typeof copyText === "string"
                ? copyText
                : Array.isArray(cells)
                    ? cells.map((c) => (c == null ? "" : String(c))).join(" ")
                    : "";

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
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error("Copy failed", e);
        }
    };

    if (!cells || cells.length === 0) {
        return <div className={rowClass} style={style} />;
    }

    const first = String(cells[0] ?? "");
    const rest = cells.slice(1).map((c) => String(c ?? ""));

    return (
        <div className={rowClass} style={style}>
            <div className="log-cell student">
                <span className="cell-content">{first}</span>
                {!isHeader && (
                    <button type="button" className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
                        {copied ? "Copied!" : "Copy"}
                    </button>
                )}
            </div>

            {rest.map((content, i) => (
                <div key={i} className="log-cell center" title={content}>
                    {content}
                </div>
            ))}
        </div>
    );
};

export default StudentTableRow;
