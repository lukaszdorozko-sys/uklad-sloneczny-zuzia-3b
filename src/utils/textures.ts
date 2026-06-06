import * as THREE from 'three';
import type { CelestialBody } from '../types/celestial';

const textureCache = new Map<string, THREE.Texture>();

const REAL_TEXTURE_PATHS: Partial<Record<string, string>> = {
  sun: '/textures/real/sun.webp',
  mercury: '/textures/real/mercury.webp',
  venus: '/textures/real/venus.webp',
  earth: '/textures/real/earth.webp',
  moon: '/textures/real/moon.webp',
};

const CLOUD_TEXTURE_PATHS: Partial<Record<string, string>> = {
  earth: '/textures/real/earth-clouds.webp',
};

const randomFromSeed = (seed: number) => {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const createCanvas = (size: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

const drawSurfaceNoise = (
  context: CanvasRenderingContext2D,
  size: number,
  random: () => number,
  density = 9000,
) => {
  for (let i = 0; i < density; i += 1) {
    const value = Math.floor(70 + random() * 185);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.globalAlpha = 0.015 + random() * 0.045;
    context.fillRect(random() * size, random() * size, 1 + random() * 2, 1 + random() * 2);
  }
  context.globalAlpha = 1;
};

const drawIrregularBlob = (
  context: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number,
  color: string,
  alpha: number,
) => {
  const points = 16;
  context.save();
  context.translate(x, y);
  context.rotate((random() - 0.5) * 0.8);
  context.beginPath();
  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * Math.PI * 2;
    const wobble = 0.68 + random() * 0.55;
    const pointX = Math.cos(angle) * radiusX * wobble;
    const pointY = Math.sin(angle) * radiusY * wobble;
    if (index === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }
  context.closePath();
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fill();
  context.restore();
  context.globalAlpha = 1;
};

const drawCloudStreaks = (
  context: CanvasRenderingContext2D,
  size: number,
  random: () => number,
  count: number,
  alpha: number,
) => {
  context.save();
  context.strokeStyle = '#ffffff';
  context.lineCap = 'round';
  for (let i = 0; i < count; i += 1) {
    const y = random() * size;
    const length = size * (0.08 + random() * 0.24);
    const startX = random() * size;
    context.globalAlpha = alpha * (0.45 + random());
    context.lineWidth = 1 + random() * 5;
    context.beginPath();
    context.moveTo(startX, y);
    for (let step = 0; step < 6; step += 1) {
      const x = startX + (length / 6) * step;
      context.lineTo(x, y + Math.sin(step + random() * 2) * (4 + random() * 14));
    }
    context.stroke();
  }
  context.restore();
  context.globalAlpha = 1;
};

const drawPolarCaps = (
  context: CanvasRenderingContext2D,
  size: number,
  color = '#f7fbff',
  alpha = 0.55,
) => {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(0, 0, size, size * 0.045);
  context.fillRect(0, size * 0.955, size, size * 0.045);
  context.globalAlpha = alpha * 0.7;
  context.fillRect(0, size * 0.045, size, size * 0.018);
  context.fillRect(0, size * 0.937, size, size * 0.018);
  context.globalAlpha = 1;
};

const drawDetailedCraters = (
  context: CanvasRenderingContext2D,
  size: number,
  random: () => number,
  count: number,
) => {
  for (let i = 0; i < count; i += 1) {
    const radius = 5 + random() * 34;
    const x = random() * size;
    const y = random() * size;
    const gradient = context.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 1, x, y, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(0.5, 'rgba(45,45,45,0.18)');
    gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = 'rgba(0,0,0,0.22)';
    context.lineWidth = Math.max(1, radius * 0.08);
    context.stroke();
  }
};

const drawBodySignature = (
  context: CanvasRenderingContext2D,
  size: number,
  random: () => number,
  body: CelestialBody,
) => {
  if (body.id === 'earth') {
    for (let i = 0; i < 42; i += 1) {
      drawIrregularBlob(
        context,
        random,
        random() * size,
        random() * size,
        24 + random() * 96,
        18 + random() * 70,
        random() > 0.38 ? '#2d8a54' : '#8b7a4a',
        0.52,
      );
    }
    drawCloudStreaks(context, size, random, 70, 0.28);
    drawPolarCaps(context, size, '#f6fbff', 0.72);
  }

  if (body.id === 'mars') {
    drawPolarCaps(context, size, '#f5eadc', 0.5);
    for (let i = 0; i < 18; i += 1) {
      drawIrregularBlob(context, random, random() * size, random() * size, 35 + random() * 110, 6 + random() * 24, '#4a2418', 0.18);
    }
  }

  if (body.id === 'venus') {
    drawCloudStreaks(context, size, random, 120, 0.18);
    for (let i = 0; i < 18; i += 1) {
      drawIrregularBlob(context, random, random() * size, random() * size, 60 + random() * 140, 14 + random() * 40, '#fff1bd', 0.1);
    }
  }

  if (body.id === 'jupiter' || body.id === 'saturn') {
    for (let y = 0; y < size; y += size / 34) {
      context.fillStyle = body.id === 'jupiter' ? (random() > 0.5 ? '#f8dfbc' : '#9c6544') : '#f2d99f';
      context.globalAlpha = body.id === 'jupiter' ? 0.34 : 0.16;
      context.fillRect(0, y + random() * 6, size, 6 + random() * 18);
    }
    drawCloudStreaks(context, size, random, body.id === 'jupiter' ? 80 : 42, body.id === 'jupiter' ? 0.11 : 0.08);
  }

  if (body.id === 'jupiter') {
    const bandColors = ['#7a4932', '#f6e3c6', '#b9754f', '#ead0a8', '#8b5338', '#f8ddb0'];
    for (let index = 0; index < 18; index += 1) {
      const y = (index / 18) * size + (random() - 0.5) * 16;
      context.fillStyle = bandColors[index % bandColors.length];
      context.globalAlpha = 0.34 + random() * 0.16;
      context.fillRect(0, y, size, 11 + random() * 20);
    }
    for (let i = 0; i < 26; i += 1) {
      drawIrregularBlob(
        context,
        random,
        random() * size,
        random() * size,
        30 + random() * 110,
        6 + random() * 24,
        random() > 0.5 ? '#fff2d4' : '#9a5a38',
        0.16,
      );
    }
    context.globalAlpha = 0.82;
    context.fillStyle = '#c7432e';
    context.beginPath();
    context.ellipse(size * 0.63, size * 0.54, size * 0.095, size * 0.042, -0.18, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 0.22;
    context.fillStyle = '#fff1d1';
    context.beginPath();
    context.ellipse(size * 0.61, size * 0.525, size * 0.035, size * 0.014, -0.2, 0, Math.PI * 2);
    context.fill();
  }

  if (body.id === 'uranus' || body.id === 'neptune') {
    drawCloudStreaks(context, size, random, 32, 0.11);
    if (body.id === 'neptune') {
      drawIrregularBlob(context, random, size * 0.58, size * 0.42, size * 0.065, size * 0.025, '#07194d', 0.32);
    }
  }

  if (body.id === 'europa') {
    context.save();
    context.strokeStyle = '#7b4d3a';
    context.globalAlpha = 0.58;
    context.lineWidth = 1.5;
    for (let i = 0; i < 44; i += 1) {
      const y = random() * size;
      context.beginPath();
      context.moveTo(0, y);
      for (let x = 0; x <= size; x += 38) {
        context.lineTo(x, y + Math.sin(x * 0.025 + random() * 4) * (10 + random() * 22));
      }
      context.stroke();
    }
    context.restore();
  }

  if (body.id === 'io') {
    for (let i = 0; i < 36; i += 1) {
      drawIrregularBlob(context, random, random() * size, random() * size, 12 + random() * 46, 10 + random() * 36, random() > 0.5 ? '#6b371c' : '#fff0a0', 0.36);
    }
  }

  if (body.texture.craters) {
    drawDetailedCraters(context, size, random, body.type === 'moon' ? 90 : 44);
  }

  context.globalAlpha = 1;
};

const enhanceWithRealTexture = (texture: THREE.Texture, bodyId: string) => {
  const path = REAL_TEXTURE_PATHS[bodyId];
  if (!path) {
    return;
  }

  const loader = new THREE.TextureLoader();
  loader.load(
    path,
    (loadedTexture) => {
      texture.image = loadedTexture.image;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      loadedTexture.dispose();
    },
    undefined,
    () => {
      texture.needsUpdate = true;
    },
  );
};

export const createBodyTexture = (body: CelestialBody): THREE.Texture => {
  const key = `color-${body.id}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const size = body.type === 'star' ? 1536 : 1024;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  const random = randomFromSeed(body.texture.seed);
  const gradient = context.createLinearGradient(0, 0, size, size);
  body.texture.base.forEach((color, index) => {
    gradient.addColorStop(index / Math.max(1, body.texture.base.length - 1), color);
  });
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  drawSurfaceNoise(context, size, random, body.type === 'star' ? 14_000 : 9_000);

  if (body.texture.bands) {
    for (let y = 0; y < size; y += size / 22) {
      const color = body.texture.base[Math.floor(random() * body.texture.base.length)];
      context.fillStyle = color;
      context.globalAlpha = 0.16 + random() * 0.24;
      context.fillRect(0, y + random() * 14, size, 8 + random() * 26);
    }
  }

  if (body.texture.ice) {
    context.strokeStyle = body.texture.accent[0] ?? '#ffffff';
    context.globalAlpha = 0.45;
    context.lineWidth = 2;
    for (let i = 0; i < 34; i += 1) {
      context.beginPath();
      const y = random() * size;
      context.moveTo(0, y);
      for (let x = 0; x < size; x += 44) {
        context.lineTo(x, y + Math.sin(x * 0.03 + random() * 4) * (18 + random() * 24));
      }
      context.stroke();
    }
  }

  if (body.texture.craters) {
    for (let i = 0; i < 95; i += 1) {
      const radius = 3 + random() * 28;
      const x = random() * size;
      const y = random() * size;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = body.texture.accent[Math.floor(random() * body.texture.accent.length)] ?? '#777';
      context.globalAlpha = 0.18 + random() * 0.22;
      context.fill();
      context.strokeStyle = '#ffffff';
      context.globalAlpha = 0.08;
      context.lineWidth = Math.max(1, radius * 0.12);
      context.stroke();
    }
  }

  if (body.texture.storms) {
    for (let i = 0; i < 32; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const radiusX = 12 + random() * 70;
      const radiusY = 6 + random() * 28;
      context.beginPath();
      context.ellipse(x, y, radiusX, radiusY, random() * Math.PI, 0, Math.PI * 2);
      context.fillStyle = body.texture.accent[Math.floor(random() * body.texture.accent.length)] ?? '#fff';
      context.globalAlpha = 0.1 + random() * 0.26;
      context.fill();
    }
  }

  if (body.id === 'jupiter') {
    context.globalAlpha = 0.72;
    context.fillStyle = '#c7432e';
    context.beginPath();
    context.ellipse(size * 0.63, size * 0.54, size * 0.08, size * 0.035, -0.18, 0, Math.PI * 2);
    context.fill();
  }

  drawBodySignature(context, size, random, body);

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  enhanceWithRealTexture(texture, body.id);
  textureCache.set(key, texture);
  return texture;
};

export const createCloudTexture = (body: CelestialBody): THREE.Texture | null => {
  const path = CLOUD_TEXTURE_PATHS[body.id];
  if (!path) {
    return null;
  }

  const key = `cloud-${body.id}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = createCanvas(512);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;

  const loader = new THREE.TextureLoader();
  loader.load(path, (loadedTexture) => {
    texture.image = loadedTexture.image;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    loadedTexture.dispose();
  });

  textureCache.set(key, texture);
  return texture;
};

export const createBumpTexture = (body: CelestialBody): THREE.Texture => {
  const key = `bump-${body.id}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const size = 768;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  const random = randomFromSeed(body.texture.seed * 13);
  context.fillStyle = body.type === 'star' ? '#353535' : '#888888';
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < (body.texture.craters ? 150 : 72); i += 1) {
    const value = Math.floor(80 + random() * 115);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.globalAlpha = 0.12 + random() * 0.28;
    context.beginPath();
    context.ellipse(random() * size, random() * size, 2 + random() * 24, 2 + random() * 16, random(), 0, Math.PI * 2);
    context.fill();
  }

  if (body.texture.bands) {
    context.globalAlpha = 0.2;
    for (let y = 0; y < size; y += 22) {
      const value = Math.floor(95 + random() * 60);
      context.fillStyle = `rgb(${value}, ${value}, ${value})`;
      context.fillRect(0, y, size, 4 + random() * 10);
    }
  }

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
};

export const createNormalTexture = (body: CelestialBody): THREE.Texture => {
  const key = `normal-${body.id}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const size = 768;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  const random = randomFromSeed(body.texture.seed * 29);
  context.fillStyle = '#8080ff';
  context.fillRect(0, 0, size, size);

  const featureCount = body.texture.craters ? 130 : 78;
  for (let i = 0; i < featureCount; i += 1) {
    const x = random() * size;
    const y = random() * size;
    const radius = 3 + random() * 24;
    const red = 112 + Math.floor(random() * 34);
    const green = 112 + Math.floor(random() * 34);
    context.fillStyle = `rgb(${red}, ${green}, 255)`;
    context.globalAlpha = 0.16 + random() * 0.18;
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.5 + random()), random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  if (body.texture.bands || body.texture.ice) {
    context.globalAlpha = 0.22;
    context.strokeStyle = '#9696ff';
    context.lineWidth = 2;
    for (let y = 0; y < size; y += body.texture.ice ? 30 : 18) {
      context.beginPath();
      context.moveTo(0, y + random() * 8);
      for (let x = 0; x <= size; x += 32) {
        context.lineTo(x, y + Math.sin(x * 0.035 + random()) * (body.texture.ice ? 16 : 5));
      }
      context.stroke();
    }
  }

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
};

export const createRoughnessTexture = (body: CelestialBody): THREE.Texture => {
  const key = `roughness-${body.id}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const size = 768;
  const canvas = createCanvas(size);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  const random = randomFromSeed(body.texture.seed * 41);
  const base = body.texture.ice ? 150 : body.type === 'star' ? 60 : 190;
  context.fillStyle = `rgb(${base}, ${base}, ${base})`;
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < 180; i += 1) {
    const value = Math.floor(base - 46 + random() * 92);
    context.fillStyle = `rgb(${value}, ${value}, ${value})`;
    context.globalAlpha = 0.16 + random() * 0.26;
    context.fillRect(random() * size, random() * size, 8 + random() * 42, 2 + random() * 20);
  }

  if (body.texture.bands) {
    context.globalAlpha = 0.22;
    for (let y = 0; y < size; y += 20) {
      const value = Math.floor(base - 22 + random() * 44);
      context.fillStyle = `rgb(${value}, ${value}, ${value})`;
      context.fillRect(0, y, size, 6 + random() * 8);
    }
  }

  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(key, texture);
  return texture;
};
