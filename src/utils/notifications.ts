import { LangCode } from '@/i18n/config';

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

export const loadNotifications = async () => {
  try {
    const loadedNotifications = await fetch(`${import.meta.env.BASE_URL}config/notifications.json`).then((res) =>
      res.json(),
    );
    notifications.push(...loadedNotifications);
  } catch (error) {
    // It's safe to ignore this error.
    // If notification loading fails, the app will continue to work with no notifications.
    /* eslint-disable-next-line no-console */
    console.warn('Failed to load notifications, using defaults', error);
  }
};

export const getNotifications = () => notifications;
