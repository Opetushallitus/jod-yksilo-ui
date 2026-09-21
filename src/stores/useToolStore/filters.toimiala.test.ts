import { beforeEach, describe, expect, it, vi } from 'vitest';

import { components } from '@/api/schema';

import { useToolStore } from '.';
import { filterByToimialat } from './filters';

/**
 * filters.test.ts mocks the codes module, so it cannot tell the two toimiala classifications
 * apart. This suite runs filterByToimialat against the real bundled codesets instead: TOL 2025
 * shifts every section letter after J, so the very same opportunity has to match a different
 * filter letter depending on which version the backend is serving.
 */
vi.mock('@/utils/features', () => ({
  isFeatureEnabled: vi.fn(),
}));
const mockIsFeatureEnabled = vi.mocked((await import('@/utils/features')).isFeatureEnabled);

const useTol2025 = (enabled: boolean) =>
  mockIsFeatureEnabled.mockImplementation((feature) => feature === 'TOIMIALA_TOL2025' && enabled);

const metaWith = (toimialat: string[]): components['schemas']['EhdotusMetadata'] => ({
  tyyppi: 'TYOMAHDOLLISUUS',
  aakkosIndeksi: 1,
  toimialat,
});

describe('filterByToimialat against the real toimiala codesets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // [detailed code from the backend, matching filter under TOL 2008, under TOL 2025]
  const shifted: [string, string, string][] = [
    ['6201', 'J', 'K'], // Ohjelmistojen suunnittelu ja valmistus
    ['6419', 'K', 'L'], // Muu pankkitoiminta
    ['8610', 'Q', 'R'], // Terveydenhuollon laitospalvelut
    ['9900', 'U', 'V'], // Kansainvälisten organisaatioiden toiminta
  ];

  it.each(shifted)('matches %s under section %s with TOL 2008', (code, parent2008, parent2025) => {
    useTol2025(false);
    expect(filterByToimialat([parent2008], metaWith([code]))).toBe(true);
    expect(filterByToimialat([parent2025], metaWith([code]))).toBe(false);
  });

  it.each(shifted)('matches %s under section %s with TOL 2025', (code, parent2008, parent2025) => {
    useTol2025(true);
    expect(filterByToimialat([parent2025], metaWith([code]))).toBe(true);
    expect(filterByToimialat([parent2008], metaWith([code]))).toBe(false);
  });

  it('matches sections before the shift identically in both versions', () => {
    for (const enabled of [false, true]) {
      useTol2025(enabled);
      expect(filterByToimialat(['A'], metaWith(['0111']))).toBe(true);
      expect(filterByToimialat(['C'], metaWith(['1011']))).toBe(true);
    }
  });

  it('matches when any one of several toimialat falls under a selected section', () => {
    useTol2025(true);
    expect(filterByToimialat(['A', 'R'], metaWith(['6201', '8610']))).toBe(true);
  });
});

describe('invalidateToimialaFilters', () => {
  const setStoredFilters = (toimialat: string[], toimialaLuokitus?: string) =>
    useToolStore.setState({
      toimialaLuokitus,
      filters: { ...useToolStore.getState().filters, toimialat, region: ['01'] },
    });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the selections when the classification is unchanged', () => {
    useTol2025(false);
    setStoredFilters(['Q'], 'toimiala');

    useToolStore.getState().invalidateToimialaFilters();

    expect(useToolStore.getState().filters.toimialat).toEqual(['Q']);
  });

  it('discards selections made under the other classification', () => {
    useTol2025(true);
    setStoredFilters(['Q'], 'toimiala');

    useToolStore.getState().invalidateToimialaFilters();

    expect(useToolStore.getState().filters.toimialat).toEqual([]);
    expect(useToolStore.getState().toimialaLuokitus).toBe('toimiala2025');
  });

  it('leaves the other filters alone', () => {
    useTol2025(true);
    setStoredFilters(['Q'], 'toimiala');

    useToolStore.getState().invalidateToimialaFilters();

    expect(useToolStore.getState().filters.region).toEqual(['01']);
  });

  it('records the classification for a session that has none stored yet', () => {
    useTol2025(false);
    setStoredFilters([], undefined);

    useToolStore.getState().invalidateToimialaFilters();

    expect(useToolStore.getState().toimialaLuokitus).toBe('toimiala');
  });
});
