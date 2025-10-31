import React from "react";
import "../style/primary_button_style.css";

const PrimaryButton = ({
                           label,
                           bgColor,
                           fontSize = "clamp(1rem, 2vw, 1.25rem)",
                           height,
                           fontFamily = "Montserrat Thin",
                           onClick,
                           type = "button",          // prevent accidental form submit
                           className = "",
                           disabled = false,
                           style = {},
                           ...props
                       }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`custom-btn ${className}`}
            style={{
                backgroundColor: bgColor,
                fontSize,
                fontFamily,
                fontWeight: "700",
                height: height || "auto",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.7 : 1,
                ...style,
            }}
            {...props}
        >
            {label}
        </button>
    );
};

export default PrimaryButton;
