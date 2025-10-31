import LessonCard from "./lesson_card";
import "../style/video_lessons_style.css";

const VideoLessons = ({ lessons, type }) => {
  if (!lessons || lessons.length === 0) {
    const message = `Looks like there are no ${type}`;
    return <div className="empty-lesson-container">
      <img src="/assets/Classroom/notfound.png"/>
      <p>{message}</p>
    </div>
  }

  return (
    <div className="lesson-scroll">
      {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} type={type} />
      ))}
    </div>
  );
};

export default VideoLessons;