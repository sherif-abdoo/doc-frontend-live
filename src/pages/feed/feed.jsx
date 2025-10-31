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
      setError(e?.message || "Failed to load feed");
      setFeedItems([]);
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
              ) : error ? (
                  <div className="feed-empty">
                    <p style={{ color: "#b91c1c" }}>{error}</p>
                  </div>
              ) : feedItems.length === 0 ? (
                  <div className="feed-empty">
                    <p>No announcements yet</p>
                  </div>
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
