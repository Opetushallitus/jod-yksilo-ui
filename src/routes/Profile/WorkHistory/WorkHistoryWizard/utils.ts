import { components } from '@/api/schema';

export interface WorkHistoryForm {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  toimenkuvat: {
    id?: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    alkuPvm: string;
    loppuPvm?: string;
    osaamiset: {
      id: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus: components['schemas']['LokalisoituTeksti'];
    }[];
  }[];
}
