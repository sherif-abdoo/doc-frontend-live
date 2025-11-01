// src/shared/components/sidebar.jsx
import React, { useState, useEffect } from "react";
import SidebarButton from "./sidebar_button";
import "../style/sidebar_style.css";
import { useLocation } from "react-router-dom";
import appColors from "./app_colors";
import { useAuth } from "../../hooks/useAuth";
import { isAssistant, isDoc } from "../../utils/roles"; // ✅ import role helpers

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const { user, isLoading } = useAuth();

  // ✅ show Pending button for both Assistant & Teacher
  const showPending =
      !isLoading && (isAssistant(user) || isDoc(user));

  useEffect(() => {
    const checkMobile = () => {
      const isSmallScreen = window.innerWidth <= 900 || window.innerHeight <= 500;
      setIsMobile(isSmallScreen);
      if (!isSmallScreen) setIsExpanded(false);
    };


    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsExpanded(false);
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const closeSidebar = () => setIsExpanded(false);

  return (
      <>
        {/* Hamburger Menu Button (Mobile Only) */}
        {isMobile && (
            <button
                className={`hamburger-btn ${isExpanded ? "open" : ""}`}
                onClick={toggleSidebar}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
        )}

        {/* Overlay */}
        {isExpanded && <div className="sidebar-overlay" onClick={closeSidebar} />}

        {/* Sidebar */}
        <div
            className={`sidebar ${isExpanded ? "expanded" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ backgroundColor: appColors.chemCard }}
        >
          <div className="logo">
            <img src="/assets/logo.png" alt="Logo" />
          </div>

          <div className="nav-icons">
            <SidebarButton
                icon={"/assets/Sidebar/Home-Icon.png"}
                label="Home"
                isExpanded={isExpanded}
                active={location.pathname === "/home"}
                to="/home"
                onClick={isMobile ? closeSidebar : undefined}
            />
            <SidebarButton
                icon={"/assets/Sidebar/Classroom-Icon.png"}
                label="Classroom"
                isExpanded={isExpanded}
                active={location.pathname === "/classroom"}
                to="/classroom"
                onClick={isMobile ? closeSidebar : undefined}
            />
            <SidebarButton
                icon={"/assets/Sidebar/materials_icon.png"}
                label="Materials"
                isExpanded={isExpanded}
                active={location.pathname === "/materials"}
                to="/materials"
                onClick={isMobile ? closeSidebar : undefined}
            />
            <SidebarButton
                icon={"/assets/Sidebar/Homework-Icon.png"}
                label="Homework"
                isExpanded={isExpanded}
                active={location.pathname === "/homework"}
                to="/homework"
                onClick={isMobile ? closeSidebar : undefined}
            />
            <SidebarButton
                icon={"/assets/Sidebar/Quizzes-Icon.png"}
                label="Quizzes"
                isExpanded={isExpanded}
                active={location.pathname === "/quiz"}
                to="/quiz"
                onClick={isMobile ? closeSidebar : undefined}
            />
            <SidebarButton
                icon={"/assets/Sidebar/Report-Icon.png"}
                label="Report"
                isExpanded={isExpanded}
                active={location.pathname === "/report"}
                to="/report"
                onClick={isMobile ? closeSidebar : undefined}
            />
            {showPending && (
                <SidebarButton
                    icon={"/assets/Sidebar/pending.png"}
                    label="Pending"
                    isExpanded={isExpanded}
                    active={location.pathname === "/pending"}
                    to="/pending"
                    onClick={isMobile ? closeSidebar : undefined}
                />
            )}
            <SidebarButton
                icon={"/assets/Sidebar/Feed-Icon.png"}
                label="Feed"
                isExpanded={isExpanded}
                active={location.pathname === "/feed"}
                to="/feed"
                onClick={isMobile ? closeSidebar : undefined}
            />
          </div>

          <div className="bottom-icon">
            
          </div>
        </div>
      </>
  );
};

export default Sidebar;
