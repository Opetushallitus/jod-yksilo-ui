import { OpportunityCard, OsaaminenValue, SimpleNavigationList, Title } from '@/components';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText } from '@/utils';
import {
  Button,
  Modal,
  PageChangeDetails,
  Pagination,
  RadioButton,
  RadioButtonGroup,
  RoundButton,
  Slider,
  Spinner,
  useMediaQueries,
} from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GrTarget } from 'react-icons/gr';
import { MdBlock, MdOutlineInterests, MdOutlineSchool, MdTune } from 'react-icons/md';
import { NavLink, Outlet, useLoaderData } from 'react-router-dom';
import MatchedLink from './MatchedLink';
import { ToolLoaderData } from './loader';
import { ContextType } from './types';

const MenuBookIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size}>
    <path
      fill="currentColor"
      d="M560-574v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-610q-38 0-73 9.5T560-574Zm0 220v-49q33-13.5 67.5-20.25T700-430q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-390q-38 0-73 9t-67 27Zm0-110v-48q33-14 67.5-21t72.5-7q26 0 51 4t49 10v44q-24-9-48.5-13.5T700-500q-38 0-73 9.5T560-464ZM248-300q53.57 0 104.28 12.5Q403-275 452-250v-427q-45-30-97.62-46.5Q301.76-740 248-740q-38 0-74.5 9.5T100-707v434q31-14 70.5-20.5T248-300Zm264 50q50-25 98-37.5T712-300q38 0 78.5 6t69.5 16v-429q-34-17-71.82-25-37.82-8-76.18-8-54 0-104.5 16.5T512-677v427Zm-30 90q-51-38-111-58.5T248-239q-36.54 0-71.77 9T106-208q-23.1 11-44.55-3Q40-225 40-251v-463q0-15 7-27.5T68-761q42-20 87.39-29.5 45.4-9.5 92.61-9.5 63 0 122.5 17T482-731q51-35 109.5-52T712-800q46.87 0 91.93 9.5Q849-781 891-761q14 7 21.5 19.5T920-714v463q0 27.89-22.5 42.45Q875-194 853-208q-34-14-69.23-22.5Q748.54-239 712-239q-63 0-121 21t-109 58ZM276-489Z"
    />
  </svg>
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
  const { t } = useTranslation();

  return (
    <div className="inline-flex flex-col gap-6 sm:gap-5 w-full">
      <SimpleNavigationList
        title={t('sort-all')}
        borderEnabled={isMobile}
        addPadding={isMobile}
        backgroundClassName={isMobile ? 'bg-bg-gray-2' : 'bg-bg-gray'}
      >
        <RadioButtonGroup value={order} onChange={setOrder} label={t('sort-all')} hideLabel>
          <RadioButton label={`TODO: ${t('fit-of-result')}`} value="a" />
          <RadioButton label={`TODO: ${t('development-trend')}`} value="b" />
          <RadioButton label={`TODO: ${t('employment-view')}`} value="c" />
        </RadioButtonGroup>
      </SimpleNavigationList>
      <SimpleNavigationList
        title={t('industry-job-opportunities')}
        borderEnabled={isMobile}
        addPadding={isMobile}
        backgroundClassName={isMobile ? 'bg-bg-gray-2' : 'bg-bg-gray'}
      >
        <RadioButtonGroup value={industry} onChange={setIndustry} label={t('industry-job-opportunities')} hideLabel>
          <RadioButton label="TODO: Toimiala x" value="x" />
          <RadioButton label="TODO: Toimiala y" value="y" />
        </RadioButtonGroup>
      </SimpleNavigationList>
    </div>
  );
};

const Tool = () => {
  const { osaamiset: osaamisetData, kiinnostukset, suosikit, isLoggedIn } = useLoaderData() as ToolLoaderData;
  const { sm } = useMediaQueries();
  const { t, i18n } = useTranslation();
  const toolStore = useToolStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [industry, setIndustry] = React.useState('x');
  const [order, setOrder] = React.useState('a');

  // placeholder states
  const [showFilters, setShowFilters] = React.useState(false);

  const initialized = React.useRef(false);
  React.useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (toolStore.tyomahdollisuudet.length === 0) {
        toolStore.setOsaamiset(
          osaamisetData.map(
            (osaaminen): OsaaminenValue => ({
              id: osaaminen.osaaminen.uri,
              nimi: osaaminen.osaaminen.nimi,
              kuvaus: osaaminen.osaaminen.kuvaus,
              tyyppi: osaaminen.lahde.tyyppi,
            }),
          ),
        );
        toolStore.setKiinnostukset(
          kiinnostukset.map((k) => ({
            id: k.uri,
            nimi: k.nimi,
            kuvaus: k.kuvaus,
            tyyppi: 'KIINNOSTUS',
          })),
        );
        toolStore.setSuosikit(suosikit);
        void updateEhdotukset();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateEhdotukset = async () => {
    await toolStore.updateEhdotuksetAndTyomahdollisuudet();
  };

  const toolIndexSlug = t('slugs.tool.index');
  const linksOnLeft = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.goals')}`,
      replace: true,
      text: t('goals'),
      icon: <GrTarget size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.competences')}`,
      replace: true,
      text: t('competences'),
      icon: <MdOutlineSchool size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.interests')}`,
      replace: true,
      text: t('interests'),
      icon: <MdOutlineInterests size={32} />,
    },
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.restrictions')}`,
      replace: true,
      text: t('restrictions'),
      icon: <MdBlock size={32} />,
    },
  ];
  const linkOnRight = [
    {
      to: `/${i18n.language}/${toolIndexSlug}/${t('slugs.tool.instructions')}`,
      replace: true,
      text: t('instructions'),
      icon: <MenuBookIcon size={32} />,
    },
  ];

  const Desktop = () => {
    return (
      <div className="-mx-5 flex justify-between">
        <ul className="p-0">
          {linksOnLeft.map((link) => (
            <li className="inline-block" key={link.text}>
              <MatchedLink link={link} />
            </li>
          ))}
        </ul>
        <ul className="p-0">
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

  const updateButtonLabel = toolStore.ehdotuksetLoading ? t('updating-list') : t('tool.update-job-opportunities-list');

  const onPageChange = async ({ page }: PageChangeDetails) => {
    if (toolStore.mahdollisuudetLoading) {
      return;
    }

    await toolStore.fetchMahdollisuudetPage(page);

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main role="main" className="mx-auto max-w-[1140px] p-5" id="jod-main">
      <Title value={t('tool.title')} />
      <nav role="navigation">{sm ? <Desktop /> : <Mobile />}</nav>
      <Outlet
        context={
          {
            competences: [toolStore.osaamiset, toolStore.setOsaamiset],
            interests: [toolStore.kiinnostukset, toolStore.setKiinnostukset],
          } satisfies ContextType
        }
      />

      <div className="mb-8 mt-5">
        <Button
          onClick={() => void updateEhdotukset()}
          label={updateButtonLabel}
          variant="accent"
          disabled={toolStore.ehdotuksetLoading}
          iconSide="left"
          icon={toolStore.ehdotuksetLoading ? <Spinner size={24} color="white" /> : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-3">
        <div className="col-span-1 sm:col-span-3">
          <div className="flex flex-col sm:flex-row">
            <span className="text-body-md text-black font-medium sm:text-body-lg">
              <h2 className="text-heading-2 mb-4 scroll-mt-[96px]" ref={scrollRef}>
                {t('tool.competences.opportunities-title')}
              </h2>
              {t('tool.competences.available-options-totals', {
                professionsCount: toolStore.ehdotuksetCount.TYOMAHDOLLISUUS,
                educationsCount: toolStore.ehdotuksetCount.KOULUTUSMAHDOLLISUUS,
              })}
            </span>
          </div>
        </div>

        <div className="col-span-1 mt-5 flex flex-col sm:col-span-3 sm:flex-row">
          <span className="text-body-md text-black font-medium sm:text-body-lg">
            {t('tool.competences.adjust-data-emphasis')}
          </span>
        </div>

        <div className="col-span-1 mt-6 gap-7 sm:col-span-3 sm:mt-5 flex flex-col sm:flex-row flex-wrap">
          <Slider
            label={t('competences')}
            rightLabel={t('interests')}
            onValueChange={(val) => toolStore.setOsaamisKiinnostusPainotus(val)}
            value={toolStore.osaamisKiinnostusPainotus}
          />
          <Slider
            label={`TODO: ${t('restrictions')}`}
            onValueChange={(val) => toolStore.setRajoitePainotus(val)}
            value={toolStore.rajoitePainotus}
          />
        </div>

        <div className="col-span-1 mt-10 sm:col-span-2 sm:mt-8">
          {!sm && (
            <>
              <div className="mb-2 flex flex-row justify-between">
                <span className="mr-5 text-heading-3 text-black">{t('result-list')}</span>
                <RoundButton
                  size="sm"
                  bgColor="white"
                  label={t('show-filters')}
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
              <span>{t('tool.filters-text')}</span>
            </>
          )}
          <div className="flex flex-col gap-5 mb-8">
            {toolStore.mixedMahdollisuudet.map((mahdollisuus) => {
              const { id, mahdollisuusTyyppi } = mahdollisuus;
              const ehdotus = toolStore.mahdollisuusEhdotukset?.[id];
              const isFavorite = toolStore.suosikit?.find((s) => s.suosionKohdeId === id) !== undefined;
              return ehdotus ? (
                <NavLink
                  key={id}
                  to={
                    mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
                      ? `/${i18n.language}/${t('slugs.job-opportunity.index')}/${id}/${t('slugs.job-opportunity.overview')}`
                      : `/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}/${t('slugs.education-opportunity.overview')}`
                  }
                >
                  <OpportunityCard
                    isFavorite={isFavorite}
                    isLoggedIn={isLoggedIn}
                    toggleFavorite={() => void toolStore.toggleSuosikki(id, ehdotus.tyyppi)}
                    name={getLocalizedText(mahdollisuus.otsikko)}
                    description={getLocalizedText(mahdollisuus.tiivistelma)}
                    matchValue={ehdotus?.pisteet}
                    matchLabel={t('fit')}
                    type={mahdollisuusTyyppi}
                    trend={ehdotus?.trendi}
                    employmentOutlook={ehdotus?.tyollisyysNakyma ?? 0}
                    hasRestrictions
                    industryName="TODO: Lorem ipsum dolor"
                    mostCommonEducationBackground="TODO: Lorem ipsum dolor"
                    compareTo={
                      mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'
                        ? {
                            pathname: `/${i18n.language}/${t('slugs.job-opportunity.index')}/${id}/${t('slugs.job-opportunity.overview')}`,
                            hash: t('job-opportunity.competences.title'),
                          }
                        : {
                            pathname: `/${i18n.language}/${t('slugs.education-opportunity.index')}/${id}/${t('slugs.education-opportunity.overview')}`,
                            hash: t('education-opportunity.competences.route'),
                          }
                    }
                  />
                </NavLink>
              ) : null;
            })}
          </div>

          {toolStore.tyomahdollisuudet.length > 0 && (
            <Pagination
              currentPage={toolStore.ehdotuksetPageNr}
              type="button"
              pageSize={toolStore.ehdotuksetPageSize}
              siblingCount={1}
              translations={{
                nextTriggerLabel: t('pagination.next'),
                prevTriggerLabel: t('pagination.previous'),
              }}
              totalItems={toolStore.ehdotuksetCount.KOULUTUSMAHDOLLISUUS + toolStore.ehdotuksetCount.TYOMAHDOLLISUUS}
              onPageChange={(data) => void onPageChange(data)}
            />
          )}
        </div>
        {sm && (
          <div className="col-span-1 sm:mt-8">
            <div className="sticky top-[96px] max-h-[calc(100vh-112px)] overflow-y-auto scrollbar-hidden">
              <Filters industry={industry} setIndustry={setIndustry} order={order} setOrder={setOrder} isMobile={sm} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Tool;
