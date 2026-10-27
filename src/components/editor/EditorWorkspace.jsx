import React from 'react';
import EditorTopBar from './EditorTopBar';
import EditorToolbar from './EditorToolbar';
import CanvasView from './CanvasView';
import ColorPanel from './ColorPanel';
import PropertiesPanel from './PropertiesPanel';
import LayersPanel from './LayersPanel';
import { Icon } from '../common/Icons';

import CropToolModal from '../tools/CropToolModal';
import AdjustmentsPanel from '../tools/AdjustmentsPanel';
import FiltersPanel from '../tools/FiltersPanel';
import TextToolPanel from '../tools/TextToolPanel';
import ShapeToolPanel from '../tools/ShapeToolPanel';

import { useEditor } from '../../context/useEditor';

export default function EditorWorkspace() {
  const { activePanel, saveToastMessage } = useEditor();

  return (
    <div className="editor-workspace-layout">
      {/* 1. Top Bar */}
      <EditorTopBar />

      {/* Floating Save Toast Notification */}
      {saveToastMessage && (
        <div className="editor-save-toast">
          <Icon name="check" size={15} color="#4ade80" />
          <span>{saveToastMessage}</span>
        </div>
      )}

      {/* 2. Main Center Body */}
      <div className="editor-workspace-body">
        {/* Left Toolbar */}
        <EditorToolbar />

        {/* Center Canvas Viewport */}
        <CanvasView />

        {/* Right Sidebar Panels */}
        <aside className="editor-right-sidebar">
          <ColorPanel />
          <PropertiesPanel />
          <LayersPanel />
        </aside>

        {/* Floating Tool Overlay Panels (Screens 4, 5, 6, 7) */}
        {activePanel === 'crop' && (
          <div className="tool-floating-container right-aligned">
            <CropToolModal />
          </div>
        )}

        {activePanel === 'adjustments' && (
          <div className="tool-floating-container center-aligned">
            <AdjustmentsPanel />
          </div>
        )}

        {activePanel === 'filters' && (
          <div className="tool-floating-container center-aligned">
            <FiltersPanel />
          </div>
        )}

        {activePanel === 'text' && (
          <div className="tool-floating-container center-aligned">
            <TextToolPanel />
          </div>
        )}

        {activePanel === 'shapes' && (
          <div className="tool-floating-container center-aligned">
            <ShapeToolPanel />
          </div>
        )}
      </div>

      <div className="screen-index-badge">3. Main Editor Workspace</div>
    </div>
  );
}
