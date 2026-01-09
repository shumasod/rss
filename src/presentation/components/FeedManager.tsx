import React, { useState } from 'react';

interface FeedManagerProps {
  onAddFeed: (url: string) => Promise<boolean>;
  loading: boolean;
}

const PRESET_FEEDS = [
  { name: 'Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml' },
  { name: 'NHKニュース', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml' },
  { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/' },
];

export const FeedManager: React.FC<FeedManagerProps> = ({ onAddFeed, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      const success = await onAddFeed(url.trim());
      if (success) {
        setUrl('');
      }
    }
  };

  const handlePresetClick = async (presetUrl: string) => {
    await onAddFeed(presetUrl);
  };

  return (
    <div className="feed-manager">
      <h2>RSS フィード管理</h2>

      <form onSubmit={handleSubmit} className="add-feed-form">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="RSSフィードのURLを入力"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !url.trim()}>
          フィード追加
        </button>
      </form>

      <div className="preset-feeds">
        <h3>プリセットフィード</h3>
        <div className="preset-buttons">
          {PRESET_FEEDS.map((preset) => (
            <button
              key={preset.url}
              className="preset-btn"
              onClick={() => handlePresetClick(preset.url)}
              disabled={loading}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
