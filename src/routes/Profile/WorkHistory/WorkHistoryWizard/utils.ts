export interface WorkHistoryForm {
  id?: string;
  nimi: string;
  toimenkuvat: {
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
