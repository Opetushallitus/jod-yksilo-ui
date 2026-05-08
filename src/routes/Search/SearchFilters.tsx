import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Button, Checkbox, Modal, useMediaQueries } from '@jod/design-system';
import { JodSettings } from '@jod/design-system/icons';

import { AiInfo } from '@/components';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import { useSearchStore } from '@/stores/useSearchStore';

const FiltersModal = ({ onClose, ...rest }: ModalComponentProps) => {
  const { t } = useTranslation();
  const { lg, sm } = useMediaQueries();
  return (
    <Modal
      {...rest}
      open={rest.open && !lg}
      topSlot={<span className="text-heading-2-mobile sm:text-heading-2">{t('search.filters', { count: 0 })}</span>}
      className="h-fit!"
      content={
        <div className="p-5 pb-6 md:ml-3 md:px-8">
          <FiltersContent />
        </div>
      }
      footer={
        <div className="ml-auto flex gap-4">
          <Button size={sm ? 'lg' : 'sm'} onClick={onClose} label={t('close')} variant="accent" />
        </div>
      }
      name={t('search.filters', { count: 0 })}
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
    <ul>
      {Object.keys(filters).map((filterKey) => (
        <li key={filterKey} className="mb-6 last:mb-0">
          <Checkbox
            name={filterKey}
            value={filterKey}
            className="items-center gap-4"
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
  const { lg } = useMediaQueries();
  const filters = useSearchStore((state) => state.filters);
  const filtersCount = Object.values(filters).filter((value) => value === true).length;

  if (lg) {
    return (
      <div className="flex flex-col gap-6 rounded-md bg-white p-6 select-none">
        <h2 className="text-body-sm-mobile sm:text-body-sm">{t('search.filters', { count: 0 })}</h2>
        <FiltersContent />
      </div>
    );
  }

  return (
    <Button
      variant="white"
      ariaHaspopup="dialog"
      onClick={() => showModal(FiltersModal)}
      label={t('search.filters', { count: filtersCount })}
      icon={<JodSettings className="text-primary-gray" />}
      className="text-primary-gray!"
      iconSide="left"
      size="sm"
    />
  );
};
