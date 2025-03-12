import { components } from '@/api/schema';

export interface EducationHistoryForm {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  koulutukset: {
    id?: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    alkuPvm?: string;
    loppuPvm?: string;
    osaamiset: {
      id: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus: components['schemas']['LokalisoituTeksti'];
    }[];
  }[];
}
