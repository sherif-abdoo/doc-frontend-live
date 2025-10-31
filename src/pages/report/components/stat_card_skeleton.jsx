import React from "react";
import { Skeleton } from "@mui/material";
import "../style/stat_card_style.css";

const StatCardSkeleton = ({ showProgress = false }) => {
  return (
    <div className="stat-card skeleton-stat-card">
      <div className="stat-header">
        <Skeleton 
          variant="text" 
          width="70%" 
          height={20}
          sx={{ fontSize: '1rem' }}
        />
      </div>
      <div className="stat-content">
        {showProgress ? (
          // Progress card skeleton
          <>
            <div className="stat-value">
              <Skeleton 
                variant="text" 
                width={60} 
                height={32}
                sx={{ fontSize: '1.5rem' }}
              />
            </div>
            <Skeleton 
              variant="circular" 
              width={90} 
              height={90}
            />
          </>
        ) : (
          // Grade card skeleton
          <div className="grade-display">
            <Skeleton 
              variant="text" 
              width={40} 
              height={48}
              sx={{ fontSize: '2rem', marginBottom: '8px' }}
            />
            <Skeleton 
              variant="text" 
              width={60} 
              height={20}
              sx={{ fontSize: '1rem' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCardSkeleton;
