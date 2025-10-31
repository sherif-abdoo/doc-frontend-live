import { useState } from "react";
import "../../../shared/style/submission/create_submission_card_style.css";
import CreateFeedModal from "./create_feed_pop_up"; // same look as submissions

const CreateFeedCard = ({ loading = false, onSubmit }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => !loading && setOpen(true);
    const handleKeyDown = (e) => {
        if (loading) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
        }
    };

    const handleModalSubmit = async (form) => {
        try {
            await onSubmit?.(form);
        } finally {
            setOpen(false);
        }
    };

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
                    <h3 className="create-title">Create New Feed</h3>
                </div>
            </section>

            <CreateFeedModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleModalSubmit}
                submitting={loading}
            />
        </>
    );
};

export default CreateFeedCard;
