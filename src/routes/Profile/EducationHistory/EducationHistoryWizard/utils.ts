import { components } from '@/api/schema';

export interface EducationHistoryForm {
  id?: string;
  nimi: string;
  koulutukset: {
    id?: string;
    nimi: string;
    alkuPvm: string;
    loppuPvm: string;
    osaamiset: {
      id: string;
      nimi: components['schemas']['LokalisoituTeksti'];
    }[];
  }[];
}
