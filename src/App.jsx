import React, { useEffect } from 'react';
import { EditorProvider } from './context/EditorContext';
import { useEditor } from './context/useEditor';
import SplashScreen from './components/splash/SplashScreen';
import HomeScreen from './components/home/HomeScreen';
import EditorWorkspace from './components/editor/EditorWorkspace';
import TemplatesPage from './components/templates/TemplatesPage';
import AIToolsPage from './components/ai/AIToolsPage';
import SettingsPage from './components/settings/SettingsPage';
import ExportDialog from './components/export/ExportDialog';
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
    pushHistorySnapshot
  } = useEditor();

  // Keyboard shortcut listener & Clipboard Paste
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing into an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      // Export
      if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
        return;
      }

      // Undo / Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
        return;
      }

      if (currentView === 'editor') {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('move');
            break;
          case 'c':
            setActiveTool('crop');
            setActivePanel('crop');
            break;
          case 't':
            setActiveTool('text');
            setActivePanel('text');
            break;
          case 'b':
            setActiveTool('brush');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          case 'u':
            setActiveTool('shapes');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 'z':
            setActiveTool('zoom');
            break;
          case '=':
          case '+':
            if (e.ctrlKey) {
              e.preventDefault();
              setZoomLevel(z => Math.min(200, z + 25));
            }
            break;
          case '-':
            if (e.ctrlKey) {
              e.preventDefault();
              setZoomLevel(z => Math.max(25, z - 25));
            }
            break;
          case '0':
            if (e.ctrlKey) {
              e.preventDefault();
              setZoomLevel(50);
            }
            break;
          case 'escape':
            setActivePanel(null);
            break;
          default:
            break;
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
    pushHistorySnapshot
  ]);

  return (
    <div className="bard-app-root">
      {currentView === 'splash' && <SplashScreen />}
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'editor' && <EditorWorkspace />}
      {currentView === 'templates' && <TemplatesPage />}
      {currentView === 'ai-tools' && <AIToolsPage />}
      {currentView === 'settings' && <SettingsPage />}

      {/* Global Export Dialog Overlay */}
      <ExportDialog />
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
