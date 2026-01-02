import { Datepicker } from '@jod/design-system';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

export const useDatePickerTranslations = (): ComponentProps<typeof Datepicker>['translations'] => {
  const { t } = useTranslation();
  const translations = {
    actions: {
      select: t('datepicker.actions.select'),
      open: t('datepicker.actions.open'),
      close: t('datepicker.actions.close'),
    },
    month: {
      next: t('datepicker.month.next'),
      view: t('datepicker.month.view'),
      prev: t('datepicker.month.prev'),
    },
    day: {
      next: t('datepicker.day.next'),
      view: t('datepicker.day.view'),
      prev: t('datepicker.day.prev'),
    },
    year: {
      next: t('datepicker.year.next'),
      view: t('datepicker.year.view'),
      prev: t('datepicker.year.prev'),
    },
  };

  return {
    nextTrigger: (view) => translations[view].next,
    viewTrigger: (view) => translations[view].view,
    prevTrigger: (view) => translations[view].prev,
    dayCell: (state): string => `${translations.actions.select} ${state.formattedDate}`,
    trigger: (open): string => (open ? translations.actions.close : translations.actions.open),
    roleDescriptions: {
      datepicker: t('datepicker.aria-roledescription.datepicker'),
      calendarMonth: t('datepicker.aria-roledescription.month'),
      calendarYear: t('datepicker.aria-roledescription.year'),
      calendarDecade: t('datepicker.aria-roledescription.decade'),
    },
  };
};
