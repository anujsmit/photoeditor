import React, { useState } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';
import { exportCanvasImage, getCombinedFilterStyle } from '../../utils/imageProcessor';

export default function ExportDialog() {
  const {
    exportModalOpen,
    setExportModalOpen,
    currentImage,
    docDimensions,
    canvasBgColor,
    layers,
    documentTitle,
    adjustments,
    activeFilter,
    textLayer
  } = useEditor();

  const [format, setFormat] = useState('PNG');
  const [quality, setQuality] = useState(100);
  const [width, setWidth] = useState(docDimensions.width || 1920);
  const [height, setHeight] = useState(docDimensions.height || 1080);
  const [transparentBg, setTransparentBg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!exportModalOpen) return null;

  // Calculate dynamic estimated size
  const pixelCount = (width * height) / 1000000; // in megapixels
  let bytesPerMegapixel = format === 'PNG' ? 1.05 : format === 'WEBP' ? 0.35 : 0.6;
  const estimatedMB = Math.max(0.2, (pixelCount * bytesPerMegapixel * (quality / 100))).toFixed(1);

  const filterStyle = getCombinedFilterStyle(adjustments, activeFilter?.css);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const baseName = documentTitle.replace(/\.[^/.]+$/, '') || 'bard-export';
      await exportCanvasImage({
        imageSrc: currentImage,
        layers,
        canvasBgColor,
        docDimensions,
        format,
        quality,
        width,
        height,
        filterStyle,
        textLayer,
        transparentBg,
        fileName: baseName
      });
      setTimeout(() => {
        setIsExporting(false);
        setExportModalOpen(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setExportModalOpen(false);
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={() => setExportModalOpen(false)}>
      <div className="export-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="export-dialog-header">
          <h2 className="export-dialog-title">Export Image</h2>
          <button
            className="dialog-close-btn"
            onClick={() => setExportModalOpen(false)}
            title="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Modal Content Split */}
        <div className="export-dialog-body">
          {/* Left Preview */}
          <div className="export-preview-column">
            <div className="export-preview-frame">
              <img
                src={currentImage}
                alt="Export preview"
                className="export-preview-img"
                style={{ filter: filterStyle }}
              />
              {textLayer.visible && textLayer.text && (
                <div
                  className="export-text-overlay"
                  style={{
                    fontFamily: textLayer.font,
                    fontWeight: textLayer.weight === 'Bold' ? 700 : 400,
                    color: textLayer.color,
                    textShadow: textLayer.glow ? `0 0 10px ${textLayer.glowColor}` : 'none'
                  }}
                >
                  {textLayer.text}
                </div>
              )}
            </div>
          </div>

          {/* Right Parameters Settings */}
          <div className="export-settings-column">
            {/* Format */}
            <div className="export-field-group">
              <label className="export-label">Format</label>
              <select
                className="export-select"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="PNG">PNG</option>
                <option value="JPEG">JPEG</option>
                <option value="WEBP">WEBP</option>
                <option value="SVG">SVG</option>
                <option value="PDF">PDF</option>
              </select>
            </div>

            {/* Quality Slider */}
            <div className="export-field-group">
              <div className="export-label-row">
                <label className="export-label">Quality</label>
                <span className="export-val-badge">{quality}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="bard-range-input"
              />
            </div>

            {/* Dimensions */}
            <div className="export-dims-grid">
              <div className="export-dim-col">
                <label className="export-label">Width</label>
                <div className="dim-input-wrapper">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
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
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="export-input"
                  />
                  <span className="unit-label">px</span>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <label className="export-checkbox-row">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
              />
              <span>Transparent Background</span>
            </label>

            {/* Output Size Estimate */}
            <div className="export-estimate-note">
              Output Size: ~{estimatedMB} MB
            </div>

            {/* Action Buttons */}
            <div className="export-dialog-actions">
              <button
                className="dialog-cancel-btn"
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="export-confirm-btn"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>

        <div className="screen-index-badge mini">11. Export Dialog</div>
      </div>
    </div>
  );
}
