import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearErrorNote, setErrorNote } from '@/features/errorNote/errorNoteSlice';
import {
  Accordion,
  Button,
  InputField,
  Modal,
  RadioButton,
  RadioButtonGroup,
  ResultsCard,
  Slider,
  useMediaQueries,
} from '@jod/design-system';
import { useAuth } from '@/hooks/useAuth';
import { SimpleNavigationList } from '@/components';

interface Competence {
  id: number;
  nimi: string;
  osuvuus: number;
}

const HelpingToolsContent = () => (
  <>
    <span className="text-body-sm text-secondary-gray sm:text-body-xs">
      Rakenna koulutus- ja työhistoriasi käyttämällä alla olevia työkaluja, jolloin palvelu voi tunnistaa sinulle
      sopivia osaamisia.
    </span>
    <ul>
      <li>Koulutukseni</li>
      <li>Työpaikkani</li>
      <li>Vapaa-ajan toimintoni</li>
    </ul>
  </>
);

const Filters = ({
  keyFigure,
  setKeyFigure,
  order,
  setOrder,
}: {
  keyFigure: string;
  setKeyFigure: (val: string) => void;
  order: string;
  setOrder: (val: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-6 sm:gap-5">
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
  );
};

const Competences = () => {
  const { t } = useTranslation();
  const [competences, setCompetences] = React.useState<Competence[]>([]);
  const [skill, setSkill] = React.useState('');
  const dispatch = useDispatch();
  const { csrf } = useAuth();

  const { sm } = useMediaQueries();

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

  const [showFilters, setShowFilters] = React.useState(false);
  const [keyFigure, setKeyFigure] = React.useState('a');
  const [order, setOrder] = React.useState('descending');

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-6">
        <div className="order-1 col-span-2 sm:col-span-4">
          <h1 className="mb-5 mt-7 text-heading-1 text-primary-gray">{t('tool.competences.heading-1')}</h1>

          <div className="pb-7">
            <p className="mb-6 text-body-md text-primary-gray">{t('tool.competences.page-description')}</p>
            <p className="text-body-md text-primary-gray">{t('tool.competences.field-description')}</p>
          </div>
        </div>

        <div className="order-3 col-span-2 sm:order-2 sm:col-span-4">
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
        <div className="order-2 col-span-2 mb-8 flex flex-col gap-4 sm:order-3 sm:mb-0">
          {sm ? (
            <>
              <span className="text-heading-4 text-primary-gray">Apuvälineitä</span>
              <HelpingToolsContent />
            </>
          ) : (
            <Accordion title="Apuvälineitä" expandLessText="Less" expandMoreText="More" lang="xy">
              <HelpingToolsContent />
            </Accordion>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-6">
        <div className="col-span-2 sm:col-span-6">
          <div className="mt-10 flex flex-col sm:mt-11 sm:flex-row">
            <span className="mb-2 text-heading-3 text-primary-gray sm:mb-0 sm:mr-5">Tulokset</span>
            <span className="text-body-sm text-secondary-gray sm:text-body-md">
              Lukumääräisesti valittavissasi eri vaihtoehtoja - vieritä näkymää alaspäin itse tuloksiin.
            </span>
          </div>
        </div>

        <div className="col-span-2 mt-6 flex flex-col gap-6 sm:col-span-6 sm:mt-5 sm:flex-row">
          <ResultsCard value={534} label="ammatteja" />
          <ResultsCard value={1987} label="koulutuksia" />
        </div>

        <div className="col-span-2 mt-10 flex flex-col sm:col-span-6 sm:mt-9 sm:flex-row">
          <span className="mb-2 text-heading-3 text-primary-gray sm:mb-0 sm:mr-5">Painotukset</span>
          <span className="text-body-sm text-secondary-gray sm:text-body-md">
            Säädä syöttämäsi tietojen painotuksia - tulokset päivittyvät samanaikaisesti uusien painotusten mukaan.
          </span>
        </div>

        <div className="col-span-2 mt-6 grid grid-cols-1 gap-6 sm:col-span-6 sm:mt-5 sm:grid-cols-3">
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
        <div className="col-span-2 mt-10 sm:col-span-4 sm:mt-8">
          {!sm && (
            <>
              <div className="mb-2 flex flex-row justify-between">
                <span className="mr-5 text-heading-3 text-primary-gray">Tuloslista</span>
                <button
                  className="material-symbols-outlined size-24 select-none"
                  aria-label="Näytä suodattimet"
                  onClick={() => setShowFilters(true)}
                >
                  tune
                </button>

                <Modal
                  open={showFilters}
                  onClose={() => setShowFilters(false)}
                  content={
                    <Filters keyFigure={keyFigure} setKeyFigure={setKeyFigure} order={order} setOrder={setOrder} />
                  }
                  footer={
                    <div className="flex flex-row justify-end gap-4">
                      <Button variant="white" label="Sulje" onClick={() => setShowFilters(false)} />
                    </div>
                  }
                />
              </div>
              <span>
                Tarkenna tuloksia: valitse haluamasi tunnusluvut ja järjestä lista uudelleen napauttamalla oikean laidan
                painiketta.
              </span>
            </>
          )}
          <div>Työmahdollisuudet listaus</div>
        </div>
        {sm && (
          <div className="col-span-2 sm:mt-8">
            <Filters keyFigure={keyFigure} setKeyFigure={setKeyFigure} order={order} setOrder={setOrder} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Competences;
