import { describe, expect, it } from 'vitest';
import { getDuration } from './utils';

describe('getDuration', () => {
  it('should return correct years and months for a given duration', () => {
    const start = new Date(2020, 0, 1).getTime();
    const end = new Date(2022, 6, 1).getTime();
    const result = getDuration(start, end);
    expect(result).toEqual({ years: 2, months: 6 });
  });

  it('should return zero years and months for the same start and end date', () => {
    const start = new Date(2020, 0, 1).getTime();
    const end = new Date(2020, 0, 1).getTime();
    const result = getDuration(start, end);
    expect(result).toEqual({ years: 0, months: 0 });
  });

  it('should handle durations spanning multiple years and months correctly', () => {
    const start = new Date(2018, 0, 1).getTime();
    const end = new Date(2021, 10, 31).getTime();
    const result = getDuration(start, end);
    expect(result).toEqual({ years: 3, months: 11 });
  });
});
