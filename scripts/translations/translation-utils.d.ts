/**
 * Type definitions for translation-utils.js
 */

export const PLURAL_SUFFIXES: string[];
export const DYNAMIC_KEY_EXCEPTIONS: Array<{
  file: string;
  pattern: RegExp;
  reason: string;
}>;

export function flattenObject(obj: unknown, prefix?: string): Record<string, unknown>;
export function getStaticKeyPatterns(): RegExp[];
export function getDynamicKeyPatterns(): Array<{ pattern: RegExp; name: string }>;
export function findLineNumber(position: number, lines: string[]): number;
export function isExceptionMatch(relativePath: string, codeLine: string): boolean;
export function parseNamespaceKey(
  fullKey: string,
  defaultNamespace?: string,
): {
  namespace: string;
  key: string;
};
export function isPluralKey(key: string): boolean;
export function getBaseKey(key: string): string;
export function loadAllTranslationKeys(i18nDir: string): Map<string, Set<string>>;
export function getPluralVariants(
  baseKey: string,
  namespace: string,
  keysByNamespace: Map<string, Set<string>>,
): string[];
export function processDynamicKeys(
  content: string,
  filePath: string,
  lines?: string[] | null,
): Array<{
  file: string;
  line: number;
  code: string;
  type: string;
}>;
export function extractStaticKeys(
  content: string,
  filePath: string,
  defaultNamespace: string,
  lines?: string[] | null,
): Map<
  string,
  Array<{
    file: string;
    line: number;
    code: string;
  }>
>;
