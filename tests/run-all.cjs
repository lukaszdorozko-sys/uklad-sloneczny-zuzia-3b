const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;
const port = Number(process.env.UAT_PORT || 4174);
const uatUrl = `http://127.0.0.1:${port}`;

function run(label, args, options = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(node, args, {
    cwd: root,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

function waitForServer(url, timeoutMs = 30_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on('error', retry);
      request.setTimeout(2_000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Preview server did not become ready at ${url}`));
        return;
      }
      setTimeout(probe, 500);
    };

    probe();
  });
}

async function main() {
  run('TypeScript typecheck', ['node_modules/typescript/bin/tsc', '-b']);
  run('ESLint', [
    'node_modules/eslint/bin/eslint.js',
    '.',
    '--ext',
    'ts,tsx',
    '--report-unused-disable-directives',
    '--max-warnings',
    '0',
  ]);
  run('Node automated tests', ['--test', 'tests/*.test.cjs']);
  run('Production build', ['node_modules/vite/bin/vite.js', 'build']);

  console.log('\n== Vite preview ==');
  const preview = spawn(
    node,
    ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );

  preview.stdout.on('data', (chunk) => process.stdout.write(chunk));
  preview.stderr.on('data', (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer(uatUrl);
    run('UAT browser scenario', ['tests/uat-production.cjs'], { env: { UAT_URL: uatUrl } });
    run('UX audit', ['tests/ux-audit.cjs'], { env: { UX_URL: uatUrl } });
  } finally {
    preview.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
