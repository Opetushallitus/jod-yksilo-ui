import { describe, expect, it } from 'vitest';

import { getTolgeeConfigPathFromScriptsDir, validateTranslationConfig } from './tolgee-config.js';

const validBase = {
  projectId: 27621,
  defaultNamespace: 'yksilo',
  sharedNamespace: 'common',
  pull: { namespaces: ['yksilo', 'common'], path: './src/i18n/' },
  push: { namespaces: ['yksilo', 'common'], filesTemplate: './x', language: ['fi'] },
};

describe('getTolgeeConfigPathFromScriptsDir', () => {
  it('points at project root .tolgeerc.json', () => {
    const p = getTolgeeConfigPathFromScriptsDir();
    expect(p.endsWith('.tolgeerc.json')).toBe(true);
    expect(p).toMatch(/[\\/]\.tolgeerc\.json$/);
  });
});

describe('validateTranslationConfig', () => {
  it('rejects non-object config', () => {
    expect(validateTranslationConfig(null).ok).toBe(false);
    expect(validateTranslationConfig(undefined).ok).toBe(false);
  });

  it('accepts a complete valid config', () => {
    const result = validateTranslationConfig(validBase);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.defaultNamespace).toBe('yksilo');
      expect(result.config.sharedNamespace).toBe('common');
      expect(result.config.projectNamespaces).toEqual(['yksilo', 'common']);
      expect(result.config.projectId).toBe(27621);
    }
  });

  it('rejects missing defaultNamespace', () => {
    const { defaultNamespace: _, ...rest } = validBase;
    const result = validateTranslationConfig(rest);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('defaultNamespace'))).toBe(true);
    }
  });

  it('rejects missing sharedNamespace', () => {
    const { sharedNamespace: _, ...rest } = validBase;
    const result = validateTranslationConfig(rest);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('sharedNamespace'))).toBe(true);
    }
  });

  it('rejects pull.namespaces not listing defaultNamespace', () => {
    const result = validateTranslationConfig({
      ...validBase,
      pull: { namespaces: ['common'] },
    });
    expect(result.ok).toBe(false);
  });

  it('rejects mismatched push.namespaces', () => {
    const result = validateTranslationConfig({
      ...validBase,
      push: { ...validBase.push, namespaces: ['yksilo'] },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('push.namespaces'))).toBe(true);
    }
  });

  it('rejects sharedNamespace not listed in pull.namespaces', () => {
    const result = validateTranslationConfig({
      ...validBase,
      pull: { namespaces: ['yksilo'], path: './src/i18n/' },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('sharedNamespace'))).toBe(true);
    }
  });

  it('rejects invalid pull.namespaces', () => {
    expect(validateTranslationConfig({ ...validBase, pull: { namespaces: [] } }).ok).toBe(false);
    expect(validateTranslationConfig({ ...validBase, pull: { namespaces: [''] } }).ok).toBe(false);
  });

  it('rejects invalid push.namespaces when present', () => {
    const result = validateTranslationConfig({
      ...validBase,
      push: { namespaces: [], filesTemplate: './x', language: ['fi'] },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('push.namespaces'))).toBe(true);
    }
  });

  it('omitting push.namespaces still validates when pull and namespaces align', () => {
    const { push: _p, ...noPush } = validBase;
    const result = validateTranslationConfig(noPush);
    expect(result.ok).toBe(true);
  });
});
