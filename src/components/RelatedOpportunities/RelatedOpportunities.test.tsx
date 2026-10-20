import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { RelatedOpportunities, type RelatedOpportunity } from './RelatedOpportunities';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

const createOpportunities = (prefix: string, count: number): RelatedOpportunity[] =>
  Array.from({ length: count }, (_, i) => ({ id: `${prefix}-${i}`, title: `${prefix} ${i}` }));

const renderComponent = (props: React.ComponentProps<typeof RelatedOpportunities>) =>
  render(
    <MemoryRouter>
      <RelatedOpportunities {...props} />
    </MemoryRouter>,
  );

const defaultOpportunities = {
  TYOMAHDOLLISUUS: createOpportunities('tyo', 2),
  KOULUTUSMAHDOLLISUUS: createOpportunities('koulutus', 3),
};

describe('RelatedOpportunities', () => {
  it('shows the description and the opportunities of the own type initially', () => {
    renderComponent({ mahdollisuusTyyppi: 'TYOMAHDOLLISUUS', opportunities: defaultOpportunities });

    expect(screen.getByText('related-opportunities.description.job-to-job')).toBeInTheDocument();
    expect(screen.getByTestId('related-opportunities-tab-TYOMAHDOLLISUUS')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('related-opportunity-tyo-0')).toHaveAttribute(
      'href',
      '/fi/slugs.job-opportunity.index/tyo-0',
    );
    expect(screen.getByTestId('related-opportunity-tyo-0')).toHaveTextContent('tyo 0');
    expect(screen.queryByTestId('related-opportunity-koulutus-0')).not.toBeInTheDocument();
  });

  it('selects the own type initially for a koulutusmahdollisuus', () => {
    renderComponent({ mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS', opportunities: defaultOpportunities });

    expect(screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('related-opportunity-koulutus-0')).toHaveAttribute(
      'href',
      '/fi/slugs.education-opportunity.index/koulutus-0',
    );
  });

  it('switches between the types with the tabs', () => {
    renderComponent({ mahdollisuusTyyppi: 'TYOMAHDOLLISUUS', opportunities: defaultOpportunities });

    fireEvent.click(screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS'));

    expect(screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('related-opportunities-tab-TYOMAHDOLLISUUS')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('related-opportunity-koulutus-0')).toHaveAttribute(
      'href',
      '/fi/slugs.education-opportunity.index/koulutus-0',
    );
    expect(screen.queryByTestId('related-opportunity-tyo-0')).not.toBeInTheDocument();
  });

  it('switches the tabs with the arrow keys', () => {
    renderComponent({ mahdollisuusTyyppi: 'TYOMAHDOLLISUUS', opportunities: defaultOpportunities });
    const tyoTab = screen.getByTestId('related-opportunities-tab-TYOMAHDOLLISUUS');

    fireEvent.keyDown(tyoTab, { key: 'ArrowRight' });

    const koulutusTab = screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS');
    expect(koulutusTab).toHaveAttribute('aria-selected', 'true');
    expect(koulutusTab).toHaveFocus();

    fireEvent.keyDown(koulutusTab, { key: 'Home' });
    expect(screen.getByTestId('related-opportunities-tab-TYOMAHDOLLISUUS')).toHaveAttribute('aria-selected', 'true');
  });

  it('describes the similarity according to the type of the opportunity and the selected tab', () => {
    renderComponent({ mahdollisuusTyyppi: 'TYOMAHDOLLISUUS', opportunities: defaultOpportunities });
    fireEvent.click(screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS'));
    expect(screen.getByText('related-opportunities.description.job-to-education')).toBeInTheDocument();
  });

  it('describes the similarity of a koulutusmahdollisuus to both types', () => {
    renderComponent({ mahdollisuusTyyppi: 'KOULUTUSMAHDOLLISUUS', opportunities: defaultOpportunities });
    expect(screen.getByText('related-opportunities.description.education-to-education')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('related-opportunities-tab-TYOMAHDOLLISUUS'));
    expect(screen.getByText('related-opportunities.description.education-to-job')).toBeInTheDocument();
  });

  it('shows at most five opportunities', () => {
    renderComponent({
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
      opportunities: { TYOMAHDOLLISUUS: createOpportunities('tyo', 7), KOULUTUSMAHDOLLISUUS: [] },
    });

    expect(screen.getAllByRole('link')).toHaveLength(5);
  });

  it('shows an empty state only for the type that has no opportunities', () => {
    renderComponent({
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
      opportunities: { TYOMAHDOLLISUUS: [], KOULUTUSMAHDOLLISUUS: createOpportunities('koulutus', 1) },
    });

    expect(screen.getByText('related-opportunities.description.job-to-job')).toBeInTheDocument();
    expect(screen.getByTestId('related-opportunities-empty')).toHaveTextContent('related-opportunities.empty');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('related-opportunities-tab-KOULUTUSMAHDOLLISUUS'));

    expect(screen.queryByTestId('related-opportunities-empty')).not.toBeInTheDocument();
    expect(screen.getByTestId('related-opportunity-koulutus-0')).toBeInTheDocument();
  });

  it('uses its own descriptions and test ids for the kohtaanto variant', () => {
    renderComponent({
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
      opportunities: defaultOpportunities,
      variant: 'kohtaanto',
    });

    expect(screen.getByText('related-opportunities.kohtaanto-description.job-to-job')).toBeInTheDocument();
    expect(screen.getByTestId('related-opportunities-kohtaanto')).toBeInTheDocument();
    expect(screen.getByTestId('related-opportunities-kohtaanto-tab-TYOMAHDOLLISUUS')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTestId('related-opportunity-kohtaanto-tyo-0')).toHaveTextContent('tyo 0');
    expect(screen.queryByTestId('related-opportunity-tyo-0')).not.toBeInTheDocument();
  });

  it('shows the opportunities with a low similarity struck through', () => {
    renderComponent({
      mahdollisuusTyyppi: 'TYOMAHDOLLISUUS',
      opportunities: {
        TYOMAHDOLLISUUS: [
          { id: 'tyo-1', title: 'Similar' },
          { id: 'tyo-2', title: 'Not similar', lowSimilarity: true },
        ],
        KOULUTUSMAHDOLLISUUS: [],
      },
    });

    expect(screen.getByTestId('related-opportunity-tyo-1')).not.toHaveClass('line-through');
    expect(screen.getByTestId('related-opportunity-tyo-2')).toHaveClass('line-through');
    expect(screen.getByTestId('related-opportunity-tyo-2')).not.toHaveClass('underline');
  });
});
