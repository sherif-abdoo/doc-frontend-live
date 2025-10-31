// src/shared/components/submission/submit_button.jsx
import React from "react";
import { Upload } from "lucide-react";
import "../../style/submission/submit_button_style.css";

const SubmitButton = ({ type, onClick, disabled = false }) => {
  const lowerType = type?.toLowerCase();

  return (
      <button className="submit-btn" onClick={onClick} disabled={disabled}>
        {lowerType === "quiz" ? (
            "Join Meeting"
        ) : (
            <>
              <Upload className="icon" />
              Submit {type}
            </>
        )}
      </button>
  );
};

export default SubmitButton;
