import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SecondaryButton from "../../../shared/components/secondary_button";
import { authFetch } from "../../../utils/authFetch";

const QuizCard = () => {
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const res = await authFetch("GET", "/quiz/getAllQuizzes");

                // Accept a couple of possible response shapes
                const raw =
                    (Array.isArray(res?.data?.quizzes) && res.data.quizzes) ||
                    (Array.isArray(res?.data) && res.data) ||
                    [];

                const normalized = raw
                    .map((q, idx) => ({
                        id: q.id ?? q.quizId ?? q._id ?? idx, // fallback idx if absolutely missing
                        name: q.title ?? q.name ?? `Quiz ${q.quizId ?? q.id ?? idx + 1}`,
                        dueDate: q.endDate ?? q.date ?? q.dueDate ?? q.deadline ?? null,
                    }))
                    .filter((q) => q.id != null);

                if (!cancelled) setQuizzes(normalized);
            } catch (e) {
                console.error("getAllQuizzes failed:", e);
                if (!cancelled) setQuizzes([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const formatDate = (val) => {
        if (!val) return "—";
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleDateString("en-CA");
    };

    const displayQuizzes = quizzes.slice(0, 2);
    const hasMore = quizzes.length > 2;

    return (
        <div
            className="card quiz-card"
            onClick={() => navigate("/quiz")}
            style={{ cursor: "pointer" }}
        >
            <h2 className="card-title">Quizzes</h2>

            <ul className="card-list">
                {loading ? (
                    <>
                        <li className="homework-item" style={{ opacity: 0.6 }}>
                            <span>• Loading…</span>
                            <span> —</span>
                            <SecondaryButton label="Submit" height="1px" width="125px" fontSize="15px" />
                        </li>
                        <li className="homework-item" style={{ opacity: 0.6 }}>
                            <span>• Loading…</span>
                            <span> —</span>
                            <SecondaryButton label="Submit" height="1px" width="125px" fontSize="15px" />
                        </li>
                    </>
                ) : displayQuizzes.length === 0 ? (
                    <li className="homework-item" style={{ opacity: 0.7 }}>
                        <span>• No quizzes yet</span>
                    </li>
                ) : (
                    displayQuizzes.map((q) => (
                        <li key={q.id} className="homework-item">
                            <span>• {q.name}</span>
                            <SecondaryButton
                                label="Submit"
                                height="1px"
                                width="125px"
                                fontSize="15px"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/quiz/${q.id}`);
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

export default QuizCard;
