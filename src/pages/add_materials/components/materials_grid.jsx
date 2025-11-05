// src/pages/materials/MaterialsGrid.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TopicCard from "../../classroom/components/topic_card";
import "../../classroom/style/topic_grid_style.css";
import AlertBanner from "../../../shared/components/alert_banner";
import TopicLoadingCard from "../../classroom/components/topic_loading_card";
import "../../classroom/classroom.css";
import { authFetch } from "../../../utils/authFetch";
import { useAuth } from "../../../hooks/useAuth";
import { isAssistant, isDoc } from "../../../utils/roles";
import CreateMaterialModal from "./add_material_pop_up";
import AreYouSureModal from "../../../shared/components/are_you_sure";

const PLACEHOLDER_PDF = "https://www.africau.edu/images/default/sample.pdf";

const MaterialsGrid = () => {
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

  // delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    message: "",
    error: false,
  });

  const showAlert = (message, isError = false) =>
      setAlertState({ open: true, message, error: isError });

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("GET", "/material/getAllMaterials");
      const list = res?.data?.materials ?? [];
      const normalized = list.map((m) => ({
        id: m.id ?? m.materialId,
        materialId: m.materialId ?? m.id,
        title: m.title,
        description: m.description,
        document: m.document,
        topicId: m.topicId,
        topicName: m.Topic?.topicName, // if backend returns
        img: `/assets/Classroom/${m.Topic?.subject ?? "Default"}-Icon.png`,
        type: m.type
      }));
      setTopics(normalized);
    } catch (e) {
      console.error("loadMaterials error:", e);
      showAlert(e?.message || "Failed to load materials", true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const openCreateModal = () => setModalOpen(true);
  const closeCreateModal = () => { if (!submitting) setModalOpen(false); };

  // CREATE (parent performs API call then local render)
  // CREATE (parent performs API call then local render)
  const submitCreate = async ({ title, description, topicId, topicName, document }) => {
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: (description ?? "").trim(),
        document: document, // ✅ use uploaded R2 URL instead of placeholder
        topicId: Number(topicId),
      };

      const res = await authFetch("POST", "/material/createMaterial", payload);

      if (res?.status === "success") {
        const m = res?.data?.newMaterial;
        if (m) {
          const newMaterialCard = {
            id: m.materialId,
            materialId: m.materialId,
            title: m.title,
            description: m.description,
            document: m.document,
            topicId: m.topicId,
            topicName: topicName ?? "Default",
            img: `/assets/Classroom/${m.subject || "Default"}-Icon.png`,
          };

          setTopics((prev) => [newMaterialCard, ...prev]);
          showAlert(res?.message || "Material created successfully");
          setModalOpen(false);
        } else {
          showAlert("Created, but no material in response");
        }
      } else {
        showAlert(res?.message || "Creating material failed", true);
      }
    } catch (e) {
      console.error("createMaterial error:", e);
      showAlert(e?.message || "Failed to create material", true);
    } finally {
      setSubmitting(false);
    }
  };


  // EDIT open
  const requestEdit = (material) => {
    setEditingItem(material);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    if (!savingEdit) {
      setEditOpen(false);
      setEditingItem(null);
    }
  };

  // EDIT submit (PATCH /material/updateMaterial/{materialId})
  const submitEdit = async ({ title, description, topicId, topicName /*, file*/ }) => {
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      const body = {
        title: title.trim(),
        description: (description ?? "").trim(),
        document: editingItem.document ?? PLACEHOLDER_PDF, // keep old doc for now
        topicId: String(Number(topicId)),
      };

      const res = await authFetch(
          "PATCH",
          `/material/updateMaterial/${editingItem.materialId}`,
          body
      );

      if (res?.status === "success") {
        // local update
        setTopics((prev) =>
            prev.map((m) =>
                m.materialId === editingItem.materialId
                    ? {
                      ...m,
                      title: body.title,
                      description: body.description,
                      topicId: Number(body.topicId),
                      img: `/assets/Classroom/${topicName ?? "Default"}-Icon.png`,
                    }
                    : m
            )
        );
        showAlert(res?.message || "Material updated successfully");
        setEditOpen(false);
        setEditingItem(null);
      } else {
        showAlert(res?.message || "Failed to update material", true);
      }
    } catch (e) {
      showAlert(e?.message || "Failed to update material", true);
    } finally {
      setSavingEdit(false);
    }
  };

  // DELETE open
  const requestDelete = (material) => {
    setPendingDelete(material);
    setConfirmOpen(true);
  };

  // DELETE confirm (DELETE /material/deleteMaterial/{materialId})
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await authFetch(
          "DELETE",
          `/material/deleteMaterial/${pendingDelete.materialId}`
      );

      if (res?.status === "success") {
        setTopics((prev) => prev.filter((m) => m.materialId !== pendingDelete.materialId));
        showAlert(res?.message || "Material deleted");
      } else {
        showAlert(res?.message || "Failed to delete material", true);
      }
    } catch (e) {
      showAlert(e?.message || "Failed to delete material", true);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const handleMaterialClick = (topic) => {
    if (topic.type === "url") {
      // If type is URL, open the link in a new tab
      window.open(topic.document, "_blank");
    } else {
      // If type is PDF (or any other type), navigate to the material's detail page
      navigate(`/materials/${topic.materialId}`);
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

        {/* delete confirm */}
        <AreYouSureModal
            open={confirmOpen}
            message={`Delete "${pendingDelete?.title ?? "this material"}"?`}
            onConfirm={confirmDelete}
            onClose={() => {
              if (!deleting) {
                setConfirmOpen(false);
                setPendingDelete(null);
              }
            }}
            submitting={deleting}
            confirmLabel={deleting ? "Deleting…" : "Sure"}
            cancelLabel="No"
        />

        {/* EDIT modal (reuse create modal ui) */}
        <CreateMaterialModal
            open={editOpen}
            onClose={closeEditModal}
            onSubmit={submitEdit}
            submitting={savingEdit}
            setSubmitting={setSavingEdit}
            setAlertState={setAlertState}
            mode="edit"
            initialData={
              editingItem
                  ? {
                    materialId: editingItem.materialId,
                    title: editingItem.title,
                    description: editingItem.description,
                    topicId: editingItem.topicId,
                    topicName: editingItem.topicName,

                  }
                  : undefined
            }
        />

        {/* Create button */}
        {canManage && !authLoading && (
            <TopicCard
                key="create"
                topic={{ title: "Create new material", img: `/assets/Classroom/add_button.png` }}
                onClick={() => setModalOpen(true)}
                canManage={false}
            />
        )}

        {/* list */}
        {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <TopicLoadingCard key={`skeleton-${i}`} />
            ))
        ) : topics.length === 0 ? (
            <div className="empty-topic-grid">
              <img
                  src="/assets/Classroom/notfound.png"
                  alt="No Materials found"
                  className="empty-topic-image"
              />
              <p>Looks like there are no Materials yet</p>
            </div>
        ) : (
            topics.map((topic) => (
                <TopicCard
                    key={topic.id}
                    topic={topic}
                    canManage={canManage}
                    onEdit={requestEdit}
                    onDelete={requestDelete}
                    onClick={() => handleMaterialClick(topic)} // Use the new click handler
                />
            ))
        )}

        {/* Create modal */}
        <CreateMaterialModal
            open={modalOpen}
            onClose={closeCreateModal}
            onSubmit={submitCreate}
            submitting={submitting}
            setSubmitting={setSubmitting}
            setAlertState={setAlertState}
            mode="create"
        />
      </div>
  );
};

export default MaterialsGrid;
