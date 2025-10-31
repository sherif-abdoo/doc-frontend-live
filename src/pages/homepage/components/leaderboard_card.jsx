import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {authFetch} from "../../../utils/authFetch";

// LeaderboardCard Component with dynamic student list (page 1 only)
const LeaderboardCard = () => {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4);
  const [leaders, setLeaders] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef(null);
  const listRef = useRef(null);

  // fetch first page only
  useEffect(() => {
    let cancelled = false;
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const res = await authFetch("GET", "/leaderBoard/?page=1");
        if (res?.status !== "success") {
          throw new Error(res?.message || "Failed to load leaderboard");
        }


        const list = Array.isArray(res?.data?.leaderboard)
            ? res.data.leaderboard
            : [];

        // Normalize to { name, score, id }
        const mapped = list.map((s) => ({
          id: s.studentId,
          name: s.studentName,
          score: Number(s.totalScore) || 0,
        }));

        const me = res?.data?.student;
        const rankNum = me?.rank ;

        if (!cancelled) {
          setLeaders(mapped);
          setUserRank(rankNum);
        }
      } catch (e) {
        console.error("leaderboard card load error:", e);
        if (!cancelled) {
          setLeaders([]);
          setUserRank(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFirstPage();
    return () => {
      cancelled = true;
    };
  }, []);

  const calculateVisibleItems = useCallback(() => {
    if (!cardRef.current || !listRef.current) return;
    const cardHeight = cardRef.current.clientHeight;

    const titleEl = cardRef.current.querySelector(".card-title");
    const rankEl = cardRef.current.querySelector(".leaderboard-rank");

    const titleHeight = titleEl?.offsetHeight || 0;
    const rankHeight = rankEl?.offsetHeight || 0;

    // tune these to your actual card paddings/margins
    const padding = 30;
    const margins = 24;

    const availableHeight = cardHeight - titleHeight - rankHeight - padding - margins;

    const firstItem = listRef.current.querySelector(".leaderboard-item");
    if (firstItem) {
      const itemHeight = firstItem.offsetHeight;
      const itemMargin = 10; // matches your CSS margin-bottom
      const totalItemHeight = itemHeight + itemMargin;

      const count = Math.floor(availableHeight / totalItemHeight);
      setVisibleCount(Math.max(0, Math.min(count, leaders.length)));
    }
  }, [leaders.length]);

  // recalc on mount, resize, and when leaders change (after render)
  useEffect(() => {
    calculateVisibleItems();
    const onResize = () => calculateVisibleItems();
    window.addEventListener("resize", onResize);

    // after layout settles
    const t = setTimeout(calculateVisibleItems, 100);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [calculateVisibleItems, leaders]);

  const visibleLeaders = leaders.slice(0, visibleCount);

  return (
      <div
          ref={cardRef}
          className="card leaderboard-card"
          onClick={() => navigate("/leaderboard")}
          style={{ cursor: "pointer" }}
      >
        <h2 className="card-title">Leaderboard</h2>

        <p className="leaderboard-rank">
          {loading
              ? "Loading your rank…"
              : userRank != null
                  ? `You are ranked : ${userRank}`
                  : "Your rank: —"}
        </p>

        <ul ref={listRef} className="card-list">
          {loading && leaders.length === 0 ? (
              // simple skeletons; swap with your skeleton component if you have one
              Array.from({ length: 4 }).map((_, i) => (
                  <li key={`sk-${i}`} className="leaderboard-item" style={{ opacity: 0.6 }}>
                    <div className="leader-info">
                <span className="medal">
                  <img src="/assets/Dashboard/Leaderboard-Bulletpoint.png" alt="trophy" />
                </span>
                      <span className="leaderboard-name">Loading…</span>
                    </div>
                    <span className="score">--</span>
                  </li>
              ))
          ) : visibleLeaders.length === 0 ? (
              <li className="leaderboard-item" style={{ opacity: 0.7 }}>
                <div className="leader-info">
              <span className="medal">
                <img src="/assets/Dashboard/Leaderboard-Bulletpoint.png" alt="trophy" />
              </span>
                  <span className="leaderboard-name">No data yet</span>
                </div>
                <span className="score">--</span>
              </li>
          ) : (
              visibleLeaders.map((leader) => (
                  <li key={leader.id} className="leaderboard-item">
                    <div className="leader-info">
                <span className="medal">
                  <img
                      src="/assets/Dashboard/Leaderboard-Bulletpoint.png"
                      alt="trophy"
                  />
                </span>
                      <span className="leaderboard-name">{leader.name}</span>
                    </div>
                    <span className="score">{leader.score}</span>
                  </li>
              ))
          )}
        </ul>
      </div>
  );
};

export default LeaderboardCard;
