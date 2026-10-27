import React from 'react';

export function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#9333ea" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#logoGrad)" filter="url(#glow)" />
      {/* Stylized 'Bi' / 'BP' calligraphy mark */}
      <path
        d="M17 14C17 14 20 12 24 12C28.5 12 32 15.5 32 19.5C32 23.5 28 25.5 25 26C30 27 33 30.5 33 34.5C33 39 29 42 23.5 42C18 42 16 38.5 16 38.5"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="24" r="2.5" fill="#ffffff" />
      <path
        d="M26 18C28 18 29.5 19 29.5 20.5C29.5 22 28 23 26 23"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Icon({ name, size = 18, color = "currentColor", strokeWidth = 2, className = "" }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className
  };

  switch (name?.toLowerCase()) {
    case "move":
    case "pointer":
      return (
        <svg {...props}>
          <path d="M5 3l3.057 18.275 3.518-6.079 6.825 5.504 2.6-3.224-6.825-5.504 6.825-1.472L5 3z" />
        </svg>
      );
    case "marquee":
    case "select":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
        </svg>
      );
    case "crop":
      return (
        <svg {...props}>
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
      );
    case "brush":
    case "retouch":
      return (
        <svg {...props}>
          <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z" />
          <path d="M9 8c-2 3-4 3.5-7 4l8 8c.5-3 1-5 4-7" />
          <path d="M14.5 17.5L4.5 7.5" opacity="0.3" />
        </svg>
      );
    case "eraser":
      return (
        <svg {...props}>
          <path d="M7 21L20 8l-5-5L2 16l5 5z" />
          <path d="M22 21H7" />
          <path d="M14 11l4-4" />
        </svg>
      );
    case "bucket":
    case "gradient":
      return (
        <svg {...props}>
          <path d="M19 11L12 4 4 12l7 7 8-8z" />
          <path d="M5 2l5 5" />
          <path d="M2 13l3 3" />
          <path d="M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3z" fill={color} />
        </svg>
      );
    case "text":
    case "type":
      return (
        <svg {...props}>
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      );
    case "save":
    case "disk":
      return (
        <svg {...props}>
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      );
    case "shapes":
    case "square":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
      );
    case "pen":
      return (
        <svg {...props}>
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      );
    case "wand":
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M15 4V2m0 16v-2m4-8h2m-16 0H3m14.5-4.5L19 3m-9.5 9.5L8 14m1-9.5L7.5 3m9.5 9.5L18 14" />
          <path d="M4 20l10-10" />
        </svg>
      );
    case "hand":
      return (
        <svg {...props}>
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 0 1 2 2v6a7 7 0 0 1-7 7h-2c-2.8 0-4.5-.9-5.7-2.3L2.4 17.5a1.5 1.5 0 0 1 .3-2.1l1.4-1.1a1.5 1.5 0 0 1 2 .2L8 16.5" />
        </svg>
      );
    case "zoom":
    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "zoomin":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "zoomout":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "adjust":
    case "sliders":
      return (
        <svg {...props}>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case "filters":
    case "palette":
      return (
        <svg {...props}>
          <circle cx="13.5" cy="6.5" r=".5" fill={color} />
          <circle cx="17.5" cy="10.5" r=".5" fill={color} />
          <circle cx="8.5" cy="7.5" r=".5" fill={color} />
          <circle cx="6.5" cy="12.5" r=".5" fill={color} />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.24-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" />
        </svg>
      );
    case "layers":
      return (
        <svg {...props}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "eyeoff":
      return (
        <svg {...props}>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    case "lock":
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "unlock":
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      );
    case "trash":
    case "delete":
      return (
        <svg {...props}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "folder":
      return (
        <svg {...props}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "x":
    case "close":
      return (
        <svg {...props}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "templates":
    case "grid":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "recent":
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "open":
    case "upload":
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "help":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "download":
    case "export":
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    case "scissors":
    case "removebg":
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );
    case "smile":
    case "stickers":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    case "maximize":
      return (
        <svg {...props}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case "minimize":
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "fx":
      return (
        <span style={{ fontSize: size * 0.8, fontWeight: "bold", fontStyle: "italic", fontFamily: "serif" }}>
          fx
        </span>
      );
    case "mask":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
          <path d="M12 3a9 9 0 0 1 0 18z" fill={color} />
        </svg>
      );
    case "circledot":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" fill={color} />
        </svg>
      );
    case "trendingup":
      return (
        <svg {...props}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "alignleft":
      return (
        <svg {...props}>
          <line x1="4" y1="4" x2="4" y2="20" strokeWidth="2.5" />
          <rect x="8" y="7" width="10" height="4" rx="1" fill={color} opacity="0.6" />
          <rect x="8" y="13" width="6" height="4" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "aligncenter":
      return (
        <svg {...props}>
          <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="7" y="7" width="10" height="4" rx="1" fill={color} opacity="0.6" />
          <rect x="9" y="13" width="6" height="4" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "alignright":
      return (
        <svg {...props}>
          <line x1="20" y1="4" x2="20" y2="20" strokeWidth="2.5" />
          <rect x="6" y="7" width="10" height="4" rx="1" fill={color} opacity="0.6" />
          <rect x="10" y="13" width="6" height="4" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "aligntop":
      return (
        <svg {...props}>
          <line x1="4" y1="4" x2="20" y2="4" strokeWidth="2.5" />
          <rect x="7" y="8" width="4" height="10" rx="1" fill={color} opacity="0.6" />
          <rect x="13" y="8" width="4" height="6" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "alignmiddle":
      return (
        <svg {...props}>
          <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="7" y="7" width="4" height="10" rx="1" fill={color} opacity="0.6" />
          <rect x="13" y="9" width="4" height="6" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "alignbottom":
      return (
        <svg {...props}>
          <line x1="4" y1="20" x2="20" y2="20" strokeWidth="2.5" />
          <rect x="7" y="6" width="4" height="10" rx="1" fill={color} opacity="0.6" />
          <rect x="13" y="10" width="4" height="6" rx="1" fill={color} opacity="0.6" />
        </svg>
      );
    case "swap":
      return (
        <svg {...props}>
          <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    case "undo":
      return (
        <svg {...props}>
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      );
    case "redo":
      return (
        <svg {...props}>
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

