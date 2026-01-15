import { OsaamisSuosittelija } from '@/components';
import { useToolStore } from '@/stores/useToolStore';
import { isFeatureEnabled } from '@/utils/features';
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { mergeUniqueValuesExcludingType } from './utils';
import { VirtualAssistant } from './VirtualAssistant';

const Interests = () => {
  const { setKiinnostukset, kiinnostukset } = useToolStore(
    useShallow((state) => ({
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
    })),
  );

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
        value={kiinnostukset.filter((k) => k.tyyppi === 'KARTOITETTU')}
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
