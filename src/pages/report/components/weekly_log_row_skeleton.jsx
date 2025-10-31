import React from "react";
import { Skeleton } from "@mui/material";
import "../style/weekly_log_row_style.css";

const WeeklyLogRowSkeleton = () => {
  return (
    <div className="log-row skeleton-log-row">
      <div className="log-cell date">
        <Skeleton 
          variant="text" 
          width="80%" 
          height={20}
          sx={{ fontSize: '0.9rem' }}
        />
      </div>
      <div className="log-cell action">
        <Skeleton 
          variant="text" 
          width="90%" 
          height={20}
          sx={{ fontSize: '0.9rem' }}
        />
      </div>
      <div className="log-cell description">
        <Skeleton 
          variant="text" 
          width="85%" 
          height={20}
          sx={{ fontSize: '0.9rem' }}
        />
      </div>
    </div>
  );
};

export default WeeklyLogRowSkeleton;