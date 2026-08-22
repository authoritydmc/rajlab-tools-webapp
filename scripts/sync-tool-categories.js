#!/usr/bin/env node
/**
 * sync-tool-categories.js
 * Keeps public/toolCategories.json in sync with src/toolCategories.json
 * so that any runtime fetch('/toolCategories.json') and the dynamic
 * useCategorySiblings hook always see the same data.
 * Runs automatically via prebuild/predev hooks.
 */
import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SRC = resolve(ROOT, 'src/toolCategories.json');
const DEST = resolve(ROOT, 'public/toolCategories.json');

if (!existsSync(SRC)) {
  console.error(`Missing source: ${SRC}`);
  process.exit(1);
}

copyFileSync(SRC, DEST);
console.log('✓ Synced public/toolCategories.json from src/toolCategories.json');
