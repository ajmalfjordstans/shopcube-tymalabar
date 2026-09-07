'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createRadialTexture } from '@/lib/particleTexture';

const SPICE_COLORS = [
  [138, 122, 63],  // cardamom olive
  [140, 92, 54],   // cinnamon brown
  [45, 33, 28],    // star anise near-black
  [214, 108, 47],  // saffron / paprika
];

export default function ParticleBackdrop() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#601131');
    scene.fog = new THREE.FogExp2('#601131', 0.05);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 60);
    camera.position.set(0, 0.2, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // spice: sparse, colored, slow ambient drift
    const spiceCount = 420;
    const spiceGeo = new THREE.BufferGeometry();
    const spiceAttrArray = new Float32Array(spiceCount * 3);
    const spiceBase = new Float32Array(spiceCount * 3);
    const spiceColor = new Float32Array(spiceCount * 3);
    const spicePhase = new Float32Array(spiceCount);
    for (let i = 0; i < spiceCount; i++) {
      const r = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      spiceBase[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      spiceBase[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      spiceBase[i * 3 + 2] = r * Math.cos(phi) - 3;
      spicePhase[i] = Math.random() * Math.PI * 2;
      const c = SPICE_COLORS[i % SPICE_COLORS.length];
      spiceColor[i * 3] = c[0] / 255;
      spiceColor[i * 3 + 1] = c[1] / 255;
      spiceColor[i * 3 + 2] = c[2] / 255;
    }
    spiceGeo.setAttribute('position', new THREE.BufferAttribute(spiceAttrArray, 3));
    spiceGeo.setAttribute('color', new THREE.BufferAttribute(spiceColor, 3));
    const dotTexture = createRadialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
    const spiceMat = new THREE.PointsMaterial({
      size: 0.18,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const spicePoints = new THREE.Points(spiceGeo, spiceMat);
    scene.add(spicePoints);

    // rice: dense, fine, slowly turning field
    const riceCount = 1600;
    const riceGeo = new THREE.BufferGeometry();
    const riceAttrArray = new Float32Array(riceCount * 3);
    const riceAngle = new Float32Array(riceCount);
    const riceRadius = new Float32Array(riceCount);
    const riceY = new Float32Array(riceCount);
    const riceSpeed = new Float32Array(riceCount);
    for (let i = 0; i < riceCount; i++) {
      riceAngle[i] = Math.random() * Math.PI * 2;
      riceRadius[i] = 1 + Math.random() * 6;
      riceY[i] = (Math.random() - 0.5) * 6;
      riceSpeed[i] = 0.02 + Math.random() * 0.05;
    }
    riceGeo.setAttribute('position', new THREE.BufferAttribute(riceAttrArray, 3));
    const riceTexture = createRadialTexture('rgba(241,238,208,1)', 'rgba(241,238,208,0)');
    const riceMat = new THREE.PointsMaterial({
      size: 0.055,
      map: riceTexture,
      color: '#F1EED0',
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const ricePoints = new THREE.Points(riceGeo, riceMat);
    scene.add(ricePoints);

    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFrac = scrollMax > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollMax)) : 0;

      const spicePosAttr = spiceGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < spiceCount; i++) {
        const bx = spiceBase[i * 3];
        const by = spiceBase[i * 3 + 1];
        const bz = spiceBase[i * 3 + 2];
        const jx = Math.sin(t * 0.15 + spicePhase[i]) * 0.3;
        const jy = Math.cos(t * 0.12 + spicePhase[i]) * 0.3;
        spicePosAttr.setXYZ(i, bx + jx, by + jy, bz);
      }
      spicePosAttr.needsUpdate = true;

      const ricePosAttr = riceGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < riceCount; i++) {
        const angle = riceAngle[i] + t * riceSpeed[i];
        const radius = riceRadius[i];
        const y = riceY[i] + Math.sin(t * 0.2 + riceAngle[i]) * 0.15;
        ricePosAttr.setXYZ(i, Math.cos(angle) * radius, y, Math.sin(angle) * radius - 4);
      }
      ricePosAttr.needsUpdate = true;

      camera.position.y = 0.2 - scrollFrac * 0.6;
      spicePoints.rotation.y = t * 0.01 + scrollFrac * 0.4;
      ricePoints.rotation.y = -t * 0.015 - scrollFrac * 0.3;

      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      spiceGeo.dispose();
      riceGeo.dispose();
      spiceMat.dispose();
      riceMat.dispose();
      dotTexture.dispose();
      riceTexture.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" aria-hidden="true" />;
}
