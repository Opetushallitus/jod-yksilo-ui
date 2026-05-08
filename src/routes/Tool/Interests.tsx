import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@jod/design-system';

import { OsaamisSuosittelija } from '@/components';
import { isFeatureEnabled } from '@/utils/features';

import VirtualAssistant from '../../components/VirtualAssistant';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';

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
        scrollOnFocus={false}
        isTagSpacing={false}
        tagHeadingLevel="h3"
      />
      {mappedKiinnostukset.length > 1 && (
        <Button
          variant="plain"
          onClick={() => {
            setKiinnostukset([]);
          }}
          className="mb-6 ml-2"
          label={t('tool.competency-profile.delete-all')}
        />
      )}
      {isFeatureEnabled('VIRTUAALIOHJAAJA') && <VirtualAssistant type="interests" className="mt-6" />}
    </>
  );
};

export default Interests;
