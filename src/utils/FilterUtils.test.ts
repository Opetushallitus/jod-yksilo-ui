import { describe, expect, it } from 'vitest';
import { getFilterCount, noFiltersSelected } from './FilterUtils';

describe('getFilterCount', () => {
  it('returns 0 if filters is null or undefined', () => {
    // @ts-expect-error Filters are required, but test null and undefined just in case
    expect(getFilterCount(undefined, ['a'])).toBe(0);
    // @ts-expect-error Filters are required, but test null and undefined just in case
    expect(getFilterCount(null, ['a'])).toBe(0);
  });

  it('counts array lengths for array filters', () => {
    const filters = { a: [1, 2], b: [3] };
    expect(getFilterCount(filters, ['a', 'b'])).toBe(3);
  });

  it('sums numbers for number filters', () => {
    const filters = { a: 2, b: 3 };
    expect(getFilterCount(filters, ['a', 'b'])).toBe(5);
  });

  it('ignores non-array, non-number values', () => {
    const filters = { a: 'foo', b: null, c: undefined };
    expect(getFilterCount(filters, ['a', 'b', 'c'])).toBe(0);
  });

  it('handles mixed types', () => {
    const filters = { a: [1], b: 2, c: 'foo', d: null };
    expect(getFilterCount(filters, ['a', 'b', 'c', 'd'])).toBe(3);
  });
});

describe('noFiltersSelected', () => {
  it('returns true if all arrays are empty', () => {
    expect(noFiltersSelected({ a: [], b: [] })).toBe(true);
  });

  it('returns true if all numbers are zero', () => {
    expect(noFiltersSelected({ a: 0, b: 0 })).toBe(true);
  });

  it('returns true if all values are null', () => {
    expect(noFiltersSelected({ a: null, b: null })).toBe(true);
  });

  it('returns true if filters is null or undefined', () => {
    expect(noFiltersSelected(undefined)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(noFiltersSelected(null as any)).toBe(true);
  });

  it('returns false if any array has items', () => {
    expect(noFiltersSelected({ a: [1], b: [] })).toBe(false);
  });

  it('returns false if any number is non-zero', () => {
    expect(noFiltersSelected({ a: 1, b: 0 })).toBe(false);
  });

  it('returns true for other types (string, undefined)', () => {
    expect(noFiltersSelected({ a: undefined, b: 'foo' })).toBe(true);
  });
});
