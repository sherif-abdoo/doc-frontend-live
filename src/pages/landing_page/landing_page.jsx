import React, { useState, useEffect } from "react"; 
import HeroSection from "./components/hero_section";
import AboutCourse from "./components/about_course";
import FeatureCardsSlider from "../../shared/components/feature-cards-slider";
import ReadyExam from "./components/ready_to_exam";
import appColors from "../../shared/components/app_colors";

const defaultItems = [
    {
        title: "Past Papers & Mark Schemes",
        icon: "/assets/landing_page/Pastpaper.png",
        description: "Practice with real exam questions and mark schemes to see exactly\n" +
            "how answers are graded and learn the techniques examiners expect.",
        bgColor: appColors.slide1,
    },
    {
        title: "Progress Tracking",
        icon: "/assets/landing_page/Progress-Tracking.png",
        description: "Track your progress over time, identify weak spots, and stay motivated\n" +
            "as you move closer to your target grade.",
        bgColor: appColors.slide2,
    },
    {
        title: "Condensed Revision Notes",
        icon: "/assets/landing_page/Notes.png",
        description: "Simplified notes and diagrams that break the syllabus into key points,\n" +
            "making revision faster and more effective.",
        bgColor: appColors.slide3,
    },
    {
        title: "Exam Strategies",
        icon: "/assets/landing_page/Exam-Strategies.png",
        description: "Learn proven tips to manage time, avoid mistakes, and maximize marks\n" +
            "so you enter the exam with confidence.",
        bgColor: appColors.slide4,
    },
];

const LandingPage = () => {
    useEffect(() => {
        document.title = 'Dr. Omar Khalid';
    }, []); 
    return (
        <>
            <HeroSection />
            <AboutCourse/>
            <FeatureCardsSlider items={defaultItems}/>
            <ReadyExam/>
        </>
    );
}

export default LandingPage;