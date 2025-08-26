/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { useMatches } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from './Breadcrumb';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));
vi.mock('react-router', () => ({
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  NavLink: (props: any) => <a {...props} />,
  useMatches: vi.fn(),
}));
vi.mock('@/utils', () => ({
  getLocalizedText: (text: string) => text,
}));
vi.mock('@jod/design-system', () => ({
  Breadcrumb: (props: any) => (
    <div data-testid="ds-breadcrumb">
      {props.items.map((item: any, idx: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={idx}>{item.label}</span>
      ))}
    </div>
  ),
}));

const setHistoryState = (from?: string) => {
  window.history.replaceState({ usr: { from } }, '');
};

describe('Breadcrumb', () => {
  beforeEach(() => {
    setHistoryState();
    vi.clearAllMocks();
  });

  it('renders default breadcrumb when no opportunity', () => {
    (useMatches as any).mockReturnValue([
      { id: 'root', pathname: '/fi', handle: { title: 'front-page' } },
      { id: 'profile', pathname: '/fi/profile', handle: { title: 'profile.index' } },
    ]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent('front-pageprofile.index');
  });
  it('renders job opportunity breadcrumbs with "from" tool', () => {
    setHistoryState('tool');
    (useMatches as any).mockReturnValue([
      { id: 'root', pathname: '/fi', handle: { title: 'front-page' } },
      {
        id: 'job',
        pathname: '/fi/job',
        handle: { type: 'jobOpportunity' },
        loaderData: { tyomahdollisuus: { otsikko: 'JobTitle' } },
      },
    ]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent('front-page' + 'tool.title' + 'JobTitle');
  });

  it('renders job opportunity breadcrumbs with "from" favorite', () => {
    setHistoryState('favorite');
    (useMatches as any).mockReturnValue([
      { id: 'root', pathname: '/fi', handle: { title: 'front-page' } },
      {
        id: 'job',
        pathname: '/fi/job',
        handle: { type: 'jobOpportunity' },
        loaderData: { tyomahdollisuus: { otsikko: 'JobTitle' } },
      },
    ]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent(
      'front-page' + 'profile.index' + 'profile.favorites.title' + 'JobTitle',
    );
  });

  it('renders education opportunity breadcrumbs with "from" goal', () => {
    setHistoryState('goal');
    (useMatches as any).mockReturnValue([
      { id: 'root', pathname: '/fi', handle: { title: 'front-page' } },
      {
        id: 'edu',
        pathname: '/fi/edu',
        handle: { type: 'educationOpportunity' },
        loaderData: { koulutusmahdollisuus: { otsikko: 'EduTitle' } },
      },
    ]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent(
      'front-page' + 'profile.index' + 'profile.my-goals.title' + 'EduTitle',
    );
  });

  it('renders only root when matches only root', () => {
    (useMatches as any).mockReturnValue([{ id: 'root', pathname: '/fi', handle: { title: 'front-page' } }]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent('front-page');
  });

  it('handles missing handle', () => {
    (useMatches as any).mockReturnValue([
      { id: 'root', pathname: '/fi' },
      { id: 'other', pathname: '/fi/other' },
    ]);
    render(<Breadcrumb />);
    expect(screen.getByTestId('ds-breadcrumb')).toHaveTextContent('front-page');
  });
});
