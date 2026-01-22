import React, { useState } from 'react';
import { SearchTransitRouteUseCase } from '@application/use-cases/SearchTransitRouteUseCase';
import { TransitRoute } from '@domain/entities/TransitRoute';

interface TransitSearchProps {
  searchTransitUseCase: SearchTransitRouteUseCase;
  onSearchComplete: (routes: TransitRoute[]) => void;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        <div className="form-group">
          <label htmlFor="origin">出発地</label>
          <input
            id="origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="例: 東京, Tokyo"
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
