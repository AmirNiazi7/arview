import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

export function CodeSnippetViewer() {
  const [copied, setCopied] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState('react');

  const snippets = {
    react: `// In your React Component
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
      <Stage environment="city" intensity={0.6}>
        <Model url="/assets/my-model.glb" />
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  );
}`,
    cli: `# 1. Clone or start the Vite + React Three App
npm install three @react-three/fiber @react-three/drei

# 2. Convert standard GLTF to ready React components
npx gltfjsx model.glb --transform --types

# 3. Launch the high-speed local dev server
npm run dev`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeSnippet]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section style={{ padding: '0 24px 80px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '32px', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${activeSnippet === 'react' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveSnippet('react')}
              >
                <Code2 size={14} /> React Integration
              </button>
              <button
                className={`btn ${activeSnippet === 'cli' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                onClick={() => setActiveSnippet('cli')}
              >
                <Terminal size={14} /> CLI & Optimization
              </button>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={handleCopy}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <pre
          style={{
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '20px',
            borderRadius: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: '#e2e8f0',
            overflowX: 'auto',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <code>{snippets[activeSnippet]}</code>
        </pre>
      </div>
    </section>
  );
}
