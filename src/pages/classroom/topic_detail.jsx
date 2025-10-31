import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../shared/components/sidebar";
import appColors from "../../shared/components/app_colors";
import VideoLessons from "./components/video_lessons";
import {authFetch} from "../../utils/authFetch";
import "./classroom.css";
import { Layers } from "lucide-react";
import Layout from "../../shared/components/layout";

const subjectBgMap = {
    Biology: appColors.bioCard,
    Chemistry: appColors.chemCard,
    Physics: appColors.physCard,
};

const TopicDetailPage = () => {
    const { topicId } = useParams();

    const [loading, setLoading] = useState(true);
    const [topicData, setTopicData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let isActive = true;
        const controller = new AbortController();

        const fetchTopic = async () => {
            setLoading(true);
            setError("");
            try {
                const url = `/topic/get_topic_by_id/${encodeURIComponent(
                    topicId
                )}`;

                const res = await authFetch("GET",url);

                console.log(res);
                if (! res.status === "success") {
                    throw new Error(`Request failed with status ${res.status}`);
                }


                if (!isActive) return;
                setTopicData(res.data);
            } catch (e) {
                if (!isActive) return;
                setError(e.message || "Failed to load topic");
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchTopic();
        return () => {
            isActive = false;
            controller.abort();
        };
    }, [topicId]);

    useEffect(() => {
        if (topicData?.topicName) {
            document.title = topicData.topicName;
        }
    }, [topicData]);


    const sidebarColor =
        subjectBgMap[topicData?.subject] ?? appColors.chemCard;

    if (loading) {
        return (
            <div className="classroom-container">
                <Sidebar bgColor={sidebarColor} />
                <main className="main-content">
                    <h1 className="classroom-title">Loading…</h1>
                    <p>Please wait while we fetch the topic details.</p>
                </main>
            </div>
        );
    }

    if (error || !topicData) {
        return (
            <div className="classroom-container">
                <Sidebar bgColor={sidebarColor} />
                <main className="main-content">
                    <h1 className="classroom-title">Topic Not Found</h1>
                    <p style={{ opacity: 0.8 }}>
                        {error
                            ? `Sorry, something went wrong: ${error}`
                            : "Sorry, we couldn't find the topic you were looking for."}
                    </p>
                </main>
            </div>
        );
    }

    return (
        <Layout>
        <div className="classroom-container">

            <main className="main-content-classroom">
                <h1 className="classroom-title">
                    {topicData.topicName}
                </h1>

                <div style={{ marginBottom: 10, opacity: 0.8 }}>
                    <small>
                        Subject: <strong>{topicData.subject}</strong> • Semester:{" "}
                        <strong>{topicData.semester}</strong>
                    </small>
                </div>

                <h2 className="section-title">Materials : </h2>
                <VideoLessons lessons={topicData.materials} type="Materials" />

                <h2 className="section-title">Assignments : </h2>
                <VideoLessons lessons={topicData.assignments} type="Assignments" />

                <h2 className="section-title">Quizzes : </h2>
                <VideoLessons lessons={topicData.quizzes} type= "Quizzes" />
            </main>
        </div>
        </Layout>
    );
};

export default TopicDetailPage;
