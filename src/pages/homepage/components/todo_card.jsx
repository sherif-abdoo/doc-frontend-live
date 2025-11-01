import React, { useState, useEffect } from "react";
import { authFetch } from "../../../utils/authFetch";

const ToDoCard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch("GET", "/assignment/getUnsubmittedAssignments");

        // Accept a couple of possible response shapes
        const raw =
          (Array.isArray(res?.data?.assignments) && res.data.assignments) ||
          (Array.isArray(res?.data) && res.data) ||
          [];

        const normalized = raw
          .map((a, idx) => ({
            id: a.assignId ?? a.assignmentId ?? a.id ?? a._id ?? idx,
            title: a.title ?? a.name ?? `Assignment ${idx + 1}`,
            subject: a.subject ?? "",
            endDate: a.endDate ?? a.dueDate ?? undefined,
            submitted: a.submitted ?? 0,
          }))
          .filter((a) => a.id != null);

        if (!cancelled) setAssignments(normalized);
      } catch (e) {
        console.error("getUnsubmittedAssignments failed:", e);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'numeric'
    });
  };

  const displayAssignments = assignments.slice(0, 3);

  return (
    <div className="card todo-card">
      <h2 className="card-title">To-do</h2>
      <ul className="card-list">
        {loading ? (
          <>
            <li className="todo-item" style={{ opacity: 0.6 }}>
              <input
                type="checkbox"
                disabled
                className="todo-checkbox"
                style={{ cursor: 'not-allowed' }}
              />
              <span>Loading...</span>
            </li>
            <li className="todo-item" style={{ opacity: 0.6 }}>
              <input
                type="checkbox"
                disabled
                className="todo-checkbox"
                style={{ cursor: 'not-allowed' }}
              />
              <span>Loading...</span>
            </li>
            <li className="todo-item" style={{ opacity: 0.6 }}>
              <input
                type="checkbox"
                disabled
                className="todo-checkbox"
                style={{ cursor: 'not-allowed' }}
              />
              <span>Loading...</span>
            </li>
          </>
        ) : displayAssignments.length === 0 ? (
          <li className="todo-item" style={{ opacity: 0.7 }}>
            <input
              type="checkbox"
              disabled
              className="todo-checkbox"
              style={{ cursor: 'not-allowed' }}
            />
            <span>No pending assignments</span>
          </li>
        ) : (
          displayAssignments.map((assignment) => (
            <li key={assignment.id} className="todo-item">
              <input
                type="checkbox"
                checked={assignment.submitted === 1}
                readOnly
                disabled
                className="todo-checkbox"
                style={{ cursor: 'not-allowed' }}
              />
              <span className={assignment.submitted === 1 ? "completed" : ""}>
                {assignment.title} - {assignment.subject} (Due: {formatDate(assignment.endDate)})
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ToDoCard;