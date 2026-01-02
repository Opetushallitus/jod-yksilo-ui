import { useTranslation } from 'react-i18next';

export const usePaginationTranslations = () => {
  const { t } = useTranslation();

  return {
    nextTriggerLabel: t('pagination.next'),
    prevTriggerLabel: t('pagination.previous'),
    itemLabel: (itemLabelDetails: { page: number; totalPages: number }) =>
      t('pagination.itemLabel', {
        page: itemLabelDetails.page,
        totalPages: itemLabelDetails.totalPages,
      }),
  };
};
