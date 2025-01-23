/* eslint-disable sonarjs/no-clear-text-protocols */
import { OsaaminenLahdeTyyppi } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import i18n from '@/i18n/config';
import { Tag } from '@jod/design-system';

type TagProps = React.ComponentProps<typeof Tag>;
export const OSAAMINEN_COLOR_MAP: Record<OsaaminenLahdeTyyppi, NonNullable<TagProps['sourceType']>> = {
  TOIMENKUVA: 'tyopaikka',
  KOULUTUS: 'koulutus',
  PATEVYYS: 'vapaa-ajan-toiminto',
  MUU_OSAAMINEN: 'jotain-muuta',
  KIINNOSTUS: 'kiinnostus',
  KARTOITETTU: 'jotain-muuta',
};

export const DEFAULT_PAGE_SIZE = 20;

export const ESCO_SKILL_PREFIX = 'http://data.europa.eu/esco/skill/';
export const ESCO_OCCUPATION_PREFIX = 'http://data.europa.eu/esco/occupation/';

// Translation keys for form errors
const FORM_ERROR_KEY = {
  REQUIRED: 'error.form.required',
  MAX: 'error.form.max',
  MIN: 'error.form.min',
  DATE: 'error.form.date',
  DATE_RANGE: 'error.form.date-range',
};

export const LIMITS = {
  // Gathered from DTO @Size annotations
  TEXT_INPUT: 200,
  TEXTAREA: 10_000,
};

export const formErrorMessage = {
  max: (count: number) => ({ message: i18n.t(FORM_ERROR_KEY.MAX, { count }) }),
  min: (count: number) => ({ message: i18n.t(FORM_ERROR_KEY.MIN, { count }) }),
  required: () => ({ message: i18n.t(FORM_ERROR_KEY.REQUIRED) }),
  date: () => i18n.t(FORM_ERROR_KEY.DATE),
  /**
   * Used to validate that the end date is after the start date
   * @param path Path to the field where the error message should appear.
   */
  dateRange: (path: string[]) => ({ message: i18n.t(FORM_ERROR_KEY.DATE_RANGE), path }),
};
