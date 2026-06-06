const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const screenshotDir = path.join(root, 'ux-screenshots');

function findCachedNodeModules() {
  const candidates = [
    process.env.TEST_NODE_MODULES,
    process.env.PLAYWRIGHT_NODE_MODULES,
    path.join(root, 'node_modules'),
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

function browserExecutablePath() {
  return [
    process.env.UX_BROWSER,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
    .filter(Boolean)
    .find((candidate) => fs.existsSync(candidate));
}

async function assertCanvasIsVisible(canvasLocator) {
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

  assert.ok(coloredPixels > image.width * image.height * 0.01, '3D canvas appears blank');
}

async function visibleTextMustFit(page) {
  const offenders = await page.evaluate(() => {
    const selectors = ['button', 'input', 'select', '.fact-grid strong', '.label-pill', '.student-watermark', '.lesson-copy h2', '.lesson-copy p', '.scale-help'];
    const elements = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));
    return elements
      .filter((element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
          return false;
        }
        return element.scrollWidth - element.clientWidth > 2 || element.scrollHeight - element.clientHeight > 2;
      })
      .slice(0, 12)
      .map((element) => ({
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
        selector: element.className || element.tagName,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
      }));
  });

  assert.deepEqual(offenders, [], `visible text overflow: ${JSON.stringify(offenders, null, 2)}`);
}

async function panelsMustNotOverlap(page, viewportName) {
  const overlaps = await page.evaluate(() => {
    const selectors = ['.top-toolbar', '.object-list', '.minimap', '.education-panel', '.learning-dock'];
    const panels = selectors
      .map((selector) => {
        const element = document.querySelector(selector);
        if (!element) {
          return null;
        }
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
          return null;
        }
        return { selector, rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } };
      })
      .filter(Boolean);

    const issues = [];
    for (let leftIndex = 0; leftIndex < panels.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < panels.length; rightIndex += 1) {
        const a = panels[leftIndex];
        const b = panels[rightIndex];
        const overlapWidth = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
        const overlapHeight = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));
        const overlapArea = overlapWidth * overlapHeight;
        if (overlapArea > 24) {
          issues.push({ a: a.selector, b: b.selector, overlapArea: Math.round(overlapArea) });
        }
      }
    }
    return issues;
  });

  assert.deepEqual(overlaps, [], `${viewportName} panel overlaps: ${JSON.stringify(overlaps, null, 2)}`);
}

async function saveScreenshot(page, name) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const filePath = path.join(screenshotDir, name);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function run() {
  const url = process.env.UX_URL || 'http://127.0.0.1:4175';
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    headless: true,
    executablePath: browserExecutablePath(),
    args: ['--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  const runtimeErrors = [];
  const consoleErrors = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  const screenshots = [];

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.getByText('Układ Słoneczny 3D').waitFor({ state: 'visible', timeout: 20_000 });
    await page.getByText('Copyright: Zuzia D.').waitFor({ state: 'visible', timeout: 20_000 });
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20_000 });
    await assertCanvasIsVisible(page.locator('canvas').first());
    await panelsMustNotOverlap(page, 'desktop overview');
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'desktop-overview.png'));

    await page.getByRole('button', { name: /^Jowisz$/ }).click();
    await page.getByRole('heading', { name: 'Jowisz' }).waitFor({ state: 'visible', timeout: 15_000 });
    await panelsMustNotOverlap(page, 'desktop selected body');
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'desktop-jupiter-panel.png'));

    await page.getByRole('tab', { name: /Quiz/i }).click();
    await page.locator('.answer-grid button').first().click();
    await page.getByRole('button', { name: 'Sprawdź' }).click();
    await page.locator('.quiz-feedback').waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByText(/1\/10|2\/10/).first().waitFor({ state: 'visible', timeout: 10_000 });
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'desktop-quiz-feedback.png'));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(700);
    await page.getByText('Układ Słoneczny 3D').waitFor({ state: 'visible', timeout: 15_000 });
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('button', { name: /Rozwiń panel sterowania/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await page.getByRole('button', { name: /Zamknij panel mobilny/i }).click();
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'mobile-overview.png'));

    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(500);
    const compactToolbarHeight = await page.locator('.top-toolbar').evaluate((element) => element.getBoundingClientRect().height);
    assert.ok(compactToolbarHeight < 90, `landscape compact toolbar is too tall: ${compactToolbarHeight}px`);
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'mobile-landscape-compact.png'));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /^Nauka$/ }).click();
    await page.getByRole('tab', { name: /Lekcja/i }).waitFor({ state: 'visible', timeout: 10_000 });
    await visibleTextMustFit(page);

    await page.getByRole('button', { name: /Rozwiń panel sterowania/i }).click();
    await page.getByLabel('Szukaj obiektu w Układzie Słonecznym').fill('Europa');
    await page.locator('.search-results button').filter({ hasText: 'Europa' }).click();
    await page.getByRole('heading', { name: 'Europa' }).waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByRole('button', { name: /Zwiń panel sterowania/i }).click();
    await visibleTextMustFit(page);
    screenshots.push(await saveScreenshot(page, 'mobile-europa-panel.png'));

    assert.deepEqual(runtimeErrors, [], `runtime errors: ${runtimeErrors.join('\n')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join('\n')}`);

    console.log('UX OK');
    for (const filePath of screenshots) {
      console.log(filePath);
    }
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
