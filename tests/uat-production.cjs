const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

function findCachedNodeModules() {
  const candidates = [
    process.env.TEST_NODE_MODULES,
    process.env.PLAYWRIGHT_NODE_MODULES,
    path.resolve(__dirname, '..', 'node_modules'),
  ].filter(Boolean);
  const cacheRoot = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache');
  const queue = fs.existsSync(cacheRoot) ? [{ directory: cacheRoot, depth: 0 }] : [];
  const seen = new Set();

  while (queue.length > 0 && candidates.length < 80) {
    const item = queue.shift();
    if (!item || seen.has(item.directory)) {
      continue;
    }
    seen.add(item.directory);

    const nodeModules = path.join(item.directory, 'node_modules');
    const pnpmNodeModules = path.join(nodeModules, '.pnpm', 'node_modules');
    if (fs.existsSync(path.join(nodeModules, 'playwright', 'package.json'))) {
      candidates.push(nodeModules);
    }
    if (fs.existsSync(pnpmNodeModules)) {
      candidates.push(pnpmNodeModules);
    }
    if (fs.existsSync(path.join(pnpmNodeModules, 'playwright', 'package.json'))) {
      candidates.push(pnpmNodeModules);
    }

    if (item.depth >= 6) {
      continue;
    }

    let entries = [];
    try {
      entries = fs.readdirSync(item.directory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        queue.push({ directory: path.join(item.directory, entry.name), depth: item.depth + 1 });
      }
    }
  }

  return [...new Set(candidates)];
}

for (const modulePath of findCachedNodeModules()) {
  if (fs.existsSync(modulePath) && !module.paths.includes(modulePath)) {
    module.paths.push(modulePath);
  }
}

process.env.NODE_PATH = [...findCachedNodeModules(), process.env.NODE_PATH || '']
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

function requireOptional(name, fallbackPath) {
  try {
    return require(name);
  } catch (error) {
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      return require(fallbackPath);
    }
    throw error;
  }
}

function loadPlaywright() {
  return requireOptional('playwright');
}

function loadPng() {
  return requireOptional('pngjs');
}

async function expectVisible(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15_000 });
}

async function assertCanvasIsNotBlank(canvasLocator) {
  const { PNG } = loadPng();
  const screenshot = await canvasLocator.screenshot();
  const image = PNG.sync.read(screenshot);
  let coloredPixels = 0;

  for (let index = 0; index < image.data.length; index += 4) {
    const red = image.data[index];
    const green = image.data[index + 1];
    const blue = image.data[index + 2];
    const alpha = image.data[index + 3];

    if (alpha > 0 && (red > 8 || green > 8 || blue > 8)) {
      coloredPixels += 1;
    }
  }

  assert.ok(coloredPixels > image.width * image.height * 0.01, '3D canvas screenshot appears blank');
}

async function run() {
  const url = process.env.UAT_URL || 'http://127.0.0.1:4173';
  const { chromium } = loadPlaywright();
  const executableCandidates = [
    process.env.UAT_BROWSER,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  const executablePath = executableCandidates.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const runtimeErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await expectVisible(page, 'Układ Słoneczny 3D');
    await expectVisible(page, 'Planety');
    await expectVisible(page, 'Księżyce');
    await expectVisible(page, 'Porównanie');
    await expectVisible(page, 'Minimapa');
    await expectVisible(page, 'Copyright: Zuzia D.');

    const canvas = page.locator('canvas').first();
    await canvas.waitFor({ state: 'visible', timeout: 20_000 });
    await assertCanvasIsNotBlank(canvas);

    await page.getByRole('button', { name: /Pauza/i }).click();
    assert.equal(await page.getByRole('button', { name: /Pauza/i }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /Powrót do całego Układu Słonecznego/i }).click();
    await page.waitForTimeout(1_350);
    const cameraMarkerBeforeDrag = await page.locator('.minimap path').first().getAttribute('d');
    const canvasBox = await canvas.boundingBox();
    assert.ok(canvasBox, '3D canvas should have a bounding box');
    await page.mouse.move(canvasBox.x + canvasBox.width * 0.52, canvasBox.y + canvasBox.height * 0.42);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + canvasBox.width * 0.66, canvasBox.y + canvasBox.height * 0.52, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(450);
    const cameraMarkerAfterDrag = await page.locator('.minimap path').first().getAttribute('d');
    assert.notEqual(cameraMarkerAfterDrag, cameraMarkerBeforeDrag, 'mouse drag should move the camera');

    await page.getByLabel('Przejdź do obiektu Neptun').click();
    await page.getByRole('heading', { name: 'Neptun' }).waitFor({ state: 'visible' });

    await page.getByRole('button', { name: /^Mars$/ }).click();
    await page.getByRole('heading', { name: 'Mars' }).waitFor({ state: 'visible' });
    await expectVisible(page, 'Ciekawostka');
    await expectVisible(page, 'Atmosfera');

    await page.getByRole('button', { name: /Śledź obiekt Mars/i }).click();
    await page.getByRole('button', { name: /Zatrzymaj śledzenie/i }).first().waitFor({ state: 'visible' });

    await page.getByLabel('Szukaj obiektu w Układzie Słonecznym').fill('Saturn');
    await page.locator('.search-results button').filter({ hasText: 'Saturn' }).click();
    await page.getByRole('heading', { name: 'Saturn' }).waitFor({ state: 'visible' });
    await expectVisible(page, 'pierścieni');

    await page.getByRole('button', { name: /Rzeczywista/i }).click();
    assert.equal(await page.getByRole('button', { name: /Rzeczywista/i }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /10000x/i }).click();
    assert.equal(await page.getByRole('button', { name: /10000x/i }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /Wysoka/i }).click();
    assert.equal(await page.getByRole('button', { name: /Wysoka/i }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /Niska/i }).click();
    assert.equal(await page.getByRole('button', { name: /Niska/i }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: /Wyjaśnienie trybów skali/i }).click();
    await expectVisible(page, 'Skala wizualizacji');

    await page.getByRole('tab', { name: /Lekcja/i }).click();
    await expectVisible(page, 'Start w centrum');
    await page.getByRole('button', { name: /Pokaż Słońce/i }).click();
    await page.getByRole('heading', { name: 'Słońce' }).waitFor({ state: 'visible' });
    await page.getByRole('tab', { name: /Porównanie/i }).click();

    await page.getByLabel('Obiekt 1 do porównania').selectOption('venus');
    await page.getByLabel('Obiekt 2 do porównania').selectOption('jupiter');
    await expectVisible(page, 'Wenus');
    await expectVisible(page, 'Jowisz');
    await expectVisible(page, 'Grawitacja');

    await page.getByRole('tab', { name: /Quiz/i }).click();
    for (let index = 0; index < 10; index += 1) {
      await page.locator('.answer-grid button').first().click();
      await page.getByRole('button', { name: 'Sprawdź' }).click();

      if (index < 9) {
        await page.locator('.quiz-feedback').waitFor({ state: 'visible' });
        await page.getByRole('button', { name: 'Dalej' }).click();
      }
    }
    await expectVisible(page, 'Quiz zakończony');
    await expectVisible(page, 'poprawnych odpowiedzi');

    await page.getByRole('tab', { name: /Osiągnięcia/i }).click();
    await expectVisible(page, 'Planetarny odkrywca');
    await expectVisible(page, 'Mistrz quizów');

    await page.setViewportSize({ width: 390, height: 844 });
    await expectVisible(page, 'Układ Słoneczny 3D');
    await canvas.waitFor({ state: 'visible', timeout: 20_000 });
    await page.getByRole('button', { name: /Rozwiń panel sterowania/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /Rozwiń panel sterowania/i }).click();
    await page.getByLabel('Szukaj obiektu w Układzie Słonecznym').waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /Zwiń panel sterowania/i }).click();
    await page.getByRole('button', { name: /^Obiekty$/ }).click();
    await page.getByRole('button', { name: /^Mars$/ }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /^Nauka$/ }).click();
    await page.getByRole('tab', { name: /Quiz/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /^Panel$/ }).click();
    await page.locator('.education-panel').waitFor({ state: 'visible', timeout: 10_000 });

    assert.deepEqual(runtimeErrors, [], `runtime errors: ${runtimeErrors.join('\n')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join('\n')}`);

    console.log(`UAT OK: ${url}`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
