import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_FILE = path.join(process.cwd(), 'data', 'extractionCache.json');

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function getCachedExtraction(rawText) {
  const cache = loadCache();
  return cache[hashText(rawText)] || null;
}

export function setCachedExtraction(rawText, structuredData) {
  const cache = loadCache();
  cache[hashText(rawText)] = structuredData;
  saveCache(cache);
}