import { renderHook } from '@testing-library/react';
import i18next from 'i18next';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useLocalizedRoutes from './useLocalizedRoutes';

describe('useLocalizedRoutes', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('should resolve localized URL', () => {
    const { result } = renderHook(() => useLocalizedRoutes(), {
      wrapper: MemoryRouter,
    });

    const origin = 'http://localhost:1337';

    vi.stubGlobal('location', { origin, pathname: '/fi/ohjeet/kuinka-kaytan-palvelua' });
    const resolvedUrlEn = result.current.resolveLocalizedUrl('en');
    expect(resolvedUrlEn).toBe('/en/user-guide/how-do-i-use-the-service');

    vi.spyOn(i18next, 'language', 'get').mockReturnValue('en');
    vi.stubGlobal('location', { origin, pathname: '/en/profile/work-history' });
    const resolvedUrlFi = result.current.resolveLocalizedUrl('fi');
    expect(resolvedUrlFi).toBe('/fi/omat-sivuni/tyopaikkani');
  });
});
