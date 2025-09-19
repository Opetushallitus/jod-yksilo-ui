import { Slider } from '@jod/design-system';
import { useTranslation } from 'react-i18next';

const FilterEducationDuration = () => {
  const { t } = useTranslation();
  return (
    <div data-testid="tool-opportunity-slider">
      <Slider
        label={t('competences')}
        rightLabel={t('interests')}
        // eslint-disable-next-line no-console
        onValueChange={console.log}
        value={5}
        disabled={false}
      />
    </div>
  );
};

export default FilterEducationDuration;
