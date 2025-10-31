import React from "react";
import "../style/cta_button_style.css";

const CTAButton = ({
  label,
  bgColor,
  height,
  fontFamily = "Montserrat Thin",
    onClick,
}) => {
  return (
    <button
      className="cta-btn"
      onClick={onClick}
      style={{
        backgroundColor: bgColor,
        fontFamily,
        fontWeight: "700",
        height: height || "auto",
      }}
    >
      {label}
    </button>
  );
};

export default CTAButton;