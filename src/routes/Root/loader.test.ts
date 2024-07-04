import { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { describe, expect, it, vi } from 'vitest';
import loader from './loader';

describe('loader', () => {
  it('should change the language if it is different from the current language', async () => {
    const spyChangeLanguage = vi.spyOn(i18n, 'changeLanguage');
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response),
    );

    await loader({
      request: {} as Request,
      params: {
        lng: 'sv',
      },
    });

    expect(spyChangeLanguage).toHaveBeenCalledWith('sv');
  });

  it('should redirect to the fallback language if the requested language is invalid', async () => {
    const spyChangeLanguage = vi.spyOn(i18n, 'changeLanguage');

    await loader({
      request: {} as Request,
      params: {
        lng: 'de',
      },
    });

    expect(spyChangeLanguage).not.toHaveBeenCalled();
  });

  it('should fetch CSRF token if the request is successful', async () => {
    const mockCsrf: components['schemas']['YksiloCsrfDto']['csrf'] = {
      headerName: 'headerName',
      parameterName: 'parameterName',
      token: 'token',
    };
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            csrf: mockCsrf,
          }),
      } as Response),
    );

    const result = await loader({
      request: {} as Request,
      params: {
        lng: 'fi',
      },
    });

    expect(result).toEqual({ csrf: mockCsrf });
  });
});
