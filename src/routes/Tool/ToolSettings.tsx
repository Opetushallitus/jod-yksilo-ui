import { useToolStore } from '@/stores/useToolStore';
import { Accordion, Checkbox, Slider } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { MahdollisuusTyyppi } from '../types';
import OpportunitiesSorting from './OpportunitiesSorting';
import { filterValues, type OpportunityFilterValue } from './utils';

const OpportunitySlider = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    kiinnostukset,
    kiinnostuksetVapaateksti,
    osaamiset,
    osaamisetVapaateksti,
    osaamisKiinnostusPainotus,
    setOsaamisKiinnostusPainotus,
  } = useToolStore(
    useShallow((state) => ({
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      osaamiset: state.osaamiset,
      osaamisetVapaateksti: state.osaamisetVapaateksti,
      osaamisKiinnostusPainotus: state.osaamisKiinnostusPainotus,
      setOsaamisKiinnostusPainotus: state.setOsaamisKiinnostusPainotus,
    })),
  );

  const painotus = React.useMemo(() => {
    if (
      kiinnostukset.length === 0 &&
      kiinnostuksetVapaateksti?.[language].length === undefined &&
      osaamiset.length === 0 &&
      osaamisetVapaateksti?.[language].length === undefined
    ) {
      return { value: 50, disabled: true };
    } else if (osaamiset.length === 0 && osaamisetVapaateksti?.[language].length === undefined) {
      return { value: 100, disabled: true };
    } else if (kiinnostukset.length === 0 && kiinnostuksetVapaateksti?.[language].length === undefined) {
      return { value: 0, disabled: true };
    } else {
      return { value: osaamisKiinnostusPainotus, disabled: false };
    }
  }, [
    kiinnostukset.length,
    kiinnostuksetVapaateksti,
    osaamisKiinnostusPainotus,
    osaamiset.length,
    osaamisetVapaateksti,
    language,
  ]);

  return (
    <div data-testid="tool-opportunity-slider" className="mt-6">
      <Slider
        label={t('competences')}
        rightLabel={t('interests')}
        onValueChange={(val) => setOsaamisKiinnostusPainotus(val)}
        value={painotus.value}
        disabled={painotus.disabled}
      />
    </div>
  );
};

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div>
      <div className="border-b border-border-gray pb-3 mb-3">{title}</div>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
};

const Setting = ({
  title,
  children,
  ref,
}: {
  title: string;
  children: React.ReactNode;
  /** Ref is used to reference accordion open button for focusing */
  ref?: React.RefObject<HTMLDivElement | null>;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <li>
      <Accordion
        title={
          <div ref={ref} className="w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="block w-full text-left cursor-pointer p-1">
              <span>{title}</span>
            </button>
          </div>
        }
        lang={language}
        titleText={t('sorting')}
        initialState={false}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="pl-4">{children}</div>
      </Accordion>
    </li>
  );
};

const ToolSettings = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const { ehdotuksetCount, filter, setFilter } = useToolStore(
    useShallow((state) => ({
      ehdotuksetCount: state.ehdotuksetCount,
      filter: state.filter,
      setFilter: state.setFilter,
    })),
  );

  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value as MahdollisuusTyyppi;

    if (filter.includes(newFilter)) {
      setFilter(filter.filter((f) => f !== newFilter));
    } else {
      setFilter([...filter, newFilter]);
    }
  };

  React.useEffect(() => {
    if (searchParams.get('origin') === 'favorites') {
      const filterParam = searchParams.get('filter') as OpportunityFilterValue;
      if (filterParam) {
        setFilter([filterParam]);
      }
      const opportunitiesTitleElement = document.getElementById('opportunities-title');
      if (opportunitiesTitleElement) {
        opportunitiesTitleElement.scrollIntoView({ behavior: 'smooth' });
        opportunitiesTitleElement.focus();
      }
      const url = new URL(window.location.href);
      url.search = ''; // Clear search parameters
      window.history.replaceState({}, '', url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCheckboxLabel = (type: MahdollisuusTyyppi) =>
    type === 'TYOMAHDOLLISUUS'
      ? t('n-job-opportunities', { count: ehdotuksetCount.TYOMAHDOLLISUUS })
      : t('n-education-opportunities', { count: ehdotuksetCount.KOULUTUSMAHDOLLISUUS });

  return (
    <div className="bg-bg-gray-2 rounded-t mb-7 py-4 px-6 sm:text-body-sm text-body-sm-mobile flex flex-col gap-6 sticky top-[168px] lg:top-[124px] z-10">
      <SettingsSection title={t('tool.settings.general.title')}>
        <Setting title={t('tool.settings.general.filter')} ref={ref}>
          <div className="py-2">
            <fieldset className="flex flex-col gap-5">
              <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
              <Checkbox
                ariaLabel={getCheckboxLabel('TYOMAHDOLLISUUS')}
                className="font-poppins!"
                checked={filter.includes('ALL') || filter.includes('TYOMAHDOLLISUUS')}
                label={getCheckboxLabel('TYOMAHDOLLISUUS')}
                name={filterValues.TYOMAHDOLLISUUS}
                onChange={onFilterChange}
                value={filterValues.TYOMAHDOLLISUUS}
                data-testid="filter-job-opportunities"
              />
              <Checkbox
                ariaLabel={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
                className="font-poppins!"
                checked={filter.includes('ALL') || filter.includes('KOULUTUSMAHDOLLISUUS')}
                label={getCheckboxLabel('KOULUTUSMAHDOLLISUUS')}
                name={filterValues.KOULUTUSMAHDOLLISUUS}
                onChange={onFilterChange}
                value={filterValues.KOULUTUSMAHDOLLISUUS}
                data-testid="filter-education-opportunities"
              />
            </fieldset>
          </div>
        </Setting>
        <Setting title={t('tool.settings.general.weight')}>
          <OpportunitySlider />
        </Setting>
        <Setting title={t('tool.settings.general.sorting')}>
          <OpportunitiesSorting />
        </Setting>

        <div className="hidden">
          <Setting title={t('tool.settings.general.location')}>{t('location')}</Setting>
        </div>
      </SettingsSection>

      <div className="hidden">
        <SettingsSection title={t('tool.settings.job-opportunity.title')}>
          <Setting title={t('tool.settings.job-opportunity.type')}>tyyppi</Setting>
          <Setting title={t('tool.settings.job-opportunity.industry')}>toimiala</Setting>
          <Setting title={t('tool.settings.job-opportunity.occupation')}>ammattiryhmä</Setting>
        </SettingsSection>

        <SettingsSection title={t('tool.settings.education-opportunity.title')}>
          <Setting title={t('tool.settings.education-opportunity.type')}>tyyppi</Setting>
          <Setting title={t('tool.settings.education-opportunity.duration')}>kesto</Setting>
          <Setting title={t('tool.settings.education-opportunity.field')}>koulutusala</Setting>
        </SettingsSection>
      </div>
    </div>
  );
};

export default ToolSettings;
