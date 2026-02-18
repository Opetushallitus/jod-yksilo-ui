import { OsaamisSuosittelija } from '@/components';
import { isFeatureEnabled } from '@/utils/features';
import { Button } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';
import { VirtualAssistant } from './VirtualAssistant';

const Interests = () => {
  const { t } = useTranslation();
  const { setKiinnostukset, kiinnostukset, mappedKiinnostukset } = useTool();

  const onChange = React.useCallback(
    (newValues: typeof kiinnostukset) => {
      setKiinnostukset(mergeUniqueValuesExcludingType(kiinnostukset, newValues));
    },
    [kiinnostukset, setKiinnostukset],
  );

  return (
    <>
      <OsaamisSuosittelija
        onChange={onChange}
        value={mappedKiinnostukset}
        mode="kiinnostukset"
        tagHeadingClassName="bg-white"
        hideTextAreaLabel
        useAnimations
      />
      {kiinnostukset.length > 1 && (
        <Button
          variant="plain"
          onClick={() => {
            setKiinnostukset([]);
          }}
          className="ml-2 mb-6"
          label={t('tool.competency-profile.delete-all')}
        />
      )}
      {isFeatureEnabled('VIRTUAALIOHJAAJA') && <VirtualAssistant type="interests" className="mt-6" />}
    </>
  );
};

export default Interests;
