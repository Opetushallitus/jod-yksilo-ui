import { OsaaminenValue } from '@/components';
import { OsaaminenLahdeTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const filterByType = (type: OsaaminenLahdeTyyppi) => (val: OsaaminenValue) => val.tyyppi === type;
const filterOsaaminenById = (ids: string[]) => (value: OsaaminenValue) => !ids.includes(value.id);
export const PROFILE_TYPES: OsaaminenLahdeTyyppi[] = [
  'KIINNOSTUS',
  'TOIMENKUVA',
  'KOULUTUS',
  'PATEVYYS',
  'MUU_OSAAMINEN',
] as const;

export const useTool = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const {
    osaamiset,
    osaamisetVapaateksti,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    setOsaamiset,
    setOsaamisetVapaateksti,
    setKiinnostukset,
    setKiinnostuksetVapaateksti,
  } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      osaamisetVapaateksti: state.osaamisetVapaateksti,
      kiinnostukset: state.kiinnostukset,
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      setOsaamiset: state.setOsaamiset,
      setOsaamisetVapaateksti: state.setOsaamisetVapaateksti,
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
    })),
  );

  const mappedKiinnostukset = kiinnostukset.filter((k) => k.tyyppi === 'KARTOITETTU');
  const mappedOsaamiset = osaamiset.filter((o) => o.tyyppi === 'KARTOITETTU');
  const combinedData = [...osaamiset, ...kiinnostukset];
  const profileCompetencesByType = PROFILE_TYPES.reduce<Record<(typeof PROFILE_TYPES)[number], OsaaminenValue[]>>(
    (acc, type) => {
      if (combinedData.some((o) => o.tyyppi === type)) {
        acc[type] = combinedData.filter(filterByType(type));
      }
      return acc;
    },
    {} as Record<(typeof PROFILE_TYPES)[number], OsaaminenValue[]>,
  );
  const hasProfileCompetences = Object.keys(profileCompetencesByType).length > 0;
  const hasOtherProfileData = osaamisetVapaateksti?.[language] || kiinnostuksetVapaateksti?.[language];
  const profileCompetencesCount =
    combinedData.filter((item) => item.tyyppi && PROFILE_TYPES.includes(item.tyyppi)).length +
    (osaamisetVapaateksti?.[language] ? 1 : 0) +
    (kiinnostuksetVapaateksti?.[language] ? 1 : 0);

  const removeCompetenceByType = (type: 'osaaminen' | 'kiinnostus') => (ids: string[]) => () => {
    const data = type === 'kiinnostus' ? kiinnostukset : osaamiset;
    const setData = type === 'kiinnostus' ? setKiinnostukset : setOsaamiset;
    setData(data.filter(filterOsaaminenById(ids)));
  };
  const removeOsaaminen = removeCompetenceByType('osaaminen');
  const removeKiinnostus = removeCompetenceByType('kiinnostus');

  return {
    mappedKiinnostukset,
    mappedOsaamiset,
    profileCompetencesByType,
    hasProfileCompetences,
    hasOtherProfileData,
    profileCompetencesCount,
    osaamiset,
    osaamisetVapaateksti,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    setOsaamiset,
    setOsaamisetVapaateksti,
    setKiinnostukset,
    setKiinnostuksetVapaateksti,
    removeOsaaminen,
    removeKiinnostus,
  };
};
