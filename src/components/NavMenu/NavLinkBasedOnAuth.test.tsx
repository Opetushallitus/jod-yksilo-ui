import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavLinkBasedOnAuth } from './NavLinkBasedOnAuth';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'fi' },
  }),
}));

vi.mock('react-router', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NavLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('NavLinkBasedOnAuth', () => {
  it('renders login link when shouldLogin is true', () => {
    render(
      <NavLinkBasedOnAuth shouldLogin to="/profile">
        Login
      </NavLinkBasedOnAuth>,
    );
    const link = screen.getByText('Login');
    expect(link).toHaveAttribute('to', '/fi/slugs.profile.login');
    expect(link).toHaveAttribute('aria-label', 'login');
    expect(link).toHaveAttribute('lang', 'fi');
    expect(link).toHaveTextContent('Login');
  });

  it('renders normal link when shouldLogin is false', () => {
    render(
      <NavLinkBasedOnAuth shouldLogin={false} to="profile">
        Profile
      </NavLinkBasedOnAuth>,
    );
    const link = screen.getByText('Profile');
    expect(link).toHaveAttribute('to', 'profile');
    expect(link).not.toHaveAttribute('aria-label');
    expect(link).toHaveAttribute('lang', 'fi');
    expect(link).toHaveTextContent('Profile');
  });

  it('calls onClose when clicked', () => {
    const onClose = vi.fn();
    render(
      <NavLinkBasedOnAuth shouldLogin to="/profile" onClose={onClose}>
        Login
      </NavLinkBasedOnAuth>,
    );
    const link = screen.getByText('Login');
    link.click();
    expect(onClose).toHaveBeenCalled();
  });
});
