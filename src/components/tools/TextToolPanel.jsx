import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';
import {
  TOP_GOOGLE_FONTS,
  DESKTOP_SYSTEM_FONTS,
  ensureGoogleFont,
  queryDesktopFonts
} from '../../utils/fonts';

export default function TextToolPanel() {
  const {
    textLayer,
    setTextLayer,
    setActivePanel,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    addTextLayer
  } = useEditor();
  const [activeTab, setActiveTab] = useState('Text');
  const [fontSearch, setFontSearch] = useState('');
  const [desktopFonts, setDesktopFonts] = useState(DESKTOP_SYSTEM_FONTS);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  const textLayersList = layers.filter(l => l.type === 'text');
  const weights = ['Bold', 'Semi-Bold', 'Regular', 'Light'];

  // Scan local system fonts using window.queryLocalFonts
  const handleScanFonts = async () => {
    setIsScanning(true);
    try {
      const list = await queryDesktopFonts();
      setDesktopFonts(list);
      setScanMessage(`Loaded ${list.length} desktop fonts`);
      setTimeout(() => setScanMessage(null), 3000);
    } catch {
      setScanMessage('Desktop fonts loaded');
      setTimeout(() => setScanMessage(null), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFontSelect = (fontName) => {
    ensureGoogleFont(fontName);
    setTextLayer(t => ({ ...t, font: fontName }));
  };

  // Filter Google and Desktop fonts
  const filteredGoogleFonts = TOP_GOOGLE_FONTS.filter(f =>
    !fontSearch || f.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  const filteredDesktopFonts = desktopFonts.filter(f =>
    !fontSearch || f.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  return (
    <div className="tool-dialog-panel text-panel">
      {/* Header */}
      <div className="text-panel-header">
        <div className="text-panel-tabs">
          {['Text', 'Paragraph'].map((tab) => (
            <button
              key={tab}
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
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => addTextLayer()}
            title="Create a new text layer"
          >
            + New Text
          </button>
          <button
            type="button"
            className="dialog-close-btn"
            onClick={() => setActivePanel(null)}
            title="Close Text Tool"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>

      <div className="text-panel-content">
        {/* Layer Selector if multiple text layers exist */}
        {textLayersList.length > 1 && (
          <div className="dialog-control-group" style={{ marginBottom: '10px' }}>
            <label className="dialog-label">Active Text Layer</label>
            <select
              className="dialog-select"
              value={selectedLayerId}
              onChange={(e) => setSelectedLayerId(e.target.value)}
            >
              {textLayersList.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.text ? `T: ${tl.text}` : tl.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Live Text Preview Box */}
        <div className="text-preview-showcase">
          <div
            className={`text-preview-neon ${textLayer.glow ? 'glowing' : ''}`}
            style={{
              fontFamily: textLayer.font,
              fontWeight: textLayer.weight === 'Bold' ? 700 : 400,
              color: textLayer.color,
              textShadow: textLayer.glow ? `0 0 15px ${textLayer.glowColor}` : 'none'
            }}
          >
            {textLayer.text || 'BARD Photo Editor'}
          </div>
        </div>

        {/* Text Input */}
        <div className="dialog-control-group">
          <label className="dialog-label">Content</label>
          <input
            type="text"
            className="dialog-input"
            value={textLayer.text}
            onChange={(e) => setTextLayer(t => ({ ...t, text: e.target.value }))}
            placeholder="Enter overlay text..."
          />
        </div>

        {/* Font Family Selection with Google Fonts & Desktop Fonts */}
        <div className="dialog-control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="dialog-label" style={{ margin: 0 }}>Font Family</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {scanMessage && (
                <span style={{ fontSize: '10px', color: '#4ade80' }}>{scanMessage}</span>
              )}
              <button
                type="button"
                className="settings-action-btn"
                style={{ fontSize: '10px', padding: '2px 7px' }}
                onClick={handleScanFonts}
                title="Detect installed desktop fonts from your computer"
              >
                {isScanning ? 'Scanning...' : '🖥️ Scan Desktop Fonts'}
              </button>
            </div>
          </div>

          {/* Quick font search filter */}
          <div style={{ position: 'relative', marginBottom: '6px' }}>
            <input
              type="text"
              className="dialog-input"
              style={{ fontSize: '11px', paddingLeft: '24px', paddingRight: '8px', height: '28px' }}
              placeholder="Filter fonts (e.g. Roboto, Montserrat, Arial)..."
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
            />
            <div style={{ position: 'absolute', left: '7px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={12} color="#6b7280" />
            </div>
          </div>

          <select
            className="dialog-select"
            value={textLayer.font}
            onChange={(e) => handleFontSelect(e.target.value)}
            style={{ fontSize: '12px' }}
          >
            <optgroup label="⭐ Top Google Fonts (Online)">
              {filteredGoogleFonts.map((f) => (
                <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                  {f.name} ({f.category})
                </option>
              ))}
            </optgroup>

            <optgroup label="🖥️ Desktop / System Fonts">
              {filteredDesktopFonts.map((f) => (
                <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>
                  {f.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Weight & Size */}
        <div className="text-weight-size-row">
          <div className="weight-col">
            <label className="dialog-label">Weight</label>
            <select
              className="dialog-select"
              value={textLayer.weight}
              onChange={(e) => setTextLayer(t => ({ ...t, weight: e.target.value }))}
            >
              {weights.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="size-col">
            <label className="dialog-label">Size</label>
            <input
              type="number"
              className="dialog-input"
              value={textLayer.size}
              onChange={(e) => setTextLayer(t => ({ ...t, size: Number(e.target.value) }))}
            />
          </div>

          <div className="color-col">
            <label className="dialog-label">Color</label>
            <input
              type="color"
              className="text-color-swatch-input"
              value={textLayer.color}
              onChange={(e) => setTextLayer(t => ({ ...t, color: e.target.value }))}
            />
          </div>
        </div>

        {/* Style Effects Toggles */}
        <div className="dialog-control-group">
          <label className="dialog-label">Effects</label>
          <div className="text-effects-row">
            <button
              type="button"
              className={`effect-pill-btn ${textLayer.outline ? 'active' : ''}`}
              onClick={() => setTextLayer(t => ({ ...t, outline: !t.outline }))}
            >
              Outline
            </button>
            <button
              type="button"
              className={`effect-pill-btn ${textLayer.shadow ? 'active' : ''}`}
              onClick={() => setTextLayer(t => ({ ...t, shadow: !t.shadow }))}
            >
              Shadow
            </button>
            <button
              type="button"
              className={`effect-pill-btn ${textLayer.glow ? 'active' : ''}`}
              onClick={() => setTextLayer(t => ({ ...t, glow: !t.glow }))}
            >
              Glow
            </button>
            <button
              type="button"
              className={`effect-pill-btn ${textLayer.background ? 'active' : ''}`}
              onClick={() => setTextLayer(t => ({ ...t, background: !t.background }))}
            >
              Background
            </button>
          </div>

          {/* Glow Color Swatches */}
          {textLayer.glow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <span className="dialog-label" style={{ margin: 0, fontSize: '11px' }}>Glow Color:</span>
              {['#c084fc', '#38bdf8', '#f43f5e', '#facc15', '#4ade80', '#ffffff'].map((gc) => (
                <button
                  key={gc}
                  type="button"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: gc,
                    border: textLayer.glowColor === gc ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: textLayer.glowColor === gc ? `0 0 10px ${gc}` : 'none'
                  }}
                  onClick={() => setTextLayer(t => ({ ...t, glowColor: gc }))}
                  title={`Glow: ${gc}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="screen-index-badge mini">7. Text Tool</div>
    </div>
  );
}
