import React, { useState, useEffect } from 'react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}

interface StockChartProps {
  onNavigateToLP?: () => void;
}

// 主要指数と人気銘柄のサンプルデータ（実際のAPIに置き換え可能）
const SAMPLE_STOCKS: StockData[] = [
  { symbol: 'N225', name: '日経平均', price: 38547.23, change: 234.56, changePercent: 0.61, high: 38650.00, low: 38320.00, volume: 1234567890, timestamp: new Date().toISOString() },
  { symbol: 'TOPIX', name: 'TOPIX', price: 2687.45, change: 12.34, changePercent: 0.46, high: 2695.00, low: 2675.00, volume: 987654321, timestamp: new Date().toISOString() },
  { symbol: '7203', name: 'トヨタ自動車', price: 2845.50, change: -23.50, changePercent: -0.82, high: 2880.00, low: 2840.00, volume: 12345678, timestamp: new Date().toISOString() },
  { symbol: '6758', name: 'ソニーG', price: 13250.00, change: 150.00, changePercent: 1.15, high: 13300.00, low: 13100.00, volume: 5678901, timestamp: new Date().toISOString() },
  { symbol: '9984', name: 'ソフトバンクG', price: 8765.00, change: -45.00, changePercent: -0.51, high: 8820.00, low: 8740.00, volume: 8765432, timestamp: new Date().toISOString() },
  { symbol: '7974', name: '任天堂', price: 8234.00, change: 89.00, changePercent: 1.09, high: 8280.00, low: 8150.00, volume: 3456789, timestamp: new Date().toISOString() },
];

const LOW_PRICE_STOCKS: StockData[] = [
  { symbol: '3350', name: 'レッド・プラネット', price: 89, change: 5, changePercent: 5.95, high: 92, low: 84, volume: 2345678, timestamp: new Date().toISOString() },
  { symbol: '7647', name: '音通', price: 156, change: 12, changePercent: 8.33, high: 162, low: 145, volume: 1876543, timestamp: new Date().toISOString() },
  { symbol: '2315', name: 'CAICA', price: 78, change: -3, changePercent: -3.70, high: 82, low: 76, volume: 5432109, timestamp: new Date().toISOString() },
  { symbol: '3808', name: 'オウケイウェイヴ', price: 234, change: 18, changePercent: 8.33, high: 245, low: 220, volume: 987654, timestamp: new Date().toISOString() },
  { symbol: '2667', name: 'イメージワン', price: 445, change: 25, changePercent: 5.95, high: 460, low: 425, volume: 654321, timestamp: new Date().toISOString() },
];

/**
 * StockChart Component
 * リアルタイム株式チャート表示コンポーネント
 */
export const StockChart: React.FC<StockChartProps> = ({ onNavigateToLP }) => {
  const [stocks, setStocks] = useState<StockData[]>(SAMPLE_STOCKS);
  const [lowPriceStocks, setLowPriceStocks] = useState<StockData[]>(LOW_PRICE_STOCKS);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'index' | 'lowprice'>('index');

  // 株価データを更新（実際のAPIに置き換え可能）
  const refreshData = async () => {
    setLoading(true);
    try {
      // シミュレーション: ランダムな価格変動
      const updatedStocks = stocks.map((stock) => {
        const changeAmount = (Math.random() - 0.5) * stock.price * 0.02;
        const newPrice = Math.round((stock.price + changeAmount) * 100) / 100;
        const newChange = Math.round(changeAmount * 100) / 100;
        const newChangePercent = Math.round((newChange / stock.price) * 10000) / 100;
        return {
          ...stock,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          timestamp: new Date().toISOString(),
        };
      });
      setStocks(updatedStocks);

      const updatedLowPrice = lowPriceStocks.map((stock) => {
        const changeAmount = (Math.random() - 0.5) * stock.price * 0.05;
        const newPrice = Math.max(1, Math.round(stock.price + changeAmount));
        const newChange = newPrice - (stock.price - stock.change);
        const newChangePercent = Math.round((newChange / (stock.price - stock.change)) * 10000) / 100;
        return {
          ...stock,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          timestamp: new Date().toISOString(),
        };
      });
      setLowPriceStocks(updatedLowPrice);

      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  // 自動更新（30秒ごと）
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [stocks, lowPriceStocks]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('ja-JP', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 100000000) {
      return (volume / 100000000).toFixed(2) + '億';
    }
    if (volume >= 10000) {
      return (volume / 10000).toFixed(0) + '万';
    }
    return volume.toLocaleString();
  };

  const renderStockRow = (stock: StockData) => {
    const isPositive = stock.change >= 0;
    return (
      <div key={stock.symbol} className="stock-row">
        <div className="stock-info">
          <span className="stock-symbol">{stock.symbol}</span>
          <span className="stock-name">{stock.name}</span>
        </div>
        <div className="stock-price">
          <span className="price-value">¥{formatPrice(stock.price)}</span>
          <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{formatPrice(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent}%)
          </span>
        </div>
        <div className="stock-details">
          <span className="detail-item">高: ¥{formatPrice(stock.high)}</span>
          <span className="detail-item">安: ¥{formatPrice(stock.low)}</span>
          <span className="detail-item">出来高: {formatVolume(stock.volume)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="stock-chart-container">
      <div className="stock-header">
        <h2>📈 株式マーケット</h2>
        <div className="stock-header-actions">
          <span className="last-update">
            最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
          </span>
          <button
            className="refresh-stock-btn"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? '更新中...' : '🔄 更新'}
          </button>
        </div>
      </div>

      <div className="stock-tabs">
        <button
          className={`stock-tab ${activeTab === 'index' ? 'active' : ''}`}
          onClick={() => setActiveTab('index')}
        >
          📊 主要指数・銘柄
        </button>
        <button
          className={`stock-tab ${activeTab === 'lowprice' ? 'active' : ''}`}
          onClick={() => setActiveTab('lowprice')}
        >
          💎 注目の低位株
        </button>
      </div>

      <div className="stock-list">
        {activeTab === 'index' && stocks.map(renderStockRow)}
        {activeTab === 'lowprice' && (
          <>
            {lowPriceStocks.map(renderStockRow)}
            <div className="low-price-notice">
              <p>※ 低位株は価格変動が大きく、リスクが高い場合があります。投資は自己責任でお願いします。</p>
            </div>
          </>
        )}
      </div>

      {onNavigateToLP && (
        <div className="stock-cta">
          <button className="lp-navigate-btn" onClick={onNavigateToLP}>
            🎯 2026年2月 注目の低位株情報を見る →
          </button>
        </div>
      )}

      <div className="stock-disclaimer">
        <p>※ 表示される株価は参考値です。実際の取引の際は証券会社の情報をご確認ください。</p>
        <p>※ 投資に関する最終決定は、ご自身の判断で行ってください。</p>
      </div>
    </div>
  );
};
