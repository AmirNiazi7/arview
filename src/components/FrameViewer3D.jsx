import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function FrameViewer3D({
  artworkUrl,
  frameColor,
  frameFinish,
  matboardColor,
  wireframe,
  sizeScale = 1,
  onStatsLoaded,
}) {
  const { scene } = useGLTF('/white-portrait-frame-18x24.glb');
  const frameGroupRef = useRef();

  // Clone scene so we don't mutate shared global cache
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);

  // Load and apply artwork texture
  useEffect(() => {
    if (!clonedScene) return;

    let artworkTexture = null;
    const loader = new THREE.TextureLoader();

    if (artworkUrl) {
      loader.load(artworkUrl, (texture) => {
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        artworkTexture = texture;

        clonedScene.traverse((child) => {
          if (child.isMesh && child.material) {
            // Apply to Portrait artwork material
            if (
              child.material.name === 'Portrait artwork' ||
              child.name === 'Portrait print'
            ) {
              const mat = child.material.clone();
              mat.map = texture;
              mat.needsUpdate = true;
              mat.wireframe = wireframe;
              child.material = mat;
            }
          }
        });
      });
    }

    return () => {
      if (artworkTexture) artworkTexture.dispose();
    };
  }, [clonedScene, artworkUrl, wireframe]);

  // Update frame moulding and backing board materials
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Frame Moulding
        if (
          child.material.name === 'Matte white frame' ||
          child.name === 'White bevelled frame'
        ) {
          const mat = child.material.clone();
          mat.color = new THREE.Color(frameColor);
          mat.roughness = frameFinish?.roughness ?? 0.6;
          mat.metalness = frameFinish?.metalness ?? 0.05;
          mat.wireframe = wireframe;
          mat.needsUpdate = true;
          child.material = mat;
          child.castShadow = true;
          child.receiveShadow = true;
        }

        // Backing board / Matboard
        if (
          child.material.name === 'Neutral backing' ||
          child.name === 'Backing board'
        ) {
          const mat = child.material.clone();
          if (matboardColor) {
            mat.color = new THREE.Color(matboardColor);
          }
          mat.wireframe = wireframe;
          mat.needsUpdate = true;
          child.material = mat;
          child.receiveShadow = true;
        }
      }
    });
  }, [clonedScene, frameColor, frameFinish, matboardColor, wireframe]);

  // Report statistics
  useEffect(() => {
    if (!clonedScene || !onStatsLoaded) return;

    let meshes = 0;
    let vertices = 0;
    let triangles = 0;

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        meshes++;
        if (child.geometry) {
          const geom = child.geometry;
          if (geom.attributes.position) {
            vertices += geom.attributes.position.count;
          }
          if (geom.index) {
            triangles += geom.index.count / 3;
          } else if (geom.attributes.position) {
            triangles += geom.attributes.position.count / 3;
          }
        }
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);

    onStatsLoaded({
      modelName: 'white-portrait-frame-18x24.glb',
      meshes,
      vertices,
      triangles: Math.round(triangles),
      dimensions: {
        x: (size.x * 100).toFixed(1) + ' cm',
        y: (size.y * 100).toFixed(1) + ' cm',
        z: (size.z * 100).toFixed(1) + ' cm',
      },
    });
  }, [clonedScene, onStatsLoaded]);

  return (
    <group ref={frameGroupRef} scale={[sizeScale, sizeScale, 1]} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/white-portrait-frame-18x24.glb');
