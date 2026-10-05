import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows, Grid, Html } from '@react-three/drei';
import { FrameViewer3D } from './FrameViewer3D';
import { LoadedGLBModel } from './LoadedGLBModel';
import { CyberOrb, TorusKnotPreset, MonolithPreset, QuantumCorePreset } from './ProceduralModels';
import { Loader2, AlertCircle } from 'lucide-react';

function CanvasLoader() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}>
        <Loader2 className="animate-spin" size={28} color="#6366f1" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          LOADING 18x24 3D FRAME...
        </span>
      </div>
    </Html>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("3D View Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '20px',
            background: 'rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(12px)',
            borderRadius: '14px',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            textAlign: 'center',
            maxWidth: '300px'
          }}>
            <AlertCircle size={24} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Error rendering 3D frame</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Please verify the GLB frame assets.</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

export function ModelViewer({
  viewMode = 'frame', // 'frame' | 'custom' | 'preset'
  modelType,
  customModelUrl,
  artworkUrl,
  frameColor,
  frameFinish,
  matboardColor,
  sizeScale = 1,
  wireframe,
  autoRotate,
  autoRotateSpeed,
  metalness,
  roughness,
  lightingPreset,
  showGrid,
  showShadows,
  backgroundColor,
  onStatsLoaded,
  canvasRef,
}) {
  const controlsRef = useRef();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: backgroundColor }}>
      <Canvas
        ref={canvasRef}
        shadows
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls
          ref={controlsRef}
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          enableDamping
          dampingFactor={0.05}
          maxDistance={12}
          minDistance={1.0}
        />

        {/* Dynamic Lighting Setup */}
        {lightingPreset === 'cyberpunk' ? (
          <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[6, 8, 5]} intensity={2.2} color="#f43f5e" />
            <directionalLight position={[-6, -4, -4]} intensity={2.4} color="#06b6d4" />
            <pointLight position={[0, 2, 3]} intensity={2.5} color="#c084fc" />
          </>
        ) : lightingPreset === 'sunset' ? (
          <>
            <ambientLight intensity={0.6} color="#fed7aa" />
            <directionalLight position={[6, 8, 4]} intensity={2.8} color="#f97316" castShadow />
            <directionalLight position={[-6, 3, -3]} intensity={1.2} color="#ec4899" />
            <pointLight position={[0, 1, 3]} intensity={1.5} color="#fbbf24" />
          </>
        ) : lightingPreset === 'dawn' ? (
          <>
            <ambientLight intensity={0.7} color="#c7d2fe" />
            <directionalLight position={[5, 8, 4]} intensity={2.0} color="#818cf8" castShadow />
            <directionalLight position={[-5, 2, -4]} intensity={1} color="#38bdf8" />
          </>
        ) : (
          /* Studio Neutral Preset */
          <>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 6, 5]} intensity={1.8} castShadow />
            <directionalLight position={[-5, 4, 3]} intensity={1.2} color="#e2e8f0" />
            <directionalLight position={[0, -4, 2]} intensity={0.4} color="#94a3b8" />
          </>
        )}

        <ErrorBoundary>
          <Suspense fallback={<CanvasLoader />}>
            <Center top>
              {viewMode === 'frame' ? (
                <FrameViewer3D
                  artworkUrl={artworkUrl}
                  frameColor={frameColor}
                  frameFinish={frameFinish}
                  matboardColor={matboardColor}
                  wireframe={wireframe}
                  sizeScale={sizeScale}
                  onStatsLoaded={onStatsLoaded}
                />
              ) : customModelUrl ? (
                <LoadedGLBModel
                  key={customModelUrl}
                  url={customModelUrl}
                  wireframe={wireframe}
                  onStatsLoaded={onStatsLoaded}
                />
              ) : modelType === 'knot' ? (
                <TorusKnotPreset wireframe={wireframe} metalness={metalness} roughness={roughness} />
              ) : modelType === 'monolith' ? (
                <MonolithPreset wireframe={wireframe} metalness={metalness} roughness={roughness} />
              ) : modelType === 'quantum' ? (
                <QuantumCorePreset wireframe={wireframe} metalness={metalness} roughness={roughness} />
              ) : (
                <CyberOrb wireframe={wireframe} metalness={metalness} roughness={roughness} />
              )}
            </Center>
          </Suspense>
        </ErrorBoundary>

        {showShadows && (
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.5}
            scale={6}
            blur={1.8}
            far={3.0}
          />
        )}

        {showGrid && (
          <Grid
            position={[0, -1.21, 0]}
            args={[10, 10]}
            cellSize={0.25}
            cellThickness={0.8}
            cellColor="#4f46e5"
            sectionSize={1.25}
            sectionThickness={1.2}
            sectionColor="#818cf8"
            fadeDistance={10}
            fadeStrength={1.5}
          />
        )}
      </Canvas>
    </div>
  );
}
