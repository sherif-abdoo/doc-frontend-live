import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./not_found.css";
import React, { useEffect } from "react"; 

const NotFound = () => {
  useEffect(() => {
    document.title = 'Page Not Found';
  }, []); 
  return (
    <div className="not-found-container">
      {/* 404 Image */}
      <img 
        src="/assets/NotFound/404.png" 
        alt="404 Not Found" 
        className="not-found-img"
      />

      {/* Text */}
      <h1>Page Not Found</h1>
      <p>
        Looks like this page got an F in existing... <br />
        Better get back to the homepage
      </p>

      {/* Back Home Button */}
      <Link to="/home" className="back-home-btn">
        <ArrowLeft size={22} className="back-icon" />
        Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
