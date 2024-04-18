import { describe, it, expect, vi } from 'vitest';
import { redirect } from 'react-router-dom';
import i18n from '@/i18n/config';
import loader from './loader';

describe('loader', () => {
  it('should return null if the language is already set', async () => {
    const result = await loader({
      request: {} as Request,
      params: {
        lng: 'fi',
      },
    });

    expect(result).toBeNull();
  });

  it('should change the language if it is valid', async () => {
    const spy = vi.spyOn(i18n, 'changeLanguage');

    const result = await loader({
      request: {} as Request,
      params: { lng: 'sv' },
    });

    expect(spy).toHaveBeenCalledWith('sv');
    expect(result).not.toBeNull();
  });

  it('should redirect to the fallback language if the requested language is invalid', async () => {
    vi.mock('react-router-dom', () => ({
      redirect: vi.fn().mockImplementation(() => ({})),
    }));

    const result = await loader({
      request: {} as Request,
      params: { lng: 'de' },
    });

    expect(redirect).toHaveBeenCalledWith('/fi');
    expect(result).not.toBeNull();
  });
});
