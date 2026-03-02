import * as opintopolkuUtils from '@/utils/opintopolku';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OpintopolkuKoulutusList } from './OpintopolkuKoulutusList';

vi.mock('@/utils/opintopolku');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

const mockKoulutusData = {
  oid1: {
    oid: 'oid1',
    nimi: { fi: 'Test Koulutus', en: 'Test Education', sv: undefined },
    metadata: {
      kuvaus: { fi: '<p>Test description</p>', en: 'Test description', sv: undefined },
      opintojenLaajuusNumero: 30,
      opintojenLaajuusNumeroMin: undefined,
      opintojenLaajuusNumeroMax: undefined,
      opintojenLaajuusyksikko: { nimi: { fi: 'op', en: 'credits', sv: undefined } },
    },
  },
  oid2: {
    oid: 'oid2',
    nimi: { fi: 'Test Koulutus 2', en: 'Test Education 2', sv: undefined },
    metadata: {
      kuvaus: { fi: '<p>Test description 2</p>', en: 'Test description 2', sv: undefined },
      opintojenLaajuusNumero: undefined,
      opintojenLaajuusNumeroMin: 20,
      opintojenLaajuusNumeroMax: 40,
      opintojenLaajuusyksikko: { nimi: { fi: 'op', en: 'credits', sv: undefined } },
    },
  },
};

describe('OpintopolkuKoulutusList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when koulutukset is empty', () => {
    const { container } = render(<OpintopolkuKoulutusList koulutukset={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches and displays koulutukset', async () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus).mockImplementation((oid: string) => {
      return Promise.resolve(mockKoulutusData[oid as keyof typeof mockKoulutusData] || null);
    });

    const koulutukset = [{ oid: 'oid1' }, { oid: 'oid2' }];

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);

    await waitFor(() => {
      expect(screen.getByText('Test Koulutus')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Koulutus 2')).toBeInTheDocument();
    });

    expect(vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus)).toHaveBeenCalledTimes(2);
  });

  it('shows spinner while loading', () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus).mockImplementation(
      () =>
        new Promise(() => {
          /* empty */
        }), // Never resolves
    );

    const koulutukset = [{ oid: 'oid1' }];

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);

    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('displays show more button when more items are available', async () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus).mockImplementation(() => Promise.resolve(mockKoulutusData.oid1));

    const koulutukset = Array.from({ length: 10 }, (_, i) => ({ oid: `oid${i}` }));

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);
    await waitFor(() => {
      const items = screen.getAllByText('Test Koulutus');
      expect(items.length).toBe(5); // Only first 5 items should be displayed
      expect(screen.getByRole('button', { name: /show-more/i })).toBeInTheDocument();
    });
  });

  it('loads more items when show more button is clicked', async () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus).mockImplementation(() => Promise.resolve(mockKoulutusData.oid1));

    const koulutukset = Array.from({ length: 10 }, (_, i) => ({ oid: `oid${i}` }));

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /show-more/i })).toBeInTheDocument();
    });

    const showMoreButton = screen.getByRole('button', { name: /show-more/i });
    showMoreButton.click();

    await waitFor(() => {
      const items = screen.getAllByText('Test Koulutus');
      expect(items.length).toBeGreaterThan(5);
    });
  });

  it('handles failed koulutus fetch gracefully', async () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus)
      .mockImplementationOnce(() => Promise.resolve(mockKoulutusData.oid1))
      .mockImplementationOnce(() => Promise.resolve(null));

    const koulutukset = [{ oid: 'oid1' }, { oid: 'oid2' }];

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);

    await waitFor(() => {
      expect(screen.getByText('Test Koulutus')).toBeInTheDocument();
    });

    expect(screen.queryAllByText('Test Koulutus')).toHaveLength(1);
  });

  it('should stop fetching after finding five valid koulutukset', async () => {
    vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus).mockImplementation((oid: string) => {
      //there is no results for oid0, oid2, oid8 and oid9, but all others return valid data
      if (['oid1', 'oid3', 'oid4', 'oid5', 'oid6', 'oid7'].includes(oid)) {
        return Promise.resolve(mockKoulutusData.oid1);
      }
      return Promise.resolve(null);
    });
    const koulutukset = Array.from({ length: 10 }, (_, i) => ({ oid: `oid${i}` }));

    render(<OpintopolkuKoulutusList koulutukset={koulutukset} />);

    await waitFor(() => {
      const items = screen.getAllByText('Test Koulutus');
      expect(items.length).toBe(5); // Only first 5 found items should be displayed
    });

    // Should have been called 8 times: 5 successful fetches + 3 additional fetches + 1 extra for peek until all items are fetched or found
    expect(vi.mocked(opintopolkuUtils.getOpintopolkuKoulutus)).toHaveBeenCalledTimes(8);
  });
});
