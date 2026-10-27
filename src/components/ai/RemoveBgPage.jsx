import React, { useState, useEffect, useRef, useCallback } from 'react';
import SidebarNav from '../home/SidebarNav';
import BeforeAfterSlider from './BeforeAfterSlider';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';
import { removeImageBackground, removeImageByColor } from '../../utils/backgroundRemoval';
import { export4KImage } from '../../utils/aiEffects';

export default function RemoveBgPage() {
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
  const manualCanvasRef = useRef(null);
  const originalImgRef = useRef(null);
  const prevStrokePointRef = useRef(null);
  const autoCutoutBackupRef = useRef('');

  const sourcePhoto = aiPhoto || '';
  const photoName = aiPhotoName || 'photo.png';

  // Transparent cutout result
  const [cutoutPhoto, setCutoutPhoto] = useState('');
  const [compositedPhoto, setCompositedPhoto] = useState('');
  const [photoDimensions, setPhotoDimensions] = useState({ width: 1920, height: 1080 });

  // Removal Mode Tabs: 'auto' | 'color' | 'manual'
  const [removalTab, setRemovalTab] = useState('auto');

  // Auto Mode Parameters
  const [tolerance, setTolerance] = useState(42);
  const [feather, setFeather] = useState(2);

  // Color-Based Mode Parameters
  const [targetColor, setTargetColor] = useState([255, 255, 255]);
  const [colorTolerance, setColorTolerance] = useState(30);
  const [colorFeather, setColorFeather] = useState(2);
  const [colorContiguous, setColorContiguous] = useState(true);
  const [isSamplingColor, setIsSamplingColor] = useState(false);
  const [sampleSeedPoint, setSampleSeedPoint] = useState(null);

  // Manual Brush Parameters
  const [brushTool, setBrushTool] = useState('restore'); // 'restore' | 'erase'
  const [brushSize, setBrushSize] = useState(35);
  const [brushPos, setBrushPos] = useState({ visible: false, screenX: -100, screenY: -100 });
  const [isPainting, setIsPainting] = useState(false);

  // Undo & Redo History Stacks
  const [pastStates, setPastStates] = useState([]); // Past states for Undo
  const [futureStates, setFutureStates] = useState([]); // Future states for Redo

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  // Refs to prevent state closure staleness during rapid keystrokes/actions
  const cutoutPhotoRef = useRef(cutoutPhoto);
  const pastStatesRef = useRef(pastStates);
  const futureStatesRef = useRef(futureStates);

  useEffect(() => {
    cutoutPhotoRef.current = cutoutPhoto;
  }, [cutoutPhoto]);

  useEffect(() => {
    pastStatesRef.current = pastStates;
  }, [pastStates]);

  useEffect(() => {
    futureStatesRef.current = futureStates;
  }, [futureStates]);

  // Background replacement mode
  // 'transparent' | 'white' | 'dark' | 'gray' | 'blur' | 'gradient-sunset' | 'gradient-neon' | 'custom'
  const [backdropType, setBackdropType] = useState('transparent');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');

  // Comparison & View Mode: 'slider' | 'side-by-side' | 'hold' | 'brush'
  const [viewMode, setViewMode] = useState('slider');

  // Processing & Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting4K, setIsExporting4K] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Preload original image element for instant manual brush restoration
  useEffect(() => {
    if (sourcePhoto) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        originalImgRef.current = img;
        setPhotoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = sourcePhoto;
    }
  }, [sourcePhoto]);

  // Helper to record a new state onto the past stack and clear future redo
  const pushCutoutToHistory = useCallback((newCutoutPhoto) => {
    if (!newCutoutPhoto || newCutoutPhoto === cutoutPhotoRef.current) return;
    const current = cutoutPhotoRef.current;
    if (current) {
      const nextPast = [current, ...pastStatesRef.current].slice(0, 30);
      pastStatesRef.current = nextPast;
      futureStatesRef.current = [];
      setPastStates(nextPast);
      setFutureStates([]);
    }
    cutoutPhotoRef.current = newCutoutPhoto;
    setCutoutPhoto(newCutoutPhoto);
  }, []);

  // Execute Undo
  const handleUndo = useCallback(() => {
    if (pastStatesRef.current.length === 0) return;
    const previous = pastStatesRef.current[0];
    const current = cutoutPhotoRef.current;

    const newPast = pastStatesRef.current.slice(1);
    const newFuture = [current, ...futureStatesRef.current];

    pastStatesRef.current = newPast;
    futureStatesRef.current = newFuture;
    cutoutPhotoRef.current = previous;

    setPastStates(newPast);
    setFutureStates(newFuture);
    setCutoutPhoto(previous);
    setStatusMessage('↩️ Undid last change');
    setTimeout(() => setStatusMessage(''), 2500);
  }, []);

  // Execute Redo
  const handleRedo = useCallback(() => {
    if (futureStatesRef.current.length === 0) return;
    const next = futureStatesRef.current[0];
    const current = cutoutPhotoRef.current;

    const newFuture = futureStatesRef.current.slice(1);
    const newPast = [current, ...pastStatesRef.current];

    futureStatesRef.current = newFuture;
    pastStatesRef.current = newPast;
    cutoutPhotoRef.current = next;

    setFutureStates(newFuture);
    setPastStates(newPast);
    setCutoutPhoto(next);
    setStatusMessage('↪️ Redid change');
    setTimeout(() => setStatusMessage(''), 2500);
  }, []);

  // Global Keyboard Shortcuts (Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
        return;
      }

      // Redo: Ctrl+Y or Cmd+Y, or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleUndo, handleRedo]);

  // Run AI background removal
  const runBackgroundRemoval = useCallback(async (srcPhoto, tol = tolerance, fth = feather) => {
    const targetSrc = srcPhoto || sourcePhoto;
    if (!targetSrc) return;

    setIsProcessing(true);
    setStatusMessage('Isolating subject with edge alpha matting...');

    try {
      const transparentPng = await removeImageBackground(targetSrc, {
        tolerance: tol,
        feather: fth,
        mode: 'border'
      });
      if (cutoutPhoto && cutoutPhoto !== transparentPng) {
        pushCutoutToHistory(transparentPng);
      } else {
        cutoutPhotoRef.current = transparentPng;
        setCutoutPhoto(transparentPng);
      }
      if (!autoCutoutBackupRef.current) {
        autoCutoutBackupRef.current = transparentPng;
      }
      setStatusMessage('✓ Subject isolated with clean edge alpha matting!');
    } catch (err) {
      console.error('Background removal error:', err);
      setStatusMessage('Failed to isolate background.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourcePhoto, tolerance, feather, cutoutPhoto, pushCutoutToHistory]);

  // Initial trigger when a new photo arrives
  useEffect(() => {
    if (!sourcePhoto) return;
    let isCancelled = false;

    Promise.resolve().then(() => {
      if (!isCancelled) {
        runBackgroundRemoval(sourcePhoto, tolerance, feather);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [sourcePhoto, runBackgroundRemoval, tolerance, feather]);

  // Run Color-Based Removal
  const runColorBasedRemoval = useCallback(async () => {
    if (!sourcePhoto) return;
    setIsProcessing(true);
    setStatusMessage(`Removing target color RGB(${targetColor.join(', ')})...`);

    try {
      const result = await removeImageByColor(sourcePhoto, targetColor, {
        tolerance: colorTolerance,
        feather: colorFeather,
        contiguous: colorContiguous,
        seedPoint: sampleSeedPoint
      });
      if (cutoutPhoto && cutoutPhoto !== result) {
        pushCutoutToHistory(result);
      } else {
        cutoutPhotoRef.current = result;
        setCutoutPhoto(result);
      }
      setStatusMessage(`✓ Color removed (${colorContiguous ? 'connected' : 'global'} mode)`);
    } catch (err) {
      console.error('Color removal failed:', err);
      setStatusMessage('Failed to remove color.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourcePhoto, targetColor, colorTolerance, colorFeather, colorContiguous, sampleSeedPoint, cutoutPhoto, pushCutoutToHistory]);

  // Composite cutout over chosen backdrop
  useEffect(() => {
    let isCancelled = false;

    if (!cutoutPhoto) {
      Promise.resolve().then(() => {
        if (!isCancelled) setCompositedPhoto('');
      });
      return;
    }

    if (backdropType === 'transparent') {
      Promise.resolve().then(() => {
        if (!isCancelled) setCompositedPhoto(cutoutPhoto);
      });
      return;
    }

    // Composite on canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;
      const ctx = canvas.getContext('2d');

      if (backdropType === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'dark') {
        ctx.fillStyle = '#0d0b18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'gray') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'custom') {
        ctx.fillStyle = customBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'gradient-sunset') {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(1, '#7c3aed');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'gradient-neon') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, '#ec4899');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (backdropType === 'blur' && sourcePhoto) {
        const origImg = new Image();
        origImg.crossOrigin = 'anonymous';
        origImg.onload = () => {
          if (isCancelled) return;
          ctx.save();
          ctx.filter = 'blur(20px)';
          ctx.drawImage(origImg, -20, -20, canvas.width + 40, canvas.height + 40);
          ctx.restore();
          ctx.drawImage(img, 0, 0);
          setCompositedPhoto(canvas.toDataURL('image/png'));
        };
        origImg.src = sourcePhoto;
        return;
      }

      ctx.drawImage(img, 0, 0);
      setCompositedPhoto(canvas.toDataURL('image/png'));
    };
    img.src = cutoutPhoto;

    return () => {
      isCancelled = true;
    };
  }, [cutoutPhoto, backdropType, customBgColor, sourcePhoto]);

  // Sync cutout into the interactive canvas when switching to brush view
  useEffect(() => {
    if (!cutoutPhoto || !manualCanvasRef.current) return;
    const canvas = manualCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = cutoutPhoto;
  }, [cutoutPhoto, viewMode]);

  // Calculate coordinates on the responsive canvas
  const getCanvasCoords = (e) => {
    const canvas = manualCanvasRef.current;
    if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      screenX: clientX - rect.left,
      screenY: clientY - rect.top
    };
  };

  // Continuous stroke interpolation for smooth painting
  const paintStroke = (p1, p2) => {
    const canvas = manualCanvasRef.current;
    if (!canvas || !originalImgRef.current) return;
    const ctx = canvas.getContext('2d');
    const radius = Math.max(2, brushSize / 2);

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const step = Math.max(1, radius * 0.25);
    const count = Math.ceil(dist / step);

    for (let i = 0; i <= count; i++) {
      const t = count === 0 ? 0 : i / count;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();

      if (brushTool === 'erase') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
      } else if (brushTool === 'restore') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(originalImgRef.current, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }
  };

  const handleCanvasMouseDown = (e) => {
    const coords = getCanvasCoords(e);

    // If Eyedropper sampling is active in Color mode:
    if (isSamplingColor) {
      const canvas = manualCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const pixel = ctx.getImageData(Math.floor(coords.x), Math.floor(coords.y), 1, 1).data;
        setTargetColor([pixel[0], pixel[1], pixel[2]]);
        setSampleSeedPoint({ x: coords.x, y: coords.y });
        setIsSamplingColor(false);
        setStatusMessage(`✓ Picked Color RGB(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
      }
      return;
    }

    // Manual Brush Painting:
    setIsPainting(true);
    prevStrokePointRef.current = coords;
    paintStroke(coords, coords);
  };

  const handleCanvasMouseMove = (e) => {
    const coords = getCanvasCoords(e);
    setBrushPos({ visible: true, screenX: coords.screenX, screenY: coords.screenY });

    if (!isPainting || isSamplingColor) return;
    const p1 = prevStrokePointRef.current || coords;
    paintStroke(p1, coords);
    prevStrokePointRef.current = coords;
  };

  const handleCanvasMouseUp = () => {
    if (!isPainting) return;
    setIsPainting(false);
    prevStrokePointRef.current = null;
    const canvas = manualCanvasRef.current;
    if (canvas) {
      const updatedCutout = canvas.toDataURL('image/png');
      pushCutoutToHistory(updatedCutout);
      setStatusMessage(brushTool === 'restore' ? '✓ Restored subject stroke' : '✓ Erased background stroke');
    }
  };

  const handleCanvasMouseLeave = () => {
    setBrushPos(prev => ({ ...prev, visible: false }));
    if (isPainting) {
      handleCanvasMouseUp();
    }
  };

  const handleResetToAuto = () => {
    const target = autoCutoutBackupRef.current;
    if (target && target !== cutoutPhoto) {
      pushCutoutToHistory(target);
      setStatusMessage('✓ Reset to initial auto cutout');
    } else {
      runBackgroundRemoval(sourcePhoto, tolerance, feather);
    }
  };

  // Handle Photo File Upload
  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAiPhoto(dataUrl);
      setAiPhotoName(file.name);
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

  // 4K Ultra HD PNG Export
  const handleExport4K = async () => {
    const photoToExport = compositedPhoto || cutoutPhoto;
    if (!photoToExport) return;
    setIsExporting4K(true);
    setStatusMessage('🚀 Exporting 4K Transparent PNG (3840 × 2160)...');

    try {
      const res = await export4KImage(photoToExport, photoName, 'png');
      setStatusMessage(`✓ 4K Transparent PNG Export Complete! (${res.width} × ${res.height})`);
      setTimeout(() => setStatusMessage(''), 4500);
    } catch (err) {
      console.error('4K export error:', err);
      setStatusMessage('Failed to export 4K image.');
    } finally {
      setIsExporting4K(false);
    }
  };

  // Download Cutout PNG
  const handleDownloadOriginal = () => {
    const photoToDownload = compositedPhoto || cutoutPhoto;
    if (!photoToDownload) return;
    const a = document.createElement('a');
    a.href = photoToDownload;
    const cleanName = photoName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${cleanName}_NoBG.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatusMessage(`✓ Downloaded ${cleanName}_NoBG.png`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Open in full editor workspace
  const handleOpenInEditor = () => {
    const photoToOpen = compositedPhoto || cutoutPhoto;
    if (!photoToOpen) return;
    setCurrentImage(photoToOpen);
    const cleanName = photoName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    setDocumentTitle(`${cleanName}_NoBG.png`);
    pushHistorySnapshot(photoToOpen);
    setCurrentView('editor');
  };

  // Convert RGB array to hex string
  const targetColorHex = `#${targetColor.map(c => c.toString(16).padStart(2, '0')).join('')}`;

  // If no photo has been chosen yet, show focused Select Image screen!
  if (!sourcePhoto) {
    return (
      <div className="home-layout ai-tools-layout">
        <header className="home-top-header">
          <div className="top-brand">
            <LogoIcon size={30} />
            <span className="top-brand-text">BARD Photo Editor</span>
            <span className="ai-brand-badge bg-remover-badge">AI Background Remover</span>
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
            className="ai-page-tab"
            onClick={() => triggerAIToolUpload('ai-enhance')}
          >
            <Icon name="sparkles" size={15} />
            <span>AI Enhance</span>
          </button>
          <button
            className="ai-page-tab active"
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
                <div className="ai-hero-icon-circle remove-bg-circle">
                  <Icon name="scissors" size={48} color="#f43f5e" />
                </div>

                <h2 className="ai-empty-hero-title">Select an Image to Remove Background</h2>
                <p className="ai-empty-hero-subtitle">
                  Upload any photo to automatically remove the background with clean edge alpha matting,
                  fine-tune with manual restore/erase brush, or color-based sampling.
                </p>

                <div className="ai-empty-action-buttons">
                  <button
                    className="ai-4k-export-btn ai-select-hero-btn remove-bg-btn"
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

        <div className="screen-index-badge">AI Background Remover</div>
      </div>
    );
  }

  // Active Remove Background Workspace
  return (
    <div className="home-layout ai-tools-layout">
      {/* Top Application Header */}
      <header className="home-top-header">
        <div className="top-brand">
          <LogoIcon size={30} />
          <span className="top-brand-text">BARD Photo Editor</span>
          <span className="ai-brand-badge bg-remover-badge">AI Background Remover</span>
        </div>

        <div className="top-actions-right">
          <button
            className="dialog-primary-btn ai-top-upload-btn"
            onClick={() => triggerAIToolUpload('remove-bg')}
            title="Upload another photo to isolate background"
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
          className="ai-page-tab"
          onClick={() => {
            if (sourcePhoto) {
              setCurrentView('ai-enhance');
            } else {
              triggerAIToolUpload('ai-enhance');
            }
          }}
        >
          <Icon name="sparkles" size={15} />
          <span>AI Enhance</span>
        </button>
        <button
          className="ai-page-tab active"
          onClick={() => setCurrentView('remove-bg')}
        >
          <Icon name="scissors" size={15} />
          <span>Remove BG</span>
        </button>
      </div>

      <div className="home-body">
        <SidebarNav />

        <main className="ai-tools-main">
          {/* Subnav Info & View Mode Bar */}
          <div className="ai-subnav-bar">
            <div className="ai-photo-info-bar">
              <div className="ai-photo-meta-pill" title={`File: ${photoName}`}>
                <Icon name="image" size={13} color="#f43f5e" />
                <span className="ai-meta-name">{photoName}</span>
                <span className="ai-meta-dims">
                  {photoDimensions.width} &times; {photoDimensions.height} px
                </span>
              </div>

              <button
                className="ai-change-photo-btn"
                onClick={() => triggerAIToolUpload('remove-bg')}
                title="Choose another photo"
              >
                <Icon name="upload" size={13} />
                <span>Change Image</span>
              </button>

              {/* Sub-nav History Controls */}
              <div className="ai-subnav-history-bar">
                <button
                  className={`ai-subnav-history-btn ${canUndo ? '' : 'disabled'}`}
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo last change (Ctrl+Z)"
                >
                  <Icon name="undo" size={12} />
                  <span>Undo</span>
                </button>
                <button
                  className={`ai-subnav-history-btn ${canRedo ? '' : 'disabled'}`}
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo change (Ctrl+Y or Ctrl+Shift+Z)"
                >
                  <Icon name="redo" size={12} />
                  <span>Redo</span>
                </button>
              </div>
            </div>

            <div className="ai-viewmode-switch">
              <button
                className={`ai-view-btn ${viewMode === 'slider' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('slider');
                  setIsSamplingColor(false);
                }}
                title="Interactive split slider"
              >
                <Icon name="sliders" size={13} />
                <span>Split Slider</span>
              </button>
              <button
                className={`ai-view-btn ${viewMode === 'brush' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('brush');
                  if (removalTab === 'auto') setRemovalTab('manual');
                }}
                title="Interactive Brush: Erase or Restore subject"
              >
                <Icon name="brush" size={13} />
                <span>Brush Canvas</span>
              </button>
              <button
                className={`ai-view-btn ${viewMode === 'hold' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('hold');
                  setIsSamplingColor(false);
                }}
                title="Press and hold to compare with original"
              >
                <Icon name="eye" size={13} />
                <span>Hold to Compare</span>
              </button>
              <button
                className={`ai-view-btn ${viewMode === 'side-by-side' ? 'active' : ''}`}
                onClick={() => {
                  setViewMode('side-by-side');
                  setIsSamplingColor(false);
                }}
                title="View side by side"
              >
                <Icon name="shapes" size={13} />
                <span>Side by Side</span>
              </button>
            </div>
          </div>

          <div className="ai-split-view-container">
            {/* Center Stage: Interactive Before/After Preview OR Interactive Brush Canvas */}
            <div
              className={`ai-preview-zone ${backdropType === 'transparent' ? 'checkerboard-preview-bg' : ''} ${isDraggingFile ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="ai-preview-content-box">
                <div className="ai-canvas-viewport">
                  {viewMode === 'brush' ? (
                    <div className="ai-manual-brush-viewport checkerboard-bg">
                      {/* Floating Undo / Redo Overlay Directly on the Manual Brush Canvas */}
                      <div
                        className="canvas-floating-history-bar"
                        title="Undo (Ctrl+Z) / Redo (Ctrl+Y)"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={`canvas-history-btn ${canUndo ? 'active' : 'disabled'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndo();
                          }}
                          disabled={!canUndo}
                          title="Undo last change (Ctrl+Z)"
                        >
                          <Icon name="undo" size={13} />
                          <span>Undo</span>
                          {pastStates.length > 0 && (
                            <span className="history-count-badge">{pastStates.length}</span>
                          )}
                        </button>

                        <div className="canvas-history-divider" />

                        <button
                          className={`canvas-history-btn ${canRedo ? 'active' : 'disabled'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRedo();
                          }}
                          disabled={!canRedo}
                          title="Redo change (Ctrl+Y or Ctrl+Shift+Z)"
                        >
                          <Icon name="redo" size={13} />
                          <span>Redo</span>
                          {futureStates.length > 0 && (
                            <span className="history-count-badge">{futureStates.length}</span>
                          )}
                        </button>
                      </div>

                      <canvas
                        ref={manualCanvasRef}
                        className={`ai-interactive-cutout-canvas ${isSamplingColor ? 'cursor-eyedropper' : 'cursor-brush'}`}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseLeave}
                        onTouchStart={handleCanvasMouseDown}
                        onTouchMove={handleCanvasMouseMove}
                        onTouchEnd={handleCanvasMouseUp}
                      />

                      {/* Live Circular Brush Size Cursor */}
                      {brushPos.visible && !isSamplingColor && (
                        <div
                          className={`ai-brush-cursor-circle ${brushTool === 'restore' ? 'restore-mode' : 'erase-mode'}`}
                          style={{
                            left: `${brushPos.screenX}px`,
                            top: `${brushPos.screenY}px`,
                            width: `${brushSize}px`,
                            height: `${brushSize}px`,
                            marginLeft: `-${brushSize / 2}px`,
                            marginTop: `-${brushSize / 2}px`
                          }}
                        />
                      )}

                      {/* Live Canvas Action Hint HUD */}
                      <div className="ai-brush-hud-pill">
                        {isSamplingColor ? (
                          <span>🎯 Click anywhere on the image to pick background color</span>
                        ) : (
                          <span>
                            {brushTool === 'restore' ? '🟢 Restore Brush' : '🔴 Erase Brush'}: {brushSize}px (Click &amp; drag to paint)
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <BeforeAfterSlider
                      beforeImage={sourcePhoto}
                      afterImage={compositedPhoto || cutoutPhoto || sourcePhoto}
                      beforeLabel="Original"
                      afterLabel={backdropType === 'transparent' ? 'Isolated (No BG)' : 'New Background'}
                      viewMode={viewMode}
                      showCheckerboard={backdropType === 'transparent'}
                    >
                      {/* Floating Undo / Redo Overlay Directly on the Image Card */}
                      <div
                        className="canvas-floating-history-bar"
                        title="Undo (Ctrl+Z) / Redo (Ctrl+Y)"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className={`canvas-history-btn ${canUndo ? 'active' : 'disabled'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndo();
                          }}
                          disabled={!canUndo}
                          title="Undo last change (Ctrl+Z)"
                        >
                          <Icon name="undo" size={13} />
                          <span>Undo</span>
                          {pastStates.length > 0 && (
                            <span className="history-count-badge">{pastStates.length}</span>
                          )}
                        </button>

                        <div className="canvas-history-divider" />

                        <button
                          className={`canvas-history-btn ${canRedo ? 'active' : 'disabled'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRedo();
                          }}
                          disabled={!canRedo}
                          title="Redo change (Ctrl+Y or Ctrl+Shift+Z)"
                        >
                          <Icon name="redo" size={13} />
                          <span>Redo</span>
                          {futureStates.length > 0 && (
                            <span className="history-count-badge">{futureStates.length}</span>
                          )}
                        </button>
                      </div>
                    </BeforeAfterSlider>
                  )}

                  {isProcessing && (
                    <div className="ai-processing-overlay">
                      <div className="ai-spinner-circle" />
                      <span>{statusMessage || 'Processing background removal...'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Options Sidebar: Auto, Color & Manual Controls */}
            <aside className="ai-options-sidebar">
              {/* Top 3 Removal Method Mode Tabs */}
              <div className="removal-method-tabs-group">
                <button
                  className={`removal-tab-pill ${removalTab === 'auto' ? 'active' : ''}`}
                  onClick={() => {
                    setRemovalTab('auto');
                    setIsSamplingColor(false);
                  }}
                  title="Automatic AI Subject Extraction"
                >
                  <Icon name="sparkles" size={13} />
                  <span>Auto Remove</span>
                </button>

                <button
                  className={`removal-tab-pill ${removalTab === 'color' ? 'active' : ''}`}
                  onClick={() => {
                    setRemovalTab('color');
                    setViewMode('brush'); // switch to canvas for easy eyedropper clicking
                  }}
                  title="Remove by picking exact color or chroma key"
                >
                  <Icon name="eyedropper" size={13} />
                  <span>Color-Based</span>
                </button>

                <button
                  className={`removal-tab-pill ${removalTab === 'manual' ? 'active' : ''}`}
                  onClick={() => {
                    setRemovalTab('manual');
                    setViewMode('brush'); // switch to interactive brush
                    setIsSamplingColor(false);
                  }}
                  title="Manually Erase or Restore subject with brush"
                >
                  <Icon name="brush" size={13} />
                  <span>Manual Brush</span>
                </button>
              </div>

              <div className="ai-removebg-controls-scroll">
                {/* METHOD 1: AUTO REMOVAL CONTROLS */}
                {removalTab === 'auto' && (
                  <div className="ai-method-subpanel">
                    <div className="ai-section-group">
                      <div className="ai-slider-header-row">
                        <label className="ai-section-label">Detection Sensitivity:</label>
                        <span className="ai-slider-val">{tolerance}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        className="ai-intensity-slider"
                      />

                      <div className="ai-slider-header-row" style={{ marginTop: '14px' }}>
                        <label className="ai-section-label">Edge Softness (Feather):</label>
                        <span className="ai-slider-val">{feather}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        value={feather}
                        onChange={(e) => setFeather(Number(e.target.value))}
                        className="ai-intensity-slider"
                      />

                      <button
                        className="ai-refine-edges-btn"
                        onClick={() => runBackgroundRemoval(sourcePhoto, tolerance, feather)}
                        disabled={isProcessing}
                      >
                        <Icon name="sparkles" size={14} />
                        <span>🪄 Re-Isolate with Auto AI</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* METHOD 2: COLOR-BASED REMOVAL CONTROLS */}
                {removalTab === 'color' && (
                  <div className="ai-method-subpanel">
                    <div className="ai-section-group">
                      <label className="ai-section-label">Target Color to Remove:</label>

                      <div className="color-swatch-preview-card">
                        <div
                          className="color-swatch-box"
                          style={{ backgroundColor: targetColorHex }}
                        />
                        <div className="color-swatch-info">
                          <span className="color-swatch-hex">{targetColorHex.toUpperCase()}</span>
                          <span className="color-swatch-rgb">RGB({targetColor.join(', ')})</span>
                        </div>
                        <input
                          type="color"
                          value={targetColorHex}
                          onChange={(e) => {
                            const hex = e.target.value;
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            setTargetColor([r, g, b]);
                          }}
                          className="color-hex-native-input"
                          title="Pick custom color"
                        />
                      </div>

                      {/* Eyedropper Sampler Button */}
                      <button
                        className={`color-eyedropper-btn ${isSamplingColor ? 'sampling' : ''}`}
                        onClick={() => {
                          setIsSamplingColor(p => !p);
                          setViewMode('brush');
                          setStatusMessage(isSamplingColor ? '' : '🎯 Click on the image to sample background color');
                        }}
                      >
                        <Icon name="eyedropper" size={14} />
                        <span>{isSamplingColor ? '🎯 Click on Image Now...' : 'Pick Color with Eyedropper'}</span>
                      </button>

                      {/* Match Scope: Contiguous vs Global */}
                      <div className="color-match-scope-group" style={{ marginTop: '14px' }}>
                        <label className="ai-section-label">Match Scope:</label>
                        <div className="color-match-mode-selector">
                          <button
                            className={`color-mode-choice-btn ${colorContiguous ? 'active' : ''}`}
                            onClick={() => setColorContiguous(true)}
                            title="Only remove connected background regions"
                          >
                            <span>🔗 Contiguous (Connected)</span>
                          </button>
                          <button
                            className={`color-mode-choice-btn ${!colorContiguous ? 'active' : ''}`}
                            onClick={() => setColorContiguous(false)}
                            title="Remove this color everywhere in image"
                          >
                            <span>🌐 Global (Everywhere)</span>
                          </button>
                        </div>
                      </div>

                      {/* Color Tolerance Slider */}
                      <div className="ai-slider-header-row" style={{ marginTop: '14px' }}>
                        <label className="ai-section-label">Color Tolerance:</label>
                        <span className="ai-slider-val">{colorTolerance}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="85"
                        value={colorTolerance}
                        onChange={(e) => setColorTolerance(Number(e.target.value))}
                        className="ai-intensity-slider"
                      />

                      {/* Edge Softness / Feather */}
                      <div className="ai-slider-header-row" style={{ marginTop: '14px' }}>
                        <label className="ai-section-label">Edge Softness (Feather):</label>
                        <span className="ai-slider-val">{colorFeather}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        value={colorFeather}
                        onChange={(e) => setColorFeather(Number(e.target.value))}
                        className="ai-intensity-slider"
                      />

                      <button
                        className="ai-refine-edges-btn color-action-btn"
                        onClick={runColorBasedRemoval}
                        disabled={isProcessing}
                      >
                        <Icon name="scissors" size={14} />
                        <span>⚡ Remove Selected Color</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* METHOD 3: MANUAL BRUSH (ERASE & RESTORE) */}
                {removalTab === 'manual' && (
                  <div className="ai-method-subpanel">
                    <div className="ai-section-group">
                      <label className="ai-section-label">Brush Mode:</label>
                      <div className="brush-tool-selector">
                        <button
                          className={`brush-type-btn restore ${brushTool === 'restore' ? 'active' : ''}`}
                          onClick={() => {
                            setBrushTool('restore');
                            setViewMode('brush');
                          }}
                          title="Paint to restore subject parts accidentally removed"
                        >
                          <span className="brush-dot green" />
                          <span>Restore Subject</span>
                        </button>

                        <button
                          className={`brush-type-btn erase ${brushTool === 'erase' ? 'active' : ''}`}
                          onClick={() => {
                            setBrushTool('erase');
                            setViewMode('brush');
                          }}
                          title="Paint to erase leftover background"
                        >
                          <span className="brush-dot red" />
                          <span>Erase Background</span>
                        </button>
                      </div>

                      {/* Brush Size Slider */}
                      <div className="ai-slider-header-row" style={{ marginTop: '14px' }}>
                        <label className="ai-section-label">Brush Size:</label>
                        <span className="ai-slider-val">{brushSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="ai-intensity-slider"
                      />

                      {/* Brush Size Presets */}
                      <div className="brush-size-presets">
                        {[15, 30, 60, 90].map((sz) => (
                          <button
                            key={sz}
                            className={`brush-preset-btn ${brushSize === sz ? 'active' : ''}`}
                            onClick={() => setBrushSize(sz)}
                          >
                            {sz}px
                          </button>
                        ))}
                      </div>

                      {/* Undo & Redo Actions */}
                      <div className="brush-undo-row" style={{ marginTop: '14px' }}>
                        <button
                          className="brush-action-btn"
                          onClick={handleUndo}
                          disabled={!canUndo}
                          title="Undo last change (Ctrl+Z)"
                        >
                          <Icon name="undo" size={13} />
                          <span>Undo ({pastStates.length})</span>
                        </button>

                        <button
                          className="brush-action-btn"
                          onClick={handleRedo}
                          disabled={!canRedo}
                          title="Redo change (Ctrl+Y or Ctrl+Shift+Z)"
                        >
                          <Icon name="redo" size={13} />
                          <span>Redo ({futureStates.length})</span>
                        </button>

                        <button
                          className="brush-action-btn reset"
                          onClick={handleResetToAuto}
                          title="Reset to initial auto cutout"
                        >
                          <Icon name="refresh" size={13} />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BACKDROP SELECTOR */}
                <div className="ai-section-group" style={{ marginTop: '10px' }}>
                  <label className="ai-section-label">Replace Background With:</label>
                  <div className="ai-backdrop-grid">
                    <button
                      className={`ai-backdrop-btn checkerboard ${backdropType === 'transparent' ? 'active' : ''}`}
                      onClick={() => setBackdropType('transparent')}
                      title="Transparent (PNG)"
                    >
                      <span className="backdrop-tag">Transparent</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn solid-white ${backdropType === 'white' ? 'active' : ''}`}
                      onClick={() => setBackdropType('white')}
                      title="Pure White"
                    >
                      <span className="backdrop-tag">White</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn solid-dark ${backdropType === 'dark' ? 'active' : ''}`}
                      onClick={() => setBackdropType('dark')}
                      title="Studio Dark"
                    >
                      <span className="backdrop-tag">Dark</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn solid-gray ${backdropType === 'gray' ? 'active' : ''}`}
                      onClick={() => setBackdropType('gray')}
                      title="Neutral Gray"
                    >
                      <span className="backdrop-tag">Gray</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn blur-bg ${backdropType === 'blur' ? 'active' : ''}`}
                      onClick={() => setBackdropType('blur')}
                      title="Portrait Bokeh Blur"
                    >
                      <span className="backdrop-tag">Bokeh Blur</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn grad-sunset ${backdropType === 'gradient-sunset' ? 'active' : ''}`}
                      onClick={() => setBackdropType('gradient-sunset')}
                      title="Sunset Gradient"
                    >
                      <span className="backdrop-tag">Sunset</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn grad-neon ${backdropType === 'gradient-neon' ? 'active' : ''}`}
                      onClick={() => setBackdropType('gradient-neon')}
                      title="Cyberpunk Neon"
                    >
                      <span className="backdrop-tag">Neon</span>
                    </button>

                    <button
                      className={`ai-backdrop-btn custom-color-picker-btn ${backdropType === 'custom' ? 'active' : ''}`}
                      onClick={() => setBackdropType('custom')}
                      style={{ backgroundColor: customBgColor }}
                      title="Custom Color"
                    >
                      <input
                        type="color"
                        value={customBgColor}
                        onChange={(e) => {
                          setCustomBgColor(e.target.value);
                          setBackdropType('custom');
                        }}
                        className="hidden-color-input"
                      />
                      <span className="backdrop-tag custom-label">Custom</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Feedback Toast */}
              {statusMessage && (
                <div className="ai-status-feedback">
                  <Icon name="check" size={14} color="#f43f5e" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons & 4K Export */}
              <div className="ai-action-buttons-group">
                <button
                  className="ai-4k-export-btn remove-bg-export-btn"
                  onClick={handleExport4K}
                  disabled={isProcessing || isExporting4K || !cutoutPhoto}
                  title="Export transparent PNG upscaled to 4K Ultra HD"
                >
                  <Icon name="zap" size={17} color="#ffffff" />
                  <span>{isExporting4K ? 'Upscaling to 4K PNG...' : '🚀 Export 4K PNG (Ultra HD)'}</span>
                </button>

                <div className="ai-secondary-actions-row">
                  <button
                    className="ai-btn-secondary"
                    onClick={handleDownloadOriginal}
                    disabled={!cutoutPhoto}
                    title="Download cutout at original resolution"
                  >
                    <Icon name="download" size={14} />
                    <span>Download Cutout</span>
                  </button>

                  <button
                    className="ai-btn-secondary accent"
                    onClick={handleOpenInEditor}
                    disabled={!cutoutPhoto}
                    title="Open as transparent layer in editor"
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

      <div className="screen-index-badge">AI Background Remover</div>
    </div>
  );
}
