'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useCafe } from '@/context/CafeContext';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Parse a hex string into raw sRGB components (shader output is not colour-managed). */
function hexToVec3(hex: string, fallback = '#000000'): THREE.Vector3 {
  const clean = (/^#?[0-9a-f]{6}$/i.test(hex) ? hex : fallback).replace('#', '');
  const n = parseInt(clean, 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

interface Keyframe {
  cam: THREE.Vector3;
  look: THREE.Vector3;
  cup: THREE.Vector3;
  tilt: number;
  scale: number;
}

const kf = (cam: number[], look: number[], cup: number[], tilt: number, scale: number): Keyframe => ({
  cam: new THREE.Vector3(...(cam as [number, number, number])),
  look: new THREE.Vector3(...(look as [number, number, number])),
  cup: new THREE.Vector3(...(cup as [number, number, number])),
  tilt,
  scale,
});

// Five cinematic chapters: Awaken → Origin → Alchemy → Atelier → Sanctuary
const DESKTOP_FRAMES: Keyframe[] = [
  kf([0, 1.7, 6.6], [0, 0.55, 0], [0, -1.15, 0], 0.1, 1),
  kf([3.9, 1.25, 4.3], [0, 0.1, 0], [-0.9, -0.75, 0], 0.16, 0.95),
  kf([0.35, 4.7, 2.5], [0, -0.35, 0], [0, -0.85, 0], 0.04, 1.05),
  kf([-1.6, 1.5, 7.1], [0.4, 0.05, 0], [2.1, -0.7, -1.6], 0.14, 0.82),
  kf([0, 0.85, 5.4], [0, 0.05, 0], [0, -0.7, 0], 0.08, 0.95),
];

const MOBILE_FRAMES: Keyframe[] = [
  kf([0, 1.9, 8.6], [0, 0.9, 0], [0, -1.6, 0], 0.1, 0.86),
  kf([2.6, 1.4, 7.4], [0, 0.3, 0], [0, -1.1, 0], 0.16, 0.8),
  kf([0.2, 5.6, 3.6], [0, -0.3, 0], [0, -0.9, 0], 0.04, 0.9),
  kf([-0.8, 1.6, 9.0], [0, 0.4, 0], [0.4, -1.2, -1.4], 0.12, 0.72),
  kf([0, 1.0, 7.4], [0, 0.4, 0], [0, -1.2, 0], 0.08, 0.82),
];

// Chapter mood palettes (raw sRGB): base, mid smoke, accent light
const PALETTES = [
  ['#0a0706', '#2a160c', '#c8873e'], // Awaken — espresso & amber
  ['#0c0605', '#3a1608', '#e0662a'], // Origin — volcanic ember
  ['#0d0804', '#3d250e', '#e8b25a'], // Alchemy — golden crema
  ['#080706', '#1d1510', '#9c7a55'], // Atelier — calm bronze (menu readability)
  ['#0b0507', '#2c0f16', '#d4a24a'], // Sanctuary — velvet burgundy candlelight
].map((p) => p.map((h) => hexToVec3(h)));

/* ------------------------------------------------------------------ */
/* GLSL                                                                */
/* ------------------------------------------------------------------ */

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5; mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p = r * p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }
`;

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`;

const BACKDROP_FRAG = /* glsl */ `
  uniform float uTime; uniform float uProgress; uniform vec2 uResolution;
  uniform vec3 uBase; uniform vec3 uMid; uniform vec3 uAccent; uniform vec3 uGlow;
  uniform vec2 uHalo; uniform vec2 uRayOrigin; uniform float uIntensity;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.035;

    // Domain-warped roasting smoke that drifts and morphs with scroll
    vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t * 2.0) + uProgress * 1.8), fbm(p * 1.5 + vec2(5.2, -t * 1.4)));
    vec2 r = vec2(fbm(p * 2.0 + 3.0 * q + vec2(1.7, 9.2) + t), fbm(p * 2.0 + 3.0 * q + vec2(8.3, 2.8) - t));
    float smoke = fbm(p * 1.3 + 2.4 * r + vec2(0.0, -uTime * 0.025));

    // Glow halo locked to the projected cup position
    float halo = exp(-length((p - uHalo) * vec2(0.85, 1.15)) * 2.3);

    // Soft volumetric rays from a moving light source
    vec2 rd = p - uRayOrigin;
    float ang = atan(rd.x, rd.y);
    float rays = pow(noise(vec2(ang * 7.0, t * 3.0)), 3.0) * smoothstep(1.8, 0.1, length(rd));

    vec3 col = uBase;
    col = mix(col, uMid, smoothstep(0.25, 0.9, smoke) * 0.85);
    col += uAccent * pow(smoke, 3.2) * 0.42 * length(r);
    col += uGlow * halo * 0.42 * uIntensity;
    col += uGlow * rays * 0.09 * uIntensity;

    float vig = smoothstep(1.3, 0.2, length(p * vec2(0.8, 1.0)));
    col *= mix(0.32, 1.0, vig);
    #ifndef LOWRES
    col += (hash(vUv * uResolution + fract(uTime)) - 0.5) * (2.0 / 255.0); // dithering kills banding
    #endif
    gl_FragColor = vec4(col, 1.0);
  }
`;

const CREMA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const CREMA_FRAG = /* glsl */ `
  uniform float uTime; uniform float uPour;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float c = cos(uTime * 0.05); float s = sin(uTime * 0.05);
    vec2 rp = mat2(c, -s, s, c) * p;
    rp += (vec2(fbm(rp * 3.0 + uTime * 0.05), fbm(rp * 3.0 - uTime * 0.04)) - 0.5) * (0.12 + uPour * 0.25);

    vec3 coffee = vec3(0.09, 0.045, 0.022);
    vec3 cremaDark = vec3(0.34, 0.18, 0.08);
    vec3 cremaLight = vec3(0.86, 0.68, 0.46);

    vec3 col = mix(coffee, cremaDark, smoothstep(1.0, 0.25, r));
    col = mix(col, cremaDark * 1.3, fbm(rp * 6.0) * 0.5);

    // Rosetta latte art
    float y = rp.y + 0.05;
    float width = 0.5 * clamp(1.0 - (y + 0.62) / 1.25, 0.0, 1.0) * smoothstep(-0.7, -0.5, y);
    float inside = smoothstep(width, width - 0.04, abs(rp.x));
    float leaves = smoothstep(0.1, 0.6, sin(y * 30.0 - abs(rp.x) * 12.0));
    float stem = smoothstep(0.03, 0.0, abs(rp.x)) * smoothstep(0.7, -0.6, y);
    float foam = max(inside * leaves, stem);
    col = mix(col, cremaLight, foam * 0.85 * (1.0 - uPour * 0.55));

    // Pour ripples + soft specular
    col += sin(r * 42.0 - uTime * 6.0) * exp(-r * 3.0) * uPour * 0.07;
    col += pow(max(0.0, 1.0 - length(p - vec2(-0.38, 0.4)) * 1.7), 6.0) * 0.28;
    col *= mix(0.55, 1.0, smoothstep(1.02, 0.82, r));
    gl_FragColor = vec4(col, 1.0);
  }
`;

const STEAM_VERT = /* glsl */ `
  uniform float uTime; uniform float uSeed;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += sin(pos.y * 1.8 + uTime * 0.7 + uSeed) * 0.16 * uv.y;
    pos.x += sin(pos.y * 4.0 - uTime * 1.1 + uSeed * 2.0) * 0.04 * uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const STEAM_FRAG = /* glsl */ `
  uniform float uTime; uniform float uSeed; uniform float uStrength; uniform vec3 uColor;
  varying vec2 vUv;
  ${NOISE_GLSL}
  void main() {
    vec2 p = vec2(vUv.x * 1.5, vUv.y * 1.1 - uTime * 0.11);
    float n = fbm(p * vec2(2.0, 1.3) + uSeed);
    float n2 = fbm(p * 3.0 + n * 1.6 + uSeed * 2.0);
    float wisp = smoothstep(0.42, 0.85, n2);
    float edge = smoothstep(0.0, 0.38, vUv.x) * smoothstep(1.0, 0.62, vUv.x);
    float vertical = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.35, vUv.y);
    gl_FragColor = vec4(uColor, wisp * edge * vertical * uStrength * 0.5);
  }
`;

const POUR_FRAG = /* glsl */ `
  uniform float uTime; uniform float uPour;
  varying vec2 vUv;
  void main() {
    float stripe = sin(vUv.y * 60.0 + uTime * 14.0) * 0.5 + 0.5;
    float side = smoothstep(0.0, 0.5, sin(vUv.x * 3.14159));
    vec3 col = mix(vec3(0.12, 0.06, 0.03), vec3(0.55, 0.32, 0.14), stripe * 0.35 + side * 0.25);
    float fadeTop = smoothstep(1.0, 0.75, vUv.y);
    gl_FragColor = vec4(col, uPour * fadeTop * 0.95);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform float uPixelRatio; uniform float uSize;
  varying float vTwinkle;
  void main() {
    vec3 pos = position;
    pos.y = mod(pos.y + uTime * 0.06 * (0.4 + aSeed), 9.0) - 4.5;
    pos.x += sin(uTime * 0.25 + aSeed * 6.283) * 0.35;
    pos.z += cos(uTime * 0.2 + aSeed * 4.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.5 + aSeed) * (8.0 / -mv.z);
    vTwinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 30.0));
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uRing;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    // uRing = 0 → sharp glint (dust).  uRing = 1 → defocused bokeh disc with a bright rim.
    float soft = smoothstep(0.5, 0.0, d);
    float disc = smoothstep(0.5, 0.43, d) * (0.42 + 0.58 * smoothstep(0.2, 0.5, d));
    gl_FragColor = vec4(uColor, mix(soft, disc, uRing) * vTwinkle * uOpacity);
  }
`;

/** Radial additive glow — drives the light pool under the cup and the anamorphic flare. */
const GLOW_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uPower;
  varying vec2 vUv;
  void main() {
    float a = pow(max(0.0, 1.0 - length((vUv - 0.5) * 2.0)), uPower);
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`;

/* ------------------------------------------------------------------ */
/* Geometry builders                                                   */
/* ------------------------------------------------------------------ */

const CUP_HEIGHT = 1.65;
const outerRadius = (y: number) => 0.78 + 0.54 * Math.pow(y / CUP_HEIGHT, 0.75);
const innerRadius = (y: number) => outerRadius(y) - 0.07;

function buildCupProfile(): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0), new THREE.Vector2(0.7, 0), new THREE.Vector2(0.77, 0.03)];
  const steps = 18;
  for (let i = 1; i <= steps; i++) {
    const y = (i / steps) * CUP_HEIGHT;
    pts.push(new THREE.Vector2(outerRadius(y), y));
  }
  // Rounded lip
  const top = outerRadius(CUP_HEIGHT);
  pts.push(new THREE.Vector2(top - 0.015, CUP_HEIGHT + 0.025));
  pts.push(new THREE.Vector2(top - 0.055, CUP_HEIGHT + 0.025));
  for (let i = steps; i >= 1; i--) {
    const y = (i / steps) * CUP_HEIGHT;
    if (y < 0.14) break;
    pts.push(new THREE.Vector2(innerRadius(y), y));
  }
  pts.push(new THREE.Vector2(0, 0.14));
  return pts;
}

function buildBeanGeometry(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(0.17, 28, 20);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.y *= 0.62;
    v.z *= 1.38;
    if (v.y > 0) {
      v.y *= 0.55; // flat side
      const zN = v.z / 0.235;
      const centre = Math.sin(v.z * 14) * 0.012; // S-shaped crease
      const groove = Math.exp(-((v.x - centre) ** 2) / 0.0011) * Math.max(0, 1 - zN * zN);
      v.y -= groove * 0.05;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function CinematicCoffeeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useCafe();
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  const scrollTargetRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  // Last time the visitor scrolled / moved the mouse — lets the scene drop to 30fps when idle.
  const activityRef = useRef(0);
  const themeRef = useRef({
    glow: hexToVec3(settings.theme.primaryColor, '#D4AF37'),
    accent: hexToVec3(settings.theme.accentColor, '#E0A96D'),
    base: hexToVec3(settings.theme.backgroundColor, '#0A0807'),
    gold: new THREE.Color(settings.theme.primaryColor),
  });
  const reducedMotionRef = useRef(settings.animation.reducedMotion);
  const densityRef = useRef(settings.animation.particleDensity);

  // Keep theme/animation preferences live without rebuilding the scene.
  useEffect(() => {
    themeRef.current.glow.copy(hexToVec3(settings.theme.primaryColor, '#D4AF37'));
    themeRef.current.accent.copy(hexToVec3(settings.theme.accentColor, '#E0A96D'));
    themeRef.current.base.copy(hexToVec3(settings.theme.backgroundColor, '#0A0807'));
    try {
      themeRef.current.gold.set(settings.theme.primaryColor);
    } catch {
      /* keep previous */
    }
  }, [settings.theme.primaryColor, settings.theme.accentColor, settings.theme.backgroundColor]);

  useEffect(() => {
    reducedMotionRef.current = settings.animation.reducedMotion;
    densityRef.current = settings.animation.particleDensity;
  }, [settings.animation.reducedMotion, settings.animation.particleDensity]);

  // Scroll — rAF-throttled, writes into a ref only.
  // (It used to also push the value into React context, which re-rendered every
  // component on the page every 2% of scroll — the main cause of mobile jank.)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTargetRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onScroll = () => {
      activityRef.current = performance.now();
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    activityRef.current = performance.now();
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Pointer parallax only on fine pointers — touch scrolling must never wobble the camera.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      activityRef.current = performance.now();
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Build the scene exactly once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    // Touch devices (phones AND tablets) get the lighter render path.
    const lowPower = isMobile || isCoarse;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const octaves = 4;
    let frames = isMobile ? MOBILE_FRAMES : DESKTOP_FRAMES;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true, // MSAA is cheap on phone GPUs and removes the jagged cup/saucer edges
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return; // WebGL unavailable — CSS fallback background remains.
    }
    // Sharp output resolution. The expensive smoky backdrop is rendered separately at a low
    // resolution (see "Backdrop" below), so the cup/edges stay crisp while GPU cost stays low.
    // The adaptive loop only lowers this if the device really struggles (never below 1.0).
    let pixelRatio = Math.min(window.devicePixelRatio, lowPower ? 1.6 : 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.32;

    const camera = new THREE.PerspectiveCamera(isMobile ? 50 : 42, width / height, 0.1, 100);
    camera.position.copy(frames[0].cam);

    /* ---------- Backdrop ---------- */
    const backdropUniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uBase: { value: new THREE.Vector3() },
      uMid: { value: new THREE.Vector3() },
      uAccent: { value: new THREE.Vector3() },
      uGlow: { value: new THREE.Vector3() },
      uHalo: { value: new THREE.Vector2(0, -0.1) },
      uRayOrigin: { value: new THREE.Vector2(-0.6, 0.8) },
      uIntensity: { value: isMobile ? 0.75 : 1 },
    };
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: backdropUniforms,
        vertexShader: BACKDROP_VERT,
        fragmentShader: BACKDROP_FRAG,
        defines: { OCTAVES: octaves, LOWRES: 1 },
        depthTest: false,
        depthWrite: false,
      })
    );
    backdrop.frustumCulled = false;
    backdrop.renderOrder = -10;

    // Phones/tablets: the smoke is soft, so render it into a small texture (~40% size, 1/6 of the
    // pixels) and stretch it to the screen. The cup, saucer, beans and glow still render at full
    // resolution with MSAA — that's what keeps edges sharp and the page smooth at the same time.
    const BG_SCALE = lowPower ? 0.4 : 0.5;
    let bgTarget: THREE.WebGLRenderTarget | null = null;
    let bgScene: THREE.Scene | null = null;
    const bgCamera = new THREE.Camera();
    {
      const floatOk =
        renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
      const bw = Math.max(2, Math.round(width * BG_SCALE));
      const bh = Math.max(2, Math.round(height * BG_SCALE));
      bgTarget = new THREE.WebGLRenderTarget(bw, bh, {
        type: floatOk ? THREE.HalfFloatType : THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false,
      });
      backdropUniforms.uResolution.value.set(bw, bh);
      bgScene = new THREE.Scene();
      bgScene.add(backdrop);

      const blit = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({
          uniforms: { tBg: { value: bgTarget.texture }, uTime: backdropUniforms.uTime },
          vertexShader: BACKDROP_VERT,
          fragmentShader: /* glsl */ `
            uniform sampler2D tBg; uniform float uTime; varying vec2 vUv;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
            void main() {
              vec3 col = texture2D(tBg, vUv).rgb;
              col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * (2.0 / 255.0); // full-res dither, no banding
              gl_FragColor = vec4(col, 1.0);
            }
          `,
          depthTest: false,
          depthWrite: false,
        })
      );
      blit.frustumCulled = false;
      blit.renderOrder = -10;
      scene.add(blit);
    }

    /* ---------- Lights ---------- */
    scene.add(new THREE.AmbientLight(0xfff1e0, 0.18));
    const keyLight = new THREE.PointLight(0xffb259, 26, 18, 2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(themeRef.current.gold, 1.6);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);
    const topLight = new THREE.SpotLight(0xffe2b8, 30, 14, Math.PI / 6, 0.6, 1.6);
    topLight.position.set(0, 6, 1);
    scene.add(topLight);

    /* ---------- Cup ---------- */
    const cupRoot = new THREE.Group();
    scene.add(cupRoot);
    const cup = new THREE.Group();
    cup.position.y = -0.85;
    cupRoot.add(cup);

    const ceramic = new THREE.MeshPhysicalMaterial({
      color: 0x16110e,
      roughness: 0.22,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: themeRef.current.gold.clone(),
      metalness: 1,
      roughness: 0.22,
    });

    const cupBody = new THREE.Mesh(new THREE.LatheGeometry(buildCupProfile(), isMobile ? 48 : 72), ceramic);
    cup.add(cupBody);

    const lipRing = new THREE.Mesh(new THREE.TorusGeometry(outerRadius(CUP_HEIGHT) - 0.035, 0.022, 12, 96), gold);
    lipRing.rotation.x = Math.PI / 2;
    lipRing.position.y = CUP_HEIGHT + 0.02;
    cup.add(lipRing);

    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(outerRadius(1.3) - 0.06, 1.3, 0),
      new THREE.Vector3(outerRadius(1.3) + 0.38, 1.34, 0),
      new THREE.Vector3(outerRadius(1.0) + 0.62, 0.98, 0),
      new THREE.Vector3(outerRadius(0.6) + 0.42, 0.5, 0),
      new THREE.Vector3(outerRadius(0.45) - 0.06, 0.42, 0),
    ]);
    cup.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 48, 0.085, 14, false), ceramic));

    const saucer = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0, -0.06),
          new THREE.Vector2(0.9, -0.06),
          new THREE.Vector2(1.55, 0.02),
          new THREE.Vector2(2.0, 0.12),
          new THREE.Vector2(2.05, 0.16),
          new THREE.Vector2(1.95, 0.15),
          new THREE.Vector2(1.5, 0.07),
          new THREE.Vector2(0.9, 0.02),
          new THREE.Vector2(0, 0.02),
        ],
        isMobile ? 48 : 72
      ),
      ceramic
    );
    saucer.position.y = -0.04;
    cup.add(saucer);

    const saucerRing = new THREE.Mesh(new THREE.TorusGeometry(2.01, 0.018, 10, 120), gold);
    saucerRing.rotation.x = Math.PI / 2;
    saucerRing.position.y = 0.12;
    cup.add(saucerRing);

    const LIQUID_Y = 1.44;
    const cremaUniforms = { uTime: { value: 0 }, uPour: { value: 0 } };
    const liquid = new THREE.Mesh(
      new THREE.CircleGeometry(innerRadius(LIQUID_Y) + 0.005, 64),
      new THREE.ShaderMaterial({
        uniforms: cremaUniforms,
        vertexShader: CREMA_VERT,
        fragmentShader: CREMA_FRAG,
        defines: { OCTAVES: lowPower ? 2 : 3 },
      })
    );
    liquid.rotation.x = -Math.PI / 2;
    liquid.position.y = LIQUID_Y;
    cup.add(liquid);

    /* ---------- Steam ---------- */
    const steamGroup = new THREE.Group();
    scene.add(steamGroup);
    const steamGeo = new THREE.PlaneGeometry(1.15, 2.6, 1, 28);
    steamGeo.translate(0, 1.3, 0);
    const steamMats: THREE.ShaderMaterial[] = [];
    (lowPower ? [-0.12, 0.2] : [-0.28, 0.05, 0.32]).forEach((x, i) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: i * 3.7 + 1.3 },
          uStrength: { value: 1 },
          uColor: { value: new THREE.Vector3(1.0, 0.9, 0.78) },
        },
        vertexShader: STEAM_VERT,
        fragmentShader: STEAM_FRAG,
        defines: { OCTAVES: lowPower ? 2 : 3 },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      steamMats.push(mat);
      const plane = new THREE.Mesh(steamGeo, mat);
      plane.position.x = x;
      plane.position.z = i * 0.02;
      plane.scale.setScalar(0.85 + i * 0.12);
      steamGroup.add(plane);
    });

    /* ---------- Espresso pour stream ---------- */
    const pourUniforms = { uTime: { value: 0 }, uPour: { value: 0 } };
    const pourGeo = new THREE.CylinderGeometry(0.035, 0.055, 1, 14, 1, true);
    pourGeo.translate(0, 0.5, 0);
    const pour = new THREE.Mesh(
      pourGeo,
      new THREE.ShaderMaterial({
        uniforms: pourUniforms,
        vertexShader: CREMA_VERT,
        fragmentShader: POUR_FRAG,
        transparent: true,
        depthWrite: false,
      })
    );
    pour.visible = false;
    scene.add(pour);

    /* ---------- Roasted beans (instanced) ---------- */
    const beanCount = isMobile ? 12 : densityRef.current === 'low' ? 14 : densityRef.current === 'medium' ? 20 : 28;
    const beans = new THREE.InstancedMesh(
      buildBeanGeometry(),
      new THREE.MeshPhysicalMaterial({ color: 0x2b170e, roughness: 0.4, clearcoat: 0.55, clearcoatRoughness: 0.35 }),
      beanCount
    );
    beans.frustumCulled = false;
    scene.add(beans);
    const beanData = Array.from({ length: beanCount }, (_, i) => ({
      angle: (i / beanCount) * Math.PI * 2 + Math.random() * 0.4,
      radius: 2.4 + Math.random() * 2.2,
      height: (Math.random() - 0.5) * 3.4,
      speed: 0.12 + Math.random() * 0.22,
      spin: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      spinSpeed: new THREE.Vector3((Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.0),
      scale: 0.75 + Math.random() * 0.55,
    }));
    const dummy = new THREE.Object3D();

    /* ---------- Golden dust ---------- */
    const dustCount = lowPower ? 70 : 280;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 12;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
      dustSeeds[i] = Math.random();
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeeds, 1));
    const dustUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: isMobile ? 7 : 9 },
      uColor: { value: new THREE.Vector3() },
      uOpacity: { value: 0.7 },
      uRing: { value: 0 },
    };
    const dust = new THREE.Points(
      dustGeo,
      new THREE.ShaderMaterial({
        uniforms: dustUniforms,
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    dust.frustumCulled = false;
    scene.add(dust);

    /* ---------- Defocused bokeh (far field — fakes a shallow depth of field) ---------- */
    const bokehCount = isMobile ? 14 : 26;
    const bokehPos = new Float32Array(bokehCount * 3);
    const bokehSeeds = new Float32Array(bokehCount);
    for (let i = 0; i < bokehCount; i++) {
      bokehPos[i * 3] = (Math.random() - 0.5) * 16;
      bokehPos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      bokehPos[i * 3 + 2] = -6 - Math.random() * 6;
      bokehSeeds[i] = Math.random();
    }
    const bokehGeo = new THREE.BufferGeometry();
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    bokehGeo.setAttribute('aSeed', new THREE.BufferAttribute(bokehSeeds, 1));
    const bokehUniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uSize: { value: isMobile ? 85 : 125 },
      uColor: { value: new THREE.Vector3() },
      uOpacity: { value: 0.09 },
      uRing: { value: 1 },
    };
    const bokeh = new THREE.Points(
      bokehGeo,
      new THREE.ShaderMaterial({
        uniforms: bokehUniforms,
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    bokeh.frustumCulled = false;
    bokeh.renderOrder = -5;
    scene.add(bokeh);

    /* ---------- Warm light pool beneath the saucer (grounds the cup) ---------- */
    const poolUniforms = {
      uColor: { value: new THREE.Vector3() },
      uOpacity: { value: 0.25 },
      uPower: { value: 2.6 },
    };
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 6.5),
      new THREE.ShaderMaterial({
        uniforms: poolUniforms,
        vertexShader: CREMA_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.17;
    pool.renderOrder = -1;
    cup.add(pool);

    /* ---------- Anamorphic lens streak across the gold rim ---------- */
    const streakUniforms = {
      uColor: { value: new THREE.Vector3() },
      uOpacity: { value: 0.18 },
      uPower: { value: 1.9 },
    };
    const streak = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 0.5),
      new THREE.ShaderMaterial({
        uniforms: streakUniforms,
        vertexShader: CREMA_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false, // a lens artefact lives in front of the image, never occluded
        blending: THREE.AdditiveBlending,
      })
    );
    streak.renderOrder = 6;
    scene.add(streak);

    setIsCanvasReady(true);

    /* ---------- Per-frame scratch objects ---------- */
    const camPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const lookCurrent = frames[0].look.clone();
    const cupTarget = new THREE.Vector3();
    const tmpA = new THREE.Vector3();
    const projected = new THREE.Vector3();
    const cupWorld = new THREE.Vector3();
    const mixBase = new THREE.Vector3();
    const mixMid = new THREE.Vector3();
    const mixAccent = new THREE.Vector3();
    const pointer = { x: 0, y: 0 };

    let smooth = scrollTargetRef.current;
    let tilt = frames[0].tilt;
    let scale = frames[0].scale;
    let yaw = 0;
    let elapsed = 0;
    let prevScroll = scrollTargetRef.current;
    let vel = 0;
    let intro = 0;
    const baseFov = camera.fov;
    let visible = !document.hidden;
    let inView = true;
    let raf = 0;

    // Adaptive quality
    let sampleTime = 0;
    let sampleFrames = 0;
    let qualityLocked = false;

    const sample = (p: number) => {
      const seg = p * (frames.length - 1);
      const i = Math.min(frames.length - 2, Math.floor(seg));
      const t = smootherstep(Math.min(1, Math.max(0, seg - i)));
      const a = frames[i];
      const b = frames[i + 1];
      camPos.lerpVectors(a.cam, b.cam, t);
      lookTarget.lerpVectors(a.look, b.look, t);
      cupTarget.lerpVectors(a.cup, b.cup, t);
      return { tilt: a.tilt + (b.tilt - a.tilt) * t, scale: a.scale + (b.scale - a.scale) * t, seg };
    };

    const clock = new THREE.Clock();

    // Phones render at 30 fps: half the GPU work, and the main thread stays free for scrolling.
    const baseInterval = lowPower ? 31 : 14;
    const IDLE_AFTER_MS = 2500; // opening dolly-in + scroll easing have settled by then
    let lastFrameAt = 0;
    let rafPrev = 0;
    let warmup = 0;
    let qualityTries = 0;

    const render = (now: number = performance.now()) => {
      raf = requestAnimationFrame(render);
      if (!visible || !inView) {
        clock.getDelta();
        rafPrev = 0;
        return;
      }

      const rafDt = rafPrev ? (now - rafPrev) / 1000 : 0;
      rafPrev = now;

      // Adaptive resolution: if the device can't keep up, keep lowering the internal resolution.
      if (!qualityLocked && rafDt > 0 && rafDt < 0.5) {
        warmup += rafDt;
        if (warmup > 0.6) {
          sampleTime += rafDt;
          sampleFrames++;
          if (sampleTime > 1.5) {
            const avg = sampleTime / sampleFrames;
            const floor = 1;
            if (avg > 0.021 && pixelRatio > floor + 0.01) {
              pixelRatio = Math.max(floor, pixelRatio * 0.88);
              renderer.setPixelRatio(pixelRatio);
              renderer.setSize(width, height, false);
              dustUniforms.uPixelRatio.value = pixelRatio;
              bokehUniforms.uPixelRatio.value = pixelRatio;
              sampleTime = 0;
              sampleFrames = 0;
              if (++qualityTries >= 5) qualityLocked = true;
            } else {
              qualityLocked = true;
            }
          }
        }
      }

      const idle = now - activityRef.current > IDLE_AFTER_MS;
      const frameInterval = idle ? 31 : baseInterval;
      if (frameInterval && now - lastFrameAt < frameInterval) return;
      lastFrameAt = now;

      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const motion = reducedMotionRef.current || prefersReduced ? 0.35 : 1;
      elapsed += dt * motion;

      // Smoothed scroll (frame-rate independent)
      smooth = damp(smooth, scrollTargetRef.current, 3.2, dt);
      const s = sample(smooth);

      // Chapter weights
      const w = (i: number) => Math.max(0, 1 - Math.abs(s.seg - i));
      const originW = w(1);
      const pourW = smootherstep(Math.max(0, Math.min(1, w(2) * 1.6 - 0.3)));
      const menuW = w(3);

      // Pointer (desktop) or slow auto drift (touch)
      const pTarget = isCoarse
        ? { x: Math.sin(elapsed * 0.25) * 0.25, y: Math.cos(elapsed * 0.2) * 0.15 }
        : pointerRef.current;
      pointer.x = damp(pointer.x, pTarget.x, 2.5, dt);
      pointer.y = damp(pointer.y, pTarget.y, 2.5, dt);

      // Scroll velocity gives the camera physical weight (roll + lens stretch)
      const rawVel = (scrollTargetRef.current - prevScroll) / Math.max(dt, 1e-4);
      prevScroll = scrollTargetRef.current;
      vel = damp(vel, Math.max(-2.5, Math.min(2.5, rawVel)), 6, dt);
      const velAbs = Math.abs(vel);

      // Opening shot: a slow dolly-in from a wide establishing frame
      intro = Math.min(1, intro + dt / 2.6);
      const introE = 1 - Math.pow(1 - intro, 3);

      // Camera
      tmpA.set(
        camPos.x + pointer.x * 0.45,
        camPos.y + pointer.y * 0.3,
        camPos.z + (1 - introE) * 4.2
      );
      const camK = 1 - Math.exp(-4 * dt);
      camera.position.lerp(tmpA, camK);
      lookCurrent.lerp(lookTarget, camK);
      camera.lookAt(lookCurrent);
      camera.rotateZ(vel * 0.03 * motion + Math.sin(elapsed * 0.27) * 0.004);

      const fovTarget = baseFov + velAbs * 2.2 + (1 - introE) * 7;
      if (Math.abs(camera.fov - fovTarget) > 0.015) {
        camera.fov = damp(camera.fov, fovTarget, 5, dt);
        camera.updateProjectionMatrix();
      }

      // Cup — continuous yaw (never jumps backwards between chapters)
      yaw += dt * motion * (0.12 + pourW * 0.1 + velAbs * 0.5);
      cupRoot.position.lerp(cupTarget, camK);
      tilt = damp(tilt, s.tilt, 3, dt);
      scale = damp(scale, s.scale, 3, dt);
      cupRoot.rotation.set(
        tilt + Math.sin(elapsed * 0.5) * 0.015 - vel * 0.018,
        yaw + smooth * Math.PI * 1.2,
        Math.sin(elapsed * 0.4) * 0.02 - vel * 0.022
      );
      cupRoot.scale.setScalar(scale);
      cupRoot.position.y += Math.sin(elapsed * 0.8) * 0.03; // gentle levitation

      // Liquid & pour
      cremaUniforms.uTime.value = elapsed;
      cremaUniforms.uPour.value = pourW;
      cupWorld.set(0, -0.85 + LIQUID_Y, 0);
      cupRoot.localToWorld(cupWorld);
      pour.visible = pourW > 0.02;
      if (pour.visible) {
        pour.position.copy(cupWorld);
        pour.scale.set(0.3 + pourW * 0.7, 4.2, 0.3 + pourW * 0.7);
        pourUniforms.uTime.value = elapsed;
        pourUniforms.uPour.value = pourW;
      }

      // Steam — cylindrical billboard rising from the crema
      steamGroup.position.copy(cupWorld);
      steamGroup.scale.setScalar(scale);
      steamGroup.rotation.y = Math.atan2(camera.position.x - cupWorld.x, camera.position.z - cupWorld.z);
      const steamStrength = (1 - menuW * 0.65) * (1 - pourW * 0.4);
      for (const m of steamMats) {
        m.uniforms.uTime.value = elapsed;
        m.uniforms.uStrength.value = steamStrength;
      }

      // Light pool under the saucer
      poolUniforms.uColor.value.copy(themeRef.current.glow);
      poolUniforms.uOpacity.value = (0.2 + pourW * 0.16) * (1 - menuW * 0.45) * introE;

      // Anamorphic flare — peaks as the key light sweeps behind the rim
      streak.position.copy(cupWorld);
      streak.position.y += 0.05;
      streak.rotation.y = steamGroup.rotation.y;
      streak.scale.setScalar(scale);
      streakUniforms.uColor.value.copy(themeRef.current.glow);
      const flare = Math.pow(Math.max(0, Math.cos(smooth * Math.PI * 1.5)), 6);
      streakUniforms.uOpacity.value = (0.1 + flare * 0.3 + pourW * 0.12) * introE;

      // Far-field bokeh
      bokehUniforms.uTime.value = elapsed * 0.45;
      bokehUniforms.uColor.value.copy(themeRef.current.glow);
      bokehUniforms.uOpacity.value = (0.075 + menuW * 0.03) * introE;

      // Beans — orbit, then gather into a vortex during the Origin chapter
      for (let i = 0; i < beanCount; i++) {
        const b = beanData[i];
        const ang = b.angle + elapsed * b.speed + smooth * 3;
        const r = b.radius * (1 - originW * 0.38) + Math.sin(elapsed * 0.7 + i) * 0.15;
        const h = b.height * (1 - originW * 0.45) + Math.sin(elapsed * 0.9 + i * 1.7) * 0.25 + originW * Math.sin(ang * 2) * 0.3;
        dummy.position.set(cupRoot.position.x + Math.cos(ang) * r, h, cupRoot.position.z + Math.sin(ang) * r);
        dummy.rotation.set(
          b.spin.x + elapsed * b.spinSpeed.x,
          b.spin.y + elapsed * b.spinSpeed.y,
          b.spin.z + elapsed * b.spinSpeed.z
        );
        dummy.scale.setScalar(b.scale * (1 - pourW * 0.35));
        dummy.updateMatrix();
        beans.setMatrixAt(i, dummy.matrix);
      }
      beans.instanceMatrix.needsUpdate = true;

      // Dust
      dustUniforms.uTime.value = elapsed;
      dustUniforms.uColor.value.copy(themeRef.current.glow);
      dustUniforms.uOpacity.value = 0.55 + pourW * 0.3;

      // Backdrop mood palette — blended between chapters and the active theme
      const pi = Math.min(PALETTES.length - 2, Math.floor(s.seg));
      const pt = smootherstep(Math.min(1, Math.max(0, s.seg - pi)));
      mixBase.lerpVectors(PALETTES[pi][0], PALETTES[pi + 1][0], pt).lerp(themeRef.current.base, 0.5);
      mixMid.lerpVectors(PALETTES[pi][1], PALETTES[pi + 1][1], pt);
      mixAccent.lerpVectors(PALETTES[pi][2], PALETTES[pi + 1][2], pt);
      backdropUniforms.uBase.value.copy(mixBase);
      backdropUniforms.uMid.value.copy(mixMid);
      backdropUniforms.uAccent.value.copy(mixAccent);
      backdropUniforms.uGlow.value.copy(themeRef.current.glow).lerp(mixAccent, 0.5);
      backdropUniforms.uTime.value = elapsed;
      backdropUniforms.uProgress.value = smooth;

      projected.copy(cupRoot.position);
      projected.y += 0.4;
      projected.project(camera);
      const aspect = width / height;
      backdropUniforms.uHalo.value.set(projected.x * 0.5 * aspect, projected.y * 0.5);
      backdropUniforms.uRayOrigin.value.set((-0.7 + smooth * 1.4) * aspect * 0.5, 0.75 - Math.sin(smooth * Math.PI) * 0.15);

      // Lights breathe and orbit with the story
      keyLight.intensity = 22 + Math.sin(elapsed * 0.8) * 3 + pourW * 10;
      keyLight.position.set(3.2 * Math.cos(smooth * Math.PI * 1.5), 4, 3 + Math.sin(smooth * Math.PI * 2) * 1.2);
      rimLight.color.copy(themeRef.current.gold);
      rimLight.intensity = 1.4 + Math.sin(elapsed * 0.5 + smooth * 4) * 0.3;
      gold.color.copy(themeRef.current.gold);
      topLight.target.position.copy(cupRoot.position);
      topLight.target.updateMatrixWorld();

      if (bgTarget && bgScene) {
        renderer.setRenderTarget(bgTarget);
        renderer.render(bgScene, bgCamera);
        renderer.setRenderTarget(null);
      }
      renderer.render(scene, camera);
    };
    let disposed = false;
    const startLoop = () => {
      if (disposed || raf) return;
      clock.getDelta();
      raf = requestAnimationFrame(render);
    };
    // Compile all shader programs off the main thread first, so the first frames don't freeze.
    Promise.all([
      renderer.compileAsync(scene, camera),
      bgScene ? renderer.compileAsync(bgScene, bgCamera) : Promise.resolve(null),
    ])
      .catch(() => undefined)
      .then(startLoop);

    /* ---------- Events ---------- */
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Ignore the mobile address-bar show/hide (height-only) resize — it causes visible jitter.
    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === width && Math.abs(h - height) < 160) return;
      width = w;
      height = h;
      frames = width < 768 ? MOBILE_FRAMES : DESKTOP_FRAMES;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (bgTarget) {
        const bw = Math.max(2, Math.round(width * BG_SCALE));
        const bh = Math.max(2, Math.round(height * BG_SCALE));
        bgTarget.setSize(bw, bh);
        backdropUniforms.uResolution.value.set(bw, bh);
      } else {
        backdropUniforms.uResolution.value.set(width, height);
      }
    };
    window.addEventListener('resize', onResize);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onContextRestored = () => {
      clock.getDelta();
      if (!raf) raf = requestAnimationFrame(render);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
      });
      if (bgScene) {
        bgScene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material | undefined;
          if (mat) mat.dispose();
        });
      }
      if (bgTarget) bgTarget.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-[1600ms] ease-out"
      style={{
        height: '100lvh',
        opacity: isCanvasReady ? 1 : 0,
        // Graceful fallback if WebGL is unavailable
        background: `radial-gradient(ellipse at 50% 60%, ${settings.theme.primaryColor}22 0%, ${settings.theme.backgroundColor} 65%)`,
      }}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {/* Soft top/bottom fades keep header and footer text crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${settings.theme.backgroundColor}b3 0%, transparent 16%, transparent 80%, ${settings.theme.backgroundColor}99 100%)`,
        }}
      />
    </div>
  );
}
