import { LangCode } from '@/i18n/config';
import { formatDate, getLocalizedRoutesMap } from '@/utils';
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
});
