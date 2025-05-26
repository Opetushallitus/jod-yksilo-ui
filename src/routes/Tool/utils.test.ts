import { describe, expect, it } from 'vitest';
import { countFilteredEhdotukset } from './utils';

type MahdollisuusTyyppi = 'KOULUTUSMAHDOLLISUUS' | 'TYOMAHDOLLISUUS';

describe('Tool utilities', () => {
  describe('countFilteredEhdotukset', () => {
    const counts = {
      KOULUTUSMAHDOLLISUUS: 3,
      TYOMAHDOLLISUUS: 5,
    };

    it('returns sum of both when filters include ALL', () => {
      expect(countFilteredEhdotukset(['ALL'], counts)).toBe(8);
    });

    it('returns sum of both when filters are empty', () => {
      expect(countFilteredEhdotukset([], counts)).toBe(8);
    });

    it('returns only KOULUTUSMAHDOLLISUUS count when filtered', () => {
      expect(countFilteredEhdotukset(['KOULUTUSMAHDOLLISUUS'], counts)).toBe(3);
    });

    it('returns only TYOMAHDOLLISUUS count when filtered', () => {
      expect(countFilteredEhdotukset(['TYOMAHDOLLISUUS'], counts)).toBe(5);
    });

    it('returns sum when both KOULUTUSMAHDOLLISUUS and TYOMAHDOLLISUUS are filtered', () => {
      expect(countFilteredEhdotukset(['KOULUTUSMAHDOLLISUUS', 'TYOMAHDOLLISUUS'], counts)).toBe(8);
    });

    it('retuns a sum of all counts if ALL is present', () => {
      expect(countFilteredEhdotukset(['ALL', 'KOULUTUSMAHDOLLISUUS'], counts)).toBe(8);
    });

    it('returns 0 for missing keys in counts', () => {
      const partialCounts = { KOULUTUSMAHDOLLISUUS: 2 } as Record<MahdollisuusTyyppi, number>;
      expect(countFilteredEhdotukset(['TYOMAHDOLLISUUS'], partialCounts)).toBe(0);
    });
  });
});
