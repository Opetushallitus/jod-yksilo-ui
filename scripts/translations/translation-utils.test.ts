import { describe, expect, it } from 'vitest';
import {
  buildCodeKeysByNamespaceFromMap,
  extractStaticKeys,
  findLineNumber,
  flattenObject,
  getBaseKey,
  getDynamicKeyPatterns,
  getNamespacesUsingKeyPath,
  getPluralVariants,
  getStaticKeyPatterns,
  isExceptionMatch,
  isKeyPathUsedInNamespace,
  isKeyPathUsedInOtherProjectNamespace,
  isPluralKey,
  parseNamespaceKey,
  PLURAL_SUFFIXES,
  processDynamicKeys,
} from './translation-utils.js';

describe('flattenObject', () => {
  it('flattens nested objects to dot keys', () => {
    expect(flattenObject({ a: { b: 'v' } })).toEqual({ 'a.b': 'v' });
  });

  it('returns empty object for non-objects', () => {
    expect(flattenObject(null)).toEqual({});
    expect(flattenObject([])).toEqual({});
    expect(flattenObject('x')).toEqual({});
  });

  it('respects prefix for nested keys', () => {
    expect(flattenObject({ x: 1 }, 'p')).toEqual({ 'p.x': 1 });
  });
});

describe('findLineNumber', () => {
  it('returns 1-based line for character position', () => {
    const lines = ['aaa', 'bbb', 'ccc'];
    // Cumulative length includes newline after each line: "aaa\n" = 4 chars for line 1
    expect(findLineNumber(0, lines)).toBe(1);
    expect(findLineNumber(3, lines)).toBe(1);
    expect(findLineNumber(4, lines)).toBe(2);
    expect(findLineNumber(8, lines)).toBe(3);
  });

  it('returns last line when position is past content', () => {
    const lines = ['a', 'b'];
    expect(findLineNumber(999, lines)).toBe(2);
  });
});

describe('parseNamespaceKey', () => {
  it('splits namespace:key', () => {
    expect(parseNamespaceKey('common:foo', 'yksilo')).toEqual({ namespace: 'common', key: 'foo' });
    expect(parseNamespaceKey('ns:a:b', 'yksilo')).toEqual({ namespace: 'ns', key: 'a:b' });
  });

  it('uses default namespace when no colon', () => {
    expect(parseNamespaceKey('onlyKey', 'yksilo')).toEqual({ namespace: 'yksilo', key: 'onlyKey' });
  });

  it('throws when defaultNamespace is empty', () => {
    expect(() => parseNamespaceKey('k', '')).toThrow(/defaultNamespace/);
    expect(() => parseNamespaceKey('k', '   ')).toThrow(/defaultNamespace/);
  });
});

describe('plural helpers', () => {
  it('isPluralKey / getBaseKey match PLURAL_SUFFIXES', () => {
    expect(isPluralKey('x_other')).toBe(true);
    expect(getBaseKey('x_other')).toBe('x');
    expect(isPluralKey('plain')).toBe(false);
    expect(getBaseKey('plain')).toBe('plain');
  });

  it('getPluralVariants returns existing suffix keys from map', () => {
    const map = new Map([['ns', new Set(['a_one', 'a_other'])]]);
    expect(getPluralVariants('a', 'ns', map).sort((a, b) => a.localeCompare(b))).toEqual(['a_one', 'a_other']);
    expect(getPluralVariants('missing', 'ns', map)).toEqual([]);
    expect(getPluralVariants('a', 'missing', new Map())).toEqual([]);
  });
});

describe('buildCodeKeysByNamespaceFromMap', () => {
  it('groups namespace:key entries by namespace', () => {
    const m = new Map<string, unknown>();
    m.set('yksilo:a', []);
    m.set('common:b', []);
    m.set('no-colon', []);
    const grouped = buildCodeKeysByNamespaceFromMap(m);
    expect(grouped.yksilo).toEqual(new Set(['a']));
    expect(grouped.common).toEqual(new Set(['b']));
    expect(grouped['no-colon']).toBeUndefined();
  });
});

describe('isKeyPathUsedInNamespace', () => {
  it('matches direct key or plural base', () => {
    const set = new Set(['items']);
    expect(isKeyPathUsedInNamespace('items', set)).toBe(true);
    expect(isKeyPathUsedInNamespace('items_other', set)).toBe(true);
    expect(isKeyPathUsedInNamespace('other', set)).toBe(false);
  });

  it('returns false when set is missing', () => {
    expect(isKeyPathUsedInNamespace('k', undefined)).toBe(false);
  });
});

describe('getNamespacesUsingKeyPath', () => {
  it('collects namespaces where key path is used', () => {
    const byNs = {
      yksilo: new Set(['x']),
      common: new Set(['y']),
    };
    expect([...getNamespacesUsingKeyPath('x', byNs, ['yksilo', 'common'])].sort((a, b) => a.localeCompare(b))).toEqual([
      'yksilo',
    ]);
  });
});

describe('isKeyPathUsedInOtherProjectNamespace', () => {
  it('is true when another namespace has the key', () => {
    const byNs = { yksilo: new Set(['dup']), common: new Set(['dup']) };
    expect(isKeyPathUsedInOtherProjectNamespace('dup', 'yksilo', byNs, ['yksilo', 'common'])).toBe(true);
    expect(isKeyPathUsedInOtherProjectNamespace('dup', 'common', byNs, ['yksilo', 'common'])).toBe(true);
  });

  it('is false when only exclude namespace has the key', () => {
    const byNs = { yksilo: new Set(['only']) };
    expect(isKeyPathUsedInOtherProjectNamespace('only', 'yksilo', byNs, ['yksilo', 'common'])).toBe(false);
  });
});

describe('isExceptionMatch', () => {
  it('matches useLocalizedRoutes exception path and pattern', () => {
    const line = `return t(translationKey, { lng });`;
    expect(isExceptionMatch('hooks/useLocalizedRoutes/useLocalizedRoutes.tsx', line)).toBe(true);
  });

  it('does not match other files', () => {
    expect(isExceptionMatch('other/file.tsx', `t(translationKey, { lng })`)).toBe(false);
  });
});

describe('getStaticKeyPatterns / getDynamicKeyPatterns', () => {
  it('returns non-empty pattern lists', () => {
    expect(getStaticKeyPatterns().length).toBeGreaterThan(0);
    expect(getDynamicKeyPatterns().length).toBeGreaterThan(0);
    expect(PLURAL_SUFFIXES.length).toBeGreaterThan(0);
  });
});

describe('extractStaticKeys', () => {
  const ns = 'yksilo';

  it('extracts t() and i18n.t() string keys', () => {
    const content = `
      t('plain');
      i18n.t("second");
      i18n.t(\`backtick\`);
    `;
    const map = extractStaticKeys(content, 'f.tsx', ns);
    expect(map.has(`${ns}:plain`)).toBe(true);
    expect(map.has(`${ns}:second`)).toBe(true);
    expect(map.has(`${ns}:backtick`)).toBe(true);
  });

  it('parses explicit namespace:key', () => {
    const map = extractStaticKeys(`t('common:shared')`, 'f.tsx', ns);
    expect(map.has('common:shared')).toBe(true);
  });

  it('extracts i18nKey and i18n.exists', () => {
    const map = extractStaticKeys(`<Trans i18nKey="k" /> i18n.exists('exists')`, 'f.tsx', ns);
    expect(map.has(`${ns}:k`)).toBe(true);
    expect(map.has(`${ns}:exists`)).toBe(true);
  });
});

describe('processDynamicKeys', () => {
  it('reports t() with variable', () => {
    const hits = processDynamicKeys(`t(dynamicKey)`, 'x.tsx');
    expect(hits.some((h) => h.type === 't() with variable')).toBe(true);
  });

  it('skips lines matched by DYNAMIC_KEY_EXCEPTIONS', () => {
    const path = 'hooks/useLocalizedRoutes/useLocalizedRoutes.tsx';
    const content = `t(translationKey, { lng })`;
    expect(processDynamicKeys(content, path)).toEqual([]);
  });
});
