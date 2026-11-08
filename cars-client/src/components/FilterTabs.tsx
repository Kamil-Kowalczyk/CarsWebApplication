import { useState } from 'react';
import { useCarUiStore } from '../store/useCarUiStore';

export interface FilterTabsProps {
  allCount: number;
  favoritesCount: number;
}

export const FilterTabs = ({
  allCount,
  favoritesCount,
}: FilterTabsProps) => {
  const showLikedOnly = useCarUiStore(
    (state) => state.showFavoritesOnly
  );
  const activeTab = !showLikedOnly ? 'all' : 'favorites'

   const setShowLikedOnly = useCarUiStore(
      (state) => state.setShowFavoritesOnly
    )

  const handleSelect = (tab: 'all' | 'favorites') => {
    tab === 'all' ? setShowLikedOnly(false) : setShowLikedOnly(true)
  };

  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter cars">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'all'}
        className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
        onClick={() => handleSelect('all')}
      >
        <span>All Cars</span>
        <span className="tab-count">{allCount}</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'favorites'}
        className={`filter-tab ${activeTab === 'favorites' ? 'active' : ''}`}
        onClick={() => handleSelect('favorites')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={activeTab === 'favorites' ? '#ef4444' : 'none'}
          stroke={activeTab === 'favorites' ? '#ef4444' : 'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tab-heart-icon"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        <span>Favorites</span>
        <span className="tab-count">{favoritesCount}</span>
      </button>
    </div>
  );
};

export default FilterTabs;
