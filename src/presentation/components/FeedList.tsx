import React from 'react';
import { Feed } from '@domain/entities/Feed';

interface FeedListProps {
  feeds: Feed[];
  onRemoveFeed: (feedId: string) => void;
  loading: boolean;
}

export const FeedList: React.FC<FeedListProps> = ({ feeds, onRemoveFeed, loading }) => {
  if (feeds.length === 0) {
    return (
      <div className="feed-list">
        <h2>登録フィード一覧</h2>
        <p className="empty-message">登録されているフィードはありません</p>
      </div>
    );
  }

  return (
    <div className="feed-list">
      <h2>登録フィード一覧</h2>
      <div className="registered-feeds">
        {feeds.map((feed) => (
          <div key={feed.id.value} className="feed-item">
            <div className="feed-info">
              <div className="feed-name">{feed.name.value}</div>
              <div className="feed-url">{feed.url.value}</div>
            </div>
            <button
              className="remove-feed-btn"
              onClick={() => onRemoveFeed(feed.id.value)}
              disabled={loading}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
