import { readFileSync } from 'node:fs';
// The complete, licensed corpus ships with the app; no download on startup.
export const seed = JSON.parse(
  readFileSync(new URL('./data/core-5000.json', import.meta.url), 'utf8'),
);
export const corpus = JSON.parse(
  readFileSync(new URL('./data/manifest.json', import.meta.url), 'utf8'),
);
