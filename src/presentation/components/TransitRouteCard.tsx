import React from 'react';
import { TransitRoute } from '@domain/entities/TransitRoute';

interface TransitRouteCardProps {
  route: TransitRoute;
}

/**
 * TransitRouteCard Component
 * 検索された乗換ルートを表示するカード
 */
export const TransitRouteCard: React.FC<TransitRouteCardProps> = ({ route }) => {
  const getModeIcon = (mode: string): string => {
    const icons: { [key: string]: string } = {
      train: '🚆',
      subway: '🚇',
      bus: '🚌',
      ferry: '⛴️',
      walking: '🚶',
      shinkansen: '🚄',
      express: '🚅',
      local: '🚃',
    };
    return icons[mode] || '🚇';
  };

  const formatTime = (date: Date | undefined): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFare = (fare: number): string => {
    if (route.isInternational()) {
      return `£${(fare / 100).toFixed(2)}`;
    }
    return `¥${fare.toLocaleString()}`;
  };

  const formatDistance = (distance: number | undefined): string => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  return (
    <div className="transit-route-card">
      <div className="route-header">
        <div className="route-summary">
          <h3>
            {route.origin.name} → {route.destination.name}
          </h3>
          <span className="region-badge">
            {route.isDomestic() ? '🇯🇵 国内' : '🌍 国外'}
          </span>
        </div>
        <div className="route-stats">
          <div className="stat">
            <span className="stat-label">所要時間</span>
            <span className="stat-value">{route.getTotalDurationFormatted()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">料金</span>
            <span className="stat-value">{formatFare(route.totalFare)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">乗換</span>
            <span className="stat-value">{route.transfers}回</span>
          </div>
        </div>
      </div>

      <div className="route-legs">
        {route.legs.map((leg, index) => (
          <div key={index} className="leg">
            <div className="leg-icon">{getModeIcon(leg.mode)}</div>
            <div className="leg-details">
              <div className="leg-stations">
                <div className="station">
                  {leg.departure && (
                    <span className="time">{formatTime(leg.departure)}</span>
                  )}
                  <span className="station-name">{leg.from.name}</span>
                </div>
                <div className="leg-line">
                  {leg.line && (
                    <span className="line-name">
                      {leg.line}
                      {leg.distance && ` (${formatDistance(leg.distance)})`}
                    </span>
                  )}
                  <span className="duration">{leg.duration}分</span>
                </div>
                <div className="station">
                  {leg.arrival && (
                    <span className="time">{formatTime(leg.arrival)}</span>
                  )}
                  <span className="station-name">{leg.to.name}</span>
                </div>
              </div>
              {leg.fare !== undefined && leg.fare > 0 && (
                <div className="leg-fare">{formatFare(leg.fare)}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
