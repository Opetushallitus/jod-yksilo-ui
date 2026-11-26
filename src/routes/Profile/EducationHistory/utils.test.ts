import { describe, expect, it } from 'vitest';

import type { ExperienceTableRowData } from '@/components';

import { buildSelections, getEducationHistoryTableRows, type Koulutus } from './utils';

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

describe('buildSelections', () => {
  const createRow = (key: string, rest: Partial<ExperienceTableRowData> = {}): ExperienceTableRowData => ({
    key,
    nimi: { fi: key },
    osaamiset: [],
    ...rest,
  });

  const createSkill = (id: string, checked?: boolean): ExperienceTableRowData['osaamiset'][number] => ({
    id,
    nimi: { fi: id },
    kuvaus: { fi: id },
    sourceType: 'koulutus',
    checked,
  });

  const rows = [
    createRow('group', {
      subrows: [
        createRow('selected', {
          checked: true,
          osaamiset: [createSkill('a', true), createSkill('b', false), createSkill('c'), createSkill('a', true)],
        }),
        createRow('unselected', { checked: false, osaamiset: [createSkill('d', true)] }),
        createRow('unset', { osaamiset: [createSkill('e', true)] }),
      ],
    }),
    createRow('empty-group', { subrows: [createRow('unselected-only', { checked: false })] }),
    createRow('no-subrows'),
  ];

  it('includes only the selected educations and their selected, unique skills', () => {
    expect(buildSelections(rows, true)).toEqual([{ id: 'group', lapset: [{ id: 'selected', osaamiset: ['a'] }] }]);
  });

  it('omits the skills when they were not extracted', () => {
    expect(buildSelections(rows, false)).toEqual([{ id: 'group', lapset: [{ id: 'selected' }] }]);
  });
});
