import React, { useState, useRef, useCallback } from 'react';
import { EditorContext } from './editorContextInstance';
import { FILTERS_DATA, INITIAL_ADJUSTMENTS, createBlankCanvasDataUrl } from '../utils/projectPresets';
import { loadRecentProjects, saveRecentProject, clearAllRecentProjects } from '../utils/storage';
import { processImageAdjustments } from '../utils/canvasEngine';

export function EditorProvider({ children }) {
  // Navigation / Views
  const [currentView, setCurrentView] = useState('splash'); // splash, home, editor, templates, ai-tools, settings
  const [activeTool, setActiveTool] = useState('move'); // move, select, crop, brush, eraser, text, shapes, wand, hand, zoom
  const [activePanel, setActivePanel] = useState(null); // null by default so workspace is clean and spacious!

  // Real Recent Projects from LocalStorage
  const [recentFiles, setRecentFiles] = useState(() => loadRecentProjects());

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
    setLayers([
      { id: "layer-bg", name: "Background", type: "background", visible: true, locked: false, opacity: 100, fill: bgFill }
    ]);
    setSelectedLayerId('layer-bg');
    setHistory([dataUrl]);
    setHistoryIndex(0);
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(70);

    // Save to real recent storage
    const newProj = {
      id: `proj-${Date.now()}`,
      name,
      time: 'Just now',
      size: `${width} × ${height}`,
      url: dataUrl,
      type: 'image/png',
      timestamp: Date.now()
    };
    const updated = saveRecentProject(newProj);
    setRecentFiles(updated);
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
          setLayers([
            { id: newId, name: file.name, type: "image", src: dataUrl, x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight, visible: true, locked: false, opacity: 100, blendMode: "Normal" }
          ]);
          setSelectedLayerId(newId);
          setHistory([dataUrl]);
          setHistoryIndex(0);
          setPanOffset({ x: 0, y: 0 });
          setZoomLevel(70);

          // Save to real recents
          const newProj = {
            id: `proj-${Date.now()}`,
            name: file.name,
            time: 'Just now',
            size: `${img.naturalWidth} × ${img.naturalHeight}`,
            url: dataUrl,
            type: file.type,
            timestamp: Date.now()
          };
          const updated = saveRecentProject(newProj);
          setRecentFiles(updated);
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

  // Toast notification for user actions (e.g. Save)
  const [saveToastMessage, setSaveToastMessage] = useState('');

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

    autoSaveTimerRef.current = setTimeout(() => {
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

        const updated = saveRecentProject(projectData);
        setRecentFiles(updated);
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

  // Save Current Project Changes to LocalStorage / Recents
  const saveProjectChanges = useCallback(() => {
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

    const updated = saveRecentProject(projectData);
    setRecentFiles(updated);
    setSaveToastMessage(`Changes saved: "${documentTitle}"`);
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

  const openRecentFile = (file) => {
    setDocumentTitle(file.name);
    if (file.docDimensions) {
      setDocDimensions(file.docDimensions);
    }
    if (file.canvasBgColor) {
      setCanvasBgColor(file.canvasBgColor);
    }
    if (file.adjustments) {
      setAdjustments(file.adjustments);
    }

    if (file.layers && Array.isArray(file.layers) && file.layers.length > 0) {
      setLayers(file.layers);
      setSelectedLayerId(file.layers[0]?.id || 'layer-bg');
    } else if (file.url) {
      setLayers([
        {
          id: `layer-${Date.now()}`,
          name: file.name,
          type: "image",
          src: file.url,
          x: 0,
          y: 0,
          width: file.docDimensions?.width || docDimensions.width,
          height: file.docDimensions?.height || docDimensions.height,
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: "Normal"
        }
      ]);
    }
    setCurrentImage(file.url || defaultBlank);
    setHistory([file.url || defaultBlank]);
    setHistoryIndex(0);
    setZoomLevel(70);
    setCurrentView('editor');
  };

  const clearRecents = () => {
    const empty = clearAllRecentProjects();
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
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        addImageLayer,
        updateLayer,
        moveLayerUp,
        moveLayerDown,
        layerOpacity,
        setLayerOpacity,
        layerFill,
        setLayerFill,
        blendMode,
        setBlendMode,
        toggleLayerVisibility,
        toggleLayerLock,
        deleteLayer,
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
        lastAutoSaveTime
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
      {children}
    </EditorContext.Provider>
  );
}
