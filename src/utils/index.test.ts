import { LangCode } from '@/i18n/config';
import { formatDate, getLocalizedRoutesMap, getLocalizedText, removeDuplicates, sortByProperty } from '@/utils';
import i18n from 'i18next';
import { RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('utils', () => {
  const fiRoutes: RouteObject[] = [{ path: 'koti' }, { path: 'tietoa' }];
  const enRoutes: RouteObject[] = [{ path: 'home' }, { path: 'about' }];
  const getLangCode = (lang: LangCode) => lang; // For typing so we don't have to put "as LangCode" everywhere

  describe('getLocalizedRoutesMap', () => {
    it('should create a map of localized routes with indices', () => {
      const localizedRoutes = [
        {
          lang: getLangCode('en'),
          routes: enRoutes,
        },
        {
          lang: getLangCode('fi'),
          routes: fiRoutes,
        },
      ];

      const localizedRoutesMap = getLocalizedRoutesMap(localizedRoutes);
      expect(localizedRoutesMap.get('en')).toEqual([{ path: '/home' }, { path: '/about' }]);
      expect(localizedRoutesMap.get('fi')).toEqual([{ path: '/koti' }, { path: '/tietoa' }]);
    });

    it('should handle missing routes for a language', () => {
      const localizedRoutes = [
        { lang: getLangCode('en'), routes: enRoutes },
        { lang: getLangCode('fi'), routes: [] }, // No routes for 'fi'
      ];

      const localizedRoutesMap = getLocalizedRoutesMap(localizedRoutes);
      expect(localizedRoutesMap.get('en')).toEqual([{ path: '/home' }, { path: '/about' }]);
      expect(localizedRoutesMap.get('fi')).toEqual([]);
    });

    it('should flatten routes and add parent paths', () => {
      const localizedRoutes = [
        {
          lang: getLangCode('en'),
          routes: [
            {
              path: 'home',
              children: [
                {
                  path: 'foo',
                  children: [{ path: 'bar' }],
                },
              ],
            },
          ],
        },
      ];

      const localizedRoutesMap = getLocalizedRoutesMap(localizedRoutes);
      expect(localizedRoutesMap.get('en')).toEqual([
        { path: '/home' },
        { path: '/home/foo' },
        { path: '/home/foo/bar' },
      ]);
    });
  });

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
      const sortedItems = items.sort(sortByProperty('name'));
      expect(sortedItems).toEqual([{ name: 'apple' }, { name: 'banana' }, { name: 'cherry' }]);
    });

    it('should reverse the sorted array', () => {
      const items = [{ name: 'banana' }, { name: 'apple' }, { name: 'cherry' }];
      const sortedItems = items.sort(sortByProperty('name', true));
      expect(sortedItems).toEqual([{ name: 'cherry' }, { name: 'banana' }, { name: 'apple' }]);
    });

    it('should sort objects by number property', () => {
      const items = [{ age: 30 }, { age: 20 }, { age: 40 }];
      const sortedItems = items.sort(sortByProperty('age'));
      expect(sortedItems).toEqual([{ age: 20 }, { age: 30 }, { age: 40 }]);
    });

    it('should sort objects by date property', () => {
      const items = [
        { date: new Date('2022-01-01') },
        { date: new Date('2021-01-01') },
        { date: new Date('2023-01-01') },
      ];
      const sortedItems = items.sort(sortByProperty('date'));
      expect(sortedItems).toEqual([
        { date: new Date('2021-01-01') },
        { date: new Date('2022-01-01') },
        { date: new Date('2023-01-01') },
      ]);
    });

    it('should return 0 for non-comparable types', () => {
      const items = [{ value: {} }, { value: {} }];
      const sortedItems = items.sort(sortByProperty('value'));
      expect(sortedItems).toEqual(items);
    });
  });
});
