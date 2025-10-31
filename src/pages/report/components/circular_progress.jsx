import React from "react";
import "../style/circular_progress_style.css";

const CircularProgress = ({ value, maxValue, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / maxValue) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#eaebf3"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#27a8e0"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
