import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';

export default function ColorPanel() {
  const { foregroundColor, setForegroundColor } = useEditor();
  const [activeTab, setActiveTab] = useState('Color');

  const swatches = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
    '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#1e1e24', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'
  ];

  return (
    <div className="panel-container color-panel">
      {/* Tabs */}
      <div className="panel-tab-header">
        {['Color', 'Swatches', 'Gradients', 'Patterns'].map((tab) => (
          <button
            key={tab}
            className={`panel-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeTab === 'Color' && (
          <div className="color-picker-section">
            {/* Color spectrum box */}
            <div
              className="color-gradient-box"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${foregroundColor})`
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'color';
                input.value = foregroundColor;
                input.oninput = (e) => setForegroundColor(e.target.value);
                input.click();
              }}
            >
              <div className="color-box-picker-indicator" />
            </div>

            {/* Hue Slider bar */}
            <div className="hue-slider-track">
              <input
                type="range"
                min="0"
                max="360"
                className="hue-range-input"
                onChange={(e) => {
                  const hue = e.target.value;
                  setForegroundColor(`hsl(${hue}, 85%, 60%)`);
                }}
              />
            </div>

            {/* Current Color Readout */}
            <div className="color-hex-row">
              <div
                className="color-preview-chip"
                style={{ backgroundColor: foregroundColor }}
              />
              <span className="hex-label">HEX</span>
              <input
                type="text"
                className="hex-input"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'Swatches' && (
          <div className="swatches-grid">
            {swatches.map((c) => (
              <div
                key={c}
                className="swatch-cell"
                style={{ backgroundColor: c }}
                onClick={() => setForegroundColor(c)}
                title={c}
              />
            ))}
          </div>
        )}

        {(activeTab === 'Gradients' || activeTab === 'Patterns') && (
          <div className="gradients-grid">
            <div
              className="gradient-cell"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
              onClick={() => setForegroundColor('#8b5cf6')}
            />
            <div
              className="gradient-cell"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
              onClick={() => setForegroundColor('#3b82f6')}
            />
            <div
              className="gradient-cell"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              onClick={() => setForegroundColor('#f59e0b')}
            />
            <div
              className="gradient-cell"
              style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
              onClick={() => setForegroundColor('#10b981')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
