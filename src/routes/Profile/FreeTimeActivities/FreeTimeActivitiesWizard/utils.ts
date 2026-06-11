import { components } from '@/api/schema';

export interface FreeTimeActivitiesForm {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  toiminnot: {
    id?: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
    alkuPvm: string;
    loppuPvm?: string;
    osaamiset: {
      id: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus: components['schemas']['LokalisoituTeksti'];
    }[];
  }[];
}
