import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/config', () => {
  const getResourceBundle = (lang: string, namespace: string): Record<string, string> | undefined =>
    namespace === 'common'
      ? lang === 'fi'
        ? {
            'notifications-4-title': 'Yhteinen',
            'notifications-4-description': 'Yhteinen kuvaus',
            'notifications-4-variant': 'warning',
          }
        : lang === 'sv'
          ? {
              'notifications-4-title': 'Gemensam',
              'notifications-4-description': 'Gemensam beskrivning',
              'notifications-4-variant': 'warning',
            }
          : {
              'notifications-4-title': 'Shared',
              'notifications-4-description': 'Shared description',
              'notifications-4-variant': 'warning',
            }
      : lang === 'fi'
        ? {
            'notifications-1-title': 'Ilmoitus',
            'notifications-1-description': 'Kuvaus',
            'notifications-1-variant': 'success',
            'notifications-2-title': 'Toinen',
            'notifications-2-description': 'Toinen kuvaus',
            'notifications-2-variant': 'success',
            'notifications-3-title': 'Kolmas',
            'notifications-3-description': 'Kolmas kuvaus',
            'notifications-3-variant': 'warning',
            'notifications-4-title': 'Neljäs',
            'notifications-4-description': 'Neljäs kuvaus',
            'notifications-4-variant': '  ',
            'notifications-5-title': '',
          }
        : lang === 'sv'
          ? {
              'notifications-1-title': 'Meddelande',
              'notifications-1-description': 'Beskrivning',
              'notifications-1-variant': 'success',
              'notifications-2-title': 'Andra',
              'notifications-2-description': 'Andra beskrivning',
              'notifications-2-variant': 'success',
              'notifications-3-description': 'Tredje beskrivning',
              'notifications-4-title': 'Fjärde',
              'notifications-4-description': 'Fjärde beskrivning',
            }
          : {
              'notifications-1-title': 'Notice',
              'notifications-1-description': 'Description',
              'notifications-1-variant': 'success',
              'notifications-2-title': 'Second',
              'notifications-2-description': 'Second description',
              'notifications-2-variant': 'succes',
              'notifications-3-title': 'Third',
              'notifications-3-description': 'Third description',
              'notifications-4-title': 'Fourth',
              'notifications-4-description': 'Fourth description',
            };

  return {
    default: {
      getResourceBundle,
      getResource: (lang: string, namespace: string, key: string) => getResourceBundle(lang, namespace)?.[key],
    },
    defaultLang: 'fi',
    supportedLanguageCodes: ['fi', 'sv', 'en'],
  };
});

describe('loadNotifications', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('keeps translated notifications when the JSON request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unavailable')));
    const { getNotifications, loadNotifications } = await import('./notifications');

    await expect(loadNotifications()).resolves.toBeUndefined();
    const loaded = getNotifications();
    expect(loaded.map(({ id }) => id)).toEqual(['translation-notification-1', 'common-translation-notification-4']);
    expect(loaded[0]?.title).toEqual({ fi: 'Ilmoitus', sv: 'Meddelande', en: 'Notice' });
    expect(loaded[0]?.description).toEqual({ fi: 'Kuvaus', sv: 'Beskrivning', en: 'Description' });
    expect(loaded.map(({ variant }) => variant)).toEqual(['success', 'warning']);
  });

  it('also loads notifications from the JSON file', async () => {
    const jsonNotification = { id: 'external', title: { fi: 'Ulkoinen' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => [jsonNotification] }));
    const { getNotifications, loadNotifications } = await import('./notifications');

    await loadNotifications();
    expect(getNotifications()).toHaveLength(3);
    expect(getNotifications()[2]).toEqual(jsonNotification);
  });
});
