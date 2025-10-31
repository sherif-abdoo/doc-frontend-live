// src/pages/classroom/components/topic_card.jsx
import "../style/topic_card_style.css";
import ShortenText from "../../../shared/components/shorten_text";
import IconButton from "../../../shared/components/icon_button";

const EditIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Z" fill="currentColor" />
        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" fill="currentColor"/>
    </svg>
);

const TrashIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 7h12l-1 13H7L6 7Z" fill="currentColor"/>
        <path d="M9 4h6l1 2H8l1-2Z" fill="currentColor"/>
    </svg>
);

const TopicCard = ({ topic, onClick, canManage = false, onEdit, onDelete }) => {
    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit?.(topic);
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete?.(topic);
    };

    return (
        <div className="topic-card" onClick={onClick}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{ShortenText(topic.title, 23)}</h3>
                {canManage && (
                    <div style={{ display: "inline-flex", gap: 6, marginLeft: 6 }}>
                        <IconButton
                            icon={<EditIcon />}
                            bg="#2563eb"
                            title="Edit"
                            onClick={handleEditClick}
                        />
                        <IconButton
                            icon={<TrashIcon />}
                            bg="#dc2626"
                            title="Delete"
                            onClick={handleDeleteClick}
                        />
                    </div>
                )}
            </div>

            <div className="topic-footer">
                {topic?.img ? (
                    <img
                        src={topic.img}
                        alt={topic.title || "topic"}
                        className="topic-img"
                    />
                ) : null}
            </div>
        </div>
    );
};

export default TopicCard;
