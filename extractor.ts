import type { ExtractedKey, ExtractionResult, ExtractOptions, Warning } from '@tolgee/cli/extractor';
import path from 'node:path';
import {
  extractStaticKeys as extractStaticKeysShared,
  getPluralVariants,
  loadAllTranslationKeys as loadTranslationKeysFromDir,
  processDynamicKeys as processDynamicKeysShared,
} from './scripts/translations/translation-utils';

/**
 * Load all translation keys for the project
 */
function loadAllTranslationKeys(): Map<string, Set<string>> {
  // Extractor is in project root, so src/i18n is a relative path
  const i18nDir = path.resolve(process.cwd(), 'src', 'i18n');
  return loadTranslationKeysFromDir(i18nDir);
}

/**
 * Extract static translation keys from content with line numbers
 * Wrapper around shared function to match extractor's return type
 */
function extractStaticKeys(
  code: string,
  lines: string[],
  defaultNamespace: string | undefined,
): { keyName: string; namespace: string; line: number }[] {
  const keysMap = extractStaticKeysShared(code, '', defaultNamespace || 'yksilo', lines);
  const result = new Map<string, { namespace: string; line: number }>();

  // Convert to extractor format: store only first occurrence per key
  for (const [fullKey, usages] of keysMap.entries()) {
    if (!result.has(fullKey) && usages.length > 0) {
      const colonIndex = fullKey.indexOf(':');
      const namespace = fullKey.substring(0, colonIndex);
      result.set(fullKey, { namespace, line: usages[0].line });
    }
  }

  return Array.from(result.entries()).map(([key, { namespace, line }]) => ({
    keyName: key.split(':')[1],
    namespace,
    line,
  }));
}

/**
 * Process dynamic key matches for a file
 * Wrapper around shared function to format as warnings
 */
function processDynamicKeys(code: string, fileName: string): { line: number; warning: string }[] {
  const lines = code.split('\n');
  const dynamicKeys = processDynamicKeysShared(code, fileName, lines);

  return dynamicKeys.map((item: { line: number; code: string; type: string }) => ({
    line: item.line,
    warning: `Dynamic translation key detected (${item.type}): ${item.code}`,
  }));
}

export default function extractor(code: string, fileName: string, options: ExtractOptions): ExtractionResult {
  const lines = code.split('\n');

  // Load translation keys from all namespaces
  const keysByNamespace = loadAllTranslationKeys();

  // Extract static keys with line numbers and namespaces
  const staticKeys = extractStaticKeys(code, lines, options.defaultNamespace);

  // Expand keys with plural variants
  const expandedKeys: ExtractedKey[] = [];

  for (const { keyName, namespace, line } of staticKeys) {
    const pluralVariants = getPluralVariants(keyName, namespace, keysByNamespace);

    if (pluralVariants.length > 0) {
      // If plural variants exist, add all of them (not the base key)
      for (const variantKey of pluralVariants) {
        expandedKeys.push({
          keyName: variantKey,
          line,
          namespace,
        });
      }
    } else {
      // No plural variants, add the base key
      expandedKeys.push({
        keyName,
        line,
        namespace,
      });
    }
  }

  // Detect dynamic keys
  const dynamicKeys = processDynamicKeys(code, fileName);

  // Convert dynamic keys to warnings
  const warnings: Warning[] = dynamicKeys.map(({ line, warning }) => ({
    line,
    warning,
  }));

  return {
    keys: expandedKeys,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
