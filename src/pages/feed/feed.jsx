import { useState, useEffect, useCallback } from "react";
import Layout from "../../shared/components/layout";
import FeedItem from "./components/feed_item";
import FeedItemSkeleton from "./components/feed_item_skeleton";
import appColors from "../../shared/components/app_colors";
import { authFetch } from "../../utils/authFetch";
import { useAuth } from "../../hooks/useAuth";
import { isAssistant, isDoc } from "../../utils/roles";
import "./feed.css";

// bring modal styles here so any modal using ctm-* looks the same
import "../classroom/style/create_topic.css";
import CreateFeedCard from "./components/create_feed_card";

const Feed = () => {
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const { user, isLoading: authLoading } = useAuth();
  const canCreate = !!user && (isAssistant(user) || isDoc(user));

  const loadFeedData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("GET", "/feed");
      if (res?.status !== "success") {
        // If it's a 404, treat it as empty feed instead of error
        if (res?.message?.includes("404") || res?.statusCode === 404) {
          setFeedItems([]);
          setLoading(false);
          return;
        }
        throw new Error(res?.message || "Failed to load feed");
      }
      const list = Array.isArray(res?.data) ? res.data : [];
      const normalized = list.map((item) => ({
        id: item.feedId,
        sender: item.adminName ? `Admin : ${item.adminName}` : "System",
        message: item.text,
        avatar: undefined,
        type: "system",
        dateAndTime: item.dateAndTime,
        semester: item.semester,
      }));
      setFeedItems(normalized);
    } catch (e) {
      console.error("loadFeed error:", e);
      // Also check if the error message contains 404
      if (e?.message?.includes("404")) {
        setFeedItems([]);
      } else {
        setError(e?.message || "Failed to load feed");
        setFeedItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Feed - Dr. Omar Khalid";
    loadFeedData();
  }, [loadFeedData]);

  const handleCreateFeed = async ({ text, semester }) => {
    setCreating(true);
    try {
      const res = await authFetch("POST", "/feed/postOnFeed", { text, semester });
      if (res?.status !== "success") {
        throw new Error(res?.message || "Failed to post feed");
      }
      await loadFeedData();
    } catch (e) {
      console.error("createFeed error:", e);
      setError(e?.message || "Failed to post feed");
    } finally {
      setCreating(false);
    }
  };

  return (
      <Layout bgColor={appColors.chemCard}>
        <div className="feed-container">
          <div className="feed-content">
            <h1 className="feed-title">Feed</h1>

            {error && (
                <div className="alert-banner" style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#b91c1c" strokeWidth="2"/>
                    <path d="M10 6V10" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10" cy="13" r="0.5" fill="#b91c1c" stroke="#b91c1c"/>
                  </svg>
                  <span style={{ color: "#b91c1c", flex: 1 }}>{error}</span>
                </div>
            )}

            {feedItems.length === 0 && !loading && !error && (
                <div className="alert-banner" style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#2563eb" strokeWidth="2"/>
                    <path d="M10 10V14" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10" cy="7" r="0.5" fill="#2563eb" stroke="#2563eb"/>
                  </svg>
                  <span style={{ color: "#2563eb", flex: 1 }}>No announcements yet</span>
                </div>
            )}

            <div className="feed-list">
              {!authLoading && canCreate && (
                  <CreateFeedCard loading={creating} onSubmit={handleCreateFeed} />
              )}

              {loading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <FeedItemSkeleton key={index} />
                    ))}
                  </>
              ) : (
                  feedItems.map((item) => (
                      <FeedItem
                          key={item.id}
                          sender={item.sender}
                          message={item.message}
                          avatar={item.avatar}
                          type={item.type}
                      />
                  ))
              )}
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default Feed;