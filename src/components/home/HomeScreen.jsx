import React, { useState } from 'react';
import SidebarNav from './SidebarNav';
import NewProjectModal from './NewProjectModal';
import { Icon, LogoIcon } from '../common/Icons';
import WindowControls from '../common/WindowControls';
import { useEditor } from '../../context/useEditor';
import { POPULAR_TOOLS } from '../../utils/projectPresets';

export default function HomeScreen() {
  const {
    triggerOpenFileDialog,
    setCurrentView,
    setActiveTool,
    setActivePanel,
    recentFiles,
    openRecentFile,
    clearRecents,
    newProjectModalOpen,
    setNewProjectModalOpen
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');

  const safeRecents = Array.isArray(recentFiles) ? recentFiles.filter(f => f && f.name) : [];
  const filteredRecents = searchQuery.trim()
    ? safeRecents.filter(f => f?.name && String(f.name).toLowerCase().includes(searchQuery.toLowerCase()))
    : safeRecents;

  const handleToolClick = (tool) => {
    if (tool.action === 'ai-tools') {
      setCurrentView('ai-tools');
    } else {
      setActiveTool(tool.id);
      if (tool.id === 'crop') setActivePanel('crop');
      else if (tool.id === 'filters') setActivePanel('filters');
      else if (tool.id === 'adjust') setActivePanel('adjustments');
      else if (tool.id === 'text') setActivePanel('text');
      setCurrentView('editor');
    }
  };

  return (
    <div className="home-layout">
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
            placeholder="Search tools, formats, or recent projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="top-actions-right">
          <button
            className="top-icon-btn"
            title="Open Photo from Computer"
            onClick={triggerOpenFileDialog}
          >
            <Icon name="upload" size={17} />
          </button>

          <WindowControls />
        </div>
      </header>

      {/* Main Body */}
      <div className="home-body">
        <SidebarNav />

        <main className="home-main-scroll">
          <div className="home-content-container">
            {/* Banner Section */}
            <section className="home-hero-section">
              <h1 className="hero-heading">Create Something Amazing</h1>
              <p className="hero-subtext">
                Edit photos, create designs, and bring your ideas to life
              </p>
            </section>

            {/* Quick Action Cards */}
            <section className="quick-actions-grid">
              <div
                className="action-card action-new-project"
                onClick={() => setNewProjectModalOpen(true)}
              >
                <div className="action-icon-circle accent">
                  <Icon name="plus" size={24} color="#ffffff" strokeWidth={2.5} />
                </div>
                <div className="action-text-group">
                  <h3 className="action-title">New Project</h3>
                  <p className="action-sub">Start from scratch</p>
                </div>
              </div>

              <div
                className="action-card"
                onClick={triggerOpenFileDialog}
              >
                <div className="action-icon-circle">
                  <Icon name="image" size={22} color="#c084fc" />
                </div>
                <div className="action-text-group">
                  <h3 className="action-title">Open Image</h3>
                  <p className="action-sub">Browse from device</p>
                </div>
              </div>

              <div
                className="action-card"
                onClick={() => setCurrentView('ai-tools')}
              >
                <div className="action-icon-circle">
                  <Icon name="sparkles" size={22} color="#c084fc" />
                </div>
                <div className="action-text-group">
                  <h3 className="action-title">AI Enhance</h3>
                  <p className="action-sub">Improve with AI</p>
                </div>
              </div>

              <div
                className="action-card"
                onClick={() => setCurrentView('ai-tools')}
              >
                <div className="action-icon-circle">
                  <Icon name="scissors" size={22} color="#c084fc" />
                </div>
                <div className="action-text-group">
                  <h3 className="action-title">Remove Background</h3>
                  <p className="action-sub">One click removal</p>
                </div>
              </div>
            </section>

            {/* Popular Tools Section */}
            <section className="home-section">
              <div className="section-header-row">
                <h2 className="section-title">Popular Tools</h2>
                <button
                  className="section-link-btn"
                  onClick={() => setCurrentView('editor')}
                >
                  Open Editor &rarr;
                </button>
              </div>

              <div className="popular-tools-grid">
                {POPULAR_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    className="tool-badge-card"
                    onClick={() => handleToolClick(tool)}
                  >
                    <div className="tool-badge-icon">
                      <Icon name={tool.icon} size={22} />
                    </div>
                    <span className="tool-badge-label">{tool.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Recent Files Section */}
            <section className="home-section">
              <div className="section-header-row">
                <h2 className="section-title">Recent Files</h2>
                {recentFiles.length > 0 && (
                  <button
                    className="section-link-btn"
                    onClick={clearRecents}
                    title="Clear recent projects list"
                  >
                    Clear Recents
                  </button>
                )}
              </div>

              {filteredRecents.length === 0 ? (
                <div className="recent-files-empty-box">
                  <div className="empty-icon-circle">
                    <Icon name="image" size={32} color="#8b5cf6" />
                  </div>
                  <h4 className="empty-title">No recent projects yet</h4>
                  <p className="empty-desc">
                    Open an image from your device, create a blank project, or drag &amp; drop photos anywhere on this window.
                  </p>
                  <div className="empty-actions-row">
                    <button
                      className="dialog-primary-btn"
                      onClick={triggerOpenFileDialog}
                      style={{ maxWidth: '180px' }}
                    >
                      <Icon name="upload" size={15} />
                      <span>Open Image</span>
                    </button>
                    <button
                      className="dialog-cancel-btn"
                      onClick={() => setNewProjectModalOpen(true)}
                      style={{ maxWidth: '180px' }}
                    >
                      <Icon name="plus" size={15} />
                      <span>New Canvas</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="recent-files-grid">
                  {filteredRecents.map((file, idx) => {
                    if (!file) return null;
                    return (
                      <div
                        key={file.id || idx}
                        className="recent-file-card"
                        onClick={() => openRecentFile(file)}
                        title={`Open ${file.name || 'Project'}`}
                      >
                        <div className="recent-thumb-wrapper">
                          {file.url ? (
                            <img
                              src={file.url}
                              alt={file.name || ''}
                              className="recent-thumb-img"
                              loading="lazy"
                            />
                          ) : (
                            <div className="recent-thumb-placeholder">
                              <Icon name="image" size={24} color="#8b5cf6" />
                            </div>
                          )}
                          <div className="recent-thumb-overlay">
                            <span>Open &rarr;</span>
                          </div>
                        </div>
                        <div className="recent-meta">
                          <div className="recent-filename">{file.name || 'Untitled'}</div>
                          <div className="recent-time">{file.time || file.size || 'Recent'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* New Project Modal Dialog */}
      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
      />

      <div className="screen-index-badge">2. Home / Dashboard</div>
    </div>
  );
}
