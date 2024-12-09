import { renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useMatches, useParams } from 'react-router';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalizedRoutes } from './useLocalizedRoutes';

// Mock the necessary hooks
vi.mock('react-router', () => ({
  useMatches: vi.fn(),
  useParams: vi.fn(),
  generatePath: vi.fn((path: string, params: Record<string, string>) => {
    Object.keys(params).forEach((key) => {
      path = path.replace(`:${key}`, params[key]);
    });
    return path;
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('useLocalizedRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate localized path with language in root', () => {
    (useMatches as Mock).mockReturnValue([{ id: 'root' }, { id: '1-1' }]);
    (useParams as Mock).mockReturnValue({});
    (useTranslation as Mock).mockReturnValue({
      t: (key: string, { lng }: { lng: string }) => `${key}-${lng}`,
    });

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en');
  });

  it('should replace path parameters with translations', () => {
    (useMatches as Mock).mockReturnValue([{ id: 'root' }, { id: '{slugs.profile.index}|${lng}' }]);
    (useParams as Mock).mockReturnValue({});
    (useTranslation as Mock).mockReturnValue({
      t: (key: string, { lng }: { lng: string }) => `${key}-${lng}`,
    });

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en/slugs.profile.index-en');
  });

  it('should handle multiple path segments', () => {
    (useMatches as Mock).mockReturnValue([
      { id: 'root' },
      { id: '{slugs.job-opportunity.index}/:id|${lng}' },
      { id: '{slugs.job-opportunity.overview}|${lng}' },
    ]);
    (useParams as Mock).mockReturnValue({ id: '123' });
    (useTranslation as Mock).mockReturnValue({
      t: (key: string, { lng }: { lng: string }) => `${key}-${lng}`,
    });

    const { result } = renderHook(() => useLocalizedRoutes());
    const { generateLocalizedPath } = result.current;

    const path = generateLocalizedPath('en');
    expect(path).toBe('/en/slugs.job-opportunity.index-en/123/slugs.job-opportunity.overview-en');
  });
});
