import { describe, expect, it, vi } from 'vitest';

import i18n from '@/i18n/config';

import loader from './loader';

describe('loader', () => {
  it('should change the language if it is different from the current language', async () => {
    const spyChangeLanguage = vi.spyOn(i18n, 'changeLanguage');
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response),
    );

    await loader({
      context: {
        csrf: {
          token: 'dummyToken',
          headerName: 'X-CSRF-Token',
          parameterName: '_csrf',
        },
      },
      request: {} as Request,
      params: {
        lng: 'sv',
      },
      unstable_url: new URL('http://localhost'),
      unstable_pattern: '',
    });

    expect(spyChangeLanguage).toHaveBeenCalledWith('sv');
  });
});
