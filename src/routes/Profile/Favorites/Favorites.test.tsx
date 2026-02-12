import { ModalProvider } from '@/hooks/useModal/ModalProvider';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import Favorites from './Favorites';

const mockRoutes = [{ path: '/favorites', label: 'Favorites', authRequired: true }];

vi.mock('react-router', async () => {
  const actualDom = await vi.importActual('react-router');
  return {
    ...actualDom,
    useMatches: vi.fn().mockReturnValue([]),
    useOutletContext: vi.fn(() => mockRoutes),
  };
});

vi.mock('@/stores/useSuosikitStore', () => ({
  useSuosikitStore: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  })),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/utils', () => ({
  getLocalizedText: (text: string) => text,
}));

describe('Favorites', () => {
  const mockStore = {
    deleteSuosikki: vi.fn(),
    filters: ['KAIKKI'],
    fetchPage: vi.fn(),
    pageData: [
      { id: '1', mahdollisuusTyyppi: 'TYOMAHDOLLISUUS', otsikko: 'Job 1', tiivistelma: 'Summary 1' },
      { id: '2', mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS', otsikko: 'Education 1', tiivistelma: 'Summary 2' },
    ],
    pageNr: 1,
    pageSize: 10,
    setFilters: vi.fn(),
    suosikit: [{ tyyppi: 'TYOMAHDOLLISUUS' }, { tyyppi: 'KOULUTUSMAHDOLLISUUS' }],
    totalItems: 2,
    totalPages: 1,
  };

  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Outlet />,
        children: [
          {
            path: 'favorites',
            element: (
              <ModalProvider>
                <Favorites />
              </ModalProvider>
            ),
          },
        ],
      },
    ],
    { initialEntries: ['/favorites'] },
  );

  beforeEach(() => {
    vi.clearAllMocks();
    (useSuosikitStore as unknown as Mock).mockReturnValue(mockStore);
  });

  it('renders correctly', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByText('profile.favorites.title')).toBeInTheDocument();
    expect(screen.getByText('profile.favorites.description')).toBeInTheDocument();
    expect(screen.getByText('profile.favorites.job-and-education-opportunities')).toBeInTheDocument();
  });

  it('renders opportunity cards correctly', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Job 1')).toBeInTheDocument();
    expect(screen.getByText('Education 1')).toBeInTheDocument();
  });

  it('hides pagination when there are no results', () => {
    mockStore.pageData = [];
    mockStore.totalPages = 1;
    render(<RouterProvider router={router} />);
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });
});
