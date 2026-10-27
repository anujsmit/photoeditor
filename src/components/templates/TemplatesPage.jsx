import React, { useState } from 'react';
import SidebarNav from '../home/SidebarNav';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';
import { CANVAS_PRESETS } from '../../utils/projectPresets';

export default function TemplatesPage() {
  const { openTemplate } = useEditor();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Social Media', 'YouTube', 'Posters', 'Banners', 'Business', 'Photography'];

  const filteredPresets = CANVAS_PRESETS.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || tpl.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="home-layout templates-layout">
      {/* Top Application Header */}
      <header className="home-top-header">
        <div className="top-brand">
          <LogoIcon size={30} />
          <span className="top-brand-text">BARD Photo Editor</span>
        </div>

        <div className="top-search-bar">
          <Icon name="search" size={16} color="#8e89a5" />
          <input
            type="text"
            placeholder="Search canvas formats or presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="top-actions-right">
          <WindowControls />
        </div>
      </header>

      <div className="home-body">
        <SidebarNav />

        <main className="home-main-scroll">
          <div className="templates-content-container">
            <h1 className="templates-main-heading">Canvas &amp; Design Presets</h1>

            {/* Category Filter Pills */}
            <div className="templates-cat-row">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`template-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="templates-card-grid">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="template-showcase-card"
                  onClick={() => openTemplate(preset)}
                  title={`Create canvas: ${preset.title}`}
                >
                  <div
                    className="template-thumb-holder"
                    style={{
                      background: preset.bgColor || '#1c192b',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '16px'
                    }}
                  >
                    <div
                      style={{
                        width: preset.width > preset.height ? '90px' : '55px',
                        height: preset.width > preset.height ? '55px' : '85px',
                        border: '2px dashed rgba(255, 255, 255, 0.35)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                    >
                      {preset.aspect}
                    </div>

                    <div className="template-badge-pill">{preset.badge}</div>
                    <div className="template-hover-cta">
                      <span>Create Canvas &rarr;</span>
                    </div>
                  </div>

                  <div className="template-info-box">
                    <h3 className="template-card-title">{preset.title}</h3>
                    <span className="template-card-dims">{preset.dimensions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <div className="screen-index-badge">9. Templates Page</div>
    </div>
  );
}
