import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function ShapeToolPanel() {
  const {
    shapeSettings,
    setShapeSettings,
    activeShapeLayer,
    addShapeLayer,
    updateShapeLayer,
    setActivePanel,
    layers,
    selectedLayerId,
    setSelectedLayerId
  } = useEditor();

  const [activeTab, setActiveTab] = useState('Layout');

  // Currently active shape target (either selected shape layer or general shape settings)
  const currentShape = activeShapeLayer || shapeSettings;

  const shapeTypes = [
    { id: 'rectangle', label: 'Rectangle', icon: 'square' },
    { id: 'rounded-rect', label: 'Rounded Rect', icon: 'square' },
    { id: 'circle', label: 'Circle / Oval', icon: 'circledot' },
    { id: 'triangle', label: 'Triangle', icon: 'triangle' },
    { id: 'star', label: 'Star Badge', icon: 'star' },
    { id: 'line', label: 'Line / Divider', icon: 'minus' }
  ];

  const colorSwatches = [
    '#8b5cf6', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff',
    '#1f1c2e', 'transparent'
  ];

  const presets = [
    {
      name: 'Card Container',
      desc: 'Dark elevated card with subtle border',
      shapeType: 'rounded-rect',
      fill: 'rgba(30, 27, 46, 0.85)',
      stroke: 'rgba(168, 85, 247, 0.4)',
      strokeWidth: 2,
      cornerRadius: 20,
      width: 480,
      height: 300,
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 20
    },
    {
      name: 'Neon Glow Box',
      desc: 'Vibrant neon purple glowing outline box',
      shapeType: 'rounded-rect',
      fill: 'rgba(139, 92, 246, 0.12)',
      stroke: '#c084fc',
      strokeWidth: 3,
      cornerRadius: 16,
      width: 420,
      height: 240,
      shadow: true,
      shadowColor: '#a855f7',
      shadowBlur: 25
    },
    {
      name: 'Pill CTA Button',
      desc: 'Full rounded pill button shape',
      shapeType: 'rounded-rect',
      fill: '#7c3aed',
      stroke: '#ffffff',
      strokeWidth: 2,
      cornerRadius: 999,
      width: 260,
      height: 64,
      shadow: true,
      shadowColor: 'rgba(124, 58, 237, 0.5)',
      shadowBlur: 16
    },
    {
      name: 'Profile Avatar Circle',
      desc: 'Symmetric round avatar mask frame',
      shapeType: 'circle',
      fill: '#2e274a',
      stroke: '#a855f7',
      strokeWidth: 4,
      cornerRadius: 0,
      width: 280,
      height: 280,
      shadow: true,
      shadowColor: 'rgba(168, 85, 247, 0.3)',
      shadowBlur: 15
    },
    {
      name: 'Accent Divider Line',
      desc: 'Gradient-styled divider rule',
      shapeType: 'line',
      fill: '#c084fc',
      stroke: '#a855f7',
      strokeWidth: 4,
      cornerRadius: 2,
      width: 500,
      height: 6,
      shadow: true,
      shadowColor: '#c084fc',
      shadowBlur: 8
    },
    {
      name: 'Gold Star Badge',
      desc: 'Eye-catching 5-point victory star',
      shapeType: 'star',
      fill: '#f59e0b',
      stroke: '#fef3c7',
      strokeWidth: 2,
      cornerRadius: 0,
      width: 260,
      height: 260,
      shadow: true,
      shadowColor: '#d97706',
      shadowBlur: 18
    }
  ];

  // Helper to apply property changes
  const applyChange = (updates) => {
    setShapeSettings(prev => ({ ...prev, ...updates }));
    if (activeShapeLayer) {
      updateShapeLayer(updates);
    }
  };

  const shapeLayersList = layers.filter(l => l.type === 'shape');

  return (
    <div className="tool-dialog-panel shape-tool-panel" style={{ width: '380px' }}>
      {/* Header */}
      <div className="text-panel-header" style={{ padding: '12px 16px' }}>
        <div className="text-panel-tabs">
          {['Layout', 'Style', 'Presets'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`text-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="dialog-primary-btn"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => addShapeLayer()}
            title="Create a new shape layer on canvas"
          >
            + Add Shape
          </button>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={() => setActivePanel(null)}
            title="Close Shape Tool Panel"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      <div className="text-panel-content" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '14px 16px' }}>
        {/* Layer Selector if multiple shapes exist */}
        {shapeLayersList.length > 1 && (
          <div className="dialog-control-group" style={{ marginBottom: '12px' }}>
            <label className="dialog-label">Active Shape Layer</label>
            <select
              className="dialog-select"
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
            >
              {shapeLayersList.map((sl) => (
                <option key={sl.id} value={sl.id}>
                  {sl.name} ({sl.shapeType || 'rectangle'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Shape Preview Display */}
        <div
          style={{
            height: '110px',
            background: 'repeating-conic-gradient(#1f1b2e 0% 25%, #141220 0% 50%) 50% / 16px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {currentShape.shapeType === 'circle' ? (
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: currentShape.fill,
                border: `${Math.min(currentShape.strokeWidth, 8)}px ${currentShape.strokeStyle || 'solid'} ${currentShape.stroke}`,
                boxShadow: currentShape.shadow ? `0 0 16px ${currentShape.shadowColor}` : 'none'
              }}
            />
          ) : currentShape.shapeType === 'triangle' ? (
            <svg width="80" height="74" viewBox="0 0 80 74">
              <polygon
                points="40,6 74,68 6,68"
                fill={currentShape.fill}
                stroke={currentShape.stroke}
                strokeWidth={Math.min(currentShape.strokeWidth, 6)}
              />
            </svg>
          ) : currentShape.shapeType === 'star' ? (
            <svg width="80" height="74" viewBox="0 0 24 24">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={currentShape.fill}
                stroke={currentShape.stroke}
                strokeWidth={Math.min(currentShape.strokeWidth / 2, 2)}
              />
            </svg>
          ) : currentShape.shapeType === 'line' ? (
            <div
              style={{
                width: '180px',
                height: `${Math.max(3, Math.min(currentShape.height || 6, 14))}px`,
                backgroundColor: currentShape.fill,
                border: `${Math.min(currentShape.strokeWidth, 4)}px ${currentShape.strokeStyle || 'solid'} ${currentShape.stroke}`,
                borderRadius: `${currentShape.cornerRadius || 2}px`,
                boxShadow: currentShape.shadow ? `0 0 12px ${currentShape.shadowColor}` : 'none'
              }}
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '68px',
                borderRadius: `${Math.min(currentShape.cornerRadius ?? 16, 34)}px`,
                backgroundColor: currentShape.fill,
                border: `${Math.min(currentShape.strokeWidth, 8)}px ${currentShape.strokeStyle || 'solid'} ${currentShape.stroke}`,
                boxShadow: currentShape.shadow ? `0 0 16px ${currentShape.shadowColor}` : 'none'
              }}
            />
          )}
        </div>

        {/* TAB 1: LAYOUT & GEOMETRY */}
        {activeTab === 'Layout' && (
          <div>
            {/* Shape Types Grid */}
            <div className="dialog-control-group">
              <label className="dialog-label">Shape Tool Sub-Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {shapeTypes.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    style={{
                      padding: '8px 6px',
                      background: currentShape.shapeType === st.id ? '#222222' : 'var(--bg-card)',
                      border: currentShape.shapeType === st.id ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      color: currentShape.shapeType === st.id ? '#ffffff' : '#9ca3af',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => {
                      const cRad = st.id === 'rounded-rect' ? 24 : st.id === 'rectangle' ? 0 : (currentShape.cornerRadius || 0);
                      applyChange({ shapeType: st.id, cornerRadius: cRad });
                    }}
                  >
                    <Icon name={st.icon} size={15} color={currentShape.shapeType === st.id ? '#ffffff' : '#8e89a5'} />
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius (for Rectangle & Rounded Rect) */}
            {['rectangle', 'rounded-rect'].includes(currentShape.shapeType) && (
              <div className="dialog-control-group" style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="dialog-label" style={{ margin: 0 }}>Corner Radius</label>
                  <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>
                    {currentShape.cornerRadius ?? 16}px
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentShape.cornerRadius ?? 16}
                    onChange={(e) => applyChange({ cornerRadius: Number(e.target.value) })}
                    className="bard-range-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={currentShape.cornerRadius ?? 16}
                    onChange={(e) => applyChange({ cornerRadius: Number(e.target.value) })}
                    className="dialog-input"
                    style={{ width: '56px', textAlign: 'center' }}
                  />
                </div>
              </div>
            )}

            {/* Dimensions: Width and Height */}
            <div className="text-weight-size-row" style={{ marginTop: '12px' }}>
              <div className="size-col" style={{ flex: 1 }}>
                <label className="dialog-label">Width</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number"
                    min="10"
                    max="4000"
                    value={currentShape.width ?? 440}
                    onChange={(e) => applyChange({ width: Number(e.target.value) })}
                    className="dialog-input"
                  />
                  <span style={{ fontSize: '11px', color: '#8e89a5' }}>px</span>
                </div>
              </div>

              <div className="size-col" style={{ flex: 1 }}>
                <label className="dialog-label">Height</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="number"
                    min="2"
                    max="4000"
                    value={currentShape.height ?? 280}
                    onChange={(e) => applyChange({ height: Number(e.target.value) })}
                    className="dialog-input"
                  />
                  <span style={{ fontSize: '11px', color: '#8e89a5' }}>px</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STYLE & APPEARANCE */}
        {activeTab === 'Style' && (
          <div>
            {/* Fill Color */}
            <div className="dialog-control-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="dialog-label" style={{ margin: 0 }}>Fill Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="color"
                    value={currentShape.fill === 'transparent' ? '#ffffff' : currentShape.fill}
                    onChange={(e) => applyChange({ fill: e.target.value })}
                    style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '11px', color: '#d1d5db', fontFamily: 'monospace' }}>
                    {currentShape.fill}
                  </span>
                </div>
              </div>

              {/* Color Swatches */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {colorSwatches.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color === 'transparent' ? '#111' : color,
                      backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#555 0% 25%, #888 0% 50%) 50% / 6px 6px' : 'none',
                      border: currentShape.fill === color ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      boxShadow: currentShape.fill === color ? '0 0 6px rgba(255,255,255,0.5)' : 'none'
                    }}
                    onClick={() => applyChange({ fill: color })}
                    title={`Fill: ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Stroke / Outline */}
            <div className="dialog-control-group" style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="dialog-label" style={{ margin: 0 }}>Stroke &amp; Outline</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="color"
                    value={currentShape.stroke === 'transparent' ? '#ffffff' : currentShape.stroke}
                    onChange={(e) => applyChange({ stroke: e.target.value })}
                    style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>
                    {currentShape.strokeWidth ?? 2}px
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={currentShape.strokeWidth ?? 2}
                  onChange={(e) => applyChange({ strokeWidth: Number(e.target.value) })}
                  className="bard-range-input"
                  style={{ flex: 1 }}
                />
                <select
                  className="dialog-select"
                  value={currentShape.strokeStyle || 'solid'}
                  onChange={(e) => applyChange({ strokeStyle: e.target.value })}
                  style={{ width: '90px', fontSize: '11px' }}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            </div>

            {/* Glow / Drop Shadow Toggle */}
            <div className="dialog-control-group" style={{ marginTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="dialog-label" style={{ margin: 0 }}>Glow &amp; Shadow Effect</label>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!currentShape.shadow}
                    onChange={(e) => applyChange({ shadow: e.target.checked })}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {currentShape.shadow && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#8e89a5' }}>Blur:</span>
                  <input
                    type="range"
                    min="2"
                    max="50"
                    value={currentShape.shadowBlur ?? 15}
                    onChange={(e) => applyChange({ shadowBlur: Number(e.target.value) })}
                    className="bard-range-input"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={currentShape.shadowColor || '#8b5cf6'}
                    onChange={(e) => applyChange({ shadowColor: e.target.value })}
                    style={{ width: '24px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SHAPE PRESETS */}
        {activeTab === 'Presets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((p) => (
              <div
                key={p.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  applyChange({
                    shapeType: p.shapeType,
                    fill: p.fill,
                    stroke: p.stroke,
                    strokeWidth: p.strokeWidth,
                    cornerRadius: p.cornerRadius,
                    width: p.width,
                    height: p.height,
                    shadow: p.shadow,
                    shadowColor: p.shadowColor,
                    shadowBlur: p.shadowBlur
                  });
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {p.desc}
                  </span>
                </div>
                <button
                  type="button"
                  className="dialog-primary-btn"
                  style={{ fontSize: '10px', padding: '3px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    addShapeLayer(p);
                  }}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="screen-index-badge mini">6. Shape Layout &amp; Tool</div>
    </div>
  );
}

