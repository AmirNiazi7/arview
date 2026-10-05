import React from 'react';
import { Box, Heart, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '40px 24px',
      background: 'rgba(10, 11, 16, 0.95)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
            GLB <span style={{ color: 'var(--accent-primary)' }}>Studio</span>
          </span>
        </div>

        <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem' }}>
          Built with React, Vite, Three.js, and React Three Fiber.
        </p>

        <div style={{ display: 'flex', gap: '18px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="var(--accent-secondary)" /> High-FPS WebGL Rendering
          </span>
          <span>•</span>
          <span>Zero Configuration 3D</span>
          <span>•</span>
          <span>Instant Drag & Drop</span>
        </div>
      </div>
    </footer>
  );
}
