import React from "react";
import "../style/pending_student_style.css";

/**
 * Props:
 * - name, email, group, phoneNumber
 * - onAccept?: () => void
 * - onReject?: () => void
 * - disabled?: boolean
 */
export default function PendingStudentCard({
                                               name,
                                               email,
                                               group,
                                               phoneNumber,
                                               onAccept,
                                               onReject,
                                               disabled = false,
                                           }) {
    return (
        <div className="pending-card">
            <div className="pending-card-avatar">
            </div>

            <div className="pending-card-content">
                <p className="pending-card-text">Name : {name}</p>
                <p className="pending-card-text">Email : {email}</p>
                <p className="pending-card-text">Group : {group}</p>
                <p className="pending-card-text">Phone number : {phoneNumber}</p>
            </div>

            <div className="pending-card-actions">
                <button
                    className="pending-card-btn accept-student"
                    onClick={onAccept}
                    disabled={disabled}
                >
                    Accept
                </button>
                <button
                    className="pending-card-btn reject-student"
                    onClick={onReject}
                    disabled={disabled}
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
