import React from 'react';

interface BannerAdProps {
  position: 'header' | 'footer' | 'sidebar';
  size?: 'large' | 'medium' | 'small';
}

/**
 * BannerAd Component
 * 仮想バナー広告表示コンポーネント
 */
export const BannerAd: React.FC<BannerAdProps> = ({ position, size = 'medium' }) => {
  const getSizeClass = () => {
    switch (size) {
      case 'large':
        return 'banner-large';
      case 'small':
        return 'banner-small';
      default:
        return 'banner-medium';
    }
  };

  const getAdContent = () => {
    switch (position) {
      case 'header':
        return {
          title: '📊 投資を始めるなら',
          subtitle: '初心者でも安心のネット証券',
          cta: '無料口座開設 →',
          sponsor: 'AD: Sample Securities',
        };
      case 'footer':
        return {
          title: '🎯 あなたにピッタリの保険',
          subtitle: '無料で複数社を比較',
          cta: '今すぐ診断 →',
          sponsor: 'AD: Insurance Compare',
        };
      default:
        return {
          title: '💼 転職するなら',
          subtitle: '年収アップを実現',
          cta: '無料登録 →',
          sponsor: 'AD: Career Agent',
        };
    }
  };

  const content = getAdContent();

  return (
    <div className={`banner-ad ${getSizeClass()} banner-${position}`}>
      <div className="banner-content">
        <div className="banner-text">
          <span className="banner-title">{content.title}</span>
          <span className="banner-subtitle">{content.subtitle}</span>
        </div>
        <button className="banner-cta">{content.cta}</button>
      </div>
      <span className="banner-sponsor">{content.sponsor}</span>
    </div>
  );
};
