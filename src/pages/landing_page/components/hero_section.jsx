import SecondaryButton from "../../../shared/components/secondary_button";
import PrimaryButton from "../../../shared/components/primary_button";
import appColors from "../../../shared/components/app_colors";
import "../style/hero_section_style.css"
import {useNavigate} from "react-router-dom";

const HeroSection = () => {

    const navigate = useNavigate();

    const goSignup = () => navigate("/signup");
    const goLogin = () => navigate("/login");

    return(
        <div className="heroSection">
            <div className="left-section">
                <h1 className="heroTitle">
                    Dr. Omar Khalid
                </h1>
                <p className="heroText">
                    Master Physics, Chemistry, and Biology in one
                    course—complete syllabus coverage, exam tips,
                    and clear explanations to boost your grades.
                </p>
                <div className="hero-buttons">
                    <PrimaryButton label={"Register Now"} bgColor={appColors.heroPrimaryButton}onClick={goSignup} />
                    <SecondaryButton label={"Log in"} bgColor={appColors.text} onClick={goLogin}/>
                </div>
            </div>
            <div className="right-section">
                <img src={"/assets/landing_page/hero_image.png"} alt="heroImage"/>
            </div>
        </div>
    );
}

export default HeroSection;