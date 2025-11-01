import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopicCard from "./topic_card";
import "../style/topic_grid_style.css";
import CreateTopicModal from "./CreateTopic";
import { authFetch } from "../../../utils/authFetch";
import AlertBanner from "../../../shared/components/alert_banner";
import TopicLoadingCard from "./topic_loading_card";
import { useAuth } from "../../../hooks/useAuth";
import { isAssistant, isDoc  } from "../../../utils/roles";

const TopicGrid = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [alertState, setAlertState] = useState({
        open: false,
        message: "",
        error: false,
    });

    const showAlert = (message, isError = false) =>
        setAlertState({ open: true, message, error: isError });

    const handleTopicClick = (topicId) => {
        navigate(`/classroom/topics/${topicId}`);
    };

    const loadTopics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await authFetch("get", "/topic/getAllTopics");

            const list = res?.data?.topics ?? [];
            const normalized = list.map((t) => ({
                id: t.topicId,
                title: t.title ?? t.topicName,
                semester: t.semester,
                subject: t.subject,
                isActive: t.isActive,
                adminId: t.adminId,
                order: t.order,
                img: `/assets/Classroom/${t.subject}-Icon.png`,
            }));
            setTopics(normalized);
        } catch (e) {
            console.error("loadTopics error:", e);
            showAlert(e?.message || "Failed to load topics", true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTopics();
    }, [loadTopics]);

    const openCreateModal = () => setModalOpen(true);
    const closeCreateModal = () => {
        if (!submitting) setModalOpen(false);
    };

    const submitCreate = async ({ title, semester, subject }) => {
        setSubmitting(true);
        try {
            const payload = { topicName: title, semester, subject };
            const res = await authFetch("post", "/topic/createTopic", payload);

            if (res.status === "success") {
                const t = res?.data;
                if (t) {
                    const newTopic = {
                        id: t.id,
                        title: t.title ?? t.topicName,
                        semester: t.semester,
                        subject: t.subject,
                        isActive: t.isActive,
                        adminId: t.adminId,
                        order: t.order,
                        img: `/assets/Classroom/${t.subject}-Icon.png`
                    };
                    setTopics((prev) => [newTopic, ...prev]);
                    showAlert(res?.message || "Topic created successfully");
                } else {
                    showAlert("Created, but no topic in response");
                }
                setModalOpen(false);
            } else {
                showAlert(res?.message || "Creation topic failed", true);
            }
        } catch (e) {
            console.error("createTopic error:", e);
            showAlert(e?.message || "Failed to create topic", true);
        } finally {
            setSubmitting(false);
        }
    };

    const canCreateTopic = !!user && (isAssistant(user) || isDoc(user));

    const SKELETON_COUNT = 6;

    return (
        <div className="topic-grid">
            <AlertBanner
                open={alertState.open}
                message={alertState.message}
                error={alertState.error}
                onClose={() => setAlertState((p) => ({ ...p, open: false }))}
            />

            {/* Don't render the Create card while auth is still hydrating to avoid flicker */}
            {canCreateTopic && !authLoading && (
                <TopicCard
                    key="create"
                    topic={{ title: "Create new topic", img: `/assets/Classroom/add_button.png` }}
                    onClick={openCreateModal}
                />
            )}

            {loading ? (
                Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <TopicLoadingCard key={`skeleton-${i}`} />
                ))
            ) : topics.length === 0 ? (
                <div className="empty-topic-grid">
                    <img
                        src="/assets/Classroom/notfound.png"
                        alt="No topics found"
                        className="empty-topic-image"
                    />
                    <p>Looks like there are no topics yet</p>
                </div>
            ) : (
                topics.map((topic) => (
                    <TopicCard
                        key={topic.id}
                        topic={{ title: topic.title, img: topic.img }}
                        onClick={() => handleTopicClick(topic.id)}
                    />
                ))
            )}

            <CreateTopicModal
                open={modalOpen}
                onClose={closeCreateModal}
                onSubmit={submitCreate}
                submitting={submitting}
            />
        </div>
    );
};

export default TopicGrid;
