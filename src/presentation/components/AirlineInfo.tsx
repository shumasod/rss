import React, { useState } from 'react';

interface Airline {
  code: string;
  name: string;
  nameJp: string;
  country: string;
  alliance: string;
  hubs: string[];
  website: string;
}

interface Alliance {
  name: string;
  airlines: string[];
  color: string;
}

const MAJOR_AIRLINES: Airline[] = [
  // アジア
  { code: 'JL', name: 'Japan Airlines', nameJp: '日本航空', country: '日本', alliance: 'oneworld', hubs: ['東京/羽田', '東京/成田', '大阪/関西'], website: 'https://www.jal.co.jp' },
  { code: 'NH', name: 'All Nippon Airways', nameJp: '全日本空輸', country: '日本', alliance: 'Star Alliance', hubs: ['東京/羽田', '東京/成田'], website: 'https://www.ana.co.jp' },
  { code: 'CX', name: 'Cathay Pacific', nameJp: 'キャセイパシフィック', country: '香港', alliance: 'oneworld', hubs: ['香港'], website: 'https://www.cathaypacific.com' },
  { code: 'SQ', name: 'Singapore Airlines', nameJp: 'シンガポール航空', country: 'シンガポール', alliance: 'Star Alliance', hubs: ['シンガポール'], website: 'https://www.singaporeair.com' },
  { code: 'TG', name: 'Thai Airways', nameJp: 'タイ国際航空', country: 'タイ', alliance: 'Star Alliance', hubs: ['バンコク'], website: 'https://www.thaiairways.com' },
  { code: 'KE', name: 'Korean Air', nameJp: '大韓航空', country: '韓国', alliance: 'SkyTeam', hubs: ['ソウル/仁川'], website: 'https://www.koreanair.com' },
  { code: 'OZ', name: 'Asiana Airlines', nameJp: 'アシアナ航空', country: '韓国', alliance: 'Star Alliance', hubs: ['ソウル/仁川'], website: 'https://www.flyasiana.com' },
  { code: 'CA', name: 'Air China', nameJp: '中国国際航空', country: '中国', alliance: 'Star Alliance', hubs: ['北京', '上海'], website: 'https://www.airchina.com' },
  { code: 'MU', name: 'China Eastern', nameJp: '中国東方航空', country: '中国', alliance: 'SkyTeam', hubs: ['上海'], website: 'https://www.ceair.com' },
  // ヨーロッパ
  { code: 'BA', name: 'British Airways', nameJp: 'ブリティッシュ・エアウェイズ', country: 'イギリス', alliance: 'oneworld', hubs: ['ロンドン/ヒースロー'], website: 'https://www.britishairways.com' },
  { code: 'LH', name: 'Lufthansa', nameJp: 'ルフトハンザ', country: 'ドイツ', alliance: 'Star Alliance', hubs: ['フランクフルト', 'ミュンヘン'], website: 'https://www.lufthansa.com' },
  { code: 'AF', name: 'Air France', nameJp: 'エールフランス', country: 'フランス', alliance: 'SkyTeam', hubs: ['パリ/シャルル・ド・ゴール'], website: 'https://www.airfrance.com' },
  { code: 'KL', name: 'KLM', nameJp: 'KLMオランダ航空', country: 'オランダ', alliance: 'SkyTeam', hubs: ['アムステルダム'], website: 'https://www.klm.com' },
  { code: 'IB', name: 'Iberia', nameJp: 'イベリア航空', country: 'スペイン', alliance: 'oneworld', hubs: ['マドリード'], website: 'https://www.iberia.com' },
  { code: 'AZ', name: 'ITA Airways', nameJp: 'ITAエアウェイズ', country: 'イタリア', alliance: 'SkyTeam', hubs: ['ローマ', 'ミラノ'], website: 'https://www.ita-airways.com' },
  // 北米
  { code: 'AA', name: 'American Airlines', nameJp: 'アメリカン航空', country: 'アメリカ', alliance: 'oneworld', hubs: ['ダラス', 'シカゴ', 'マイアミ'], website: 'https://www.aa.com' },
  { code: 'UA', name: 'United Airlines', nameJp: 'ユナイテッド航空', country: 'アメリカ', alliance: 'Star Alliance', hubs: ['シカゴ', 'サンフランシスコ', 'ニューアーク'], website: 'https://www.united.com' },
  { code: 'DL', name: 'Delta Air Lines', nameJp: 'デルタ航空', country: 'アメリカ', alliance: 'SkyTeam', hubs: ['アトランタ', 'ニューヨーク/JFK', 'ロサンゼルス'], website: 'https://www.delta.com' },
  { code: 'AC', name: 'Air Canada', nameJp: 'エア・カナダ', country: 'カナダ', alliance: 'Star Alliance', hubs: ['トロント', 'バンクーバー', 'モントリオール'], website: 'https://www.aircanada.com' },
  // 中東
  { code: 'EK', name: 'Emirates', nameJp: 'エミレーツ航空', country: 'UAE', alliance: 'なし', hubs: ['ドバイ'], website: 'https://www.emirates.com' },
  { code: 'QR', name: 'Qatar Airways', nameJp: 'カタール航空', country: 'カタール', alliance: 'oneworld', hubs: ['ドーハ'], website: 'https://www.qatarairways.com' },
  { code: 'EY', name: 'Etihad Airways', nameJp: 'エティハド航空', country: 'UAE', alliance: 'なし', hubs: ['アブダビ'], website: 'https://www.etihad.com' },
  { code: 'TK', name: 'Turkish Airlines', nameJp: 'ターキッシュ エアラインズ', country: 'トルコ', alliance: 'Star Alliance', hubs: ['イスタンブール'], website: 'https://www.turkishairlines.com' },
  // オセアニア
  { code: 'QF', name: 'Qantas', nameJp: 'カンタス航空', country: 'オーストラリア', alliance: 'oneworld', hubs: ['シドニー', 'メルボルン'], website: 'https://www.qantas.com' },
  { code: 'NZ', name: 'Air New Zealand', nameJp: 'ニュージーランド航空', country: 'ニュージーランド', alliance: 'Star Alliance', hubs: ['オークランド'], website: 'https://www.airnewzealand.com' },
];

const ALLIANCES: Alliance[] = [
  { name: 'Star Alliance', airlines: ['ANA', 'ルフトハンザ', 'ユナイテッド', 'シンガポール航空', 'タイ航空', 'エア・カナダ', 'ターキッシュ'], color: '#CFB53B' },
  { name: 'oneworld', airlines: ['JAL', 'ブリティッシュ', 'アメリカン', 'カンタス', 'カタール', 'キャセイ', 'イベリア'], color: '#E31837' },
  { name: 'SkyTeam', airlines: ['大韓航空', 'エールフランス', 'KLM', 'デルタ', '中国東方', 'アリタリア'], color: '#0A4D8C' },
];

interface AirlineInfoProps {
  onSelectAirline?: (airline: Airline) => void;
}

/**
 * AirlineInfo Component
 * 世界の航空会社情報表示コンポーネント
 */
export const AirlineInfo: React.FC<AirlineInfoProps> = ({ onSelectAirline }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAlliance, setSelectedAlliance] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const regions = [
    { id: 'all', name: 'すべて', icon: '🌍' },
    { id: 'asia', name: 'アジア', icon: '🌏', countries: ['日本', '香港', 'シンガポール', 'タイ', '韓国', '中国'] },
    { id: 'europe', name: 'ヨーロッパ', icon: '🌍', countries: ['イギリス', 'ドイツ', 'フランス', 'オランダ', 'スペイン', 'イタリア'] },
    { id: 'americas', name: '北米', icon: '🌎', countries: ['アメリカ', 'カナダ'] },
    { id: 'middleeast', name: '中東', icon: '🏜️', countries: ['UAE', 'カタール', 'トルコ'] },
    { id: 'oceania', name: 'オセアニア', icon: '🦘', countries: ['オーストラリア', 'ニュージーランド'] },
  ];

  const getRegionCountries = (regionId: string): string[] => {
    const region = regions.find((r) => r.id === regionId);
    return region?.countries || [];
  };

  const filteredAirlines = MAJOR_AIRLINES.filter((airline) => {
    // 地域フィルター
    if (selectedRegion !== 'all') {
      const regionCountries = getRegionCountries(selectedRegion);
      if (!regionCountries.includes(airline.country)) return false;
    }
    // アライアンスフィルター
    if (selectedAlliance !== 'all' && airline.alliance !== selectedAlliance) return false;
    // 検索クエリ
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        airline.name.toLowerCase().includes(query) ||
        airline.nameJp.includes(searchQuery) ||
        airline.code.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="airline-info-container">
      <div className="airline-header">
        <h2>✈️ 世界の航空会社</h2>
        <p className="airline-subtitle">国際乗換検索で利用可能な航空会社一覧</p>
      </div>

      <div className="airline-alliances">
        <h3>航空アライアンス</h3>
        <div className="alliance-cards">
          {ALLIANCES.map((alliance) => (
            <div
              key={alliance.name}
              className={`alliance-card ${selectedAlliance === alliance.name ? 'selected' : ''}`}
              style={{ borderColor: alliance.color }}
              onClick={() => setSelectedAlliance(selectedAlliance === alliance.name ? 'all' : alliance.name)}
            >
              <span className="alliance-name" style={{ color: alliance.color }}>{alliance.name}</span>
              <span className="alliance-members">{alliance.airlines.slice(0, 4).join(', ')}...</span>
            </div>
          ))}
        </div>
      </div>

      <div className="airline-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="航空会社を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="region-tabs">
          {regions.map((region) => (
            <button
              key={region.id}
              className={`region-tab ${selectedRegion === region.id ? 'active' : ''}`}
              onClick={() => setSelectedRegion(region.id)}
            >
              {region.icon} {region.name}
            </button>
          ))}
        </div>
      </div>

      <div className="airline-list">
        {filteredAirlines.map((airline) => (
          <div
            key={airline.code}
            className="airline-card"
            onClick={() => onSelectAirline?.(airline)}
          >
            <div className="airline-main">
              <span className="airline-code">{airline.code}</span>
              <div className="airline-names">
                <span className="airline-name-en">{airline.name}</span>
                <span className="airline-name-jp">{airline.nameJp}</span>
              </div>
            </div>
            <div className="airline-details">
              <span className="airline-country">🌍 {airline.country}</span>
              <span className="airline-alliance">
                {airline.alliance !== 'なし' ? `⭐ ${airline.alliance}` : '独立系'}
              </span>
            </div>
            <div className="airline-hubs">
              <span className="hubs-label">主要ハブ:</span>
              <span className="hubs-list">{airline.hubs.join(', ')}</span>
            </div>
            <a
              href={airline.website}
              target="_blank"
              rel="noopener noreferrer"
              className="airline-website"
              onClick={(e) => e.stopPropagation()}
            >
              公式サイト →
            </a>
          </div>
        ))}
      </div>

      <div className="airline-stats">
        <p>表示中: {filteredAirlines.length}社 / 全{MAJOR_AIRLINES.length}社</p>
      </div>
    </div>
  );
};
