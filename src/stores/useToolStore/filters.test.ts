import { components } from '@/api/schema';
import { describe, expect, it } from 'vitest';
import { filterByAmmattiryhmat, filterByEducationType, filterByJobType, filterByRegion } from './filters';
const createMeta = (
  tyyppi: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS',
  koulutusmahdollisuusTyyppi?: 'TUTKINTO' | 'EI_TUTKINTO',
): components['schemas']['EhdotusMetadata'] => ({
  tyyppi,
  koulutusmahdollisuusTyyppi,
  aakkosIndeksi: 1,
});

describe('filterByRegion', () => {
  it('should return true when regions array is empty', () => {
    const result = filterByRegion([], createMeta('TYOMAHDOLLISUUS'));
    expect(result).toBe(true);
  });
  it('should return true when meta.maakunnat includes one of the regions', () => {
    const result = filterByRegion(['01', '02'], { ...createMeta('TYOMAHDOLLISUUS'), maakunnat: ['03', '02', '05'] });
    expect(result).toBe(true);
  });
  it('should return false when meta.maakunnat does not include any of the regions', () => {
    const result = filterByRegion(['01', '04'], {
      ...createMeta('KOULUTUSMAHDOLLISUUS'),
      maakunnat: ['03', '02', '05'],
    });
    expect(result).toBe(false);
  });
});

describe('filterByEducationType', () => {
  it('should return true when educationOpportunityType array is empty', () => {
    const result = filterByEducationType([], createMeta('KOULUTUSMAHDOLLISUUS', 'TUTKINTO'));
    expect(result).toBe(true);
  });

  it('should return true when meta.tyyppi is not KOULUTUSMAHDOLLISUUS', () => {
    const result = filterByEducationType(['TUTKINTO'], createMeta('TYOMAHDOLLISUUS', 'TUTKINTO'));
    expect(result).toBe(true);
  });

  it('should return true when TUTKINTO is selected and meta is TUTKINTO type', () => {
    const result = filterByEducationType(['TUTKINTO'], createMeta('KOULUTUSMAHDOLLISUUS', 'TUTKINTO'));
    expect(result).toBe(true);
  });

  it('should return true when EI_TUTKINTO is selected and meta is EI_TUTKINTO type', () => {
    const result = filterByEducationType(['EI_TUTKINTO'], createMeta('KOULUTUSMAHDOLLISUUS', 'EI_TUTKINTO'));
    expect(result).toBe(true);
  });

  it('should return false when TUTKINTO is selected but meta is EI_TUTKINTO type', () => {
    const result = filterByEducationType(['TUTKINTO'], createMeta('KOULUTUSMAHDOLLISUUS', 'EI_TUTKINTO'));
    expect(result).toBe(false);
  });

  it('should return false when EI_TUTKINTO is selected but meta is TUTKINTO type', () => {
    const result = filterByEducationType(['EI_TUTKINTO'], createMeta('KOULUTUSMAHDOLLISUUS', 'TUTKINTO'));
    expect(result).toBe(false);
  });
});

describe('filterByJobType', () => {
  it('should return true when jobOpportunityType array is empty', () => {
    const result = filterByJobType([], createMeta('TYOMAHDOLLISUUS'));
    expect(result).toBe(true);
  });

  it('should return true when meta.tyyppi is not TYOMAHDOLLISUUS', () => {
    const result = filterByJobType(['AMMATTITIETO'], createMeta('KOULUTUSMAHDOLLISUUS'));
    expect(result).toBe(true);
  });

  it('should return true when AMMATTITIETO is selected and meta.aineisto is AMMATTITIETO', () => {
    const result = filterByJobType(['AMMATTITIETO'], { ...createMeta('TYOMAHDOLLISUUS'), aineisto: 'AMMATTITIETO' });
    expect(result).toBe(true);
  });

  it('should return true when TMT is selected and meta.aineisto is TMT', () => {
    const result = filterByJobType(['TMT'], { ...createMeta('TYOMAHDOLLISUUS'), aineisto: 'TMT' });
    expect(result).toBe(true);
  });

  it('should return false when AMMATTITIETO is selected but meta.aineisto is TMT', () => {
    const result = filterByJobType(['AMMATTITIETO'], { ...createMeta('TYOMAHDOLLISUUS'), aineisto: 'TMT' });
    expect(result).toBe(false);
  });

  it('should return false when TMT is selected but meta.aineisto is AMMATTITIETO', () => {
    const result = filterByJobType(['TMT'], { ...createMeta('TYOMAHDOLLISUUS'), aineisto: 'AMMATTITIETO' });
    expect(result).toBe(false);
  });
});

describe('filterByAmmattiryhmat', () => {
  it('should return true when ammattiryhmat array is empty', () => {
    const result = filterByAmmattiryhmat([], createMeta('TYOMAHDOLLISUUS'));
    expect(result).toBe(true);
  });

  it('should return true when meta.tyyppi is not TYOMAHDOLLISUUS', () => {
    const result = filterByAmmattiryhmat(['C1'], createMeta('KOULUTUSMAHDOLLISUUS'));
    expect(result).toBe(true);
  });
  it('should return true when meta.ammattiryhma starts with one of the ammattiryhmat', () => {
    const result = filterByAmmattiryhmat(['C1', 'C2'], { ...createMeta('TYOMAHDOLLISUUS'), ammattiryhma: 'C1234' });
    expect(result).toBe(true);
  });
  it('should return false when meta.ammattiryhma does not start with any of the ammattiryhmat', () => {
    const result = filterByAmmattiryhmat(['C3', 'C4'], { ...createMeta('TYOMAHDOLLISUUS'), ammattiryhma: 'C1234' });
    expect(result).toBe(false);
  });
});
