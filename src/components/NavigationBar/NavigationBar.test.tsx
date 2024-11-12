import { useMediaQueries } from '@jod/design-system';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationBar, NavigationBarLinkProps } from './NavigationBar';

vi.mock('@jod/design-system', () => ({
  useMediaQueries: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: 'callback-url',
  }),
}));

describe('NavigationBar', () => {
  vi.mocked(useMediaQueries).mockReturnValue({ sm: true, md: false, lg: false, xl: false });

  const logo = <div>logo</div>;

  const user = {
    name: 'Reetta Räppänä',
    component: ({ children, ...rootProps }: NavigationBarLinkProps) => (
      <a href="/profile" aria-label="Profile" {...rootProps}>
        {children}
      </a>
    ),
  };

  const onLanguageClick = vi.fn();

  it('renders only user', () => {
    const { container } = render(<NavigationBar logo={logo} user={user} onLanguageClick={onLanguageClick} />);

    // Assert snapshot
    expect(container.firstChild).toMatchSnapshot();

    // Assert user
    const userAvatar = screen.queryByTitle(user.name);
    expect(userAvatar).toBeInTheDocument();
  });

  it('renders no navigation items and no user', () => {
    const { container } = render(<NavigationBar logo={logo} onLanguageClick={onLanguageClick} />);

    // Assert snapshot
    expect(container.firstChild).toMatchSnapshot();

    // Assert user is not rendered
    const userAvatar = screen.queryByTitle(user.name);
    expect(userAvatar).toBeNull();
  });

  it('renders menu component', () => {
    const menuComponent = <div>Menu</div>;
    render(<NavigationBar logo={logo} menuComponent={menuComponent} onLanguageClick={onLanguageClick} />);
    const menuComponentElement = screen.getByText('Menu');
    expect(menuComponentElement).toBeInTheDocument();
  });
});
