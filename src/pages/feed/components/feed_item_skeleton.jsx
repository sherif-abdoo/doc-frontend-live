import React from 'react';
import '../style/feed_item_skeleton_style.css';

const FeedItemSkeleton = () => {
  return (
    <div className="feed-item-skeleton">
      <div className="skeleton-avatar"></div>
      <div className="skeleton-content">
        <div className="skeleton-sender"></div>
        <div className="skeleton-message"></div>
      </div>
    </div>
  );
};

export default FeedItemSkeleton;