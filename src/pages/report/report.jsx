// Report.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authFetch } from "../../utils/authFetch";

import Layout from "../../shared/components/layout";
import MonthSelector from "./components/month_selector";

import StudentReport from "./student_report";
import AssistantReport from "./assistant_report";

const Report = () => {
  const { user, isLoading } = useAuth();
  const { topicId: routeTopicId } = useParams(); // optional preselect /report/:topicId

  const role = (user?.role || "").toLowerCase();
  const isAssistant = role === "assistant";
  const isDoc = role === "doc";

  // topics for selector
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState("");
  const [topics, setTopics] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // current selection
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedTopicName, setSelectedTopicName] = useState("—");

  // fetch topics for both roles
  useEffect(() => {
    (async () => {
      setTopicsLoading(true);
      setTopicsError("");
      try {
        const resp = await authFetch("GET", "topic/getAllTopics");
        const list = resp?.data?.topics || [];
        setTopics(list);

        // default selection: route id if present and matches, otherwise first topic
        let initial = null;
        if (routeTopicId) {
          const rId = Number(routeTopicId);
          initial = list.find((t) => Number(t.topicId) === rId) || null;
        }
        if (!initial) initial = list[0] || null;

        if (initial) {
          setSelectedTopicId(initial.topicId);
          setSelectedTopicName(initial.topicName || "—");
        } else {
          setSelectedTopicId(null);
          setSelectedTopicName("—");
        }
      } catch (e) {
        console.error(e);
        setTopicsError(
            typeof e?.message === "string" && e.message.trim()
                ? e.message
                : "Failed to load topics"
        );
        setSelectedTopicId(null);
        setSelectedTopicName("—");
      } finally {
        setTopicsLoading(false);
      }
    })();
  }, [routeTopicId]);

  const months = useMemo(() => topics.map((t) => t.topicName), [topics]);

  const handleSelectTopic = (name) => {
    const found = topics.find((t) => t.topicName === name);
    if (found) {
      setSelectedTopicId(found.topicId);
      setSelectedTopicName(found.topicName);
    }
    setIsDropdownOpen(false);
  };

  if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
      <Layout>
        <div className="report-container">
          <main className="main-content-report">
            <div className="title-report">
              <h1 className="greeting">
                Hello{" "}
                <span className="student-name">
                {isAssistant ? "Assistant" : user?.name || "Student"}
              </span>
              </h1>

              <span className="report-subtitle">
                Report for the topic 
                <MonthSelector
                  selectedMonth={selectedTopicName}
                  isDropdownOpen={isDropdownOpen}
                  months={months.length ? months : [selectedTopicName]}
                  onToggle={() => setIsDropdownOpen((o) => !o)}
                  onSelect={handleSelectTopic}
                  loading={topicsLoading}
                />
              {/* {selectedTopicName && selectedTopicName !== "—"
                  ? `${isAssistant ? "Class report" : "Weekly report"} • ${selectedTopicName}`
                  : isAssistant
                      ? "Class report"
                      : "Weekly report"} */}
            </span>

              
              {topicsError ? (
                  <div style={{ color: "crimson", marginTop: 8, fontSize: 12 }}>
                    {topicsError}
                  </div>
              ) : null}
            </div>

            {/* content: pass selected topicId to the role-specific page */}
            {selectedTopicId ? (
                isAssistant || isDoc ? (
                    <AssistantReport topicId={selectedTopicId} />
                ) : (
                    <StudentReport topicId={selectedTopicId} />
                )
            ) : (
                <div className="weekly-log">
                  <h2 className="log-title">{isAssistant ? "Class Report:" : "Weekly Report:"}</h2>
                  <div className="log-table student-flat-table">
                    <div className="log-row">
                      <div className="log-cell">No topic selected</div>
                    </div>
                  </div>
                </div>
            )}
          </main>
        </div>
      </Layout>
  );
};

export default Report;
