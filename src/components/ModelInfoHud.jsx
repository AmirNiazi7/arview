import React from 'react';
import { Activity, Database, Box, Film, Triangle } from 'lucide-react';

export function ModelInfoHud({ stats, modelFileName, currentPreset }) {
  const isCustom = Boolean(modelFileName);

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        zIndex: 40,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        maxWidth: 'calc(100vw - 48px)',
        overflowX: 'auto',
      }}
    >
      {/* Active Model Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          boxShadow: '0 0 10px #10b981',
        }} />
        <div>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-faint)', fontWeight: 700 }}>
            Active Geometry
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isCustom ? modelFileName : `Preset: ${currentPreset.toUpperCase()}`}
          </div>
        </div>
      </div>

      <div style={{ width: '1px', height: '28px', background: 'var(--border-subtle)' }} />

      {/* Triangles & Vertices */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Triangle size={16} color="var(--accent-primary)" />
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Triangles</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {stats?.triangles?.toLocaleString() || (currentPreset === 'knot' ? '4,096' : '1,280')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={16} color="var(--accent-secondary)" />
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vertices</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {stats?.vertices?.toLocaleString() || (currentPreset === 'knot' ? '2,176' : '642')}
          </div>
        </div>
      </div>

      {stats?.animationsCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={16} color="var(--accent-purple)" />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Animations</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {stats.animationsCount} tracks
            </div>
          </div>
        </div>
      )}

      {/* Render Target Engine */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={16} color="#34d399" />
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Renderer</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>WebGL2 / PBR</div>
        </div>
      </div>
    </div>
  );
}
