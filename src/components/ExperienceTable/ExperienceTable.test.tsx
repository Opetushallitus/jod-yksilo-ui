import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExperienceTable } from './ExperienceTable';
import type { ExperienceTableRowData } from './ExperienceTableRow';

vi.mock('./ExperienceTableRow', () => ({
  ExperienceTableRow: ({ row }: { row: ExperienceTableRowData }) => (
    <tr data-testid="sorted-row">
      <td>{row.key}</td>
    </tr>
  ),
}));

const createRow = (
  key: string,
  dates: Pick<ExperienceTableRowData, 'alkuPvm' | 'loppuPvm'> = {},
): ExperienceTableRowData => ({ key, nimi: { fi: key }, osaamiset: [], subrows: [], ...dates });

describe('ExperienceTable date sorting', () => {
  it.each(['parent', 'nested'])('sorts missing %s starts after pre-1970 starts when ends tie', (level) => {
    const loppuPvm = new Date('2024-01-01');
    const rows = [
      createRow('missing-first', { loppuPvm }),
      createRow('pre-epoch', { alkuPvm: new Date('1960-01-01'), loppuPvm }),
      createRow('missing-second', { loppuPvm }),
      createRow('latest-start', { alkuPvm: new Date('2020-01-01'), loppuPvm }),
    ];

    render(
      <ExperienceTable
        ariaLabel="History"
        mainColumnHeader="Name"
        rows={level === 'parent' ? rows : [{ ...createRow('parent'), subrows: rows }]}
      />,
    );

    const order = screen.getAllByTestId('sorted-row').map((row) => row.textContent);
    expect(level === 'parent' ? order : order.slice(1)).toEqual([
      'latest-start',
      'pre-epoch',
      'missing-first',
      'missing-second',
    ]);
  });

  it('keeps ongoing rows first and sorts half-open periods by end date', () => {
    render(
      <ExperienceTable
        ariaLabel="History"
        mainColumnHeader="Name"
        rows={[
          createRow('earlier-end', { loppuPvm: new Date('2023-01-01') }),
          createRow('latest-end', { loppuPvm: new Date('2024-01-01') }),
          createRow('ongoing'),
        ]}
      />,
    );

    expect(screen.getAllByTestId('sorted-row').map((row) => row.textContent)).toEqual([
      'ongoing',
      'latest-end',
      'earlier-end',
    ]);
  });
});
