import { LangCode } from '@/i18n/config.ts';
import { useToolStore } from '@/stores/useToolStore';
import { getCodesetValue } from '@/utils/codes/codes.ts';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const KOULUTUSALA_KOODIT: [string, string][] = [
  ['00', 'Yleissivistävä koulutus'],
  ['01', 'Kasvatusalat'],
  ['02', 'Humanistiset ja taidealat'],
  ['03', 'Yhteiskunnalliset alat'],
  ['04', 'Kauppa, hallinto ja oikeustieteet'],
  ['05', 'Luonnontieteet'],
  ['06', 'Tietojenkäsittely ja tietoliikenne (ICT)'],
  ['07', 'Tekniikan alat'],
  ['08', 'Maa- ja metsätalousalat'],
  ['09', 'Terveys- ja hyvinvointialat'],
  ['10', 'Palvelualat'],
  ['99', 'Muut tai tuntemattomat koulutusalat'],
];

const translateKoulutusala = async (
  [code, defaultName]: [string, string],
  lang: LangCode,
): Promise<[string, string]> => {
  const name = await getCodesetValue('koulutusala', code, lang).catch(() => defaultName);
  return name === code ? [code, defaultName] : [code, name];
};
export const FilterKoulutusala = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [koulutusalat, setKoulutusalat] = React.useState<[string, string][]>([]);
  const { filter, setFilter, addToArray } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.koulutusalat,
      setFilter: state.setArrayFilter,
      addToArray: state.addToArray,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    if (!filter.includes(newFilter)) {
      //when adding filter, also select the KOULUTUSMAHDOLLISUUS opportunity type
      addToArray('opportunityType', 'KOULUTUSMAHDOLLISUUS');
    }
    setFilter('koulutusalat', newFilter);
  };

  React.useEffect(() => {
    Promise.all(KOULUTUSALA_KOODIT.map((koulutusala) => translateKoulutusala(koulutusala, language as LangCode))).then(
      (translatedKoulutusalat) => {
        translatedKoulutusalat.sort((a, b) => a[1].localeCompare(b[1]));
        setKoulutusalat(translatedKoulutusalat);
      },
    );
  }, [language]);

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {koulutusalat.map((koulutusala) => (
        <Checkbox
          key={koulutusala[0]}
          ariaLabel={koulutusala[1]}
          className="font-poppins!"
          checked={filter.includes(koulutusala[0])}
          label={koulutusala[1]}
          name={koulutusala[1]}
          onChange={onFilterChange}
          value={koulutusala[0]}
          testId="upper-level-koulutusala-filter"
        />
      ))}
    </fieldset>
  );
};
