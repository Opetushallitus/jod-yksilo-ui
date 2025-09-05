import { SimpleNavigationList } from '@/components';
import { GROUP_BY_ALPHABET, GROUP_BY_SOURCE, GROUP_BY_THEME } from '@/routes/Profile/Competences/constants';
import { RadioButton, RadioButtonGroup, useMediaQueries } from '@jod/design-system';
import { useTranslation } from 'react-i18next';
import { CompetenceFilters, CompetenceFiltersProps } from './CompetenceFilters';

interface FiltersProps extends CompetenceFiltersProps {
  groupBy: string;
  setGroupBy: (value: string) => void;
}

export const Filters = ({ filterKeys, selectedFilters, setSelectedFilters, groupBy, setGroupBy }: FiltersProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();

  return (
    <>
      <SimpleNavigationList
        title={t('profile.competences.title')}
        backgroundClassName={sm ? 'bg-bg-gray-2' : 'bg-bg-gray'}
        collapsible
      >
        <RadioButtonGroup
          value={groupBy}
          onChange={setGroupBy}
          className="py-4"
          label={t('profile.competences.group')}
          hideLabel
        >
          <RadioButton label={t('profile.competences.group-by-source')} value={GROUP_BY_SOURCE} />
          <RadioButton label={`TODO: ${t('profile.competences.group-by-theme')}`} value={GROUP_BY_THEME} />
          <RadioButton label={t('profile.competences.group-by-alphabet')} value={GROUP_BY_ALPHABET} />
        </RadioButtonGroup>
      </SimpleNavigationList>
      <SimpleNavigationList title={t('do-filter')} backgroundClassName={sm ? 'bg-bg-gray-2' : 'bg-bg-gray'} collapsible>
        <CompetenceFilters
          filterKeys={filterKeys}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          ignoredFilterKeys={['KIINNOSTUS']}
        />
      </SimpleNavigationList>
    </>
  );
};
