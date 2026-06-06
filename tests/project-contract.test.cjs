const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, it } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('project contract', () => {
  it('keeps the requested source structure', () => {
    const requiredDirectories = [
      'src/assets',
      'src/components/ui',
      'src/components/solar-system',
      'src/components/labels',
      'src/components/minimap',
      'src/components/quiz',
      'src/components/comparison',
      'src/components/lesson',
      'src/hooks',
      'src/stores',
      'src/pages',
      'src/scenes',
      'src/types',
      'src/data',
      'src/utils',
      'src/constants',
      'src/services',
      'src/styles',
    ];

    for (const directory of requiredDirectories) {
      assert.ok(fs.statSync(path.join(root, directory)).isDirectory(), `${directory} is missing`);
    }
  });

  it('declares the requested core dependencies', () => {
    const packageJson = JSON.parse(read('package.json'));
    const dependencyNames = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const name of [
      'react',
      'react-dom',
      'vite',
      'typescript',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand',
      'tailwindcss',
      'framer-motion',
    ]) {
      assert.ok(dependencyNames[name], `${name} dependency is missing`);
    }
  });

  it('includes key interaction surfaces', () => {
    const scene = read('src/scenes/SolarSystemScene.tsx');
    const camera = read('src/components/solar-system/CameraRig.tsx');
    const bodyMesh = read('src/components/solar-system/CelestialBodyMesh.tsx');
    const toolbar = read('src/components/ui/TopToolbar.tsx');
    const panel = read('src/components/ui/EducationPanel.tsx');
    const simulator = read('src/pages/SimulatorPage.tsx');
    const lesson = read('src/components/lesson/LessonPanel.tsx');

    assert.match(scene, /<Canvas/);
    assert.match(scene, /<Stars/);
    assert.match(scene, /<Sparkles/);
    assert.match(camera, /OrbitControls/);
    assert.match(camera, /minDistance/);
    assert.match(camera, /maxDistance/);
    assert.match(bodyMesh, /normalMap/);
    assert.match(bodyMesh, /roughnessMap/);
    assert.match(bodyMesh, /onClick/);
    assert.match(toolbar, /TIME_SPEEDS/);
    assert.match(toolbar, /setScaleMode/);
    assert.match(toolbar, /setQualityPreset/);
    assert.match(panel, /Ciekawostka/);
    assert.match(panel, /Źródła/);
    assert.match(simulator, /StudentWatermark/);
    assert.match(simulator, /MobileDrawerControls/);
    assert.match(lesson, /lessonSteps/);
  });

  it('documents development and production commands', () => {
    const readme = read('README.md');

    assert.match(readme, /npm install/);
    assert.match(readme, /npm run dev/);
    assert.match(readme, /npm run build/);
    assert.match(readme, /dist\//);
  });

  it('ships local realistic texture assets for the hybrid texture path', () => {
    const expectedTextures = [
      'public/textures/real/sun.webp',
      'public/textures/real/mercury.webp',
      'public/textures/real/venus.webp',
      'public/textures/real/earth.webp',
      'public/textures/real/earth-clouds.webp',
      'public/textures/real/moon.webp',
    ];

    for (const texture of expectedTextures) {
      const filePath = path.join(root, texture);
      assert.ok(fs.existsSync(filePath), `${texture} is missing`);
      assert.ok(fs.statSync(filePath).size > 20_000, `${texture} is unexpectedly small`);
    }
  });
});
