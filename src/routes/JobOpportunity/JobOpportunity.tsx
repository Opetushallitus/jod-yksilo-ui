import tmtLogo from '@/../assets/tyomarkkinatori.svg';
import { AiInfo } from '@/components/AiInfo/AiInfo';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { CounselingCard } from '@/components/CounselingCard/CounselingCard';
import { JobJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { RateAiContent } from '@/components/RateAiContent/RateAiContent';
import { NOT_AVAILABLE_LABEL } from '@/constants';
import Suomi from '@/routes/JobOpportunity/Suomi.tsx';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, getTranslation, hashString, normalizeMultilineText } from '@/utils';
import { getEducationCodesetValues } from '@/utils/codes/codes.ts';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { LoaderData } from './loader';

interface Koulutusala {
  title: string;
  osuus: number;
}

interface KoulutusasteTyollisyys {
  title: string;
  osuus: number;
}

export interface MaakuntaTyollisyys {
  code: string;
  osuus: number;
}

const koulutusalaPrefix = 'kansallinenkoulutusluokitus2016koulutusalataso1_';
const koulutusastePrefix = 'kansallinenkoulutusluokitus2016koulutusastetaso1_';
const JobOpportunity = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { lg } = useMediaQueries();
  const { tyomahdollisuus, osaamiset, isLoggedIn, ammattiryhma } = useLoaderData<LoaderData>();
  const omatOsaamisetUris = useToolStore(useShallow((state) => state.osaamiset.map((osaaminen) => osaaminen.id)));
  const competencesTableData = React.useMemo(
    () =>
      osaamiset.map((competence) => ({
        ...competence,
        profiili: omatOsaamisetUris?.includes(competence.uri),
        esiintyvyys: tyomahdollisuus.jakaumat?.osaaminen?.arvot.find((arvo) => arvo.arvo === competence.uri)?.osuus,
      })),
    [osaamiset, omatOsaamisetUris, tyomahdollisuus.jakaumat],
  );
  const [koulutusalat, setKoulutusalat] = React.useState<Koulutusala[]>([]);
  const [koulutusasteet, setKoulutusasteet] = React.useState<Koulutusala[]>([]);
  const [maakunnat, setMaakunnat] = React.useState<MaakuntaTyollisyys[]>([]);

  React.useEffect(() => {
    const fetchKoulutusalat = async () => {
      if (!tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusalaTyollisyydet) {
        return;
      }
      const res = await getEducationCodesetValues(
        tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusalaTyollisyydet?.map(
          (ka) => koulutusalaPrefix + ka.koodi,
        ),
      );
      const newKoulutusalat: Koulutusala[] = res.map((ka) => {
        let title = ka.value;
        const koodi = ka.code.replace(koulutusalaPrefix, '');
        const osuus =
          // eslint-disable-next-line sonarjs/no-nested-functions
          tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusalaTyollisyydet?.find((kat) => kat.koodi === koodi)
            ?.osuus ?? 0;
        if (title === koulutusalaPrefix + '-2') {
          title = t('job-opportunity.employment-data.unknown-ala');
        }
        return { title, osuus };
      });

      setKoulutusalat(newKoulutusalat);
    };
    setKoulutusalat([]);
    fetchKoulutusalat();
  }, [tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusalaTyollisyydet, t]);

  React.useEffect(() => {
    const fetchMaakunnat = async () => {
      if (!tyomahdollisuus.ammattiryhma?.tyollisyysData?.maakuntaTyollisyydet) {
        setMaakunnat([]);
        return;
      }
      const promises = tyomahdollisuus.ammattiryhma.tyollisyysData.maakuntaTyollisyydet.map(async (ka) => {
        return { code: ka.maakuntaKoodi ?? '', osuus: ka.osuus ?? 0 };
      });

      const maakuntaTyollisyydet = (await Promise.all(promises)) ?? [];
      setMaakunnat(maakuntaTyollisyydet);
    };
    fetchMaakunnat();
  }, [language, t, tyomahdollisuus.ammattiryhma?.tyollisyysData?.maakuntaTyollisyydet]);

  React.useEffect(() => {
    const fetchKoulutusasteet = async () => {
      if (!tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusasteTyollisyydet) {
        return;
      }
      const res = await getEducationCodesetValues(
        tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusasteTyollisyydet?.map(
          (ka) => koulutusastePrefix + ka.koulutusasteKoodi,
        ),
      );
      const newKoulutusasteet: KoulutusasteTyollisyys[] = res.map((ka) => {
        let title = ka.value;
        const koodi = ka.code.replace(koulutusastePrefix, '');
        const osuus =
          tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusasteTyollisyydet?.find(
            // eslint-disable-next-line sonarjs/no-nested-functions
            (kat) => kat.koulutusasteKoodi === koodi,
          )?.osuus ?? 0;
        if (title === koulutusastePrefix + '-2') {
          title = t('job-opportunity.employment-data.unknown-ala');
        }
        return { title, osuus };
      });
      setKoulutusasteet(newKoulutusasteet);
    };
    setKoulutusasteet([]);
    fetchKoulutusasteet();
  }, [tyomahdollisuus.ammattiryhma?.tyollisyysData?.koulutusasteTyollisyydet, t]);

  const tyomahdollisuusTehtavat =
    getTranslation(tyomahdollisuus?.tehtavat) !== ''
      ? getTranslation(tyomahdollisuus?.tehtavat)
          .split('\n')
          .sort((a: string, b: string) => a.localeCompare(b))
      : [];

  const tmtUrl = React.useMemo(() => {
    const url = new URL(t('job-opportunity.tyomarkkinatori.url'));

    if (ammattiryhma?.koodi) {
      url.searchParams.set('in', ammattiryhma.koodi);
    }

    return url.href;
  }, [ammattiryhma, t]);

  let kohtaanto;
  switch (tyomahdollisuus?.ammattiryhma?.kohtaanto) {
    case 'Ylitarjonta':
      kohtaanto = t('job-opportunity.supply-and-demand.Ylitarjonta');
      break;
    case 'Tasapaino':
      kohtaanto = t('job-opportunity.supply-and-demand.Tasapaino');
      break;
    case 'Alitarjonta':
      kohtaanto = t('job-opportunity.supply-and-demand.Alitarjonta');
      break;
    default:
      kohtaanto = NOT_AVAILABLE_LABEL; // or some default value
  }

  const sections: OpportunityDetailsSection[] = [
    {
      navTitle: t('description'),
      showDivider: false,
      showAiInfoInTitle: true,
      content: (
        <p className="text-body-md font-arial whitespace-pre-line">
          {normalizeMultilineText(getLocalizedText(tyomahdollisuus?.kuvaus))}
        </p>
      ),
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      showDivider: false,
      showAiInfoInTitle: true,
      content: (
        <ul className="list-disc ml-7">
          {tyomahdollisuusTehtavat.map((value: string, index: number) => (
            <li
              // eslint-disable-next-line react/no-array-index-key
              key={`${hashString(value)}-${index}`}
              className="text-capitalize text-body-md font-arial text-primary-gray"
            >
              {value}
            </li>
          ))}
        </ul>
      ),
    },
    {
      navTitle: t('job-opportunity.competences.title'),
      showAiInfoInTitle: true,
      content: (
        <div className="flex flex-col gap-6 mb-9 grow">
          <span className="font-arial">{t('job-opportunity.competences.description')}</span>
          <CompareCompetencesTable rows={competencesTableData} />
          {!lg && (
            <>
              {tyomahdollisuus.aineisto === 'TMT' && <RateAiContent variant="tyomahdollisuus" area="Työmahdollisuus" />}
            </>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.professional-group'),
      titleAppendix: getTranslation(ammattiryhma?.nimi),
      content: <div className="font-arial">{getTranslation(ammattiryhma?.kuvaus)}</div>,
      showDivider: false,
    },
    {
      navTitle: t('job-opportunity.salary-data.title'),
      showDivider: false,
      showNavTitle: false,
      showAiInfoInTitle: false,
      content: (
        <div className="bg-white p-6">
          <div className="flex items-center">
            <h3 className="text-heading-3">{t('job-opportunity.salary-data.title')}</h3>
          </div>

          {tyomahdollisuus?.ammattiryhma ? (
            <>
              <div className="flex sm:flex-row flex-col justify-around text-center gap-9 sm:my-8 my-4">
                <div>
                  <h4 className="sm:text-heading-1 text-heading-1-mobile text-accent">
                    {tyomahdollisuus?.ammattiryhma?.alinDesiiliPalkka ?? NOT_AVAILABLE_LABEL} €
                  </h4>
                  <p>{t('job-opportunity.salary-data.lowest-decile')}</p>
                </div>

                <div>
                  <h4 className="sm:text-heading-1 text-heading-1-mobile text-accent">
                    {tyomahdollisuus?.ammattiryhma?.mediaaniPalkka ?? NOT_AVAILABLE_LABEL} €
                  </h4>
                  <p>{t('job-opportunity.salary-data.median')}</p>
                </div>

                <div>
                  <h4 className="sm:text-heading-1 text-heading-1-mobile text-accent">
                    {tyomahdollisuus?.ammattiryhma?.ylinDesiiliPalkka ?? NOT_AVAILABLE_LABEL} €
                  </h4>
                  <p>{t('job-opportunity.salary-data.highest-decile')}</p>
                </div>
              </div>

              <p>{t('job-opportunity.salary-data.description')}</p>
            </>
          ) : (
            <p>{t('job-opportunity.salary-data.not-available')}</p>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.employment-data.title'),
      showDivider: false,
      showNavTitle: false,
      showAiInfoInTitle: false,
      content: (
        <div className="bg-white p-6">
          <div className="flex justify-start">
            <h2 className="text-heading-2">{t('job-opportunity.employment-data.title')}</h2>
          </div>

          <p className="mt-3">
            <Trans
              i18nKey="job-opportunity.employment-data.description"
              components={{
                Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
                CustomLink: (
                  <Link
                    to={'https://osaamispolku.fi/tietopalvelu'}
                    className="inline-flex underline text-accent items-center"
                    target="_blank"
                  />
                ),
              }}
            />
          </p>

          {tyomahdollisuus?.ammattiryhma ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-7">
              {/* Row 1: Supply and Demand - Full width */}
              <div className="lg:col-span-2 col-start-1 max-w-full">
                <div className="flex flex-col w-full">
                  <p className="font-bold">{t('job-opportunity.employment-data.supply-and-demand')}</p>
                  <h3 className="sm:text-heading-1 text-heading-1-mobile mt-3 text-accent break-words max-w-full">
                    {kohtaanto}
                  </h3>
                  <span className="text-secondary-gray max-w-full">
                    <Trans
                      i18nKey="job-opportunity.employment-data.supply-and-demand-subtitle"
                      components={{
                        Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
                        CustomLink: (
                          <Link
                            to={'https://tyomarkkinatori.fi/henkiloasiakkaat'}
                            className="inline-flex underline text-accent items-center"
                            target="_blank"
                          />
                        ),
                      }}
                    />
                  </span>
                </div>
              </div>

              {/* Left Column - Employed + Region */}
              <div className="lg:col-span-1 space-y-8 w-full max-w-full">
                {/* Employed amount */}
                <div className="flex flex-col w-full">
                  <p className="font-bold">{t('job-opportunity.employment-data.employed-title')}</p>
                  <h3 className="sm:text-heading-1 text-heading-1-mobile mt-3 text-accent break-words">
                    {tyomahdollisuus?.ammattiryhma?.tyollisyysData?.tyollisetKokoMaa ?? NOT_AVAILABLE_LABEL}
                  </h3>
                </div>

                {/* Region */}
                <div className="flex flex-col w-full">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-region')}</p>
                  <Suomi data={maakunnat} />
                </div>
              </div>

              {/* Right Column - Education data */}
              <div className="lg:col-span-1 space-y-8 w-full max-w-full">
                {/* Education field */}
                <div className="flex flex-col w-full">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-koulutusala')}</p>
                  <div className="space-y-2 w-full">
                    {koulutusalat
                      .slice()
                      .sort((a, b) => b.osuus - a.osuus)
                      .filter((ka) => ka.osuus > 0)
                      .map((ka) => (
                        <div key={`${ka.title}-${ka.osuus}`} className="flex items-center py-2 w-full">
                          <span className="text-heading-3 text-accent font-semibold min-w-[80px]">{ka.osuus}%</span>
                          <span className="ml-3 flex-1 break-words">{ka.title}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Education level */}
                <div className="flex flex-col w-full">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-koulutusaste')}</p>
                  <div className="space-y-2 w-full">
                    {koulutusasteet
                      .slice()
                      .sort((a, b) => b.osuus - a.osuus)
                      .filter((ka) => ka.osuus > 0)
                      .map((ka) => (
                        <div key={`${ka.title}-${ka.osuus}`} className="flex items-center py-2 w-full">
                          <span className="text-heading-3 text-accent font-semibold min-w-[80px]">{ka.osuus}%</span>
                          <span className="ml-3 flex-1 break-words">{ka.title}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>{t('job-opportunity.salary-data.not-available')}</p>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.job-advertisement-characteristics'),
      showNavTitle: false,
      content: (
        <div className="flex flex-col w-full">
          <div
            className="bg-white p-6 flex flex-col gap-6 lg:mb-9 mb-7"
            data-testid="job-opportunity-statistics-section"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-heading-3">{t('job-opportunity.job-advertisement-characteristics')}</h3>
              <AiInfo />
            </div>
            <p className="font-arial">{t('job-opportunity.job-advertisement-characteristics-description')}</p>

            <div className="grid w-full grow grid-cols-2 gap-7">
              <JobJakaumaList name="tyonJatkuvuus" />
              <JobJakaumaList name="kielitaito" />
              <JobJakaumaList name="koulutusala" />
              <JobJakaumaList name="ajokortti" />
              <JobJakaumaList name="rikosrekisteriote" />
            </div>
          </div>
          {!lg && (
            <div className="mb-9">
              <CounselingCard />
            </div>
          )}
        </div>
      ),
    },
    {
      navTitle: t('job-opportunity.open-jobs'),
      showNavTitle: false,
      content: (
        <div className="flex flex-col w-full mb-9" data-testid="job-opportunity-tmt-section">
          <div className="bg-[#442496] h-9 flex items-center pl-4 mb-7">
            <img src={tmtLogo} alt={t('job-opportunity.tyomarkkinatori.banner-alt-text')} className="h-7" />
          </div>
          <h3 className="text-heading-2 mb-4">{t('job-opportunity.tyomarkkinatori.title')}</h3>
          <p>{t('job-opportunity.tyomarkkinatori.description')}</p>
          <div className="mt-7">
            <Button
              testId="job-opportunity-open-tyomarkkinatori"
              size="sm"
              label={t('job-opportunity.tyomarkkinatori.button-label')}
              icon={<JodOpenInNew ariaLabel={t('common:external-link')} />}
              iconSide="right"
              linkComponent={getLinkTo(tmtUrl, { useAnchor: true, target: '_blank' })}
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <OpportunityDetails
      data={tyomahdollisuus}
      isLoggedIn={isLoggedIn}
      tyyppi="TYOMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle={tyomahdollisuus.aineisto === 'TMT'}
    />
  );
};

export default JobOpportunity;
