import React from "react";
import { Skeleton, Box } from "@mui/material";
import "../style/pending_student_style.css"
const PendingStudentCardSkeleton = () => {
    return (
        <section className="pending-card skeleton">
            {/* Avatar */}
            <div className="pending-student-avatar" style={{ display: "grid", placeItems: "center" }}>
                <Skeleton variant="circular" width={160} height={160} />
            </div>

            {/* Info lines */}
            <div className="pending-card-content">
                <Box sx={{ display: 'flex' ,flexDirection : "column", alignItems: 'start', gap: 1 }}>
                    <Skeleton variant="text" width={100} height={30} />
                    <Skeleton variant="text" width={150} height={30} />
                    <Skeleton variant="text" width={100} height={30} />

                </Box>
            </div>

            {/* Buttons */}
            <div className="pending-card-actions">
                <Skeleton variant="rounded" width={130} height={44} sx={{ borderRadius: "10px" }} />
                <Skeleton variant="rounded" width={130} height={44} sx={{ borderRadius: "10px" }} />
            </div>
        </section>
    );
};

export default PendingStudentCardSkeleton;
