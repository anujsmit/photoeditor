import React from 'react';
import { Icon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function SidebarNav() {
  const {
    currentView,
    setCurrentView,
    setNewProjectModalOpen,
    triggerOpenFileDialog
  } = useEditor();

  const handleNavClick = (viewName) => {
    if (viewName === 'new-project') {
      setNewProjectModalOpen(true);
    } else if (viewName === 'open') {
      triggerOpenFileDialog();
    } else {
      setCurrentView(viewName);
    }
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-top">
        <button
          className={`sidebar-nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleNavClick('home')}
          title="Home"
        >
          <Icon name="home" size={20} />
          <span>Home</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => handleNavClick('new-project')}
          title="New Project"
        >
          <Icon name="plus" size={20} />
          <span>New Project</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentView === 'templates' ? 'active' : ''}`}
          onClick={() => handleNavClick('templates')}
          title="Templates"
        >
          <Icon name="templates" size={20} />
          <span>Templates</span>
        </button>

        <button
          className={`sidebar-nav-item ${currentView === 'ai-tools' ? 'active' : ''}`}
          onClick={() => handleNavClick('ai-tools')}
          title="AI Tools"
        >
          <Icon name="sparkles" size={20} />
          <span>AI Tools</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => handleNavClick('open')}
          title="Open"
        >
          <Icon name="open" size={20} />
          <span>Open</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <button
          className={`sidebar-nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
          title="Settings"
        >
          <Icon name="settings" size={20} />
          <span>Settings</span>
        </button>

        <button
          className="sidebar-nav-item"
          onClick={() => alert("BARD Photo Editor v1.0\nProfessional Photo Editing & AI Enhancement Suite.")}
          title="Help"
        >
          <Icon name="help" size={20} />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}
