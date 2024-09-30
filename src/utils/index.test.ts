import { formatDate, getLocalizedText, removeDuplicates, sortByProperty } from '@/utils';
import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

const TEST_DATE_1 = '2021-01-01';
const TEST_DATE_2 = '2022-01-01';
const TEST_DATE_3 = '2023-01-01';

describe('utils', () => {
  describe('formatDate', () => {
    it('should return formatted date string', () => {
      const date = new Date(2022, 0, 15);
      const formattedDate = formatDate(date);
      expect(formattedDate).toEqual('1/2022');
    });

    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      const formattedDate = formatDate(invalidDate);
      expect(formattedDate).toEqual('');
    });
  });

  describe('getLocalizedText', () => {
    it('should return the text in the current i18next language', () => {
      const entry = { en: 'Hello', fi: 'Moro' };
      i18n.language = 'fi';
      expect(getLocalizedText(entry)).toBe('Moro');
    });

    it('should return an empty string if the text is not available in the current language', () => {
      const entry = { en: 'Hello' };
      i18n.language = 'fi';
      expect(getLocalizedText(entry)).toBe('');
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicates based on a top-level property', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Alice' },
      ];
      const result = removeDuplicates(data, 'name');
      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('should remove duplicates based on a nested property', () => {
      const data = [
        { id: 1, info: { name: 'Alice' } },
        { id: 2, info: { name: 'Bob' } },
        { id: 3, info: { name: 'Alice' } },
      ];
      const result = removeDuplicates(data, 'info.name');
      expect(result).toEqual([
        { id: 1, info: { name: 'Alice' } },
        { id: 2, info: { name: 'Bob' } },
      ]);
    });

    it('should handle an empty array', () => {
      const data: { id: number; name: string }[] = [];
      const result = removeDuplicates(data, 'name');
      expect(result).toEqual([]);
    });

    it('should handle an array with no duplicates', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const result = removeDuplicates(data, 'name');
      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('should handle complex nested properties', () => {
      const data = [
        { id: 1, info: { details: { name: 'Alice' } } },
        { id: 2, info: { details: { name: 'Bob' } } },
        { id: 3, info: { details: { name: 'Alice' } } },
        { id: 4, info: { details: { name: 'Alice' } } },
      ];
      const result = removeDuplicates(data, 'info.details.name');
      expect(result).toEqual([
        { id: 1, info: { details: { name: 'Alice' } } },
        { id: 2, info: { details: { name: 'Bob' } } },
      ]);
    });
  });

  describe('sortByProperty', () => {
    it('should sort objects by string property', () => {
      const items = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
      const sortedItems = [...items].sort(sortByProperty('name'));
      expect(sortedItems).toEqual([{ name: 'apple' }, { name: 'banana' }, { name: 'cherry' }]);
    });

    it('should reverse the sorted array', () => {
      const items = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
      const sortedItems = [...items].sort(sortByProperty('name', true));
      expect(sortedItems).toEqual([{ name: 'cherry' }, { name: 'banana' }, { name: 'apple' }]);
    });

    it('should sort objects by number property', () => {
      const items = [{ age: 30 }, { age: 20 }, { age: 40 }];
      const sortedItems = [...items].sort(sortByProperty('age'));
      expect(sortedItems).toEqual([{ age: 20 }, { age: 30 }, { age: 40 }]);
    });

    it('should sort objects by date property', () => {
      const items = [{ date: new Date(TEST_DATE_2) }, { date: new Date(TEST_DATE_1) }, { date: new Date(TEST_DATE_3) }];
      const sortedItems = [...items].sort(sortByProperty('date'));
      expect(sortedItems).toEqual([
        { date: new Date(TEST_DATE_1) },
        { date: new Date(TEST_DATE_2) },
        { date: new Date(TEST_DATE_3) },
      ]);
    });

    it('should return 0 for non-comparable types', () => {
      const items = [{ value: {} }, { value: {} }];
      const sortedItems = [...items].sort(sortByProperty('value'));
      expect(sortedItems).toEqual(items);
    });
  });

  it('should sort objects by nested string properties', () => {
    const items = [{ fruit: { name: 'banana' } }, { fruit: { name: 'apple' } }, { fruit: { name: 'cherry' } }];
    const sortedItems = [...items].sort(sortByProperty('fruit.name'));
    expect(sortedItems).toEqual([
      { fruit: { name: 'apple' } },
      { fruit: { name: 'banana' } },
      { fruit: { name: 'cherry' } },
    ]);
  });

  it('should reverse the sorted array', () => {
    const items = [{ fruit: { name: 'banana' } }, { fruit: { name: 'apple' } }, { fruit: { name: 'cherry' } }];
    const sortedItems = [...items].sort(sortByProperty('fruit.name', true));
    expect(sortedItems).toEqual([
      { fruit: { name: 'cherry' } },
      { fruit: { name: 'banana' } },
      { fruit: { name: 'apple' } },
    ]);
  });

  it('should sort objects by number property  in reverse', () => {
    const items = [
      { fruit: { name: 'banana', count: 30 } },
      { fruit: { name: 'apple', count: 50 } },
      { fruit: { name: 'cherry', count: 100 } },
    ];
    const sortedItems = [...items].sort(sortByProperty('fruit.count', true));
    expect(sortedItems).toEqual([
      { fruit: { name: 'cherry', count: 100 } },
      { fruit: { name: 'apple', count: 50 } },
      { fruit: { name: 'banana', count: 30 } },
    ]);
  });

  it('should sort objects by date property', () => {
    const items = [
      { fruit: { name: 'banana', count: 30, data: { date: new Date(TEST_DATE_2) } } },
      { fruit: { name: 'apple', count: 50, data: { date: new Date(TEST_DATE_1) } } },
      { fruit: { name: 'cherry', count: 100, data: { date: new Date(TEST_DATE_3) } } },
    ];
    const sortedItems = [...items].sort(sortByProperty('fruit.data.date'));
    expect(sortedItems).toEqual([
      { fruit: { name: 'apple', count: 50, data: { date: new Date(TEST_DATE_1) } } },
      { fruit: { name: 'banana', count: 30, data: { date: new Date(TEST_DATE_2) } } },
      { fruit: { name: 'cherry', count: 100, data: { date: new Date(TEST_DATE_3) } } },
    ]);
  });

  it('should return 0 for non-comparable types', () => {
    const items = [{ value: { nested: {} } }, { value: { nested: {} } }];
    const sortedItems = [...items].sort(sortByProperty('value.nested'));
    expect(sortedItems).toEqual(items);
  });
});
