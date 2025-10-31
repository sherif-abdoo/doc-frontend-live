import React from "react";
import "../style/secondary_button_style.css";

const SecondaryButton = ({
                             label,
                             borderColor = "#248866",
                             textColor,
                             fill = false, // ✅ new prop to optionally fill button background
                             fontFamily = "Montserrat Thin",
                             fontWeight = "700",
                             height,
                             width,
                             fontSize,
                             onClick,
                         }) => {
    const styles = {
        borderColor: borderColor,
        color: fill ? "#fff" : textColor || borderColor,
        backgroundColor: fill ? borderColor : "transparent",
        fontFamily: fontFamily,
        fontWeight: fontWeight,
        width: width,
        height: height,
        fontSize: fontSize,
        cursor: "pointer",
        transition: "all 0.2s ease",
    };

    return (
        <button className="secondary-btn" onClick={onClick} style={styles}>
            {label}
        </button>
    );
};

export default SecondaryButton;
