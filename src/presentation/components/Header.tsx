import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, loading }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>📰 RSS Feed Reader</h1>
        <p className="subtitle">お気に入りのサイトの最新情報をチェック</p>
      </div>
      <button
        className="refresh-btn"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? '更新中...' : '🔄 更新'}
      </button>
    </header>
  );
};
