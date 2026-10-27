import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditor } from '../../context/useEditor';
import { getCombinedFilterStyle } from '../../utils/imageProcessor';

export default function CanvasView() {
  const {
    documentTitle,
    docDimensions,
    canvasBgColor,
    workspaceTheme,
    zoomLevel,
    setZoomLevel,
    adjustments,
    activeFilter,
    showTransformControls,
    activeTool,
    setActiveTool,
    activePanel,
    setActivePanel,
    cropActive,
    cropRect,
    setCropRect,
    executeCrop,
    addTextLayer,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    addImageLayer,
    panOffset,
    setPanOffset,
    setCurrentView,
    brushSize,
    brushOpacity,
    foregroundColor,
    shapeType,
    autoSaveEnabled,
    isAutoSaving
  } = useEditor();

  const containerRef = useRef(null);
  const paintCanvasRef = useRef(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // Layer moving & resizing state
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [layerDragStart, setLayerDragStart] = useState({ x: 0, y: 0, layerX: 0, layerY: 0 });
  const [isResizingLayer, setIsResizingLayer] = useState(null); // 'tl', 'tr', 'bl', 'br'
  const [layerResizeStart, setLayerResizeStart] = useState({ mouseX: 0, mouseY: 0, w: 0, h: 0, x: 0, y: 0 });

  // Text dragging state
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState({ startX: 0, startY: 0, origX: 50, origY: 50 });

  // Crop handle dragging
  const [isDraggingCrop, setIsDraggingCrop] = useState(null);

  // Filter style calculation
  const filterStyle = getCombinedFilterStyle(adjustments, activeFilter?.css);

  const isCropMode = cropActive || activeTool === 'crop' || activePanel === 'crop';

  // Synchronize paint canvas buffer size with document dimensions
  useEffect(() => {
    if (paintCanvasRef.current) {
      if (
        paintCanvasRef.current.width !== docDimensions.width ||
        paintCanvasRef.current.height !== docDimensions.height
      ) {
        paintCanvasRef.current.width = docDimensions.width;
        paintCanvasRef.current.height = docDimensions.height;
      }
    }
  }, [docDimensions]);

  // Handle Drag & Drop of Multiple Image Files onto Canvas
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            addImageLayer(event.target.result, file.name);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, [addImageLayer]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Wheel Zoom functionality (Ctrl+Wheel or standard Wheel)
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey || activeTool === 'zoom') {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 5 : -5;
      setZoomLevel((prev) => Math.max(10, Math.min(400, prev + delta)));
    }
  };

  // Convert mouse event coordinates to canvas internal pixel coordinates
  const getCanvasCoords = (e) => {
    if (!paintCanvasRef.current) return { x: 0, y: 0 };
    const rect = paintCanvasRef.current.getBoundingClientRect();
    const scaleX = docDimensions.width / rect.width;
    const scaleY = docDimensions.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  // Mouse Down handler
  const handleMouseDown = (e) => {
    // 1. Hand tool / Spacebar pan
    if (activeTool === 'hand' || e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // 2. Zoom Tool click
    if (activeTool === 'zoom') {
      const zoomDelta = e.altKey || e.button === 2 ? -25 : 25;
      setZoomLevel((prev) => Math.max(15, Math.min(400, prev + zoomDelta)));
      return;
    }

    // 3. Brush, Eraser, Shapes
    if (['brush', 'eraser', 'shapes'].includes(activeTool)) {
      const coords = getCanvasCoords(e);
      setIsDrawing(true);
      setDrawStart(coords);

      const ctx = paintCanvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);

      if (activeTool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = foregroundColor;
        ctx.fillStyle = foregroundColor;
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = brushOpacity / 100;
        ctx.arc(coords.x, coords.y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 1;
      }
      return;
    }

    // 4. Text Tool click on empty canvas: place a new text layer!
    if (activeTool === 'text' && !e.target.closest('.canvas-text-overlay')) {
      const coords = getCanvasCoords(e);
      const xPct = Math.round(((coords.x / docDimensions.width) * 100) * 10) / 10;
      const yPct = Math.round(((coords.y / docDimensions.height) * 100) * 10) / 10;
      addTextLayer({ x: Math.max(5, Math.min(95, xPct)), y: Math.max(5, Math.min(95, yPct)) });
      return;
    }
  };

  // Mouse Move handler
  const handleMouseMove = (e) => {
    // Panning
    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
      return;
    }

    // Moving selected image layer
    if (isDraggingLayer && selectedLayerId) {
      const scale = zoomLevel / 100;
      const dx = (e.clientX - layerDragStart.x) / scale;
      const dy = (e.clientY - layerDragStart.y) / scale;
      updateLayer(selectedLayerId, {
        x: Math.round(layerDragStart.layerX + dx),
        y: Math.round(layerDragStart.layerY + dy)
      });
      return;
    }

    // Resizing selected image layer
    if (isResizingLayer && selectedLayerId) {
      const scale = zoomLevel / 100;
      const dx = (e.clientX - layerResizeStart.mouseX) / scale;
      const dy = (e.clientY - layerResizeStart.mouseY) / scale;

      let newW = layerResizeStart.w;
      let newH = layerResizeStart.h;
      let newX = layerResizeStart.x;
      let newY = layerResizeStart.y;

      if (isResizingLayer === 'br') {
        newW = Math.max(30, layerResizeStart.w + dx);
        newH = Math.max(30, layerResizeStart.h + dy);
      } else if (isResizingLayer === 'tr') {
        newW = Math.max(30, layerResizeStart.w + dx);
        newH = Math.max(30, layerResizeStart.h - dy);
        newY = layerResizeStart.y + dy;
      } else if (isResizingLayer === 'bl') {
        newW = Math.max(30, layerResizeStart.w - dx);
        newH = Math.max(30, layerResizeStart.h + dy);
        newX = layerResizeStart.x + dx;
      } else if (isResizingLayer === 'tl') {
        newW = Math.max(30, layerResizeStart.w - dx);
        newH = Math.max(30, layerResizeStart.h - dy);
        newX = layerResizeStart.x + dx;
        newY = layerResizeStart.y + dy;
      }

      updateLayer(selectedLayerId, {
        width: Math.round(newW),
        height: Math.round(newH),
        x: Math.round(newX),
        y: Math.round(newY)
      });
      return;
    }

    // Drawing with Brush / Eraser
    if (isDrawing && paintCanvasRef.current) {
      const ctx = paintCanvasRef.current.getContext('2d');
      if (!ctx) return;
      const coords = getCanvasCoords(e);

      if (activeTool === 'brush' || activeTool === 'eraser') {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }

    // Text dragging
    if (isDraggingText && selectedLayerId) {
      const scale = zoomLevel / 100;
      const dxPixels = (e.clientX - textDragStart.startX) / scale;
      const dyPixels = (e.clientY - textDragStart.startY) / scale;
      const dxPct = (dxPixels / docDimensions.width) * 100;
      const dyPct = (dyPixels / docDimensions.height) * 100;
      const newX = Math.round((textDragStart.origX + dxPct) * 10) / 10;
      const newY = Math.round((textDragStart.origY + dyPct) * 10) / 10;
      updateLayer(selectedLayerId, {
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY))
      });
      return;
    }

    // Crop box handle dragging
    if (isDraggingCrop && isCropMode) {
      const deltaX = (e.movementX / (docDimensions.width * (zoomLevel / 100))) * 100;
      const deltaY = (e.movementY / (docDimensions.height * (zoomLevel / 100))) * 100;
      setCropRect((prev) => {
        let { x, y, width, height } = prev;
        if (isDraggingCrop === 'move') {
          x = Math.max(0, Math.min(100 - width, x + deltaX));
          y = Math.max(0, Math.min(100 - height, y + deltaY));
        } else if (isDraggingCrop === 'br') {
          width = Math.max(10, Math.min(100 - x, width + deltaX));
          height = Math.max(10, Math.min(100 - y, height + deltaY));
        }
        return { x, y, width, height };
      });
    }
  };

  // Mouse Up handler
  const handleMouseUp = (e) => {
    if (isPanning) setIsPanning(false);
    if (isDraggingLayer) setIsDraggingLayer(false);
    if (isResizingLayer) setIsResizingLayer(null);
    if (isDraggingText) setIsDraggingText(false);
    if (isDraggingCrop) setIsDraggingCrop(null);

    if (isDrawing && paintCanvasRef.current) {
      setIsDrawing(false);
      const ctx = paintCanvasRef.current.getContext('2d');

      if (activeTool === 'shapes') {
        const coords = getCanvasCoords(e);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = foregroundColor;
        ctx.fillStyle = foregroundColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = brushOpacity / 100;

        const w = coords.x - drawStart.x;
        const h = coords.y - drawStart.y;

        if (shapeType === 'rectangle') {
          ctx.strokeRect(drawStart.x, drawStart.y, w, h);
        } else if (shapeType === 'circle') {
          ctx.beginPath();
          ctx.ellipse(
            drawStart.x + w / 2,
            drawStart.y + h / 2,
            Math.abs(w / 2),
            Math.abs(h / 2),
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        } else if (shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(drawStart.x, drawStart.y);
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      }
    }
  };

  // Currently selected layer object
  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  // Determine viewport background style based on workspace theme
  const getWorkspaceBackdropClass = () => {
    if (workspaceTheme === 'medium') return 'workspace-backdrop-medium';
    if (workspaceTheme === 'light') return 'workspace-backdrop-light';
    if (workspaceTheme === 'checkerboard') return 'workspace-backdrop-checker';
    return 'workspace-backdrop-dark';
  };

  return (
    <div
      className={`canvas-view-column ${getWorkspaceBackdropClass()}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Document Tab Bar */}
      <div className="canvas-document-tabs-bar">
        <div className="doc-tab active">
          <span className="doc-tab-title">{documentTitle}</span>
          <span className="doc-tab-dims">
            {docDimensions.width} &times; {docDimensions.height} @ {zoomLevel}%
          </span>
          <button
            className="doc-tab-close"
            onClick={() => setCurrentView('home')}
            title="Close Project"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        className={`canvas-viewport-container ${
          activeTool === 'hand'
            ? 'hand-cursor'
            : activeTool === 'brush'
            ? 'brush-cursor'
            : activeTool === 'zoom'
            ? 'zoom-cursor'
            : ''
        }`}
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="canvas-artboard-wrapper"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Canvas Artboard Frame - Truly sized to docDimensions with zero artificial max-width clamp! */}
          <div
            className="canvas-artboard"
            style={{
              width: `${docDimensions.width}px`,
              height: `${docDimensions.height}px`,
              backgroundColor: canvasBgColor === 'transparent' ? 'transparent' : canvasBgColor,
              backgroundImage:
                canvasBgColor === 'transparent'
                  ? 'repeating-conic-gradient(#808080 0% 25%, #ffffff 0% 50%) 50% / 20px 20px'
                  : 'none',
              position: 'relative',
              overflow: 'visible'
            }}
          >
            {/* MULTIPLE LAYERS RENDERING (Bottom to top: layers reversed) */}
            {layers
              .slice()
              .reverse()
              .map((layer, index) => {
                if (!layer.visible) return null;

                // 1. Background layer
                if (layer.type === 'background') {
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: layer.fill || canvasBgColor,
                        opacity: (layer.opacity ?? 100) / 100,
                        zIndex: index + 1
                      }}
                    />
                  );
                }

                // 2. Image layer (supports multiple images!)
                if (layer.type === 'image' && layer.src) {
                  const isLayerSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: 'absolute',
                        left: `${layer.x ?? 0}px`,
                        top: `${layer.y ?? 0}px`,
                        width: `${layer.width ?? docDimensions.width}px`,
                        height: `${layer.height ?? docDimensions.height}px`,
                        opacity: (layer.opacity ?? 100) / 100,
                        mixBlendMode: layer.blendMode?.toLowerCase() || 'normal',
                        filter: filterStyle,
                        cursor: activeTool === 'move' ? 'move' : 'default',
                        zIndex: index + 1
                      }}
                      onMouseDown={(e) => {
                        if (activeTool === 'move') {
                          e.stopPropagation();
                          setSelectedLayerId(layer.id);
                          setIsDraggingLayer(true);
                          setLayerDragStart({
                            x: e.clientX,
                            y: e.clientY,
                            layerX: layer.x ?? 0,
                            layerY: layer.y ?? 0
                          });
                        }
                      }}
                    >
                      <img
                        src={layer.src}
                        alt={layer.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          pointerEvents: 'none'
                        }}
                        draggable={false}
                      />

                      {/* Transform bounding box around selected layer */}
                      {showTransformControls && isLayerSelected && activeTool === 'move' && !isCropMode && (
                        <div className="transform-bounding-box" style={{ pointerEvents: 'auto' }}>
                          {/* Corner Resize Handles */}
                          <div
                            className="transform-handle tl"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsResizingLayer('tl');
                              setLayerResizeStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                w: layer.width,
                                h: layer.height,
                                x: layer.x,
                                y: layer.y
                              });
                            }}
                          />
                          <div
                            className="transform-handle tr"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsResizingLayer('tr');
                              setLayerResizeStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                w: layer.width,
                                h: layer.height,
                                x: layer.x,
                                y: layer.y
                              });
                            }}
                          />
                          <div
                            className="transform-handle bl"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsResizingLayer('bl');
                              setLayerResizeStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                w: layer.width,
                                h: layer.height,
                                x: layer.x,
                                y: layer.y
                              });
                            }}
                          />
                          <div
                            className="transform-handle br"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsResizingLayer('br');
                              setLayerResizeStart({
                                mouseX: e.clientX,
                                mouseY: e.clientY,
                                w: layer.width,
                                h: layer.height,
                                x: layer.x,
                                y: layer.y
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                // 3. Text layer (Unified in the layer stack!)
                if (layer.type === 'text' && layer.text) {
                  const isTextSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      className={`canvas-text-overlay ${layer.glow ? 'glow-active' : ''} ${isTextSelected ? 'selected-text-layer' : ''}`}
                      style={{
                        position: 'absolute',
                        top: `${layer.y ?? 50}%`,
                        left: `${layer.x ?? 50}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: layer.font || 'Poppins, sans-serif',
                        fontWeight: layer.weight === 'Bold' ? 700 : layer.weight === 'Light' ? 300 : layer.weight === 'Semi-Bold' ? 600 : 400,
                        fontSize: `${layer.size || 120}px`,
                        color: layer.color || '#ffffff',
                        opacity: (layer.opacity ?? 100) / 100,
                        textShadow: layer.glow
                          ? `0 0 10px ${layer.glowColor || '#c084fc'}, 0 0 25px ${layer.glowColor || '#c084fc'}, 0 0 45px ${layer.glowColor || '#c084fc'}`
                          : layer.shadow
                          ? '0 4px 15px rgba(0,0,0,0.8)'
                          : 'none',
                        WebkitTextStroke: layer.outline ? '2px #ffffff' : 'none',
                        background: layer.background ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
                        padding: layer.background ? '12px 24px' : '4px 12px',
                        borderRadius: layer.background ? '8px' : '4px',
                        cursor: activeTool === 'text' || activeTool === 'move' ? 'move' : 'default',
                        zIndex: index + 1,
                        pointerEvents: 'auto',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                        outline: isTextSelected && showTransformControls ? '2px dashed #c084fc' : 'none',
                        outlineOffset: '4px'
                      }}
                      onMouseDown={(e) => {
                        if (activeTool === 'text' || activeTool === 'move') {
                          e.stopPropagation();
                          setSelectedLayerId(layer.id);
                          setIsDraggingText(true);
                          setTextDragStart({
                            startX: e.clientX,
                            startY: e.clientY,
                            origX: layer.x ?? 50,
                            origY: layer.y ?? 50
                          });
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setSelectedLayerId(layer.id);
                        setActiveTool('text');
                        setActivePanel('text');
                      }}
                    >
                      {layer.text}
                    </div>
                  );
                }

                return null;
              })}

            {/* Interactive Painting Canvas Overlay */}
            <canvas
              ref={paintCanvasRef}
              className="canvas-paint-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: ['brush', 'eraser', 'shapes'].includes(activeTool) ? 'auto' : 'none',
                zIndex: layers.length + 3
              }}
            />

            {/* Crop Overlay Rule of Thirds with Interactive Drag Handles */}
            {isCropMode && (
              <div
                className="crop-interactive-overlay"
                style={{
                  top: `${cropRect.y}%`,
                  left: `${cropRect.x}%`,
                  width: `${cropRect.width}%`,
                  height: `${cropRect.height}%`,
                  position: 'absolute',
                  pointerEvents: 'auto',
                  zIndex: 10
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingCrop('move');
                }}
              >
                <div className="crop-thirds-line h1" />
                <div className="crop-thirds-line h2" />
                <div className="crop-thirds-line v1" />
                <div className="crop-thirds-line v2" />

                <div className="crop-corner-bracket top-left" />
                <div className="crop-corner-bracket top-right" />
                <div className="crop-corner-bracket bottom-left" />
                <div
                  className="crop-corner-bracket bottom-right"
                  style={{ cursor: 'se-resize', pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsDraggingCrop('br');
                  }}
                />

                <div className="crop-apply-floating-bar">
                  <button
                    className="crop-floating-btn apply"
                    onClick={(e) => {
                      e.stopPropagation();
                      executeCrop(cropRect);
                    }}
                  >
                    Apply Crop &check;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Viewport bottom info pill */}
        <div className="canvas-bottom-statusbar">
          <span>Tool: {activeTool.toUpperCase()}</span>
          <span>Doc: {docDimensions.width} &times; {docDimensions.height} px</span>
          <span>Zoom: {zoomLevel}%</span>
          <span>Layers: {layers.length}</span>
          {selectedLayer && <span>Selected: {selectedLayer.name}</span>}
          <span style={{ color: isAutoSaving ? '#f59e0b' : autoSaveEnabled ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px' }}>{isAutoSaving ? '●' : autoSaveEnabled ? '✓' : '○'}</span>
            <span>{isAutoSaving ? 'Auto-saving...' : autoSaveEnabled ? 'Auto-Saved' : 'Auto-Save Off'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
