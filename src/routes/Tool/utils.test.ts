import { describe, expect, it } from 'vitest';
import { countFilteredEhdotukset, mergeUniqueValuesExcludingType } from './utils';

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

  describe('mergeUniqueValuesExcludingType', () => {
    interface TestItem {
      id: string;
      tyyppi?: string;
      name?: string;
    }

    it('removes duplicates from new values based on id and tyyppi', () => {
      const current: TestItem[] = [];
      const newValues: TestItem[] = [
        { id: '1', tyyppi: 'A', name: 'First' },
        { id: '1', tyyppi: 'A', name: 'Duplicate' },
        { id: '2', tyyppi: 'B', name: 'Second' },
      ];

      const result = mergeUniqueValuesExcludingType(current, newValues);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('First');
    });

    it('allows same id with different tyyppi', () => {
      const current: TestItem[] = [];
      const newValues: TestItem[] = [
        { id: '1', tyyppi: 'A', name: 'Type A' },
        { id: '1', tyyppi: 'B', name: 'Type B' },
      ];

      const result = mergeUniqueValuesExcludingType(current, newValues);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(['Type A', 'Type B']);
    });

    it('excludes KARTOITETTU type from current values by default', () => {
      const current: TestItem[] = [
        { id: '1', tyyppi: 'KARTOITETTU', name: 'Removed' },
        { id: '2', tyyppi: 'OTHER', name: 'Kept' },
      ];
      const newValues: TestItem[] = [{ id: '3', tyyppi: 'NEW', name: 'Added' }];

      const result = mergeUniqueValuesExcludingType(current, newValues);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(['Kept', 'Added']);
    });

    it('excludes custom type when specified', () => {
      const current: TestItem[] = [
        { id: '1', tyyppi: 'CUSTOM', name: 'Removed' },
        { id: '2', tyyppi: 'OTHER', name: 'Kept' },
      ];
      const newValues: TestItem[] = [{ id: '3', tyyppi: 'NEW', name: 'Added' }];

      const result = mergeUniqueValuesExcludingType(current, newValues, 'CUSTOM');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.name)).toEqual(['Kept', 'Added']);
    });

    it('merges current and new values correctly', () => {
      const current: TestItem[] = [
        { id: '1', tyyppi: 'KARTOITETTU', name: 'Removed' },
        { id: '2', tyyppi: 'TOIMENKUVA', name: 'FromWork' },
        { id: '3', tyyppi: 'KOULUTUS', name: 'FromEducation' },
      ];
      const newValues: TestItem[] = [
        { id: '4', tyyppi: 'KARTOITETTU', name: 'New1' },
        { id: '5', tyyppi: 'KARTOITETTU', name: 'New2' },
      ];

      const result = mergeUniqueValuesExcludingType(current, newValues);
      expect(result).toHaveLength(4);
      expect(result.map((r) => r.name)).toEqual(['FromWork', 'FromEducation', 'New1', 'New2']);
    });

    it('handles empty arrays', () => {
      expect(mergeUniqueValuesExcludingType([], [])).toEqual([]);
    });

    it('handles empty current values', () => {
      const newValues: TestItem[] = [{ id: '1', tyyppi: 'A', name: 'Only' }];
      const result = mergeUniqueValuesExcludingType([], newValues);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Only');
    });

    it('handles empty new values', () => {
      const current: TestItem[] = [
        { id: '1', tyyppi: 'KARTOITETTU', name: 'Removed' },
        { id: '2', tyyppi: 'OTHER', name: 'Kept' },
      ];
      const result = mergeUniqueValuesExcludingType(current, []);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Kept');
    });
  });
});
