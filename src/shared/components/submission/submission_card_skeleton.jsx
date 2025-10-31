import React from 'react';
import { Skeleton, Box } from '@mui/material';
import "../../style/submission/submission_card_style.css";

const SubmissionCardSkeleton = () => {
  return (
    <section className="submission-card skeleton-card">
      {/* Background Image Skeleton */}
      <div className="submission-image">
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height="100%" 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 'inherit'
          }}
        />
      </div>

      {/* Top Row */}
      <div className="submission-top-row">
        <div className="submission-content">
          {/* Title Skeleton */}
          <Skeleton 
            variant="text" 
            width="80%" 
            height={32}
            sx={{ 
              fontSize: '1.5rem',
              marginBottom: '8px'
            }}
          />
          
          {/* Due date Skeleton */}
          <Skeleton 
            variant="text" 
            width="60%" 
            height={20}
            sx={{ fontSize: '1rem' }}
          />
        </div>
        
        <div className="submission-button">
          {/* Button Skeleton */}
          <Skeleton 
            variant="rounded" 
            width={120} 
            height={40}
            sx={{ borderRadius: '8px' }}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="submission-bottom-row">
        <div className="submission-status">
          {/* Status Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="text" width={50} height={20} />
            <Skeleton variant="text" width={80} height={20} />
          </Box>
        </div>
      </div>
    </section>
  );
};

export default SubmissionCardSkeleton;