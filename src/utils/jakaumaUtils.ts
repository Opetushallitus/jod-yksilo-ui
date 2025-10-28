import type {
  CodeSetValue,
  JakaumaDisplayValueTranslations,
  JakaumaKey,
  KoulutusmahdollisuusJakaumat,
  TyomahdollisuusJakaumat,
} from '../routes/types';

const makeEducationKeysArray = <T extends readonly (keyof KoulutusmahdollisuusJakaumat)[]>(arr: T): T => {
  return arr;
};

const EducationCodeSetKeysArray = makeEducationKeysArray(['aika', 'opetustapa', 'koulutusala'] as const);
export type EducationCodeSetKey = (typeof EducationCodeSetKeysArray)[number];

export const isEducationCodeSetKey = (key: JakaumaKey): key is EducationCodeSetKey => {
  return EducationCodeSetKeysArray.includes(key as EducationCodeSetKey);
};
export type EducationCodeSetValues = Record<EducationCodeSetKey, CodeSetValue[]>;

const EducationCodesAsValue = makeEducationKeysArray(['kunta', 'koulutusala', 'opetustapa', 'aika'] as const);

export type EducationCodesAsValue = (typeof EducationCodesAsValue)[number];

export const isEducationCodesAsValue = (key: JakaumaKey): key is EducationCodesAsValue => {
  return EducationCodesAsValue.includes(key as EducationCodesAsValue);
};

const makeJobKeysArray = <T extends readonly (keyof TyomahdollisuusJakaumat)[]>(arr: T): T => {
  return arr;
};

const JobCodeSetKeysArray = makeJobKeysArray(['maa', 'maakunta', 'kunta', 'tyokieli'] as const);
export type JobCodesetKey = (typeof JobCodeSetKeysArray)[number];

export const isJobCodeSetKey = (key: JakaumaKey): key is JobCodesetKey => {
  return JobCodeSetKeysArray.includes(key as JobCodesetKey);
};

export type JobCodesetValues = Record<JobCodesetKey, CodeSetValue[]>;

const JobCodesAsValue = makeJobKeysArray(['ajokortti', 'kielitaito'] as const);

export type JobCodesAsValue = (typeof JobCodesAsValue)[number];

export const isJobCodesAsValue = (key: JakaumaKey): key is JobCodesAsValue => {
  return JobCodesAsValue.includes(key as JobCodesAsValue);
};

export type Codeset = JobCodesetKey | EducationCodeSetKey;

const BooleanKeysArray = makeJobKeysArray(['rikosrekisteriote', 'matkustusvaatimus', 'sijaintiJoustava'] as const);
export type BooleanJakaumaKeys = (typeof BooleanKeysArray)[number];

export const isBooleanJakaumaKey = (key: JakaumaKey): key is BooleanJakaumaKeys => {
  return BooleanKeysArray.includes(key as BooleanJakaumaKeys);
};

const makeJakaumaDisplayValueTranslationsKeysArray = <T extends readonly (keyof JakaumaDisplayValueTranslations)[]>(
  arr: T,
): T => {
  return arr;
};

const JakaumaLabelKeysArray = makeJakaumaDisplayValueTranslationsKeysArray([
  'maksullisuus',
  'palkanPeruste',
  'palvelussuhde',
  'tyoaika',
  'tyonJatkuvuus',
] as const);

export const isJakaumaLabelKey = (key: string): key is keyof JakaumaDisplayValueTranslations => {
  return JakaumaLabelKeysArray.includes(key as keyof JakaumaDisplayValueTranslations);
};
