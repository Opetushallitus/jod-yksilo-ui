import type {
  Codeset,
  CodesetValues,
  JakaumaKey,
  KoulutusmahdollisuusJakaumat,
  TyomahdollisuusJakaumat,
} from '@/routes/types';
import { parseBoolean } from '@/utils';
import { useTranslation } from 'react-i18next';

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
  const isEmpty = !jakauma.arvot || jakauma.arvot.length === 0;

  return (
    <div className="md:col-span-1 col-span-2">
      <h2 className="text-heading-3 pb-2">{t(`jakauma.${name}`)}</h2>
      {isEmpty ? (
        <p className="text-black">{t('data-not-available')}</p>
      ) : (
        <ul className="list-none text-body-md text-black first-letter:capitalize">
          {jakauma.arvot.map((arvo) => (
            <li key={arvo.arvo}>{`${getDisplayValue(arvo.arvo)} (${arvo.osuus.toFixed(1)}%)`}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JakaumaList;
