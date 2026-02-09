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
  notifications.push(...(await (await fetch(`${import.meta.env.BASE_URL}config/notifications.json`)).json()));
};

export const getNotifications = () => notifications;
