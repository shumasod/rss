import React, { useState } from 'react';
import { SearchTransitRouteUseCase } from '@application/use-cases/SearchTransitRouteUseCase';
import { TransitRoute } from '@domain/entities/TransitRoute';
import type { TransportMode, OriginType } from '@domain/services/ITransitSearchService';

interface TransitSearchProps {
  searchTransitUseCase: SearchTransitRouteUseCase;
  onSearchComplete: (routes: TransitRoute[]) => void;
}

type TimeType = 'departure' | 'arrival' | 'now';

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

const TIME_TYPES: { value: TimeType; label: string; icon: string }[] = [
  { value: 'now', label: '現在時刻', icon: '⏰' },
  { value: 'departure', label: '出発時刻指定', icon: '🚀' },
  { value: 'arrival', label: '到着時刻指定', icon: '🎯' },
];

// 現在の日時をフォーマット
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 時刻を見やすくフォーマット
const formatDisplayTime = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  return `${month}/${day}(${dayOfWeek}) ${hours}:${minutes}`;
};

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
  const [timeType, setTimeType] = useState<TimeType>('now');
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    formatDateTimeLocal(new Date())
  );
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

  const getSearchTime = (): { departureTime?: Date; arrivalTime?: Date } => {
    if (timeType === 'now') {
      return { departureTime: new Date() };
    }
    const selectedDate = new Date(selectedDateTime);
    if (timeType === 'departure') {
      return { departureTime: selectedDate };
    }
    return { arrivalTime: selectedDate };
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
      const timeOptions = getSearchTime();
      const routes = await searchTransitUseCase.searchRoutes(
        origin.trim(),
        destination.trim(),
        region,
        {
          transportMode,
          originType,
          ...timeOptions,
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

  // クイック時刻設定ボタン
  const setQuickTime = (minutes: number) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    setSelectedDateTime(formatDateTimeLocal(date));
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

        <fieldset className="form-group radio-group time-selection" disabled={loading}>
          <legend>🕐 時刻指定</legend>
          <div className="radio-options time-types">
            {TIME_TYPES.map((type) => (
              <label key={type.value} className="radio-label">
                <input
                  type="radio"
                  name="timeType"
                  value={type.value}
                  checked={timeType === type.value}
                  onChange={(e) => setTimeType(e.target.value as TimeType)}
                />
                <span className="radio-text">
                  {type.icon} {type.label}
                </span>
              </label>
            ))}
          </div>

          {timeType !== 'now' && (
            <div className="time-picker-container">
              <div className="time-picker-row">
                <input
                  type="datetime-local"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  className="datetime-input"
                  disabled={loading}
                />
                <span className="selected-time-display">
                  {formatDisplayTime(new Date(selectedDateTime))}
                </span>
              </div>
              <div className="quick-time-buttons">
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => setQuickTime(0)}
                  disabled={loading}
                >
                  今すぐ
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => setQuickTime(30)}
                  disabled={loading}
                >
                  30分後
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => setQuickTime(60)}
                  disabled={loading}
                >
                  1時間後
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => setQuickTime(120)}
                  disabled={loading}
                >
                  2時間後
                </button>
                <button
                  type="button"
                  className="quick-time-btn"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(8, 0, 0, 0);
                    setSelectedDateTime(formatDateTimeLocal(tomorrow));
                  }}
                  disabled={loading}
                >
                  明日8:00
                </button>
              </div>
            </div>
          )}
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
