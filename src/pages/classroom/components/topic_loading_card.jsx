import Skeleton from '@mui/material/Skeleton';
import "../style/topic_card_style.css";

export default function TopicLoadingCard() {
    return (
        <div className="topic-card">
            <Skeleton variant="h3" />
            <div className="topic-footer">
                <Skeleton variant="rounded" width={150} height={150} />
            </div>
        </div>
    );
}