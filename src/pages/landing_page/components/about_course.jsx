//about_course.jsx
import CourseCard from "./course_card";
import appColors from "../../../shared/components/app_colors";
import "../style/about_course_style.css"
const bioIcon = "assets/landing_page/biology_icon.png";
const chemIcon = "assets/landing_page/Chemistry-Icon.png";
const physIcon = "assets/landing_page/Physics-Icon.png";

const AboutCourse = () => {
    return (
        <div className={"about-course-view"}>
            <h1 className={"about-course-title"}>
                About the Course
            </h1>
            <p className="about-course-description">
                Combined Science is a qualification blends Biology, Chemistry, and Physics.
                Dr. Omar Khalid makes it simple with clear lessons, real-life examples, and
                exam-focused practice.
            </p>
            <div className={"about-course-cards"}>
                <CourseCard title={"Biology"} text={"Explore cells, organisms, " +
                    "and ecosystems with " +
                    "engaging, easy-to-follow " +
                    "teaching."}
                    bgColor={appColors.bioCard}
                    icon={bioIcon}
                />
                <CourseCard title={"Chemistry"} text={"Understand elements, " +
                    "compounds, and reactions " +
                    "through step-by-step " +
                    "lessons."}
                    bgColor={appColors.chemCard}
                    icon={chemIcon}
                />
                <CourseCard title={"Physics"} text={"Learn about motion, " +
                    "forces, and energy with " +
                    "simple explanations and " +
                    "practical examples."}
                    bgColor={appColors.physCard}
                    icon={physIcon}
                />
            </div>

            <h1 className={"about-course-footer"}>
                Exam Preparation Features
            </h1>
        </div>
    );
}

export default AboutCourse;