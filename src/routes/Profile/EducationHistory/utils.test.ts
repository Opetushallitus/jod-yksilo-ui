import { describe, expect, it } from 'vitest';

import { getEducationHistoryTableRows, type Koulutus } from './utils';

const createEducation = (dates: Partial<Koulutus>): Koulutus => ({
  id: 'education',
  nimi: { fi: 'Education' },
  osaamiset: [],
  ...dates,
});

describe('getEducationHistoryTableRows', () => {
  it.each([undefined, ''])('leaves the group start undefined when an education has no start (%s)', (alkuPvm) => {
    const [row] = getEducationHistoryTableRows([
      {
        id: 'group',
        nimi: { fi: 'Group' },
        koulutukset: [
          createEducation({ alkuPvm, loppuPvm: '2024-01-01' }),
          createEducation({ id: 'known', alkuPvm: '1960-01-01', loppuPvm: '2023-01-01' }),
        ],
      },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toEqual(new Date('2024-01-01'));
    expect(row.subrows!.find((education) => education.key === 'education')!.alkuPvm).toBeUndefined();
    expect(row.subrows!.find((education) => education.key === 'known')!.alkuPvm).toEqual(new Date('1960-01-01'));
  });

  it('uses the earliest start and latest end when all dates are known', () => {
    const [row] = getEducationHistoryTableRows([
      {
        id: 'group',
        nimi: { fi: 'Group' },
        koulutukset: [
          createEducation({ alkuPvm: '2020-01-01', loppuPvm: '2024-01-01' }),
          createEducation({ id: 'earlier', alkuPvm: '1960-01-01', loppuPvm: '2023-01-01' }),
        ],
      },
    ]);

    expect(row.alkuPvm).toEqual(new Date('1960-01-01'));
    expect(row.loppuPvm).toEqual(new Date('2024-01-01'));
  });

  it.each([undefined, ''])('keeps a group ongoing when an education has no end (%s)', (loppuPvm) => {
    const [row] = getEducationHistoryTableRows([
      {
        id: 'group',
        nimi: { fi: 'Group' },
        koulutukset: [
          createEducation({ alkuPvm: '1960-01-01', loppuPvm }),
          createEducation({ id: 'ended', alkuPvm: '2020-01-01', loppuPvm: '2024-01-01' }),
        ],
      },
    ]);

    expect(row.alkuPvm).toEqual(new Date('1960-01-01'));
    expect(row.loppuPvm).toBeUndefined();
    expect(row.subrows!.find((education) => education.key === 'education')!.loppuPvm).toBeUndefined();
    expect(row.subrows!.find((education) => education.key === 'ended')!.loppuPvm).toEqual(new Date('2024-01-01'));
  });

  it('preserves an end date at the Unix epoch', () => {
    const [row] = getEducationHistoryTableRows([
      { id: 'group', nimi: { fi: 'Group' }, koulutukset: [createEducation({ loppuPvm: '1970-01-01' })] },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toEqual(new Date('1970-01-01'));
  });

  it('leaves dates undefined for a group without educations', () => {
    const [row] = getEducationHistoryTableRows([{ id: 'group', nimi: { fi: 'Group' }, koulutukset: [] }]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toBeUndefined();
  });

  it('preserves missing dates for an undated education', () => {
    const [row] = getEducationHistoryTableRows([
      { id: 'group', nimi: { fi: 'Group' }, koulutukset: [createEducation({})] },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toBeUndefined();
    expect(row.subrows![0].alkuPvm).toBeUndefined();
    expect(row.subrows![0].loppuPvm).toBeUndefined();
  });
});
