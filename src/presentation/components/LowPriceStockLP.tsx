import React, { useState } from 'react';

interface StockPick {
  code: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  sector: string;
  reason: string;
  risk: 'low' | 'medium' | 'high';
  potential: string;
  momentum: 'up' | 'down' | 'neutral';
}

const STOCK_PICKS_FEB_2026: StockPick[] = [
  {
    code: '3350',
    name: 'レッド・プラネット・ジャパン',
    currentPrice: 89,
    targetPrice: 150,
    sector: 'ホテル・観光',
    reason: 'インバウンド需要回復、東南アジアのホテル事業拡大',
    risk: 'high',
    potential: '+68.5%',
    momentum: 'up',
  },
  {
    code: '2315',
    name: 'CAICA DIGITAL',
    currentPrice: 78,
    targetPrice: 120,
    sector: 'フィンテック・暗号資産',
    reason: 'ブロックチェーン技術の企業導入増加、デジタル資産事業拡大',
    risk: 'high',
    potential: '+53.8%',
    momentum: 'up',
  },
  {
    code: '3808',
    name: 'オウケイウェイヴ',
    currentPrice: 234,
    targetPrice: 380,
    sector: 'IT・AI',
    reason: 'AI技術を活用したQ&Aプラットフォームの成長、企業向けサービス拡大',
    risk: 'medium',
    potential: '+62.4%',
    momentum: 'up',
  },
  {
    code: '2667',
    name: 'イメージ ワン',
    currentPrice: 445,
    targetPrice: 650,
    sector: '医療・ヘルスケア',
    reason: '医療画像診断AIの需要増、遠隔医療市場の拡大',
    risk: 'medium',
    potential: '+46.1%',
    momentum: 'neutral',
  },
  {
    code: '4592',
    name: 'サンバイオ',
    currentPrice: 456,
    targetPrice: 800,
    sector: 'バイオ・創薬',
    reason: '再生医療分野での治験進展、脳梗塞治療薬の承認期待',
    risk: 'high',
    potential: '+75.4%',
    momentum: 'up',
  },
  {
    code: '3925',
    name: 'ダブルスタンダード',
    currentPrice: 389,
    targetPrice: 550,
    sector: 'DX・データ分析',
    reason: '企業のDX推進需要、データクレンジング事業の成長',
    risk: 'low',
    potential: '+41.4%',
    momentum: 'up',
  },
  {
    code: '4430',
    name: '東海ソフト',
    currentPrice: 487,
    targetPrice: 700,
    sector: 'システム開発',
    reason: '自動車産業向けソフトウェア需要増、EV関連の開発案件増加',
    risk: 'low',
    potential: '+43.7%',
    momentum: 'neutral',
  },
  {
    code: '6556',
    name: 'ウェルビー',
    currentPrice: 412,
    targetPrice: 600,
    sector: '福祉・就労支援',
    reason: '障がい者就労支援市場の拡大、政府の福祉政策強化',
    risk: 'low',
    potential: '+45.6%',
    momentum: 'up',
  },
];

// セクターフィルタは将来の拡張用に定義
// const SECTORS = [
//   { id: 'all', name: 'すべて' },
//   { id: 'tech', name: 'IT・テック' },
//   { id: 'bio', name: 'バイオ・医療' },
//   { id: 'service', name: 'サービス' },
// ];

interface LowPriceStockLPProps {
  onBack?: () => void;
}

/**
 * LowPriceStockLP Component
 * 2026年2月の低位株情報ランディングページ
 */
export const LowPriceStockLP: React.FC<LowPriceStockLPProps> = ({ onBack }) => {
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'potential' | 'price' | 'risk'>('potential');

  const filteredStocks = STOCK_PICKS_FEB_2026
    .filter((stock) => selectedRisk === 'all' || stock.risk === selectedRisk)
    .sort((a, b) => {
      switch (sortBy) {
        case 'potential':
          return parseFloat(b.potential) - parseFloat(a.potential);
        case 'price':
          return a.currentPrice - b.currentPrice;
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3 };
          return riskOrder[a.risk] - riskOrder[b.risk];
        default:
          return 0;
      }
    });

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return <span className="risk-badge risk-low">🟢 低リスク</span>;
      case 'medium':
        return <span className="risk-badge risk-medium">🟡 中リスク</span>;
      case 'high':
        return <span className="risk-badge risk-high">🔴 高リスク</span>;
    }
  };

  const getMomentumIcon = (momentum: 'up' | 'down' | 'neutral') => {
    switch (momentum) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div className="lp-container">
      {/* Hero Section */}
      <section className="lp-hero">
        <div className="hero-content">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              ← 戻る
            </button>
          )}
          <h1>💎 2026年2月 注目の低位株</h1>
          <p className="hero-subtitle">
            500円以下で買える！成長期待の厳選銘柄
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">{STOCK_PICKS_FEB_2026.length}</span>
              <span className="stat-label">厳選銘柄</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">+55%</span>
              <span className="stat-label">平均上昇期待</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">¥78〜</span>
              <span className="stat-label">最低投資額</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="lp-filters">
        <div className="filter-group">
          <label>リスク選択:</label>
          <div className="filter-buttons">
            <button
              className={selectedRisk === 'all' ? 'active' : ''}
              onClick={() => setSelectedRisk('all')}
            >
              すべて
            </button>
            <button
              className={selectedRisk === 'low' ? 'active' : ''}
              onClick={() => setSelectedRisk('low')}
            >
              🟢 低リスク
            </button>
            <button
              className={selectedRisk === 'medium' ? 'active' : ''}
              onClick={() => setSelectedRisk('medium')}
            >
              🟡 中リスク
            </button>
            <button
              className={selectedRisk === 'high' ? 'active' : ''}
              onClick={() => setSelectedRisk('high')}
            >
              🔴 高リスク
            </button>
          </div>
        </div>
        <div className="filter-group">
          <label>並び替え:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <option value="potential">上昇期待順</option>
            <option value="price">株価が安い順</option>
            <option value="risk">リスクが低い順</option>
          </select>
        </div>
      </section>

      {/* Stock Cards */}
      <section className="lp-stocks">
        {filteredStocks.map((stock) => (
          <div key={stock.code} className="lp-stock-card">
            <div className="stock-card-header">
              <div className="stock-code-name">
                <span className="stock-code">{stock.code}</span>
                <span className="stock-name">{stock.name}</span>
              </div>
              {getRiskBadge(stock.risk)}
            </div>

            <div className="stock-prices">
              <div className="current-price">
                <span className="price-label">現在株価</span>
                <span className="price-value">¥{stock.currentPrice.toLocaleString()}</span>
              </div>
              <div className="arrow">{getMomentumIcon(stock.momentum)}</div>
              <div className="target-price">
                <span className="price-label">目標株価</span>
                <span className="price-value target">¥{stock.targetPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="potential-badge">
              上昇期待 {stock.potential}
            </div>

            <div className="stock-sector">
              <span className="sector-label">セクター:</span>
              <span className="sector-value">{stock.sector}</span>
            </div>

            <div className="stock-reason">
              <span className="reason-label">📌 注目ポイント</span>
              <p>{stock.reason}</p>
            </div>

            <button className="detail-btn">
              詳細を見る →
            </button>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="lp-cta">
        <h2>🚀 今すぐ投資を始めよう</h2>
        <p>証券口座をお持ちでない方は、以下のネット証券がおすすめです</p>
        <div className="broker-buttons">
          <button className="broker-btn sbi">SBI証券で口座開設</button>
          <button className="broker-btn rakuten">楽天証券で口座開設</button>
          <button className="broker-btn matsui">松井証券で口座開設</button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="lp-disclaimer">
        <h3>⚠️ 投資に関する重要事項</h3>
        <ul>
          <li>本ページの情報は投資判断の参考として提供するものであり、投資勧誘を目的としたものではありません。</li>
          <li>低位株は価格変動が大きく、投資元本を失うリスクがあります。</li>
          <li>投資に関する最終決定は、ご自身の判断と責任において行ってください。</li>
          <li>株価情報は参考値であり、実際の取引価格と異なる場合があります。</li>
          <li>過去の実績は将来の成果を保証するものではありません。</li>
        </ul>
      </section>
    </div>
  );
};
