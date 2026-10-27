import React, { useState, useEffect } from 'react';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';

export default function EditorTopBar() {
  const {
    setCurrentView,
    autoSelectMode,
    setAutoSelectMode,
    showTransformControls,
    setShowTransformControls,
    setExportModalOpen,
    setNewProjectModalOpen,
    setActivePanel,
    triggerOpenFileDialog,
    triggerAddImageLayerDialog,
    setZoomLevel,
    zoomLevel,
    setPanOffset,
    activeTool,
    brushSize,
    setBrushSize,
    brushOpacity,
    setBrushOpacity,
    canvasBgColor,
    changeCanvasBgColor,
    workspaceTheme,
    setWorkspaceTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    bakeCurrentAdjustments,
    addTextLayer,
    saveProjectChanges,
    downloadProjectFile,
    autoSaveEnabled,
    setAutoSaveEnabled,
    isAutoSaving,
    clipCanvasOverflow,
    setClipCanvasOverflow,
    shortcuts,
    setShortcutsModalOpen,
    deleteSelectedOrTextLayer,
    shapeSettings,
    setShapeSettings,
    addShapeLayer,
    updateShapeLayer,
    removeSelectedLayerBackground,
    isRemovingBg,
    setAiPhoto,
    currentImage
  } = useEditor();

  const [activeMenu, setActiveMenu] = useState(null);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);

  // Global Ctrl+S / Cmd+S shortcut to save project changes anytime
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveProjectChanges();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProjectChanges]);

  const toggleMenu = (menuName) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName));
  };

  const closeMenu = () => {
    setActiveMenu(null);
    setBgMenuOpen(false);
  };

  const bgSwatches = [
    { label: 'White', color: '#ffffff' },
    { label: 'Dark', color: '#12101c' },
    { label: 'Black', color: '#000000' },
    { label: 'Gray', color: '#808080' },
    { label: 'Cream', color: '#f5f0e6' },
    { label: 'Transparent', color: 'transparent' }
  ];

  return (
    <header className="editor-top-bar-container">
      {/* Top Application Menu Line */}
      <div className="editor-menu-row">
        <div className="editor-menu-left">
          <button
            className="editor-home-badge-btn"
            onClick={() => setCurrentView('home')}
            title="Return to Home Dashboard"
          >
            <LogoIcon size={24} />
            <span className="brand-label">BARD Photo Editor</span>
          </button>

          <nav className="editor-menus-nav">
            {/* File Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'file' ? 'active' : ''}`}
                onClick={() => toggleMenu('file')}
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { setNewProjectModalOpen(true); closeMenu(); }}>
                    <span>New Project...</span>
                    <kbd>Ctrl+N</kbd>
                  </button>
                  <button onClick={() => { triggerOpenFileDialog(); closeMenu(); }}>
                    <span>Open Image...</span>
                    <kbd>Ctrl+O</kbd>
                  </button>
                  <button onClick={() => { triggerAddImageLayerDialog(); closeMenu(); }}>
                    <span>Place / Add Image Layer...</span>
                    <kbd>Ctrl+Shift+O</kbd>
                  </button>
                  <hr />
                  <button onClick={() => { saveProjectChanges(); closeMenu(); }}>
                    <span>Save Project</span>
                    <kbd>Ctrl+S</kbd>
                  </button>
                  <button onClick={() => { downloadProjectFile(); closeMenu(); }}>
                    <span>Save Project File (.bard)...</span>
                  </button>
                  <hr />
                  <button onClick={() => { setExportModalOpen(true); closeMenu(); }}>
                    <span>Export Image...</span>
                    <kbd>Ctrl+E</kbd>
                  </button>
                  <hr />
                  <button onClick={() => { setCurrentView('home'); closeMenu(); }}>
                    <span>Close to Dashboard</span>
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'edit' ? 'active' : ''}`}
                onClick={() => toggleMenu('edit')}
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { undo(); closeMenu(); }} disabled={!canUndo}>
                    <span>Undo</span>
                    <kbd>Ctrl+Z</kbd>
                  </button>
                  <button onClick={() => { redo(); closeMenu(); }} disabled={!canRedo}>
                    <span>Redo</span>
                    <kbd>Ctrl+Y</kbd>
                  </button>
                  <hr />
                  <button onClick={() => { deleteSelectedOrTextLayer(); closeMenu(); }}>
                    <span>Delete Text / Layer</span>
                    <kbd>{shortcuts?.deleteText?.display || 'Ctrl+T'}</kbd>
                  </button>
                  <button onClick={() => { setShowTransformControls(p => !p); closeMenu(); }}>
                    <span>Toggle Transform Handles</span>
                  </button>
                </div>
              )}
            </div>

            {/* Image Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'image' ? 'active' : ''}`}
                onClick={() => toggleMenu('image')}
              >
                Image
              </button>
              {activeMenu === 'image' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { setActivePanel(p => p === 'adjustments' ? null : 'adjustments'); closeMenu(); }}>
                    <span>Adjustments Panel</span>
                  </button>
                  <button onClick={() => { bakeCurrentAdjustments(); closeMenu(); }}>
                    <span>Bake Adjustments into Pixels</span>
                  </button>
                  <button onClick={() => { setActivePanel(p => p === 'crop' ? null : 'crop'); closeMenu(); }}>
                    <span>Crop Tool</span>
                  </button>
                  <hr />
                  <button onClick={() => { removeSelectedLayerBackground(); closeMenu(); }}>
                    <span>🪄 Remove Background</span>
                  </button>
                </div>
              )}
            </div>

            {/* Layer Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'layer' ? 'active' : ''}`}
                onClick={() => toggleMenu('layer')}
              >
                Layer
              </button>
              {activeMenu === 'layer' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { triggerAddImageLayerDialog(); closeMenu(); }}>
                    <span>Add Image Layer...</span>
                  </button>
                  <button onClick={() => { addTextLayer(); closeMenu(); }}>
                    <span>Add Text Layer (T)</span>
                    <kbd>T</kbd>
                  </button>
                  <button onClick={() => { setActivePanel(p => p === 'layers' ? null : 'layers'); closeMenu(); }}>
                    <span>Layers Panel</span>
                  </button>
                  <hr />
                  <button onClick={() => { removeSelectedLayerBackground(); closeMenu(); }}>
                    <span>🪄 Remove Background from Layer</span>
                  </button>
                </div>
              )}
            </div>

            {/* Filter Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'filter' ? 'active' : ''}`}
                onClick={() => toggleMenu('filter')}
              >
                Filter
              </button>
              {activeMenu === 'filter' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { setActivePanel(p => p === 'filters' ? null : 'filters'); closeMenu(); }}>
                    <span>Filter Gallery</span>
                  </button>
                  <button onClick={() => { 
                    if (currentImage) setAiPhoto(currentImage);
                    setCurrentView('ai-enhance'); 
                    closeMenu(); 
                  }}>
                    <span>AI Neural Enhance</span>
                  </button>
                  <button onClick={() => { 
                    if (currentImage) setAiPhoto(currentImage);
                    setCurrentView('remove-bg'); 
                    closeMenu(); 
                  }}>
                    <span>Remove Background Suite</span>
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="menu-dropdown-wrapper">
              <button
                className={`menu-trigger-btn ${activeMenu === 'view' ? 'active' : ''}`}
                onClick={() => toggleMenu('view')}
              >
                View
              </button>
              {activeMenu === 'view' && (
                <div className="menu-popup-dropdown" onMouseLeave={closeMenu}>
                  <button onClick={() => { setZoomLevel(70); setPanOffset({ x: 0, y: 0 }); closeMenu(); }}>
                    <span>Fit to Screen</span>
                    <kbd>Ctrl+0</kbd>
                  </button>
                  <button onClick={() => { setZoomLevel(100); setPanOffset({ x: 0, y: 0 }); closeMenu(); }}>
                    <span>100% Actual Size</span>
                    <kbd>Ctrl+1</kbd>
                  </button>
                  <button onClick={() => { setZoomLevel((z) => Math.min(400, z + 25)); closeMenu(); }}>
                    <span>Zoom In (+25%)</span>
                    <kbd>Ctrl++</kbd>
                  </button>
                  <button onClick={() => { setZoomLevel((z) => Math.max(10, z - 25)); closeMenu(); }}>
                    <span>Zoom Out (-25%)</span>
                    <kbd>Ctrl+-</kbd>
                  </button>
                  <hr />
                  <button onClick={() => { setClipCanvasOverflow(p => !p); closeMenu(); }}>
                    <span>{clipCanvasOverflow ? '✓ Clip Canvas Overflow' : 'Clip Canvas Overflow'}</span>
                    <kbd>{shortcuts?.toggleClip?.display || 'Ctrl+\\'}</kbd>
                  </button>
                </div>
              )}
            </div>

            <button className="menu-trigger-btn" onClick={() => setActivePanel(p => p === 'layers' ? null : 'layers')}>
              Window
            </button>
            <button className="menu-trigger-btn" onClick={() => setShortcutsModalOpen(true)}>
              Shortcuts
            </button>
          </nav>
        </div>

        <div className="editor-menu-right">
          {/* Undo / Redo Quick Buttons */}
          <div className="history-action-buttons">
            <button
              className="option-icon-btn"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{ opacity: canUndo ? 1 : 0.4 }}
            >
              <Icon name="undo" size={15} />
            </button>
            <button
              className="option-icon-btn"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              style={{ opacity: canRedo ? 1 : 0.4 }}
            >
              <Icon name="redo" size={15} />
            </button>
          </div>

          {/* Auto-Save Status & Switch Button */}
          <button
            type="button"
            className={`editor-autosave-btn ${autoSaveEnabled ? 'active' : ''}`}
            onClick={() => setAutoSaveEnabled(p => !p)}
            title={autoSaveEnabled ? "Auto-Save is ON. Click to disable." : "Auto-Save is OFF. Click to enable."}
          >
            <span className={`autosave-status-dot ${isAutoSaving ? 'pulsing' : autoSaveEnabled ? 'on' : 'off'}`} />
            <span>{isAutoSaving ? 'Saving...' : autoSaveEnabled ? 'Auto-Save: ON' : 'Auto-Save: OFF'}</span>
          </button>

          <button
            type="button"
            className="editor-save-btn"
            onClick={saveProjectChanges}
            title="Save Project Changes (Ctrl+S)"
          >
            <Icon name="save" size={15} color="#ffffff" />
            <span>Save</span>
          </button>

          <button
            className="editor-export-btn"
            onClick={() => setExportModalOpen(true)}
            title="Export Image (Ctrl+E)"
          >
            <Icon name="export" size={16} color="#000000" />
            <span>Export</span>
          </button>

          <WindowControls />
        </div>
      </div>

      {/* Dynamic Options Bar Beneath Menu */}
      <div className="editor-options-bar">
        {/* Left Side: Tool Options OR Default Controls */}
        {(activeTool === 'brush' || activeTool === 'eraser') && (
          <div className="options-left-group">
            <span className="option-label">{activeTool === 'brush' ? 'Brush Size:' : 'Eraser Size:'}</span>
            <input
              type="range"
              min="2"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="bard-range-input"
              style={{ width: '90px' }}
            />
            <span className="zoom-text">{brushSize}px</span>

            <div className="options-divider" />

            <span className="option-label">Opacity:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={brushOpacity}
              onChange={(e) => setBrushOpacity(Number(e.target.value))}
              className="bard-range-input"
              style={{ width: '80px' }}
            />
            <span className="zoom-text">{brushOpacity}%</span>
          </div>
        )}

        {activeTool === 'shapes' && (
          <div className="options-left-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="option-label">Shape Layout:</span>
            <select
              className="option-select"
              value={shapeSettings.shapeType || 'rectangle'}
              onChange={(e) => {
                const sType = e.target.value;
                const cRad = sType === 'rounded-rect' ? 24 : sType === 'rectangle' ? 0 : (shapeSettings.cornerRadius || 0);
                setShapeSettings(p => ({ ...p, shapeType: sType, cornerRadius: cRad }));
                updateShapeLayer({ shapeType: sType, cornerRadius: cRad });
              }}
            >
              <option value="rectangle">Rectangle</option>
              <option value="rounded-rect">Rounded Rectangle</option>
              <option value="circle">Circle / Ellipse</option>
              <option value="triangle">Triangle</option>
              <option value="star">Star Badge</option>
              <option value="line">Line / Divider</option>
            </select>

            {/* Fill Color */}
            <span className="option-label">Fill:</span>
            <input
              type="color"
              value={shapeSettings.fill === 'transparent' ? '#ffffff' : (shapeSettings.fill || '#ffffff')}
              onChange={(e) => {
                setShapeSettings(p => ({ ...p, fill: e.target.value }));
                updateShapeLayer({ fill: e.target.value });
              }}
              style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              title="Shape Fill Color"
            />

            {/* Stroke Color */}
            <span className="option-label">Stroke:</span>
            <input
              type="color"
              value={shapeSettings.stroke === 'transparent' ? '#ffffff' : (shapeSettings.stroke || '#ffffff')}
              onChange={(e) => {
                setShapeSettings(p => ({ ...p, stroke: e.target.value }));
                updateShapeLayer({ stroke: e.target.value });
              }}
              style={{ width: '22px', height: '22px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              title="Shape Stroke Color"
            />
            <input
              type="range"
              min="0"
              max="25"
              value={shapeSettings.strokeWidth ?? 2}
              onChange={(e) => {
                const val = Number(e.target.value);
                setShapeSettings(p => ({ ...p, strokeWidth: val }));
                updateShapeLayer({ strokeWidth: val });
              }}
              className="bard-range-input"
              style={{ width: '60px' }}
              title="Stroke Width"
            />
            <span className="zoom-text">{shapeSettings.strokeWidth ?? 2}px</span>

            {/* Corner Radius for rects */}
            {['rectangle', 'rounded-rect'].includes(shapeSettings.shapeType) && (
              <>
                <span className="option-label">Radius:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={shapeSettings.cornerRadius ?? 16}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setShapeSettings(p => ({ ...p, cornerRadius: val }));
                    updateShapeLayer({ cornerRadius: val });
                  }}
                  className="dialog-input"
                  style={{ width: '45px', padding: '2px 4px', height: '24px', textAlign: 'center' }}
                  title="Corner Radius (px)"
                />
              </>
            )}

            <button
              type="button"
              className="option-pill-action-btn"
              onClick={() => addShapeLayer()}
              title="Add a new shape layer"
            >
              <Icon name="plus" size={12} color="#ffffff" />
              <span>+ Add Shape</span>
            </button>

            <button
              type="button"
              className="option-pill-action-btn"
              onClick={() => setActivePanel('shapes')}
              title="Open full Shape Tool layout panel with presets & styling"
            >
              <Icon name="layout" size={13} color="#ffffff" />
              <span>Shape Layout</span>
            </button>
          </div>
        )}

        {activeTool === 'eyedropper' && (
          <div className="options-left-group">
            <span className="option-label">Eyedropper:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Click any pixel on canvas to sample color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: foregroundColor, border: '1px solid #ffffff' }} />
              <span style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }}>{foregroundColor}</span>
            </div>
          </div>
        )}

        {activeTool === 'bucket' && (
          <div className="options-left-group">
            <span className="option-label">Paint Bucket:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Click to fill active layer or canvas</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: foregroundColor, border: '1px solid #ffffff' }} />
              <span style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }}>{foregroundColor}</span>
            </div>
          </div>
        )}

        {activeTool === 'lasso' && (
          <div className="options-left-group">
            <span className="option-label">Lasso Selection:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Drag freehand to select canvas region</span>
          </div>
        )}

        {activeTool === 'stamp' && (
          <div className="options-left-group">
            <span className="option-label">Clone Stamp:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Alt+Click to sample source, then paint to clone</span>
          </div>
        )}

        {activeTool === 'blur' && (
          <div className="options-left-group">
            <span className="option-label">Blur &amp; Sharpen Tool:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Paint over image to soften or sharpen details</span>
          </div>
        )}

        {activeTool === 'dodge' && (
          <div className="options-left-group">
            <span className="option-label">Dodge &amp; Burn:</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>Paint over highlights or shadows to adjust exposure</span>
          </div>
        )}

        {!['brush', 'eraser', 'shapes', 'eyedropper', 'bucket', 'lasso', 'stamp', 'blur', 'dodge'].includes(activeTool) && (
          <div className="options-left-group">
            {/* Auto Select */}
            <div className="option-control">
              <span className="option-label">Auto Select:</span>
              <select
                className="option-select"
                value={autoSelectMode}
                onChange={(e) => setAutoSelectMode(e.target.value)}
              >
                <option value="Layer">Layer</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <label className="option-checkbox-label">
              <input
                type="checkbox"
                checked={showTransformControls}
                onChange={(e) => setShowTransformControls(e.target.checked)}
              />
              <span>Show Transform Controls</span>
            </label>

            <label
              className="option-checkbox-label"
              title="Hide / clip content extending outside canvas dimensions"
            >
              <input
                type="checkbox"
                checked={clipCanvasOverflow}
                onChange={(e) => setClipCanvasOverflow(e.target.checked)}
              />
              <span>Clip Canvas Overflow</span>
            </label>

            <div className="options-divider" />

            <button
              className="option-pill-action-btn"
              onClick={() => setShortcutsModalOpen(true)}
              title="View & customize keyboard shortcuts (e.g. Ctrl+T to delete text/layer)"
            >
              <Icon name="pointer" size={13} color="#ffffff" />
              <span>⌨ Shortcuts</span>
            </button>

            <div className="options-divider" />

            {/* MULTIPLE IMAGES: + Add Image Layer Button */}
            <button
              className="option-pill-action-btn"
              onClick={triggerAddImageLayerDialog}
              title="Add an image as a new layer onto the canvas (or drag & drop images)"
            >
              <Icon name="image" size={14} color="#ffffff" />
              <span>+ Add Image Layer</span>
            </button>

            <button
              className="option-pill-action-btn"
              style={{
                background: '#1c1c1c',
                border: '1px solid #333333',
                color: '#ffffff',
                fontWeight: 600
              }}
              onClick={() => removeSelectedLayerBackground()}
              disabled={isRemovingBg}
              title="Automatically isolate and remove the background from the selected image layer"
            >
              <Icon name="scissors" size={13} color="#ffffff" />
              <span>{isRemovingBg ? 'Removing BG...' : 'Remove BG'}</span>
            </button>

            <div className="options-divider" />

            {/* REPLACE BACKGROUND COLOR THEME SELECTOR */}
            <div className="menu-dropdown-wrapper">
              <button
                className="option-pill-action-btn"
                onClick={() => setBgMenuOpen(!bgMenuOpen)}
                title="Change canvas background color theme"
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: canvasBgColor === 'transparent' ? '#fff' : canvasBgColor,
                    border: '1px solid #ffffff',
                    display: 'inline-block'
                  }}
                />
                <span>Canvas BG Theme</span>
              </button>
              {bgMenuOpen && (
                <div
                  className="menu-popup-dropdown"
                  style={{ width: '220px', padding: '10px' }}
                  onMouseLeave={() => setBgMenuOpen(false)}
                >
                  <span className="section-title-sm" style={{ marginBottom: '8px', display: 'block' }}>
                    Canvas Background
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    {bgSwatches.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 2px',
                          fontSize: '10px',
                          background: canvasBgColor === b.color ? 'var(--accent-purple)' : 'var(--bg-card)'
                        }}
                        onClick={() => {
                          changeCanvasBgColor(b.color);
                          setBgMenuOpen(false);
                        }}
                      >
                        <span
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '3px',
                            backgroundColor: b.color === 'transparent' ? '#fff' : b.color,
                            border: '1px solid rgba(255,255,255,0.3)',
                            backgroundImage: b.color === 'transparent' ? 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 4px 4px' : 'none'
                          }}
                        />
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>

                  <span className="section-title-sm" style={{ marginBottom: '8px', display: 'block' }}>
                    Workspace Surround Theme
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['dark', 'medium', 'light'].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        style={{
                          flex: 1,
                          fontSize: '10px',
                          padding: '4px',
                          background: workspaceTheme === theme ? 'var(--accent-purple)' : 'var(--bg-card)',
                          textTransform: 'capitalize'
                        }}
                        onClick={() => setWorkspaceTheme(theme)}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="options-divider" />

            {/* AUTO-SAVE CHANGES PILL */}
            <button
              type="button"
              className={`option-pill-action-btn autosave-pill-btn ${autoSaveEnabled ? 'active' : ''}`}
              onClick={() => setAutoSaveEnabled(p => !p)}
              title={autoSaveEnabled ? "Auto-Save is ON. All project modifications are saved automatically." : "Auto-Save is OFF. Click to turn on."}
            >
              <span className={`autosave-status-dot ${isAutoSaving ? 'pulsing' : autoSaveEnabled ? 'on' : 'off'}`} />
              <span>{isAutoSaving ? 'Saving Changes...' : autoSaveEnabled ? 'Auto-Save: ON' : 'Auto-Save: OFF'}</span>
            </button>
          </div>
        )}

        {/* Right Side: Zoom Controls */}
        <div className="options-right-zoom">
          <button
            className="zoom-pill-btn"
            onClick={() => setZoomLevel((z) => Math.max(10, z - 10))}
            title="Zoom Out (Ctrl -)"
          >
            -
          </button>

          <select
            className="zoom-select-dropdown"
            value={zoomLevel}
            onChange={(e) => {
              if (e.target.value === 'fit') {
                setZoomLevel(70);
                setPanOffset({ x: 0, y: 0 });
              } else {
                setZoomLevel(Number(e.target.value));
              }
            }}
          >
            <option value="fit">Fit Screen</option>
            <option value="25">25%</option>
            <option value="50">50%</option>
            <option value="70">70%</option>
            <option value="100">100%</option>
            <option value="150">150%</option>
            <option value="200">200%</option>
            <option value="300">300%</option>
          </select>

          <button
            className="zoom-pill-btn"
            onClick={() => setZoomLevel((z) => Math.min(400, z + 10))}
            title="Zoom In (Ctrl +)"
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
}
