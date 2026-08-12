'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

const ACTS = [
  { start: 0.0, end: 0.18 },  // Act I — The Coast
  { start: 0.18, end: 0.36 }, // Act II — The Grain
  { start: 0.36, end: 0.62 }, // Act III — The Pot
  { start: 0.62, end: 0.82 }, // Act IV — The Reveal
  { start: 0.82, end: 1.0 },  // Act V — The Table
] as const;

const SPICE_COLORS = [
  [138, 122, 63],  // cardamom olive
  [140, 92, 54],   // cinnamon brown
  [45, 33, 28],    // star anise near-black
  [214, 108, 47],  // saffron / paprika
];

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function localProgress(global: number, start: number, end: number) {
  return clamp((global - start) / (end - start));
}

function actWindowOpacity(local: number, holdOut = true) {
  const fadeIn = smoothstep(0, 0.18, local);
  const fadeOut = holdOut ? 1 - smoothstep(0.82, 1, local) : 1;
  return clamp(fadeIn * fadeOut);
}

function createRadialTexture(rgba0: string, rgba1: string) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, rgba0);
  gradient.addColorStop(1, rgba1);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createCircularTexture(image: HTMLImageElement) {
  const size = 640;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  const ratio = Math.max(size / image.width, size / image.height);
  const w = image.width * ratio;
  const h = image.height * ratio;
  ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function BiryaniJourney() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const coastRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const potRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const spacer = spacerRef.current;
    if (!mount || !spacer) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#601131');
    scene.fog = new THREE.FogExp2('#601131', 0.045);

    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight('#fff2d9', 0.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight('#f0a429', 1.3);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ffd9a0', 0);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    // --- Act I: spice particles drifting in the void ---
    const spiceCount = 700;
    const spiceGeo = new THREE.BufferGeometry();
    const spicePos = new Float32Array(spiceCount * 3);
    const spiceBase = new Float32Array(spiceCount * 3);
    const spiceColor = new Float32Array(spiceCount * 3);
    const spicePhase = new Float32Array(spiceCount);
    for (let i = 0; i < spiceCount; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      const z = r * Math.cos(phi) - 2;
      spiceBase[i * 3] = x;
      spiceBase[i * 3 + 1] = y;
      spiceBase[i * 3 + 2] = z;
      spicePhase[i] = Math.random() * Math.PI * 2;
      const c = SPICE_COLORS[i % SPICE_COLORS.length];
      spiceColor[i * 3] = c[0] / 255;
      spiceColor[i * 3 + 1] = c[1] / 255;
      spiceColor[i * 3 + 2] = c[2] / 255;
    }
    spiceGeo.setAttribute('position', new THREE.BufferAttribute(spicePos, 3));
    spiceGeo.setAttribute('color', new THREE.BufferAttribute(spiceColor, 3));
    const spiceTexture = createRadialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
    const spiceMat = new THREE.PointsMaterial({
      size: 0.16,
      map: spiceTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const spicePoints = new THREE.Points(spiceGeo, spiceMat);
    scene.add(spicePoints);

    // --- Act II: rice spiraling inward ---
    const riceCount = 1400;
    const riceGeo = new THREE.BufferGeometry();
    const ricePos = new Float32Array(riceCount * 3);
    const riceAngle = new Float32Array(riceCount);
    const riceRadius = new Float32Array(riceCount);
    const riceY = new Float32Array(riceCount);
    const riceSpin = new Float32Array(riceCount);
    for (let i = 0; i < riceCount; i++) {
      riceAngle[i] = Math.random() * Math.PI * 2;
      riceRadius[i] = 0.6 + Math.random() * 3.2;
      riceY[i] = (Math.random() - 0.5) * 3.5;
      riceSpin[i] = 0.4 + Math.random() * 1.2;
    }
    riceGeo.setAttribute('position', new THREE.BufferAttribute(ricePos, 3));
    const riceTexture = createRadialTexture('rgba(241,238,208,1)', 'rgba(241,238,208,0)');
    const riceMat = new THREE.PointsMaterial({
      size: 0.07,
      map: riceTexture,
      color: '#F1EED0',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const ricePoints = new THREE.Points(riceGeo, riceMat);
    scene.add(ricePoints);

    // --- Act III: the handi (pot) ---
    const potProfile = [
      new THREE.Vector2(0, -1.1),
      new THREE.Vector2(0.9, -1.05),
      new THREE.Vector2(1.15, -0.6),
      new THREE.Vector2(1.1, 0.1),
      new THREE.Vector2(0.95, 0.55),
      new THREE.Vector2(1.0, 0.65),
      new THREE.Vector2(0.85, 0.7),
    ];
    const potGeo = new THREE.LatheGeometry(potProfile, 48);
    const potMat = new THREE.MeshStandardMaterial({
      color: '#b9702f',
      metalness: 0.65,
      roughness: 0.35,
      emissive: '#3a1a06',
      emissiveIntensity: 0.15,
    });
    const potMesh = new THREE.Mesh(potGeo, potMat);
    potMesh.position.set(0, -0.6, 0);
    potMesh.scale.setScalar(0.001);
    scene.add(potMesh);

    // --- Act III/IV: steam ---
    const steamCount = 260;
    const steamGeo = new THREE.BufferGeometry();
    const steamAttrArray = new Float32Array(steamCount * 3);
    const steamBaseX = new Float32Array(steamCount);
    const steamBaseZ = new Float32Array(steamCount);
    const steamBaseY = new Float32Array(steamCount);
    const steamSpeed = new Float32Array(steamCount);
    const steamDrift = new Float32Array(steamCount);
    for (let i = 0; i < steamCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.9;
      steamBaseX[i] = Math.cos(angle) * r;
      steamBaseZ[i] = Math.sin(angle) * r;
      steamBaseY[i] = -0.2 + Math.random() * 2.2;
      steamSpeed[i] = 0.25 + Math.random() * 0.35;
      steamDrift[i] = Math.random() * Math.PI * 2;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamAttrArray, 3));
    const steamTexture = createRadialTexture('rgba(255,250,240,0.9)', 'rgba(255,250,240,0)');
    const steamMat = new THREE.PointsMaterial({
      size: 0.5,
      map: steamTexture,
      color: '#fff6e8',
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const steamPoints = new THREE.Points(steamGeo, steamMat);
    scene.add(steamPoints);

    // --- Act IV: the reveal plate ---
    const revealGeo = new THREE.CircleGeometry(1.6, 64);
    const revealMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const revealMesh = new THREE.Mesh(revealGeo, revealMat);
    revealMesh.position.set(0, -0.3, 0.3);
    scene.add(revealMesh);

    const img = new Image();
    img.src = '/images/home/biryani-hero.jpg';
    img.onload = () => {
      revealMat.map = createCircularTexture(img);
      revealMat.needsUpdate = true;
    };

    const cameraKeys = {
      start: { pos: new THREE.Vector3(0, 0.2, 9), look: new THREE.Vector3(0, 0, 0) },
      coastEnd: { pos: new THREE.Vector3(0.4, 0.1, 6.5), look: new THREE.Vector3(0, 0, 0) },
      grainEnd: { pos: new THREE.Vector3(-0.3, 0.6, 4.2), look: new THREE.Vector3(0, 0, 0) },
      potEnd: { pos: new THREE.Vector3(0.2, 0.4, 3.2), look: new THREE.Vector3(0, -0.2, 0) },
      revealEnd: { pos: new THREE.Vector3(0, 0.1, 2.6), look: new THREE.Vector3(0, -0.1, 0) },
      tableEnd: { pos: new THREE.Vector3(0, -0.05, 4.4), look: new THREE.Vector3(0, -0.1, 0) },
    };

    function setText(el: HTMLDivElement | null, opacity: number) {
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
    }

    const clock = new THREE.Clock();
    let rafId = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const rect = spacer!.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? clamp(-rect.top / total) : 0;

      if (hintRef.current) {
        hintRef.current.style.opacity = String(clamp(1 - progress * 14));
      }

      const lCoast = localProgress(progress, ACTS[0].start, ACTS[0].end);
      const lGrain = localProgress(progress, ACTS[1].start, ACTS[1].end);
      const lPot = localProgress(progress, ACTS[2].start, ACTS[2].end);
      const lReveal = localProgress(progress, ACTS[3].start, ACTS[3].end);
      const lTable = localProgress(progress, ACTS[4].start, ACTS[4].end);

      // spices: drift apart through Act I, dissolve into Act II
      const spiceVisible = smoothstep(0, 0.1, progress) * (1 - smoothstep(ACTS[1].end * 0.4, ACTS[1].end, progress));
      spiceMat.opacity = spiceVisible * 0.9;
      const spicePosAttr = spiceGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < spiceCount; i++) {
        const bx = spiceBase[i * 3];
        const by = spiceBase[i * 3 + 1];
        const bz = spiceBase[i * 3 + 2];
        const spread = 1 + lCoast * 0.6;
        const jitter = Math.sin(t * 0.5 + spicePhase[i]) * 0.08;
        spicePosAttr.setXYZ(i, bx * spread + jitter, by * spread + jitter, bz * spread);
      }
      spicePosAttr.needsUpdate = true;

      // rice: spirals inward through Act II, pours toward the pot into Act III
      const riceVisible = smoothstep(0, 0.12, lGrain) * (1 - smoothstep(0.05, 0.5, lPot));
      riceMat.opacity = riceVisible;
      const ricePosAttr = riceGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < riceCount; i++) {
        const angle = riceAngle[i] + lGrain * Math.PI * riceSpin[i] + t * 0.05;
        const radius = riceRadius[i] * (1 - lGrain * 0.55) * (1 - lPot * 0.6);
        const y = riceY[i] * (1 - lGrain * 0.3) - lPot * 0.8;
        ricePosAttr.setXYZ(i, Math.cos(angle) * radius, y, Math.sin(angle) * radius - 1.5 + lGrain * 1.5);
      }
      ricePosAttr.needsUpdate = true;

      // pot: materializes early in Act III, shrinks away as the plate is revealed
      const potGrow = smoothstep(0, 0.4, lPot);
      const potShrink = 1 - smoothstep(0.15, 0.55, lReveal);
      potMesh.scale.setScalar(Math.max(0.001, potGrow * potShrink));
      potMesh.rotation.y = t * 0.06;

      // steam: builds through the back half of Act III, bursts at the start of Act IV
      const steamBuild = smoothstep(0.45, 0.9, lPot);
      const steamBurst = smoothstep(0, 0.3, lReveal) * (1 - smoothstep(0.35, 0.75, lReveal));
      steamMat.opacity = clamp(steamBuild * 0.6 + steamBurst) * 0.8;
      const steamPosAttr = steamGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < steamCount; i++) {
        const rise = (t * steamSpeed[i] + steamDrift[i]) % 2.4;
        const y = steamBaseY[i] + rise - 0.6;
        const drift = Math.sin(t * 0.6 + steamDrift[i]) * 0.15;
        steamPosAttr.setXYZ(i, steamBaseX[i] + drift, y, steamBaseZ[i] + drift * 0.5);
      }
      steamPosAttr.needsUpdate = true;

      // reveal plate: fades in through Act IV, holds into Act V
      const revealOpacity = smoothstep(0.15, 0.55, lReveal);
      revealMat.opacity = revealOpacity;
      revealMesh.scale.setScalar(0.9 + revealOpacity * 0.1);

      key.intensity = 1.3 + smoothstep(0, 0.4, lReveal) * 2.4;
      rim.intensity = smoothstep(0.5, 1, lPot) * 1.4 + smoothstep(0, 0.5, lReveal) * 1.1;

      const camPos = cameraKeys.start.pos.clone();
      const camLook = cameraKeys.start.look.clone();
      if (progress < ACTS[0].end) {
        camPos.lerpVectors(cameraKeys.start.pos, cameraKeys.coastEnd.pos, smoothstep(0, 1, lCoast));
        camLook.lerpVectors(cameraKeys.start.look, cameraKeys.coastEnd.look, smoothstep(0, 1, lCoast));
      } else if (progress < ACTS[1].end) {
        camPos.lerpVectors(cameraKeys.coastEnd.pos, cameraKeys.grainEnd.pos, smoothstep(0, 1, lGrain));
        camLook.lerpVectors(cameraKeys.coastEnd.look, cameraKeys.grainEnd.look, smoothstep(0, 1, lGrain));
      } else if (progress < ACTS[2].end) {
        camPos.lerpVectors(cameraKeys.grainEnd.pos, cameraKeys.potEnd.pos, smoothstep(0, 1, lPot));
        camLook.lerpVectors(cameraKeys.grainEnd.look, cameraKeys.potEnd.look, smoothstep(0, 1, lPot));
      } else if (progress < ACTS[3].end) {
        camPos.lerpVectors(cameraKeys.potEnd.pos, cameraKeys.revealEnd.pos, smoothstep(0, 1, lReveal));
        camLook.lerpVectors(cameraKeys.potEnd.look, cameraKeys.revealEnd.look, smoothstep(0, 1, lReveal));
      } else {
        camPos.lerpVectors(cameraKeys.revealEnd.pos, cameraKeys.tableEnd.pos, smoothstep(0, 1, lTable));
        camLook.lerpVectors(cameraKeys.revealEnd.look, cameraKeys.tableEnd.look, smoothstep(0, 1, lTable));
      }
      camera.position.lerp(camPos, 0.08);
      camera.lookAt(camLook);

      setText(coastRef.current, actWindowOpacity(lCoast));
      setText(grainRef.current, actWindowOpacity(lGrain));
      setText(potRef.current, actWindowOpacity(lPot));
      setText(revealRef.current, actWindowOpacity(lReveal, false));
      setText(tableRef.current, smoothstep(0, 0.3, lTable));

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
      [spiceGeo, riceGeo, potGeo, steamGeo, revealGeo].forEach((g) => g.dispose());
      [spiceMat, riceMat, potMat, steamMat, revealMat].forEach((m) => m.dispose());
      [spiceTexture, riceTexture, steamTexture].forEach((tex) => tex.dispose());
      revealMat.map?.dispose();
    };
  }, []);

  return (
    <div ref={spacerRef} className="relative" style={{ height: '620vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#601131]">
        <div ref={mountRef} className="absolute inset-0" />

        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }}
        />

        <Link
          href="/"
          className="absolute top-6 left-6 z-20 font-poppins text-sm tracking-wide text-white/70 transition-colors hover:text-white"
        >
          ← Ty Malabar
        </Link>

        <div
          ref={hintRef}
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 font-poppins text-xs uppercase tracking-[0.3em] text-white/70 transition-opacity"
        >
          <span>Scroll</span>
          <span className="block h-8 w-px bg-white/40" />
        </div>

        <div
          ref={coastRef}
          className="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        >
          <p className="mb-4 font-poppins text-xs uppercase tracking-[0.35em] text-orange-300 sm:text-sm">Act I — The Coast</p>
          <h2 className="font-poppins text-2xl font-bold leading-snug text-white sm:text-4xl">
            It begins on the Malabar Coast — where spice ships once anchored.
          </h2>
        </div>

        <div
          ref={grainRef}
          className="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        >
          <p className="mb-4 font-poppins text-xs uppercase tracking-[0.35em] text-orange-300 sm:text-sm">Act II — The Grain</p>
          <h2 className="font-poppins text-2xl font-bold leading-snug text-white sm:text-4xl">
            Rice, grown where the land meets monsoon rain.
          </h2>
        </div>

        <div
          ref={potRef}
          className="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        >
          <p className="mb-4 font-poppins text-xs uppercase tracking-[0.35em] text-orange-300 sm:text-sm">Act III — The Pot</p>
          <h2 className="font-poppins text-2xl font-bold leading-snug text-white sm:text-4xl">
            Sealed shut. Cooked slow. Nothing rushed.
          </h2>
        </div>

        <div
          ref={revealRef}
          className="absolute left-1/2 top-1/2 z-10 w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        >
          <p className="mb-4 font-poppins text-xs uppercase tracking-[0.35em] text-orange-300 sm:text-sm">Act IV — The Reveal</p>
          <h2 className="font-poppins text-2xl font-bold leading-snug text-white sm:text-4xl">Then — the seal breaks.</h2>
        </div>

        <div
          ref={tableRef}
          className="absolute left-1/2 top-1/2 z-10 flex w-[90%] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6 text-center opacity-0"
        >
          <p className="font-poppins text-xs uppercase tracking-[0.35em] text-orange-300 sm:text-sm">Ty Malabar</p>
          <h2 className="font-poppins text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            The Malabar Coast, at your table.
          </h2>
          <a
            href="https://order.tymalabar.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-[#F0A429] px-8 py-3 font-poppins font-semibold text-white transition-colors hover:bg-[#d48e20]"
          >
            Order Now
          </a>
        </div>
      </div>
    </div>
  );
}
