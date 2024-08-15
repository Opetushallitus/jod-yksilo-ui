import i18n from '@/i18n/config';

export const profileRoutes = [
  {
    name: i18n.t('profile.preferences'),
    path: i18n.t('slugs.profile.preferences'),
  },
  {
    name: i18n.t('profile.favorites'),
    path: i18n.t('slugs.profile.favorites'),
  },
  {
    name: i18n.t('profile.competences'),
    path: i18n.t('slugs.profile.competences'),
  },
  {
    name: i18n.t('profile.work-history'),
    path: i18n.t('slugs.profile.work-history'),
  },
  {
    name: i18n.t('profile.education-history'),
    path: i18n.t('slugs.profile.education-history'),
  },
  {
    name: i18n.t('profile.free-time-activities'),
    path: i18n.t('slugs.profile.free-time-activities'),
  },
  {
    name: i18n.t('profile.something-else'),
    path: i18n.t('slugs.profile.something-else'),
  },
];
