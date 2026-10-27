import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';
import { formatShortcutDisplay } from '../../utils/shortcuts';

export default function ShortcutsModal() {
  const {
    shortcuts,
    updateShortcut,
    resetShortcuts,
    shortcutsModalOpen,
    setShortcutsModalOpen
  } = useEditor();

  const [recordingId, setRecordingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [successToast, setSuccessToast] = useState(null);

  // Close modal on Escape if not recording
  useEffect(() => {
    if (!shortcutsModalOpen) return;
    const handleKeyDown = (e) => {
      if (recordingId) {
        e.preventDefault();
        e.stopPropagation();

        // If Escape pressed while recording, cancel recording
        if (e.key === 'Escape') {
          setRecordingId(null);
          return;
        }

        // Ignore standalone modifier presses
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
          return;
        }

        const newKey = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
        const updated = {
          key: newKey,
          ctrl: !!(e.ctrlKey || e.metaKey),
          shift: !!e.shiftKey,
          alt: !!e.altKey
        };

        updateShortcut(recordingId, updated);
        const name = shortcuts[recordingId]?.name || 'Shortcut';
        setSuccessToast(`Updated "${name}" to ${formatShortcutDisplay(updated)}`);
        setTimeout(() => setSuccessToast(null), 2500);
        setRecordingId(null);
        return;
      }

      if (e.key === 'Escape') {
        setShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [shortcutsModalOpen, recordingId, shortcuts, updateShortcut, setShortcutsModalOpen]);

  if (!shortcutsModalOpen) return null;

  const shortcutList = Object.values(shortcuts || {});
  const filteredList = shortcutList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.display && item.display.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const categories = ['All', 'Editing', 'Tools', 'Layers', 'File', 'View'];

  const visibleList = filteredList.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="modal-backdrop" onClick={() => setShortcutsModalOpen(false)}>
      <div
        className="modal-content shortcuts-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="pointer" size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                Keyboard Shortcuts &amp; Key Bindings
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a3a3a3' }}>
                Customize any shortcut to match your personal workflow preference.
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setShortcutsModalOpen(false)}
            title="Close (Esc)"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div style={{ padding: '12px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search shortcuts (e.g. delete text, crop, save)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="settings-input"
              style={{ width: '100%', paddingLeft: '32px', fontSize: '12px' }}
            />
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="#6b7280" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', alignItems: 'center' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`panel-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Recording active banner */}
        {recordingId && (
          <div
            style={{
              padding: '10px 20px',
              background: '#1a1a1a',
              borderBottom: '1px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  animation: 'pulse 1s infinite'
                }}
              />
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                Press key combination for "{shortcuts[recordingId]?.name}" (e.g. Ctrl + T, Delete, V)...
              </span>
            </div>
            <button
              type="button"
              className="dialog-cancel-btn"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => setRecordingId(null)}
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        {/* Success toast feedback */}
        {successToast && (
          <div
            style={{
              padding: '8px 20px',
              background: '#141414',
              borderBottom: '1px solid #ffffff',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            ✓ {successToast}
          </div>
        )}

        {/* Shortcuts List Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#737373', fontSize: '13px' }}>
                No shortcuts found matching "{searchQuery}"
              </div>
            ) : (
              visibleList.map((item) => {
                const isRecording = recordingId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: isRecording ? '#222222' : 'var(--bg-card)',
                      border: isRecording ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>
                          {item.name}
                        </span>
                        {item.category && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: '#262626',
                              color: '#a3a3a3'
                            }}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#737373' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <kbd
                        onClick={() => setRecordingId(item.id)}
                        style={{
                          background: isRecording ? '#ffffff' : '#141414',
                          border: isRecording ? '1px solid #ffffff' : '1px solid #333333',
                          color: isRecording ? '#000000' : '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          minWidth: '70px',
                          textAlign: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          userSelect: 'none'
                        }}
                        title="Click to change shortcut key"
                      >
                        {isRecording ? 'Press keys...' : (item.display || formatShortcutDisplay(item))}
                      </kbd>

                      <button
                        type="button"
                        className="settings-action-btn"
                        style={{
                          padding: '4px 9px',
                          fontSize: '11px',
                          background: isRecording ? '#ffffff' : '#1f1f1f',
                          color: isRecording ? '#000000' : '#ffffff',
                          border: '1px solid #333333',
                          borderRadius: '4px'
                        }}
                        onClick={() => setRecordingId(isRecording ? null : item.id)}
                      >
                        {isRecording ? 'Listening...' : 'Change'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer with Reset to Defaults and Done */}
        <div
          className="modal-footer"
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            className="dialog-cancel-btn"
            style={{ fontSize: '12px', color: '#f87171' }}
            onClick={() => {
              if (window.confirm('Reset all keyboard shortcuts to factory defaults?')) {
                resetShortcuts();
                setSuccessToast('Reset all shortcuts to factory defaults');
                setTimeout(() => setSuccessToast(null), 2500);
              }
            }}
          >
            Reset All to Defaults
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="dialog-primary-btn"
              style={{ fontSize: '12px' }}
              onClick={() => setShortcutsModalOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
