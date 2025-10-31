// src/pages/admin/PendingPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../shared/components/layout";
import AlertBanner from "../../shared/components/alert_banner";
import { authFetch } from "../../utils/authFetch";
import PendingStudentsGrid from "./components/pending_students_grid";
import AreYouSureModal from "../../shared/components/are_you_sure.jsx";
import { useAuth } from "../../hooks/useAuth";
import { isDoc } from "../../utils/roles"; // ✅ teacher checker

const normalizeStudent = (raw) => ({
    id: raw?.id ?? raw?._id ?? raw?.email ?? undefined,
    name: raw?.name ?? "Unknown",
    email: raw?.email ?? "",
    group: raw?.group ?? "",
    phoneNumber: raw?.phoneNumber ?? raw?.phone ?? "",
    semester: raw?.semester ?? null,
});

const PendingPage = () => {
    const { user, isLoading } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: "", error: false });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [candidateReject, setCandidateReject] = useState(null);
    const [rejecting, setRejecting] = useState(false);

    const isTeacher = !isLoading && isDoc(user);

    // ✅ Load pending users based on role
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = isTeacher
                ? "dok/showPendingAssistantRegistration"
                : "admin/pendingRegistrations";

            const res = await authFetch("GET", endpoint);

            let list =
                res?.data?.data?.data ??
                res?.data?.data ??
                res?.data?.students ??
                res?.data?.pendingRegistrations ??
                [];

            if (!Array.isArray(list) && Array.isArray(res?.data)) list = res.data;
            if (!Array.isArray(list) && Array.isArray(res?.data?.data?.data?.data))
                list = res.data.data.data.data;

            if (!Array.isArray(list)) {
                console.warn("[PendingPage] Unexpected response structure:", res);
                list = [];
            }

            const normalized = list.map(normalizeStudent);
            setStudents(normalized);
        } catch (e) {
            console.error("[PendingPage] load error:", e);
            setAlert({
                open: true,
                message: e?.message || "Failed to load pending registrations",
                error: true,
            });
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [isTeacher]);

    useEffect(() => {
        document.title = isTeacher ? "Pending Assistants" : "Pending Students";
        if (!isLoading) load();
    }, [isLoading, isTeacher, load]);

    // ✅ Accept handler — changes endpoint if teacher
    const handleAccept = async (student) => {
        if (!student?.email) {
            setAlert({ open: true, message: "Missing email for this entry.", error: true });
            return;
        }

        try {
            const endpoint = isTeacher
                ? `/dok/acceptAssistant/${encodeURIComponent(student.email)}`
                : `/admin/verifyStudent/${encodeURIComponent(student.email)}`;

            const res = await authFetch("PATCH", endpoint);
            const msg =
                res?.message ||
                res?.data?.message ||
                (isTeacher ? "Assistant accepted" : "Student verified");

            setStudents((prev) => prev.filter((s) => s.email !== student.email));
            setAlert({ open: true, message: msg, error: false });
        } catch (e) {
            console.error("[PendingPage] accept error:", e);
            setAlert({
                open: true,
                message: e?.message || "Failed to accept entry",
                error: true,
            });
        }
    };

    // 🗑️ Reject flow
    const requestReject = (student) => {
        setCandidateReject(student);
        setConfirmOpen(true);
    };

    const confirmReject = async () => {
        if (!candidateReject?.email) return;
        setRejecting(true);
        try {
            const res = await authFetch(
                "PATCH",
                `/admin/rejectStudent/${encodeURIComponent(candidateReject.email)}`
            );
            const msg = res?.message || res?.data?.message || "Rejected successfully";
            setStudents((prev) => prev.filter((s) => s.email !== candidateReject.email));
            setAlert({ open: true, message: msg, error: false });
        } catch (e) {
            setAlert({
                open: true,
                message: e?.message || "Failed to reject student",
                error: true,
            });
        } finally {
            setRejecting(false);
            setConfirmOpen(false);
            setCandidateReject(null);
        }
    };

    return (
        <Layout>
            <AlertBanner
                open={alert.open}
                message={alert.message}
                error={alert.error}
                onClose={() => setAlert((p) => ({ ...p, open: false }))}
            />

            <AreYouSureModal
                open={confirmOpen}
                message={`Reject "${
                    candidateReject?.name ?? candidateReject?.email ?? "this user"
                }"?`}
                onConfirm={confirmReject}
                onClose={() => {
                    if (!rejecting) {
                        setConfirmOpen(false);
                        setCandidateReject(null);
                    }
                }}
                submitting={rejecting}
                confirmLabel={rejecting ? "Rejecting…" : "Sure"}
                cancelLabel="No"
            />

            <PendingStudentsGrid
                students={students}
                loading={loading}
                onAccept={handleAccept}
                onReject={requestReject}
            />
        </Layout>
    );
};

export default PendingPage;
