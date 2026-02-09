/**
 * Shared Translation Utilities
 *
 * Common functions and constants used by both the Tolgee extractor and translation analyzer.
 * This module centralizes key extraction logic, pattern matching, and helper utilities
 * to maintain consistency across different tools.
 */

import fs from 'node:fs';
import path from 'node:path';

// Plural form suffixes supported by i18next
export const PLURAL_SUFFIXES = ['_one', '_other', '_many', '_few', '_zero'];

// Dynamic key exceptions - files and patterns that are allowed to use dynamic translation keys
export const DYNAMIC_KEY_EXCEPTIONS = [
  {
    file: 'hooks/useLocalizedRoutes/useLocalizedRoutes.tsx',
    pattern: /t\(translationKey,\s*\{\s*lng\s*\}\)/,
    reason: 'Route localization requires dynamic translation keys',
  },
];

/**
 * Flatten nested JSON object to dot notation
 * Example: { a: { b: 'value' } } => { 'a.b': 'value' }
 *
 * @param {unknown} obj - The object to flatten
 * @param {string} prefix - The prefix for nested keys
 * @returns {Record<string, unknown>} - Flattened object
 */
export function flattenObject(obj, prefix = '') {
  const result = {};

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return result;
  }

  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) continue;

    const newKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Get regex patterns for static translation keys
 * Note: Uses 'gs' flags for global search with multiline support
 *
 * @returns {RegExp[]} - Array of regex patterns
 */
export function getStaticKeyPatterns() {
  return [
    // t('key') or t("key") - including with options, supports multiline
    /\bt\s*\(\s*['"]([^'"]+)['"]/gs,

    // t(`key`) - backtick strings (non-interpolated)
    /\bt\s*\(\s*`([^`$]+)`/gs,

    // i18n.t('key') or i18n.t("key")
    /i18n\.t\s*\(\s*['"]([^'"]+)['"]/gs,

    // i18n.t(`key`) - backtick strings (non-interpolated)
    /i18n\.t\s*\(\s*`([^`$]+)`/gs,

    // <Trans i18nKey="key" /> or <Trans i18nKey='key' />
    /i18nKey\s*=\s*['"]([^'"]+)['"]/gs,

    // i18n.exists('key')
    /i18n\.exists\s*\(\s*['"]([^'"]+)['"]/gs,
  ];
}

/**
 * Get regex patterns for dynamic translation keys
 * Returns objects with pattern and descriptive name
 *
 * @returns {Array<{pattern: RegExp, name: string}>} - Array of pattern objects
 */
export function getDynamicKeyPatterns() {
  return [
    // t(`template ${var}`) - template literals with interpolation
    {
      pattern: /\bt\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 't() with template literal',
    },
    // t('string' + anything) or t("string" + anything) - string concatenation (single line only)
    {
      pattern: /\bt\s*\(\s*['"][^'"]*['"]\s*\+[^)]*\)/g,
      name: 't() with string concatenation',
    },
    // t(variable) or t(variable, options) - direct variable usage (NOT starting with quote)
    {
      pattern: /\bt\s*\(\s*(?!['"`])([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*[,)]/g,
      name: 't() with variable',
    },
    // i18n.t with template literals
    {
      pattern: /i18n\.t\s*\(\s*`[^`]*\$\{[^`]*`/g,
      name: 'i18n.t() with template literal',
    },
    // i18n.t with concatenation (single line only)
    {
      pattern: /i18n\.t\s*\(\s*['"][^'"]*['"]\s*\+[^)]*\)/g,
      name: 'i18n.t() with string concatenation',
    },
    // i18n.t(variable) or i18n.t(variable, options) (NOT starting with quote)
    {
      pattern: /i18n\.t\s*\(\s*(?!['"`])([a-zA-Z_$][a-zA-Z0-9_$.]*)\s*[,)]/g,
      name: 'i18n.t() with variable',
    },
    // <Trans i18nKey={variable} /> (NOT with string literal)
    {
      pattern: /i18nKey\s*=\s*\{(?!['"`])[^}]+\}/g,
      name: '<Trans i18nKey={...} />',
    },
  ];
}

/**
 * Find line number for a position in content
 *
 * @param {number} position - Character position in content
 * @param {string[]} lines - Array of content lines
 * @returns {number} - Line number (1-indexed)
 */
export function findLineNumber(position, lines) {
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1; // +1 for newline
    if (charCount > position) {
      return i + 1;
    }
  }
  return lines.length;
}

/**
 * Check if a dynamic key usage matches any exception pattern
 *
 * @param {string} relativePath - File path relative to project root
 * @param {string} codeLine - Line of code containing the dynamic key
 * @returns {boolean} - True if matches an exception
 */
export function isExceptionMatch(relativePath, codeLine) {
  const normalizedPath = path.normalize(relativePath);
  return DYNAMIC_KEY_EXCEPTIONS.some((exception) => {
    const normalizedExceptionPath = path.normalize(exception.file);
    return normalizedPath.includes(normalizedExceptionPath) && exception.pattern.test(codeLine);
  });
}

/**
 * Parse namespace and key from a translation key string
 * Supports both "namespace:key" and plain "key" formats
 *
 * @param {string} fullKey - Translation key (may include namespace)
 * @param {string} defaultNamespace - Default namespace if not specified
 * @returns {{namespace: string, key: string}} - Parsed namespace and key
 */
export function parseNamespaceKey(fullKey, defaultNamespace = 'yksilo') {
  if (fullKey.includes(':')) {
    const parts = fullKey.split(':');
    return {
      namespace: parts[0],
      key: parts.slice(1).join(':'), // Handle keys with multiple colons
    };
  }
  return {
    namespace: defaultNamespace,
    key: fullKey,
  };
}

/**
 * Check if a key is a plural form variant
 *
 * @param {string} key - Translation key to check
 * @returns {boolean} - True if key ends with a plural suffix
 */
export function isPluralKey(key) {
  return PLURAL_SUFFIXES.some((suffix) => key.endsWith(suffix));
}

/**
 * Get base key from a plural form key
 * Example: 'items_other' => 'items'
 *
 * @param {string} key - Translation key (may be plural form)
 * @returns {string} - Base key without plural suffix
 */
export function getBaseKey(key) {
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      return key.slice(0, -suffix.length);
    }
  }
  return key;
}

/**
 * Load all translation keys from all namespaces
 * Used by the extractor to find plural variants
 *
 * @param {string} i18nDir - Path to i18n directory
 * @returns {Map<string, Set<string>>} - Map of namespace to set of keys
 */
export function loadAllTranslationKeys(i18nDir) {
  const keysByNamespace = new Map();

  if (!fs.existsSync(i18nDir)) {
    return keysByNamespace;
  }

  // Read all namespace directories
  const entries = fs.readdirSync(i18nDir, { withFileTypes: true });
  const namespaceDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  for (const namespace of namespaceDirs) {
    const translationDir = path.join(i18nDir, namespace);
    const allKeys = new Set();

    const files = fs.readdirSync(translationDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(translationDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        const flattened = flattenObject(json);

        for (const key of Object.keys(flattened)) {
          allKeys.add(key);
        }
      } catch {
        // Ignore files that can't be parsed
        continue;
      }
    }

    keysByNamespace.set(namespace, allKeys);
  }

  return keysByNamespace;
}

/**
 * Get all plural variants for a base key that exist in translations
 *
 * @param {string} baseKey - Base translation key
 * @param {string} namespace - Namespace to search in
 * @param {Map<string, Set<string>>} keysByNamespace - Map of all translation keys
 * @returns {string[]} - Array of plural variant keys that exist
 */
export function getPluralVariants(baseKey, namespace, keysByNamespace) {
  const variants = [];
  const translationKeys = keysByNamespace.get(namespace);

  if (!translationKeys) {
    return variants;
  }

  for (const suffix of PLURAL_SUFFIXES) {
    const pluralKey = baseKey + suffix;
    if (translationKeys.has(pluralKey)) {
      variants.push(pluralKey);
    }
  }

  return variants;
}

/**
 * Process dynamic key matches in code content
 * Returns structured data about dynamic translation key usage
 *
 * @param {string} content - Source code content
 * @param {string} filePath - File path for identification
 * @param {string[]} lines - Array of code lines (pass null to split content automatically)
 * @returns {Array<{file: string, line: number, code: string, type: string}>} - Dynamic key matches
 */
export function processDynamicKeys(content, filePath, lines = null) {
  const dynamicKeys = [];
  const dynamicMatches = new Set();
  const codeLines = lines || content.split('\n');
  const dynamicPatterns = getDynamicKeyPatterns();

  for (const { pattern, name } of dynamicPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const lineNum = findLineNumber(match.index, codeLines);
      const codeLine = codeLines[lineNum - 1].trim();

      if (isExceptionMatch(filePath, codeLine)) {
        continue;
      }

      const matchId = `${filePath}:${lineNum}:${codeLine}`;
      if (!dynamicMatches.has(matchId)) {
        dynamicMatches.add(matchId);
        const codeSnippet = codeLine.length > 100 ? codeLine.substring(0, 100) + '...' : codeLine;
        dynamicKeys.push({
          file: filePath,
          line: lineNum,
          code: codeSnippet,
          type: name,
        });
      }
    }
  }

  return dynamicKeys;
}

/**
 * Extract static translation keys from code content
 * Returns structured data about translation key usage
 *
 * @param {string} content - Source code content
 * @param {string} filePath - File path for identification
 * @param {string} defaultNamespace - Default namespace if not specified in key
 * @param {string[]} lines - Array of code lines (pass null to split content automatically)
 * @returns {Map<string, Array>} - Map of 'namespace:key' to usage locations
 */
export function extractStaticKeys(content, filePath, defaultNamespace, lines = null) {
  const keysMap = new Map();
  const codeLines = lines || content.split('\n');
  const patterns = getStaticKeyPatterns();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const keyString = match[1];

      // Skip if key contains template literals or variables
      if (keyString.includes('${') || keyString.includes('`')) {
        continue;
      }

      const { namespace, key } = parseNamespaceKey(keyString, defaultNamespace);
      const fullKey = `${namespace}:${key}`;

      const lineNum = findLineNumber(match.index, codeLines);
      const codeLine = codeLines[lineNum - 1].trim();
      const codeSnippet = codeLine.length > 100 ? codeLine.substring(0, 100) + '...' : codeLine;

      if (!keysMap.has(fullKey)) {
        keysMap.set(fullKey, []);
      }
      keysMap.get(fullKey).push({
        file: filePath,
        line: lineNum,
        code: codeSnippet,
      });
    }
  }

  return keysMap;
}
