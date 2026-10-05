import React from 'react';
import { Frame, Box, Upload, Camera, Eye, Sparkles, Video, Smartphone } from 'lucide-react';

export function Navbar({
  viewMode,
  setViewMode,
  onOpenAR,
  onOpenLaptopCamera,
  onTakeSnapshot,
}) {
  return (
    <header style={{
      position: 'relative',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 28px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 11, 16, 0.85)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Brand & Mode Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)'
        }}>
          <Frame size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">ElephantStock</span>
              <span style={{ color: 'var(--accent-secondary)', marginLeft: '4px' }}>AR Frame Engine</span>
            </h1>
            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
              18×24 GLB
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
            Real-Time PBR Framing, Texture Injection & WebXR AR Wall Placement
          </p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.04)',
        padding: '4px',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)'
      }}>
        <button
          className={`btn ${viewMode === 'frame' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          onClick={() => setViewMode('frame')}
        >
          <Frame size={15} /> 18×24 Frame Studio
        </button>
        <button
          className={`btn ${viewMode === 'preset' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
          onClick={() => setViewMode('preset')}
        >
          <Box size={15} /> Geometric 3D
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          onClick={onTakeSnapshot}
          title="Capture High-Resolution PNG"
        >
          <Camera size={16} />
          <span>Capture</span>
        </button>

        {/* Prominent Direct Laptop Camera Wall AR Button */}
        <button
          className="btn btn-primary"
          onClick={onOpenLaptopCamera}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Video size={16} />
          <span>Open Laptop Camera (Wall AR)</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenAR}
          title="View QR Code & WebXR options"
        >
          <Smartphone size={16} />
          <span>Mobile QR</span>
        </button>
      </div>
    </header>
  );
}
