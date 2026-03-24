export interface ValidatedTranslationConfig {
  defaultNamespace: string;
  sharedNamespace: string;
  projectNamespaces: string[];
  allowedCrossNamespaceDuplicates: unknown[];
  projectId: string | number;
  raw: Record<string, unknown>;
}

export function getTolgeeConfigPathFromScriptsDir(): string;

export function validateTranslationConfig(
  raw: unknown,
): { ok: true; config: ValidatedTranslationConfig } | { ok: false; errors: string[] };

export function readAndValidateTolgeeConfig(configPath: string): ValidatedTranslationConfig;

export function getValidatedTranslationConfigFromCwd(): ValidatedTranslationConfig;

export function clearTranslationConfigCache(): void;
