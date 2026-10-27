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
    changeCanvasBgColor,
    removeSelectedLayerBackground,
    isRemovingBg
  } = useEditor();

  const [activeTab, setActiveTab] = useState('Properties');
  const [rotation, setRotation] = useState(0);
  const [bgTolerance, setBgTolerance] = useState(42);
  const [bgMode, setBgMode] = useState('border');

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const isImageLayer = selectedLayer && selectedLayer.type === 'image';
  const isShapeLayer = selectedLayer && selectedLayer.type === 'shape';
  const isTransformable = selectedLayer && (selectedLayer.type === 'image' || selectedLayer.type === 'shape');

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
            {isTransformable ? `Transform (${selectedLayer.name})` : 'Canvas Transform'}
          </div>

          <div className="properties-grid-2col">
            <div className="prop-field">
              <span className="prop-label">W</span>
              <input
                type="number"
                value={isTransformable ? (selectedLayer.width || docDimensions.width) : docDimensions.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isTransformable) {
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
                value={isTransformable ? (selectedLayer.height || docDimensions.height) : docDimensions.height}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isTransformable) {
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
                value={isTransformable ? (selectedLayer.x || 0) : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isTransformable) updateLayer(selectedLayerId, { x: val });
                }}
              />
              <span className="prop-unit">px</span>
            </div>

            <div className="prop-field">
              <span className="prop-label">Y</span>
              <input
                type="number"
                value={isTransformable ? (selectedLayer.y || 0) : 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (isTransformable) updateLayer(selectedLayerId, { y: val });
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

        {/* AI Background Removal Section for Images */}
        {isImageLayer && (
          <div className="panel-section-group" style={{ background: 'rgba(236, 72, 153, 0.06)', border: '1px solid rgba(244, 114, 182, 0.25)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="scissors" size={15} color="#f472b6" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>Background Removal</span>
              </div>
              <span style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(244, 114, 182, 0.2)', color: '#f472b6', borderRadius: '4px', fontWeight: 600 }}>
                AI ISOLATION
              </span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '10px', color: '#9ca3af', lineHeight: 1.3 }}>
              Instantly isolate the subject and remove the background from "{selectedLayer.name}".
            </p>

            {/* Primary Action Button */}
            <button
              type="button"
              className="dialog-primary-btn"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#1c1c1c',
                border: '1px solid #333333',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onClick={() => removeSelectedLayerBackground({ tolerance: bgTolerance, mode: bgMode })}
              disabled={isRemovingBg}
            >
              <Icon name="scissors" size={14} color="#ffffff" />
              <span>{isRemovingBg ? 'Processing Alpha Matting...' : 'Remove Background'}</span>
            </button>

            {/* Tolerance Slider */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="prop-label" style={{ fontSize: '10px' }}>Color Tolerance:</span>
                <span style={{ fontSize: '10px', color: '#f472b6', fontWeight: 600 }}>{bgTolerance}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={bgTolerance}
                onChange={(e) => setBgTolerance(Number(e.target.value))}
                className="bard-range-input"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            {/* Mode selection */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button
                type="button"
                className={`panel-tab-btn ${bgMode === 'border' ? 'active' : ''}`}
                style={{ flex: 1, padding: '4px 6px', fontSize: '10px', borderRadius: '4px' }}
                onClick={() => setBgMode('border')}
                title="Only removes background connected to the borders, preserving inside white details"
              >
                Border Flood Fill
              </button>
              <button
                type="button"
                className={`panel-tab-btn ${bgMode === 'global' ? 'active' : ''}`}
                style={{ flex: 1, padding: '4px 6px', fontSize: '10px', borderRadius: '4px' }}
                onClick={() => setBgMode('global')}
                title="Removes matching background color everywhere"
              >
                Global Match
              </button>
            </div>
          </div>
        )}

        {/* Shape Specific Layout & Style */}
        {isShapeLayer && (
          <div className="panel-section-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="section-title-sm" style={{ margin: 0 }}>Shape Layout &amp; Style</div>
              <button
                type="button"
                className="dialog-primary-btn"
                style={{ fontSize: '10px', padding: '2px 8px' }}
                onClick={() => setActivePanel('shapes')}
              >
                Layout Panel
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span className="prop-label" style={{ minWidth: '28px' }}>Fill:</span>
              <input
                type="color"
                value={selectedLayer.fill === 'transparent' ? '#ffffff' : (selectedLayer.fill || '#ffffff')}
                onChange={(e) => updateLayer(selectedLayer.id, { fill: e.target.value })}
                style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              />
              <span className="prop-label" style={{ minWidth: '40px', marginLeft: '6px' }}>Stroke:</span>
              <input
                type="color"
                value={selectedLayer.stroke === 'transparent' ? '#ffffff' : (selectedLayer.stroke || '#ffffff')}
                onChange={(e) => updateLayer(selectedLayer.id, { stroke: e.target.value })}
                style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              />
              <input
                type="number"
                min="0"
                max="40"
                value={selectedLayer.strokeWidth ?? 2}
                onChange={(e) => updateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })}
                className="dialog-input"
                style={{ width: '45px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '11px', color: '#8e89a5' }}>px</span>
            </div>

            {['rectangle', 'rounded-rect'].includes(selectedLayer.shapeType) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span className="prop-label" style={{ minWidth: '45px' }}>Radius:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedLayer.cornerRadius ?? 16}
                  onChange={(e) => updateLayer(selectedLayer.id, { cornerRadius: Number(e.target.value) })}
                  className="bard-range-input"
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: '11px', color: '#ffffff', minWidth: '35px', textAlign: 'right' }}>
                  {selectedLayer.cornerRadius ?? 16}px
                </span>
              </div>
            )}
          </div>
        )}

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
                  border: canvasBgColor === b.color ? '2px solid #ffffff' : '1px solid var(--border-subtle)',
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
