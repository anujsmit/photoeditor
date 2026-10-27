import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditorContext } from './editorContextInstance';
import { FILTERS_DATA, INITIAL_ADJUSTMENTS, createBlankCanvasDataUrl } from '../utils/projectPresets';
import {
  loadRecentProjects,
  saveProjectToDB,
  getProjectFromDB,
  getAllProjectsFromDB,
  clearAllProjectsFromDB
} from '../utils/storage';
import { processImageAdjustments } from '../utils/canvasEngine';
import {
  DEFAULT_SHORTCUTS,
  loadUserShortcuts,
  saveUserShortcuts,
  formatShortcutDisplay
} from '../utils/shortcuts';
import { removeImageBackground } from '../utils/backgroundRemoval';

export function EditorProvider({ children }) {
  // Navigation / Views
  const [currentView, setCurrentView] = useState('splash'); // splash, home, editor, templates, ai-tools, settings
  const [activeTool, setActiveTool] = useState('move'); // move, select, crop, brush, eraser, text, shapes, wand, hand, zoom
  const [activePanel, setActivePanel] = useState(null); // null by default so workspace is clean and spacious!

  // Real Recent Projects from LocalStorage (fast initial state)
  const [recentFiles, setRecentFiles] = useState(() => loadRecentProjects());

  // On startup, synchronize with native IndexedDB to load all saved projects
  useEffect(() => {
    getAllProjectsFromDB()
      .then((dbProjects) => {
        if (Array.isArray(dbProjects) && dbProjects.length > 0) {
          setRecentFiles(dbProjects);
        }
      })
      .catch((err) => {
        console.warn('Initial IndexedDB sync error:', err);
      });
  }, []);

  // Canvas Dimensions & Background Color Theme
  const [docDimensions, setDocDimensions] = useState({ width: 1920, height: 1080 });
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff'); // Background color theme of canvas
  const [workspaceTheme, setWorkspaceTheme] = useState('dark'); // 'dark', 'medium', 'light', 'checkerboard'

  // Default Canvas: Pristine high-resolution canvas
  const defaultBlank = createBlankCanvasDataUrl(1920, 1080, '#ffffff');

  // Editor document state
  const [currentImage, setCurrentImage] = useState(defaultBlank);
  const [documentTitle, setDocumentTitle] = useState('Untitled-1.psd');
  const [zoomLevel, setZoomLevel] = useState(70); // Bigger default display size!
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [saveToastMessage, setSaveToastMessage] = useState('');

  // Dedicated AI Tools Photo Workflow (upload image first before entering AI Tools)
  const [aiPhoto, setAiPhoto] = useState(null);
  const [aiPhotoName, setAiPhotoName] = useState('');
  const [aiInitialEffect, setAiInitialEffect] = useState('auto-hdr');
  const aiToolFileInputRef = useRef(null);
  const aiToolTargetEffectRef = useRef('auto-hdr');

  const triggerAIToolUpload = useCallback((effectType = 'auto-hdr') => {
    aiToolTargetEffectRef.current = effectType;
    if (aiToolFileInputRef.current) {
      aiToolFileInputRef.current.value = '';
      aiToolFileInputRef.current.click();
    }
  }, []);

  const handleAIToolFileChange = useCallback((e) => {
    const file = e.target?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setAiPhoto(dataUrl);
        setAiPhotoName(file.name);
        const effect = aiToolTargetEffectRef.current || 'ai-enhance';
        setAiInitialEffect(effect === 'remove-bg' ? 'remove-bg' : (effect === 'ai-enhance' ? 'auto-hdr' : effect));
        if (effect === 'remove-bg') {
          setCurrentView('remove-bg');
        } else {
          setCurrentView('ai-enhance');
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Canvas Display & Artboard Clipping
  const [clipCanvasOverflow, setClipCanvasOverflow] = useState(true); // Hide layers/elements extending outside canvas bounds

  // Customizable Keyboard Shortcuts State
  const [shortcuts, setShortcuts] = useState(() => loadUserShortcuts());
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const updateShortcut = useCallback((id, updatedData) => {
    setShortcuts((prev) => {
      const current = prev[id] || DEFAULT_SHORTCUTS[id] || {};
      const merged = { ...current, ...updatedData };
      const next = {
        ...prev,
        [id]: {
          ...merged,
          display: formatShortcutDisplay(merged)
        }
      };
      saveUserShortcuts(next);
      return next;
    });
  }, []);

  const resetShortcuts = useCallback(() => {
    setShortcuts({ ...DEFAULT_SHORTCUTS });
    saveUserShortcuts(DEFAULT_SHORTCUTS);
  }, []);

  // Tool settings
  const [showTransformControls, setShowTransformControls] = useState(true);
  const [autoSelectMode, setAutoSelectMode] = useState('Layer');

  // Brush & Eraser & Shape parameters
  const [brushSize, setBrushSize] = useState(24);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [shapeType, setShapeType] = useState('rectangle'); // rectangle, circle, line

  // Palette colors
  const [foregroundColor, setForegroundColor] = useState('#8b5cf6');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  // Adjustments & Filters
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [activeFilter, setActiveFilter] = useState(FILTERS_DATA[0]); // None by default

  // Crop State
  const [cropActive, setCropActive] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percent
  const [cropSettings, setCropSettings] = useState({
    ratio: 'Original',
    width: 1920,
    height: 1080,
    deleteCropped: true,
    contentAware: false
  });

  // MULTIPLE IMAGE & TEXT LAYERS STATE
  // Each layer has its own ID, name, type ('background'|'image'|'text'), position (x, y), dimensions/size, opacity, visible, locked
  const [layers, setLayers] = useState([
    {
      id: "layer-text-init",
      name: "hello",
      type: "text",
      text: "hello",
      font: "Poppins",
      weight: "Bold",
      size: 120,
      color: "#ffffff",
      glow: true,
      glowColor: "#c084fc",
      outline: false,
      shadow: false,
      background: false,
      x: 50,
      y: 75,
      opacity: 100,
      blendMode: "Normal",
      visible: true,
      locked: false
    },
    {
      id: "layer-bg",
      name: "Background",
      type: "background",
      visible: true,
      locked: false,
      opacity: 100,
      fill: '#ffffff'
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState('layer-text-init');
  const [layerOpacity, setLayerOpacity] = useState(100);
  const [layerFill, setLayerFill] = useState(100);
  const [blendMode, setBlendMode] = useState('Normal');

  // Text Layer Accessor (synced with active/selected text layer in layers stack)
  const activeTextLayer = layers.find(l => l.id === selectedLayerId && l.type === 'text')
    || layers.find(l => l.type === 'text')
    || null;

  const defaultTextProperties = {
    font: 'Poppins',
    weight: 'Bold',
    size: 120,
    color: '#ffffff',
    outline: false,
    shadow: false,
    glow: true,
    glowColor: '#c084fc',
    background: false,
    visible: true,
    x: 50,
    y: 75
  };

  const textLayer = activeTextLayer
    ? { ...defaultTextProperties, ...activeTextLayer }
    : { text: '', ...defaultTextProperties };

  // Add a new Text Layer directly into the layers stack
  const addTextLayer = useCallback((overrides = {}) => {
    const textLayers = layers.filter(l => l.type === 'text');
    const count = textLayers.length + 1;
    const initialText = overrides.text ?? (count === 1 ? 'hello' : `Text Layer ${count}`);
    const newId = `layer-text-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newLayer = {
      id: newId,
      name: initialText.slice(0, 24),
      type: 'text',
      text: initialText,
      font: overrides.font || 'Poppins',
      weight: overrides.weight || 'Bold',
      size: overrides.size || 120,
      color: overrides.color || '#ffffff',
      glow: overrides.glow !== undefined ? overrides.glow : true,
      glowColor: overrides.glowColor || '#c084fc',
      outline: overrides.outline || false,
      shadow: overrides.shadow || false,
      background: overrides.background || false,
      x: overrides.x ?? 50,
      y: overrides.y ?? 75,
      opacity: 100,
      blendMode: 'Normal',
      visible: true,
      locked: false,
      ...overrides
    };

    setLayers(prev => [newLayer, ...prev]);
    setSelectedLayerId(newId);
    setActiveTool('text');
    setActivePanel('text');
    return newLayer;
  }, [layers]);

  // Update text layer directly in the layers stack
  const setTextLayer = useCallback((updater) => {
    setLayers(prev => {
      let target = prev.find(l => l.id === selectedLayerId && l.type === 'text');
      if (!target) {
        target = prev.find(l => l.type === 'text');
      }

      // If no text layer exists in stack yet, create one now!
      if (!target) {
        const newId = `layer-text-${Date.now()}`;
        const baseObj = {
          id: newId,
          name: 'hello',
          type: 'text',
          text: 'hello',
          font: 'Poppins',
          weight: 'Bold',
          size: 120,
          color: '#ffffff',
          glow: true,
          glowColor: '#c084fc',
          outline: false,
          shadow: false,
          background: false,
          x: 50,
          y: 75,
          opacity: 100,
          blendMode: 'Normal',
          visible: true,
          locked: false
        };
        const updated = typeof updater === 'function' ? updater(baseObj) : { ...baseObj, ...updater };
        if (updated.text !== undefined) {
          updated.name = updated.text.slice(0, 24) || 'Text Layer';
        }
        setSelectedLayerId(newId);
        return [updated, ...prev];
      }

      // Update existing target text layer
      return prev.map(l => {
        if (l.id === target.id) {
          const updated = typeof updater === 'function' ? updater(l) : { ...l, ...updater };
          if (updated.text !== undefined && (!l.name || l.name === l.text || l.name === 'Text Layer' || l.name.startsWith('Text '))) {
            updated.name = updated.text.slice(0, 24) || 'Text Layer';
          }
          return updated;
        }
        return l;
      });
    });
  }, [selectedLayerId]);

  // SHAPE LAYER STATE & ACCESSOR
  const [shapeSettings, setShapeSettings] = useState({
    shapeType: 'rectangle', // rectangle, rounded-rect, circle, triangle, star, line
    fill: '#8b5cf6',
    stroke: '#ffffff',
    strokeWidth: 2,
    strokeStyle: 'solid',
    cornerRadius: 16,
    shadow: false,
    shadowColor: '#8b5cf6',
    shadowBlur: 15,
    opacity: 100
  });

  const activeShapeLayer = layers.find(l => l.id === selectedLayerId && l.type === 'shape')
    || layers.find(l => l.type === 'shape')
    || null;

  // Add a new Shape Layer (Rectangle, Rounded Rect, Circle, Star, Triangle, Line)
  const addShapeLayer = useCallback((overrides = {}) => {
    const shapeCount = layers.filter(l => l.type === 'shape').length + 1;
    const sType = overrides.shapeType || shapeSettings.shapeType || 'rectangle';
    const label = sType === 'rounded-rect' ? 'Rounded Rect' : sType === 'circle' ? 'Circle' : sType === 'triangle' ? 'Triangle' : sType === 'star' ? 'Star' : sType === 'line' ? 'Line' : 'Rectangle';
    const newId = `layer-shape-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newLayer = {
      id: newId,
      name: overrides.name || `${label} ${shapeCount}`,
      type: 'shape',
      shapeType: sType,
      fill: overrides.fill !== undefined ? overrides.fill : (shapeSettings.fill || foregroundColor || '#8b5cf6'),
      stroke: overrides.stroke !== undefined ? overrides.stroke : (shapeSettings.stroke || '#ffffff'),
      strokeWidth: overrides.strokeWidth !== undefined ? overrides.strokeWidth : (shapeSettings.strokeWidth ?? 2),
      strokeStyle: overrides.strokeStyle || shapeSettings.strokeStyle || 'solid',
      cornerRadius: overrides.cornerRadius !== undefined ? overrides.cornerRadius : (sType === 'rounded-rect' ? 24 : 0),
      shadow: overrides.shadow !== undefined ? overrides.shadow : shapeSettings.shadow,
      shadowColor: overrides.shadowColor || shapeSettings.shadowColor || '#8b5cf6',
      shadowBlur: overrides.shadowBlur || shapeSettings.shadowBlur || 15,
      x: overrides.x ?? Math.max(40, Math.round((docDimensions.width - 440) / 2)),
      y: overrides.y ?? Math.max(40, Math.round((docDimensions.height - 280) / 2)),
      width: overrides.width ?? (sType === 'circle' ? 320 : sType === 'star' ? 300 : 440),
      height: overrides.height ?? (sType === 'circle' ? 320 : sType === 'line' ? 8 : 280),
      opacity: overrides.opacity ?? 100,
      blendMode: 'Normal',
      visible: true,
      locked: false,
      ...overrides
    };

    setLayers(prev => [newLayer, ...prev]);
    setSelectedLayerId(newId);
    setActiveTool('shapes');
    setActivePanel('shapes');
    return newLayer;
  }, [layers, shapeSettings, foregroundColor, docDimensions]);

  // Update active shape layer
  const updateShapeLayer = useCallback((updater) => {
    setLayers(prev => {
      let target = prev.find(l => l.id === selectedLayerId && l.type === 'shape');
      if (!target) {
        target = prev.find(l => l.type === 'shape');
      }

      if (!target) {
        const newId = `layer-shape-${Date.now()}`;
        const base = {
          id: newId,
          name: 'Rectangle 1',
          type: 'shape',
          shapeType: 'rectangle',
          fill: foregroundColor || '#8b5cf6',
          stroke: '#ffffff',
          strokeWidth: 2,
          strokeStyle: 'solid',
          cornerRadius: 16,
          shadow: false,
          shadowColor: '#8b5cf6',
          shadowBlur: 15,
          x: Math.round((docDimensions.width - 440) / 2),
          y: Math.round((docDimensions.height - 280) / 2),
          width: 440,
          height: 280,
          opacity: 100,
          blendMode: 'Normal',
          visible: true,
          locked: false
        };
        const updated = typeof updater === 'function' ? updater(base) : { ...base, ...updater };
        setSelectedLayerId(newId);
        return [updated, ...prev];
      }

      return prev.map(l => {
        if (l.id === target.id) {
          return typeof updater === 'function' ? updater(l) : { ...l, ...updater };
        }
        return l;
      });
    });
  }, [selectedLayerId, foregroundColor, docDimensions]);

  // Modals
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  // Undo / Redo History Stack (Stores layer states or composite snapshots)
  const [history, setHistory] = useState([defaultBlank]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // File input refs
  const fileInputRef = useRef(null);
  const addImageLayerInputRef = useRef(null);

  // Push new snapshot to history
  const pushHistorySnapshot = useCallback((newImageDataUrl) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newImageDataUrl];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentImage(history[prevIdx]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setCurrentImage(history[nextIdx]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Change Background Color Theme
  const changeCanvasBgColor = (color) => {
    setCanvasBgColor(color);
    setLayers(prev => prev.map(l => l.id === 'layer-bg' ? { ...l, fill: color } : l));
  };

  // MULTIPLE IMAGES: Add a new image as an independent layer!
  const addImageLayer = useCallback((imageSrc, fileName = 'Image Layer') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Calculate sensible initial dimensions that fit on the canvas
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const maxW = docDimensions.width * 0.75;
      const maxH = docDimensions.height * 0.75;

      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      // Center the new image on the canvas
      const x = Math.round((docDimensions.width - w) / 2);
      const y = Math.round((docDimensions.height - h) / 2);

      const newId = `layer-img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newLayer = {
        id: newId,
        name: fileName,
        type: 'image',
        src: imageSrc,
        x,
        y,
        width: w,
        height: h,
        rotation: 0,
        opacity: 100,
        blendMode: 'Normal',
        visible: true,
        locked: false
      };

      setLayers(prev => [newLayer, ...prev]);
      setSelectedLayerId(newId);
      setActiveTool('move'); // Switch to move tool so user can immediately position it!
    };
    img.src = imageSrc;
  }, [docDimensions]);

  // Update a specific layer's properties (position, size, etc.)
  const updateLayer = useCallback((layerId, updates) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, ...updates } : l));
  }, []);

  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Remove background from the currently selected image layer
  const removeSelectedLayerBackground = useCallback(async (options = {}) => {
    let targetLayer = layers.find(l => l.id === selectedLayerId && l.type === 'image' && l.src);
    if (!targetLayer) {
      targetLayer = layers.find(l => l.type === 'image' && l.src);
    }

    if (!targetLayer) {
      setSaveToastMessage('Please select an image layer first');
      setTimeout(() => setSaveToastMessage(null), 2500);
      return;
    }

    setIsRemovingBg(true);
    setSaveToastMessage('🪄 Removing background...');

    try {
      const transparentSrc = await removeImageBackground(targetLayer.src, options);
      const cleanName = targetLayer.name ? targetLayer.name.replace(/\.[^/.]+$/, "") : 'Image';

      updateLayer(targetLayer.id, {
        src: transparentSrc,
        name: `${cleanName} (No BG).png`
      });

      pushHistorySnapshot(transparentSrc);
      setSaveToastMessage('✓ Background removed successfully!');
      setTimeout(() => setSaveToastMessage(null), 3000);
    } catch (err) {
      console.error('Failed to remove background:', err);
      setSaveToastMessage('Failed to isolate background');
      setTimeout(() => setSaveToastMessage(null), 3000);
    } finally {
      setIsRemovingBg(false);
    }
  }, [layers, selectedLayerId, updateLayer, pushHistorySnapshot]);

  // Layer Ordering: Move layer up / down
  const moveLayerUp = useCallback((layerId) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === layerId);
      if (idx <= 0) return prev; // already at top
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
      return next;
    });
  }, []);

  const moveLayerDown = useCallback((layerId) => {
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === layerId);
      if (idx === -1 || idx >= prev.length - 1) return prev; // already at bottom
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
      return next;
    });
  }, []);

  // Reorder layers via drag and drop (moves from fromIndex to toIndex)
  const reorderLayers = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setLayers(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Real New Project Creation
  const createNewCanvasProject = ({ name, width, height, dataUrl, backgroundType = 'white' }) => {
    setCurrentImage(dataUrl);
    setDocumentTitle(name);
    setDocDimensions({ width, height });
    setAdjustments(INITIAL_ADJUSTMENTS);
    setActiveFilter(FILTERS_DATA[0]);
    setTextLayer(prev => ({ ...prev, text: '' }));
    const bgFill = backgroundType === 'dark' ? '#12101c' : backgroundType === 'transparent' ? 'transparent' : '#ffffff';
    setCanvasBgColor(bgFill);
    const newLayers = [
      { id: "layer-bg", name: "Background", type: "background", visible: true, locked: false, opacity: 100, fill: bgFill }
    ];
    setLayers(newLayers);
    setSelectedLayerId('layer-bg');
    setHistory([dataUrl]);
    setHistoryIndex(0);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(70);

    // Save to real storage with complete layers
    const newProj = {
      id: `proj-${Date.now()}`,
      name,
      time: 'Just now',
      size: `${width} × ${height}`,
      url: dataUrl,
      type: 'image/png',
      docDimensions: { width, height },
      canvasBgColor: bgFill,
      layers: newLayers,
      adjustments: INITIAL_ADJUSTMENTS,
      timestamp: Date.now()
    };
    saveProjectToDB(newProj).then(updated => {
      if (updated) setRecentFiles(updated);
    });
    setCurrentView('editor');
  };

  // Open Real Local Image or Project File (.bard / .json / images)
  const handleOpenLocalImage = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      if (file.name.endsWith('.bard') || file.name.endsWith('.json')) {
        const textReader = new FileReader();
        textReader.onload = (event) => {
          try {
            const projectData = JSON.parse(event.target.result);
            if (projectData.layers && Array.isArray(projectData.layers)) {
              setDocumentTitle(projectData.name || file.name);
              if (projectData.docDimensions) setDocDimensions(projectData.docDimensions);
              if (projectData.canvasBgColor) setCanvasBgColor(projectData.canvasBgColor);
              if (projectData.adjustments) setAdjustments(projectData.adjustments);
              setLayers(projectData.layers);
              setSelectedLayerId(projectData.layers[0]?.id || 'layer-bg');
              setCurrentView('editor');

              const firstImg = projectData.layers.find(l => l.type === 'image' && l.src);
              const mainSrc = firstImg ? firstImg.src : defaultBlank;
              setCurrentImage(mainSrc);
              setHistory([mainSrc]);
              setHistoryIndex(0);

              const projToSave = {
                id: projectData.id || `proj-${Date.now()}`,
                name: projectData.name || file.name,
                time: 'Just now',
                size: `${projectData.docDimensions?.width || 1920} × ${projectData.docDimensions?.height || 1080}`,
                url: mainSrc,
                docDimensions: projectData.docDimensions,
                canvasBgColor: projectData.canvasBgColor,
                layers: projectData.layers,
                adjustments: projectData.adjustments,
                timestamp: Date.now()
              };
              saveProjectToDB(projToSave).then(updated => {
                if (updated) setRecentFiles(updated);
              });

              setSaveToastMessage(`Opened project "${file.name}"`);
              setTimeout(() => setSaveToastMessage(''), 2800);
              return;
            }
          } catch (err) {
            console.warn('Failed to parse project file:', err);
          }
        };
        textReader.readAsText(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const img = new Image();
        img.onload = () => {
          setCurrentImage(dataUrl);
          setDocumentTitle(file.name);
          setDocDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          setAdjustments(INITIAL_ADJUSTMENTS);
          setActiveFilter(FILTERS_DATA[0]);
          const newId = `layer-${Date.now()}`;
          const newLayers = [
            {
              id: newId,
              name: file.name,
              type: "image",
              src: dataUrl,
              x: 0,
              y: 0,
              width: img.naturalWidth,
              height: img.naturalHeight,
              visible: true,
              locked: false,
              opacity: 100,
              blendMode: "Normal"
            },
            {
              id: "layer-bg",
              name: "Background",
              type: "background",
              visible: true,
              locked: false,
              opacity: 100,
              fill: '#ffffff'
            }
          ];
          setLayers(newLayers);
          setSelectedLayerId(newId);
          setHistory([dataUrl]);
          setHistoryIndex(0);
          setPanOffset({ x: 0, y: 0 });
          setZoomLevel(70);

          // Save to native IndexedDB with complete image layer
          const newProj = {
            id: `proj-${Date.now()}`,
            name: file.name,
            time: 'Just now',
            size: `${img.naturalWidth} × ${img.naturalHeight}`,
            url: dataUrl,
            type: file.type,
            docDimensions: { width: img.naturalWidth, height: img.naturalHeight },
            canvasBgColor: '#ffffff',
            layers: newLayers,
            adjustments: INITIAL_ADJUSTMENTS,
            timestamp: Date.now()
          };
          saveProjectToDB(newProj).then(updated => {
            if (updated) setRecentFiles(updated);
          });
          setCurrentView('editor');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for adding an additional image as a layer
  const handleAddImageLayerFile = (e) => {
    const files = e.target?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          addImageLayer(event.target.result, file.name);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const triggerOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const triggerAddImageLayerDialog = () => {
    if (addImageLayerInputRef.current) {
      addImageLayerInputRef.current.value = '';
      addImageLayerInputRef.current.click();
    }
  };

  // Auto-Save Configuration & Status
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('bard_autosave_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState(null);

  // Sync preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bard_autosave_enabled', JSON.stringify(autoSaveEnabled));
    } catch {}
  }, [autoSaveEnabled]);

  // Debounced Auto-Save: whenever layers, adjustments, canvas, or title changes
  const autoSaveTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!autoSaveEnabled) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setIsAutoSaving(true);
      try {
        const projectId = `proj-${documentTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        let thumbUrl = currentImage;
        const firstImgLayer = layers.find(l => l.type === 'image' && l.src);
        if (firstImgLayer) {
          thumbUrl = firstImgLayer.src;
        }

        const projectData = {
          id: projectId,
          name: documentTitle,
          time: 'Just now',
          size: `${docDimensions.width} × ${docDimensions.height}`,
          url: thumbUrl,
          docDimensions,
          canvasBgColor,
          layers,
          adjustments,
          timestamp: Date.now()
        };

        const updated = await saveProjectToDB(projectData);
        if (updated) {
          setRecentFiles(updated);
        }
        setLastAutoSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('Auto-save error:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, documentTitle, layers, adjustments, docDimensions, canvasBgColor, currentImage]);

  // Save Current Project Changes to Native IndexedDB & Recents
  const saveProjectChanges = useCallback(async () => {
    const projectId = `proj-${documentTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // Thumbnail URL: use first image layer src if available, or currentImage
    let thumbUrl = currentImage;
    const firstImgLayer = layers.find(l => l.type === 'image' && l.src);
    if (firstImgLayer) {
      thumbUrl = firstImgLayer.src;
    }

    const projectData = {
      id: projectId,
      name: documentTitle,
      time: 'Just now',
      size: `${docDimensions.width} × ${docDimensions.height}`,
      url: thumbUrl,
      docDimensions,
      canvasBgColor,
      layers,
      adjustments,
      timestamp: Date.now()
    };

    const updated = await saveProjectToDB(projectData);
    if (updated) {
      setRecentFiles(updated);
    }

    const imgCount = layers.filter(l => l.type === 'image').length;
    const txtCount = layers.filter(l => l.type === 'text').length;
    const shpCount = layers.filter(l => l.type === 'shape').length;
    const parts = [];
    if (imgCount) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
    if (shpCount) parts.push(`${shpCount} shape${shpCount > 1 ? 's' : ''}`);
    if (txtCount) parts.push(`${txtCount} text`);
    const details = parts.length > 0 ? ` (${parts.join(', ')})` : '';

    setSaveToastMessage(`✓ Saved: "${documentTitle}"${details}`);
    setTimeout(() => {
      setSaveToastMessage('');
    }, 2800);
    return projectData;
  }, [documentTitle, currentImage, layers, docDimensions, canvasBgColor, adjustments, setSaveToastMessage]);

  // Download project file (.bard / json) for desktop persistence
  const downloadProjectFile = useCallback(() => {
    const projectData = {
      format: 'BARD_PHOTO_PROJECT',
      version: '1.0',
      name: documentTitle,
      docDimensions,
      canvasBgColor,
      layers,
      adjustments,
      savedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = documentTitle.replace(/\.[^/.]+$/, '') || 'project';
    a.href = blobUrl;
    a.download = `${cleanName}.bard`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    setSaveToastMessage(`Exported project file: "${cleanName}.bard"`);
    setTimeout(() => {
      setSaveToastMessage('');
    }, 2800);
  }, [documentTitle, docDimensions, canvasBgColor, layers, adjustments, setSaveToastMessage]);

  const openRecentFile = async (file) => {
    if (!file) return;
    try {
      setSaveToastMessage(`Opening "${file.name || 'Project'}"...`);

      // 1. Fetch complete project with all image layers from IndexedDB
      let projectData = file;
      if (file.id) {
        const dbProject = await getProjectFromDB(file.id);
        if (dbProject) {
          projectData = dbProject;
        }
      }

      setDocumentTitle(projectData.name || 'Untitled');
      if (projectData.docDimensions) {
        setDocDimensions(projectData.docDimensions);
      }
      if (projectData.canvasBgColor) {
        setCanvasBgColor(projectData.canvasBgColor);
      }
      if (projectData.adjustments) {
        setAdjustments(projectData.adjustments);
      }

      if (projectData.layers && Array.isArray(projectData.layers) && projectData.layers.length > 0) {
        setLayers(projectData.layers);
        setSelectedLayerId(projectData.layers[0]?.id || 'layer-bg');
      } else if (projectData.url) {
        const fallbackLayers = [
          {
            id: `layer-${Date.now()}`,
            name: projectData.name || 'Image Layer',
            type: "image",
            src: projectData.url,
            x: 0,
            y: 0,
            width: projectData.docDimensions?.width || docDimensions.width,
            height: projectData.docDimensions?.height || docDimensions.height,
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: "Normal"
          },
          {
            id: "layer-bg",
            name: "Background",
            type: "background",
            visible: true,
            locked: false,
            opacity: 100,
            fill: projectData.canvasBgColor || '#ffffff'
          }
        ];
        setLayers(fallbackLayers);
        setSelectedLayerId(fallbackLayers[0].id);
      }

      const firstImg = projectData.layers?.find(l => l.type === 'image' && l.src);
      const mainSrc = firstImg ? firstImg.src : (projectData.url || defaultBlank);
      setCurrentImage(mainSrc);
      setHistory([mainSrc]);
      setHistoryIndex(0);
      setZoomLevel(70);
      setCurrentView('editor');

      const imgCount = projectData.layers?.filter(l => l.type === 'image').length || 0;
      const txtCount = projectData.layers?.filter(l => l.type === 'text').length || 0;
      const shpCount = projectData.layers?.filter(l => l.type === 'shape').length || 0;
      const parts = [];
      if (imgCount) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
      if (shpCount) parts.push(`${shpCount} shape${shpCount > 1 ? 's' : ''}`);
      if (txtCount) parts.push(`${txtCount} text`);
      const details = parts.length > 0 ? ` (${parts.join(', ')})` : '';

      setSaveToastMessage(`✓ Opened "${projectData.name}"${details}`);
      setTimeout(() => setSaveToastMessage(''), 2500);
    } catch (err) {
      console.error('Failed to open recent file:', err);
      setSaveToastMessage('Failed to open project');
      setTimeout(() => setSaveToastMessage(''), 2500);
    }
  };

  const clearRecents = async () => {
    const empty = await clearAllProjectsFromDB();
    setRecentFiles(empty);
  };

  const openTemplate = (preset) => {
    const dataUrl = createBlankCanvasDataUrl(preset.width, preset.height, preset.bgColor || 'dark');
    createNewCanvasProject({
      name: `${preset.title.toLowerCase().replace(/\s+/g, '-')}.psd`,
      width: preset.width,
      height: preset.height,
      dataUrl,
      backgroundType: preset.bgColor === '#ffffff' ? 'white' : 'dark'
    });
  };

  const updateAdjustment = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: Number(value) }));
  };

  const resetAllAdjustments = () => {
    setAdjustments({
      brightness: 0,
      contrast: 0,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0
    });
  };

  // Perform actual crop on image
  const executeCrop = (cropArea) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const startX = (cropArea.x / 100) * img.naturalWidth;
      const startY = (cropArea.y / 100) * img.naturalHeight;
      const cropW = (cropArea.width / 100) * img.naturalWidth;
      const cropH = (cropArea.height / 100) * img.naturalHeight;

      canvas.width = Math.max(10, Math.round(cropW));
      canvas.height = Math.max(10, Math.round(cropH));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, canvas.width, canvas.height);

      const croppedUrl = canvas.toDataURL('image/png');
      setCurrentImage(croppedUrl);
      setDocDimensions({ width: canvas.width, height: canvas.height });
      pushHistorySnapshot(croppedUrl);
      setCropActive(false);
      setActivePanel(null);
    };
    img.src = currentImage;
  };

  // Bake real pixel adjustments permanently
  const bakeCurrentAdjustments = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      processImageAdjustments(imgData, adjustments);
      ctx.putImageData(imgData, 0, 0);

      const bakedUrl = canvas.toDataURL('image/png');
      setCurrentImage(bakedUrl);
      resetAllAdjustments();
      pushHistorySnapshot(bakedUrl);
    };
    img.src = currentImage;
  };

  const toggleLayerVisibility = (id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLayerLock = (id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const deleteLayer = useCallback((id) => {
    if (layers.length <= 1) return;
    setLayers(prev => {
      const remaining = prev.filter(l => l.id !== id);
      if (selectedLayerId === id && remaining.length > 0) {
        setSelectedLayerId(remaining[0].id);
      }
      return remaining;
    });
  }, [layers.length, selectedLayerId]);

  // Delete selected layer or text layer (Shortcut: Ctrl+T / Delete)
  const deleteSelectedOrTextLayer = useCallback(() => {
    setLayers((prev) => {
      if (prev.length <= 1) return prev;

      // 1. Try to delete the selected non-background layer
      const sel = prev.find(l => l.id === selectedLayerId);
      if (sel && sel.type !== 'background') {
        const remaining = prev.filter(l => l.id !== sel.id);
        if (remaining.length > 0) {
          setSelectedLayerId(remaining[0].id);
        }
        return remaining;
      }

      // 2. If background is selected, prioritize deleting any text layer (Ctrl+T delete text)
      const textL = prev.find(l => l.type === 'text');
      if (textL) {
        const remaining = prev.filter(l => l.id !== textL.id);
        if (remaining.length > 0) {
          setSelectedLayerId(remaining[0].id);
        }
        return remaining;
      }

      // 3. Otherwise delete top-most non-background layer
      const topNonBg = prev.find(l => l.type !== 'background');
      if (topNonBg) {
        const remaining = prev.filter(l => l.id !== topNonBg.id);
        if (remaining.length > 0) {
          setSelectedLayerId(remaining[0].id);
        }
        return remaining;
      }

      return prev;
    });
  }, [selectedLayerId]);

  const addLayer = useCallback((type = 'image') => {
    if (type === 'image') {
      triggerAddImageLayerDialog();
      return;
    }
    if (type === 'text') {
      addTextLayer();
      return;
    }
    const newId = `layer-${Date.now()}`;
    const newL = {
      id: newId,
      name: type === 'adjustment' ? `Adjustment ${layers.length + 1}` : `Layer ${layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'Normal',
      icon: type === 'adjustment' ? 'Sliders' : 'Image'
    };
    setLayers(prev => [newL, ...prev]);
    setSelectedLayerId(newId);
  }, [addTextLayer, layers.length]);

  const swapPaletteColors = () => {
    const temp = foregroundColor;
    setForegroundColor(backgroundColor);
    setBackgroundColor(temp);
  };

  return (
    <EditorContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeTool,
        setActiveTool,
        activePanel,
        setActivePanel,
        currentImage,
        setCurrentImage,
        documentTitle,
        setDocumentTitle,
        docDimensions,
        setDocDimensions,
        canvasBgColor,
        setCanvasBgColor,
        changeCanvasBgColor,
        workspaceTheme,
        setWorkspaceTheme,
        zoomLevel,
        setZoomLevel,
        panOffset,
        setPanOffset,
        showTransformControls,
        setShowTransformControls,
        autoSelectMode,
        setAutoSelectMode,
        brushSize,
        setBrushSize,
        brushOpacity,
        setBrushOpacity,
        shapeType,
        setShapeType,
        foregroundColor,
        setForegroundColor,
        backgroundColor,
        setBackgroundColor,
        swapPaletteColors,
        adjustments,
        setAdjustments,
        updateAdjustment,
        resetAllAdjustments,
        bakeCurrentAdjustments,
        activeFilter,
        setActiveFilter,
        cropActive,
        setCropActive,
        cropRect,
        setCropRect,
        cropSettings,
        setCropSettings,
        executeCrop,
        textLayer,
        setTextLayer,
        addTextLayer,
        shapeSettings,
        setShapeSettings,
        activeShapeLayer,
        addShapeLayer,
        updateShapeLayer,
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        addImageLayer,
        updateLayer,
        isRemovingBg,
        removeSelectedLayerBackground,
        moveLayerUp,
        moveLayerDown,
        reorderLayers,
        deleteLayer,
        deleteSelectedOrTextLayer,
        clipCanvasOverflow,
        setClipCanvasOverflow,
        shortcuts,
        setShortcuts,
        updateShortcut,
        resetShortcuts,
        shortcutsModalOpen,
        setShortcutsModalOpen,
        layerOpacity,
        setLayerOpacity,
        layerFill,
        setLayerFill,
        blendMode,
        setBlendMode,
        toggleLayerVisibility,
        toggleLayerLock,
        addLayer,
        recentFiles,
        setRecentFiles,
        exportModalOpen,
        setExportModalOpen,
        newProjectModalOpen,
        setNewProjectModalOpen,
        createNewCanvasProject,
        openTemplate,
        openRecentFile,
        clearRecents,
        triggerOpenFileDialog,
        triggerAddImageLayerDialog,
        handleOpenLocalImage,
        fileInputRef,
        addImageLayerInputRef,
        history,
        historyIndex,
        undo,
        redo,
        canUndo,
        canRedo,
        pushHistorySnapshot,
        saveProjectChanges,
        downloadProjectFile,
        saveToastMessage,
        setSaveToastMessage,
        autoSaveEnabled,
        setAutoSaveEnabled,
        isAutoSaving,
        lastAutoSaveTime,
        aiPhoto,
        setAiPhoto,
        aiPhotoName,
        setAiPhotoName,
        aiInitialEffect,
        setAiInitialEffect,
        triggerAIToolUpload
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleOpenLocalImage}
        accept="image/*,.bard,.json"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={addImageLayerInputRef}
        onChange={handleAddImageLayerFile}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={aiToolFileInputRef}
        onChange={handleAIToolFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {children}
    </EditorContext.Provider>
  );
}
