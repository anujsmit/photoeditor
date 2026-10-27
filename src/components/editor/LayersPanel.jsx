import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function LayersPanel() {
  const {
    canvasBgColor,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteLayer,
    addLayer,
    addTextLayer,
    moveLayerUp,
    moveLayerDown,
    triggerAddImageLayerDialog,
    layerOpacity,
    setLayerOpacity,
    layerFill,
    setLayerFill,
    blendMode,
    setBlendMode,
    setActivePanel,
    setActiveTool
  } = useEditor();

  const [activeTab, setActiveTab] = useState('Layers');

  const blendModes = [
    'Normal', 'Dissolve', 'Darken', 'Multiply', 'Color Burn',
    'Lighten', 'Screen', 'Color Dodge', 'Overlay', 'Soft Light',
    'Hard Light', 'Difference', 'Exclusion', 'Hue', 'Saturation', 'Color', 'Luminosity'
  ];

  return (
    <div className="panel-container layers-panel">
      {/* Header Tabs */}
      <div className="panel-tab-header">
        {['Layers', 'Channels', 'Paths'].map((tab) => (
          <button
            key={tab}
            className={`panel-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="layers-panel-body">
        {activeTab === 'Layers' && (
          <>
            {/* Blend Mode & Opacity */}
            <div className="layers-top-controls">
              <div className="blend-mode-row">
                <select
                  className="blend-mode-select"
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                >
                  {blendModes.map((bm) => (
                    <option key={bm} value={bm}>{bm}</option>
                  ))}
                </select>

                <div className="opacity-control-pill" title="Click to edit layer opacity">
                  <span className="control-label">Opacity:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(Math.max(0, Math.min(100, Number(e.target.value))))}
                    style={{ width: '38px', background: 'transparent', color: 'inherit', textAlign: 'right' }}
                  />
                  <span>%</span>
                </div>
              </div>

              {/* Locks & Fill */}
              <div className="locks-fill-row">
                <div className="locks-group">
                  <span className="lock-label">Lock:</span>
                  <button className="lock-icon-btn" title="Lock Transparent Pixels">
                    <Icon name="brush" size={13} />
                  </button>
                  <button className="lock-icon-btn" title="Lock Position">
                    <Icon name="move" size={13} />
                  </button>
                  <button className="lock-icon-btn" title="Lock All">
                    <Icon name="lock" size={13} />
                  </button>
                </div>

                <div className="fill-control-pill" title="Click to edit layer fill">
                  <span className="control-label">Fill:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={layerFill}
                    onChange={(e) => setLayerFill(Math.max(0, Math.min(100, Number(e.target.value))))}
                    style={{ width: '38px', background: 'transparent', color: 'inherit', textAlign: 'right' }}
                  />
                  <span>%</span>
                </div>
              </div>

              {/* Quick Layer Actions */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="dialog-primary-btn"
                  style={{ fontSize: '10px', padding: '4px 7px', flex: '1 1 auto' }}
                  onClick={triggerAddImageLayerDialog}
                  title="Add an image file as a new layer"
                >
                  <Icon name="image" size={12} />
                  <span>+ Image</span>
                </button>
                <button
                  type="button"
                  className="dialog-primary-btn"
                  style={{
                    fontSize: '10px',
                    padding: '4px 7px',
                    flex: '1 1 auto',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(147, 51, 234, 0.3) 100%)',
                    border: '1px solid #c084fc',
                    color: '#ffffff'
                  }}
                  onClick={() => addTextLayer()}
                  title="Add a new Text Layer (T)"
                >
                  <Icon name="text" size={12} color="#c084fc" />
                  <span>+ Text</span>
                </button>
                <button
                  type="button"
                  className="dialog-cancel-btn"
                  style={{ fontSize: '10px', padding: '4px 7px' }}
                  onClick={() => moveLayerUp(selectedLayerId)}
                  title="Bring Selected Layer Up"
                >
                  &uarr; Up
                </button>
                <button
                  type="button"
                  className="dialog-cancel-btn"
                  style={{ fontSize: '10px', padding: '4px 7px' }}
                  onClick={() => moveLayerDown(selectedLayerId)}
                  title="Send Selected Layer Down"
                >
                  &darr; Down
                </button>
              </div>
            </div>

            {/* Layers Stack List */}
            <div className="layers-stack-scroll">
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const isText = layer.type === 'text';
                const isBg = layer.type === 'background';
                const isImg = layer.type === 'image';

                return (
                  <div
                    key={layer.id}
                    className={`layer-item-row ${isSelected ? 'selected' : ''} ${isText ? 'text-layer-item' : ''}`}
                    onClick={() => {
                      setSelectedLayerId(layer.id);
                      if (isText) {
                        setActiveTool('text');
                        setActivePanel('text');
                      }
                    }}
                  >
                    {/* Visibility eye toggle */}
                    <button
                      type="button"
                      className="layer-eye-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      <Icon
                        name={layer.visible ? 'eye' : 'eyeoff'}
                        size={14}
                        color={layer.visible ? '#ffffff' : '#6b7280'}
                      />
                    </button>

                    {/* Layer Thumbnail / Badge */}
                    <div className="layer-thumb-container">
                      {isText ? (
                        <div
                          className="layer-text-badge"
                          title="Text Layer (T)"
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
                            borderRadius: '3px',
                            border: '1px solid rgba(192, 132, 252, 0.5)'
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#c084fc', fontFamily: 'serif' }}>T</span>
                        </div>
                      ) : isBg ? (
                        <div
                          className="layer-bg-thumb"
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: layer.fill || canvasBgColor,
                            backgroundImage:
                              (layer.fill || canvasBgColor) === 'transparent'
                                ? 'repeating-conic-gradient(#555 0% 25%, #888 0% 50%) 50% / 6px 6px'
                                : 'none',
                            borderRadius: '3px',
                            border: '1px solid var(--border-subtle)'
                          }}
                        />
                      ) : isImg && layer.src ? (
                        <img
                          src={layer.src}
                          alt={layer.name}
                          className="layer-thumb-img"
                        />
                      ) : (
                        <div className="layer-type-chip">
                          <Icon name={layer.icon || 'layers'} size={14} color="#c084fc" />
                        </div>
                      )}
                    </div>

                    {/* Layer Title & Info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <span className="layer-item-name" style={{ fontWeight: isSelected ? 600 : 400 }}>
                        {isText ? (layer.text || layer.name || 'Text Layer') : layer.name}
                      </span>
                      {isText && (
                        <span style={{ fontSize: '9px', color: '#a78bfa', lineHeight: 1.1 }}>
                          T &bull; {layer.font || 'Poppins'} {layer.size || 120}px
                        </span>
                      )}
                    </div>

                    {/* Lock Indicator */}
                    {layer.locked && (
                      <button
                        type="button"
                        className="layer-item-lock"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(layer.id);
                        }}
                        title="Unlock Layer"
                      >
                        <Icon name="lock" size={13} color="#9ca3af" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="layers-bottom-bar">
              <button
                type="button"
                className="layers-action-btn"
                title="Layer Effects (fx)"
                onClick={() => alert("Layer Effects (fx): Drop Shadow, Inner Shadow, Outer Glow, Stroke")}
              >
                <Icon name="fx" size={14} />
              </button>

              <button
                type="button"
                className="layers-action-btn"
                title="Add Layer Mask"
                onClick={() => alert("Layer mask added")}
              >
                <Icon name="mask" size={14} />
              </button>

              <button
                type="button"
                className="layers-action-btn"
                title="Create Adjustment Layer"
                onClick={() => {
                  addLayer('adjustment');
                  setActivePanel('adjustments');
                }}
              >
                <Icon name="circledot" size={14} />
              </button>

              <button
                type="button"
                className="layers-action-btn"
                title="New Group / Folder"
                onClick={() => alert("New Group created")}
              >
                <Icon name="folder" size={14} />
              </button>

              <button
                type="button"
                className="layers-action-btn"
                title="Create Text Layer (T)"
                onClick={() => addTextLayer()}
              >
                <Icon name="text" size={14} color="#c084fc" />
              </button>

              <button
                type="button"
                className="layers-action-btn"
                title="Create Image Layer"
                onClick={() => addLayer('image')}
              >
                <Icon name="plus" size={14} />
              </button>

              <button
                type="button"
                className="layers-action-btn delete-btn"
                title="Delete Layer"
                onClick={() => deleteLayer(selectedLayerId)}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </>
        )}

        {activeTab === 'Channels' && (
          <div className="channels-stack">
            <div className="channel-item">
              <Icon name="eye" size={14} />
              <span>RGB</span>
            </div>
            <div className="channel-item">
              <Icon name="eye" size={14} />
              <span>Red</span>
            </div>
            <div className="channel-item">
              <Icon name="eye" size={14} />
              <span>Green</span>
            </div>
            <div className="channel-item">
              <Icon name="eye" size={14} />
              <span>Blue</span>
            </div>
          </div>
        )}

        {activeTab === 'Paths' && (
          <div className="paths-stack">
            <div className="path-item">
              <span>Work Path</span>
            </div>
          </div>
        )}
      </div>

      <div className="screen-index-badge mini">8. Layers Panel</div>
    </div>
  );
}
