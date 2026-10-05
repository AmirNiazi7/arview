import React, { useEffect, useRef, useState } from 'react';
import '@google/model-viewer';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Sparkles, Camera, Check, ExternalLink, RefreshCw, Eye, Video } from 'lucide-react';

export function ARViewModal({
  isOpen,
  onClose,
  artworkUrl,
  frameColor,
  frameFinish,
  selectedSize,
  sizeScale = 1,
  onOpenLaptopAR,
}) {
  const modelViewerRef = useRef(null);
  const [canActivateAR, setCanActivateAR] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [arQrUrl, setArQrUrl] = useState('');

  // Generate mobile link using actual LAN network IP if available so mobile works
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname === 'localhost' ? '192.168.20.157' : window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const url = `${window.location.protocol}//${host}${port}/?ar=1&size=${encodeURIComponent(selectedSize?.label || '18x24')}&frameColor=${encodeURIComponent(frameColor)}`;
      setArQrUrl(url);
    }
  }, [selectedSize, frameColor]);

  // Configure <model-viewer> and apply texture + materials like ElephantStock
  useEffect(() => {
    const mv = modelViewerRef.current;
    if (!mv || !isOpen) return;

    const handleLoad = async () => {
      setIsModelReady(true);
      setCanActivateAR(Boolean(mv.canActivateAR));

      // Apply physical scale
      mv.scale = `${sizeScale} ${sizeScale} 1`;

      try {
        // 1. Apply Artwork Texture to 'Portrait artwork' material slot
        if (artworkUrl) {
          const artworkMat = mv.model?.getMaterialByName('Portrait artwork');
          if (artworkMat) {
            const texture = await mv.createTexture(artworkUrl);
            artworkMat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          }
        }

        // 2. Apply Frame Color & PBR finish to 'Matte white frame' material slot
        const frameMat = mv.model?.getMaterialByName('Matte white frame');
        if (frameMat) {
          const hex = frameColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;

          frameMat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1.0]);
          frameMat.pbrMetallicRoughness.setRoughnessFactor(frameFinish?.roughness ?? 0.6);
          frameMat.pbrMetallicRoughness.setMetallicFactor(frameFinish?.metalness ?? 0.05);
        }
      } catch (err) {
        console.error('Error applying materials in model-viewer:', err);
      }
    };

    mv.addEventListener('load', handleLoad);

    return () => {
      mv.removeEventListener('load', handleLoad);
    };
  }, [isOpen, artworkUrl, frameColor, frameFinish, sizeScale]);

  if (!isOpen) return null;

  const handleLaunchNativeAR = () => {
    if (modelViewerRef.current?.canActivateAR) {
      modelViewerRef.current.activateAR();
    } else {
      // If WebXR not supported on desktop, trigger Laptop Webcam AR
      onOpenLaptopAR();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 7, 12, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel-heavy"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Camera size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                View In Your Room (AR)
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                ElephantStock-style true-to-scale vertical wall placement
              </p>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* Left: Interactive 3D / AR Viewport with direct Laptop Camera trigger */}
          <div
            style={{
              position: 'relative',
              background: 'radial-gradient(circle at center, #1e293b 0%, #0a0b10 100%)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            {/* The Google Model-Viewer Web Component */}
            <model-viewer
              ref={modelViewerRef}
              src="/white-portrait-frame-18x24.glb"
              ar
              ar-placement="wall"
              ar-scale="fixed"
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              tone-mapping="neutral"
              shadow-intensity="1"
              shadow-softness="0.5"
              exposure="1"
              auto-rotate
              style={{ width: '100%', height: '100%', minHeight: '340px' }}
            />

            {/* Laptop Camera AR Prominent Action */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                right: '20px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              <button
                className="btn btn-primary glow-box"
                onClick={() => {
                  onClose();
                  onOpenLaptopAR();
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  padding: '12px 20px',
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Video size={18} />
                <span>Open Laptop Camera (Wall AR)</span>
              </button>
            </div>

            {/* Spec Badges */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px',
                pointerEvents: 'none',
              }}
            >
              <span className="badge badge-emerald">Wall Anchor</span>
              <span className="badge badge-purple">{selectedSize?.label || '18" × 24"'}</span>
            </div>
          </div>

          {/* Right: Laptop Camera & Mobile WiFi QR */}
          <div
            style={{
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.4)',
            }}
          >
            {/* Quick Option 1: Laptop Camera */}
            <div
              style={{
                width: '100%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '14px 18px',
                borderRadius: '16px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#34d399', fontSize: '0.9rem', marginBottom: '4px' }}>
                <Camera size={16} /> Direct Laptop Webcam AR
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '10px' }}>
                Uses your laptop camera feed live, with interactive drag & drop directly on your room wall.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '0.85rem', padding: '8px' }}
                onClick={() => {
                  onClose();
                  onOpenLaptopAR();
                }}
              >
                <Sparkles size={14} /> Launch Camera on Laptop
              </button>
            </div>

            {/* Quick Option 2: Mobile QR Code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', margin: '4px 0 16px 0' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>OR PHONE SCAN (Same WiFi)</span>
              <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '12px',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                marginBottom: '10px',
              }}
            >
              <QRCodeSVG
                value={arQrUrl || window.location.href}
                size={120}
                level="M"
                includeMargin={false}
              />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '240px', lineHeight: '1.4' }}>
              Connected to local network: <br />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                {arQrUrl.split('/?')[0]}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
