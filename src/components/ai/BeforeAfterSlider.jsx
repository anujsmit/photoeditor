import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  viewMode = "slider", // 'slider' | 'side-by-side' | 'hold'
  showCheckerboard = false,
  children
}) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [containerWidth, setContainerWidth] = useState(540);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  if (viewMode === 'side-by-side') {
    return (
      <div className="ba-side-by-side-container">
        {children}
        <div className="ba-side-box">
          <div className="ba-label before-label">{beforeLabel}</div>
          <img src={beforeImage} alt="Before" className="ba-side-img" draggable={false} />
        </div>
        <div className={`ba-side-box ${showCheckerboard ? 'checkerboard-bg' : ''}`}>
          <div className="ba-label after-label">{afterLabel}</div>
          <img src={afterImage} alt="After" className="ba-side-img" draggable={false} />
        </div>
      </div>
    );
  }

  if (viewMode === 'hold') {
    return (
      <div
        className={`before-after-container hold-mode ${showCheckerboard && !isHoldingOriginal ? 'checkerboard-bg' : ''}`}
        ref={containerRef}
        onMouseDown={() => setIsHoldingOriginal(true)}
        onMouseUp={() => setIsHoldingOriginal(false)}
        onMouseLeave={() => setIsHoldingOriginal(false)}
        onTouchStart={() => setIsHoldingOriginal(true)}
        onTouchEnd={() => setIsHoldingOriginal(false)}
        style={{ cursor: 'pointer' }}
      >
        {children}
        <img
          src={isHoldingOriginal ? beforeImage : afterImage}
          alt={isHoldingOriginal ? 'Before' : 'After'}
          className="ba-image after"
          draggable={false}
        />
        <div className={`ba-label ${isHoldingOriginal ? 'before-label' : 'after-label'}`}>
          {isHoldingOriginal ? `${beforeLabel} (Holding)` : afterLabel}
        </div>
        <div className="ba-hold-hint">Press and hold anywhere to view original</div>
      </div>
    );
  }

  return (
    <div
      className={`before-after-container ${showCheckerboard ? 'checkerboard-bg' : ''}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* On-image Overlay Controls (Floating Undo/Redo & tools) */}
      {children}

      {/* After Image (Full background) */}
      <img
        src={afterImage}
        alt="After"
        className="ba-image after"
        draggable={false}
      />
      <div className="ba-label after-label">{afterLabel}</div>

      {/* Before Image (Clipped overlay) */}
      <div
        className="ba-clipped-wrapper"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="ba-image before"
          style={{ width: `${containerWidth}px`, maxWidth: 'none' }}
          draggable={false}
        />
        <div className="ba-label before-label">{beforeLabel}</div>
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="ba-slider-divider"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsDragging(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setIsDragging(true);
        }}
      >
        <div className="ba-handle-line" />
        <div className="ba-handle-pill" title="Drag to compare before & after">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 3 12 9 6" />
          </svg>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
            <polyline points="15 18 21 12 15 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
