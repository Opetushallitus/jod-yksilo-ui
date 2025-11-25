#!/usr/bin/env node

/**
 * Translation Key Analyzer
 *
 * Analyzes translation keys in the codebase and compares them with translation files
 * to detect:
 * 1. Missing translations (keys in code but not in translation files)
 * 2. Unused translations (keys in translation files but not used in code)
 * 3. Dynamic translation keys (cannot be statically analyzed)
 *
 * Supports i18next plural forms (_one, _other, _many, _few, _zero)
 *
 * Usage:
 *   node scripts/translations/analyze-translations.js
 *   node scripts/translations/analyze-translations.js --list-unused
 *   node scripts/translations/analyze-translations.js --list-missing fi,en
 *   node scripts/translations/analyze-translations.js --list-unused --list-missing fi,en,sv
 *   node scripts/translations/analyze-translations.js --ci --check-langs fi,sv
 *
 * CI Mode:
 *   --ci                       Exit with code 1 if issues found (for git hooks/CI)
 *   --check-langs fi,sv        Languages to check in CI mode (default: fi,sv)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DYNAMIC_KEY_EXCEPTIONS } from './exceptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LANGUAGES = ['fi', 'en', 'sv'];
const PLURAL_SUFFIXES = ['_one', '_other', '_many', '_few', '_zero'];
const SRC_DIR = path.join(__dirname, '../../src');
const I18N_DIR = path.join(SRC_DIR, 'i18n');
const CODE_EXTENSIONS = ['.ts', '.tsx'];

// Parse command line arguments
const args = process.argv.slice(2);
const listUnused = args.includes('--list-unused');
const listMissingArg = args.find((arg) => arg.startsWith('--list-missing'));
const listMissingLangs = listMissingArg
  ? (args[args.indexOf(listMissingArg) + 1] || 'fi,en,sv').split(',').map((l) => l.trim())
  : null;
const ciMode = args.includes('--ci');
const checkLangsArg = args.find((arg) => arg.startsWith('--check-langs'));
const checkLangs = checkLangsArg ? args[args.indexOf(checkLangsArg) + 1].split(',').map((l) => l.trim()) : ['fi', 'sv'];

/**
 * Flatten nested JSON object to dot notation
 * Example: { a: { b: 'value' } } => { 'a.b': 'value' }
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
}

/**
 * Load and merge translation files for a language
 * Returns { translations, keyToFile } where keyToFile maps each key to its source file
 */
function loadTranslations(lang) {
  const translations = {};
  const keyToFile = {};
  const langDir = path.join(I18N_DIR, lang);

  // Load main translation file
  const mainFile = path.join(langDir, 'translation.json');
  if (fs.existsSync(mainFile)) {
    const content = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
    const flattened = flattenObject(content);
    Object.assign(translations, flattened);
    for (const key of Object.keys(flattened)) {
      keyToFile[key] = 'translation.json';
    }
  }

  // Load draft translation file (overrides main)
  const draftFile = path.join(langDir, 'draft.translation.json');
  if (fs.existsSync(draftFile)) {
    const content = JSON.parse(fs.readFileSync(draftFile, 'utf-8'));
    const flattened = flattenObject(content);
    Object.assign(translations, flattened);
    for (const key of Object.keys(flattened)) {
      keyToFile[key] = 'draft.translation.json';
    }
  }

  return { translations, keyToFile };
}

/**
 * Get all files with specific extensions recursively
 */
function getAllFiles(dir, extensions, fileList = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', 'dist', 'build', 'coverage', '.git'].includes(file)) {
        getAllFiles(filePath, extensions, fileList);
      }
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Find line number for a position in content
 */
function findLineNumber(position, lines) {
  let lineNum = 1;
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1; // +1 for newline
    if (charCount > position) {
      return i + 1;
    }
  }
  return lineNum;
}

/**
 * Check if a dynamic key matches any exception
 */
function isExceptionMatch(relativePath, codeLine) {
  const normalizedPath = path.normalize(relativePath);
  return DYNAMIC_KEY_EXCEPTIONS.some((exception) => {
    const normalizedExceptionPath = path.normalize(exception.file);
    return normalizedPath.includes(normalizedExceptionPath) && exception.pattern.test(codeLine);
  });
}

/**
 * Process dynamic key matches for a file
 */
function processDynamicKeys(content, relativePath, lines, dynamicPatterns) {
  const dynamicKeys = [];
  const dynamicMatches = new Set();

  for (const { pattern, name } of dynamicPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = findLineNumber(match.index, lines);
      const codeLine = lines[lineNum - 1].trim();

      if (isExceptionMatch(relativePath, codeLine)) {
        continue;
      }

      const matchId = `${relativePath}:${lineNum}:${codeLine}`;
      if (!dynamicMatches.has(matchId)) {
        dynamicMatches.add(matchId);
        dynamicKeys.push({
          file: relativePath,
          line: lineNum,
          code: codeLine.length > 100 ? codeLine.substring(0, 100) + '...' : codeLine,
          type: name,
        });
      }
    }
  }

  return dynamicKeys;
}

/**
 * Extract static translation keys from content
 */
function extractStaticKeys(content, relativePath, patterns) {
  const keysMap = new Map();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1];

      // Skip if key contains template literals or variables
      if (key.includes('${') || key.includes('`')) {
        continue;
      }

      if (!keysMap.has(key)) {
        keysMap.set(key, []);
      }
      keysMap.get(key).push(relativePath);
    }
  }

  return keysMap;
}

/**
 * Get regex patterns for static keys
 */
function getStaticKeyPatterns() {
  return [
    // t('key') or t("key") - including with options
    /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,

    // i18n.t('key') or i18n.t("key")
    /i18n\.t\s*\(\s*['"`]([^'"`]+)['"`]/g,

    // <Trans i18nKey="key" /> or <Trans i18nKey='key' />
    /i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,

    // i18n.exists('key')
    /i18n\.exists\s*\(\s*['"`]([^'"`]+)['"`]/g,
  ];
}

/**
 * Get regex patterns for dynamic keys
 */
function getDynamicKeyPatterns() {
  return [
    // t(`template ${var}`) - template literals with interpolation
    {
      pattern: /\bt\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 't() with template literal',
    },
    // t('string' + anything) or t("string" + anything) - string concatenation
    {
      pattern: /\bt\s*\(\s*['"][^'"]*['"]\s*\+/g,
      name: 't() with string concatenation',
    },
    // t(variable) or t(variable, options) - direct variable usage
    // Matches t(variable) or t(variable.property) with or without options
    {
      pattern: /\bt\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[,)]/g,
      name: 't() with variable',
    },
    // i18n.t with template literals
    {
      pattern: /i18n\.t\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 'i18n.t() with template literal',
    },
    // i18n.t with concatenation
    {
      pattern: /i18n\.t\s*\(\s*['"][^'"]*['"]\s*\+/g,
      name: 'i18n.t() with string concatenation',
    },
    // i18n.t(variable) or i18n.t(variable, options)
    {
      pattern: /i18n\.t\s*\(\s*[a-zA-Z_$][a-zA-Z0-9_$.]*\s*[,)]/g,
      name: 'i18n.t() with variable',
    },
    // <Trans i18nKey={variable} />
    {
      pattern: /i18nKey\s*=\s*\{[^}]+\}/g,
      name: '<Trans i18nKey={...} />',
    },
  ];
}

/**
 * Extract translation keys from code
 * Returns { keysMap, dynamicKeys }
 * - keysMap: Map of key -> [files where it's used]
 * - dynamicKeys: Array of { file, line, code } for dynamic translation keys
 */
function extractKeysFromCode() {
  const allKeysMap = new Map();
  const allDynamicKeys = [];
  const files = getAllFiles(SRC_DIR, CODE_EXTENSIONS);

  const patterns = getStaticKeyPatterns();
  const dynamicPatterns = getDynamicKeyPatterns();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(SRC_DIR, file);
    const lines = content.split('\n');

    // Process dynamic keys
    const dynamicKeys = processDynamicKeys(content, relativePath, lines, dynamicPatterns);
    allDynamicKeys.push(...dynamicKeys);

    // Extract static keys
    const keysMap = extractStaticKeys(content, relativePath, patterns);
    for (const [key, files] of keysMap.entries()) {
      if (!allKeysMap.has(key)) {
        allKeysMap.set(key, []);
      }
      allKeysMap.get(key).push(...files);
    }
  }

  return { keysMap: allKeysMap, dynamicKeys: allDynamicKeys };
}

/**
 * Get base key without plural suffix
 */
function getBaseKey(key) {
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
  }
  return key;
}

/**
 * Check if a key is a plural form
 */
function isPluralKey(key) {
  return PLURAL_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Get all plural variants for a base key that exist in translations
 */
function getPluralVariants(baseKey, translations) {
  const variants = [];
  for (const suffix of PLURAL_SUFFIXES) {
    const pluralKey = baseKey + suffix;
    if (translations.hasOwnProperty(pluralKey)) {
      variants.push(pluralKey);
    }
  }
  return variants;
}

/**
 * Analyze translations
 */
/**
 * Build expected keys for a language
 */
function buildExpectedKeys(codeKeys, translations) {
  const expectedKeys = new Map();

  for (const [key, files] of codeKeys.entries()) {
    const pluralVariants = getPluralVariants(key, translations);

    if (pluralVariants.length > 0) {
      // If plural variants exist, we expect all of them (not the base key)
      for (const pluralKey of pluralVariants) {
        expectedKeys.set(pluralKey, files);
      }
    } else {
      // No plural variants, expect the base key
      expectedKeys.set(key, files);
    }
  }

  return expectedKeys;
}

/**
 * Find missing translations for a language
 */
function findMissingTranslations(expectedKeys, translationKeys) {
  const missing = [];

  for (const [key, files] of expectedKeys.entries()) {
    if (!translationKeys.has(key)) {
      missing.push({ key, files: [...new Set(files)] });
    }
  }

  return missing;
}

/**
 * Find unused translations for a language
 */
function findUnusedTranslations(translationKeys, codeKeys, keyToFile) {
  const unused = [];

  for (const key of translationKeys) {
    const baseKey = getBaseKey(key);

    // A translation key is used if:
    // 1. It's directly in codeKeys (base form), OR
    // 2. It's a plural variant and its base key is in codeKeys
    const isUsed = codeKeys.has(key) || (isPluralKey(key) && codeKeys.has(baseKey));

    if (!isUsed) {
      unused.push({ key, file: keyToFile[key] });
    }
  }

  return unused;
}

/**
 * Analyze translations for a single language
 */
function analyzeLanguage(lang, codeKeys, translationsByLang) {
  const { translations, keyToFile } = translationsByLang[lang];
  const translationKeys = new Set(Object.keys(translations));

  const expectedKeys = buildExpectedKeys(codeKeys, translations);
  const missing = findMissingTranslations(expectedKeys, translationKeys);
  const unused = findUnusedTranslations(translationKeys, codeKeys, keyToFile);

  return { missing, unused, translations };
}

function analyzeTranslations() {
  console.log('🔍 Analyzing translation keys...\n');

  // Extract keys from code
  const { keysMap: codeKeys, dynamicKeys } = extractKeysFromCode();
  console.log(`Found ${codeKeys.size} unique translation keys in code`);
  if (dynamicKeys.length > 0) {
    console.log(`⚠️  Found ${dynamicKeys.length} dynamic translation key(s) that cannot be analyzed`);
  }
  console.log('');

  // Load translations for all languages
  const translationsByLang = {};
  for (const lang of LANGUAGES) {
    translationsByLang[lang] = loadTranslations(lang);
    console.log(`Loaded ${Object.keys(translationsByLang[lang].translations).length} translation keys for ${lang}`);
  }
  console.log('');

  // Analyze each language
  const results = { dynamicKeys };
  for (const lang of LANGUAGES) {
    results[lang] = analyzeLanguage(lang, codeKeys, translationsByLang);
  }

  return results;
}

/**
 * Print results
 */
/**
 * Print summary table
 */
function printSummary(results) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TRANSLATION ANALYSIS REPORT                ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📊 SUMMARY\n');
  console.log('┌──────────┬─────────────────────┬─────────────────────┐');
  console.log('│ Language │ Missing Translations│ Unused Translations │');
  console.log('├──────────┼─────────────────────┼─────────────────────┤');

  for (const lang of LANGUAGES) {
    const { missing, unused } = results[lang];
    console.log(
      `│   ${lang.toUpperCase()}     │         ${String(missing.length).padStart(3)}         │         ${String(unused.length).padStart(3)}         │`,
    );
  }

  console.log('└──────────┴─────────────────────┴─────────────────────┘\n');
}

/**
 * Group keys by base key for plural forms
 */
function groupKeysByBase(items) {
  const grouped = {};

  for (const item of items) {
    const key = item.key;
    const baseKey = getBaseKey(key);

    if (!grouped[baseKey]) {
      grouped[baseKey] = { keys: [], files: new Set() };
    }

    grouped[baseKey].keys.push(key);

    if (item.file) {
      grouped[baseKey].files.add(item.file);
    }

    if (item.files) {
      for (const f of item.files) {
        grouped[baseKey].files.add(f);
      }
    }
  }

  return grouped;
}

/**
 * Format key display with plural forms
 */
function formatKeyDisplay(baseKey, keys) {
  if (keys.length === 1) {
    return `  • ${keys[0]}`;
  }
  const pluralForms = keys.map((k) => k.replace(baseKey, '')).join(', ');
  return `  • ${baseKey} (plural forms: ${pluralForms})`;
}

/**
 * Format file list display
 */
function formatFileList(files, showFiles, lang) {
  if (!showFiles || files.size === 0) {
    return null;
  }

  const filesList = [...files].slice(0, 3).join(', ');
  const moreCount = files.size > 3 ? ` +${files.size - 3} more` : '';
  const prefix = lang ? `${lang}/` : '';
  const label = showFiles === 'found' ? 'Found in' : 'Used in';

  return `    ${label}: ${prefix}${filesList}${moreCount}`;
}

/**
 * Print grouped keys with their files
 */
function printGroupedKeys(grouped, showFiles, lang = null) {
  for (const [baseKey, { keys, files }] of Object.entries(grouped)) {
    console.log(formatKeyDisplay(baseKey, keys));

    const fileList = formatFileList(files, showFiles, lang);
    if (fileList) {
      console.log(fileList);
    }
  }
}

/**
 * Print unused translations section
 */
function printUnusedTranslations(results) {
  console.log('\n📝 UNUSED TRANSLATIONS (keys in translation files but not used in code)\n');

  for (const lang of LANGUAGES) {
    const { unused } = results[lang];
    if (unused.length > 0) {
      console.log(`\n${lang.toUpperCase()} (${unused.length} unused keys):`);
      console.log('─'.repeat(70));

      const grouped = groupKeysByBase(unused);
      printGroupedKeys(grouped, 'found', lang);
    }
  }
}

/**
 * Print missing translations section
 */
function printMissingTranslations(results) {
  console.log('\n\n⚠️  MISSING TRANSLATIONS (keys in code but not in translation files)\n');

  for (const lang of LANGUAGES) {
    if (!listMissingLangs.includes(lang)) continue;

    const { missing } = results[lang];
    if (missing.length > 0) {
      console.log(`\n${lang.toUpperCase()} (${missing.length} missing keys):`);
      console.log('─'.repeat(70));

      const grouped = groupKeysByBase(missing);
      printGroupedKeys(grouped, 'used');
    }
  }
}

/**
 * Print dynamic keys section
 */
function printDynamicKeys(results) {
  if (!results.dynamicKeys || results.dynamicKeys.length === 0 || ciMode) {
    return;
  }

  console.log('⚠️  DYNAMIC TRANSLATION KEYS (cannot be statically analyzed)\n');
  console.log(`Found ${results.dynamicKeys.length} dynamic translation key(s):\n`);

  // Group by file
  const byFile = {};
  for (const { file, line, code, type } of results.dynamicKeys) {
    if (!byFile[file]) {
      byFile[file] = [];
    }
    byFile[file].push({ line, code, type });
  }

  for (const [file, entries] of Object.entries(byFile)) {
    console.log(`📄 ${file}`);
    for (const { line, code, type } of entries) {
      console.log(`   Line ${line}: ${code}`);
      console.log(`   Type: ${type}`);
    }
    console.log('');
  }

  console.log('💡 Dynamic keys use variables or string concatenation, making static analysis');
  console.log('   impossible. Consider using static keys when possible.\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Check if results have any issues for checked languages
 */
function hasTranslationIssues(results, checkLangs) {
  let hasMissingKeys = false;
  let hasUnusedKeys = false;

  for (const lang of checkLangs) {
    if (results[lang]) {
      if (results[lang].missing.length > 0) hasMissingKeys = true;
      if (results[lang].unused.length > 0) hasUnusedKeys = true;
    }
  }

  return { hasMissingKeys, hasUnusedKeys };
}

/**
 * Print CI validation failure message
 */
function printCIFailure(hasDynamicKeys, hasMissingKeys, hasUnusedKeys, results, checkLangs) {
  console.log('❌ Translation validation failed!\n');

  if (hasDynamicKeys) {
    console.log(`   • ${results.dynamicKeys.length} dynamic translation key(s) found`);
  }
  if (hasMissingKeys) {
    console.log(`   • Missing translations in: ${checkLangs.join(', ')}`);
  }
  if (hasUnusedKeys) {
    console.log(`   • Unused translations in: ${checkLangs.join(', ')}`);
  }

  console.log('\nRun without --ci flag for detailed information.\n');
}

/**
 * Check CI mode and return exit code
 */
function checkCIMode(results) {
  if (!ciMode) {
    return 0;
  }

  const hasDynamicKeys = results.dynamicKeys && results.dynamicKeys.length > 0;
  const { hasMissingKeys, hasUnusedKeys } = hasTranslationIssues(results, checkLangs);

  if (hasDynamicKeys || hasMissingKeys || hasUnusedKeys) {
    printCIFailure(hasDynamicKeys, hasMissingKeys, hasUnusedKeys, results, checkLangs);
    return 1;
  }

  console.log(`✅ Translation validation passed for languages: ${checkLangs.join(', ')}\n`);
  return 0;
}

/**
 * Print results
 */
function printResults(results) {
  printSummary(results);

  if (listUnused) {
    printUnusedTranslations(results);
  }

  if (listMissingLangs) {
    printMissingTranslations(results);
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');

  printDynamicKeys(results);

  // Show help if no detailed flags were used
  if (!listUnused && !listMissingLangs && !ciMode) {
    console.log('💡 TIP: Use flags to see detailed lists:');
    console.log('   --list-unused              List all unused translation keys');
    console.log('   --list-missing fi,en,sv    List missing keys for specified languages\n');
  }

  return checkCIMode(results);
}

// Main execution
try {
  const results = analyzeTranslations();
  const exitCode = printResults(results);
  process.exit(exitCode);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
