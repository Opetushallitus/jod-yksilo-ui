/**
 * Static scan of the source tree for translation keys in use, shared by the tag scripts.
 */

import fs from 'node:fs';
import path from 'node:path';

import { extractStaticKeys } from './translation-utils.js';

const CODE_EXTENSIONS = ['.ts', '.tsx'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', 'coverage', '.git']);

/**
 * Get all files with specific extensions recursively
 */
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.has(file)) {
        getAllFiles(filePath, extensions, fileList);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Extract all translation keys used in code.
 *
 * @param {string} srcDir
 * @param {string} defaultNamespace
 * @returns {Map<string, unknown[]>} - 'namespace:key' → usages
 */
export function extractKeysFromCode(srcDir, defaultNamespace) {
  const allKeysMap = new Map();
  const files = getAllFiles(srcDir, CODE_EXTENSIONS);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(srcDir, file);
    const lines = content.split('\n');

    const keysMap = extractStaticKeys(content, relativePath, defaultNamespace, lines);
    for (const [key, usages] of keysMap.entries()) {
      if (!allKeysMap.has(key)) {
        allKeysMap.set(key, []);
      }
      allKeysMap.get(key).push(...usages);
    }
  }

  return allKeysMap;
}

export function logCodeKeysStats(codeKeys, codeKeysByNamespace) {
  console.log(`   Found ${codeKeys.size} unique keys in code`);
  for (const [namespace, keys] of Object.entries(codeKeysByNamespace)) {
    console.log(`   • ${namespace}: ${keys.size} keys`);
  }
  console.log('');
}
