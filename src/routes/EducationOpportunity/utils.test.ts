/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';
import { formatMonths, getDurationText } from './utils';

vi.mock('@/i18n/config', () => ({
  default: {
    t: (key: string, params: { count?: number; years?: number; months?: number; min?: number; max?: number }) => {
      switch (key) {
        case 'education-opportunity.duration.of-year':
          return `${params.count} vuoden`;
        case 'education-opportunity.duration.of-month':
          return `${params.count} kuukauden`;
        case 'education-opportunity.duration.years-and-months':
          return `${params.years} ja ${params.months}`;
        case 'education-opportunity.duration.range':
          return `(${params.min} - ${params.max})`;
        case 'education-opportunity.duration.average-months':
          return `Keskiarvo ${params.count} kuukautta`;
        case 'education-opportunity.duration.average-years':
          return `Keskiarvo ${params.count} vuotta`;
        default:
          return key;
      }
    },
  },
}));

describe('formatMonths', () => {
  it('returns empty string for 0 or falsy', () => {
    expect(formatMonths(0)).toBe('');
    expect(formatMonths(undefined as any)).toBe('');
    expect(formatMonths(null as any)).toBe('');
  });

  it('formats only years', () => {
    expect(formatMonths(24)).toBe('2 vuoden');
    expect(formatMonths(12)).toBe('1 vuoden');
  });

  it('formats only months', () => {
    expect(formatMonths(3)).toBe('3 kuukauden');
    expect(formatMonths(11)).toBe('11 kuukauden');
  });

  it('formats years and months', () => {
    expect(formatMonths(15)).toBe('1 vuoden ja 3 kuukauden');
    expect(formatMonths(25)).toBe('2 vuoden ja 1 kuukauden');
  });
});

describe('getDurationText', () => {
  const base = { mediaani: 12, minimi: 12, maksimi: 12 };

  it('returns null if no mediaani or mediaani is 0', () => {
    expect(getDurationText(undefined as any)).toBeNull();
    expect(getDurationText({ ...base, mediaani: 0 })).toBeNull();
  });

  it('returns only median if min/max are missing or equal to median', () => {
    expect(getDurationText(base)).toBe('Keskiarvo 1 vuotta');
    expect(getDurationText({ mediaani: 10, minimi: 0, maksimi: 0 })).toBe('Keskiarvo 10 kuukautta');
    expect(getDurationText({ mediaani: 24, minimi: 24, maksimi: 24 })).toBe('Keskiarvo 2 vuotta');
  });

  it('returns median and range if min/max differ from median', () => {
    expect(getDurationText({ mediaani: 12, minimi: 6, maksimi: 18 })).toBe(
      'Keskiarvo 1 vuotta (6 kuukauden - 1 vuoden ja 6 kuukauden)',
    );
    expect(getDurationText({ mediaani: 10, minimi: 8, maksimi: 12 })).toBe(
      'Keskiarvo 10 kuukautta (8 kuukauden - 1 vuoden)',
    );
  });

  it('handles missing minimi or maksimi gracefully', () => {
    expect(getDurationText({ mediaani: 12, minimi: 6, maksimi: 0 })).toBe('Keskiarvo 1 vuotta');
    expect(getDurationText({ mediaani: 12, maksimi: 18, minimi: 0 })).toBe('Keskiarvo 1 vuotta');
  });
});
