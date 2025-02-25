import { components } from '@/api/schema';

export interface FreeTimeActivitiesForm {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  patevyydet: {
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
