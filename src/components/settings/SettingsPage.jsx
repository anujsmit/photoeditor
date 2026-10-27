import React, { useState, useEffect } from 'react';
import SidebarNav from '../home/SidebarNav';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';
import { formatShortcutDisplay } from '../../utils/shortcuts';

export default function SettingsPage() {
  const {
    autoSaveEnabled,
    setAutoSaveEnabled,
    shortcuts,
    updateShortcut,
    resetShortcuts
  } = useEditor();
  const [activeTab, setActiveTab] = useState('General');
  const [defaultFormat, setDefaultFormat] = useState('PNG');
  const [defaultQuality, setDefaultQuality] = useState(90);
  const [autoSaveInterval, setAutoSaveInterval] = useState('5 minutes');
  const [workingDir, setWorkingDir] = useState('C:\\Users\\BARD\\Pictures');
  const [language, setLanguage] = useState('English');
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [savedNotification, setSavedNotification] = useState(false);
  const [recordingId, setRecordingId] = useState(null);
  const [shortcutFilter, setShortcutFilter] = useState('');

  // Key recording listener for custom shortcuts
  useEffect(() => {
    if (!recordingId) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setRecordingId(null);
        return;
      }

      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      const updated = {
        key: e.key.toLowerCase(),
        ctrl: !!(e.ctrlKey || e.metaKey),
        shift: !!e.shiftKey,
        alt: !!e.altKey
      };

      updateShortcut(recordingId, updated);
      setRecordingId(null);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 2000);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingId, updateShortcut]);

  const tabs = ['General', 'Appearance', 'Performance', 'Shortcuts', 'File Types'];

  const handleSaveSettings = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  return (
    <div className="home-layout settings-layout">
      {/* Top Application Header */}
      <header className="home-top-header">
        <div className="top-brand">
          <LogoIcon size={30} />
          <span className="top-brand-text">BARD Photo Editor</span>
        </div>

        <div className="top-search-bar">
          <Icon name="search" size={16} color="#8e89a5" />
          <input
            type="text"
            placeholder="Search settings, preferences..."
            readOnly
          />
        </div>

        <div className="top-actions-right">
          <button className="top-icon-btn" title="Notifications">
            <Icon name="bell" size={18} />
          </button>
          <div className="user-avatar-pill" title="User Profile">
            <Icon name="user" size={18} color="#ffffff" />
          </div>
          <WindowControls />
        </div>
      </header>

      <div className="home-body">
        <SidebarNav />

        <main className="home-main-scroll">
          <div className="settings-content-container">
            <h1 className="settings-main-heading">Settings</h1>

            {/* Navigation Tabs */}
            <div className="settings-tabs-row">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'General' && (
              <div className="settings-card-panel">
                {/* Default Save Format */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Default Save Format</span>
                    <span className="setting-desc">The format used when saving new projects</span>
                  </div>
                  <div className="setting-control-right">
                    <select
                      className="settings-select"
                      value={defaultFormat}
                      onChange={(e) => setDefaultFormat(e.target.value)}
                    >
                      <option value="PNG">PNG</option>
                      <option value="JPEG">JPEG</option>
                      <option value="WEBP">WEBP</option>
                    </select>
                  </div>
                </div>

                {/* Default Export Quality */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Default Export Quality</span>
                    <span className="setting-desc">Compression balance between size and detail</span>
                  </div>
                  <div className="setting-control-right slider-right">
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={defaultQuality}
                      onChange={(e) => setDefaultQuality(Number(e.target.value))}
                      className="bard-range-input"
                    />
                    <span className="setting-val-badge">{defaultQuality}</span>
                  </div>
                </div>

                {/* Auto Save Toggle */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Auto Save</span>
                    <span className="setting-desc">Automatically save snapshot backups of active works</span>
                  </div>
                  <div className="setting-control-right">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>

                {/* Auto Save Interval */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Auto Save Interval</span>
                    <span className="setting-desc">Frequency of automatic project backups</span>
                  </div>
                  <div className="setting-control-right">
                    <select
                      className="settings-select"
                      value={autoSaveInterval}
                      onChange={(e) => setAutoSaveInterval(e.target.value)}
                    >
                      <option value="1 minute">1 minute</option>
                      <option value="5 minutes">5 minutes</option>
                      <option value="10 minutes">10 minutes</option>
                      <option value="30 minutes">30 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Default Working Directory */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Default Working Directory</span>
                    <span className="setting-desc">Default storage location for output renderings</span>
                  </div>
                  <div className="setting-control-right dir-right">
                    <input
                      type="text"
                      className="settings-input dir-input"
                      value={workingDir}
                      onChange={(e) => setWorkingDir(e.target.value)}
                    />
                    <button
                      className="settings-action-btn"
                      onClick={() => alert("Directory picker dialog")}
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Language</span>
                    <span className="setting-desc">Interface localization language</span>
                  </div>
                  <div className="setting-control-right">
                    <select
                      className="settings-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                      <option value="Japanese">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Appearance' && (
              <div className="settings-card-panel">
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Application Theme</span>
                    <span className="setting-desc">Dark Obsidian Purple (Default High-Contrast)</span>
                  </div>
                  <div className="setting-control-right">
                    <span className="badge-theme">Obsidian Purple &bull; Active</span>
                  </div>
                </div>
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">Canvas Background Pattern</span>
                    <span className="setting-desc">Show transparency checkerboard</span>
                  </div>
                  <div className="setting-control-right">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Performance' && (
              <div className="settings-card-panel">
                <div className="setting-item-row">
                  <div className="setting-item-info">
                    <span className="setting-label">GPU Hardware Acceleration</span>
                    <span className="setting-desc">WebGL 2.0 &amp; Canvas acceleration enabled</span>
                  </div>
                  <div className="setting-control-right">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={gpuAcceleration}
                        onChange={(e) => setGpuAcceleration(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Shortcuts' && (
              <div className="settings-card-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>Custom Keyboard Shortcuts</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
                      Click on any shortcut key or "Change" to record a new key combination according to your preference.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="settings-action-btn"
                      style={{ fontSize: '11px', color: '#f87171' }}
                      onClick={() => {
                        if (window.confirm('Reset all shortcuts to factory defaults?')) {
                          resetShortcuts();
                          setSavedNotification(true);
                          setTimeout(() => setSavedNotification(false), 2000);
                        }
                      }}
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    placeholder="Search shortcuts (e.g. delete text, save, move)..."
                    value={shortcutFilter}
                    onChange={(e) => setShortcutFilter(e.target.value)}
                    className="settings-input"
                    style={{ width: '100%', fontSize: '12px' }}
                  />
                </div>

                {recordingId && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#1a1a1a',
                      border: '1px solid #ffffff',
                      borderRadius: '6px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>
                      Listening: Press key combination for "{shortcuts?.[recordingId]?.name || 'Shortcut'}" (e.g. Ctrl + T)...
                    </span>
                    <button
                      type="button"
                      className="dialog-cancel-btn"
                      style={{ padding: '3px 8px', fontSize: '10px' }}
                      onClick={() => setRecordingId(null)}
                    >
                      Cancel (Esc)
                    </button>
                  </div>
                )}

                <div className="shortcuts-list-grid" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.values(shortcuts || {})
                    .filter(s => {
                      if (!shortcutFilter) return true;
                      const q = shortcutFilter.toLowerCase();
                      return s.name.toLowerCase().includes(q) || (s.display && s.display.toLowerCase().includes(q));
                    })
                    .map((item) => {
                      const isRec = recordingId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="shortcut-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            background: isRec ? '#222222' : 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '6px',
                            border: isRec ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', display: 'block' }}>
                              {item.name}
                            </span>
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                              {item.description}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <kbd
                              onClick={() => setRecordingId(item.id)}
                              style={{
                                cursor: 'pointer',
                                padding: '4px 10px',
                                background: isRec ? '#ffffff' : 'rgba(0,0,0,0.5)',
                                border: isRec ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '4px',
                                color: isRec ? '#000000' : '#ffffff',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                minWidth: '70px',
                                textAlign: 'center'
                              }}
                              title="Click to record new key combination"
                            >
                              {isRec ? 'Press keys...' : (item.display || formatShortcutDisplay(item))}
                            </kbd>

                            <button
                              type="button"
                              className="settings-action-btn"
                              style={{ padding: '3px 8px', fontSize: '10px' }}
                              onClick={() => setRecordingId(isRec ? null : item.id)}
                            >
                              {isRec ? 'Cancel' : 'Change'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'File Types' && (
              <div className="settings-card-panel">
                <div className="file-types-list">
                  <div className="file-type-pill-item">PNG &bull; Portable Network Graphics</div>
                  <div className="file-type-pill-item">JPEG &bull; Joint Photographic Experts Group</div>
                  <div className="file-type-pill-item">WEBP &bull; Google Web Picture</div>
                  <div className="file-type-pill-item">PSD &bull; Photoshop Document</div>
                  <div className="file-type-pill-item">SVG &bull; Scalable Vector Graphics</div>
                </div>
              </div>
            )}

            {/* Save Confirmation Button */}
            <div className="settings-save-bar">
              <button className="settings-save-button" onClick={handleSaveSettings}>
                Save Preferences
              </button>
              {savedNotification && (
                <span className="settings-save-feedback">Preferences saved successfully!</span>
              )}
            </div>
          </div>
        </main>
      </div>

      <div className="screen-index-badge">12. Settings Page</div>
    </div>
  );
}
