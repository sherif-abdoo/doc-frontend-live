import { useEffect, useRef } from "react";
import "../style/are_you_sure_style.css";

export default function AreYouSureModal({
                                            open,
                                            message = "Are you sure?",
                                            onConfirm,
                                            onClose,
                                            submitting = false,
                                            confirmLabel = "Sure",
                                            cancelLabel = "No",
                                        }) {
    const dialogRef = useRef(null);

    // open/close <dialog> imperatively
    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        if (!open && dlg.open) dlg.close();
    }, [open]);

    // close by clicking the backdrop
    const onBackdrop = (e) => {
        const dlg = dialogRef.current;
        if (!dlg) return;
        const rect = dlg.getBoundingClientRect();
        const clickedOutside =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom;
        if (clickedOutside && !submitting) onClose?.();
    };

    // keyboard: Enter => confirm, Esc => dialog will close by default
    const onKeyDown = (e) => {
        if (submitting) return;
        if (e.key === "Enter") {
            e.preventDefault();
            onConfirm?.();
            onClose?.();
        }
    };

    const handleConfirm = () => {
        if (submitting) return;
        onConfirm?.();
        onClose?.();
    };

    return (
        <dialog
            ref={dialogRef}
            className="ays-dialog"
            onClick={onBackdrop}
            onKeyDown={onKeyDown}
            aria-modal="true"
        >
            <div className="ays-card" role="document">
                <h3 className="ays-title">Confirm action</h3>
                <p className="ays-message">{message}</p>

                <div className="ays-actions">
                    <button
                        type="button"
                        className="ays-btn ays-btn-ghost"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className="ays-btn ays-btn-primary"
                        onClick={handleConfirm}
                        disabled={submitting}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
