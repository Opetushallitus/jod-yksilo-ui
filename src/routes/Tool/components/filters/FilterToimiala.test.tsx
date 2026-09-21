import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useToolStore } from '@/stores/useToolStore';

import { FilterToimiala } from './FilterToimiala';

vi.mock('@/utils/features', () => ({
  isFeatureEnabled: vi.fn(),
}));
const mockIsFeatureEnabled = vi.mocked((await import('@/utils/features')).isFeatureEnabled);

const useTol2025 = (enabled: boolean) =>
  mockIsFeatureEnabled.mockImplementation((feature) => feature === 'TOIMIALA_TOL2025' && enabled);

describe('FilterToimiala', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToolStore.setState({ filters: { ...useToolStore.getState().filters, toimialat: [], opportunityType: [] } });
  });

  it('renders the TOL 2008 sections, including the unknown-industry one', async () => {
    useTol2025(false);
    render(<FilterToimiala />);

    expect(await screen.findByLabelText('Informaatio ja viestintä')).toBeInTheDocument();
    expect(screen.getByLabelText('Terveys- ja sosiaalipalvelut')).toBeInTheDocument();
    expect(screen.getByLabelText('Toimiala tuntematon')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(22);
  });

  it('renders the TOL 2025 sections, which replace the shifted ones', async () => {
    useTol2025(true);
    render(<FilterToimiala />);

    expect(await screen.findByLabelText('Sosiaali- ja terveyspalvelut')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Televiestintä/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Informaatio ja viestintä')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Toimiala tuntematon')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(22);
  });

  it('is sorted by the localized name rather than by code', async () => {
    useTol2025(false);
    render(<FilterToimiala />);
    await screen.findByLabelText('Toimiala tuntematon');

    const names = screen.getAllByRole('checkbox').map((cb) => cb.getAttribute('aria-label') ?? '');
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'fi')));
  });

  it('stores the section code, not the label, and selects the job opportunity type', async () => {
    useTol2025(true);
    render(<FilterToimiala />);

    fireEvent.click(await screen.findByLabelText('Sosiaali- ja terveyspalvelut'));

    expect(useToolStore.getState().filters.toimialat).toEqual(['R']);
    expect(useToolStore.getState().filters.opportunityType).toContain('TYOMAHDOLLISUUS');
  });
});
