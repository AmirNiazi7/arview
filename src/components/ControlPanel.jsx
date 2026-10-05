import React, { useState } from 'react';
import {
  Sun,
  Sliders,
  Grid as GridIcon,
  RotateCw,
  Eye,
  Palette,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sparkles
} from 'lucide-react';

export function ControlPanel({
  wireframe,
  setWireframe,
  autoRotate,
  setAutoRotate,
  autoRotateSpeed,
  setAutoRotateSpeed,
  metalness,
  setMetalness,
  roughness,
  setRoughness,
  lightingPreset,
  setLightingPreset,
  showGrid,
  setShowGrid,
  showShadows,
  setShowShadows,
  backgroundColor,
  setBackgroundColor,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('environment'); // 'environment' | 'materials' | 'scene'

  const bgColors = [
    { name: 'Obsidian', color: '#0a0b10' },
    { name: 'Deep Space', color: '#030712' },
    { name: 'Cyber Blue', color: '#0b1329' },
    { name: 'Neon Abyss', color: '#130d24' },
    { name: 'Slate Studio', color: '#1e293b' },
  ];

  return (
    <div
      className="glass-panel-heavy"
      style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 40,
        width: collapsed ? '48px' : '320px',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header / Toggle Collapse */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: collapsed ? 'none' : '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-secondary)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
              Studio Controls
            </span>
          </div>
        )}
        <button
          className="btn-icon"
          style={{ width: '32px', height: '32px', marginLeft: collapsed ? 'auto' : '0' }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Controls' : 'Collapse Controls'}
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Tabs */}
      {!collapsed && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '10px' }}>
            <button
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeTab === 'environment' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'environment' ? '#fff' : 'var(--text-muted)',
              }}
              onClick={() => setActiveTab('environment')}
            >
              Lighting
            </button>
            <button
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeTab === 'materials' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'materials' ? '#fff' : 'var(--text-muted)',
              }}
              onClick={() => setActiveTab('materials')}
            >
              Shading
            </button>
            <button
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: activeTab === 'scene' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'scene' ? '#fff' : 'var(--text-muted)',
              }}
              onClick={() => setActiveTab('scene')}
            >
              Scene
            </button>
          </div>

          {/* TAB 1: LIGHTING & ENVIRONMENT */}
          {activeTab === 'environment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  Light Schemes
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'studio', label: 'Studio Neutral', icon: Sun },
                    { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Zap },
                    { id: 'sunset', label: 'Golden Sunset', icon: Sparkles },
                    { id: 'dawn', label: 'Indigo Dawn', icon: Sun },
                  ].map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = lightingPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 10px', fontSize: '0.75rem', justifyContent: 'flex-start' }}
                        onClick={() => setLightingPreset(preset.id)}
                      >
                        <Icon size={14} />
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  Canvas Backdrop
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {bgColors.map((bg) => (
                    <button
                      key={bg.color}
                      onClick={() => setBackgroundColor(bg.color)}
                      title={bg.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: bg.color,
                        border: backgroundColor === bg.color ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                        boxShadow: backgroundColor === bg.color ? '0 0 10px var(--accent-secondary)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATERIALS */}
          {activeTab === 'materials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Wireframe Mode</span>
                <button
                  className={`btn ${wireframe ? 'btn-accent-cyan' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setWireframe(!wireframe)}
                >
                  {wireframe ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Metalness</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{metalness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metalness}
                  onChange={(e) => setMetalness(parseFloat(e.target.value))}
                  className="control-slider"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roughness</span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{roughness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="control-slider"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SCENE & HELPERS */}
          {activeTab === 'scene' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Auto Rotate</span>
                <button
                  className={`btn ${autoRotate ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  {autoRotate ? 'Active' : 'Paused'}
                </button>
              </div>

              {autoRotate && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Turntable Speed</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{autoRotateSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.5"
                    value={autoRotateSpeed}
                    onChange={(e) => setAutoRotateSpeed(parseFloat(e.target.value))}
                    className="control-slider"
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Ground Grid</span>
                <button
                  className={`btn ${showGrid ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  {showGrid ? 'On' : 'Off'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Contact Shadows</span>
                <button
                  className={`btn ${showShadows ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setShowShadows(!showShadows)}
                >
                  {showShadows ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
