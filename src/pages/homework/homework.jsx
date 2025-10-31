import React, { useState, useEffect, useCallback } from "react";
import SubmissionList from "../../shared/components/submission/submission_list";
import "./homework.css";
import { authFetch } from "../../utils/authFetch";
import Layout from "../../shared/components/layout";

const Homework = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [creating, setCreating] = useState(false);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("GET", "/assignment/getAllAssignments");
      const list = res?.data?.assignments ?? [];
      setAssignments(list);
    } catch (err) {
      console.error("[Homework] loadAssignments error:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);


    const notSubmittedCount = assignments.filter((q) => {
        const status = String(q.state || q.status || "").toLowerCase();
        return status === "unsubmitted" || status === "not submitted";
    }).length;

  // ✅ this is passed down; must return the API response
  const submitCreateAssignment = async (form) => {
    // form: { title, description, mark, semester, endDateMDY, topicId, document }
    const payload = {
      title: form.title,
      description: form.description,
      mark: form.mark,
      semester: form.semester,
      endDate: form.endDateMDY,       // backend expects M/D/YYYY
      topicId: form.topicId,
      document: form.document || "https://www.africau.edu/images/default/sample.pdf",
    };

    setCreating(true);
    try {
      const res = await authFetch("POST", "/assignment/createAssignment", payload);
      return res; // e.g. { status: "success", data: { message, id } }
    } finally {
      setCreating(false);
    }
  };

  return (
      <Layout>
        <main className="main-content">
          <h2 className="section-title">
            {loading
                ? "Loading assignments..."
                : notSubmittedCount > 0
                    ? `You have ${notSubmittedCount} assignment${notSubmittedCount > 1 ? "s" : ""} not submitted. Let's get started!`
                    : "All assignments submitted! 🎉"}
          </h2>

          <SubmissionList
              submissions={assignments}
              type="Assignment"
              loading={loading}
              onCreateSubmission={submitCreateAssignment}  // ✅ pass handler
              creatingSubmission={creating}
          />
        </main>
      </Layout>
  );
};

export default Homework;
