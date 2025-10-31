// src/shared/components/submission/create_submission_card.jsx
import React, { useState } from "react";
import CreateAssignmentModal from "./create_submission_pop_up";
import "../../style/submission/create_submission_card_style.css";
import CreateQuizModal from "./create_quiz_popup";

const CreateSubmissionCard = ({
                                  type = "Assignment",
                                  loading = false,
                                  onSubmit,
                              }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        if (!loading) setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (loading) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handleModalSubmit = async (form) => {
        try {
            await onSubmit?.(form); // parent POST
        } finally {
            setOpen(false); // close after parent finishes
        }
    };

    const Modal = type === "Quiz" ? CreateQuizModal : CreateAssignmentModal;

    return (
        <>
            <section
                className={`create-submission-card ${loading ? "is-loading" : ""}`}
                role="button"
                tabIndex={loading ? -1 : 0}
                aria-disabled={loading}
                onClick={handleOpen}
                onKeyDown={handleKeyDown}
            >
                <div className="create-submission-inner">
                    <div className="plus-icon">+</div>
                    <h3 className="create-title">Create New {type}</h3>
                </div>
            </section>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleModalSubmit}
                submitting={loading}
                error=""
            />
        </>
    );
};

export default CreateSubmissionCard;
