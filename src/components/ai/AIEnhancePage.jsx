import React, { useState, useEffect, useRef, useCallback } from 'react';
import SidebarNav from '../home/SidebarNav';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';
import { AI_EFFECTS_LIST, applyAiEffect, export4KImage } from '../../utils/aiEffects';

// Exclude remove-bg from the enhance page effects list so they remain completely distinct!
const ENHANCE_EFFECTS_LIST = AI_EFFECTS_LIST.filter((e) => e.id !== 'remove-bg');

export default function AIEnhancePage() {
  const {
    aiPhoto,
    setAiPhoto,
    aiPhotoName,
    setAiPhotoName,
    triggerAIToolUpload,
    setCurrentImage,
    setCurrentView,
    setDocumentTitle,
    pushHistorySnapshot
  } = useEditor();

  const fileInputRef = useRef(null);

  const sourcePhoto = aiPhoto || '';
  const photoName = aiPhotoName || 'photo.png';

  const [enhancedPhoto, setEnhancedPhoto] = useState(aiPhoto || '');
  const [photoDimensions, setPhotoDimensions] = useState({ width: 1920, height: 1080 });

  // Effects & Filters State
  const [selectedEffectId, setSelectedEffectId] = useState('auto-hdr');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'enhance' | 'style'
  const [effectIntensity, setEffectIntensity] = useState(100);

  // View & Comparison Mode
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side' | 'hold'

  // Processing & Export Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting4K, setIsExporting4K] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Apply AI effect transformation
  const runEffect = useCallback(async (effectId, intensityVal, targetPhoto) => {
    const photoToProcess = targetPhoto || sourcePhoto;
    if (!photoToProcess) return;

    setIsProcessing(true);
    const effectMeta = ENHANCE_EFFECTS_LIST.find((e) => e.id === effectId);
    setStatusMessage(`Applying ${effectMeta?.name || 'AI Effect'}...`);

    try {
      const result = await applyAiEffect(photoToProcess, effectId, intensityVal);
      setEnhancedPhoto(result);
      setStatusMessage(`✓ ${effectMeta?.name || 'Effect'} applied at ${intensityVal}%`);
    } catch (err) {
      console.error('Effect failed:', err);
      setStatusMessage('Failed to apply effect. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourcePhoto]);

  // Synchronize effect when photo, effect, or intensity changes
  useEffect(() => {
    if (!sourcePhoto) return;
    let isCancelled = false;

    Promise.resolve().then(() => {
      if (!isCancelled) {
        runEffect(selectedEffectId, effectIntensity, sourcePhoto);
      }
    });

    const img = new Image();
    img.onload = () => {
      if (!isCancelled) {
        setPhotoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      }
    };
    img.src = sourcePhoto;

    return () => {
      isCancelled = true;
    };
  }, [sourcePhoto, selectedEffectId, effectIntensity, runEffect]);

  // Handle effect selection directly
  const handleSelectEffect = (effectId) => {
    setSelectedEffectId(effectId);
  };

  // Handle intensity changes directly
  const handleIntensityChange = (val) => {
    setEffectIntensity(val);
  };

  // Handle Photo File Upload
  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAiPhoto(dataUrl);
      setAiPhotoName(file.name);
      setEnhancedPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 4K Ultra HD Super-Resolution Export
  const handleExport4K = async () => {
    if (!enhancedPhoto) return;
    setIsExporting4K(true);
    setStatusMessage('🚀 Upscaling and sharpening to 4K Ultra HD (3840 × 2160)...');

    try {
      const res = await export4KImage(enhancedPhoto, photoName, 'png');
      setStatusMessage(`✓ 4K Ultra HD Export Complete! (${res.width} × ${res.height})`);
      setTimeout(() => setStatusMessage(''), 4500);
    } catch (err) {
      console.error('4K export error:', err);
      setStatusMessage('Failed to export 4K image.');
    } finally {
      setIsExporting4K(false);
    }
  };

  // Download Original Size
  const handleDownloadOriginal = () => {
    if (!enhancedPhoto) return;
    const a = document.createElement('a');
    a.href = enhancedPhoto;
    const cleanName = photoName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}_AI_${selectedEffectId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatusMessage(`✓ Downloaded ${cleanName}_AI_${selectedEffectId}.png`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Open in full editor workspace
  const handleOpenInEditor = () => {
    if (!enhancedPhoto) return;
    setCurrentImage(enhancedPhoto);
    const cleanName = photoName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    setDocumentTitle(`${cleanName}_AI_${selectedEffectId}.png`);
    pushHistorySnapshot(enhancedPhoto);
    setCurrentView('editor');
  };

  // Filter effects by category
  const filteredEffects = ENHANCE_EFFECTS_LIST.filter((eff) => {
    if (activeCategory === 'all') return true;
    return eff.category === activeCategory;
  });

  const activeEffectObj = ENHANCE_EFFECTS_LIST.find((e) => e.id === selectedEffectId);

  // If no photo has been chosen yet, show the focused Select Image screen!
  if (!sourcePhoto) {
    return (
      <div className="home-layout ai-tools-layout">
        <header className="home-top-header">
          <div className="top-brand">
            <LogoIcon size={30} />
            <span className="top-brand-text">BARD Photo Editor</span>
            <span className="ai-brand-badge">AI Neural Enhance</span>
          </div>

          <div className="top-actions-right">
            <button
              className="dialog-cancel-btn"
              onClick={() => setCurrentView('home')}
              style={{ maxWidth: '140px', padding: '6px 14px', fontSize: '12px' }}
            >
              &larr; Back to Home
            </button>
            <WindowControls />
          </div>
        </header>

        {/* Top Feature Navigation Tabs */}
        <div className="ai-page-nav-strip">
          <button
            className="ai-page-tab active"
            onClick={() => triggerAIToolUpload('ai-enhance')}
          >
            <Icon name="sparkles" size={15} />
            <span>AI Enhance</span>
          </button>
          <button
            className="ai-page-tab"
            onClick={() => triggerAIToolUpload('remove-bg')}
          >
            <Icon name="scissors" size={15} />
            <span>Remove BG</span>
          </button>
        </div>

        <div className="home-body">
          <SidebarNav />

          <main className="ai-tools-main ai-select-photo-main">
            <div
              className={`ai-empty-select-screen ${isDraggingFile ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="ai-empty-select-card">
                <div className="ai-hero-icon-circle">
                  <Icon name="sparkles" size={48} color="#ffffff" />
                </div>

                <h2 className="ai-empty-hero-title">Select an Image for AI Enhancement</h2>
                <p className="ai-empty-hero-subtitle">
                  Upload any photo to enhance clarity, dynamic range, studio portrait lighting,
                  cinematic styles, and export in razor-sharp 4K Ultra HD.
                </p>

                <div className="ai-empty-action-buttons">
                  <button
                    className="ai-4k-export-btn ai-select-hero-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="upload" size={18} />
                    <span>Select Image from Computer</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                </div>

                <div className="ai-drag-drop-hint">
                  <span>or drag and drop your photo anywhere on this window</span>
                </div>
              </div>
            </div>
          </main>
        </div>

        <div className="screen-index-badge">AI Enhance Suite</div>
      </div>
    );
  }

  // Active AI Enhance Workspace
  return (
    <div className="home-layout ai-tools-layout">
      {/* Top Application Header */}
      <header className="home-top-header">
        <div className="top-brand">
          <LogoIcon size={30} />
          <span className="top-brand-text">BARD Photo Editor</span>
          <span className="ai-brand-badge">AI Neural Enhance</span>
        </div>

        <div className="top-search-bar">
          <Icon name="search" size={16} color="#8e89a5" />
          <input
            type="text"
            placeholder="Search AI effects, neural filters, styles..."
            readOnly
          />
        </div>

        <div className="top-actions-right">
          <button
            className="dialog-primary-btn ai-top-upload-btn"
            onClick={() => triggerAIToolUpload('ai-enhance')}
            title="Upload another photo"
          >
            <Icon name="upload" size={15} />
            <span>Select Image</span>
          </button>

          <WindowControls />
        </div>
      </header>

      {/* Top Feature Navigation Tabs */}
      <div className="ai-page-nav-strip">
        <button
          className="ai-page-tab active"
          onClick={() => setCurrentView('ai-enhance')}
        >
          <Icon name="sparkles" size={15} />
          <span>AI Enhance</span>
        </button>
        <button
          className="ai-page-tab"
          onClick={() => {
            if (sourcePhoto) {
              setCurrentView('remove-bg');
            } else {
              triggerAIToolUpload('remove-bg');
            }
          }}
        >
          <Icon name="scissors" size={15} />
          <span>Remove BG</span>
        </button>
      </div>

      <div className="home-body">
        <SidebarNav />

        <main className="ai-tools-main">
          {/* Top Sub-Nav Bar: Action Category & Photo Info */}
          <div className="ai-subnav-bar">
            <div className="ai-subnav-categories">
              {[
                { id: 'all', label: `All Effects (${ENHANCE_EFFECTS_LIST.length})` },
                { id: 'enhance', label: '✨ Enhancements' },
                { id: 'style', label: '🎨 Styles & Cinematic' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  className={`ai-subnav-pill ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="ai-photo-info-bar">
              <div className="ai-photo-meta-pill" title={`File: ${photoName}`}>
                <Icon name="image" size={13} color="#ffffff" />
                <span className="ai-meta-name">{photoName}</span>
                <span className="ai-meta-dims">
                  {photoDimensions.width} &times; {photoDimensions.height} px
                </span>
              </div>

              <button
                className="ai-change-photo-btn"
                onClick={() => triggerAIToolUpload('ai-enhance')}
                title="Select another photo from computer"
              >
                <Icon name="upload" size={13} />
                <span>Change Image</span>
              </button>
            </div>
          </div>

          <div className="ai-split-view-container">
            {/* Center Stage: Interactive Before/After Preview */}
            <div
              className={`ai-preview-zone ${isDraggingFile ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="ai-preview-content-box">
                {/* View Mode Switcher Header */}
                <div className="ai-viewmode-header">
                  <div className="ai-viewmode-switch">
                    <button
                      className={`ai-view-btn ${viewMode === 'slider' ? 'active' : ''}`}
                      onClick={() => setViewMode('slider')}
                      title="Interactive split slider"
                    >
                      <Icon name="sliders" size={13} />
                      <span>Split Slider</span>
                    </button>
                    <button
                      className={`ai-view-btn ${viewMode === 'hold' ? 'active' : ''}`}
                      onClick={() => setViewMode('hold')}
                      title="Click and hold to compare with original"
                    >
                      <Icon name="eye" size={13} />
                      <span>Hold to Compare</span>
                    </button>
                    <button
                      className={`ai-view-btn ${viewMode === 'side-by-side' ? 'active' : ''}`}
                      onClick={() => setViewMode('side-by-side')}
                      title="View side by side"
                    >
                      <Icon name="shapes" size={13} />
                      <span>Side by Side</span>
                    </button>
                  </div>

                  <div className="ai-current-effect-badge">
                    <span className="ai-active-indicator" />
                    <span>{activeEffectObj?.name || 'Selected Effect'}</span>
                  </div>
                </div>

                {/* Interactive Before & After Canvas */}
                <div className="ai-canvas-viewport">
                  <BeforeAfterSlider
                    beforeImage={sourcePhoto}
                    afterImage={enhancedPhoto}
                    beforeLabel="Original"
                    afterLabel={activeEffectObj?.name || "Enhanced"}
                    viewMode={viewMode}
                  />

                  {isProcessing && (
                    <div className="ai-processing-overlay">
                      <div className="ai-spinner-circle" />
                      <span>Enhancing with Neural AI...</span>
                    </div>
                  )}
                </div>

                {/* Intensity Adjustment Bar */}
                <div className="ai-intensity-row">
                  <div className="ai-intensity-label">
                    <span>Effect Strength:</span>
                    <strong>{effectIntensity}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={effectIntensity}
                    onChange={(e) => handleIntensityChange(Number(e.target.value))}
                    className="ai-intensity-slider"
                    title="Adjust enhancement intensity"
                  />
                  <div className="ai-intensity-presets">
                    {[25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        className={`ai-intensity-chip ${effectIntensity === val ? 'active' : ''}`}
                        onClick={() => handleIntensityChange(val)}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Options Sidebar: Complete Effects Gallery & 4K Export */}
            <aside className="ai-options-sidebar">
              {/* Quick Enhance Types (from Design Reference Mockup) */}
              <div className="ai-enhance-types-box">
                <h3 className="ai-enhance-types-heading">Enhance Type</h3>
                <div className="ai-enhance-types-list">
                  {[
                    { id: 'auto-hdr', label: 'Auto Enhance' },
                    { id: 'portrait-retouch', label: 'Face Enhancement' },
                    { id: 'vivid-pop', label: 'Color Correction' },
                    { id: 'super-clarity', label: 'Remove Noise / Sharpen' },
                    { id: 'night-boost', label: 'Upscale (2x / 4K Boost)' }
                  ].map((item) => {
                    const isChecked = selectedEffectId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`ai-enhance-type-row ${isChecked ? 'active' : ''}`}
                        onClick={() => handleSelectEffect(item.id)}
                      >
                        <div className={`ai-mock-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <Icon name="check" size={11} color="#ffffff" strokeWidth={3} />}
                        </div>
                        <span className="ai-type-label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="ai-sidebar-header">
                <div>
                  <h2 className="ai-options-title">AI Effects Collection</h2>
                  <p className="ai-options-subtitle">Select any effect to apply instantly</p>
                </div>
                <span className="ai-effects-count-pill">{filteredEffects.length} Effects</span>
              </div>

              {/* Scrollable Collection of Effects Cards */}
              <div className="ai-effects-gallery-list">
                {filteredEffects.map((effect) => {
                  const isSelected = selectedEffectId === effect.id;
                  return (
                    <div
                      key={effect.id}
                      className={`ai-effect-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectEffect(effect.id)}
                    >
                      <div
                        className="ai-card-icon-badge"
                        style={{ background: effect.gradient }}
                      >
                        <Icon name={effect.icon} size={16} color="#ffffff" />
                      </div>

                      <div className="ai-card-content">
                        <div className="ai-card-title-row">
                          <h4 className="ai-card-name">{effect.name}</h4>
                          {effect.tag && (
                            <span className={`ai-card-tag tag-${effect.tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                              {effect.tag}
                            </span>
                          )}
                        </div>
                        <p className="ai-card-desc">{effect.description}</p>
                      </div>

                      {isSelected && (
                        <div className="ai-card-check">
                          <Icon name="check" size={14} color="#000000" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Feedback Toast */}
              {statusMessage && (
                <div className="ai-status-feedback">
                  <Icon name="sparkles" size={14} color="#ffffff" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons & 4K Export */}
              <div className="ai-action-buttons-group">
                {/* 4K ULTRA HD EXPORT BUTTON */}
                <button
                  className="ai-4k-export-btn"
                  onClick={handleExport4K}
                  disabled={isProcessing || isExporting4K || !enhancedPhoto}
                  title="Export photo upscaled to 4K Ultra HD (3840 × 2160)"
                >
                  <Icon name="zap" size={17} color="#ffffff" />
                  <span>{isExporting4K ? 'Upscaling to 4K UHD...' : '🚀 Export 4K Ultra HD'}</span>
                </button>

                <div className="ai-secondary-actions-row">
                  <button
                    className="ai-btn-secondary"
                    onClick={handleDownloadOriginal}
                    disabled={!enhancedPhoto}
                    title="Download at original resolution"
                  >
                    <Icon name="download" size={14} />
                    <span>Download Original</span>
                  </button>

                  <button
                    className="ai-btn-secondary accent"
                    onClick={handleOpenInEditor}
                    disabled={!enhancedPhoto}
                    title="Transfer enhanced image into multi-layer editor"
                  >
                    <Icon name="move" size={14} />
                    <span>Open in Editor &rarr;</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      <div className="screen-index-badge">AI Enhance Suite</div>
    </div>
  );
}

