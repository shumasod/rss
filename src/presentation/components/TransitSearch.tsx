import React, { useState } from 'react';
import { SearchTransitRouteUseCase } from '@application/use-cases/SearchTransitRouteUseCase';
import { TransitRoute } from '@domain/entities/TransitRoute';
import type { TransportMode, OriginType } from '@domain/services/ITransitSearchService';

interface TransitSearchProps {
  searchTransitUseCase: SearchTransitRouteUseCase;
  onSearchComplete: (routes: TransitRoute[]) => void;
}

const TRANSPORT_MODES: { value: TransportMode; label: string; icon: string }[] = [
  { value: 'all', label: 'すべて', icon: '🚊' },
  { value: 'train', label: '電車・私鉄', icon: '🚃' },
  { value: 'shinkansen', label: '新幹線', icon: '🚅' },
  { value: 'bus', label: '高速バス', icon: '🚌' },
  { value: 'ship', label: '船・フェリー', icon: '⛴️' },
  { value: 'airplane', label: '飛行機', icon: '✈️' },
];

const ORIGIN_TYPES: { value: OriginType; label: string; icon: string }[] = [
  { value: 'station', label: '駅', icon: '🚉' },
  { value: 'shop', label: '店舗', icon: '🏪' },
  { value: 'address', label: '住所', icon: '📍' },
];

/**
 * TransitSearch Component
 * 公共交通機関の乗換案内検索フォーム
 */
export const TransitSearch: React.FC<TransitSearchProps> = ({
  searchTransitUseCase,
  onSearchComplete,
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [region, setRegion] = useState<'domestic' | 'international'>('domestic');
  const [transportMode, setTransportMode] = useState<TransportMode>('all');
  const [originType, setOriginType] = useState<OriginType>('station');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlaceholder = () => {
    switch (originType) {
      case 'shop':
        return '例: スターバックス渋谷店, イオンモール';
      case 'address':
        return '例: 東京都渋谷区神南1-1-1';
      default:
        return '例: 東京, 渋谷駅';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin.trim() || !destination.trim()) {
      setError('出発地と目的地を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routes = await searchTransitUseCase.searchRoutes(
        origin.trim(),
        destination.trim(),
        region,
        {
          transportMode,
          originType,
        },
      );
      onSearchComplete(routes);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('検索中にエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transit-search">
      <h2>🚉 公共交通乗換案内検索</h2>
      <form onSubmit={handleSearch} className="transit-search-form">
        <div className="form-group">
          <label htmlFor="region">地域</label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as 'domestic' | 'international')}
            disabled={loading}
          >
            <option value="domestic">国内（日本）</option>
            <option value="international">国外</option>
          </select>
        </div>

        <fieldset className="form-group radio-group" disabled={loading}>
          <legend>交通手段</legend>
          <div className="radio-options">
            {TRANSPORT_MODES.map((mode) => (
              <label key={mode.value} className="radio-label">
                <input
                  type="radio"
                  name="transportMode"
                  value={mode.value}
                  checked={transportMode === mode.value}
                  onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                />
                <span className="radio-text">
                  {mode.icon} {mode.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="form-group radio-group" disabled={loading}>
          <legend>出発地の種類</legend>
          <div className="radio-options origin-types">
            {ORIGIN_TYPES.map((type) => (
              <label key={type.value} className="radio-label">
                <input
                  type="radio"
                  name="originType"
                  value={type.value}
                  checked={originType === type.value}
                  onChange={(e) => setOriginType(e.target.value as OriginType)}
                />
                <span className="radio-text">
                  {type.icon} {type.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-group">
          <label htmlFor="origin">
            出発地
            {originType === 'shop' && <span className="label-hint">（店舗名を入力）</span>}
            {originType === 'address' && <span className="label-hint">（住所を入力）</span>}
          </label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">目的地</label>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="例: 大阪, London"
            disabled={loading}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="search-button">
          {loading ? '検索中...' : '🔍 検索'}
        </button>
      </form>
    </div>
  );
};
