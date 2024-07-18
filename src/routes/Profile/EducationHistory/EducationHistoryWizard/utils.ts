export interface OsaaminenForm {
  id: string;
  nimi: string;
}

export interface KoulutusForm {
  id?: string;
  nimi: string;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: OsaaminenForm[];
}
export interface EducationHistoryForm {
  id?: string;
  nimi: string;
  koulutukset: KoulutusForm[];
}

export interface KategoriaForm {
  id?: string;
  nimi: string;
  kuvaus?: string;
}
