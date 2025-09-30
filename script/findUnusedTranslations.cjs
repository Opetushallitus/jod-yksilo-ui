const fs = require('node:fs');
const path = require('node:path');

const SRC_DIR = path.join(__dirname, '../src');
const TRANSLATION_FILE = path.join(SRC_DIR, 'i18n', 'fi', 'translation.json');
const IGNORED_DIRS = new Set(['i18n']);

function findFiles(dir, files = []) {
  if (IGNORED_DIRS.has(path.basename(dir))) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        findFiles(fullPath, files);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractCodeStrings(files) {
  const strings = new Set();
  const tCalls = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const tMatches = content.match(/t\(\s*(?:['"`])[^'"`]+(?:['"`])\s*\)/g) || [];
    for (const match of tMatches) {
      const keyMatch = match.match(/t\(\s*(?:['"`])([^'"`]+)(?:['"`])\s*\)/);
      if (keyMatch) tCalls.push(keyMatch[1]);
    }
    const stringMatches = content.match(/(?:['"`])[^'"`]+(?:['"`])/g) || [];
    for (const s of stringMatches) {
      let cleaned = s.replaceAll('"', '').replaceAll("'", '').replaceAll('`', '');
      strings.add(cleaned);
    }
  }
  return { strings: Array.from(strings), tCalls };
}

function flattenTranslations(obj, prefix = '') {
  const keys = [];
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      keys.push(prefix ? `${prefix}.${key}` : key);
    } else if (typeof val === 'object' && val !== null) {
      keys.push(...flattenTranslations(val, prefix ? `${prefix}.${key}` : key));
    }
  }
  return keys;
}

(function main() {
  const srcFiles = findFiles(SRC_DIR);
  const { strings, tCalls } = extractCodeStrings(srcFiles);
  const translationJson = JSON.parse(fs.readFileSync(TRANSLATION_FILE, 'utf8'));
  const allTranslationKeys = flattenTranslations(translationJson);

  const usedKeys = new Set([...strings, ...tCalls]);
  const unusedKeys = allTranslationKeys.filter((key) => !usedKeys.has(key));

  for (const key of unusedKeys) {
    console.log(key);
  }
  console.log(`---------------------------------------------------------------`);
  console.log(`Found ${unusedKeys.length} potentially unused translation keys`);
  console.log(`---------------------------------------------------------------`);
})();
