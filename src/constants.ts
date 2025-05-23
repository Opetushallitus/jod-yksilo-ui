/* eslint-disable sonarjs/no-clear-text-protocols */
import i18n from '@/i18n/config';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { Tag } from '@jod/design-system';
import { z } from 'zod';

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
  URL: 'error.form.url',
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
  url: () => ({ message: i18n.t(FORM_ERROR_KEY.URL) }),
  date: () => i18n.t(FORM_ERROR_KEY.DATE),
  /**
   * Used to validate that the end date is after the start date
   * @param path Path to the field where the error message should appear.
   */
  dateRange: (path: string[]) => ({ message: i18n.t(FORM_ERROR_KEY.DATE_RANGE), path }),
};

// Commonly used form validation schemas
export const FORM_SCHEMA = {
  nimi: z
    .object({})
    .catchall(
      z
        .string()
        .trim()
        .nonempty(formErrorMessage.required())
        .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
    ),
  kuvaus: z
    .object({})
    .catchall(z.string().max(LIMITS.TEXTAREA, formErrorMessage.max(LIMITS.TEXTAREA)))
    .optional(),
  linkit: z.array(
    z.object({
      url: z.string().url(formErrorMessage.url()),
    }),
  ),
  osaamiset: z.array(
    z.object({
      uri: z.string().min(1),
      nimi: z.object({}).catchall(z.string()),
      kuvaus: z.object({}).catchall(z.string()),
    }),
  ),
  pvm: z.string().date(formErrorMessage.date()),
};
