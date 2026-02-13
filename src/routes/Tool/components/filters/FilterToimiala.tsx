import { LangCode } from '@/i18n/config.ts';
import { useToolStore } from '@/stores/useToolStore';
import { getCodesetValue } from '@/utils/codes/codes.ts';
import { Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const toimialakoodit: [string, string][] = [
  ['A', 'Maatalous, metsätalous ja kalatalous'],
  ['B', 'Kaivostoiminta ja louhinta'],
  ['C', 'Teollisuus'],
  ['D', 'Sähkö, kaasu, lämpö, höyry ja ilmastointi'],
  ['E', 'Vesi, viemäri ja jätteen käsittely'],
  ['F', 'Rakentaminen'],
  ['G', 'Kauppa; ajoneuvojen korjaus'],
  ['H', 'Kuljetus ja varastointi'],
  ['I', 'Majoitus- ja ravitsemistoiminta'],
  ['J', 'Tietopalvelut'],
  ['K', 'Rahoitus- ja vakuutustoiminta'],
  ['L', 'Kiinteistötoiminta'],
  ['M', 'Ammattimainen, tieteellinen ja tekninen toiminta'],
  ['N', 'Hallinto- ja tukipalvelutoiminta'],
  ['O', 'Julkinen hallinto, puolustus ja sosiaalivakuutus'],
  ['P', 'Koulutus'],
  ['Q', 'Terveys- ja sosiaalipalvelut'],
  ['R', 'Taiteet, viihde ja virkistys'],
  ['S', 'Muu palvelutoiminta'],
  [
    'T',
    'Kotitalouksien toiminta työnantajina; kotitalouksien eriyttämätön toiminta tavaroiden ja palvelujen tuottamiseksi omaan käyttöön',
  ],
  ['U', 'Kansainvälisten organisaatioiden ja toimielinten toiminta'],
  ['X', 'Toimiala tuntematon'],
];

const translateToimiala = async ([code, defaultName]: [string, string], lang: LangCode): Promise<[string, string]> => {
  const name = await getCodesetValue('toimiala', code, lang).catch(() => defaultName);
  return name === code ? [code, defaultName] : [code, name];
};
export const FilterToimiala = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [toimialat, setToimialat] = React.useState<[string, string][]>([]);
  const { filter, setFilter, addToArray } = useToolStore(
    useShallow((state) => ({
      filter: state.filters.toimialat,
      setFilter: state.setArrayFilter,
      addToArray: state.addToArray,
    })),
  );
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = event.target.value;
    if (!filter.includes(newFilter)) {
      //when adding filter, also select the TYOMAHDOLLISUUS opportunity type
      addToArray('opportunityType', 'TYOMAHDOLLISUUS');
    }
    setFilter('toimialat', newFilter);
  };

  React.useEffect(() => {
    Promise.all(toimialakoodit.map((toimiala) => translateToimiala(toimiala, language as LangCode))).then(
      (translatedToimialat) => {
        translatedToimialat.sort((a, b) => a[1].localeCompare(b[1]));
        setToimialat(translatedToimialat);
      },
    );
  }, [language]);

  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="text-heading-4-mobile sm:text-heading-4 mb-5 sr-only">{t('show')}</legend>
      {toimialat.map((toimiala) => (
        <Checkbox
          key={toimiala[1]}
          ariaLabel={toimiala[1]}
          className="font-poppins!"
          checked={filter.includes(toimiala[0])}
          label={toimiala[1]}
          name={toimiala[1]}
          onChange={onFilterChange}
          value={toimiala[0]}
          testId="upper-level-ammattiryhma-filter"
        />
      ))}
    </fieldset>
  );
};
