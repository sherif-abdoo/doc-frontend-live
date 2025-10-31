import LiveClassCard from "./live_class_card";
import "../style/live_class_list_style.css";

const LiveClassList = ({ liveClasses }) => {
  if (!liveClasses || liveClasses.length === 0) {
    return <p className="empty-message">No live classes available right now.</p>;
  }

  return (
    <div className="live-class-list">
      {liveClasses.map((liveClass, idx) => (
        <LiveClassCard key={idx} liveClass={liveClass} />
      ))}
    </div>
  );
};

export default LiveClassList;
