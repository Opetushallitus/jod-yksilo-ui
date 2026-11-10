import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Samankaltaiset, SamankaltainenMahdollisuus } from '@/api/samankaltaiset';

import { RelatedOpportunities } from './RelatedOpportunities';

// jsdom does not implement ResizeObserver, which the carousel uses to measure its width
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn<() => void>();
    unobserve = vi.fn<() => void>();
    disconnect = vi.fn<() => void>();
  },
);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { page?: number }) => (options?.page ? `${key} ${options.page}` : key),
    i18n: { language: 'fi' },
  }),
}));
vi.mock('@/components', () => ({
  OpportunityCard: (props: { to: string; name: string; rateId: string; matchValue?: number }) => (
    <div data-testid={`related-opportunity-${props.rateId}`} data-to={props.to} data-match={props.matchValue}>
      {props.name}
    </div>
  ),
}));
vi.mock('@/components/OpportunityCard', () => ({
  OpportunityCardSkeleton: () => <li data-testid="opportunity-card-skeleton" />,
}));
vi.mock('@/routes/Profile/utils', () => ({
  getTypeSlug: (type: string) =>
    type === 'TYOMAHDOLLISUUS' ? 'slugs.job-opportunity.index' : 'slugs.education-opportunity.index',
}));
vi.mock('@/routes/Tool/utils', () => ({
  getMahdollisuusAlityyppi: () => 'MUU_TYOMAHDOLLISUUS',
}));
vi.mock('@/stores/useToolStore', () => ({
  useToolStore: (selector: (state: unknown) => unknown) => selector({ suosikit: [], toggleSuosikki: vi.fn() }),
}));
vi.mock('@/stores/useSessionManagerStore', () => ({
  useIsLoggedIn: () => false,
}));
vi.mock('@/hooks/useSessionGuardedAction', () => ({
  useSessionGuardedAction: () => () => vi.fn(),
}));

const createOpportunity = (
  id: string,
  mahdollisuusTyyppi: SamankaltainenMahdollisuus['mahdollisuusTyyppi'],
  overrides: Partial<SamankaltainenMahdollisuus> = {},
) =>
  ({
    id,
    otsikko: { fi: `Otsikko ${id}` },
    mahdollisuusTyyppi,
    pisteet: 0.9,
    ...overrides,
  }) as SamankaltainenMahdollisuus;

// The component suspends until the promise is resolved, so the render has to be awaited
const renderComponent = async (
  opportunities: SamankaltainenMahdollisuus[],
  tyyppi: SamankaltainenMahdollisuus['mahdollisuusTyyppi'] = 'TYOMAHDOLLISUUS',
) => {
  const samankaltaiset: Samankaltaiset = { opportunities, ammattiryhmaNimet: {} };
  await act(async () => {
    render(<RelatedOpportunities samankaltaiset={Promise.resolve(samankaltaiset)} tyyppi={tyyppi} />);
  });
};

// The panels of the other tabs are kept mounted but hidden, and getByRole only finds the visible one
const visiblePanel = () => within(screen.getByRole('tabpanel'));

const visibleCardIds = () =>
  visiblePanel()
    .getAllByTestId(/^related-opportunity-/)
    .map((card) => card.dataset.testid);

describe('RelatedOpportunities', () => {
  it('shows the description and a loading indicator while the opportunities are loading', () => {
    render(<RelatedOpportunities samankaltaiset={new Promise(() => {})} tyyppi="TYOMAHDOLLISUUS" />);

    expect(screen.getByText('related-opportunities.description')).toBeInTheDocument();
    expect(screen.getByTestId('related-opportunities-loading')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('tool.updating');
    expect(screen.getAllByTestId('opportunity-card-skeleton').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('related-opportunities-empty')).not.toBeInTheDocument();
  });

  it('replaces the loading indicator with the cards when the opportunities have loaded', async () => {
    await renderComponent([createOpportunity('tyo-1', 'TYOMAHDOLLISUUS')]);

    expect(await screen.findByTestId('related-opportunity-tyo-1')).toBeInTheDocument();
    expect(screen.queryByTestId('related-opportunities-loading')).not.toBeInTheDocument();
  });

  it('shows the description and the tabs of both types with their counts', async () => {
    await renderComponent([
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'),
      createOpportunity('tyo-2', 'TYOMAHDOLLISUUS'),
    ]);

    expect(await screen.findByTestId('related-opportunity-tyo-1')).toBeInTheDocument();
    expect(screen.getByText('related-opportunities.description')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'job-opportunities' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'education-opportunities' })).toBeInTheDocument();
  });

  it('shows the tab of the opened opportunity type first', async () => {
    await renderComponent(
      [createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'), createOpportunity('tyo-1', 'TYOMAHDOLLISUUS')],
      'KOULUTUSMAHDOLLISUUS',
    );

    await screen.findByTestId('related-opportunity-koulutus-1');
    expect(screen.getAllByRole('tab').map((tab) => tab.dataset.testid)).toEqual([
      'related-opportunities-tab-education',
      'related-opportunities-tab-job',
    ]);
  });

  it('shows only the cards of the selected tab, starting with the type of the first opportunity', async () => {
    await renderComponent([
      createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'),
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('koulutus-2', 'KOULUTUSMAHDOLLISUUS'),
    ]);

    await screen.findByTestId('related-opportunity-koulutus-1');
    expect(screen.getByTestId('related-opportunities-tab-education')).toHaveAttribute('aria-selected', 'true');
    expect(visibleCardIds()).toEqual(['related-opportunity-koulutus-1', 'related-opportunity-koulutus-2']);

    fireEvent.click(screen.getByTestId('related-opportunities-tab-job'));

    expect(screen.getByTestId('related-opportunities-tab-job')).toHaveAttribute('aria-selected', 'true');
    expect(visibleCardIds()).toEqual(['related-opportunity-tyo-1']);
  });

  it('keeps the page of the carousel when the user returns to its tab', async () => {
    await renderComponent([
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('tyo-2', 'TYOMAHDOLLISUUS'),
      createOpportunity('tyo-3', 'TYOMAHDOLLISUUS'),
      createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'),
    ]);
    await screen.findByTestId('related-opportunity-tyo-1');
    // Without a measured width the carousel shows one card per page
    const pageIndicator = (page: number) => visiblePanel().getByText(`pagination.itemLabel ${page}`).closest('button');

    fireEvent.click(visiblePanel().getByLabelText('pagination.next'));
    expect(pageIndicator(2)).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByTestId('related-opportunities-tab-education'));
    expect(visibleCardIds()).toEqual(['related-opportunity-koulutus-1']);

    fireEvent.click(screen.getByTestId('related-opportunities-tab-job'));
    expect(pageIndicator(2)).toHaveAttribute('aria-pressed', 'true');
    expect(pageIndicator(1)).toHaveAttribute('aria-pressed', 'false');
  });

  it('moves between the tabs with the arrow keys', async () => {
    await renderComponent([
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'),
    ]);

    await screen.findByTestId('related-opportunity-tyo-1');
    fireEvent.keyDown(screen.getByTestId('related-opportunities-tab-job'), { key: 'ArrowRight' });

    const educationTab = screen.getByTestId('related-opportunities-tab-education');
    expect(educationTab).toHaveAttribute('aria-selected', 'true');
    expect(educationTab).toHaveFocus();
    expect(screen.getByTestId('related-opportunity-koulutus-1')).toBeInTheDocument();
  });

  it('shows only the tabs of the types with opportunities', async () => {
    await renderComponent([createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS')]);

    await screen.findByTestId('related-opportunity-koulutus-1');
    expect(screen.getAllByRole('tab').map((tab) => tab.dataset.testid)).toEqual([
      'related-opportunities-tab-education',
    ]);
    expect(screen.getByTestId('related-opportunities-tab-education')).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByTestId('related-opportunities-empty')).not.toBeInTheDocument();
  });

  it('shows the cards in a carousel with its controls', async () => {
    await renderComponent([
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('tyo-2', 'TYOMAHDOLLISUUS'),
    ]);

    await screen.findByTestId('related-opportunity-tyo-1');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByLabelText('pagination.previous')).toBeDisabled();
    expect(screen.getByLabelText('pagination.next')).toBeInTheDocument();
    expect(screen.getByText('pagination.itemLabel 1')).toBeInTheDocument();
  });

  it('links the cards to the opportunity according to its type', async () => {
    await renderComponent([
      createOpportunity('tyo-1', 'TYOMAHDOLLISUUS'),
      createOpportunity('koulutus-1', 'KOULUTUSMAHDOLLISUUS'),
    ]);

    expect(await screen.findByTestId('related-opportunity-tyo-1')).toHaveAttribute(
      'data-to',
      '/fi/slugs.job-opportunity.index/tyo-1',
    );
    fireEvent.click(screen.getByTestId('related-opportunities-tab-education'));
    expect(screen.getByTestId('related-opportunity-koulutus-1')).toHaveAttribute(
      'data-to',
      '/fi/slugs.education-opportunity.index/koulutus-1',
    );
  });

  it('does not show the match of the opportunity on the card', async () => {
    await renderComponent([createOpportunity('tyo-1', 'TYOMAHDOLLISUUS', { pisteet: 0.7 })]);

    expect(await screen.findByTestId('related-opportunity-tyo-1')).not.toHaveAttribute('data-match');
  });

  it('shows an empty state when there are no opportunities', async () => {
    await renderComponent([]);

    expect(await screen.findByTestId('related-opportunities-empty')).toHaveTextContent('related-opportunities.empty');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('does not use a white background', () => {
    render(<RelatedOpportunities samankaltaiset={new Promise(() => {})} tyyppi="TYOMAHDOLLISUUS" />);

    expect(screen.getByTestId('related-opportunities').className).not.toContain('bg-white');
  });
});
