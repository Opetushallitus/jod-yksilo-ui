import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OpportunityCard, OsaaminenValue, SimpleNavigationList, Title } from '@/components';
import { ToolLoaderData } from '@/routes/Tool/loader';
import { getLocalizedText } from '@/utils';
import { Button, Modal, RadioButton, RadioButtonGroup, RoundButton, Slider, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GrTarget } from 'react-icons/gr';
import { MdBlock, MdOutlineInterests, MdOutlineSchool, MdTune } from 'react-icons/md';
import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import MatchedLink from './MatchedLink';
import { ContextType } from './types';

const MenuBookIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size}>
    <path
      fill="currentColor"
      d="M560-574v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464ZM248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-36.54 0-71.77 9T106-208q-23.1 11-44.55-3Q40-225 40-251v-463q0-15 7-27.5T68-761q42-20 87.39-29.5 45.4-9.5 92.61-9.5 63 0 122.5 17T482-731q51-35 109.5-52T712-800q46.87 0 91.93 9.5Q849-781 891-761q14 7 21.5 19.5T920-714v463q0 27.89-22.5 42.45Q875-194 853-208q-34-14-69.23-22.5Q748.54-239 712-239q-63 0-121 21t-109 58ZM276-489Z"
    />
  </svg>
);

interface Tyomahdollisuus {
  id?: string;
  otsikko: Record<string, string | undefined>;
  tiivistelma?: Record<string, string | undefined>;
  kuvaus?: Record<string, string | undefined>;
}

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
        backgroundClassName={isMobile ? 'bg-bg-gray-2' : 'bg-bg-gray'}
      >
        <RadioButtonGroup value={order} onChange={setOrder} label="Järjestele (kaikki)" hideLabel>
          <RadioButton label="Tuloksen sopivuus" value="a" />
          <RadioButton label="Kehitystrendi" value="b" />
          <RadioButton label="Työllistusnäkymä" value="c" />
        </RadioButtonGroup>
      </SimpleNavigationList>
      <SimpleNavigationList
        title="Toimiala (työmahdollisuudet)"
        borderEnabled={isMobile}
        addPadding={isMobile}
        backgroundClassName={isMobile ? 'bg-bg-gray-2' : 'bg-bg-gray'}
      >
        <RadioButtonGroup value={industry} onChange={setIndustry} label="Toimiala (työmahdollisuudet)" hideLabel>
          <RadioButton label="Toimiala x" value="x" />
          <RadioButton label="Toimiala y" value="y" />
        </RadioButtonGroup>
      </SimpleNavigationList>
    </div>
  );
};

interface EhdotusData {
  /** Format: uuid */
  mahdollisuusId: string;
  ehdotusMetadata?: EhdotusMetadata;
}

interface EhdotusMetadata {
  /** Format: double */
  pisteet?: number;
  /** @enum {string} */
  trendi?: 'NOUSEVA' | 'LASKEVA';
  /** Format: int32 */
  tyollisyysNakyma?: number;
}

type EhdotusRecord = Record<string, EhdotusMetadata>;

const ehdotusDataToRecord = (array: EhdotusData[]): EhdotusRecord => {
  return array.reduce((acc, item) => {
    acc[item.mahdollisuusId] = item?.ehdotusMetadata ?? {};
    return acc;
  }, {} as EhdotusRecord);
};

const Tool = () => {
  const { tyomahdollisuusEhdotukset: tyomahdollisuusEhdotuksetData, osaamiset: osaamisetData } =
    useLoaderData() as ToolLoaderData;
  const { sm } = useMediaQueries();
  const { t, i18n } = useTranslation();

  const [competencesMultiplier, setCompetencesMultiplier] = React.useState(50);
  const [interestMultiplier, setInterestMultiplier] = React.useState(50);
  const [restrictionsMultiplier, setRestrictionsMultiplier] = React.useState(50);

  const [showFilters, setShowFilters] = React.useState(false);
  const [industry, setIndustry] = React.useState('x');
  const [order, setOrder] = React.useState('a');

  const [tyomahdollisuudet, setTyomahdollisuudet] = React.useState<components['schemas']['TyomahdollisuusDto'][]>([]);
  const [tyomahdollisuusEhdotukset, setTyomahdollisuusEhdotukset] = React.useState<
    Record<string, EhdotusMetadata> | undefined
  >();
  const [professionsCount] = React.useState(534);
  const [educationsCount] = React.useState(1002);

  const [selectedOpportunities, setSelectedOpportunities] = React.useState<string[]>([]);
  const [selectedCompetences, setSelectedCompetences] = React.useState<OsaaminenValue[]>([
    ...osaamisetData.map(
      (osaaminen): OsaaminenValue => ({
        id: osaaminen.osaaminen.uri,
        nimi: getLocalizedText(osaaminen.osaaminen.nimi),
        tyyppi: osaaminen.lahde.tyyppi,
      }),
    ),
  ]);
  const [selectedInterests, setSelectedInterests] = React.useState<OsaaminenValue[]>([]);

  React.useEffect(() => {
    if (tyomahdollisuusEhdotuksetData) {
      setTyomahdollisuusEhdotukset(ehdotusDataToRecord(tyomahdollisuusEhdotuksetData as EhdotusData[]));
    }
  }, [tyomahdollisuusEhdotuksetData]);

  const abortController = React.useRef<AbortController>();

  // Update tyomahdollisuudet after the tyomahdollisuusEhdotukset has changed
  React.useEffect(() => {
    const fetchOpportunities = async () => {
      const ids = Object.keys(tyomahdollisuusEhdotukset ?? [])
        .map((key) => {
          const pisteet = tyomahdollisuusEhdotukset?.[key].pisteet ?? 0;
          return { key, pisteet };
        })
        .sort((a, b) => b.pisteet - a.pisteet)
        .map((id) => id.key);

      const { data } = await client.GET('/api/tyomahdollisuudet', {
        params: {
          query: {
            id: ids.slice(0, 30), // TODO: fetch by paging
          },
        },
        signal: abortController.current?.signal,
      });
      // All that has been returned are sorted by the scores
      const results = data?.sisalto ?? [];
      const sortedResults = [...results].sort((a, b) =>
        tyomahdollisuusEhdotukset
          ? (tyomahdollisuusEhdotukset[b.id]?.pisteet ?? 0) - (tyomahdollisuusEhdotukset[a.id]?.pisteet ?? 0)
          : 0,
      );
      setTyomahdollisuudet(sortedResults);
    };

    void fetchOpportunities();
  }, [tyomahdollisuusEhdotukset]);

  React.useEffect(() => {
    abortController.current?.abort('Abort previous request');
    abortController.current = new AbortController();

    const fetchSuggestions = async () => {
      const { data } = await client.POST('/api/ehdotus/tyomahdollisuudet', {
        body: {
          osaamiset: selectedCompetences.map((item) => item.id),
          kiinnostukset: selectedInterests.map((item) => item.id),
          osaamisPainotus: competencesMultiplier / 100,
          kiinnostusPainotus: interestMultiplier / 100,
          rajoitePainotus: restrictionsMultiplier / 100,
        },
        signal: abortController.current?.signal,
      });

      if (data) {
        setTyomahdollisuusEhdotukset(ehdotusDataToRecord(data as EhdotusData[]));
      }
    };

    // Debounce the fetch
    const timer = setTimeout(() => {
      void fetchSuggestions();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedCompetences, selectedInterests, competencesMultiplier, interestMultiplier, restrictionsMultiplier]);

  const toggleOpportunity = (id: string) => {
    if (selectedOpportunities.includes(id)) {
      setSelectedOpportunities(selectedOpportunities.filter((item) => item !== id));
    } else {
      setSelectedOpportunities([...selectedOpportunities, id]);
    }
  };

  const toolIndexSlug = t('slugs.tool.index');
  const linksOnLeft = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.goals')}`,
      text: t('goals'),
      icon: <GrTarget size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.competences')}`,
      text: t('competences'),
      icon: <MdOutlineSchool size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.interests')}`,
      text: t('interests'),
      icon: <MdOutlineInterests size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.restrictions')}`,
      text: t('restrictions'),
      icon: <MdBlock size={32} />,
    },
  ];
  const linkOnRight = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.instructions')}`,
      text: t('instructions'),
      icon: <MenuBookIcon size={32} />,
    },
  ];

  const Desktop = () => {
    return (
      <div className="flex justify-between">
        <ul className="m-0 space-x-[16px] p-0">
          {linksOnLeft.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
        </ul>
        <ul className="m-0 space-x-[25px] p-0">
          {linkOnRight.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const Mobile = () => {
    return (
      <div className="flex">
        <ul className="m-0 space-x-[8px] p-0 flex flex-1 justify-between">
          {linksOnLeft.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
          {linkOnRight.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <main role="main" className="mx-auto max-w-[1140px] p-5" id="jod-main">
      <Title value={t('tool.title')} />
      <nav role="navigation">{sm ? <Desktop /> : <Mobile />}</nav>
      <Outlet
        context={
          {
            competences: [selectedCompetences, setSelectedCompetences],
            interests: [selectedInterests, setSelectedInterests],
          } satisfies ContextType
        }
      />

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        <div className="col-span-1 sm:col-span-3">
          <div className="mt-10 flex flex-col sm:mt-11 sm:flex-row">
            <span className="text-body-md font-arial text-black font-medium sm:text-body-lg sm:font-poppins">
              {t('tool.competences.available-options')}{' '}
              <span className="text-heading-3 font-bold">
                {t('tool.competences.available-options-totals', { professionsCount, educationsCount })}
              </span>
            </span>
          </div>
        </div>

        <div className="col-span-1 mt-10 flex flex-col sm:col-span-3 sm:mt-9 sm:flex-row">
          <span className="text-body-md font-arial text-black font-medium sm:text-body-lg sm:font-poppins">
            {t('tool.competences.adjust-data-emphasis')}
          </span>
        </div>

        <div className="col-span-1 mt-6 grid grid-cols-1 gap-7 sm:col-span-3 sm:mt-5 sm:grid-cols-3">
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

        <div className="col-span-1 mt-10 sm:col-span-2 sm:mt-8">
          {!sm && (
            <>
              <div className="mb-2 flex flex-row justify-between">
                <span className="mr-5 text-heading-3 text-black">Tuloslista</span>
                <RoundButton
                  size="sm"
                  bgColor="white"
                  label="Näytä suodattimet"
                  hideLabel
                  onClick={() => setShowFilters(true)}
                  icon={<MdTune size={24} />}
                />

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
              const tyomahdollisuus = item as Tyomahdollisuus;
              return (
                <NavLink
                  key={tyomahdollisuus.id}
                  to={`/${i18n.language}/${t('slugs.job-opportunity.index')}/${tyomahdollisuus.id}`}
                >
                  <OpportunityCard
                    toggleSelection={() => toggleOpportunity(tyomahdollisuus.id ?? '')}
                    selected={selectedOpportunities.includes(tyomahdollisuus.id ?? '')}
                    name={tyomahdollisuus.otsikko[i18n.language] ?? ''}
                    description={tyomahdollisuus.tiivistelma?.[i18n.language] ?? ''}
                    matchValue={tyomahdollisuusEhdotukset?.[item.id].pisteet}
                    matchLabel="Sopivuus"
                    type="work"
                    trend={tyomahdollisuusEhdotukset?.[item.id].trendi}
                    employmentOutlook={tyomahdollisuusEhdotukset?.[item.id].tyollisyysNakyma ?? 0}
                    hasRestrictions
                    industryName="Lorem ipsum dolor"
                    mostCommonEducationBackground="Lorem ipsum dolor"
                  />
                </NavLink>
              );
            })}
          </div>
        </div>
        {sm && (
          <div className="col-span-1 sm:mt-8">
            <Filters industry={industry} setIndustry={setIndustry} order={order} setOrder={setOrder} isMobile={sm} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Tool;
