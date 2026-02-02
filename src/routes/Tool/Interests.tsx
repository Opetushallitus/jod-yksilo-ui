import { OsaamisSuosittelija } from '@/components';
import { isFeatureEnabled } from '@/utils/features';
import React from 'react';
import { useTool } from './hook/useTool';
import { mergeUniqueValuesExcludingType } from './utils';
import { VirtualAssistant } from './VirtualAssistant';

const Interests = () => {
  const { setKiinnostukset, kiinnostukset, mappedKiinnostukset } = useTool();

  const onChange = React.useCallback(
    (newValues: typeof kiinnostukset) => {
      setKiinnostukset(mergeUniqueValuesExcludingType(kiinnostukset, newValues));
    },
    [kiinnostukset, setKiinnostukset],
  );

  return (
    <div>
      <OsaamisSuosittelija
        onChange={onChange}
        value={mappedKiinnostukset}
        mode="kiinnostukset"
        tagHeadingClassName="bg-white"
        hideTextAreaLabel
        useAnimations
      />
      {isFeatureEnabled('VIRTUAALIOHJAAJA') && <VirtualAssistant />}
    </div>
  );
};

export default Interests;
