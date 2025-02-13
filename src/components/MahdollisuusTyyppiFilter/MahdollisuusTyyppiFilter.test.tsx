import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MahdollisuusTyyppiFilter } from './MahdollisuusTyyppiFilter';

describe('OpportunityFilters', () => {
  const mockIsFilterChecked = vi.fn();
  const mockHandleFilterChange = vi.fn();

  const defaultProps = {
    jobFilterText: 'Job Opportunities',
    educationFilterText: 'Education Opportunities',
    isFilterChecked: mockIsFilterChecked,
    handleFilterChange: mockHandleFilterChange,
  };

  it('renders both checkboxes with correct labels', () => {
    mockIsFilterChecked.mockImplementation((filter) => filter === 'TYOMAHDOLLISUUS');
    render(<MahdollisuusTyyppiFilter {...defaultProps} />);

    expect(screen.getByLabelText('Job Opportunities')).toBeInTheDocument();
    expect(screen.getByLabelText('Education Opportunities')).toBeInTheDocument();

    expect(screen.getByLabelText('Job Opportunities')).toBeChecked();
    expect(screen.getByLabelText('Education Opportunities')).not.toBeChecked();
  });

  it('calls handleFilterChange when a checkbox is clicked', () => {
    render(<MahdollisuusTyyppiFilter {...defaultProps} />);
    const jobCheckbox = screen.getByLabelText('Job Opportunities');
    const educationCheckbox = screen.getByLabelText('Education Opportunities');

    fireEvent.click(jobCheckbox);
    fireEvent.click(educationCheckbox);

    expect(mockHandleFilterChange).toHaveBeenCalledTimes(2);
  });

  it('passes the correct value to handleFilterChange on checkbox change', () => {
    render(<MahdollisuusTyyppiFilter {...defaultProps} />);
    const jobCheckbox = screen.getByLabelText('Job Opportunities');
    fireEvent.change(jobCheckbox, { target: { value: 'TYOMAHDOLLISUUS' } });

    expect(mockHandleFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'TYOMAHDOLLISUUS' }),
      }),
    );
  });
});
