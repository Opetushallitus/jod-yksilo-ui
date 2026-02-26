import {
  formatDate,
  getLocalizedText,
  hyphenize,
  normalizeMultilineText,
  paginate,
  parseBoolean,
  removeDuplicatesByKey,
  sortByProperty,
} from '@/utils';
import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

const TEST_DATE_1 = '2021-01-01';
const TEST_DATE_2 = '2022-01-01';
const TEST_DATE_3 = '2023-01-01';

describe('utils', () => {
  describe('formatDate', () => {
    it('should return formatted short date string', () => {
      const date = new Date(2022, 0, 15);
      const formattedDate = formatDate(date);
      expect(formattedDate).toEqual('1/2022');
    });
    it('should return formatted medium date string', () => {
      const date = new Date(2022, 0, 15);
      const formattedDate = formatDate(date, 'medium');
      expect(formattedDate).toEqual('15.1.2022');
    });

    it('should return empty string for invalid date', () => {
      const invalidDate = new Date('invalid');
      const formattedDate = formatDate(invalidDate);
      expect(formattedDate).toEqual('');
    });
  });

  describe('hyphenize', () => {
    it('converts spaces to hyphens and lowercases the string', () => {
      expect(hyphenize('My Section Title')).toBe('my-section-title');
      expect(hyphenize('Another Example Here')).toBe('another-example-here');
    });

    it('handles multiple spaces', () => {
      expect(hyphenize('A   B    C')).toBe('a-b-c');
    });

    it('handles already hyphenized and lowercase strings', () => {
      expect(hyphenize('already-hyphenized')).toBe('already-hyphenized');
      expect(hyphenize('lowercase')).toBe('lowercase');
    });

    it('handles empty string', () => {
      expect(hyphenize('')).toBe('');
    });

    it('trims strings with leading/trailing spaces', () => {
      expect(hyphenize('  Leading and trailing  ')).toBe('leading-and-trailing');
    });

    it('handles strings with only spaces', () => {
      expect(hyphenize('     ')).toBe('');
    });
  });

  describe('getLocalizedText', () => {
    it('should return the text in the current i18next language', () => {
      const entry = { en: 'Hello', fi: 'Moro' };
      i18n.language = 'fi';
      expect(getLocalizedText(entry)).toBe('Moro');
    });

    it('should return an string from supportedLngs if the text is not available in the current language', () => {
      const entry = { en: 'Hello' };
      i18n.language = 'fi';
      expect(getLocalizedText(entry)).toBe('Hello');
    });

    it('should prefer fallBackLng if no localization is found', () => {
      const entry = { en: 'Hello', sv: 'Hej' };
      i18n.language = 'fi';
      i18n.options.fallbackLng = 'sv';
      expect(getLocalizedText(entry)).toBe('Hej');
    });

    it('should return the text in the given language', () => {
      const entry = { en: 'Hello', fi: 'Moro' };
      i18n.language = 'en';
      expect(getLocalizedText(entry)).toBe('Hello');
    });
  });

  describe('removeDuplicatesByKey', () => {
    it('should remove duplicates based on a top-level property', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Alice' },
      ];
      const result = removeDuplicatesByKey(data, (d) => d.name);
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
      const result = removeDuplicatesByKey(data, (d) => d.info.name);
      expect(result).toEqual([
        { id: 1, info: { name: 'Alice' } },
        { id: 2, info: { name: 'Bob' } },
      ]);
    });

    it('should handle an empty array', () => {
      const data: { id: number; name: string }[] = [];
      const result = removeDuplicatesByKey(data, (d) => d.name);
      expect(result).toEqual([]);
    });

    it('should handle an array with no duplicates', () => {
      const data = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];
      const result = removeDuplicatesByKey(data, (d) => d.name);
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
      const result = removeDuplicatesByKey(data, (d) => d.info.details.name);
      expect(result).toEqual([
        { id: 1, info: { details: { name: 'Alice' } } },
        { id: 2, info: { details: { name: 'Bob' } } },
      ]);
    });

    it('should handle filtering by multiple properties', () => {
      const data = [
        { id: 1, name: 'Alice', category: 'A' },
        { id: 2, name: 'Bob', category: 'B' },
        { id: 3, name: 'Alice', category: 'A' },
        { id: 4, name: 'Alice', category: 'C' },
      ];
      const result = removeDuplicatesByKey(data, (d) => d.name + d.category);
      expect(result).toEqual([
        { id: 1, name: 'Alice', category: 'A' },
        { id: 2, name: 'Bob', category: 'B' },
        { id: 4, name: 'Alice', category: 'C' },
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

  describe('paginate', () => {
    it('should return the correct page of items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const pageSize = 3;
      const pageNumber = 2;
      const result = paginate(items, pageNumber, pageSize);
      expect(result).toEqual([4, 5, 6]);
    });

    it('should handle an empty array', () => {
      const items: number[] = [];
      const pageSize = 3;
      const pageNumber = 1;
      const result = paginate(items, pageNumber, pageSize);
      expect(result).toEqual([]);
    });

    it('should handle a page number that is out of bounds', () => {
      const items = [1, 2, 3, 4, 5];
      const pageSize = 3;
      const pageNumber = 3;
      const result = paginate(items, pageNumber, pageSize);
      expect(result).toEqual([]);
    });

    it('should handle a page size of zero', () => {
      const items = [1, 2, 3, 4, 5];
      const pageSize = 0;
      const pageNumber = 1;
      const result = paginate(items, pageNumber, pageSize);
      expect(result).toEqual([]);
    });

    it('should handle a negative page number', () => {
      const items = [1, 2, 3, 4, 5];
      const pageSize = 3;
      const pageNumber = -1;
      const result = paginate(items, pageNumber, pageSize);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should use default page number and page size', () => {
      // Assuming that DEFAULT_PAGE_SIZE is 20 in constants file
      const result = paginate(Array.from({ length: 60 }).map((_, i) => i + 1));
      expect(result).toEqual(Array.from({ length: 20 }).map((_, i) => i + 1));
    });
  });

  describe('parseBoolean', () => {
    it('should return true for truthy values', () => {
      const values = ['true', 'True', 'TRUE', '1', 1, true];
      values.forEach((value) => {
        expect(parseBoolean(value)).toBe(true);
      });
    });

    it('should return false for falsy values', () => {
      const values = ['false', 'False', 'FALSE', '0', 0, false];
      values.forEach((value) => {
        expect(parseBoolean(value)).toBe(false);
      });
    });

    it('should return false for weird values', () => {
      const values = [() => void 0, {}, [], Number];
      values.forEach((value) => {
        expect(parseBoolean(value)).toBe(false);
      });
    });
  });
});

describe('normalizeMultilineText', () => {
  it('should return the same string if there are no multiple newlines', () => {
    const input = 'Hello\nWorld';
    expect(normalizeMultilineText(input)).toBe('Hello\nWorld');
  });

  it('should collapse three or more consecutive newlines to two', () => {
    const input = 'Line1\n\n\nLine2';
    expect(normalizeMultilineText(input)).toBe('Line1\n\nLine2');
  });

  it('should collapse more than three consecutive newlines to two', () => {
    const input = 'A\n\n\n\n\nB';
    expect(normalizeMultilineText(input)).toBe('A\n\nB');
  });

  it('should handle empty string', () => {
    expect(normalizeMultilineText('')).toBe('');
  });

  it('should handle string with only newlines', () => {
    expect(normalizeMultilineText('\n\n\n\n')).toBe('\n\n');
  });

  it('should handle undefined input', () => {
    expect(normalizeMultilineText()).toBe('');
  });
});
