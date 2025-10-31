import React from "react";
import PendingStudentCard from "./pending_student_card";
import PendingStudentCardSkeleton from "./pending_loading"; // <-- default export
import "../style/pending_student_grid.css";

/**
 * Props:
 * - students: Array<{ id?, name, email, group, phoneNumber }>
 * - onAccept?: (student) => void
 * - onReject?: (student) => void
 * - loading?: boolean
 * - skeletonCount?: number
 */
const PendingStudentsGrid = ({
                                 students = [],
                                 loading = false,
                                 onAccept,
                                 onReject,
                                 skeletonCount = 6,
                             }) => {
    if (loading) {
        return (
            <div className="topic-grid">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <PendingStudentCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }

    if (!students.length) {
        return (
            <div className="empty-topic-grid">
                <img src="/assets/Classroom/notfound.png" alt="No pending students" />
                <p>No pending students right now</p>
            </div>
        );
    }

    return (
        <div className="topic-grid">
            {students.map((s) => (
                <PendingStudentCard
                    key={s.id }         // safer key
                    name={s.name}
                    email={s.email}
                    group={s.group}
                    phoneNumber={s.phoneNumber}   // <-- pass correct prop name
                    onAccept={() => onAccept?.(s)}
                    onReject={() => onReject?.(s)}
                />
            ))}
        </div>
    );
};

export default PendingStudentsGrid;
