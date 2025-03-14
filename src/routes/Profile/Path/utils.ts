import { components } from '@/api/schema';

export interface LinkData {
  url: string;
}

export interface PolkuQueryParams {
  [key: string]: string | undefined;
  suunnitelmaId?: string;
  paamaaraId?: string;
  vaiheId?: string;
}

export interface VaiheForm {
  id?: string;
  tyyppi: 'KOULUTUS' | 'TYO';
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
}
export interface ProgressStep {
  label: React.ReactNode;
  content?: VaiheForm;
}

export const mapOsaaminenToUri = (osaaminen: components['schemas']['OsaaminenDto']) => osaaminen.uri;
