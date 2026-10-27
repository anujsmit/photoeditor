import React, { useEffect } from 'react';
import { EditorProvider } from './context/EditorContext';
import { useEditor } from './context/useEditor';
import SplashScreen from './components/splash/SplashScreen';
import HomeScreen from './components/home/HomeScreen';
import EditorWorkspace from './components/editor/EditorWorkspace';
import TemplatesPage from './components/templates/TemplatesPage';
import AIEnhancePage from './components/ai/AIEnhancePage';
import RemoveBgPage from './components/ai/RemoveBgPage';
import SettingsPage from './components/settings/SettingsPage';
import ExportDialog from './components/export/ExportDialog';
import ShortcutsModal from './components/editor/ShortcutsModal';
import { matchesShortcut } from './utils/shortcuts';
import './App.css';

function MainAppContent() {
  const {
    currentView,
    setCurrentView,
    setActiveTool,
    setActivePanel,
    setExportModalOpen,
    setZoomLevel,
    undo,
    redo,
    addImageLayer,
    setCurrentImage,
    setDocumentTitle,
    pushHistorySnapshot,
    shortcuts,
    deleteSelectedOrTextLayer,
    saveProjectChanges,
    setClipCanvasOverflow,
    setShortcutsModalOpen
  } = useEditor();

  // Keyboard shortcut listener & Clipboard Paste
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing into an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      // Check user-customizable shortcuts
      if (shortcuts) {
        // Delete Text / Active Layer (Default: Ctrl+T)
        if (matchesShortcut(e, shortcuts.deleteText)) {
          e.preventDefault();
          deleteSelectedOrTextLayer();
          return;
        }

        // Delete Layer (Default: Delete / Backspace)
        if (matchesShortcut(e, shortcuts.deleteLayer)) {
          e.preventDefault();
          deleteSelectedOrTextLayer();
          return;
        }

        // Save Project (Default: Ctrl+S)
        if (matchesShortcut(e, shortcuts.saveProject)) {
          e.preventDefault();
          saveProjectChanges();
          return;
        }

        // Export (Default: Ctrl+E)
        if (matchesShortcut(e, shortcuts.exportImage)) {
          e.preventDefault();
          setExportModalOpen(true);
          return;
        }

        // Undo (Default: Ctrl+Z)
        if (matchesShortcut(e, shortcuts.undo)) {
          if (currentView === 'editor') {
            e.preventDefault();
            undo();
            return;
          }
        }

        // Redo (Default: Ctrl+Y)
        if (matchesShortcut(e, shortcuts.redo)) {
          if (currentView === 'editor') {
            e.preventDefault();
            redo();
            return;
          }
        }

        // Toggle Canvas Clipping (Default: Ctrl+\)
        if (matchesShortcut(e, shortcuts.toggleClip)) {
          e.preventDefault();
          setClipCanvasOverflow(p => !p);
          return;
        }
      }

      // Quick Help / Shortcuts Modal (? or Ctrl+/)
      if (e.key === '?' || (e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      if (currentView === 'editor') {
        // Tools shortcuts (matches custom or fallback)
        if (shortcuts?.moveTool && matchesShortcut(e, shortcuts.moveTool)) {
          setActiveTool('move');
          return;
        }
        if (shortcuts?.cropTool && matchesShortcut(e, shortcuts.cropTool)) {
          setActiveTool('crop');
          setActivePanel('crop');
          return;
        }
        if (shortcuts?.textTool && matchesShortcut(e, shortcuts.textTool)) {
          setActiveTool('text');
          setActivePanel('text');
          return;
        }
        if (shortcuts?.brushTool && matchesShortcut(e, shortcuts.brushTool)) {
          setActiveTool('brush');
          return;
        }
        if (shortcuts?.eraserTool && matchesShortcut(e, shortcuts.eraserTool)) {
          setActiveTool('eraser');
          return;
        }
        if (shortcuts?.shapesTool && matchesShortcut(e, shortcuts.shapesTool)) {
          setActiveTool('shapes');
          setActivePanel('shapes');
          return;
        }
        if (shortcuts?.eyedropperTool && matchesShortcut(e, shortcuts.eyedropperTool)) {
          setActiveTool('eyedropper');
          return;
        }
        if (shortcuts?.bucketTool && matchesShortcut(e, shortcuts.bucketTool)) {
          setActiveTool('bucket');
          return;
        }
        if (shortcuts?.lassoTool && matchesShortcut(e, shortcuts.lassoTool)) {
          setActiveTool('lasso');
          return;
        }
        if (shortcuts?.stampTool && matchesShortcut(e, shortcuts.stampTool)) {
          setActiveTool('stamp');
          return;
        }
        if (shortcuts?.handTool && matchesShortcut(e, shortcuts.handTool)) {
          setActiveTool('hand');
          return;
        }
        if (shortcuts?.zoomTool && matchesShortcut(e, shortcuts.zoomTool)) {
          setActiveTool('zoom');
          return;
        }

        // Zoom keys
        if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
          e.preventDefault();
          setZoomLevel((z) => Math.min(400, z + 25));
          return;
        }
        if (e.ctrlKey && e.key === '-') {
          e.preventDefault();
          setZoomLevel((z) => Math.max(10, z - 25));
          return;
        }
        if (e.ctrlKey && e.key === '0') {
          e.preventDefault();
          setZoomLevel(70);
          return;
        }
        if (e.key.toLowerCase() === 'escape') {
          setActivePanel(null);
          return;
        }
      }
    };

    // Paste image from clipboard
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const url = event.target.result;
              if (currentView === 'editor') {
                addImageLayer(url, 'Pasted Layer');
              } else {
                setCurrentImage(url);
                setDocumentTitle('clipboard-image.png');
                pushHistorySnapshot(url);
                setCurrentView('editor');
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [
    currentView,
    setCurrentView,
    setActiveTool,
    setActivePanel,
    setExportModalOpen,
    setZoomLevel,
    undo,
    redo,
    addImageLayer,
    setCurrentImage,
    setDocumentTitle,
    pushHistorySnapshot,
    shortcuts,
    deleteSelectedOrTextLayer,
    saveProjectChanges,
    setClipCanvasOverflow,
    setShortcutsModalOpen
  ]);

  return (
    <div className="bard-app-root">
      {currentView === 'splash' && <SplashScreen />}
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'editor' && <EditorWorkspace />}
      {currentView === 'templates' && <TemplatesPage />}
      {currentView === 'ai-enhance' && <AIEnhancePage />}
      {currentView === 'remove-bg' && <RemoveBgPage />}
      {currentView === 'ai-tools' && <AIEnhancePage />}
      {currentView === 'settings' && <SettingsPage />}

      {/* Global Modals */}
      <ExportDialog />
      <ShortcutsModal />
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <MainAppContent />
    </EditorProvider>
  );
}
