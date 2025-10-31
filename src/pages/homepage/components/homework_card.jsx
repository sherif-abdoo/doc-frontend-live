import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SecondaryButton from "../../../shared/components/secondary_button";
import { authFetch } from "../../../utils/authFetch";

const HomeworkCard = () => {
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const res = await authFetch("GET", "/assignment/getAllAssignments");

                // Accept a couple of possible response shapes
                const raw =
                    (Array.isArray(res?.data?.assignments) && res.data.assignments) ||
                    (Array.isArray(res?.data) && res.data) ||
                    [];

                const normalized = raw
                    .map((a, idx) => ({
                        id: a.id ?? a.assignmentId ?? a._id ?? idx, // robust id mapping
                        name: a.title ?? a.name ?? `Assignment ${a.assignmentId ?? a.id ?? idx + 1}`,
                        endDate: a.endDate ?? a.dueDate ?? undefined,
                    }))
                    .filter((a) => a.id != null);

                if (!cancelled) setAssignments(normalized);
            } catch (e) {
                console.error("getAllAssignments failed:", e);
                if (!cancelled) setAssignments([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const displayAssignments = assignments.slice(0, 2);
    const hasMore = assignments.length > 2;

    return (
        <div
            className="card homework-card"
            onClick={() => navigate("/homework")}
            style={{ cursor: "pointer" }}
        >
            <h2 className="card-title">Homework</h2>

            <ul className="card-list">
                {loading ? (
                    <>
                        <li className="homework-item" style={{ opacity: 0.6 }}>
                            <span>• Loading…</span>
                            <SecondaryButton label="Submit" height="1px" width="125px" fontSize="15px" />
                        </li>
                        <li className="homework-item" style={{ opacity: 0.6 }}>
                            <span>• Loading…</span>
                            <SecondaryButton label="Submit" height="1px" width="125px" fontSize="15px" />
                        </li>
                    </>
                ) : displayAssignments.length === 0 ? (
                    <li className="homework-item" style={{ opacity: 0.7 }}>
                        <span>• No homework yet</span>
                        <SecondaryButton label="Submit" height="1px" width="125px" fontSize="15px" />
                    </li>
                ) : (
                    displayAssignments.map((a) => (
                        <li key={a.id} className="homework-item">
                            <span>• {a.name}</span>
                            <SecondaryButton
                                label="Submit"
                                height="1px"
                                width="125px"
                                fontSize="15px"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/homework/${a.id}`);
                                }}
                            />
                        </li>
                    ))
                )}
            </ul>

            {!loading && hasMore && (
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "14px",
                        marginTop: "8px",
                        color: "#666",
                        fontStyle: "italic",
                    }}
                >
                    View more...
                </div>
            )}
        </div>
    );
};

export default HomeworkCard;
