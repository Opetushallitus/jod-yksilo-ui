export interface FreeTimeActivitiesForm {
  id?: string;
  nimi: string;
  patevyydet: {
    id?: string;
    nimi: string;
    alkuPvm: string;
    loppuPvm: string;
    osaamiset: {
      id: string;
      nimi: string;
    }[];
  }[];
}
