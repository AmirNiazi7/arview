import React from 'react';
import { Box, Cpu, Sparkles, Layers, ShieldCheck, Download, Code2, Gauge } from 'lucide-react';

export function FeatureShowcase() {
  const features = [
    {
      icon: Box,
      title: 'GLTF / GLB Support',
      desc: 'Seamlessly drop and inspect binary GLB and JSON GLTF 3D assets with automatic bounding-box scaling and mesh hierarchy parsing.',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    },
    {
      icon: Sparkles,
      title: 'Physically Based Rendering (PBR)',
      desc: 'Real-time environment lighting, contact shadow projections, metalness/roughness tuning, and customizable multi-point light rigs.',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    },
    {
      icon: Gauge,
      title: 'Geometry & Polycount Inspector',
      desc: 'Live telemetry reporting vertex count, triangle density, mesh hierarchy, active animation tracks, and bounding dimensions.',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      icon: Code2,
      title: 'React Three Fiber & Drei',
      desc: 'Declarative component architecture built on React 18+ and Three.js for ultra-smooth 60fps canvas performance.',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    },
    {
      icon: Download,
      title: 'High-Res Canvas Snapshot',
      desc: 'Export pristine, high-resolution PNG renders with transparent or tailored studio backdrops directly from the viewport.',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    },
    {
      icon: Layers,
      title: 'Wireframe & Scene Helpers',
      desc: 'Toggle responsive infinite ground grids, contact shadows, turntable turntable rotation speeds, and wireframe diagnostic views.',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    },
  ];

  return (
    <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '12px' }}>
          Production Ready Architecture
        </span>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Engineered for <span className="gradient-accent">3D Web Experiences</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          From prototyping game assets and architectural models to building interactive e-commerce product visualizers.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                padding: '28px',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: feat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                }}
              >
                <Icon size={24} color="#ffffff" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                {feat.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
