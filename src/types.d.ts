declare interface OsaaminenApiResponse {
  id: string;
  osaaminen: {
    uri: string;
    nimi: {
      fi: string;
      sv: string;
    };
    kuvaus: {
      fi: string;
      sv: string;
    };
  };
  lahde: {
    tyyppi: 'TOIMENKUVA' | 'KOULUTUS' | 'PATEVYYS';
    id: string;
  };
}

// Common type shared between "toimenkuva", "koulutus", "vapaa-ajan toiminto" and "jotain muuta"
declare interface Kokemus {
  id?: string | undefined;
  nimi: {
    [key: string]: string | undefined;
    empty?: boolean | undefined;
  };
  kuvaus?:
    | {
        [key: string]: string | undefined;
        empty?: boolean | undefined;
      }
    | undefined;
  alkuPvm?: string | undefined;
  loppuPvm?: string | undefined;
  osaamiset?: string[] | undefined;
}

declare type OsaaminenLahdeTyyppi = OsaaminenApiResponse['lahde']['tyyppi'] | 'JOTAIN_MUUTA' | 'KIINNOSTUS';

declare interface OsaaminenPostRequest {
  osaamiset: string[];
  lahde: {
    tyyppi: OsaaminenLahdeTyyppi;
    id: string;
  };
}

declare interface Osaaminen {
  id: string;
  nimi: string;
  tyyppi: string;
  osuvuus: number;
}
