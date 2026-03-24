/**
 * Tolgee / translation tooling configuration
 *
 * Validates .tolgeerc.json for scripts under scripts/translations/.
 * Required fields: defaultNamespace, pull.namespaces, sharedNamespace, projectId.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @typedef {{ defaultNamespace: string, sharedNamespace: string, projectNamespaces: string[], allowedCrossNamespaceDuplicates: unknown[], projectId: string|number }} ValidatedTranslationConfig */

/**
 * Path to .tolgeerc.json when resolving from scripts/translations/ (two levels up).
 */
export function getTolgeeConfigPathFromScriptsDir() {
  return path.join(__dirname, '..', '..', '.tolgeerc.json');
}

/**
 * Normalize namespace lists for comparison (sorted copy).
 */
function namespacesSignature(names) {
  return [...names]
    .map(String)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .join('\0');
}

/**
 * @param {Record<string, unknown>} o
 * @param {string[]} errors
 * @returns {string|undefined}
 */
function validateDefaultNamespaceField(o, errors) {
  const defaultNamespace = o.defaultNamespace;
  if (typeof defaultNamespace !== 'string' || defaultNamespace.trim() === '') {
    errors.push('Missing or invalid "defaultNamespace" (non-empty string required in .tolgeerc.json)');
    return undefined;
  }
  return defaultNamespace;
}

/**
 * @param {Record<string, unknown>} o
 * @param {string[]} errors
 * @returns {string[]|undefined}
 */
function validatePullNamespacesField(o, errors) {
  const pullNs =
    o.pull && typeof o.pull === 'object' ? /** @type {Record<string, unknown>} */ (o.pull).namespaces : undefined;
  if (!Array.isArray(pullNs) || pullNs.length === 0) {
    errors.push('Missing or invalid "pull.namespaces" (non-empty array required)');
    return undefined;
  }
  if (!pullNs.every((n) => typeof n === 'string' && String(n).trim() !== '')) {
    errors.push('"pull.namespaces" must contain only non-empty strings');
    return undefined;
  }
  return pullNs.map(String);
}

/**
 * @param {Record<string, unknown>} o
 * @param {string[]} errors
 * @returns {string|undefined}
 */
function validateSharedNamespaceField(o, errors) {
  const sharedNamespace = o.sharedNamespace;
  if (typeof sharedNamespace !== 'string' || sharedNamespace.trim() === '') {
    errors.push(
      'Missing or invalid "sharedNamespace" (non-empty string required in .tolgeerc.json — the shared namespace for cross-app keys, e.g. "common")',
    );
    return undefined;
  }
  return sharedNamespace;
}

/**
 * @param {Record<string, unknown>} o
 * @param {string[]} errors
 */
function validateProjectIdField(o, errors) {
  const projectId = o.projectId;
  if (projectId === undefined || projectId === null || projectId === '') {
    errors.push('Missing or invalid "projectId" (required in .tolgeerc.json for Tolgee API tooling)');
  }
}

/**
 * @param {Record<string, unknown>} o
 * @param {string[]} errors
 * @returns {unknown[]|undefined}
 */
function validatePushNamespacesField(o, errors) {
  const pushNs =
    o.push && typeof o.push === 'object' ? /** @type {Record<string, unknown>} */ (o.push).namespaces : undefined;
  if (pushNs === undefined) {
    return undefined;
  }
  if (!Array.isArray(pushNs) || pushNs.length === 0) {
    errors.push('Invalid "push.namespaces" (must be a non-empty array when present)');
    return undefined;
  }
  if (!pushNs.every((n) => typeof n === 'string' && String(n).trim() !== '')) {
    errors.push('"push.namespaces" must contain only non-empty strings');
    return undefined;
  }
  return pushNs;
}

/**
 * @param {string} dn
 * @param {string} sn
 * @param {string[]} projectNamespaces
 * @param {unknown[]|undefined} pushNs
 * @param {string[]} errors
 */
function validateNamespaceCrossReferences(dn, sn, projectNamespaces, pushNs, errors) {
  if (!projectNamespaces.includes(dn)) {
    errors.push(`"defaultNamespace" ("${dn}") must be listed in pull.namespaces`);
  }
  if (!projectNamespaces.includes(sn)) {
    errors.push(`"sharedNamespace" ("${sn}") must be listed in pull.namespaces`);
  }

  if (Array.isArray(pushNs) && namespacesSignature(pushNs) !== namespacesSignature(projectNamespaces)) {
    errors.push('push.namespaces must list the same namespaces as pull.namespaces');
  }
}

/**
 * Validate raw Tolgee JSON for translation scripts.
 * Pure function — suitable for unit tests.
 *
 * @param {unknown} raw
 * @returns {{ ok: true, config: ValidatedTranslationConfig & { raw: object } } | { ok: false, errors: string[] }}
 */
export function validateTranslationConfig(raw) {
  const errors = [];

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Config must be a non-null object'] };
  }

  const o = /** @type {Record<string, unknown>} */ (raw);

  const defaultNamespace = validateDefaultNamespaceField(o, errors);
  const pullNs = validatePullNamespacesField(o, errors);
  const sharedNamespace = validateSharedNamespaceField(o, errors);
  validateProjectIdField(o, errors);
  const pushNs = validatePushNamespacesField(o, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const projectNamespaces = /** @type {string[]} */ (pullNs);
  const dn = /** @type {string} */ (defaultNamespace);
  const sn = /** @type {string} */ (sharedNamespace);
  const projectId = o.projectId;

  validateNamespaceCrossReferences(dn, sn, projectNamespaces, pushNs, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const allowedCrossNamespaceDuplicates = Array.isArray(o.allowedCrossNamespaceDuplicates)
    ? o.allowedCrossNamespaceDuplicates
    : [];

  return {
    ok: true,
    config: {
      defaultNamespace: dn,
      sharedNamespace: sn,
      projectNamespaces,
      allowedCrossNamespaceDuplicates,
      projectId,
      raw: o,
    },
  };
}

/**
 * Read and validate .tolgeerc.json from disk.
 *
 * @param {string} configPath - Absolute path to .tolgeerc.json
 */
export function readAndValidateTolgeeConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Tolgee config not found: ${configPath}\nCreate .tolgeerc.json at the project root (see Tolgee CLI docs).`,
    );
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to parse ${configPath}: ${msg}`);
  }

  const result = validateTranslationConfig(raw);
  if (!result.ok) {
    const errorLines = result.errors.map((line) => `  • ${line}`).join('\n');
    throw new Error(`Invalid .tolgeerc.json:\n${errorLines}`);
  }

  return result.config;
}

/**
 * Validated config for the repo (cached). Uses cwd — suitable for extractor / one-off tools at project root.
 */
let cachedCwdConfig = null;

export function getValidatedTranslationConfigFromCwd() {
  if (cachedCwdConfig) {
    return cachedCwdConfig;
  }
  const configPath = path.join(process.cwd(), '.tolgeerc.json');
  cachedCwdConfig = readAndValidateTolgeeConfig(configPath);
  return cachedCwdConfig;
}

/**
 * Clear cwd cache (for tests).
 */
export function clearTranslationConfigCache() {
  cachedCwdConfig = null;
}
