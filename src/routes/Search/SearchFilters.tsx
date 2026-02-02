import { AiInfo } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSearchStore } from '@/stores/useSearchStore';
import { Button, Checkbox, Modal, useMediaQueries } from '@jod/design-system';
import { JodSettings } from '@jod/design-system/icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FiltersModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  return (
    <Modal
      open={isOpen && !sm}
      onClose={onClose}
      topSlot={<span className="sm:text-heading-2 text-heading-2-mobile">{t('search.filters')}</span>}
      content={
        <div className="mt-5">
          <FiltersContent />
        </div>
      }
      footer={
        <div className="flex gap-4 ml-auto">
          <Button size="sm" className="h-5" onClick={onClose} label={t('close')} variant="white" />
          <Button size="sm" className="h-5" onClick={onClose} label={t('save-and-close')} variant="accent" />
        </div>
      }
      name={t('search.filters')}
    />
  );
};

const FiltersContent = () => {
  const { t } = useTranslation();
  const { filters, toggleFilter, setPageNr } = useSearchStore(
    useShallow((state) => ({
      filters: state.filters,
      toggleFilter: state.toggleFilter,
      setPageNr: state.setPageNr,
    })),
  );

  const aiContentMap: Record<keyof typeof filters, boolean> = {
    ammatti: false,
    muuTyomahdollisuus: true,
    tutkinto: true,
    muuKoulutusmahdollisuus: true,
  };

  const translations: Record<keyof typeof filters, string> = {
    ammatti: t('opportunity-type.work.AMMATTITIETO'),
    muuTyomahdollisuus: t('opportunity-type.work.TMT'),
    tutkinto: t('opportunity-type.education.TUTKINTO'),
    muuKoulutusmahdollisuus: t('opportunity-type.education.EI_TUTKINTO'),
  };
  const getCheckboxLabel = (key: keyof typeof filters) => {
    if (aiContentMap[key]) {
      return (
        <span className="flex items-center gap-1">
          {translations[key]} <AiInfo size={16} />
        </span>
      );
    }
    return <>{translations[key]}</>;
  };
  return (
    <ul title={t('search.filters')}>
      {Object.keys(filters).map((filterKey) => (
        <li key={filterKey} className="mb-6 last:mb-0">
          <Checkbox
            name={filterKey}
            value={filterKey}
            className="font-poppins! gap-4 items-center"
            checked={filters[filterKey as keyof typeof filters]}
            label={getCheckboxLabel(filterKey as keyof typeof filters)}
            ariaLabel={translations[filterKey as keyof typeof filters]}
            onChange={() => {
              toggleFilter(filterKey as keyof typeof filters);
              setPageNr(1);
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export const SearchFilters = () => {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { sm } = useMediaQueries();

  if (sm) {
    return (
      <div className="bg-white rounded-md p-6 flex flex-col select-none gap-6">
        <span className="sm:text-body-sm text-body-sm-mobile">{t('search.filters')}</span>
        <FiltersContent />
      </div>
    );
  }

  return (
    <Button
      variant="white"
      onClick={() => showModal(FiltersModal)}
      label={t('search.filters')}
      icon={<JodSettings className="text-primary-gray" />}
      className="text-primary-gray!"
      iconSide="left"
      size="sm"
    />
  );
};
