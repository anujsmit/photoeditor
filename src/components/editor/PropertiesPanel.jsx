import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function PropertiesPanel() {
  const {
    docDimensions,
    setDocDimensions,
    setActivePanel,
    layers,
    selectedLayerId,
    updateLayer,
    canvasBgColor,
    changeCanvasBgColor
  } = useEditor();

  const [activeTab, setActiveTab] = useState('Properties');
  const [rotation, setRotation] = useState(0);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isImageLayer = selectedLayer && selectedLayer.type === 'image';

  const bgSwatches = [
    { label: 'White', color: '#ffffff' },
    { label: 'Dark', color: '#12101c' },
    { label: 'Black', color: '#000000' },
    { label: 'Gray', color: '#808080' },
    { label: 'Transparent', color: 'transparent' }
  ];

  return (
    <div className="panel-container properties-panel">
      {/* Tabs */}
      <div className="panel-tab-header">
        {['Properties', 'Adjustments', 'Libraries'].map((tab) => (
          <button
            key={tab}
            className={`panel-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Adjustments') {
                setActivePanel('adjustments');
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {/* Transform Sub-section */}
        <div className="panel-section-group">
          <div className="section-title-sm">
            {isImageLayer ? `Transform (${selectedLayer.name})` : 'Canvas Transform'}
          </div>

          <div className="properties-grid-2col">
            <div className="prop-field">
              <span className="prop-label">W</span>
              <input
                type="number"
                value={isImageLayer ? (selectedLayer.width || docDimensions.width) : docDimensions.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isImageLayer) {
                    updateLayer(selectedLayerId, { width: val });
                  } else {
                    setDocDimensions((d) => ({ ...d, width: val }));
                  }
                }}
              />
              <span className="prop-unit">px</span>
            </div>

            <div className="prop-field">
              <span className="prop-label">H</span>
              <input
                type="number"
                value={isImageLayer ? (selectedLayer.height || docDimensions.height) : docDimensions.height}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isImageLayer) {
                    updateLayer(selectedLayerId, { height: val });
                  } else {
                    setDocDimensions((d) => ({ ...d, height: val }));
                  }
                }}
              />
              <span className="prop-unit">px</span>
            </div>

            <div className="prop-field">
              <span className="prop-label">X</span>
              <input
                type="number"
                value={isImageLayer ? (selectedLayer.x || 0) : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isImageLayer) updateLayer(selectedLayerId, { x: val });
                }}
              />
              <span className="prop-unit">px</span>
            </div>

            <div className="prop-field">
              <span className="prop-label">Y</span>
              <input
                type="number"
                value={isImageLayer ? (selectedLayer.y || 0) : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isImageLayer) updateLayer(selectedLayerId, { y: val });
                }}
              />
              <span className="prop-unit">px</span>
            </div>
          </div>

          <div className="prop-field-full">
            <span className="prop-label">&ang;</span>
            <input
              type="number"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
            />
            <span className="prop-unit">&deg;</span>
          </div>
        </div>

        {/* Canvas Background Color Section */}
        <div className="panel-section-group">
          <div className="section-title-sm">Canvas Background Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {bgSwatches.map((b) => (
              <button
                key={b.label}
                type="button"
                className={`swatch-cell ${canvasBgColor === b.color ? 'active' : ''}`}
                style={{
                  backgroundColor: b.color === 'transparent' ? '#ffffff' : b.color,
                  backgroundImage: b.color === 'transparent' ? 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 6px 6px' : 'none',
                  border: canvasBgColor === b.color ? '2px solid #a855f7' : '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  height: '24px'
                }}
                onClick={() => changeCanvasBgColor(b.color)}
                title={b.label}
              />
            ))}
          </div>
        </div>

        {/* Align and Distribute Sub-section */}
        <div className="panel-section-group">
          <div className="section-title-sm">Align and Distribute</div>
          <div className="align-distribute-toolbar">
            <button
              className="prop-tool-btn"
              title="Align Left"
              onClick={() => {
                if (isImageLayer) updateLayer(selectedLayerId, { x: 0 });
              }}
            >
              <Icon name="alignleft" size={15} />
            </button>
            <button
              className="prop-tool-btn"
              title="Align Center Horizontal"
              onClick={() => {
                if (isImageLayer) {
                  updateLayer(selectedLayerId, {
                    x: Math.round((docDimensions.width - (selectedLayer.width || 0)) / 2)
                  });
                }
              }}
            >
              <Icon name="aligncenter" size={15} />
            </button>
            <button
              className="prop-tool-btn"
              title="Align Right"
              onClick={() => {
                if (isImageLayer) {
                  updateLayer(selectedLayerId, {
                    x: docDimensions.width - (selectedLayer.width || 0)
                  });
                }
              }}
            >
              <Icon name="alignright" size={15} />
            </button>
            <button
              className="prop-tool-btn"
              title="Align Top"
              onClick={() => {
                if (isImageLayer) updateLayer(selectedLayerId, { y: 0 });
              }}
            >
              <Icon name="aligntop" size={15} />
            </button>
            <button
              className="prop-tool-btn"
              title="Align Middle Vertical"
              onClick={() => {
                if (isImageLayer) {
                  updateLayer(selectedLayerId, {
                    y: Math.round((docDimensions.height - (selectedLayer.height || 0)) / 2)
                  });
                }
              }}
            >
              <Icon name="alignmiddle" size={15} />
            </button>
            <button
              className="prop-tool-btn"
              title="Align Bottom"
              onClick={() => {
                if (isImageLayer) {
                  updateLayer(selectedLayerId, {
                    y: docDimensions.height - (selectedLayer.height || 0)
                  });
                }
              }}
            >
              <Icon name="alignbottom" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
