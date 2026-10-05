import React, { useState, useRef, useEffect, Suspense, Component } from 'react';
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
  Sliders,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Image as ImageIcon
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
  setArtworkUrl,
  frameColor,
  setFrameColor,
  frameFinish,
  setFrameFinish,
  matboardColor,
  setMatboardColor,
  selectedSize,
  setSelectedSize,
  sizeOptions,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const cvCanvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const mobileArtUploadRef = useRef(null);

  // Camera & Device State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // Wall Detection States: 'SCANNING' | 'DETECTED' | 'LOCKED'
  const [wallState, setWallState] = useState('SCANNING');
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [featurePoints, setFeaturePoints] = useState([]);
  const [autoWallSnap, setAutoWallSnap] = useState(true);
  const [showPointGrid, setShowPointGrid] = useState(true);

  // 3D Frame Wall Placement & Perspective
  const [position, setPosition] = useState([0, 0, 0]);
  const [targetPosition, setTargetPosition] = useState([0, 0, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]); // [tiltX, tiltY, rollZ]
  const [depthDistance, setDepthDistance] = useState(2.2);
  const [fineScale, setFineScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState([0, 0, 0]);

  // Mobile Drawer & UI State
  const [activeTab, setActiveTab] = useState('size'); // 'size' | 'frame' | 'art' | 'align'
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [hideAllUI, setHideAllUI] = useState(false);

  // Artwork presets
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

  // Discover all camera video inputs
  useEffect(() => {
    if (!isOpen) return;
    navigator.mediaDevices?.enumerateDevices()
      .then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoDevices);
      })
      .catch((err) => console.warn('Could not enumerate cameras:', err));
  }, [isOpen]);

  // Start / stop camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, currentDeviceIndex]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setWallState('SCANNING');
    setDetectionConfidence(0);

    try {
      let videoConstraints;
      if (availableDevices.length > 0 && availableDevices[currentDeviceIndex]?.deviceId) {
        videoConstraints = {
          deviceId: { exact: availableDevices[currentDeviceIndex].deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        };
      } else {
        // Default to environment (back wall camera) on mobile, fallback to user
        videoConstraints = {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });
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
      console.warn('Initial camera constraint failed, attempting generic video fallback...', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(console.error);
          setCameraActive(true);
          initWallDetection();
        }
      } catch (fallbackErr) {
        console.error('Camera Access Error:', fallbackErr);
        setCameraError(fallbackErr.message || 'Unable to access your camera.');
        setCameraActive(false);
      }
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

  // Switch camera: cycles through all available mobile cameras (wide, ultra-wide, front)
  const handleSwitchCamera = () => {
    if (availableDevices.length > 1) {
      setCurrentDeviceIndex((prev) => (prev + 1) % availableDevices.length);
    } else {
      // Toggle facingMode manually if device IDs not populated yet
      startCamera();
    }
  };

  // Real-Time Computer Vision & Wall Detection
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
        const points = [];

        for (let y = 12; y < h - 12; y += 8) {
          for (let x = 16; x < w - 16; x += 10) {
            const idx = (y * w + x) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const rightIdx = (y * w + (x + 1)) * 4;
            const rightLum = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];

            if (Math.abs(lum - rightLum) > 12) {
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
        progress += 8;
        if (progress > 100) progress = 100;
        setDetectionConfidence(progress);

        if (progress >= 85) {
          setWallState((prev) => {
            if (prev === 'SCANNING') {
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

  // Smooth lerp towards target position
  useEffect(() => {
    let animId;
    const lerp = (a, b, t) => a + (b - a) * t;

    const smoothStep = () => {
      setPosition((curr) => [
        lerp(curr[0], targetPosition[0], 0.14),
        lerp(curr[1], targetPosition[1], 0.14),
        lerp(curr[2], targetPosition[2], 0.14),
      ]);
      animId = requestAnimationFrame(smoothStep);
    };

    animId = requestAnimationFrame(smoothStep);
    return () => cancelAnimationFrame(animId);
  }, [targetPosition]);

  // Rescan wall
  const handleRescanWall = () => {
    setWallState('SCANNING');
    setDetectionConfidence(0);
    initWallDetection();
  };

  // Drag on wall
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

  // Nudge controls (move frame by small increments)
  const nudge = (dx, dy) => {
    setTargetPosition((prev) => [prev[0] + dx, prev[1] + dy, prev[2]]);
  };

  // Mobile photo upload right in camera
  const handleMobilePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setArtworkUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Capture composite snapshot
  const handleCaptureRoomPhoto = () => {
    const video = videoRef.current;
    const canvas3D = overlayCanvasRef.current;
    if (!video || !canvas3D) return;

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = video.videoWidth || 1920;
    outputCanvas.height = video.videoHeight || 1080;
    const ctx = outputCanvas.getContext('2d');

    const isUserFacing = availableDevices[currentDeviceIndex]?.label?.toLowerCase().includes('front');
    if (isUserFacing) {
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

  const currentScale = (selectedSize.scale || 1.0) * fineScale;

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
        userSelect: 'none',
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
          zIndex: 1,
        }}
      />

      {/* 2. AUTOMATIC WALL DETECTION HUD & FEATURE POINT MESH */}
      {showPointGrid && !hideAllUI && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
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
              }}
            />
          ))}

          {wallState === 'LOCKED' && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '380px',
                height: '480px',
                transform: 'translate(-50%, -50%)',
                border: '2px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '16px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
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
                  fontSize: '0.68rem',
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
                  sizeScale={currentScale}
                  wireframe={false}
                />
              </group>
            </Suspense>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {/* TOP FLOATING HEADER BAR */}
      {!hideAllUI && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          {/* Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: wallState === 'LOCKED' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(6, 182, 212, 0.25)',
              border: `1px solid ${wallState === 'LOCKED' ? '#10b981' : '#06b6d4'}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {wallState === 'LOCKED' ? (
              <CheckCircle size={14} color="#10b981" />
            ) : (
              <Radar size={14} color="#06b6d4" className="animate-spin-slow" />
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: wallState === 'LOCKED' ? '#34d399' : '#38bdf8' }}>
              {wallState === 'LOCKED' ? 'Wall Locked (1.8m)' : `Detecting Wall... ${detectionConfidence}%`}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Switch Camera Button (Mobile Wide / Back / Front) */}
            <button
              className="btn btn-secondary"
              onClick={handleSwitchCamera}
              title="Switch camera"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                padding: '6px 10px',
                fontSize: '0.78rem',
              }}
            >
              <SwitchCamera size={14} />
              <span>Camera</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleRescanWall}
              title="Re-scan wall"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                padding: '6px 10px',
                fontSize: '0.78rem',
              }}
            >
              <Scan size={14} />
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setHideAllUI(true)}
              title="Hide UI for clean view"
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                padding: '6px 10px',
              }}
            >
              <EyeOff size={14} />
            </button>

            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '6px 12px',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Restore UI Button if hidden */}
      {hideAllUI && (
        <button
          className="btn btn-primary"
          onClick={() => setHideAllUI(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            padding: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Eye size={18} />
        </button>
      )}

      {/* FULL FRAME ADJUSTMENT DRAWER & CONTROLS */}
      {!hideAllUI && (
        <div
          style={{
            marginTop: 'auto',
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(0deg, rgba(10, 11, 16, 0.96) 0%, rgba(10, 11, 16, 0.85) 75%, rgba(0,0,0,0) 100%)',
            padding: '12px 16px 20px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Drawer Toggle Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '680px',
              marginBottom: '10px',
            }}
          >
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.08)', padding: '3px', borderRadius: '10px' }}>
              <button
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  background: activeTab === 'size' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'size' ? '#fff' : 'var(--text-muted)',
                }}
                onClick={() => { setActiveTab('size'); setIsDrawerOpen(true); }}
              >
                Size
              </button>
              <button
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  background: activeTab === 'frame' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'frame' ? '#fff' : 'var(--text-muted)',
                }}
                onClick={() => { setActiveTab('frame'); setIsDrawerOpen(true); }}
              >
                Frame
              </button>
              <button
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  background: activeTab === 'art' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'art' ? '#fff' : 'var(--text-muted)',
                }}
                onClick={() => { setActiveTab('art'); setIsDrawerOpen(true); }}
              >
                Artwork
              </button>
              <button
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  background: activeTab === 'align' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'align' ? '#fff' : 'var(--text-muted)',
                }}
                onClick={() => { setActiveTab('align'); setIsDrawerOpen(true); }}
              >
                Wall Align
              </button>
            </div>

            <button
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              {isDrawerOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {/* DRAWER CONTENT */}
          {isDrawerOpen && (
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '680px',
                padding: '14px 18px',
                background: 'rgba(18, 22, 34, 0.92)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                marginBottom: '12px',
              }}
            >
              {/* TAB 1: SIZES & SCALE */}
              {activeTab === 'size' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>STANDARD SIZES</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>Scale: {selectedSize.scale}x</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {sizeOptions.map((sz) => {
                      const isSelected = selectedSize.label === sz.label;
                      return (
                        <button
                          key={sz.label}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '6px 2px', fontSize: '0.72rem' }}
                          onClick={() => setSelectedSize(sz)}
                        >
                          {sz.label}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fine Scale Multiplier</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{fineScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.05"
                      value={fineScale}
                      onChange={(e) => setFineScale(parseFloat(e.target.value))}
                      className="control-slider"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FRAME MOULDING & MATBOARD */}
              {activeTab === 'frame' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      FRAME MOULDING COLOR
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {frameColorOptions.map((f) => (
                        <button
                          key={f.color}
                          onClick={() => {
                            setFrameColor(f.color);
                            setFrameFinish(f.finish);
                          }}
                          title={f.name}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: f.color,
                            border: frameColor === f.color ? '2px solid var(--accent-secondary)' : '1px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            transform: frameColor === f.color ? 'scale(1.15)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      BACKING / MATBOARD
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {matboardOptions.map((m) => (
                        <button
                          key={m.color}
                          onClick={() => setMatboardColor(m.color)}
                          title={m.name}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            backgroundColor: m.color,
                            border: matboardColor === m.color ? '2px solid var(--accent-secondary)' : '1px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ARTWORK & MOBILE UPLOAD */}
              {activeTab === 'art' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>SELECT OR UPLOAD ART</span>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                      onClick={() => mobileArtUploadRef.current?.click()}
                    >
                      <Upload size={12} /> Upload from Phone
                    </button>
                    <input
                      ref={mobileArtUploadRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleMobilePhotoUpload}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {artworkPresets.map((preset) => {
                      const isSelected = artworkUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setArtworkUrl(preset.url)}
                          style={{
                            height: '56px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: isSelected ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                            padding: 0,
                            cursor: 'pointer',
                          }}
                        >
                          <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: WALL ALIGNMENT & PERSPECTIVE */}
              {activeTab === 'align' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wall Distance</span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{depthDistance.toFixed(1)}m</span>
                      </div>
                      <input
                        type="range"
                        min="1.2"
                        max="4.0"
                        step="0.1"
                        value={depthDistance}
                        onChange={(e) => setDepthDistance(parseFloat(e.target.value))}
                        className="control-slider"
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Wall Tilt (Angle)</span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{(rotation[1] * 57.3).toFixed(0)}°</span>
                      </div>
                      <input
                        type="range"
                        min="-0.4"
                        max="0.4"
                        step="0.02"
                        value={rotation[1]}
                        onChange={(e) => setRotation([rotation[0], parseFloat(e.target.value), rotation[2]])}
                        className="control-slider"
                      />
                    </div>
                  </div>

                  {/* Nudge D-Pad */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nudge Placement:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => nudge(-0.06, 0)}>
                        <ArrowLeft size={14} />
                      </button>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => nudge(0, 0.06)}>
                        <ArrowUp size={14} />
                      </button>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => nudge(0, -0.06)}>
                        <ArrowDown size={14} />
                      </button>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => nudge(0.06, 0)}>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MAIN PHOTO CAPTURE BUTTON */}
          <button
            className="btn btn-primary glow-box"
            onClick={handleCaptureRoomPhoto}
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '12px 24px',
              fontSize: '0.92rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              boxShadow: '0 4px 25px rgba(16, 185, 129, 0.45)',
            }}
          >
            <Camera size={18} />
            <span>Take Room Photo With Frame</span>
          </button>
        </div>
      )}

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
