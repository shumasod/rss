import React from 'react';
import { ArticleFilter as FilterType } from '@application/use-cases/GetArticlesUseCase';

interface ArticleFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'すべて', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '今週', value: 'week' },
];

export const ArticleFilter: React.FC<ArticleFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="filters">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={`filter-btn ${currentFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};
