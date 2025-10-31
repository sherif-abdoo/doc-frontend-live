import React, { useEffect } from "react";
import appColors from "../../shared/components/app_colors";
import Layout from "../../shared/components/layout";
import LiveClassList from "./components/live_class_list";
import TopicGrid from "./components/topic_grid";
import "./classroom.css";

const Classroom = () => {
  useEffect(() => {
    document.title = "Classroom - Dr. Omar Khalid";
  }, []);

  const liveClasses = [
    {
      subject: "Physics: Understanding Motion",
      date: "Monday, Sep 10th",
      time: "10:00 AM PST",
    },
  ];

  return (
    <Layout>
      <div className="classroom-container">
        <main className="main-content-classroom">
          <h1 className="classroom-title">Classroom</h1>

          <h2 className="section-title">Live Classes:</h2>
          <LiveClassList liveClasses={liveClasses} />


          <h2 className="section-title">Browse Topics:</h2>
          <TopicGrid />
        </main>
      </div>
    </Layout>
  );
};

export default Classroom;