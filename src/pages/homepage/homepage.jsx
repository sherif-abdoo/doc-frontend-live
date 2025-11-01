import React, { useEffect } from "react";
import Layout from "../../shared/components/layout";
import "./homepage.css";

// Import cards
import QuizCard from "./components/quiz_card";
import HomeworkCard from "./components/homework_card";
import ToDoCard from "./components/todo_card";
import QuoteCard from "./components/quote_card";
import LeaderboardCard from "./components/leaderboard_card";
import CalendarCard from "./components/calendar_card";

const HomePage = () => {
  useEffect(() => {
      document.title = "Home - Dr. Omar Khalid";
    }, []);
  
  return (
    <Layout>
      <div className="homepage-container">
        <div className="top-grid">
          <QuizCard />
          <HomeworkCard />
          <ToDoCard />
        </div>
        
        <div className="bottom-grid">
          <div className="left-column">
            <QuoteCard />
            <LeaderboardCard />
          </div>
          <CalendarCard />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
