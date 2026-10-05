import i18n, { defaultLang, LangCode, supportedLanguageCodes } from '@/i18n/config';

interface Notification {
  id: string;
  title: Record<LangCode, string>;
  description: Record<LangCode, string>;
  variant: 'success' | 'warning' | 'error' | 'feedback';
  link?: {
    label: Record<LangCode, string>;
    url: Record<LangCode, string>;
  };
}

const notifications: Notification[] = [] as Notification[];
const validVariants: readonly string[] = [
  'success',
  'warning',
  'error',
  'feedback',
] satisfies Notification['variant'][];

export const loadNotifications = async () => {
  try {
    for (const namespace of ['yksilo', 'common']) {
      // Get all notification indices for the current namespace.
      const indices = Object.entries(i18n.getResourceBundle(defaultLang, namespace) ?? {})
        .flatMap(([key, value]) => {
          const match = /^notifications-(\d+)-title$/.exec(key);
          return match && typeof value === 'string' && value.trim() ? [Number(match[1])] : [];
        })
        .sort((first, second) => first - second);

      // Iterate over each notification index and construct the notification object.
      for (const index of indices) {
        const titles = supportedLanguageCodes.map((lang) => [
          lang,
          i18n.getResource(lang, namespace, `notifications-${index}-title`),
        ]);
        const descriptions = supportedLanguageCodes.map((lang) => [
          lang,
          i18n.getResource(lang, namespace, `notifications-${index}-description`),
        ]);
        const variants = Object.fromEntries(
          supportedLanguageCodes.map((lang) => [
            lang,
            i18n.getResource(lang, namespace, `notifications-${index}-variant`),
          ]),
        ) as Record<LangCode, unknown>;

        // Skip notifications with missing titles or descriptions in any supported language.
        if ([...titles, ...descriptions].some(([, value]) => typeof value !== 'string' || !value.trim())) {
          continue;
        }

        // Skip notifications with invalid variants in any supported language.
        if (Object.values(variants).some((value) => typeof value !== 'string' || !validVariants.includes(value))) {
          continue;
        }

        // Add the constructed notification object to the notifications array.
        notifications.push({
          id: `${namespace === 'common' ? 'common-' : ''}translation-notification-${index}`,
          title: Object.fromEntries(titles) as Record<LangCode, string>,
          description: Object.fromEntries(descriptions) as Record<LangCode, string>,
          variant: variants[defaultLang] as Notification['variant'],
        });
      }
    }

    notifications.push(
      ...(await fetch(`${import.meta.env.BASE_URL}config/notifications.json`).then((res) => res.json())),
    );
  } catch {
    // It's safe to ignore this error.
    // If notification loading fails, the app will continue to work with no notifications.
    return;
  }
};

export const getNotifications = () => notifications;
