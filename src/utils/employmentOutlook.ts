import type { TFunction } from 'i18next';

import { NOT_AVAILABLE_LABEL } from '@/constants';

export const getEmploymentOutlookLabel = (kohtaanto: string | undefined, t: TFunction): string => {
  switch (kohtaanto) {
    case 'Työvoimapula':
      return t('job-opportunity.supply-and-demand.Työvoimapula');
    case 'Kohtaanto-ongelma':
      return t('job-opportunity.supply-and-demand.Kohtaanto-ongelma');
    case 'Tasapaino':
      return t('job-opportunity.supply-and-demand.Tasapaino');
    case 'Ylitarjonta':
      return t('job-opportunity.supply-and-demand.Ylitarjonta');
    default:
      return NOT_AVAILABLE_LABEL;
  }
};
