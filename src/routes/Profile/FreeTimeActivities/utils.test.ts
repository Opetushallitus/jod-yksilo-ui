import { describe, expect, it } from 'vitest';

import { getFreeTimeActivitiesTableRows, type Toiminto } from './utils';

const createActivity = (dates: Partial<Toiminto>): Toiminto => ({
  id: 'activity',
  nimi: { fi: 'Activity' },
  osaamiset: [],
  ...dates,
});

describe('getFreeTimeActivitiesTableRows', () => {
  it.each([undefined, ''])('preserves a missing start (%s) and a known end', (alkuPvm) => {
    const [row] = getFreeTimeActivitiesTableRows([
      {
        id: 'theme',
        nimi: { fi: 'Theme' },
        toiminnot: [createActivity({ alkuPvm, loppuPvm: '2024-01-01' })],
      },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.subrows![0].alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toEqual(new Date('2024-01-01'));
    expect(row.subrows![0].loppuPvm).toEqual(new Date('2024-01-01'));
  });

  it.each([undefined, ''])('leaves the theme start undefined when an activity has no start (%s)', (alkuPvm) => {
    const [row] = getFreeTimeActivitiesTableRows([
      {
        id: 'theme',
        nimi: { fi: 'Theme' },
        toiminnot: [
          createActivity({ alkuPvm, loppuPvm: '2024-01-01' }),
          createActivity({ id: 'later', alkuPvm: '2020-01-01', loppuPvm: '2023-01-01' }),
          createActivity({ id: 'earlier', alkuPvm: '1960-01-01', loppuPvm: '2022-01-01' }),
        ],
      },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.subrows!.find((activity) => activity.key === 'earlier')!.alkuPvm).toEqual(new Date('1960-01-01'));
    expect(row.loppuPvm).toEqual(new Date('2024-01-01'));
  });

  it('uses the earliest start when all activity starts are known', () => {
    const [row] = getFreeTimeActivitiesTableRows([
      {
        id: 'theme',
        nimi: { fi: 'Theme' },
        toiminnot: [
          createActivity({ alkuPvm: '2020-01-01' }),
          createActivity({ id: 'earlier', alkuPvm: '1960-01-01' }),
        ],
      },
    ]);

    expect(row.alkuPvm).toEqual(new Date('1960-01-01'));
  });

  it.each([undefined, ''])('keeps a theme ongoing when an activity has no end (%s)', (loppuPvm) => {
    const [row] = getFreeTimeActivitiesTableRows([
      {
        id: 'theme',
        nimi: { fi: 'Theme' },
        toiminnot: [
          createActivity({ alkuPvm: '2020-01-01', loppuPvm }),
          createActivity({ id: 'ended', loppuPvm: '2024-01-01' }),
        ],
      },
    ]);

    expect(row.loppuPvm).toBeUndefined();
    expect(row.subrows!.find((activity) => activity.key === 'activity')!.loppuPvm).toBeUndefined();
    expect(row.subrows!.find((activity) => activity.key === 'ended')!.loppuPvm).toEqual(new Date('2024-01-01'));
  });

  it('preserves an end date at the Unix epoch', () => {
    const [row] = getFreeTimeActivitiesTableRows([
      {
        id: 'theme',
        nimi: { fi: 'Theme' },
        toiminnot: [createActivity({ loppuPvm: '1970-01-01' })],
      },
    ]);

    expect(row.loppuPvm).toEqual(new Date('1970-01-01'));
  });

  it('leaves dates undefined for a theme without activities', () => {
    const [row] = getFreeTimeActivitiesTableRows([{ id: 'theme', nimi: { fi: 'Theme' }, toiminnot: [] }]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toBeUndefined();
  });

  it('preserves missing dates for an undated activity', () => {
    const [row] = getFreeTimeActivitiesTableRows([
      { id: 'theme', nimi: { fi: 'Theme' }, toiminnot: [createActivity({})] },
    ]);

    expect(row.alkuPvm).toBeUndefined();
    expect(row.loppuPvm).toBeUndefined();
    expect(row.subrows![0].alkuPvm).toBeUndefined();
    expect(row.subrows![0].loppuPvm).toBeUndefined();
  });
});
