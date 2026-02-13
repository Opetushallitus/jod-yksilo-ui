import { NOT_AVAILABLE_LABEL } from '@/constants';
import type { LoaderData as EducationLoaderData } from '@/routes/EducationOpportunity/loader';
import type { LoaderData as JobLoaderData } from '@/routes/JobOpportunity/loader';
import type {
  JakaumaDisplayValueTranslations,
  JakaumaKey,
  KoulutusmahdollisuusJakaumat,
  TyomahdollisuusJakaumat,
} from '@/routes/types';
import { parseBoolean } from '@/utils';
import {
  isBooleanJakaumaKey,
  isEducationCodeSetKey,
  isJakaumaLabelKey,
  isJobCodeSetKey,
  type EducationCodeSetValues,
  type JobCodesetValues,
} from '@/utils/jakaumaUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

interface EducationJakaumaListProps {
  jakaumat: KoulutusmahdollisuusJakaumat;
  name: JakaumaKey;
  codesetValues: EducationCodeSetValues;
  type: 'education';
}

interface JobJakaumaListProps {
  jakaumat: TyomahdollisuusJakaumat;
  name: JakaumaKey;
  codesetValues: JobCodesetValues;
  type: 'job';
}

type JakaumaListProps = EducationJakaumaListProps | JobJakaumaListProps;

const JakaumaList = ({ name, jakaumat, codesetValues, type }: JakaumaListProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const jakaumaDisplayValueTranslations: JakaumaDisplayValueTranslations = React.useMemo(
    () => ({
      maksullisuus: {
        lukuvuosimaksu: t('jakauma-values.maksullisuus.lukuvuosimaksu'),
        maksullinen: t('jakauma-values.maksullisuus.maksullinen'),
        maksuton: t('jakauma-values.maksullisuus.maksuton'),
      },
      palkanPeruste: {
        OTHER: t('jakauma-values.palkanPeruste.OTHER'),
        PIECE_WORK: t('jakauma-values.palkanPeruste.PIECE_WORK'),
        PROVISION: t('jakauma-values.palkanPeruste.PROVISION'),
        SALARY: t('jakauma-values.palkanPeruste.SALARY'),
        SALARY_PROVISION: t('jakauma-values.palkanPeruste.SALARY_PROVISION'),
        TIME_RATE: t('jakauma-values.palkanPeruste.TIME_RATE'),
        TIME_RATE_PROVISION: t('jakauma-values.palkanPeruste.TIME_RATE_PROVISION'),
      },
      palvelussuhde: {
        COMMISSION: t('jakauma-values.palvelussuhde.COMMISSION'),
        EMPLOYMENT: t('jakauma-values.palvelussuhde.EMPLOYMENT'),
        ENTREPRENEURSHIP: t('jakauma-values.palvelussuhde.ENTREPRENEURSHIP'),
        SERVICE_IN_PUBLIC_ADMINISTRATION: t('jakauma-values.palvelussuhde.SERVICE_IN_PUBLIC_ADMINISTRATION'),
      },
      tyoaika: {
        FULLTIME: t('jakauma-values.tyoaika.FULLTIME'),
        PARTTIME: t('jakauma-values.tyoaika.PARTTIME'),
      },
      tyonJatkuvuus: {
        PERMANENT: t('jakauma-values.tyonJatkuvuus.PERMANENT'),
        TEMPORARY: t('jakauma-values.tyonJatkuvuus.TEMPORARY'),
      },
    }),
    [t],
  );

  const jakaumaHeadingTranslations = React.useMemo(
    () => ({
      aika: t('jakauma.aika'),
      ajokortti: t('jakauma.ajokortti'),
      ammatti: t('jakauma.ammatti'),
      kielitaito: t('jakauma.kielitaito'),
      kortitJaLuvat: t('jakauma.kortitJaLuvat'),
      koulutusala: t('jakauma.koulutusala'),
      koulutusaste: t('jakauma.koulutusaste'),
      kunta: t('jakauma.kunta'),
      maa: t('jakauma.maa'),
      maakunta: t('jakauma.maakunta'),
      maksullisuus: t('jakauma.maksullisuus'),
      matkustusvaatimus: t('jakauma.matkustusvaatimus'),
      opetustapa: t('jakauma.opetustapa'),
      osaaminen: t('jakauma.osaaminen'),
      palkanPeruste: t('jakauma.palkanPeruste'),
      palvelussuhde: t('jakauma.palvelussuhde'),
      rikosrekisteriote: t('jakauma.rikosrekisteriote'),
      sijaintiJoustava: t('jakauma.sijaintiJoustava'),
      tyoaika: t('jakauma.tyoaika'),
      tyokieli: t('jakauma.tyokieli'),
      tyonJatkuvuus: t('jakauma.tyonJatkuvuus'),
      toimiala: t('jakauma.toimiala'),
    }),
    [t],
  );

  const getDisplayValue = (arvo: string) => {
    if (codesetValues && type === 'education' && isEducationCodeSetKey(name)) {
      // The version part (#1) is included in the arvo, but not in the code.koodiUri, so it needs to be stripped.
      const strippedArvo = arvo.split('#')[0];
      return codesetValues[name]?.find((v) => v.code === strippedArvo)?.value ?? strippedArvo;
    } else if (codesetValues && type === 'job' && isJobCodeSetKey(name)) {
      return codesetValues[name]?.find((v) => v.code === arvo)?.value ?? arvo;
    } else if (isBooleanJakaumaKey(name)) {
      return parseBoolean(arvo) === true ? t('is-required') : t('is-not-required');
    } else if (isJakaumaLabelKey(name)) {
      const translations = jakaumaDisplayValueTranslations[name];
      if (translations && arvo in translations) {
        return translations[arvo as keyof typeof translations];
      }
    }
    return arvo;
  };

  const jakauma = jakaumat[name as keyof typeof jakaumat];
  const isEmpty = !jakauma?.arvot || jakauma?.arvot.length === 0;

  return (
    <div className="md:col-span-1 print:col-span-1 col-span-2 border-l-2 border-border-gray pl-4">
      <h4 className="text-heading-4 pb-2">{jakaumaHeadingTranslations[name]}</h4>
      {isEmpty ? (
        <div className="flex flex-col gap-3">
          <p className="text-heading-2 text-accent" data-testid={`${name}-distribution-empty-label`}>
            {NOT_AVAILABLE_LABEL}
          </p>
          <span
            className="text-body-sm text-secondary-gray font-arial"
            data-testid={`${name}-distribution-total-label`}
          >
            {t('job-opportunity.of-job-ads')}
          </span>
        </div>
      ) : (
        <ul>
          {jakauma.arvot.map((arvo) => (
            <li key={arvo.arvo} className="flex flex-col gap-3">
              <div className="flex text-heading-2 text-accent gap-3 items-start">
                <span data-testid={`${name}-distribution-${arvo.arvo}-percentage`}>{Math.round(arvo.osuus)}%</span>
                <span
                  data-testid={`${name}-distribution-${arvo.arvo}-label`}
                  className="first-letter:capitalize hyphens-auto wrap-anywhere"
                  lang={language}
                >
                  {getDisplayValue(arvo.arvo)}
                </span>
              </div>
            </li>
          ))}
          <li
            className="text-body-sm text-secondary-gray font-arial mt-4"
            data-testid={`${name}-distribution-total-label`}
          >
            {type === 'job' ? t('job-opportunity.of-job-ads') : t('education-opportunity.of-educations')}
          </li>
        </ul>
      )}
    </div>
  );
};

export const EducationJakaumaList = ({ name }: { name: JakaumaKey }) => {
  const { jakaumat, codesetValues } = useLoaderData<EducationLoaderData>();
  return <JakaumaList jakaumat={jakaumat} name={name} codesetValues={codesetValues} type="education" />;
};

export const JobJakaumaList = ({ name }: { name: JakaumaKey }) => {
  const { jakaumat, codesetValues } = useLoaderData<JobLoaderData>();
  return <JakaumaList name={name} jakaumat={jakaumat} codesetValues={codesetValues} type="job" />;
};
