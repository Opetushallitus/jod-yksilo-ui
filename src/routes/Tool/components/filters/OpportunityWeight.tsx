import { useToolStore } from '@/stores/useToolStore';
import { Slider } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const OpportunityWeight = () => {
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
    <div data-testid="tool-opportunity-slider" className="pt-4">
      <Slider
        label={t('map-competences')}
        rightLabel={t('interests')}
        onValueChange={(val) => setOsaamisKiinnostusPainotus(val)}
        value={painotus.value}
        disabled={painotus.disabled}
      />
    </div>
  );
};

export default OpportunityWeight;
