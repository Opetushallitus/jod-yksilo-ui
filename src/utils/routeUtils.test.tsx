import { describe, expect, it, vi } from 'vitest';
import { generateMenuItems, type MenuRoute } from './routeUtils';

vi.mock('@/components/NavMenu/NavLinkBasedOnAuth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NavLinkBasedOnAuth: ({ children }: any) => children,
}));

describe('generateMenuItems', () => {
  const baseRoutes: MenuRoute[] = [
    { name: 'Home', path: 'home' },
    { name: 'Profile', path: 'profile', authRequired: true },
    { name: 'Settings', path: 'settings' },
    { name: 'Settings Sub', path: 'settings/sub' },
  ];

  it('generates basic menu items', () => {
    const items = generateMenuItems({
      menuRoutes: baseRoutes,
      pathname: '/fi/home',
      language: 'fi',
      loggedIn: true,
    });
    expect(items.length).toBe(4);
    expect(items[0].label).toBe('Home');
    expect(items[1].label).toBe('Profile');
    expect(items[2].label).toBe('Settings');
    expect(items[3].label).toBe('Settings Sub');
  });

  it('generates childItems for parent routes', () => {
    const items = generateMenuItems({
      menuRoutes: baseRoutes,
      pathname: '/fi/yksilo',
      language: 'fi',
      pathPrefix: 'prefix',
      loggedIn: true,
    });
    const settingsItem = items.find((item) => item.label === 'Settings');
    expect(settingsItem).toBeDefined();
    expect(settingsItem?.childItems).toBeDefined();
    expect(settingsItem?.childItems?.length).toBeGreaterThan(0);
    expect(settingsItem?.childItems?.[0].label).toBe('Settings Sub');
  });

  it('marks selected item correctly', () => {
    const items = generateMenuItems({
      menuRoutes: baseRoutes,
      pathname: '/fi/profile',
      language: 'fi',
      loggedIn: true,
    });
    expect(items[1].selected).toBe(true);
    expect(items[0].selected).toBe(false);
  });

  it('requires login for authRequired routes', () => {
    const items = generateMenuItems({
      menuRoutes: baseRoutes,
      pathname: '/fi/profile',
      language: 'fi',
      loggedIn: false,
    });
    expect(items[1].label).toBe('Profile');
  });

  it('handles pathPrefix', () => {
    const items = generateMenuItems({
      menuRoutes: baseRoutes,
      pathname: '/fi/home',
      language: 'fi',
      pathPrefix: 'prefix',
      loggedIn: true,
    });
    expect(items[0].label).toBe('Home');
  });
});
