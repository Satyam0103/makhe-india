import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';

const distServer = path.resolve(process.cwd(), 'dist/server/index.js');
const isProd = process.env.NODE_ENV === 'production';

if (isProd && fs.existsSync(distServer)) {
  // Production runtime: directly execute compiled server JavaScript
  await import('./dist/server/index.js');
} else {
  const hasTsx = process.execArgv.some((arg) => arg.includes('tsx')) || process.env.__MAKH_TSX === '1';

  if (!hasTsx) {
    // If started via direct `node server.ts`, ensure tsx loader is attached
    const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(1)], {
      stdio: 'inherit',
      env: { ...process.env, __MAKH_TSX: '1' },
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
      }
      process.exit(code ?? 0);
    });
  } else {
    // TSX loader active: boot the full-stack server
    const { bootstrapServer } = await import('./server/src/runtime.ts');
    await bootstrapServer();
  }
}
