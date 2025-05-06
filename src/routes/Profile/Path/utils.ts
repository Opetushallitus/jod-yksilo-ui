import { components } from '@/api/schema';
import { FORM_SCHEMA, formErrorMessage } from '@/constants';
import { MahdollisuusTyyppi } from '@/routes/types';
import { z } from 'zod';

export interface LinkData {
  url: string;
}

export interface PolkuQueryParams {
  [key: string]: string | undefined;
  suunnitelmaId?: string;
  paamaaraId?: string;
  vaiheId?: string;
}

export const VAIHE_TYYPIT = ['KOULUTUS', 'TYO'] as const;
export type VaiheTyyppi = (typeof VAIHE_TYYPIT)[number];
export const VAIHE_LAHTEET = ['EHDOTUS', 'KAYTTAJA'] as const;
export type VaiheLahde = (typeof VAIHE_LAHTEET)[number];

export interface VaiheForm {
  id?: string;
  lahde: VaiheLahde;
  tyyppi: VaiheTyyppi;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus?: components['schemas']['LokalisoituTeksti'];
  valmis: boolean;
  alkuPvm: string;
  loppuPvm: string;
  linkit: LinkData[];
  osaamiset: components['schemas']['OsaaminenDto'][];
}

export interface PolkuForm {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  osaamiset: Partial<Pick<components['schemas']['OsaaminenDto'], 'uri'>>[];
  ignoredOsaamiset: Partial<Pick<components['schemas']['OsaaminenDto'], 'uri'>>[];
}
export interface ProgressStep {
  label: React.ReactNode;
  content?: VaiheForm;
}

export const mapOsaaminenToUri = (osaaminen: components['schemas']['OsaaminenDto']) => osaaminen.uri;

/**
 * Used to calculate the duration between two dates and return the years and months
 * @param start Start time in milliseconds
 * @param end End time in milliseconds
 * @returns Object with years and months
 */
export const getDuration = (start: number, end: number) => {
  const totalMilliseconds = end - start;
  const yearMultiplier = 1000 * 60 * 60 * 24 * 365;
  const monthMultiplier = 1000 * 60 * 60 * 24 * 30;
  const years = Math.floor(totalMilliseconds / yearMultiplier);
  const months = Math.floor((totalMilliseconds % yearMultiplier) / monthMultiplier);

  return { years, months };
};

export const opportunityTypeToVaiheTyyppi = (type?: MahdollisuusTyyppi): VaiheTyyppi =>
  type === 'KOULUTUSMAHDOLLISUUS' ? 'KOULUTUS' : 'TYO';

export const vaiheFormSchema = z.object({
  alkuPvm: FORM_SCHEMA.pvm.nonempty(formErrorMessage.required()),
  id: z.string().optional(),
  kuvaus: FORM_SCHEMA.kuvaus,
  lahde: z.enum(VAIHE_LAHTEET),
  linkit: FORM_SCHEMA.linkit,
  loppuPvm: FORM_SCHEMA.pvm.nonempty(formErrorMessage.required()).or(z.literal('')),
  nimi: FORM_SCHEMA.nimi,
  osaamiset: FORM_SCHEMA.osaamiset,
  tyyppi: z.enum(VAIHE_TYYPIT),
  valmis: z.boolean(),
});
