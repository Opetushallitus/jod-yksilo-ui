import { useMediaQueries } from '@jod/design-system';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageButton } from '../LanguageButton/LanguageButton';
import { UserButton } from '../UserButton/UserButton';
import { NavigationBar, NavigationBarLinkProps } from './NavigationBar';

vi.mock('@jod/design-system', () => ({
  useMediaQueries: vi.fn(),
}));

vi.mock('react-router', () => ({
  useLocation: () => ({
    pathname: 'callback-url',
  }),
  useLoaderData: () => ({
    etunimi: 'Reetta',
    sukunimi: 'Räppänä',
    csrf: 'not null',
  }),
}));

describe('NavigationBar', () => {
  vi.mocked(useMediaQueries).mockReturnValue({ sm: true, md: false, lg: false, xl: false });

  const onLanguageClick = vi.fn();
  const logo = <div>logo</div>;

  const langButton = <LanguageButton onClick={onLanguageClick} />;
  const userButton = <UserButton onLogout={vi.fn()} />;

  const user = {
    name: 'Reetta Räppänä',
    component: ({ children, ...rootProps }: NavigationBarLinkProps) => (
      <a href="/profile" aria-label="Profile" {...rootProps}>
        {children}
      </a>
    ),
  };

  it('renders only user', () => {
    const { container } = render(
      <NavigationBar logo={logo} languageButtonComponent={langButton} userButtonComponent={userButton} />,
    );
    // Assert snapshot
    expect(container.firstChild).toMatchSnapshot();
    // Assert user
    const userAvatar = screen.queryByLabelText(user.name);
    expect(userAvatar).toBeInTheDocument();
  });

  it('renders no navigation items and no user', () => {
    const { container } = render(
      <NavigationBar logo={logo} languageButtonComponent={langButton} userButtonComponent={userButton} />,
    );

    // Assert snapshot
    expect(container.firstChild).toMatchSnapshot();

    // Assert user is not rendered
    const userAvatar = screen.queryByTitle(user.name);
    expect(userAvatar).toBeNull();
  });

  it('renders menu component', () => {
    const menuComponent = <div>Menu</div>;
    render(
      <NavigationBar
        logo={logo}
        menuComponent={menuComponent}
        languageButtonComponent={langButton}
        userButtonComponent={userButton}
      />,
    );

    const menuComponentElement = screen.getByText('Menu');
    expect(menuComponentElement).toBeInTheDocument();
  });
});
