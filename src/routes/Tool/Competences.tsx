import { OsaamisSuosittelija, SimpleNavigationList } from '@/components';
import { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useDebounceState } from '@/hooks/useDebounceState';
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
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  isMobile,
}: {
  keyFigure: string;
  setKeyFigure: (val: string) => void;
  order: string;
  setOrder: (val: string) => void;
  isMobile: boolean;
}) => {
  return (
    <div className="inline-flex flex-col gap-6 sm:gap-5 w-full">
      <SimpleNavigationList title="Tunnusluvut" collapsible borderEnabled={isMobile} addPadding={isMobile}>
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
      <SimpleNavigationList title="Järjestys" collapsible borderEnabled={isMobile} addPadding={isMobile}>
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
  const { sm } = useMediaQueries();

  const [competencesMultiplier, setCompetencesMultiplier] = React.useState(50);
  const [interestMultiplier, setInterestMultiplier] = React.useState(50);
  const [restrictionsMultiplier, setRestrictionsMultiplier] = React.useState(50);

  const [showFilters, setShowFilters] = React.useState(false);
  const [keyFigure, setKeyFigure] = React.useState('a');
  const [order, setOrder] = React.useState('descending');

  const [debouncedTyotehtava, tyotehtava, setTyotehtava] = useDebounceState('', 500);

  const [selectedCompetences, setSelectedCompentences] = React.useState<OsaaminenValue[]>([]);

  const osaamisSuosittelijaHandler = (values: OsaaminenValue[]) => {
    setSelectedCompentences(values);
  };

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
          <div className="mb-5">
            <InputField
              label={t('work-history.job-duties')}
              value={tyotehtava}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTyotehtava(event.target.value)}
              placeholder="Lorem ipsum dolor sit amet"
            />
          </div>
          <OsaamisSuosittelija
            description={debouncedTyotehtava}
            onChange={osaamisSuosittelijaHandler}
            value={selectedCompetences}
          />
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
                    <Filters
                      keyFigure={keyFigure}
                      setKeyFigure={setKeyFigure}
                      order={order}
                      setOrder={setOrder}
                      isMobile={sm}
                    />
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
            <Filters
              keyFigure={keyFigure}
              setKeyFigure={setKeyFigure}
              order={order}
              setOrder={setOrder}
              isMobile={sm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Competences;
