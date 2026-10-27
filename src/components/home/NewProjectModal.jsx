import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { CANVAS_PRESETS, createBlankCanvasDataUrl } from '../../utils/projectPresets';
import { useEditor } from '../../context/useEditor';

export default function NewProjectModal({ isOpen, onClose }) {
  const { createNewCanvasProject } = useEditor();

  const [projectName, setProjectName] = useState('Untitled-1');
  const [selectedPresetId, setSelectedPresetId] = useState('full-hd');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [backgroundType, setBackgroundType] = useState('white'); // white, dark, transparent

  if (!isOpen) return null;

  const handlePresetChange = (preset) => {
    setSelectedPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
  };

  const handleCreate = () => {
    const finalName = projectName.trim() ? (projectName.endsWith('.psd') ? projectName : `${projectName}.psd`) : 'Untitled.psd';
    const blankDataUrl = createBlankCanvasDataUrl(width, height, backgroundType);
    createNewCanvasProject({
      name: finalName,
      width,
      height,
      dataUrl: blankDataUrl,
      backgroundType
    });
    onClose();
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="new-project-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="export-dialog-header">
          <div className="top-brand">
            <h2 className="export-dialog-title">New Project</h2>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="new-project-modal-body">
          {/* Left Presets List */}
          <div className="new-project-presets-col">
            <span className="section-title-sm">Canvas Presets</span>
            <div className="presets-list-scroll">
              {CANVAS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`preset-item-card ${selectedPresetId === preset.id ? 'active' : ''}`}
                  onClick={() => handlePresetChange(preset)}
                >
                  <div className="preset-item-info">
                    <span className="preset-title">{preset.title}</span>
                    <span className="preset-desc">{preset.dimensions} &bull; {preset.aspect}</span>
                  </div>
                  <span className="preset-badge-tag">{preset.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Parameters Settings */}
          <div className="new-project-settings-col">
            <div className="export-field-group">
              <label className="export-label">Project Name</label>
              <input
                type="text"
                className="dialog-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Untitled-1"
              />
            </div>

            <div className="export-dims-grid">
              <div className="export-dim-col">
                <label className="export-label">Width</label>
                <div className="dim-input-wrapper">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => {
                      setWidth(Number(e.target.value));
                      setSelectedPresetId('custom');
                    }}
                    className="export-input"
                  />
                  <span className="unit-label">px</span>
                </div>
              </div>

              <div className="export-dim-col">
                <label className="export-label">Height</label>
                <div className="dim-input-wrapper">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => {
                      setHeight(Number(e.target.value));
                      setSelectedPresetId('custom');
                    }}
                    className="export-input"
                  />
                  <span className="unit-label">px</span>
                </div>
              </div>
            </div>

            {/* Background Style */}
            <div className="export-field-group">
              <label className="export-label">Background</label>
              <div className="bg-choices-row">
                <button
                  type="button"
                  className={`bg-choice-pill ${backgroundType === 'white' ? 'active' : ''}`}
                  onClick={() => setBackgroundType('white')}
                >
                  <span className="swatch-indicator white" />
                  <span>White</span>
                </button>
                <button
                  type="button"
                  className={`bg-choice-pill ${backgroundType === 'dark' ? 'active' : ''}`}
                  onClick={() => setBackgroundType('dark')}
                >
                  <span className="swatch-indicator dark" />
                  <span>Dark Obsidian</span>
                </button>
                <button
                  type="button"
                  className={`bg-choice-pill ${backgroundType === 'transparent' ? 'active' : ''}`}
                  onClick={() => setBackgroundType('transparent')}
                >
                  <span className="swatch-indicator transparent" />
                  <span>Transparent</span>
                </button>
              </div>
            </div>

            {/* Summary preview */}
            <div className="new-project-summary-box">
              <div className="summary-line">
                <span>Resolution:</span>
                <strong>{width} &times; {height} px</strong>
              </div>
              <div className="summary-line">
                <span>Aspect Ratio:</span>
                <span>{(width / height).toFixed(2)} : 1</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="export-dialog-actions" style={{ marginTop: 'auto' }}>
              <button className="dialog-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button className="dialog-primary-btn" onClick={handleCreate}>
                Create Canvas &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

