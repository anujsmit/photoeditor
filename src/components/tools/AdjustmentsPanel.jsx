import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function AdjustmentsPanel() {
  const {
    adjustments,
    updateAdjustment,
    resetAllAdjustments,
    setActivePanel,
    setCurrentView
  } = useEditor();

  const [activeTab, setActiveTab] = useState('Manual');

  const adjustmentFields = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
    { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
    { key: 'whites', label: 'Whites', min: -100, max: 100 },
    { key: 'blacks', label: 'Blacks', min: -100, max: 100 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
    { key: 'vibrance', label: 'Vibrance', min: -100, max: 100 },
    { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
    { key: 'tint', label: 'Tint', min: -100, max: 100 }
  ];

  return (
    <div className="tool-dialog-panel adjustments-panel">
      {/* Top Header */}
      <div className="adjustments-header-row">
        <div className="adjustments-title-tabs">
          <span className="panel-main-title">Adjustments</span>
          <div className="adjust-tabs-pills">
            {['Presets', 'Manual', 'AI Enhance'].map((t) => (
              <button
                key={t}
                className={`adjust-tab-pill ${activeTab === t ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(t);
                  if (t === 'Presets') setActivePanel('filters');
                  if (t === 'AI Enhance') setCurrentView('ai-tools');
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          className="dialog-close-btn"
          onClick={() => setActivePanel(null)}
          title="Close Adjustments"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* Sliders Scroll Area */}
      <div className="adjustments-sliders-scroll">
        {adjustmentFields.map((field) => {
          const val = adjustments[field.key] ?? 0;
          return (
            <div key={field.key} className="slider-control-row">
              <div className="slider-label-row">
                <span className="slider-name">{field.label}</span>
                <span className="slider-value-badge">{val > 0 ? `+${val}` : val}</span>
              </div>
              <div className="slider-track-wrapper">
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  value={val}
                  onChange={(e) => updateAdjustment(field.key, e.target.value)}
                  className="bard-range-input"
                />
              </div>
            </div>
          );
        })}

        <div className="adjustments-footer-actions">
          <button
            className="adjust-reset-btn"
            onClick={resetAllAdjustments}
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="screen-index-badge mini">5. Adjustments Panel</div>
    </div>
  );
}
