import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function LoadedGLBModel({ url, wireframe, onStatsLoaded }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play default animation if available
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]].reset().fadeIn(0.5).play();
    }
    return () => {
      names.forEach((name) => {
        if (actions[name]) actions[name].stop();
      });
    };
  }, [actions, names]);

  useEffect(() => {
    if (!scene) return;

    let vertices = 0;
    let triangles = 0;
    let meshes = 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        meshes++;
        child.castShadow = true;
        child.receiveShadow = true;

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

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.wireframe = wireframe;
              mat.needsUpdate = true;
            });
          } else {
            child.material.wireframe = wireframe;
            child.material.needsUpdate = true;
          }
        }
      }
    });

    // Compute bounding box for auto-scaling
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 3.5 / maxDim : 1;

    if (onStatsLoaded) {
      onStatsLoaded({
        meshes,
        vertices,
        triangles: Math.round(triangles),
        dimensions: {
          x: size.x.toFixed(2),
          y: size.y.toFixed(2),
          z: size.z.toFixed(2),
        },
        animationsCount: names.length,
        animationNames: names,
      });
    }
  }, [scene, wireframe, onStatsLoaded, names]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
