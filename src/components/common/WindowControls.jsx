import React from 'react';

export default function WindowControls() {
  const handleMinimize = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('window-minimize');
      } catch {
        console.log('Minimize window');
      }
    }
  };

  const handleMaximize = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('window-maximize');
      } catch {
        console.log('Maximize window');
      }
    }
  };

  const handleClose = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        ipcRenderer.send('window-close');
      } catch {
        console.log('Close window');
      }
    }
  };

  return (
    <div className="window-controls">
      <button className="win-btn minimize" onClick={handleMinimize} title="Minimize">
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor" />
        </svg>
      </button>
      <button className="win-btn maximize" onClick={handleMaximize} title="Maximize">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect width="9" height="9" x="0.5" y="0.5" stroke="currentColor" fill="none" strokeWidth="1" />
        </svg>
      </button>
      <button className="win-btn close" onClick={handleClose} title="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
    </div>
  );
}
