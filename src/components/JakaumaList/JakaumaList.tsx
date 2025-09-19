import type { LoaderData as EducationLoaderData } from '@/routes/EducationOpportunity/loader';
import type { LoaderData as JobLoaderData } from '@/routes/JobOpportunity/loader';
import type {
  EducationCodeSetKeys,
  EducationCodeSetValues,
  JakaumaKey,
  JobCodesetKeys,
  JobCodesetValues,
  KoulutusmahdollisuusJakaumat,
  TyomahdollisuusJakaumat,
} from '@/routes/types';
import { parseBoolean } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

type JakaumaListProps =
  | {
      /** Jakaumat from opportunity */
      jakaumat: TyomahdollisuusJakaumat | KoulutusmahdollisuusJakaumat;
      /** Name of the jakauma */
      name: JakaumaKey;
      /** Keys that correspond to boolean like values, eg "true", 1 etc. */
      booleanKeys?: JakaumaKey[];
      /** Values that can be displayed as is */
      codesAsValue?: JakaumaKey[];
      /** Values that use the JSON codeset files. If codesetKeys is defined, codesetValues must be defined as well. */
      codesetKeys: JakaumaKey[];
      /** Values associated with the codeset */
      codesetValues: JobCodesetValues | EducationCodeSetValues;
      /** Type of the jakauma */
      type: 'job' | 'education';
    }
  | {
      jakaumat: TyomahdollisuusJakaumat | KoulutusmahdollisuusJakaumat;
      name: JakaumaKey;
      booleanKeys?: JakaumaKey[];
      codesAsValue?: JakaumaKey[];
      codesetKeys?: never;
      codesetValues?: never;
      type: 'job' | 'education';
    };

const JakaumaList = ({
  name,
  jakaumat,
  codesetKeys = [],
  booleanKeys = [],
  codesAsValue = [],
  codesetValues,
  type,
}: JakaumaListProps) => {
  const { t } = useTranslation();

  const getDisplayValue = (arvo: string) => {
    if (codesetValues && codesetKeys.includes(name)) {
      if (type === 'education') {
        // The version part (#1) is included in the arvo, but not in the code.koodiUri, so it needs to be stripped.
        const strippedArvo = arvo.split('#')[0];
        return (
          (codesetValues as EducationCodeSetValues)[name as EducationCodeSetKeys]?.find((v) => v.code === strippedArvo)
            ?.value ?? strippedArvo
        );
      } else if (type === 'job') {
        return (codesetValues as JobCodesetValues)[name as JobCodesetKeys]?.find((v) => v.code === arvo)?.value ?? arvo;
      }
      return arvo;
    } else if (booleanKeys.includes(name)) {
      return parseBoolean(arvo) === true ? t('required') : t('not-required');
    } else if (codesAsValue.includes(name)) {
      return arvo;
    } else {
      return t(`jakauma-values.${name}.${arvo}`);
    }
  };

  const jakauma = jakaumat[name as keyof typeof jakaumat];
  const isEmpty = !jakauma?.arvot || jakauma?.arvot.length === 0;

  return (
    <div className="md:col-span-1 col-span-2 border-l-2 border-border-gray pl-4">
      <h2 className="text-heading-4 pb-2">{t(`jakauma.${name}`)}</h2>
      {isEmpty ? (
        <div className="flex flex-col gap-3">
          <p className="text-heading-2 text-accent">---</p>
          <span className="text-body-sm text-secondary-gray font-arial">{t('job-opportunity.of-job-ads')}</span>
        </div>
      ) : (
        <ul>
          {jakauma.arvot.map((arvo) => (
            <li key={arvo.arvo} className="flex flex-col gap-3">
              <div className="flex text-heading-2 text-accent gap-3 items-start">
                <span>{Math.round(arvo.osuus)}%</span>
                <span className="first-letter:capitalize">{getDisplayValue(arvo.arvo)}</span>
              </div>
            </li>
          ))}
          <li className="text-body-sm text-secondary-gray font-arial mt-4">
            {type === 'job' ? t('job-opportunity.of-job-ads') : t('education-opportunity.of-educations')}
          </li>
        </ul>
      )}
    </div>
  );
};

export const EducationJakaumaList = ({ name }: { name: JakaumaKey }) => {
  const { jakaumat, codesetValues } = useLoaderData<EducationLoaderData>();
  return (
    <JakaumaList
      jakaumat={jakaumat}
      name={name}
      codesAsValue={['kunta', 'koulutusala', 'opetustapa', 'aika']}
      codesetValues={codesetValues}
      codesetKeys={['aika', 'opetustapa', 'koulutusala']}
      type="education"
    />
  );
};

export const JobJakaumaList = ({ name }: { name: JakaumaKey }) => {
  const { jakaumat, codesetValues } = useLoaderData<JobLoaderData>();

  return (
    <JakaumaList
      name={name}
      jakaumat={jakaumat}
      booleanKeys={['rikosrekisteriote', 'matkustusvaatimus', 'sijaintiJoustava']}
      codesAsValue={['ajokortti', 'kielitaito']}
      codesetKeys={['maa', 'maakunta', 'kunta', 'tyokieli']}
      codesetValues={codesetValues}
      type="job"
    />
  );
};
