import React from "react";
import "../style/ready_to_exam_style.css"
import CTAButton from "./cta_button";
import appColors from "../../../shared/components/app_colors";
import {useNavigate} from "react-router-dom";

const ReadyExam = () => {
    const navigate = useNavigate();

    const goSignup = () => navigate("/signup");
    return (
        <div className="ready-to-exam">
            <h1 className="ready-to-exam-title">Get Ready for Exam Success</h1>
            <div className="ready-to-exam-content">
                <img 
                    className="ready-img" 
                    src="assets/landing_page/Girl-CallToAction.png"
                    alt="Student ready for exam"
                />
                <div className="ready-to-exam-action">
                    <p className="ready-to-exam-description">
                        Join hundreds of students already achieving their goals 
                    </p>
                    <CTAButton 
                        label="Register Now" 
                        bgColor={appColors.callToActionButton} 
                        fontFamily="Montserrat Bold"
                        onClick={goSignup}
                    />
                </div>
                <img 
                    className="ready-img" 
                    src="assets/landing_page/Boy-CallToAction.png"
                    alt="Student ready for exam"
                />
            </div>
        </div>
    );
};

export default ReadyExam;