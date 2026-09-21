import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCodesetItems, getCodesetValue, getToimiala, getToimialaLuokitus } from './codes';

vi.mock('@/utils/features', () => ({
  isFeatureEnabled: vi.fn(),
}));
const mockIsFeatureEnabled = vi.mocked((await import('@/utils/features')).isFeatureEnabled);

const useTol2025 = (enabled: boolean) =>
  mockIsFeatureEnabled.mockImplementation((feature) => feature === 'TOIMIALA_TOL2025' && enabled);

describe('toimiala codeset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TOL 2025 splits section J in two, which shifts every following section letter by one. These
   * divisions therefore report a different parent depending on which version is active, and
   * getting it wrong would silently mis-filter opportunities rather than fail visibly.
   */
  describe.each([
    ['61', 'J', 'K'],
    ['64', 'K', 'L'],
    ['68', 'L', 'M'],
    ['84', 'O', 'P'],
    ['86', 'Q', 'R'],
    ['99', 'U', 'V'],
  ])('division %s', (code, parent2008, parent2025) => {
    it(`has parent ${parent2008} under TOL 2008`, () => {
      useTol2025(false);
      expect(getToimiala(code)?.parentCode).toBe(parent2008);
    });

    it(`has parent ${parent2025} under TOL 2025`, () => {
      useTol2025(true);
      expect(getToimiala(code)?.parentCode).toBe(parent2025);
    });
  });

  it('keeps divisions before the shift on the same section in both versions', () => {
    useTol2025(false);
    expect(getToimiala('01')?.parentCode).toBe('A');
    useTol2025(true);
    expect(getToimiala('01')?.parentCode).toBe('A');
  });

  it('only knows division 45 under TOL 2008, where it exists', () => {
    useTol2025(false);
    expect(getToimiala('45')?.parentCode).toBe('G');
    useTol2025(true);
    expect(getToimiala('45')).toBeUndefined();
  });

  it('reports the active classification', () => {
    useTol2025(false);
    expect(getToimialaLuokitus()).toBe('toimiala');
    useTol2025(true);
    expect(getToimialaLuokitus()).toBe('toimiala2025');
  });

  const sectionCodes = async () =>
    (await getCodesetItems('toimiala', 'fi')).filter((item) => item.level === 1).map((item) => item.code);

  it('lists the TOL 2008 sections, including the unknown-industry section X', async () => {
    useTol2025(false);

    await expect(sectionCodes()).resolves.toEqual('ABCDEFGHIJKLMNOPQRSTU'.split('').concat('X'));
  });

  it('lists the TOL 2025 sections, which have no unknown-industry section', async () => {
    useTol2025(true);

    await expect(sectionCodes()).resolves.toEqual('ABCDEFGHIJKLMNOPQRSTUV'.split(''));
  });

  it.each([
    ['fi', 'Terveys- ja sosiaalipalvelut', 'Sosiaali- ja terveyspalvelut'],
    ['sv', 'Vård och omsorg; sociala tjänster', 'Vård och omsorg; social verksamhet'],
    ['en', 'Human health and social work activities', 'Human health and social work activities'],
  ])('resolves section Q/R names in %s for both versions', async (lang, name2008, name2025) => {
    useTol2025(false);
    await expect(getCodesetValue('toimiala', 'Q', lang as 'fi' | 'sv' | 'en')).resolves.toBe(name2008);

    useTol2025(true);
    await expect(getCodesetValue('toimiala', 'R', lang as 'fi' | 'sv' | 'en')).resolves.toBe(name2025);
  });

  it('leaves other codesets untouched by the toimiala flag', async () => {
    useTol2025(true);
    await expect(getCodesetValue('maakunta', '01', 'fi')).resolves.not.toBe('01');
  });
});
