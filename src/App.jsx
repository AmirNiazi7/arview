import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { ModelViewer } from './components/ModelViewer';
import { FrameCustomizer } from './components/FrameCustomizer';
import { ControlPanel } from './components/ControlPanel';
import { ModelInfoHud } from './components/ModelInfoHud';
import { ARViewModal } from './components/ARViewModal';
import { WebcamWallAR } from './components/WebcamWallAR';
import { FeatureShowcase } from './components/FeatureShowcase';
import { CodeSnippetViewer } from './components/CodeSnippetViewer';
import { Footer } from './components/Footer';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const SIZE_OPTIONS = [
  { label: '12" × 16"', scale: 0.67, width: 12, height: 16 },
  { label: '18" × 24"', scale: 1.0, width: 18, height: 24 }, // Base GLB Model Size
  { label: '24" × 32"', scale: 1.33, width: 24, height: 32 },
  { label: '30" × 40"', scale: 1.67, width: 30, height: 40 },
  { label: '36" × 48"', scale: 2.0, width: 36, height: 48 },
];

export function App() {
  // Modes
  const [viewMode, setViewMode] = useState('frame'); // 'frame' | 'preset' | 'custom'
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [isLaptopAROpen, setIsLaptopAROpen] = useState(false);

  // Frame Customizer State (white-portrait-frame-18x24.glb)
  const [artworkUrl, setArtworkUrl] = useState('/art/palms-paradise.svg');
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [frameFinish, setFrameFinish] = useState({ roughness: 0.7, metalness: 0.05 });
  const [matboardColor, setMatboardColor] = useState('#ffffff');
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[1]); // 18x24 default

  // Procedural / Custom Model State
  const [modelType, setModelType] = useState('cyber');
  const [customModelUrl, setCustomModelUrl] = useState(null);
  const [modelFileName, setModelFileName] = useState('');
  const [modelStats, setModelStats] = useState(null);

  // 3D Scene Controls
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(1.2);
  const [metalness, setMetalness] = useState(0.85);
  const [roughness, setRoughness] = useState(0.2);
  const [lightingPreset, setLightingPreset] = useState('studio');
  const [showGrid, setShowGrid] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#0a0b10');

  // Toasts
  const [toasts, setToasts] = useState([]);
  const canvasRef = useRef(null);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // ElephantStock-style URL parameter listener for mobile QR scanning
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ar') === '1') {
      setIsLaptopAROpen(true);
      addToast('Launching Live Room AR Camera...', 'success');
      const sizeParam = params.get('size');
      if (sizeParam) {
        const found = SIZE_OPTIONS.find((s) => s.label.includes(sizeParam) || s.label === sizeParam);
        if (found) setSelectedSize(found);
      }
      const colorParam = params.get('frameColor');
      if (colorParam) {
        setFrameColor(colorParam);
      }
    }
  }, []);

  // Snapshot Exporter
  const handleTakeSnapshot = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        addToast('Canvas element not found for snapshot', 'error');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `framed-art-${selectedSize.label.replace(/"/g, '')}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      addToast('Render captured and saved as high-res PNG!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export canvas snapshot', 'error');
    }
  };

  const handleOpenLaptopCamera = () => {
    setIsLaptopAROpen(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Navigation Header */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAR={() => setIsARModalOpen(true)}
        onOpenLaptopCamera={handleOpenLaptopCamera}
        onTakeSnapshot={handleTakeSnapshot}
      />

      {/* Main 3D Viewport Studio */}
      <main style={{ position: 'relative', height: '82vh', width: '100%', overflow: 'hidden' }}>
        <ModelViewer
          canvasRef={canvasRef}
          viewMode={viewMode}
          modelType={modelType}
          customModelUrl={customModelUrl}
          artworkUrl={artworkUrl}
          frameColor={frameColor}
          frameFinish={frameFinish}
          matboardColor={matboardColor}
          sizeScale={selectedSize.scale}
          wireframe={wireframe}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          metalness={metalness}
          roughness={roughness}
          lightingPreset={lightingPreset}
          showGrid={showGrid}
          showShadows={showShadows}
          backgroundColor={backgroundColor}
          onStatsLoaded={setModelStats}
        />

        {/* Left Side: Frame Customizer Panel (when in Frame mode) */}
        {viewMode === 'frame' && (
          <FrameCustomizer
            artworkUrl={artworkUrl}
            setArtworkUrl={(url) => {
              setArtworkUrl(url);
              addToast('Updated artwork print texture!', 'info');
            }}
            frameColor={frameColor}
            setFrameColor={setFrameColor}
            frameFinish={frameFinish}
            setFrameFinish={setFrameFinish}
            matboardColor={matboardColor}
            setMatboardColor={setMatboardColor}
            selectedSize={selectedSize}
            setSelectedSize={(sz) => {
              setSelectedSize(sz);
              addToast(`Calibrated frame size to ${sz.label} (Scale: ${sz.scale}x)`, 'info');
            }}
            sizeOptions={SIZE_OPTIONS}
            onOpenAR={() => setIsARModalOpen(true)}
            onOpenLaptopCamera={handleOpenLaptopCamera}
            onTakeSnapshot={handleTakeSnapshot}
          />
        )}

        {/* Right Side: Studio Lighting & Camera Controls */}
        <ControlPanel
          wireframe={wireframe}
          setWireframe={setWireframe}
          autoRotate={autoRotate}
          setAutoRotate={setAutoRotate}
          autoRotateSpeed={autoRotateSpeed}
          setAutoRotateSpeed={setAutoRotateSpeed}
          metalness={metalness}
          setMetalness={setMetalness}
          roughness={roughness}
          setRoughness={setRoughness}
          lightingPreset={lightingPreset}
          setLightingPreset={setLightingPreset}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showShadows={showShadows}
          setShowShadows={setShowShadows}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
        />

        {/* Bottom Telemetry HUD */}
        <ModelInfoHud
          stats={modelStats}
          modelFileName={viewMode === 'frame' ? `18x24 Frame (${selectedSize.label})` : modelFileName}
          currentPreset={viewMode === 'frame' ? '18x24 FRAME' : modelType}
        />
      </main>

      {/* 1. DIRECT LAPTOP WEBCAM LIVE AR WALL VIEW */}
      <WebcamWallAR
        isOpen={isLaptopAROpen}
        onClose={() => setIsLaptopAROpen(false)}
        artworkUrl={artworkUrl}
        setArtworkUrl={setArtworkUrl}
        frameColor={frameColor}
        setFrameColor={setFrameColor}
        frameFinish={frameFinish}
        setFrameFinish={setFrameFinish}
        matboardColor={matboardColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        sizeOptions={SIZE_OPTIONS}
      />

      {/* 2. AR MODAL (WebXR & Local Network QR Code) */}
      <ARViewModal
        isOpen={isARModalOpen}
        onClose={() => setIsARModalOpen(false)}
        artworkUrl={artworkUrl}
        frameColor={frameColor}
        frameFinish={frameFinish}
        selectedSize={selectedSize}
        sizeScale={selectedSize.scale}
        onOpenLaptopAR={handleOpenLaptopCamera}
      />

      {/* Feature Showcase Section */}
      <FeatureShowcase />

      {/* Code Snippet / ElephantStock Architecture Playground */}
      <CodeSnippetViewer />

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
            {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
            {t.type === 'info' && <Info size={18} color="#06b6d4" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
