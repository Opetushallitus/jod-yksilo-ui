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

export const LIMITS = {
  // Gathered from DTO @Size annotations
  TEXT_INPUT: 200,
  TEXTAREA: 10_000,
};

export const NOT_AVAILABLE_LABEL = '---'; // Label to use when data is not available, especially in opportunity cards

export const formErrorMessage = {
  email: () => ({ message: i18n.t('error.form.email') }),
  max: (count: number) => ({ message: i18n.t('error.form.max', { count }) }),
  min: (count: number) => ({ message: i18n.t('error.form.min', { count }) }),
  required: () => ({ message: i18n.t('error.form.required') }),
  url: () => ({ message: i18n.t('error.form.url') }),
  date: () => i18n.t('error.form.date'),
  /**
   * Used to validate that the end date is after the start date
   * @param path Path to the field where the error message should appear.
   */
  dateRange: (path: string[]) => ({ message: i18n.t('error.form.date-range'), path }),
  dateInThePast: () => ({ message: i18n.t('error.form.date-in-the-past') }),
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
      url: z.url(formErrorMessage.url()),
    }),
  ),
  osaamiset: z.array(
    z.object({
      uri: z.string().min(1),
      nimi: z.object({}).catchall(z.string()),
      kuvaus: z.object({}).catchall(z.string()),
    }),
  ),
  pvm: z.iso.date(formErrorMessage.date()),
};
