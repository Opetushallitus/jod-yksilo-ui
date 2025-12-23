import { ActionButton, ExperienceTable, MainLayout, OpportunityCard } from '@/components';
import { IconHeading } from '@/components/IconHeading';
import { ScrollHeading } from '@/components/ScrollHeading/ScrollHeading';
import { getLocalizedText } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Accordion, Button, type MenuSection, PageNavigation, Tag, useMediaQueries } from '@jod/design-system';
import { JodArrowRight, JodInfo, JodPrint, JodUser } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { getTypeSlug } from '../Profile/utils';
import type { TypedMahdollisuus } from '../types';
import { ContentSection } from './ContentSection';
import type { CvLoaderData } from './loader';

// Component to insert a page break when printing. There is a known and long-standing issue with Firefox where
// page breaks do not work as expected, so page breaks are omitted in Firefox by using break-after-auto class.
const PageBreak = () => {
  const isFirefox = typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
  return <div className={isFirefox ? 'print:break-after-auto' : 'print:break-after-page'} aria-hidden />;
};

const BasicInfoDetail = ({ data, title }: { data?: string | number; title: string }) =>
  data ? (
    <div className="flex flex-wrap">
      <dt className="after:content-[':'] after:mr-2">{title}</dt>
      <dd className="text-secondary-1-dark-2">{`${data}`}</dd>
    </div>
  ) : null;

const Cv = () => {
  const { t, i18n } = useTranslation();
  const { lg } = useMediaQueries();
  const [isPrinting, setIsPrinting] = React.useState(false);

  React.useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const {
    ammattiryhmaNimet,
    data,
    firstSuosikkiId,
    firstTavoiteId,
    kiinnostavatAmmatit,
    kiinnostavatOsaamiset,
    kiinnostuksetVapaateksti,
    kotikunta,
    koulutusSuosikit,
    koulutusTableRows,
    muuOsaaminen,
    muuOsaaminenVapaateksti,
    tavoitteet,
    toiminnotTableRows,
    tyopaikkaSuosikit,
    tyopaikkaTableRows,
    voimassaAsti,
  } = useLoaderData<CvLoaderData>();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const personName = React.useMemo(() => {
    if (data?.etunimi ?? data?.sukunimi) {
      return `${data?.etunimi ?? ''} ${data?.sukunimi ?? ''}`.trim();
    } else {
      return undefined;
    }
  }, [data?.etunimi, data?.sukunimi]);

  const hasAnyBasicInfo = Boolean(personName || data?.syntymavuosi || data?.email || kotikunta);
  const hasAnyOsaaminen = Boolean(
    data?.tyopaikat?.length ||
      data?.koulutusKokonaisuudet?.length ||
      data?.toiminnot?.length ||
      muuOsaaminen?.length ||
      getLocalizedText(muuOsaaminenVapaateksti),
  );
  const hasAnyKiinnostukset = Boolean(
    kiinnostavatOsaamiset?.length || kiinnostavatAmmatit?.length || getLocalizedText(kiinnostuksetVapaateksti),
  );
  const hasAnySuosikit = Boolean(tyopaikkaSuosikit?.length || koulutusSuosikit?.length);
  const hasAnyTavoitteet = Boolean(tavoitteet && tavoitteet.length > 0);

  const availableMenuItemLabels = React.useMemo(
    () =>
      [
        hasAnyBasicInfo ? t('cv.basic-info.title') : null,
        hasAnyOsaaminen ? t('cv.competence.title') : null,
        hasAnyKiinnostukset ? t('cv.interests.title') : null,
        hasAnySuosikit ? t('cv.favorites.title') : null,
        hasAnyTavoitteet ? t('cv.goals.title') : null,
      ].filter(Boolean) as string[],
    [hasAnyBasicInfo, hasAnyOsaaminen, hasAnyKiinnostukset, hasAnySuosikit, hasAnyTavoitteet, t],
  );

  const menuSection: MenuSection = React.useMemo(
    () => ({
      title: t('on-this-page'),
      linkItems: availableMenuItemLabels.map((label) => ({
        label,
        linkComponent: getLinkTo(`#${label}`),
      })),
    }),
    [availableMenuItemLabels, t],
  );
  const title = t('cv.title');

  const printButton = (
    <ActionButton
      label={t('print')}
      icon={<JodPrint className="text-accent" />}
      onClick={() => {
        if (isPrinting) {
          return;
        }
        setIsPrinting(true);
        setTimeout(() => {
          globalThis.print();
        });
      }}
    />
  );
  const osaamispolkuBox = (
    <div className="flex flex-col rounded-lg p-6 gap-5 bg-secondary-1-dark-2 print:hidden">
      <div className="text-heading-2 text-white mr-2">{t('osaamispolku')}</div>
      <p className="text-body-lg text-white">{t('cv.osaamispolku-description')}</p>
      <div className="mt-4">
        <Button
          label={t('cv.move-to-service')}
          variant="white"
          size="lg"
          linkComponent={getLinkTo(`/${i18n.language}`)}
          iconSide="right"
          testId="go-to-osaamispolku-button"
          icon={<JodArrowRight />}
        />
      </div>
    </div>
  );

  const renderOpportunityCard = (mahdollisuus: TypedMahdollisuus) => (
    <OpportunityCard
      collapsible
      initiallyCollapsed={!isPrinting && mahdollisuus.id !== firstSuosikkiId}
      key={mahdollisuus.id}
      hideFavorite
      description={getLocalizedText(mahdollisuus.tiivistelma)}
      to={`/${i18n.language}/${getTypeSlug(mahdollisuus.mahdollisuusTyyppi)}/${mahdollisuus.id}`}
      ammattiryhma={mahdollisuus?.ammattiryhma}
      ammattiryhmaNimet={ammattiryhmaNimet}
      name={getLocalizedText(mahdollisuus.otsikko)}
      aineisto={mahdollisuus.aineisto}
      tyyppi={mahdollisuus.tyyppi}
      type={mahdollisuus.mahdollisuusTyyppi}
      kesto={mahdollisuus.kesto}
      yleisinKoulutusala={mahdollisuus.yleisinKoulutusala}
    />
  );

  return (
    <MainLayout
      hideBreadcrumb
      navChildren={
        <div className="flex flex-col gap-5">
          {menuSection.linkItems.length > 0 && <PageNavigation menuSection={menuSection} activeIndicator="dot" />}
          {osaamispolkuBox}
        </div>
      }
    >
      <title>{title}</title>
      <IconHeading icon={<JodUser />} title={title} testId="cv-title" />

      {!lg && <div className="mb-6 print:hidden">{printButton}</div>}

      {!lg && menuSection.linkItems.length > 0 && (
        <div className="mb-8 print:hidden">
          <PageNavigation menuSection={menuSection} collapsed />
        </div>
      )}

      {/* Basic info box */}
      {hasAnyBasicInfo && (
        <>
          <ScrollHeading title={t('cv.basic-info.title')} heading="h2" className="text-transparent text-[0px] size-0" />
          <div className="bg-bg-gray-2 p-5 rounded-md flex flex-row mb-6">
            <div className="shrink-1 items-start pr-5">
              <JodInfo className="text-secondary-1-dark-2" />
            </div>
            <dl className="flex flex-col sm:text-heading-4 text-heading-4-mobile flex-wrap">
              <BasicInfoDetail data={personName} title={t('cv.basic-info.person')} />
              <BasicInfoDetail data={data?.syntymavuosi} title={t('cv.basic-info.birthyear')} />
              <BasicInfoDetail data={data?.email} title={t('cv.basic-info.email')} />
              <BasicInfoDetail data={kotikunta} title={t('cv.basic-info.home-city')} />
            </dl>
          </div>
        </>
      )}

      {/* Ingress */}
      {lg && <div className="sm:text-body-lg text-body-lg-mobile mb-6">{t('cv.ingress', { date: voimassaAsti })}</div>}

      {/* Action bar */}
      {lg && !!globalThis.print && <div className="flex justify-end items-center mb-8 print:hidden">{printButton}</div>}

      {/* Osaaminen */}
      {hasAnyOsaaminen && (
        <ContentSection title={t('cv.competence.title')}>
          <div className="mb-6 sm:text-body-md text-body-md-mobile font-arial">{t('cv.competence.description')}</div>

          {/* Työpaikat */}
          {data?.tyopaikat && data.tyopaikat.length > 0 && (
            <div className="mb-8">
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.competence.work')}</h3>
              <div>
                <ExperienceTable
                  rows={tyopaikkaTableRows}
                  isPrinting={isPrinting}
                  mainColumnHeader={t('work-history.workplace-or-job-description')}
                  ariaLabel={t('cv.competence.work')}
                />
              </div>
            </div>
          )}

          {data.tyopaikat && data.tyopaikat.length > 0 && <PageBreak />}

          {/* Koulutukset */}
          {data?.koulutusKokonaisuudet && data.koulutusKokonaisuudet.length > 0 && (
            <div className="mb-8">
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.competence.education')}</h3>
              <div>
                <ExperienceTable
                  rows={koulutusTableRows}
                  isPrinting={isPrinting}
                  mainColumnHeader={t('education-history.education-provider-or-education')}
                  ariaLabel={t('cv.competence.education')}
                />
              </div>
            </div>
          )}

          {data?.koulutusKokonaisuudet && data.koulutusKokonaisuudet.length > 0 && <PageBreak />}

          {/* Vapaa-ajan toiminnot */}
          {data?.toiminnot && data.toiminnot.length > 0 && (
            <div className="mb-8">
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.competence.activities')}</h3>
              <div>
                <ExperienceTable
                  rows={toiminnotTableRows}
                  isPrinting={isPrinting}
                  mainColumnHeader={t('free-time-activities.theme-or-activity')}
                  ariaLabel={t('cv.competence.activities')}
                />
              </div>
            </div>
          )}

          {data?.toiminnot && data.toiminnot.length > 0 && <PageBreak />}
          {/* Muu osaaminen */}
          {((Array.isArray(data?.muuOsaaminen?.muuOsaaminen) && data?.muuOsaaminen?.muuOsaaminen.length > 0) ||
            data?.muuOsaaminen?.vapaateksti) && (
            <>
              <h3 className="text-heading-2 mb-5">{t('cv.competence.something-else')}</h3>
              <div className="border-b-2 border-border-gray pb-3 mb-5">{t('cv.competence.title')}</div>
              <div className="mb-8">
                <ul className="flex flex-row flex-wrap gap-3">
                  {muuOsaaminen.map((osaaminen) => (
                    <li key={osaaminen.uri}>
                      <Tag label={getLocalizedText(osaaminen.nimi)} variant="presentation" sourceType="jotain-muuta" />
                    </li>
                  ))}
                </ul>
              </div>

              {getLocalizedText(muuOsaaminenVapaateksti) && (
                <div className="mb-8">
                  <h4 className="sm:text-heading-3 text-heading-3-mobile mb-4">
                    {t('cv.competence.something-else-freetext')}
                  </h4>
                  <p className="sm:text-body-md text-body-md-mobile font-arial">
                    {getLocalizedText(muuOsaaminenVapaateksti)}
                  </p>
                </div>
              )}
            </>
          )}
        </ContentSection>
      )}

      {(data?.muuOsaaminen?.muuOsaaminen?.length || !!data?.muuOsaaminen?.vapaateksti) && <PageBreak />}

      {/* Kiinnostukset */}
      {hasAnyKiinnostukset && (
        <ContentSection title={t('cv.interests.title')} isPrinting={isPrinting}>
          <p className="mb-8 sm:text-body-md text-body-md-mobile font-arial">{t('cv.interests.description')}</p>

          {kiinnostavatOsaamiset && kiinnostavatOsaamiset.length > 0 && (
            <>
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.interests.competences')}</h3>
              <div className="mb-8">
                <ul className="flex flex-row flex-wrap gap-3">
                  {kiinnostavatOsaamiset?.map((osaaminen) => (
                    <li key={osaaminen.uri}>
                      <Tag label={getLocalizedText(osaaminen.nimi)} variant="presentation" sourceType="kiinnostus" />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {kiinnostavatAmmatit && kiinnostavatAmmatit.length > 0 && (
            <>
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.interests.occupations')}</h3>
              <div className="mb-8">
                <ul className="flex flex-row flex-wrap gap-3">
                  {kiinnostavatAmmatit?.map((ammatti) => (
                    <li key={ammatti.uri}>
                      <Tag label={getLocalizedText(ammatti.nimi)} variant="presentation" sourceType="kiinnostus" />
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {getLocalizedText(kiinnostuksetVapaateksti) && (
            <div>
              <h4 className="sm:text-heading-3 text-heading-3-mobile mb-4">{t('cv.interests.freetext')}</h4>
              <p className="sm:text-body-md text-body-md-mobile font-arial">
                {getLocalizedText(kiinnostuksetVapaateksti)}
              </p>
            </div>
          )}
        </ContentSection>
      )}

      {hasAnyKiinnostukset && <PageBreak />}

      {/* Suosikit */}
      {hasAnySuosikit && (
        <ContentSection title={t('cv.favorites.title')} className="my-8">
          <p className="mb-8">{t('cv.favorites.description')}</p>

          {tyopaikkaSuosikit && tyopaikkaSuosikit.length > 0 && (
            <>
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">{t('cv.favorites.job-opportunities')}</h3>
              <div className="flex flex-col gap-4 mb-8">{tyopaikkaSuosikit.map(renderOpportunityCard)}</div>
              <PageBreak />
            </>
          )}

          {koulutusSuosikit && koulutusSuosikit.length > 0 && (
            <>
              <h3 className="sm:text-heading-3 text-heading-3-mobile mb-5">
                {t('cv.favorites.education-opportunities')}
              </h3>
              <div className="flex flex-col gap-4">{koulutusSuosikit.map(renderOpportunityCard)}</div>
              <PageBreak />
            </>
          )}
        </ContentSection>
      )}

      {tavoitteet && tavoitteet.length > 0 && (
        <ContentSection title={t('cv.goals.title')} className="my-8">
          <div className="flex flex-col gap-4">
            {tavoitteet.map((tavoite) => {
              const mahdollisuus = tavoitteet.find((tm) => tm.id === tavoite.id)?.tavoiteDetails;
              const summary = (
                <div className="font-arial text-body-md text-primary-gray mb-5">{getLocalizedText(tavoite.kuvaus)}</div>
              );
              return (
                <React.Fragment key={tavoite.id}>
                  <Accordion
                    title={getLocalizedText(tavoite.tavoite)}
                    ariaLabel={getLocalizedText(tavoite.tavoite)}
                    collapsedContent={summary}
                    initialState={isPrinting || tavoite.id === firstTavoiteId}
                    isOpen={isPrinting || undefined}
                  >
                    <div className="-mt-2">{summary}</div>
                    {renderOpportunityCard(mahdollisuus!)}

                    {tavoite.suunnitelmat && tavoite.suunnitelmat.length > 0 && (
                      <div className="mt-8">
                        <h2 className="sm:text-heading-2 text-heading-2-mobile mb-4">{t('cv.goals.options')}</h2>
                        {tavoite.suunnitelmat?.map((s, index) => (
                          <div
                            key={s.id}
                            className="sm:text-heading-4-lg text-heading-4-mobile not-last:border-b-2 not-last:border-border-gray py-4"
                          >
                            <div className="flex items-center">
                              <span className="text-primary-gray after:content-[':'] after:mr-2">
                                {alphabet[index % alphabet.length]}
                              </span>
                              <span className="text-primary-gray">{getLocalizedText(s.nimi)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Accordion>
                </React.Fragment>
              );
            })}
          </div>
        </ContentSection>
      )}
      {!lg && osaamispolkuBox}
    </MainLayout>
  );
};

export default Cv;
