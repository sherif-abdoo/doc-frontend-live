import React from "react";
import CircularProgress from "./circular_progress";
import "../style/stat_card_style.css";

const StatCard = ({ title, value, maxValue, showProgress = false, grade = null, scoreText = null }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">{title}</div>
      <div className="stat-content">
        {grade ? (
          <div className="grade-display">
            <span className="grade-letter">{grade}</span>
            <span className="grade-score">{scoreText}</span>
          </div>
        ) : (
          <div className="stat-value">
            <span className="value-text">{value}/{maxValue}</span>
          </div>
        )}
        {showProgress && (
          <CircularProgress value={value} maxValue={maxValue} size={90} strokeWidth={13} />
        )}
      </div>
    </div>
  );
};

export default StatCard;
