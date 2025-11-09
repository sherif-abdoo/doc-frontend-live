import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopicCard from "./topic_card";
import "../style/topic_grid_style.css";
import CreateTopicModal from "./CreateTopic";
import { authFetch } from "../../../utils/authFetch";
import AlertBanner from "../../../shared/components/alert_banner";
import TopicLoadingCard from "./topic_loading_card";
import { useAuth } from "../../../hooks/useAuth";
import { isAssistant, isDoc } from "../../../utils/roles";
import AreYouSureModal from "../../../shared/components/are_you_sure";

const TopicGrid = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    // create
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // edit
    const [editOpen, setEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

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

    // EDIT open
    const requestEdit = (topic) => {
        setEditingItem(topic);
        setEditOpen(true);
    };

    const closeEditModal = () => {
        if (!savingEdit) {
            setEditOpen(false);
            setEditingItem(null);
        }
    };

    // EDIT submit (PATCH /topic/updateTopic/{id})
    const submitEdit = async ({ title, semester, subject }) => {
        if (!editingItem) return;
        setSavingEdit(true);
        try {
            const body = {
                topicName: title.trim(),
                semester,
                subject,
            };

            const res = await authFetch(
                "PATCH",
                `/topic/updateTopic/${editingItem.id}`,
                body
            );

            if (res?.status === "success") {
                // local update
                setTopics((prev) =>
                    prev.map((t) =>
                        t.id === editingItem.id
                            ? {
                                ...t,
                                title: body.topicName,
                                semester: body.semester,
                                subject: body.subject,
                                img: `/assets/Classroom/${body.subject}-Icon.png`,
                            }
                            : t
                    )
                );
                showAlert(res?.message || "Topic updated successfully");
                setEditOpen(false);
                setEditingItem(null);
            } else {
                showAlert(res?.message || "Failed to update topic", true);
            }
        } catch (e) {
            showAlert(e?.message || "Failed to update topic", true);
        } finally {
            setSavingEdit(false);
        }
    };

    const canManage = !!user && (isAssistant(user) || isDoc(user));

    const SKELETON_COUNT = 6;

    return (
        <div className="topic-grid">
            <AlertBanner
                open={alertState.open}
                message={alertState.message}
                error={alertState.error}
                onClose={() => setAlertState((p) => ({ ...p, open: false }))}
            />

            {/* EDIT modal (reuse create modal ui) */}
            <CreateTopicModal
                open={editOpen}
                onClose={closeEditModal}
                onSubmit={submitEdit}
                submitting={savingEdit}
                mode="edit"
                initialData={
                    editingItem
                        ? {
                            title: editingItem.title,
                            semester: editingItem.semester,
                            subject: editingItem.subject,
                        }
                        : undefined
                }
            />

            {/* Create button */}
            {canManage && !authLoading && (
                <TopicCard
                    key="create"
                    topic={{ title: "Create new topic", img: `/assets/Classroom/add_button.png` }}
                    onClick={openCreateModal}
                    canManage={false}
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
                        topic={topic}
                        canManage={canManage}
                        onEdit={requestEdit}
                        onClick={() => handleTopicClick(topic.id)}
                    />
                ))
            )}

            {/* Create modal */}
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