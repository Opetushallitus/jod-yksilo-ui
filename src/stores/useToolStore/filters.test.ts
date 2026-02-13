import { components } from '@/api/schema';
import { describe, expect, it, vi } from 'vitest';
import {
  filterByAmmattiryhmat,
  filterByEducationType,
  filterByJobType,
  filterByRegion,
  filterByToimialat,
} from './filters';
const createMeta = (
  tyyppi: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS',
  koulutusmahdollisuusTyyppi?: 'TUTKINTO' | 'EI_TUTKINTO',
): components['schemas']['EhdotusMetadata'] => ({
  tyyppi,
  koulutusmahdollisuusTyyppi,
  aakkosIndeksi: 1,
});

// Mock the getToimiala function
vi.mock('../../utils/codes/codes.ts', () => ({
  getToimiala: vi.fn(),
}));
const mockGetToimiala = vi.mocked((await import('../../utils/codes/codes.ts')).getToimiala);

describe('filterByToimialat', () => {
  const createFullMeta = (
    overrides: Partial<components['schemas']['EhdotusMetadata']> = {},
  ): components['schemas']['EhdotusMetadata'] => ({
    tyyppi: 'TYOMAHDOLLISUUS',
    aakkosIndeksi: 1,
    // Fill all optional fields with defaults to satisfy strict TypeScript
    ammattiryhma: '',
    aineisto: 'TMT',
    koulutusmahdollisuusTyyppi: 'TUTKINTO',
    maakunnat: [],
    toimialat: undefined,
    kesto: 0,
    kestoMinimi: 0,
    kestoMaksimi: 0,
    pisteet: 0,
    trendi: 'NOUSEVA',
    osaamisia: 0,
    tyollisyysNakyma: 0,
    ...overrides,
  });

  const clearMocks = () => {
    vi.clearAllMocks();
    mockGetToimiala.mockReset();
  };

  it('returns true when toimialaFilters is empty', () => {
    clearMocks();
    const meta = createFullMeta();
    expect(filterByToimialat([], meta)).toBe(true);
  });

  it('returns true when meta.tyyppi is not TYOMAHDOLLISUUS', () => {
    clearMocks();
    const meta = createFullMeta({ tyyppi: 'KOULUTUSMAHDOLLISUUS' });
    expect(filterByToimialat(['C', 'D'], meta)).toBe(true);
  });

  it('returns false when meta.toimialat is undefined', () => {
    clearMocks();
    const meta = createFullMeta();
    expect(filterByToimialat(['B'], meta)).toBe(false);
  });

  it('returns false when no matching parent codes found', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['01.11', '02.01'] });

    mockGetToimiala.mockReturnValueOnce({ parentCode: 'XX' }).mockReturnValueOnce(undefined);

    expect(filterByToimialat(['03'], meta)).toBe(false);
  });

  it('returns true when at least one upper level has matching parent code', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['0111', '0121'] });

    mockGetToimiala.mockReturnValueOnce({ parentCode: '01' }).mockReturnValueOnce({ parentCode: 'XX' });

    expect(filterByToimialat(['01'], meta)).toBe(true);
  });

  it('handles duplicate upper levels correctly', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['01.11', '01.21', '01.31'] });

    mockGetToimiala.mockReturnValue({ parentCode: 'A' });

    expect(filterByToimialat(['A'], meta)).toBe(true);
    expect(mockGetToimiala).toHaveBeenCalledWith('01');
  });

  it('returns false when getToimiala returns null for matching upper level', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['01.11'] });

    mockGetToimiala.mockReturnValue(undefined);

    expect(filterByToimialat(['01'], meta)).toBe(false);
  });

  it('returns true when matching second filter', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['6033'] });

    mockGetToimiala.mockReturnValue({ parentCode: 'J' });

    const result = filterByToimialat(['C', 'J'], meta);

    expect(result).toBe(true);
    expect(mockGetToimiala).toHaveBeenCalledWith('60');
    expect(mockGetToimiala).toHaveBeenCalledTimes(1);
  });

  it('returns false  when no filter matches', () => {
    clearMocks();
    const meta = createFullMeta({ toimialat: ['8133'] });

    mockGetToimiala.mockReturnValue({ parentCode: 'J' });

    const result = filterByToimialat(['C', 'F', 'A', 'B', 'C'], meta);

    expect(result).toBe(false);
    expect(mockGetToimiala).toHaveBeenCalledWith('81');
    expect(mockGetToimiala).toHaveBeenCalledTimes(1);
  });
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
