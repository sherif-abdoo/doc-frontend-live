import React from 'react';
import '../style/feed_item_style.css';

const FeedItem = ({ avatar, sender, message, type = 'assistant' }) => {
  return (
    <div className="feed-item">
      <div className="feed-header">
        <div className="feed-avatar">
          {type === 'system' ? (
            <span className="system-icon">🔔</span>
          ) : (
            <img src={avatar} alt={sender} />
          )}
        </div>
        <div className="feed-sender">{sender}</div>
      </div>
      <div className="feed-message">{message}</div>
    </div>
  );
};

export default FeedItem;