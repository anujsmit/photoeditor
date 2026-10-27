import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';
import { FILTERS_DATA } from '../../utils/projectPresets';

export default function FiltersPanel() {
  const { activeFilter, setActiveFilter, setActivePanel, currentImage } = useEditor();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Portrait', 'Landscape', 'Vintage', 'B&W'];

  const filteredList = activeCategory === 'All'
    ? FILTERS_DATA
    : FILTERS_DATA.filter(f => f.category === activeCategory || f.id === 'none');

  return (
    <div className="tool-dialog-panel filters-panel">
      {/* Top Header */}
      <div className="filters-header-row">
        <h3 className="dialog-title">Filters</h3>
        <button
          className="dialog-close-btn"
          onClick={() => setActivePanel(null)}
          title="Close Filters"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Category Pills */}
      <div className="filter-category-pills">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4-column Filter Thumbnails Grid */}
      <div className="filters-card-grid">
        {filteredList.map((filter) => {
          const isSelected = activeFilter?.id === filter.id;
          return (
            <div
              key={filter.id}
              className={`filter-card-item ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              <div className="filter-thumb-box">
                <img
                  src={currentImage}
                  alt={filter.name}
                  className="filter-thumb-img"
                  style={{ filter: filter.css }}
                  loading="lazy"
                />
              </div>
              <span className="filter-card-name">{filter.name}</span>
            </div>
          );
        })}
      </div>

      <div className="screen-index-badge mini">6. Filters Panel</div>
    </div>
  );
}
