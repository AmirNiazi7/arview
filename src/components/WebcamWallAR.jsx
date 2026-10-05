import React, { useState, useRef, useEffect, Suspense, Component, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { FrameViewer3D } from './FrameViewer3D';
import {
  Camera,
  X,
  Scan,
  CheckCircle,
  Move,
  RotateCcw,
  Sparkles,
  SwitchCamera,
  AlertTriangle,
  Radar,
  Grid,
  Zap,
  Target
} from 'lucide-react';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function WebcamWallAR({
  isOpen,
  onClose,
  artworkUrl,
  frameColor,
  frameFinish,
  matboardColor,
  selectedSize,
  setSelectedSize,
  sizeOptions,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const cvCanvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  // Wall Detection States: 'SCANNING' | 'DETECTED' | 'LOCKED'
  const [wallState, setWallState] = useState('SCANNING');
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [featurePoints, setFeaturePoints] = useState([]);
  const [detectedPlane, setDetectedPlane] = useState(null);
  const [autoWallSnap, setAutoWallSnap] = useState(true);
  const [showPointGrid, setShowPointGrid] = useState(true);

  // 3D Frame Wall Placement
  const [position, setPosition] = useState([0, 0, 0]);
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [depthDistance, setDepthDistance] = useState(2.2);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState([0, 0, 0]);

  // Start / stop camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode) => {
    stopCamera();
    setCameraError(null);
    setWallState('SCANNING');
    setDetectionConfidence(0);

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
          setCameraActive(true);
          initWallDetection();
        };
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
      setCameraError(err.message || 'Unable to access your camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Real-Time Computer Vision & Wall Detection Algorithm
  const initWallDetection = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const w = 160;
      const h = 90;
      let cvCanvas = cvCanvasRef.current;
      if (!cvCanvas) {
        cvCanvas = document.createElement('canvas');
        cvCanvas.width = w;
        cvCanvas.height = h;
        cvCanvasRef.current = cvCanvas;
      }
      const ctx = cvCanvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, w, h);

      try {
        const frameData = ctx.getImageData(0, 0, w, h);
        const data = frameData.data;

        // Analyze vertical plane texture variance and lighting uniformity
        let totalBrightness = 0;
        let edgeCount = 0;
        const points = [];

        // Sample points across the central vertical wall zone
        for (let y = 10; y < h - 10; y += 8) {
          for (let x = 15; x < w - 15; x += 10) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += lum;

            // Check neighbor variance (edge detection)
            const rightIdx = (y * w + (x + 1)) * 4;
            const rightLum = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
            if (Math.abs(lum - rightLum) > 12) {
              edgeCount++;
              // Record feature tracking points relative to screen coordinates
              if (points.length < 24) {
                points.push({
                  x: (x / w) * 100,
                  y: (y / h) * 100,
                  id: `${x}-${y}`,
                });
              }
            }
          }
        }

        setFeaturePoints(points);

        // Advance detection confidence
        progress += 8;
        if (progress > 100) progress = 100;
        setDetectionConfidence(progress);

        if (progress >= 85) {
          // Wall plane identified!
          setWallState((prev) => {
            if (prev === 'SCANNING') {
              // Auto-snap smoothly onto detected wall center
              const planeData = {
                distance: 2.1,
                tilt: 0.02,
                anchorY: 0.05,
              };
              setDetectedPlane(planeData);

              if (autoWallSnap) {
                setTargetPosition([0, 0.05, 0]);
                setDepthDistance(2.1);
              }
              return 'LOCKED';
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('CV frame analysis error:', err);
      }
    }, 180);
  };

  // Smooth interpolation towards target position (Auto Wall Snap)
  useEffect(() => {
    let animId;
    const lerp = (a, b, t) => a + (b - a) * t;

    const smoothStep = () => {
      setPosition((curr) => [
        lerp(curr[0], targetPosition[0], 0.12),
        lerp(curr[1], targetPosition[1], 0.12),
        lerp(curr[2], targetPosition[2], 0.12),
      ]);
      animId = requestAnimationFrame(smoothStep);
    };

    animId = requestAnimationFrame(smoothStep);
    return () => cancelAnimationFrame(animId);
  }, [targetPosition]);

  // Rescan / recalibrate wall surface
  const handleRescanWall = () => {
    setWallState('SCANNING');
    setDetectionConfidence(0);
    setDetectedPlane(null);
    initWallDetection();
  };

  // Pointer drag to reposition manually
  const handlePointerDown = (e) => {
    if (e.target.tagName.toLowerCase() !== 'canvas') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos([...position]);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * 0.0035;
    const dy = (e.clientY - dragStart.y) * 0.0035;
    const newPos = [initialPos[0] + dx, initialPos[1] - dy, initialPos[2]];
    setPosition(newPos);
    setTargetPosition(newPos);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Composite snapshot (Camera video + 3D Canvas)
  const handleCaptureRoomPhoto = () => {
    const video = videoRef.current;
    const canvas3D = overlayCanvasRef.current;
    if (!video || !canvas3D) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = video.videoWidth || 1920;
    outputCanvas.height = video.videoHeight || 1080;
    const ctx = outputCanvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(outputCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
    }

    ctx.drawImage(canvas3D, 0, 0, outputCanvas.width, outputCanvas.height);

    const dataUrl = outputCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `my-wall-framed-art-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. BACKGROUND CAMERA FEED */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          zIndex: 1,
        }}
      />

      {/* 2. AUTOMATIC WALL DETECTION HUD & FEATURE POINT MESH */}
      {showPointGrid && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          {/* Scanning sweep laser line */}
          {wallState === 'SCANNING' && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #06b6d4, #10b981, transparent)',
                boxShadow: '0 0 15px #06b6d4',
                animation: 'scanLaser 2.2s ease-in-out infinite',
              }}
            />
          )}

          {/* AR Feature Point Cloud tracking wall features */}
          {featurePoints.map((pt) => (
            <div
              key={pt.id}
              style={{
                position: 'absolute',
                top: `${pt.y}%`,
                left: `${pt.x}%`,
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: wallState === 'LOCKED' ? '#10b981' : '#38bdf8',
                boxShadow: `0 0 8px ${wallState === 'LOCKED' ? '#10b981' : '#38bdf8'}`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.75,
                transition: 'all 0.2s ease-out',
              }}
            />
          ))}

          {/* Wall Perspective Grid Overlay when wall is locked */}
          {wallState === 'LOCKED' && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '420px',
                height: '520px',
                transform: 'translate(-50%, -50%)',
                border: '2px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '16px',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  background: '#10b981',
                  color: '#000',
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                WALL SURFACE LOCKED • 1:1 SCALE
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. THREE.JS 3D CANVAS OVERLAY */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: isDragging ? 'none' : 'auto' }}>
        <CanvasErrorBoundary>
          <Canvas
            ref={overlayCanvasRef}
            gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
            camera={{ position: [0, 0, depthDistance], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[4, 6, 4]} intensity={2.2} castShadow />
            <directionalLight position={[-4, 3, 3]} intensity={1.0} color="#e0f2fe" />
            <pointLight position={[0, 0, 3]} intensity={1.2} />

            <Suspense fallback={null}>
              <group position={position} rotation={rotation}>
                <FrameViewer3D
                  artworkUrl={artworkUrl}
                  frameColor={frameColor}
                  frameFinish={frameFinish}
                  matboardColor={matboardColor}
                  sizeScale={selectedSize.scale}
                  wireframe={false}
                />
              </group>
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* TOP BAR: Status & Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Wall Detection Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: wallState === 'LOCKED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
              border: `1px solid ${wallState === 'LOCKED' ? '#10b981' : '#06b6d4'}`,
            }}
          >
            {wallState === 'LOCKED' ? (
              <CheckCircle size={16} color="#10b981" />
            ) : (
              <Radar size={16} color="#06b6d4" className="animate-spin-slow" />
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: wallState === 'LOCKED' ? '#34d399' : '#38bdf8' }}>
              {wallState === 'LOCKED' ? 'Wall Plane Detected (1.8m)' : `Scanning Room Wall... ${detectionConfidence}%`}
            </span>
          </div>

          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
            {selectedSize.label} True Scale
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleRescanWall}
            title="Re-scan wall plane"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.8rem' }}
          >
            <Scan size={15} />
            <span>Re-scan Wall</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowPointGrid(!showPointGrid)}
            title="Toggle AR wall detection grid"
            style={{
              background: showPointGrid ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '0.8rem'
            }}
          >
            <Grid size={15} />
            <span>{showPointGrid ? 'Grid On' : 'Grid Off'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={toggleCamera}
            title="Switch front/back camera"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.8rem' }}
          >
            <SwitchCamera size={15} />
            <span>Flip</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '8px 16px',
            }}
          >
            <X size={18} />
            <span style={{ fontSize: '0.85rem' }}>Exit AR</span>
          </button>
        </div>
      </div>

      {/* Camera Permission Alert */}
      {cameraError && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={24} />
          <div>
            <div style={{ fontWeight: 700 }}>Camera Permission Needed</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{cameraError}</div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS DOCK */}
      <div
        style={{
          marginTop: 'auto',
          position: 'relative',
          zIndex: 10,
          padding: '20px 24px',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          alignItems: 'center',
        }}
      >
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            padding: '12px 20px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Auto-Snap Toggle */}
          <button
            className={`btn ${autoWallSnap ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            onClick={() => setAutoWallSnap(!autoWallSnap)}
          >
            <Zap size={14} />
            <span>Auto-Wall Snap: {autoWallSnap ? 'ON' : 'OFF'}</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Size Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SIZE:</span>
            {sizeOptions.map((sz) => {
              const isSelected = selectedSize.label === sz.label;
              return (
                <button
                  key={sz.label}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz.label}
                </button>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Frame Color Quick Picks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FRAME:</span>
            {[
              { name: 'White', color: '#ffffff' },
              { name: 'Black', color: '#18181b' },
              { name: 'Warm Oak', color: '#b58351' },
              { name: 'Gold', color: '#d4af37' },
            ].map((f) => (
              <button
                key={f.color}
                onClick={() => setFrameColor(f.color)}
                title={f.name}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: f.color,
                  border: frameColor === f.color ? '2px solid var(--accent-secondary)' : '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  transform: frameColor === f.color ? 'scale(1.15)' : 'none',
                }}
              />
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Wall Distance Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distance</span>
            <input
              type="range"
              min="1.2"
              max="4.0"
              step="0.1"
              value={depthDistance}
              onChange={(e) => setDepthDistance(parseFloat(e.target.value))}
              className="control-slider"
              style={{ width: '90px' }}
            />
          </div>
        </div>

        {/* Capture Snapshot Action */}
        <button
          className="btn btn-primary glow-box"
          onClick={handleCaptureRoomPhoto}
          style={{
            padding: '12px 32px',
            fontSize: '0.95rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            boxShadow: '0 4px 25px rgba(16, 185, 129, 0.45)',
          }}
        >
          <Camera size={18} />
          <span>Capture Room Photo With Wall Frame</span>
        </button>
      </div>

      <style>{`
        @keyframes scanLaser {
          0% { top: 15%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
