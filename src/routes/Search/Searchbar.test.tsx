import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from './Searchbar';

const navigateMock = vi.fn();
const searchMock = vi.fn();
const setQueryMock = vi.fn();

let mockedQuery = '';

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'slugs.search') {
        return 'haku';
      }
      return key;
    },
    i18n: { language: 'fi' },
  }),
}));

vi.mock('@/stores/useSearchStore', () => ({
  useSearchStore: (
    selector: (state: { search: typeof searchMock; setQuery: typeof setQueryMock; query: string }) => unknown,
  ) =>
    selector({
      search: searchMock,
      setQuery: setQueryMock,
      query: mockedQuery,
    }),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    mockedQuery = '';
    vi.clearAllMocks();
  });

  it('does not require min length in the input', () => {
    render(<SearchBar scrollRef={{ current: null }} />);

    const input = screen.getByRole('textbox', { name: '' });
    expect(input).not.toHaveAttribute('required');
    expect(input).not.toHaveAttribute('minlength');
  });

  it('shows error and blocks submit for under-3 query', () => {
    mockedQuery = 'ab';
    const { container } = render(<SearchBar scrollRef={{ current: null }} />);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(navigateMock).not.toHaveBeenCalled();
    expect(searchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('search.min-length');
  });

  it('shows error and blocks submit for empty query', () => {
    mockedQuery = '   ';
    const { container } = render(<SearchBar scrollRef={{ current: null }} />);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(navigateMock).not.toHaveBeenCalled();
    expect(searchMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('search.min-length');
  });

  it('keeps 3+ query on submit', () => {
    mockedQuery = '  abc  ';
    const { container } = render(<SearchBar scrollRef={{ current: null }} />);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(navigateMock).toHaveBeenCalledWith('/fi/haku?q=abc');
    expect(searchMock).toHaveBeenCalledWith('abc');
  });
});
