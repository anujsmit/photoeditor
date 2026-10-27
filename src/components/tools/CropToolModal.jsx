import React from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function CropToolModal() {
  const {
    cropSettings,
    setCropSettings,
    setCropActive,
    setActivePanel,
    cropRect,
    setCropRect,
    executeCrop
  } = useEditor();

  const presets = [
    { label: '1:1', ratio: 1, w: 1080, h: 1080, cw: 70, ch: 70 },
    { label: '16:9', ratio: 16 / 9, w: 1920, h: 1080, cw: 80, ch: 45 },
    { label: '9:16', ratio: 9 / 16, w: 1080, h: 1920, cw: 45, ch: 80 },
    { label: '4:3', ratio: 4 / 3, w: 1440, h: 1080, cw: 80, ch: 60 }
  ];

  const handlePresetSelect = (p) => {
    setCropSettings(prev => ({
      ...prev,
      ratio: p.label,
      width: p.w,
      height: p.h
    }));
    setCropRect({
      x: Math.round((100 - p.cw) / 2),
      y: Math.round((100 - p.ch) / 2),
      width: p.cw,
      height: p.ch
    });
  };

  const handleApply = () => {
    executeCrop(cropRect);
  };

  const handleCancel = () => {
    setCropActive(false);
    setActivePanel(null);
  };

  return (
    <div className="tool-dialog-panel crop-panel">
      <div className="tool-dialog-header">
        <h3 className="dialog-title">Crop</h3>
        <button className="dialog-close-btn" onClick={handleCancel}>
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="tool-dialog-content">
        {/* Aspect Ratio select */}
        <div className="dialog-control-group">
          <label className="dialog-label">Aspect Ratio</label>
          <select
            className="dialog-select"
            value={cropSettings.ratio}
            onChange={(e) => setCropSettings(s => ({ ...s, ratio: e.target.value }))}
          >
            <option value="Original">Original</option>
            <option value="1:1">1:1 Square</option>
            <option value="16:9">16:9 Landscape</option>
            <option value="9:16">9:16 Portrait / Story</option>
            <option value="4:3">4:3 Standard</option>
            <option value="Custom">Custom</option>
          </select>
        </div>

        {/* Quick Presets row */}
        <div className="dialog-control-group">
          <label className="dialog-label">Presets</label>
          <div className="crop-presets-row">
            {presets.map((p) => (
              <button
                key={p.label}
                className={`preset-pill-btn ${cropSettings.ratio === p.label ? 'active' : ''}`}
                onClick={() => handlePresetSelect(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Width & Height */}
        <div className="crop-dimensions-row">
          <div className="crop-dim-field">
            <label className="dialog-label">Width</label>
            <input
              type="number"
              className="dialog-input"
              value={cropSettings.width}
              onChange={(e) => setCropSettings(s => ({ ...s, width: Number(e.target.value) }))}
            />
          </div>
          <span className="dim-times">&times;</span>
          <div className="crop-dim-field">
            <label className="dialog-label">Height</label>
            <input
              type="number"
              className="dialog-input"
              value={cropSettings.height}
              onChange={(e) => setCropSettings(s => ({ ...s, height: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="crop-checkboxes-group">
          <label className="crop-checkbox-label">
            <input
              type="checkbox"
              checked={cropSettings.deleteCropped}
              onChange={(e) => setCropSettings(s => ({ ...s, deleteCropped: e.target.checked }))}
            />
            <span>Delete Cropped Pixels</span>
          </label>

          <label className="crop-checkbox-label">
            <input
              type="checkbox"
              checked={cropSettings.contentAware}
              onChange={(e) => setCropSettings(s => ({ ...s, contentAware: e.target.checked }))}
            />
            <span>Content Aware</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="dialog-actions-row">
          <button className="dialog-primary-btn" onClick={handleApply}>
            Apply
          </button>
          <button className="dialog-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className="screen-index-badge mini">4. Crop Tool</div>
    </div>
  );
}
