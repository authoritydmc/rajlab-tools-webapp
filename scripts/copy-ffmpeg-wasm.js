#!/usr/bin/env node
/**
 * copy-ffmpeg-wasm.js
 * Copies FFmpeg WASM binaries from node_modules into public/vendor/ffmpeg-core/
 * so they are served from the same origin — no CDN dependency.
 *
 * Runs automatically via "prebuild" and "predev" npm hooks.
 */

import { existsSync, mkdirSync, copyFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SRC_DIR = resolve(ROOT, 'node_modules/@ffmpeg/core/dist/esm');
const DEST_DIR = resolve(ROOT, 'public/vendor/ffmpeg-core');

const FILES = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

console.log('\n🎬 copy-ffmpeg-wasm: Copying FFmpeg WASM binaries to public/...\n');

if (!existsSync(SRC_DIR)) {
  console.error(`❌ Source not found: ${SRC_DIR}`);
  console.error('   Run: npm install @ffmpeg/core --save-dev');
  process.exit(1);
}

if (!existsSync(DEST_DIR)) {
  mkdirSync(DEST_DIR, { recursive: true });
  console.log(`📁 Created: public/vendor/ffmpeg-core/`);
}

let allOk = true;
for (const file of FILES) {
  const src = resolve(SRC_DIR, file);
  const dest = resolve(DEST_DIR, file);

  if (!existsSync(src)) {
    console.error(`❌ Missing source file: ${src}`);
    allOk = false;
    continue;
  }

  copyFileSync(src, dest);
  const size = statSync(dest).size;
  console.log(`   ✅ ${file.padEnd(24)} ${formatBytes(size)}`);
}

if (!allOk) {
  process.exit(1);
}

console.log('\n✅ FFmpeg WASM binaries ready at public/vendor/ffmpeg-core/\n');
