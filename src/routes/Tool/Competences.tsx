import { client } from '@/api/client';
import { OsaamisSuosittelija, SimpleNavigationList } from '@/components';
import { OpportunityCard } from '@/components/OpportunityCard/OpportunityCard';
import { OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useDebounceState } from '@/hooks/useDebounceState';
import {
  Accordion,
  Button,
  InputField,
  Modal,
  RadioButton,
  RadioButtonGroup,
  Slider,
  useMediaQueries,
} from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

interface Tyomahdollisuus {
  id?: string;
  otsikko: Record<string, string | undefined>;
  tiivistelma?: Record<string, string | undefined>;
  kuvaus?: Record<string, string | undefined>;
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
  industry,
  setIndustry,
  order,
  setOrder,
  isMobile,
}: {
  industry: string;
  setIndustry: (val: string) => void;
  order: string;
  setOrder: (val: string) => void;
  isMobile: boolean;
}) => {
  return (
    <div className="inline-flex flex-col gap-6 sm:gap-5 w-full">
      <SimpleNavigationList
        title="Järjestele (kaikki)"
        borderEnabled={isMobile}
        addPadding={isMobile}
        backgroundClassName="bg-bg-gray-2"
      >
        <RadioButtonGroup value={order} onChange={setOrder}>
          <RadioButton label="Tuloksen sopivuus" value="a" />
          <RadioButton label="Kehitystrendi" value="b" />
          <RadioButton label="Työllistusnäkymä" value="c" />
        </RadioButtonGroup>
      </SimpleNavigationList>
      <SimpleNavigationList
        title="Toimiala (työmahdollisuudet)"
        borderEnabled={isMobile}
        addPadding={isMobile}
        backgroundClassName="bg-bg-gray-2"
      >
        <RadioButtonGroup value={industry} onChange={setIndustry}>
          <RadioButton label="Toimiala x" value="x" />
          <RadioButton label="Toimiala y" value="y" />
        </RadioButtonGroup>
      </SimpleNavigationList>
    </div>
  );
};

const Competences = () => {
  const { i18n, t } = useTranslation();
  const { sm } = useMediaQueries();

  const [competencesMultiplier, setCompetencesMultiplier] = React.useState(50);
  const [interestMultiplier, setInterestMultiplier] = React.useState(50);
  const [restrictionsMultiplier, setRestrictionsMultiplier] = React.useState(50);

  const [showFilters, setShowFilters] = React.useState(false);
  const [industry, setIndustry] = React.useState('x');
  const [order, setOrder] = React.useState('a');

  const [debouncedTyotehtava, tyotehtava, setTyotehtava] = useDebounceState('', 500);
  const [selectedCompetences, setSelectedCompentences] = React.useState<OsaaminenValue[]>([]);
  const [tyomahdollisuudet, setTyomahdollisuudet] = React.useState<Tyomahdollisuus[]>([]);
  const [professionsCount] = React.useState(534);
  const [educationsCount] = React.useState(1002);

  const osaamisSuosittelijaHandler = (values: OsaaminenValue[]) => {
    setSelectedCompentences(values);
  };

  const fetchTyomahdollisuudet = async () => {
    const response = await client.GET('/api/tyomahdollisuudet');
    if (response.data?.sisalto) {
      setTyomahdollisuudet(response.data.sisalto);
    }
  };

  React.useEffect(() => {
    const getTyomahdollisuudet = async () => {
      await fetchTyomahdollisuudet();
    };
    void getTyomahdollisuudet();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-6">
        <div className="order-1 col-span-2 sm:col-span-4">
          <h1 className="mb-5 mt-7 text-heading-1 font-poppins text-black">{t('tool.competences.heading-1')}</h1>

          <div className="pb-7">
            <p className="mb-6 text-body-md text-black">{t('tool.competences.page-description')}</p>
            <p className="text-body-md text-black">{t('tool.competences.field-description')}</p>
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
              <span className="text-heading-4 font-poppins text-black">Apuvälineitä</span>
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
        <div className="font-poppins col-span-2 sm:col-span-6">
          <div className="mt-10 flex flex-col sm:mt-11 sm:flex-row">
            <span className="text-body-md text-black font-medium sm:text-body-lg">
              {t('tool.competences.available-options')}{' '}
              <span className="text-heading-3 font-bold">
                {t('tool.competences.available-options-totals', { professionsCount, educationsCount })}
              </span>
            </span>
          </div>
        </div>

        <div className="font-poppins col-span-2 mt-10 flex flex-col sm:col-span-6 sm:mt-9 sm:flex-row">
          <span className="text-body-md text-black font-medium sm:text-body-lg">
            {t('tool.competences.adjust-data-emphasis')}
          </span>
        </div>

        <div className="col-span-2 mt-6 grid grid-cols-1 gap-7 sm:col-span-6 sm:mt-5 sm:grid-cols-3">
          <Slider
            label="Osaamiset"
            onValueChange={(val) => setCompetencesMultiplier(val)}
            value={competencesMultiplier}
          />
          <Slider
            label="Kiinnostukset"
            onValueChange={(val) => setInterestMultiplier(val)}
            value={interestMultiplier}
          />
          <Slider
            label="Rajoitukset"
            onValueChange={(val) => setRestrictionsMultiplier(val)}
            value={restrictionsMultiplier}
          />
        </div>
        <div className="col-span-2 mt-10 sm:col-span-4 sm:mt-8">
          {!sm && (
            <>
              <div className="mb-2 flex flex-row justify-between">
                <span className="mr-5 text-heading-3 font-poppins text-black">Tuloslista</span>
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
                      industry={industry}
                      setIndustry={setIndustry}
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
          <div className="flex flex-col gap-5">
            {tyomahdollisuudet.map((item) => {
              return (
                <NavLink key={item.id} to={`/${i18n.language}/${t('slugs.job-opportunity.index')}/${item.id}`}>
                  <OpportunityCard
                    name={item.otsikko[i18n.language] ?? ''}
                    description={item.tiivistelma?.[i18n.language] ?? ''}
                    matchValue={99}
                    matchLabel="Sopivuus"
                    type={'work'}
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
        {sm && (
          <div className="col-span-2 sm:mt-8">
            <Filters industry={industry} setIndustry={setIndustry} order={order} setOrder={setOrder} isMobile={sm} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Competences;
