import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import { Checkbox } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const FilterProfessionalGroup = () => {
  const { filter = [], setFilter } = useToolStore(
    useShallow((state) => ({ filter: state.filters.professionalGroup, setFilter: state.setArrayFilter })),
  );

  const { t } = useTranslation();
  const groups = [
    { code: '1', label: { en: 'Managers', fi: 'Johtajat ja ylimmät virkamiehet' } },
    { code: '2', label: { en: 'Professionals', fi: 'Erityisasiantuntijat' } },
    { code: '3', label: { en: 'Technicians and associate professionals', fi: 'Asiantuntijat' } },
    { code: '4', label: { en: 'Clerical support workers', fi: 'Toimisto- ja asiakaspalvelutyöntekijät' } },
    { code: '5', label: { en: 'Service and sales workers', fi: 'Palvelu- ja myyntityöntekijät' } },
    {
      code: '6',
      label: {
        en: 'Skilled agricultural, forestry and fishery workers',
        fi: 'Maatalous-, metsätalous- ja kalataloustyöntekijät',
      },
    },
    { code: '7', label: { en: 'Craft and related trades workers', fi: 'Rakennus-, korjaus- ja valmistustyöntekijät' } },
    { code: '8', label: { en: 'Plant and machine operators, and assemblers', fi: 'Prosessi- ja kuljetustyöntekijät' } },
    { code: '9', label: { en: 'Elementary occupations', fi: 'Muut työntekijät' } },
    { code: '0', label: { en: 'Armed forces occupations', fi: 'Sotilaat' } },
  ];

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {groups.map((g) => (
        <Checkbox
          key={g.code}
          ariaLabel={getLocalizedText(g.label)}
          className="font-poppins!"
          checked={filter.includes(g.code)}
          label={t(getLocalizedText(g.label))}
          name={t(getLocalizedText(g.label))}
          onChange={() => setFilter('professionalGroup', g.code)}
          value={g.code}
          data-testid="filter-job-opportunities"
        />
      ))}
    </fieldset>
  );
};

export default FilterProfessionalGroup;
