import type { LoaderData as EducationLoaderData } from '@/routes/EducationOpportunity/loader';
import type { LoaderData as JobLoaderData } from '@/routes/JobOpportunity/loader';
import type {
  Codeset,
  CodesetValues,
  JakaumaKey,
  KoulutusmahdollisuusJakaumat,
  TyomahdollisuusJakaumat,
} from '@/routes/types';
import { parseBoolean } from '@/utils';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

type JakaumaListProps =
  | {
      // Jakaumat from opportunity
      jakaumat: TyomahdollisuusJakaumat | KoulutusmahdollisuusJakaumat;
      // Name of the jakauma
      name: JakaumaKey;
      // Keys that correspond to boolean like values, eg "true", 1 etc.
      booleanKeys?: JakaumaKey[];
      // Values that can be displayed as is
      codesAsValue?: JakaumaKey[];
      // Values that use the JSON codeset files. If codesetKeys is defined, codesetValues must be defined as well.
      codesetKeys: JakaumaKey[];
      codesetValues: CodesetValues;
    }
  | {
      jakaumat: TyomahdollisuusJakaumat | KoulutusmahdollisuusJakaumat;
      name: JakaumaKey;
      booleanKeys?: JakaumaKey[];
      codesAsValue?: JakaumaKey[];
      codesetKeys?: never;
      codesetValues?: never;
    };

const JakaumaList = ({
  name,
  jakaumat,
  codesetKeys = [],
  booleanKeys = [],
  codesAsValue = [],
  codesetValues,
}: JakaumaListProps) => {
  const { t } = useTranslation();

  const getDisplayValue = (arvo: string) => {
    if (codesetValues && codesetKeys.includes(name)) {
      return codesetValues[name as Codeset]?.find((v) => v.code === arvo)?.value ?? arvo;
    } else if (booleanKeys.includes(name)) {
      return parseBoolean(arvo) === true ? t('yes') : t('no');
    } else if (codesAsValue.includes(name)) {
      return arvo;
    } else {
      return t(`jakauma-values.${name}.${arvo}`);
    }
  };

  const jakauma = jakaumat[name as keyof typeof jakaumat];
  const isEmpty = !jakauma?.arvot || jakauma?.arvot.length === 0;

  return (
    <div className="md:col-span-1 col-span-2">
      <h2 className="text-heading-3 pb-2">{t(`jakauma.${name}`)}:</h2>
      {isEmpty ? (
        <div className="flex flex-col gap-3">
          <p className="text-heading-3 text-accent">{t('data-not-available')}</p>
          <span className="text-body-sm text-black">{t('job-opportunity.n-percent-of-job-ads', { count: 100 })}</span>
        </div>
      ) : (
        <ul className="list-none flex flex-col gap-6 mb-7">
          {jakauma.arvot.map((arvo) => (
            <li key={arvo.arvo} className="flex flex-col gap-3">
              <span className="text-heading-3 text-accent first-letter:capitalize">{getDisplayValue(arvo.arvo)}</span>
              <span className="text-body-sm text-black">
                {t('job-opportunity.n-percent-of-job-ads', { count: Math.round(arvo.osuus) })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const EducationJakaumaList = ({ name }: { name: JakaumaKey }) => {
  const { jakaumat } = useLoaderData<EducationLoaderData>();
  return <JakaumaList jakaumat={jakaumat} name={name} codesAsValue={['kunta', 'koulutusala', 'opetustapa', 'aika']} />;
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
    />
  );
};
