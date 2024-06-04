import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearErrorNote, setErrorNote } from '@/features/errorNote/errorNoteSlice';
import { InputField, RadioButton, RadioButtonGroup, ResultsCard, Slider } from '@jod/design-system';
import { useAuth } from '@/hooks/useAuth';
import { SimpleNavigationList } from '@/components';

interface Competence {
  id: number;
  nimi: string;
  osuvuus: number;
}

const Competences = () => {
  const { t } = useTranslation();
  const [competences, setCompetences] = React.useState<Competence[]>([]);
  const [skill, setSkill] = React.useState('');
  const dispatch = useDispatch();
  const { csrf } = useAuth();

  const debounce = <F extends (...args: never[]) => void>(func: F, waitFor = 800) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => func(...args), waitFor);
    };
  };

  const fetchCompetences = React.useCallback(
    (newSkill: string) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (csrf) {
        headers[csrf.headerName] = csrf.token;
      }
      fetch('/api/ehdotus/osaamiset', {
        method: 'POST',
        headers,
        body: JSON.stringify({ kuvaus: newSkill }),
      })
        .then((resp) => {
          if (!resp.ok) {
            dispatch(setErrorNote({ title: 'error.network.title', description: 'error.network.500' }));

            throw new Error('Network response was not ok');
          }
          dispatch(clearErrorNote());
          return resp.json();
        })
        .then((data: Competence[]) => {
          setCompetences(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    },
    [dispatch, csrf],
  );

  const debouncedFetchCompetences = React.useMemo(() => {
    return debounce((newSkill: string) => fetchCompetences(newSkill));
  }, [fetchCompetences]);

  const inputChangeHandler = (newValue: string) => {
    setSkill(newValue);
    debouncedFetchCompetences(newValue);
  };

  const [competencesMultiplier, setCompetencesMultiplier] = React.useState(50);
  const [interestMultiplier, setInterestMultiplier] = React.useState(50);
  const [restrictionsMultiplier, setRestrictionsMultiplier] = React.useState(50);

  const [keyFigure, setKeyFigure] = React.useState('a');
  const [order, setOrder] = React.useState('descending');

  return (
    <div className="grid grid-cols-6 gap-x-6">
      <div className="col-span-4">
        <h1 className="mb-5 mt-7 text-heading-1 text-primary-gray">{t('tool.competences.heading-1')}</h1>

        <div className="pb-7">
          <p className="mb-6 text-body-md text-primary-gray">{t('tool.competences.page-description')}</p>
          <p className="text-body-md text-primary-gray">{t('tool.competences.field-description')}</p>
        </div>
      </div>

      <div className="col-span-4">
        <InputField label="Taitosi" value={skill} onChange={(event) => inputChangeHandler(event.target.value)} />
        <div className="mt-7 min-h-[200px] rounded border p-4">
          <ul className="flex flex-col space-y-4">
            {competences.map((item) => (
              <li className="flex flex-row justify-between rounded border p-4" key={item.id}>
                <span>{item.nimi}</span>
                <span>{item.osuvuus}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-span-2 flex flex-col gap-4">
        <span className="text-heading-4 text-black">Apuvälineitä</span>
        <span className="text-body-xs text-secondary-gray">
          Rakenna koulutus- ja työhistoriasi käyttämällä alla olevia työkaluja, jolloin palvelu voi tunnistaa sinulle
          sopivia osaamisia.
        </span>
        <ul>
          <li>Koulutukseni</li>
          <li>Työpaikkani</li>
          <li>Vapaa-ajan toimintoni</li>
        </ul>
      </div>
      <div className="col-span-6 mb-8 mt-11 flex flex-col">
        <div className="mb-5 flex flex-row">
          <span className="mr-5 text-heading-3 text-primary-gray">Tulokset</span>
          <span className="text-body-md text-secondary-gray">
            Lukumääräisesti valittavissasi eri vaihtoehtoja - vieritä näkymää alaspäin itse tuloksiin.
          </span>
        </div>
        <div className="mb-9 flex flex-row gap-6">
          <ResultsCard value={534} label="ammatteja" />
          <ResultsCard value={1987} label="koulutuksia" />
        </div>
        <div className="mb-5 flex flex-row">
          <span className="mr-5 text-heading-3 text-primary-gray">Painotukset</span>
          <span className="text-body-md text-secondary-gray">
            Säädä syöttämäsi tietojen painotuksia - tulokset päivittyvät samanaikaisesti uusien painotusten mukaan.
          </span>
        </div>
        <div className="flex flex-row gap-6">
          <Slider
            label="Osaamiset"
            icon="school"
            onValueChange={(val) => setCompetencesMultiplier(val)}
            value={competencesMultiplier}
          />
          <Slider
            label="Kiinnostukset"
            icon="interests"
            onValueChange={(val) => setInterestMultiplier(val)}
            value={interestMultiplier}
          />
          <Slider
            label="Rajoitukset"
            icon="block"
            onValueChange={(val) => setRestrictionsMultiplier(val)}
            value={restrictionsMultiplier}
          />
        </div>
      </div>
      <div className="col-span-4">Työmahdollisuudet listaus</div>
      <div className="col-span-2 flex flex-col gap-5">
        <SimpleNavigationList title="Tunnusluvut" collapsible>
          <RadioButtonGroup
            label="Valitse näytettävä tunnusluku. Vaihtoehdot riippuvat hakutuloksistasi."
            value={keyFigure}
            onChange={(val) => setKeyFigure(val)}
            className="py-4"
          >
            <RadioButton label="Tuloksen sopivuus" value="a" />
            <RadioButton label="Ennakoitu muutos" value="b" />
            <RadioButton label="Keskiansio" value="c" />
            <RadioButton label="Työvoimakohtaanto" value="d" />
            <RadioButton label="Työttömyysprosentti" value="e" />
          </RadioButtonGroup>
        </SimpleNavigationList>
        <SimpleNavigationList title="Järjestys" collapsible>
          <RadioButtonGroup
            label="Valitse järjestystapa. Tulokset järjestetään valitun tunnusluvun mukaan."
            value={order}
            onChange={(val) => setOrder(val)}
            className="py-4"
          >
            <RadioButton label="Laskeva" value="descending" />
            <RadioButton label="Nouseva" value="ascending" />
          </RadioButtonGroup>
        </SimpleNavigationList>
      </div>
    </div>
  );
};

export default Competences;
