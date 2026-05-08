import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { Button, useMediaQueries } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import tmtLogo from '@/../assets/tyomarkkinatori.svg';
import { AiInfo } from '@/components/AiInfo/AiInfo';
import { CompareCompetencesTable } from '@/components/CompareTable/CompareCompetencesTable';
import { CounselingCard } from '@/components/CounselingCard/CounselingCard';
import { JobJakaumaList } from '@/components/JakaumaList/JakaumaList';
import OpportunityDetails, { type OpportunityDetailsSection } from '@/components/OpportunityDetails/OpportunityDetails';
import { RateContent } from '@/components/RateContent/RateContent';
import { NOT_AVAILABLE_LABEL } from '@/constants';
import Suomi from '@/routes/JobOpportunity/Suomi.tsx';
import { useIsLoggedIn } from '@/stores/useSessionManagerStore';
import { useToolStore } from '@/stores/useToolStore';
import { getLocalizedText, getTranslation, hashString, normalizeMultilineText } from '@/utils';
import { getEducationCodesetValues } from '@/utils/codes/codes.ts';
import { getLinkTo } from '@/utils/routeUtils';

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
  const { tyomahdollisuus, osaamiset, ammattiryhma, profiiliOsaamisetUris } = useLoaderData<LoaderData>();
  const isLoggedIn = useIsLoggedIn();
  const kartoitetutOsaamisetUris = useToolStore(
    useShallow((state) => state.osaamiset.map((osaaminen) => osaaminen.id)),
  );
  const competencesTableData = React.useMemo(
    () =>
      osaamiset.map((competence) => ({
        ...competence,
        profiili: kartoitetutOsaamisetUris.includes(competence.uri) || profiiliOsaamisetUris.includes(competence.uri),
        esiintyvyys: tyomahdollisuus.jakaumat?.osaaminen?.arvot.find((arvo) => arvo.arvo === competence.uri)?.osuus,
      })),
    [osaamiset, kartoitetutOsaamisetUris, profiiliOsaamisetUris, tyomahdollisuus.jakaumat],
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
    void fetchKoulutusalat();
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
    void fetchMaakunnat();
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
    void fetchKoulutusasteet();
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
        <p className="font-arial text-body-md whitespace-pre-line">
          {normalizeMultilineText(getLocalizedText(tyomahdollisuus?.kuvaus))}
        </p>
      ),
    },
    {
      navTitle: t('job-opportunity.most-common-job-tasks.title'),
      showDivider: false,
      showAiInfoInTitle: true,
      content: (
        <ul className="ml-7 list-disc">
          {tyomahdollisuusTehtavat.map((value: string, index: number) => (
            <li
              key={`${hashString(value)}-${index}`}
              className="text-capitalize font-arial text-body-md text-primary-gray"
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
        <div className="mb-9 flex grow flex-col gap-6">
          <span className="font-arial">{t('job-opportunity.competences.description')}</span>
          <CompareCompetencesTable rows={competencesTableData} />
          {!lg && (
            <RateContent
              variant={tyomahdollisuus.aineisto === 'TMT' ? 'tyomahdollisuus' : 'ammatti'}
              area="Työmahdollisuus"
            />
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
              <div className="my-4 flex flex-col justify-around gap-9 text-center sm:my-8 sm:flex-row">
                <div>
                  <h4 className="text-heading-1-mobile text-accent sm:text-heading-1">
                    {tyomahdollisuus?.ammattiryhma?.alinDesiiliPalkka ?? NOT_AVAILABLE_LABEL} €
                  </h4>
                  <p>{t('job-opportunity.salary-data.lowest-decile')}</p>
                </div>

                <div>
                  <h4 className="text-heading-1-mobile text-accent sm:text-heading-1">
                    {tyomahdollisuus?.ammattiryhma?.mediaaniPalkka ?? NOT_AVAILABLE_LABEL} €
                  </h4>
                  <p>{t('job-opportunity.salary-data.median')}</p>
                </div>

                <div>
                  <h4 className="text-heading-1-mobile text-accent sm:text-heading-1">
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
                    className="inline-flex items-center text-accent underline"
                    target="_blank"
                  />
                ),
              }}
            />
          </p>

          {tyomahdollisuus?.ammattiryhma ? (
            <div className="lg:gap-12 mt-7 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Row 1: Supply and Demand - Full width */}
              <div className="col-start-1 max-w-full lg:col-span-2">
                <div className="flex w-full flex-col">
                  <p className="font-bold">{t('job-opportunity.employment-data.supply-and-demand')}</p>
                  <h3 className="mt-3 max-w-full text-heading-1-mobile break-words text-accent sm:text-heading-1">
                    {kohtaanto}
                  </h3>
                  <span className="max-w-full text-secondary-gray">
                    <Trans
                      i18nKey="job-opportunity.employment-data.supply-and-demand-subtitle"
                      components={{
                        Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
                        CustomLink: (
                          <Link
                            to={'https://tyomarkkinatori.fi/henkiloasiakkaat'}
                            className="inline-flex items-center text-accent underline"
                            target="_blank"
                          />
                        ),
                      }}
                    />
                  </span>
                </div>
              </div>

              {/* Left Column - Employed + Region */}
              <div className="w-full max-w-full space-y-8 lg:col-span-1">
                {/* Employed amount */}
                <div className="flex w-full flex-col">
                  <p className="font-bold">{t('job-opportunity.employment-data.employed-title')}</p>
                  <h3 className="mt-3 text-heading-1-mobile break-words text-accent sm:text-heading-1">
                    {tyomahdollisuus?.ammattiryhma?.tyollisyysData?.tyollisetKokoMaa ?? NOT_AVAILABLE_LABEL}
                  </h3>
                </div>

                {/* Region */}
                <div className="flex w-full flex-col">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-region')}</p>
                  <Suomi data={maakunnat} />
                </div>
              </div>

              {/* Right Column - Education data */}
              <div className="w-full max-w-full space-y-8 lg:col-span-1">
                {/* Education field */}
                <div className="flex w-full flex-col">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-koulutusala')}</p>
                  <div className="w-full space-y-2">
                    {koulutusalat
                      .slice()
                      .sort((a, b) => b.osuus - a.osuus)
                      .filter((ka) => ka.osuus > 0)
                      .map((ka) => (
                        <div key={`${ka.title}-${ka.osuus}`} className="flex w-full items-center py-2">
                          <span className="font-semibold min-w-[80px] text-heading-3 text-accent">{ka.osuus}%</span>
                          <span className="ml-3 flex-1 break-words">{ka.title}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Education level */}
                <div className="flex w-full flex-col">
                  <p className="font-bold mb-3">{t('job-opportunity.employment-data.employed-by-koulutusaste')}</p>
                  <div className="w-full space-y-2">
                    {koulutusasteet
                      .slice()
                      .sort((a, b) => b.osuus - a.osuus)
                      .filter((ka) => ka.osuus > 0)
                      .map((ka) => (
                        <div key={`${ka.title}-${ka.osuus}`} className="flex w-full items-center py-2">
                          <span className="font-semibold min-w-[80px] text-heading-3 text-accent">{ka.osuus}%</span>
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
        <div className="flex w-full flex-col">
          <div
            className="mb-7 flex flex-col gap-6 bg-white p-6 lg:mb-9"
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
        <div className="mb-9 flex w-full flex-col" data-testid="job-opportunity-tmt-section">
          <div className="mb-7 flex h-9 items-center bg-[#442496] pl-4">
            <img src={tmtLogo} alt={t('job-opportunity.tyomarkkinatori.banner-alt-text')} className="h-7" />
          </div>
          <h3 className="mb-4 text-heading-2">{t('job-opportunity.tyomarkkinatori.title')}</h3>
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
      mahdollisuusTyyppi="TYOMAHDOLLISUUS"
      sections={sections}
      showAiInfoInTitle={tyomahdollisuus.aineisto === 'TMT'}
    />
  );
};

export default JobOpportunity;
