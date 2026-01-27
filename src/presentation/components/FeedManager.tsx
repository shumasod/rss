import React, { useState } from 'react';

interface FeedManagerProps {
  onAddFeed: (url: string) => Promise<boolean>;
  loading: boolean;
}

const PRESET_FEEDS = [
  // ニュース - 日本
  { name: 'Yahoo!ニュース', url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml', category: 'news-jp' },
  { name: 'NHKニュース', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', category: 'news-jp' },
  { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/', category: 'news-jp' },
  { name: '朝日新聞', url: 'https://www.asahi.com/rss/asahi/newsheadlines.rdf', category: 'news-jp' },
  { name: '毎日新聞', url: 'https://mainichi.jp/rss/etc/mainichi-flash.rss', category: 'news-jp' },
  // テック
  { name: 'ITmedia', url: 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml', category: 'tech' },
  { name: 'TechCrunch Japan', url: 'https://jp.techcrunch.com/feed/', category: 'tech' },
  { name: 'Publickey', url: 'https://www.publickey1.jp/atom.xml', category: 'tech' },
  { name: 'Zenn', url: 'https://zenn.dev/feed', category: 'tech' },
  { name: 'Qiita', url: 'https://qiita.com/popular-items/feed', category: 'tech' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'tech' },
  // 経済・株式
  { name: '日経電子版', url: 'https://www.nikkei.com/news/category/rss.xml', category: 'finance' },
  { name: 'ロイター', url: 'https://jp.reuters.com/rssFeed/topNews', category: 'finance' },
  { name: '東洋経済', url: 'https://toyokeizai.net/list/feed/rss', category: 'finance' },
  { name: 'Diamond Online', url: 'https://diamond.jp/list/feed/rss', category: 'finance' },
  // 海外ニュース
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', category: 'news-intl' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'news-intl' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'news-intl' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'news-intl' },
  // エンタメ・ライフスタイル
  { name: 'はてなブックマーク', url: 'https://b.hatena.ne.jp/hotentry.rss', category: 'entertainment' },
  { name: 'ねとらぼ', url: 'https://nlab.itmedia.co.jp/nl/rss/2.0/nlab_all.xml', category: 'entertainment' },
  { name: 'Togetter', url: 'https://togetter.com/rss/hot', category: 'entertainment' },
  { name: 'Game Watch', url: 'https://game.watch.impress.co.jp/data/rss/1.0/gmw/feed.rdf', category: 'entertainment' },
];

const FEED_CATEGORIES = [
  { id: 'all', name: 'すべて', icon: '📰' },
  { id: 'news-jp', name: '国内ニュース', icon: '🗾' },
  { id: 'news-intl', name: '海外ニュース', icon: '🌍' },
  { id: 'tech', name: 'テクノロジー', icon: '💻' },
  { id: 'finance', name: '経済・株式', icon: '📈' },
  { id: 'entertainment', name: 'エンタメ', icon: '🎮' },
];

export const FeedManager: React.FC<FeedManagerProps> = ({ onAddFeed, loading }) => {
  const [url, setUrl] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const filteredFeeds = selectedCategory === 'all'
    ? PRESET_FEEDS
    : PRESET_FEEDS.filter((feed) => feed.category === selectedCategory);

  return (
    <div className="feed-manager">
      <h2>📡 RSS フィード管理</h2>

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
        <div className="feed-category-tabs">
          {FEED_CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              disabled={loading}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
        <div className="preset-buttons">
          {filteredFeeds.map((preset) => (
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
