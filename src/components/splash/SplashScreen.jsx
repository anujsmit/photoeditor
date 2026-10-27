import React, { useEffect, useState } from 'react';
import { LogoIcon } from '../common/Icons';
import { useEditor } from '../../context/useEditor';

export default function SplashScreen() {
  const { setCurrentView } = useEditor();
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentView('home'), 400);
          return 100;
        }
        return prev + 15;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [setCurrentView]);

  return (
    <div className="splash-container">
      {/* Background mountain silhouette & glow */}
      <div className="splash-bg-glow" />
      <div className="splash-mountains" />

      <div className="splash-card">
        <div className="splash-logo-wrapper">
          <LogoIcon size={84} />
          <div className="splash-logo-aura" />
        </div>

        <h1 className="splash-title">BARD Photo Editor</h1>
        <p className="splash-subtitle">Edit &bull; Create &bull; Enhance</p>

        <div className="splash-progress-track">
          <div
            className="splash-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="splash-status">
          <span>Loading workspace...</span>
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <button
          className="splash-skip-btn"
          onClick={() => setCurrentView('home')}
        >
          Skip &rarr;
        </button>
      </div>

      <div className="splash-footer-screen-tag">
        1. Splash Screen
      </div>
    </div>
  );
}
