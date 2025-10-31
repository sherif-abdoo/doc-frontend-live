//course_card.jsx
import React from "react";
import "../style/course_card_style.css"
const courseCard = ({ title, text, icon, bgColor }) => {
    return (
        <div className="course-card" style={{ backgroundColor: bgColor }}>
            <div className="card-icon">
                <img src={icon} alt={title + " icon"} />
                <h2 className="card-title">{title}</h2>
            </div>
            <p className="card-text">{text}</p>
        </div>
    );
};

export default courseCard;
