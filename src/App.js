import "./App.css";
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import React, { Suspense } from "react";

import appColors from "./shared/components/app_colors";
import { AuthProvider, useAuth } from "./context/authContext";
import SSEBridge from "./utils/SSEBridge";
import SubmissionDetails from "./shared/components/submission/submission_details";

// lazy imports
const LandingPage     = React.lazy(() => import("./pages/landing_page/landing_page"));
const LeaderboardPage = React.lazy(() => import("./pages/leaderboard/leaderboard"));
const Classroom       = React.lazy(() => import("./pages/classroom/classroom"));
const Homework        = React.lazy(() => import("./pages/homework/homework"));
const HomeworkDetails = React.lazy(() => import("./pages/homework/homework_details"));
const QuizDetails     = React.lazy(() => import("./pages/quiz/quiz_details"));
const NotFound        = React.lazy(() => import("./pages/not_found/not_found"));
const Report          = React.lazy(() => import("./pages/report/report"));
const Signup          = React.lazy(() => import("./pages/auth/sign_up_page"));
const Login           = React.lazy(() => import("./pages/auth/login_page"));
const TopicDetailPage = React.lazy(() => import("./pages/classroom/topic_detail"));
const Quiz            = React.lazy(() => import("./pages/quiz/quiz"));
const Homepage        = React.lazy(() => import("./pages/homepage/homepage"));
const Feed            = React.lazy(() => import("./pages/feed/feed"));
const Pending         = React.lazy(() => import("./pages/pending_students/pending_page"));
const AddMaterials    = React.lazy(() => import("./pages/add_materials/add_materials"));
const MaterialDetails = React.lazy(() => import("./pages/add_materials/material_detials"));

Object.keys(appColors).forEach((key) => {
    document.documentElement.style.setProperty(`--${key}`, appColors[key]);
});

// simple loader
function RouteLoader() {
    return <div style={{ padding: 24 }}>Loading…</div>;
}

// guard uses a tiny “auth ready” inference
function useAuthStatus() {
    const { isAuthed, isAuthReady } = useAuth() || {};
    const loading = typeof isAuthReady === "boolean" ? !isAuthReady : typeof isAuthed !== "boolean";
    return { isAuthed: !!isAuthed, loading };
}

function RequireAuth() {
    const location = useLocation();
    const { isAuthed, loading } = useAuthStatus();
    if (loading) return <RouteLoader />;
    return isAuthed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

function PublicOnly() {
    const location = useLocation();
    const { isAuthed, loading } = useAuthStatus();
    if (loading) return <RouteLoader />;
    return isAuthed ? <Navigate to="/home" replace state={{ from: location }} /> : <Outlet />;
}

function NotFoundRedirect() {
    const { isAuthed, loading } = useAuthStatus();
    if (loading) return <RouteLoader />;
    return isAuthed ? <NotFound /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route element={<PublicOnly />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            <Route element={<RequireAuth />}>
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/classroom" element={<Classroom />} />
                <Route path="/classroom/topics/:topicId" element={<TopicDetailPage />} />
                <Route path="/homework" element={<Homework />} />
                <Route path="/homework/:id" element={<HomeworkDetails />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz/:id" element={<QuizDetails />} />
                <Route path="/report" element={<Report />} />
                <Route path="/home" element={<Homepage />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/pending" element={<Pending />} />
                <Route path="/materials" element={<AddMaterials />} />
                <Route path="/materials/:id" element={<MaterialDetails />} />
                <Route path="/answer/:id" element={<SubmissionDetails type="answer" />} />
            </Route>

            <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <SSEBridge />
            <HashRouter>
                <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
                    <AppRoutes />
                </Suspense>
            </HashRouter>
        </AuthProvider>
    );
}
