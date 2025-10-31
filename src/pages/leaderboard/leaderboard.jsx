import { useState, useEffect, useCallback } from "react";
import "./leaderboard.css";
import Layout from "../../shared/components/layout";
import LeaderboardHeader from "./components/leaderboard_header";
import LeaderboardTable from "./components/leaderboard_table";
import Pagination from "./components/pagination";
import { authFetch } from "../../utils/authFetch";

const LeaderboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [rows, setRows] = useState([]);        // current page rows
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageBaseSize, setPageBaseSize] = useState(6); // used to compute global rank offsets
  const [loggedUser, setLoggedUser] = useState(null);  // { name, grade, rank }

  const loadPage = useCallback(async (page) => {
    setLoading(true);
    try {
      const res = await authFetch("GET", `/leaderBoard/?page=${page}`);
      if (res?.status !== "success") {
        throw new Error(res?.message || "Failed to load leaderboard");
      }

      const pag = res?.data?.pagination || {};
      const list = Array.isArray(res?.data?.leaderboard) ? res.data.leaderboard : [];
      const me = res?.data?.student || null;

      setTotalPages(Number(pag.totalPages || 1));
      setTotalStudents(Number(pag.totalStudents || list.length));

      // pageBaseSize: assume near-constant page size across pages
      const base = pag.totalPages
          ? Math.ceil(Number(pag.totalStudents || list.length) / Number(pag.totalPages))
          : list.length || 6;
      setPageBaseSize(base);

      // map API -> table shape
      const mapped = list.map((s) => ({
        id: s.studentId,
        name: s.studentName,
        grade: Number(s.totalScore) || 0,
      }));
      setRows(mapped);

      // logged-in user info (rank may be string)
      if (me && (me.rank != null)) {
        setLoggedUser({
          name: "You",
          grade: Number(me.score) || 0,
          rank: Number(me.rank),
        });
      } else {
        setLoggedUser(null);
      }
    } catch (e) {
      console.error("leaderboard load error:", e);
      // fallbacks
      setRows([]);
      setTotalPages(1);
      setTotalStudents(0);
      setLoggedUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Leaderboard - Dr. Omar Khalid";
  }, []);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage, loadPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // global rank start index for this page
  const startIndex = (currentPage - 1) * pageBaseSize;
  const itemsPerPage = rows.length || pageBaseSize; // table uses this for spacing/coloring

  return (
      <Layout>
        <div className="page">
          <div className="content">
            <LeaderboardHeader />
            <LeaderboardTable
                data={rows}
                startIndex={startIndex}
                loggedInUser={loggedUser}
                itemsPerPage={itemsPerPage}
                loading={loading}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
            />
          </div>
        </div>
      </Layout>
  );
};

export default LeaderboardPage;
