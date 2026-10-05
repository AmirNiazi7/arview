import React, { useRef } from 'react';
import { createShareableArtUrl } from '../utils/imageSync';
import {
  Upload,
  Palette,
  Maximize2,
  Sparkles,
  Eye,
  Camera,
  Layers,
  Image as ImageIcon,
  Check,
  Video,
  Smartphone
} from 'lucide-react';

export function FrameCustomizer({
  artworkUrl,
  setArtworkUrl,
  setShareableArtUrl,
  frameColor,
  setFrameColor,
  frameFinish,
  setFrameFinish,
  matboardColor,
  setMatboardColor,
  selectedSize,
  setSelectedSize,
  sizeOptions,
  onOpenAR,
  onOpenLaptopCamera,
  onTakeSnapshot,
}) {
  const artUploadRef = useRef(null);

  const artworkPresets = [
    { id: 'palms', name: 'Palms of Paradise', url: '/art/palms-paradise.svg' },
    { id: 'modern', name: 'Architectural Forms', url: '/art/modern-forms.svg' },
    { id: 'botanical', name: 'Botanical Emerald', url: '/art/botanical-emerald.svg' },
  ];

  const frameColorOptions = [
    { name: 'Matte White', color: '#ffffff', finish: { roughness: 0.7, metalness: 0.05 } },
    { name: 'Obsidian Black', color: '#18181b', finish: { roughness: 0.6, metalness: 0.1 } },
    { name: 'Warm Oak Wood', color: '#b58351', finish: { roughness: 0.75, metalness: 0.02 } },
    { name: 'Dark Walnut', color: '#3d2616', finish: { roughness: 0.8, metalness: 0.02 } },
    { name: 'Brushed Gold', color: '#d4af37', finish: { roughness: 0.35, metalness: 0.85 } },
  ];

  const matboardOptions = [
    { name: 'Pure White', color: '#ffffff' },
    { name: 'Warm Cream', color: '#fef3c7' },
    { name: 'Slate Gray', color: '#334155' },
    { name: 'Charcoal', color: '#0f172a' },
  ];

  const handleArtUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { localUrl, shareableUrl } = await createShareableArtUrl(file);
      setArtworkUrl(localUrl);
      if (setShareableArtUrl) {
        setShareableArtUrl(shareableUrl);
      }
    } catch (err) {
      console.error('Art upload error:', err);
      const url = URL.createObjectURL(file);
      setArtworkUrl(url);
    }
  };

  return (
    <aside
      className="glass-panel-heavy"
      style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        zIndex: 40,
        width: '340px',
        maxHeight: 'calc(82vh - 48px)',
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* Title & Badges */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="badge badge-cyan">GLB Frame Studio</span>
          <span className="badge badge-emerald">18" × 24" Base</span>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Custom Framed Canvas
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Real-time PBR moulding & dynamic artwork injection
        </p>
      </div>

      {/* Prominent Laptop Camera AR Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="btn btn-primary glow-box"
          onClick={onOpenLaptopCamera}
          style={{
            padding: '12px 18px',
            fontSize: '0.92rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          <Video size={18} />
          <span>Open Laptop Camera (Wall AR)</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onOpenAR}
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Smartphone size={14} />
          <span>Mobile QR Code / WebXR</span>
        </button>
      </div>

      {/* 1. ARTWORK SELECTOR */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Artwork Print
          </label>
          <button
            className="btn btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            onClick={() => artUploadRef.current?.click()}
          >
            <Upload size={12} /> Upload Art
          </button>
          <input
            ref={artUploadRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleArtUpload}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {artworkPresets.map((preset) => {
            const isSelected = artworkUrl === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setArtworkUrl(preset.url);
                  if (setShareableArtUrl) setShareableArtUrl(preset.url);
                }}
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 12px var(--accent-secondary)' : 'none',
                  padding: 0,
                  position: 'relative',
                  height: '70px',
                  background: '#0f172a',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'var(--accent-secondary)',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={10} color="#fff" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FRAME COLOUR & FINISH */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Frame Moulding
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {frameColorOptions.map((opt) => {
            const isSelected = frameColor === opt.color;
            return (
              <button
                key={opt.color}
                onClick={() => {
                  setFrameColor(opt.color);
                  setFrameFinish(opt.finish);
                }}
                title={opt.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: opt.color,
                  border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 12px var(--accent-secondary)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <Check size={14} color={opt.color === '#ffffff' ? '#000' : '#fff'} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MATBOARD COLOR */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Backing / Matboard
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {matboardOptions.map((opt) => {
            const isSelected = matboardColor === opt.color;
            return (
              <button
                key={opt.color}
                onClick={() => setMatboardColor(opt.color)}
                title={opt.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: opt.color,
                  border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 0 10px var(--accent-secondary)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <Check size={12} color={opt.color === '#ffffff' ? '#000' : '#fff'} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PHYSICAL SIZE SELECTOR */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Size (Inches)
          </label>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 600 }}>
            Scale: {selectedSize.scale}x
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {sizeOptions.map((sz) => {
            const isSelected = selectedSize.label === sz.label;
            return (
              <button
                key={sz.label}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 4px', fontSize: '0.75rem', width: '100%' }}
                onClick={() => setSelectedSize(sz)}
              >
                {sz.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Action */}
      <button
        className="btn btn-secondary"
        onClick={onTakeSnapshot}
        style={{ marginTop: 'auto', padding: '10px' }}
      >
        <Camera size={16} />
        <span>Capture High-Res Render</span>
      </button>
    </aside>
  );
}
