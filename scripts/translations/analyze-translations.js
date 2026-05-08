#!/usr/bin/env node

/**
 * Translation Key Analyzer
 *
 * Analyzes translation keys in the codebase and compares them with translation files
 * to detect:
 * 1. Missing translations (keys in code but not in translation files)
 * 2. Unused translations (keys in translation files but not used in code)
 * 3. Dynamic translation keys (cannot be statically analyzed)
 * 4. Duplicate keys across namespaces (fatal only if used in multiple namespaces in code, or unused in code; allowlist overrides)
 *
 * Supports i18next plural forms (_one, _other, _many, _few, _zero)
 *
 * Exit codes:
 *   0 - All checks passed (unused translations are OK)
 *   1 - Critical issues found (missing translations, dynamic keys, or duplicate keys)
 *
 * Optional .tolgeerc.json: "allowedCrossNamespaceDuplicates" — string key paths or
 * { "key": "path", "namespaces": ["a","b"] } to allow JSON duplicates before code is updated.
 *
 * Usage:
 *   node scripts/translations/analyze-translations.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getTolgeeConfigPathFromScriptsDir, readAndValidateTolgeeConfig } from './tolgee-config.js';
import {
  PLURAL_SUFFIXES,
  buildCodeKeysByNamespaceFromMap,
  extractStaticKeys,
  flattenObject,
  getBaseKey,
  getNamespacesUsingKeyPath,
  isPluralKey,
  processDynamicKeys,
} from './translation-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LANGUAGES = ['fi', 'en', 'sv'];
const SRC_DIR = path.join(__dirname, '../../src');
const I18N_BASE_DIR = path.join(SRC_DIR, 'i18n');
const CODE_EXTENSIONS = ['.ts', '.tsx'];

/**
 * Locale-aware copy sort for namespace strings (deterministic comparisons / display).
 */
function sortStringsCopy(items) {
  return [...items].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/**
 * Load and merge translation files for a language and namespace
 * Returns { translations, keyToFile } where keyToFile maps 'namespace:key' to its source file
 */
function loadTranslations(lang, namespace) {
  const translations = {};
  const keyToFile = {};

  // Load main translation file
  const mainFile = path.join(I18N_BASE_DIR, namespace, `${lang}.json`);
  if (fs.existsSync(mainFile)) {
    const content = JSON.parse(fs.readFileSync(mainFile, 'utf-8'));
    const flattened = flattenObject(content);
    // Prefix keys with namespace
    for (const key of Object.keys(flattened)) {
      const namespacedKey = `${namespace}:${key}`;
      translations[namespacedKey] = flattened[key];
      keyToFile[namespacedKey] = `${namespace}/${lang}.json`;
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
 * Extract translation keys from code
 * Returns { keysMap, dynamicKeys }
 * - keysMap: Map of 'namespace:key' -> [files where it's used]
 * - dynamicKeys: Array of { file, line, code } for dynamic translation keys
 */
function extractKeysFromCode(defaultNamespace) {
  const allKeysMap = new Map();
  const allDynamicKeys = [];
  const files = getAllFiles(SRC_DIR, CODE_EXTENSIONS);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const relativePath = path.relative(SRC_DIR, file);
    const lines = content.split('\n');

    // Process dynamic keys
    const dynamicKeys = processDynamicKeys(content, relativePath, lines);
    allDynamicKeys.push(...dynamicKeys);

    // Extract static keys
    const keysMap = extractStaticKeys(content, relativePath, defaultNamespace, lines);
    for (const [key, usages] of keysMap.entries()) {
      if (!allKeysMap.has(key)) {
        allKeysMap.set(key, []);
      }
      allKeysMap.get(key).push(...usages);
    }
  }

  return { keysMap: allKeysMap, dynamicKeys: allDynamicKeys };
}

/**
 * Get all plural variants for a base key that exist in translations
 * Works with namespace:key format and translation object
 */
function getAllPluralVariants(baseKey, translations) {
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
 * Build expected keys for a language
 */
function buildExpectedKeys(codeKeys, translations) {
  const expectedKeys = new Map();

  for (const [key, files] of codeKeys.entries()) {
    const pluralVariants = getAllPluralVariants(key, translations);

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

  for (const [key, usages] of expectedKeys.entries()) {
    if (!translationKeys.has(key)) {
      missing.push({ key, usages });
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

/**
 * Group keys by namespace from namespace:key format
 */
function groupKeysByNamespace(keys) {
  const grouped = {};

  for (const [fullKey, value] of keys.entries()) {
    const colonIndex = fullKey.indexOf(':');
    if (colonIndex > 0) {
      const namespace = fullKey.substring(0, colonIndex);
      const key = fullKey.substring(colonIndex + 1);

      if (!grouped[namespace]) {
        grouped[namespace] = new Map();
      }
      grouped[namespace].set(key, value);
    }
  }

  return grouped;
}

/**
 * Find duplicate keys across namespaces
 */
function findDuplicateKeysAcrossNamespaces(translationsByLang) {
  const keyToNamespaces = {};

  // Collect all keys and which namespaces they appear in
  for (const lang of LANGUAGES) {
    const { translations } = translationsByLang[lang];

    for (const fullKey of Object.keys(translations)) {
      const colonIndex = fullKey.indexOf(':');
      if (colonIndex > 0) {
        const namespace = fullKey.substring(0, colonIndex);
        const key = fullKey.substring(colonIndex + 1);

        if (!keyToNamespaces[key]) {
          keyToNamespaces[key] = new Set();
        }
        keyToNamespaces[key].add(namespace);
      }
    }
  }

  // Find keys that appear in multiple namespaces
  const duplicates = [];
  for (const [key, namespaces] of Object.entries(keyToNamespaces)) {
    if (namespaces.size > 1) {
      duplicates.push({ key, namespaces: sortStringsCopy(namespaces) });
    }
  }

  return duplicates;
}

/**
 * Tolgee allowlist: plain string matches duplicate key path.
 */
function allowlistStringMatches(entry, dupKey) {
  return typeof entry === 'string' && entry === dupKey;
}

/**
 * Tolgee allowlist: object { key, namespaces? } matches duplicate row.
 */
function allowlistObjectMatches(entry, dup, dupNsJoined) {
  if (!entry || typeof entry !== 'object' || typeof entry.key !== 'string') {
    return false;
  }
  if (entry.key !== dup.key) {
    return false;
  }
  if (!entry.namespaces || entry.namespaces.length === 0) {
    return true;
  }
  return sortStringsCopy(entry.namespaces).join(',') === dupNsJoined;
}

/**
 * Tolgee allowlist entry: string key path, or { key, namespaces? } for JSON-first migration.
 */
function isDuplicateAllowedByConfig(dup, allowedList) {
  if (!allowedList || !Array.isArray(allowedList)) {
    return false;
  }
  const dupNsJoined = sortStringsCopy(dup.namespaces).join(',');
  for (const entry of allowedList) {
    if (allowlistStringMatches(entry, dup.key) || allowlistObjectMatches(entry, dup, dupNsJoined)) {
      return true;
    }
  }
  return false;
}

/**
 * Classify one duplicate row for partition (fatal vs migration).
 */
function classifyDuplicatePartition(dup, codeKeysByNs, projectNamespaces, allowedList) {
  if (isDuplicateAllowedByConfig(dup, allowedList)) {
    return { kind: 'migration', record: { ...dup, reason: 'allowlist' } };
  }
  const namespacesInCode = getNamespacesUsingKeyPath(dup.key, codeKeysByNs, projectNamespaces);
  if (namespacesInCode.size === 0 || namespacesInCode.size > 1) {
    return { kind: 'fatal', record: dup };
  }
  return {
    kind: 'migration',
    record: {
      ...dup,
      namespacesInCode: sortStringsCopy(namespacesInCode),
      reason: 'single-namespace-in-code',
    },
  };
}

/**
 * Split raw JSON duplicates into fatal vs migration (allowed) using code references and allowlist.
 */
function partitionDuplicatesByCodeUsage(rawDuplicates, codeKeysByNs, projectNamespaces, allowedList) {
  const fatal = [];
  const migration = [];

  for (const dup of rawDuplicates) {
    const outcome = classifyDuplicatePartition(dup, codeKeysByNs, projectNamespaces, allowedList);
    if (outcome.kind === 'fatal') {
      fatal.push(outcome.record);
    } else {
      migration.push(outcome.record);
    }
  }

  return { fatal, migration };
}

function analyzeTranslations() {
  console.log('🔍 Analyzing translation keys...\n');

  const translationConfig = readAndValidateTolgeeConfig(getTolgeeConfigPathFromScriptsDir());
  const defaultNamespace = translationConfig.defaultNamespace;
  const allowedCrossNamespaceDuplicates = translationConfig.allowedCrossNamespaceDuplicates;
  const namespaces = translationConfig.projectNamespaces;
  console.log(`📝 Default namespace: ${defaultNamespace}`);
  console.log(`📝 Shared namespace: ${translationConfig.sharedNamespace}`);
  console.log(`📝 Project namespaces: ${namespaces.join(', ')}\n`);

  // Extract keys from code
  const { keysMap: codeKeys, dynamicKeys } = extractKeysFromCode(defaultNamespace);
  console.log(`Found ${codeKeys.size} unique translation keys in code`);
  if (dynamicKeys.length > 0) {
    console.log(`⚠️  Found ${dynamicKeys.length} dynamic translation key(s) that cannot be analyzed`);
  }
  console.log('');

  const translationsByLang = {};
  for (const lang of LANGUAGES) {
    translationsByLang[lang] = { translations: {}, keyToFile: {} };

    for (const namespace of namespaces) {
      const { translations, keyToFile } = loadTranslations(lang, namespace);
      Object.assign(translationsByLang[lang].translations, translations);
      Object.assign(translationsByLang[lang].keyToFile, keyToFile);
    }

    console.log(`Loaded ${Object.keys(translationsByLang[lang].translations).length} translation keys for ${lang}`);
  }
  console.log('');

  // Analyze each language
  const results = { dynamicKeys };
  for (const lang of LANGUAGES) {
    results[lang] = analyzeLanguage(lang, codeKeys, translationsByLang);
  }

  // Find duplicate keys across namespaces (fatal vs migration-in-progress)
  const rawDuplicates = findDuplicateKeysAcrossNamespaces(translationsByLang);
  const codeKeysByNs = buildCodeKeysByNamespaceFromMap(codeKeys);
  const { fatal, migration } = partitionDuplicatesByCodeUsage(
    rawDuplicates,
    codeKeysByNs,
    namespaces,
    allowedCrossNamespaceDuplicates,
  );
  results.duplicates = fatal;
  results.migrationDuplicates = migration;

  // Group code keys by namespace for statistics
  results.codeKeysByNamespace = groupKeysByNamespace(codeKeys);

  // Count unique keys (without namespace prefix) in code
  const uniqueKeysInCode = new Set();
  for (const fullKey of codeKeys.keys()) {
    const colonIndex = fullKey.indexOf(':');
    if (colonIndex > 0) {
      const key = fullKey.substring(colonIndex + 1);
      uniqueKeysInCode.add(key);
    }
  }
  results.uniqueKeyCount = uniqueKeysInCode.size;
  results.totalKeyCount = codeKeys.size;

  // Count translations in files (using first language as reference since all should have same keys)
  const firstLang = LANGUAGES[0];
  const translationKeys = Object.keys(translationsByLang[firstLang].translations);
  results.totalTranslationCount = translationKeys.length;

  // Count translations per namespace
  results.translationsByNamespace = {};
  for (const fullKey of translationKeys) {
    const colonIndex = fullKey.indexOf(':');
    if (colonIndex > 0) {
      const namespace = fullKey.substring(0, colonIndex);
      if (!results.translationsByNamespace[namespace]) {
        results.translationsByNamespace[namespace] = 0;
      }
      results.translationsByNamespace[namespace]++;
    }
  }

  return results;
}

/**
 * Print summary statistics
 */
function printSummary(results) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    TRANSLATION ANALYSIS REPORT                ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📊 KEY STATISTICS\n');
  console.log(`Total translation keys in code: ${results.totalKeyCount}`);
  console.log(`Unique keys (without namespace): ${results.uniqueKeyCount}\n`);

  console.log('Keys per namespace:');
  for (const [namespace, keys] of Object.entries(results.codeKeysByNamespace)) {
    console.log(`  • ${namespace}: ${keys.size} keys`);
  }
  console.log('');

  console.log(`Total translations in files: ${results.totalTranslationCount}`);
  console.log('Translations per namespace:');
  for (const [namespace, count] of Object.entries(results.translationsByNamespace)) {
    console.log(`  • ${namespace}: ${count} translations`);
  }

  // Show note if translation count differs from code key count
  if (results.totalTranslationCount !== results.totalKeyCount) {
    const difference = results.totalTranslationCount - results.totalKeyCount;
    console.log(`\nℹ️  Note: Translation count differs from code keys by ${Math.abs(difference)} entries.`);
    console.log('   This can be due to:');
    console.log('   - Plural forms in translations (_one, _other, etc.)');
    console.log('   - Unused translations (may be used in production or other contexts)');
  }
  console.log('');
}

/**
 * Calculate namespace statistics
 */
function calculateNamespaceStats(results, namespace) {
  const stats = {};
  for (const lang of LANGUAGES) {
    const { missing, unused } = results[lang];

    const missingInNamespace = missing.filter((m) => m.key.startsWith(`${namespace}:`));
    const unusedInNamespace = unused.filter((u) => u.key.startsWith(`${namespace}:`));

    stats[lang] = {
      missing: missingInNamespace.length,
      unused: unusedInNamespace.length,
      missingKeys: missingInNamespace,
      unusedKeys: unusedInNamespace,
    };
  }
  return stats;
}

/**
 * Print namespace statistics table
 */
function printNamespaceStatsTable(stats) {
  console.log('┌──────────┬─────────────────────┬─────────────────────┐');
  console.log('│ Language │ Missing Translations│ Unused Translations │');
  console.log('├──────────┼─────────────────────┼─────────────────────┤');

  for (const lang of LANGUAGES) {
    console.log(
      `│   ${lang.toUpperCase()}     │         ${String(stats[lang].missing).padStart(3)}         │         ${String(stats[lang].unused).padStart(3)}         │`,
    );
  }
  console.log('└──────────┴─────────────────────┴─────────────────────┘\n');
}

/**
 * Collect all missing items for namespace
 */
function collectMissingItems(stats) {
  const allMissing = new Set();
  const missingItems = [];

  for (const lang of LANGUAGES) {
    for (const item of stats[lang].missingKeys) {
      allMissing.add(item.key);
      if (!missingItems.some((m) => m.key === item.key)) {
        missingItems.push(item);
      }
    }
  }

  return { allMissing, missingItems };
}

/**
 * Print missing keys for namespace
 */
function printMissingKeys(stats, missingItems) {
  for (const item of missingItems.sort((a, b) => a.key.localeCompare(b.key))) {
    const keyWithoutNs = item.key.substring(item.key.indexOf(':') + 1);

    // Show which languages are missing this key
    const missingLangs = LANGUAGES.filter((lang) => stats[lang].missingKeys.some((m) => m.key === item.key));

    console.log(`  • ${keyWithoutNs}`);
    if (missingLangs.length > 0) {
      console.log(`    Missing in: ${missingLangs.join(', ')}`);
    }

    // Show usage locations (limit to first 3)
    if (item.usages && item.usages.length > 0) {
      const usagesToShow = item.usages.slice(0, 3);
      console.log(`    Used in:`);
      for (const usage of usagesToShow) {
        console.log(`      ${usage.file}:${usage.line}`);
        console.log(`        ${usage.code}`);
      }
      if (item.usages.length > 3) {
        console.log(`      ... and ${item.usages.length - 3} more location(s)`);
      }
    }
  }
  console.log('');
}

/**
 * Collect all unused keys for namespace
 */
function collectUnusedKeys(stats) {
  const allUnused = new Set();
  for (const lang of LANGUAGES) {
    for (const item of stats[lang].unusedKeys) {
      allUnused.add(item.key);
    }
  }
  return allUnused;
}

/**
 * Print unused keys for namespace
 */
function printUnusedKeys(allUnused) {
  console.log(`ℹ️  UNUSED KEYS (${allUnused.size}):\n`);
  for (const key of sortStringsCopy(allUnused)) {
    const keyWithoutNs = key.substring(key.indexOf(':') + 1);
    console.log(`  • ${keyWithoutNs}`);
  }
  console.log('');
}

/**
 * Print namespace analysis
 */
function printNamespaceAnalysis(results) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    PER-NAMESPACE ANALYSIS                     ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const namespace of Object.keys(results.codeKeysByNamespace)) {
    console.log(`\n📦 NAMESPACE: ${namespace}\n`);
    console.log('─'.repeat(70));

    const stats = calculateNamespaceStats(results, namespace);
    printNamespaceStatsTable(stats);

    // Handle missing keys
    const { allMissing, missingItems } = collectMissingItems(stats);

    if (allMissing.size > 0) {
      console.log(`⚠️  MISSING KEYS (${allMissing.size}):\n`);
      printMissingKeys(stats, missingItems);
    }

    // Handle unused keys
    const allUnused = collectUnusedKeys(stats);

    if (allUnused.size > 0) {
      printUnusedKeys(allUnused);
    }
  }
}

/**
 * Print duplicate keys warning
 */
function printDuplicates(results) {
  const migration = results.migrationDuplicates || [];

  if (migration.length > 0) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('          CROSS-NAMESPACE KEYS (OK — migration / allowlist)          ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(
      `ℹ️  ${migration.length} key(s) exist in multiple translation namespaces but code references at most one namespace (or are allowlisted). Not treated as errors.\n`,
    );
    for (const entry of migration) {
      console.log(`  • ${entry.key}`);
      console.log(`    Appears in: ${entry.namespaces.join(', ')}`);
      if (entry.reason === 'allowlist') {
        console.log(`    Reason: allowed via .tolgeerc.json (allowedCrossNamespaceDuplicates)`);
      } else if (entry.namespacesInCode?.length) {
        console.log(`    Referenced in code from: ${entry.namespacesInCode.join(', ')}`);
      }
    }
    console.log('');
  }

  if (results.duplicates.length === 0) {
    return;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    DUPLICATE KEYS WARNING                     ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`⚠️  Found ${results.duplicates.length} key(s) that exist in multiple namespaces:\n`);

  for (const { key, namespaces } of results.duplicates) {
    console.log(`  • ${key}`);
    console.log(`    Appears in: ${namespaces.join(', ')}`);
  }
  console.log('');
}

/**
 * Print dynamic keys warning
 */
function printDynamicKeys(results) {
  if (!results.dynamicKeys || results.dynamicKeys.length === 0) {
    return;
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    DYNAMIC KEYS WARNING                       ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`⚠️  Found ${results.dynamicKeys.length} dynamic translation key(s):\n`);

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
  console.log('   impossible. Please use static keys only.\n');
}

/**
 * Print final status and return exit code
 */
function printFinalStatus(results) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                         FINAL STATUS                          ');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const hasMissingKeys = LANGUAGES.some((lang) => results[lang].missing.length > 0);
  const hasDynamicKeys = results.dynamicKeys && results.dynamicKeys.length > 0;
  const hasDuplicates = Array.isArray(results.duplicates) && results.duplicates.length > 0;

  const hasErrors = hasMissingKeys || hasDynamicKeys || hasDuplicates;

  if (hasErrors) {
    console.log('❌ VALIDATION FAILED\n');

    if (hasMissingKeys) {
      const totalMissing = LANGUAGES.reduce((sum, lang) => sum + results[lang].missing.length, 0);
      console.log(`   • Missing translations: ${totalMissing} keys missing from translation files`);
    }
    if (hasDynamicKeys) {
      console.log(`   • Dynamic keys: ${results.dynamicKeys.length} dynamic translation keys found`);
    }
    if (hasDuplicates) {
      console.log(`   • Duplicate keys: ${results.duplicates.length} keys exist in multiple namespaces`);
    }

    console.log('\n');
    return 1;
  }

  const totalUnused = LANGUAGES.reduce((sum, lang) => sum + results[lang].unused.length, 0);
  if (totalUnused > 0) {
    console.log('✅ VALIDATION PASSED\n');
    console.log(`ℹ️  Note: ${totalUnused} unused translation(s) found in translation files.`);
    console.log('   This is OK - translations may be used in production or other contexts.\n');
  } else {
    console.log('✅ VALIDATION PASSED\n');
  }

  return 0;
}

/**
 * Print results
 */
function printResults(results) {
  printSummary(results);
  printNamespaceAnalysis(results);
  printDuplicates(results);
  printDynamicKeys(results);
  return printFinalStatus(results);
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
