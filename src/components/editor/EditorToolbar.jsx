import React from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function EditorToolbar() {
  const {
    activeTool,
    setActiveTool,
    setActivePanel,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    addTextLayer,
    foregroundColor,
    setForegroundColor,
    backgroundColor,
    setBackgroundColor,
    swapPaletteColors
  } = useEditor();

  const tools = [
    { id: 'move', name: 'Move Tool (V)', icon: 'move' },
    { id: 'select', name: 'Marquee Tool (M)', icon: 'marquee' },
    { id: 'crop', name: 'Crop Tool (C)', icon: 'crop', opensPanel: 'crop' },
    { id: 'brush', name: 'Brush Tool (B)', icon: 'brush' },
    { id: 'eraser', name: 'Eraser Tool (E)', icon: 'eraser' },
    { id: 'gradient', name: 'Gradient Tool (G)', icon: 'gradient' },
    { id: 'text', name: 'Text Tool (T)', icon: 'text', opensPanel: 'text' },
    { id: 'shapes', name: 'Rectangle Tool (U)', icon: 'shapes' },
    { id: 'wand', name: 'AI Selection Tool (W)', icon: 'wand' },
    { id: 'hand', name: 'Hand Tool (H)', icon: 'hand' },
    { id: 'zoom', name: 'Zoom Tool (Z)', icon: 'zoom' },
  ];

  const handleToolSelect = (tool) => {
    setActiveTool(tool.id);
    if (tool.id === 'text') {
      const hasText = layers.some(l => l.type === 'text');
      if (!hasText) {
        addTextLayer();
      } else {
        const textL = layers.find(l => l.id === selectedLayerId && l.type === 'text') || layers.find(l => l.type === 'text');
        if (textL) setSelectedLayerId(textL.id);
        setActivePanel('text');
      }
      return;
    }
    if (tool.opensPanel) {
      setActivePanel(tool.opensPanel);
    }
  };

  return (
    <aside className="editor-left-toolbar">
      <div className="toolbar-tools-stack">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`toolbar-btn ${activeTool === t.id ? 'active' : ''}`}
            onClick={() => handleToolSelect(t)}
            title={t.name}
          >
            <Icon name={t.icon} size={19} />
          </button>
        ))}
      </div>

      {/* Color Swatch Stack */}
      <div className="toolbar-color-swatches-box">
        <div className="swatches-overlap-container">
          {/* Background swatch */}
          <div
            className="swatch-bg"
            style={{ backgroundColor }}
            title={`Background Color: ${backgroundColor}`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = backgroundColor;
              input.oninput = (e) => setBackgroundColor(e.target.value);
              input.click();
            }}
          />
          {/* Foreground swatch */}
          <div
            className="swatch-fg"
            style={{ backgroundColor: foregroundColor }}
            title={`Foreground Color: ${foregroundColor}`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'color';
              input.value = foregroundColor;
              input.oninput = (e) => setForegroundColor(e.target.value);
              input.click();
            }}
          />
        </div>

        {/* Swap colors button */}
        <button
          className="swatch-swap-btn"
          onClick={swapPaletteColors}
          title="Switch Foreground and Background Colors (X)"
        >
          <Icon name="swap" size={12} />
        </button>
      </div>
    </aside>
  );
}
