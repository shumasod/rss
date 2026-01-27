import React, { useState, useCallback } from 'react';

interface VideoItem {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoId: string;
  publishedAt: string;
  description: string;
  platform: 'youtube' | 'niconico' | 'twitch';
}

interface VideoPlayerProps {
  onNavigateToLP?: () => void;
}

// サンプル動画データ（実際にはRSSフィードから取得）
const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: '【最新テクノロジー解説】AI革命の行方 2026年の展望',
    channelTitle: 'テックニュース Japan',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoId: 'dQw4w9WgXcQ',
    publishedAt: '2026-01-27T10:00:00Z',
    description: 'AI技術の最新動向と2026年の予測について解説します。',
    platform: 'youtube'
  },
  {
    id: '2',
    title: '株式投資入門 - 低位株で資産を増やす方法',
    channelTitle: '投資チャンネル',
    thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    videoId: 'jNQXAC9IVRw',
    publishedAt: '2026-01-26T15:30:00Z',
    description: '初心者向けの株式投資講座。低位株投資のコツを伝授。',
    platform: 'youtube'
  },
  {
    id: '3',
    title: 'プログラミング初心者講座 - Reactを1から学ぶ',
    channelTitle: 'コーディングマスター',
    thumbnailUrl: 'https://i.ytimg.com/vi/Ke90Tje7VS0/maxresdefault.jpg',
    videoId: 'Ke90Tje7VS0',
    publishedAt: '2026-01-25T12:00:00Z',
    description: 'Reactの基礎から実践まで、完全解説シリーズ第1回',
    platform: 'youtube'
  },
  {
    id: '4',
    title: '世界のニュースダイジェスト - 国際情勢まとめ',
    channelTitle: 'グローバルニュース',
    thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    videoId: '9bZkp7q19f0',
    publishedAt: '2026-01-27T08:00:00Z',
    description: '今週の世界の重要ニュースを15分でまとめてお届け',
    platform: 'youtube'
  },
  {
    id: '5',
    title: '【料理】簡単！10分で作れる絶品パスタレシピ5選',
    channelTitle: 'おうちシェフ',
    thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    videoId: 'kJQP7kiw5Fk',
    publishedAt: '2026-01-24T18:00:00Z',
    description: '忙しい日でもすぐ作れる簡単パスタレシピを紹介',
    platform: 'youtube'
  },
  {
    id: '6',
    title: 'ゲーム実況 - 話題の新作RPGをプレイ！',
    channelTitle: 'ゲーム配信者',
    thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
    videoId: 'fJ9rUzIMcZQ',
    publishedAt: '2026-01-26T20:00:00Z',
    description: '2026年最注目の新作RPGを初見プレイ',
    platform: 'youtube'
  },
  {
    id: '7',
    title: '【Vlog】東京散歩 - 隠れた名店を巡る旅',
    channelTitle: 'トラベラーYuki',
    thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/maxresdefault.jpg',
    videoId: 'RgKAFK5djSk',
    publishedAt: '2026-01-23T14:00:00Z',
    description: '東京の下町を歩きながら隠れた名店を探訪',
    platform: 'youtube'
  },
  {
    id: '8',
    title: '音楽制作講座 - DTM入門ガイド完全版',
    channelTitle: 'ミュージックプロ',
    thumbnailUrl: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/maxresdefault.jpg',
    videoId: '2Vv-BfVoq4g',
    publishedAt: '2026-01-22T11:00:00Z',
    description: '初心者でもわかるDTM講座。無料ソフトで始める音楽制作',
    platform: 'youtube'
  }
];

const VIDEO_CATEGORIES = [
  { id: 'all', name: 'すべて', icon: '📺' },
  { id: 'tech', name: 'テクノロジー', icon: '💻' },
  { id: 'finance', name: '投資・経済', icon: '💹' },
  { id: 'entertainment', name: 'エンタメ', icon: '🎮' },
  { id: 'lifestyle', name: 'ライフスタイル', icon: '🌟' },
  { id: 'education', name: '教育', icon: '📚' }
];

export const VideoPlayer: React.FC<VideoPlayerProps> = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [videos] = useState<VideoItem[]>(SAMPLE_VIDEOS);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'たった今';
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP');
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.channelTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
    setIsTheaterMode(false);
  };

  const getEmbedUrl = (video: VideoItem) => {
    switch (video.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;
      case 'niconico':
        return `https://embed.nicovideo.jp/watch/${video.videoId}`;
      default:
        return '';
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-header">
        <h2>🎬 動画ビューアー</h2>
        <p className="video-subtitle">RSS経由で取得した動画を視聴できます</p>
      </div>

      {/* 検索・フィルター */}
      <div className="video-controls">
        <div className="video-search">
          <input
            type="text"
            placeholder="動画を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="video-search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="video-category-tabs">
          {VIDEO_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`video-category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 動画プレーヤー（選択時） */}
      {selectedVideo && (
        <div className={`video-player-wrapper ${isTheaterMode ? 'theater-mode' : ''}`}>
          <div className="video-player-header">
            <h3>{selectedVideo.title}</h3>
            <div className="video-player-actions">
              <button
                className="theater-btn"
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? '通常モード' : 'シアターモード'}
              >
                {isTheaterMode ? '🔲' : '🖥️'}
              </button>
              <button className="close-player-btn" onClick={handleClosePlayer}>
                ✕
              </button>
            </div>
          </div>
          <div className="video-embed-container">
            <iframe
              src={getEmbedUrl(selectedVideo)}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="video-info">
            <div className="video-channel">
              <span className="channel-icon">📺</span>
              <span className="channel-name">{selectedVideo.channelTitle}</span>
              <span className="video-date">{formatDate(selectedVideo.publishedAt)}</span>
            </div>
            <p className="video-description">{selectedVideo.description}</p>
          </div>
        </div>
      )}

      {/* 動画グリッド */}
      <div className="video-grid">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className={`video-card ${selectedVideo?.id === video.id ? 'selected' : ''}`}
            onClick={() => handleVideoSelect(video)}
          >
            <div className="video-thumbnail">
              <div className="thumbnail-placeholder">
                <span className="play-icon">▶</span>
                <span className="platform-badge">
                  {video.platform === 'youtube' ? '📺 YouTube' :
                   video.platform === 'niconico' ? '📺 ニコニコ' : '📺 Twitch'}
                </span>
              </div>
            </div>
            <div className="video-card-info">
              <h4 className="video-title">{video.title}</h4>
              <div className="video-meta">
                <span className="video-channel-name">{video.channelTitle}</span>
                <span className="video-published">{formatDate(video.publishedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="no-videos">
          <p>🔍 検索条件に一致する動画がありません</p>
        </div>
      )}

      {/* YouTube RSSフィード追加のヒント */}
      <div className="video-tips">
        <h3>💡 YouTube チャンネルをRSSで購読する方法</h3>
        <div className="tip-content">
          <p>YouTubeチャンネルのRSSフィードURLは以下の形式です：</p>
          <code>https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID</code>
          <p className="tip-note">
            ※ チャンネルIDは、YouTubeチャンネルページのURLから確認できます
          </p>
        </div>
      </div>

      {/* おすすめチャンネル */}
      <div className="recommended-channels">
        <h3>🌟 おすすめチャンネル</h3>
        <div className="channel-list">
          <div className="channel-item">
            <span className="channel-icon">🔬</span>
            <div className="channel-details">
              <span className="channel-name">テック系</span>
              <span className="channel-desc">最新技術ニュース</span>
            </div>
          </div>
          <div className="channel-item">
            <span className="channel-icon">📈</span>
            <div className="channel-details">
              <span className="channel-name">投資・経済</span>
              <span className="channel-desc">マーケット情報</span>
            </div>
          </div>
          <div className="channel-item">
            <span className="channel-icon">🎮</span>
            <div className="channel-details">
              <span className="channel-name">ゲーム</span>
              <span className="channel-desc">ゲーム実況・レビュー</span>
            </div>
          </div>
          <div className="channel-item">
            <span className="channel-icon">🍳</span>
            <div className="channel-details">
              <span className="channel-name">料理</span>
              <span className="channel-desc">レシピ・料理動画</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
