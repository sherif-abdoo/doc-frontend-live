import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../style/lesson_card_style.css";
import ShortenText from "../../../shared/components/shorten_text";

const LessonCard = ({ lesson, type }) => {
  const navigate = useNavigate();

  // use the REAL type coming from topicData
  const isPdf = lesson?.type === "pdf";
  const iconSrc = isPdf
    ? "/assets/Classroom/PDF.png"
    : "/assets/Classroom/Playbutton.png";
  const altText = isPdf ? "Open PDF" : "Play Video";

  const lessonId =
    lesson?.id ??
    lesson?._id ??
    lesson?.assignmentId ??
    lesson?.quizId ??
    lesson?.materialId ??
    lesson?.lessonId;

  const openDetails = useCallback(() => {
    if (!lessonId) return;

    const lowerType = type?.toLowerCase();
    let path = "";

    if (lowerType === "assignments") {
      path = `/homework/${encodeURIComponent(lessonId)}`;
    } else if (lowerType === "quizzes") {
      path = `/quiz/${encodeURIComponent(lessonId)}`;
    } else if (lowerType === "materials") {
      path = `/materials/${encodeURIComponent(lessonId)}`;
    } else {
      path = `/homework/${encodeURIComponent(lessonId)}`;
    }

    const singularType = lowerType.endsWith("s")
      ? lowerType.slice(0, -1)
      : lowerType;

    navigate(path, { state: { type: singularType } });
  }, [navigate, lessonId, type]);

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  };

  return (
    <div
      className="lesson-card-link"
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={onKey}
      style={{ outline: "none", textDecoration: "none" }}
    >
      <div className="lesson-card">
        <h3>{ShortenText(lesson?.title, 20) || "Untitled lesson"}</h3>
        <div className="lesson-footer">
          <button type="button" className="play-btn" aria-label={altText}>
            <img src={iconSrc} alt={altText} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonCard;
