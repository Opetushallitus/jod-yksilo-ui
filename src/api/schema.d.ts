/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/api/profiili/vapaa-ajan-toiminnot/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the vapaa-ajan toiminto (including patevyydet) */
    get: operations['toimintoGet'];
    /** Updates the vapaa-ajan toiminto (shallow update) */
    put: operations['toimintoUpdate'];
    post?: never;
    /** Delete the vapaa-ajan toiminto (including all patevyydet) */
    delete: operations['toimintoDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/vapaa-ajan-toiminnot/{id}/patevyydet/{patevyysId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a patevyys of the vapaa-ajan toiminto */
    get: operations['patevyysGet'];
    /** Updates a patevyys of the vapaa-ajan toiminto (including osaamiset) */
    put: operations['patevyysUpdate'];
    post?: never;
    /** Deletes a patevyys of the vapaa-ajan toiminto (including all osaamiset). If the toiminto becomes empty, it will also be deleted. */
    delete: operations['patevyysDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/tyopaikat/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a tyopaikka */
    get: operations['tyopaikkaGet'];
    /** Updates a tyopaikka (shallow update) */
    put: operations['tyopaikkaUpdate'];
    post?: never;
    /** Deletes a tyopaikka */
    delete: operations['tyopaikkaDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a toimenkuva of the tyopaikka */
    get: operations['toimenkuvaGet'];
    /** Updates a toimenkuva of the tyopaikka */
    put: operations['toimenkuvaUpdate'];
    post?: never;
    /** Deletes a toimenkuva of the tyopaikka. If the tyopaikka becomes empty, it will also be deleted. */
    delete: operations['toimenkuvaDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/muu-osaaminen': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets all other osaaminen of the user */
    get: operations['muuOsaaminenFindAll'];
    /** Gets all other osaaminen of the user */
    put: operations['muuOsaaminenUpdate'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a koulutuskokonaisuus */
    get: operations['koulutusKokonaisuusGet'];
    /** Updates a koulutuskokonaisuus (shallow update) */
    put: operations['koulutusKokonaisuusUpdate'];
    post?: never;
    /** Deletes a koulutuskokonaisuus (including koulutukset) */
    delete: operations['koulutusKokonaisuusDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/{id}/koulutukset/{koulutusId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a koulutus of the koulutuskokonaisuus */
    get: operations['koulutusGet'];
    /** Updates a koulutus of the koulutuskokonaisuus */
    put: operations['koulutusUpdate'];
    post?: never;
    /** Deletes a koulutus of the koulutuskokonaisuus. If the kokonaisuus becomes empty, it will be deleted. */
    delete: operations['koulutusDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/kiinnostukset/osaamiset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['kiinnostusGetOsaamiset'];
    put: operations['kiinnostusUpdateOsaamiset'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/vapaa-ajan-toiminnot': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all vapaa-ajan toiminnot of the user */
    get: operations['toimintoFindAll'];
    put?: never;
    /** Adds a new vapaa-ajan toiminto (and optionally patevyydet) */
    post: operations['toimintoAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/vapaa-ajan-toiminnot/{id}/patevyydet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets all patevyydet of the vapaa-ajan toiminto */
    get: operations['patevyysFindAll'];
    put?: never;
    /** Adds a new patevyys to the vapaa-ajan toiminto */
    post: operations['patevyysAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/tyopaikat': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets all tyopaikat of the user */
    get: operations['tyopaikkaFindAll'];
    put?: never;
    /** Adds a new tyopaikka (and optionally toimenkuvat) */
    post: operations['tyopaikkaAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/tyopaikat/{id}/toimenkuvat': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets all toimenkuvat of the tyopaikka */
    get: operations['toimenkuvaFindAll'];
    put?: never;
    /** Adds a new toimenkuva to the tyopaikka */
    post: operations['toimenkuvaAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/suosikki': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Finds all yksilon suosikit */
    get: operations['yksilonSuosikkiGet'];
    put?: never;
    /** Add a Yksilo's suosikki */
    post: operations['yksilonSuosikkiPost'];
    /** Deletes one of Yksilo's suosikki */
    delete: operations['yksilonSuosikkiDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all koulutuskokonaisuudet of the user */
    get: operations['koulutusKokonaisuusGetAll'];
    put?: never;
    /** Adds a new koulutuskokonaisuus, and optionally associated koulutukset */
    post: operations['koulutusKokonaisuusAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/{id}/koulutukset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets all koulutukset of the koulutuskokonaisuus */
    get: operations['koulutusGetAll'];
    put?: never;
    /** Adds a new koulutus to the koulutuskokonaisuus */
    post: operations['koulutusAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/ehdotus/tyomahdollisuudet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['tyomahdollisuudetCreateEhdotus'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/ehdotus/osaamiset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['osaamisetEhdotusCreateEhdotus'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tyomahdollisuudet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get all työmahdollisuudet paged of by page and size or set of ids
     * @description Returns all työmahdollisuudet basic information in JSON-format.
     */
    get: operations['tyomahdollisuusFindAll'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tyomahdollisuudet/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Get full information content of single työmahdollisuus
     * @description Returns one työmahdollisuus full content by id
     */
    get: operations['tyomahdollisuusFindById'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/yksilo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['yksiloGet'];
    put?: never;
    post?: never;
    delete: operations['yksiloDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/osaamiset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Finds all Osaaminen, optionally filtered by Tyyppi and/or LahdeId */
    get: operations['yksilonOsaaminenFind'];
    put?: never;
    post?: never;
    /** Deletes one or more Yksilo's Osaaminen */
    delete: operations['yksilonOsaaminenDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/osaamiset/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a Yksilo's Osaaminen */
    get: operations['yksilonOsaaminenGet'];
    put?: never;
    post?: never;
    /** Deletes a Yksilo's Osaaminen */
    delete: operations['yksilonOsaaminenDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/osaamiset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['osaaminenFind'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @example {
     *       "fi": "suomeksi",
     *       "sv": "på svenska"
     *     } */
    LokalisoituTeksti: {
      [key: string]: string;
    };
    ToimintoUpdateDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
    };
    PatevyysDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm: string;
      /** Format: date */
      loppuPvm?: string;
      osaamiset?: string[];
    };
    TyopaikkaUpdateDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
    };
    ToimenkuvaDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm: string;
      /** Format: date */
      loppuPvm?: string;
      osaamiset?: string[];
    };
    KoulutusKokonaisuusUpdateDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
    };
    KoulutusDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm: string;
      /** Format: date */
      loppuPvm?: string;
      osaamiset?: string[];
    };
    ToimintoDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      patevyydet?: components['schemas']['PatevyysDto'][];
    };
    IdDtoUUID: {
      /** Format: uuid */
      id: string;
    };
    TyopaikkaDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      toimenkuvat?: components['schemas']['ToimenkuvaDto'][];
    };
    SuosikkiDto: {
      /** Format: uuid */
      readonly id?: string;
      /** Format: uuid */
      suosionKohdeId: string;
      /**
       * @example TYOMAHDOLLISUUS
       * @enum {string}
       */
      tyyppi: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';
      /** Format: date-time */
      readonly luotu?: string;
    };
    KoulutusKokonaisuusDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      koulutukset?: components['schemas']['KoulutusDto'][];
    };
    LuoEhdotusDto: {
      /** Format: double */
      osaamisPainotus?: number;
      osaamiset?: string[];
      /** Format: double */
      kiinnostusPainotus?: number;
      kiinnostukset?: string[];
    };
    EhdotusDto: {
      /** Format: uuid */
      mahdollisuusId?: string;
      ehdotusMetadata?: components['schemas']['EhdotusMetadata'];
    };
    EhdotusMetadata: {
      pisteet?: {
        empty?: boolean;
        present?: boolean;
        /** Format: double */
        asDouble?: number;
      };
      /** @enum {string} */
      trendi?: 'NOUSEVA' | 'LASKEVA';
      tyollisyysNakyma?: {
        empty?: boolean;
        present?: boolean;
        /** Format: int32 */
        asInt?: number;
      };
    };
    Ehdotus: {
      /** Format: uri */
      uri: string;
      /** Format: double */
      osuvuus: number;
    };
    SivuDtoTyomahdollisuusDto: {
      sisalto: components['schemas']['TyomahdollisuusDto'][];
      /**
       * Format: int64
       * @example 30
       */
      maara: number;
      /**
       * Format: int32
       * @example 3
       */
      sivuja: number;
    };
    TyomahdollisuusDto: {
      /** Format: uuid */
      id: string;
      otsikko: components['schemas']['LokalisoituTeksti'];
      tiivistelma?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
    };
    ArvoDto: {
      arvo: string;
      /** Format: double */
      osuus: number;
    };
    JakaumaDto: {
      /** Format: int32 */
      maara: number;
      /** Format: int32 */
      tyhjia: number;
      arvot: components['schemas']['ArvoDto'][];
    };
    TyomahdollisuusFullDto: {
      /** Format: uuid */
      id: string;
      otsikko: components['schemas']['LokalisoituTeksti'];
      tiivistelma?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      jakaumat?: {
        [key: string]: components['schemas']['JakaumaDto'];
      };
    };
    CsrfTokenDto: {
      token: string;
      headerName: string;
      parameterName: string;
    };
    YksiloCsrfDto: {
      etunimi?: string;
      sukunimi?: string;
      csrf: components['schemas']['CsrfTokenDto'];
    };
    OsaaminenDto: {
      /** Format: uri */
      uri: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus: components['schemas']['LokalisoituTeksti'];
    };
    OsaamisenLahdeDto: {
      /** @enum {string} */
      tyyppi: 'TOIMENKUVA' | 'KOULUTUS' | 'PATEVYYS' | 'MUU_OSAAMINEN';
      /** Format: uuid */
      id?: string;
    };
    YksilonOsaaminenDto: {
      /** Format: uuid */
      id?: string;
      osaaminen: components['schemas']['OsaaminenDto'];
      lahde: components['schemas']['OsaamisenLahdeDto'];
    };
    SivuDtoOsaaminenDto: {
      sisalto: components['schemas']['OsaaminenDto'][];
      /**
       * Format: int64
       * @example 30
       */
      maara: number;
      /**
       * Format: int32
       * @example 3
       */
      sivuja: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  toimintoGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ToimintoDto'];
        };
      };
    };
  };
  toimintoUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ToimintoUpdateDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  toimintoDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  patevyysGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        patevyysId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PatevyysDto'];
        };
      };
    };
  };
  patevyysUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        patevyysId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PatevyysDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  patevyysDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        patevyysId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  tyopaikkaGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TyopaikkaDto'];
        };
      };
    };
  };
  tyopaikkaUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TyopaikkaUpdateDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  tyopaikkaDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  toimenkuvaGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        toimenkuvaId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ToimenkuvaDto'];
        };
      };
    };
  };
  toimenkuvaUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        toimenkuvaId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ToimenkuvaDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  toimenkuvaDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        toimenkuvaId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  muuOsaaminenFindAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': string[];
        };
      };
    };
  };
  muuOsaaminenUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': string[];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusKokonaisuusGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusKokonaisuusDto'];
        };
      };
    };
  };
  koulutusKokonaisuusUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['KoulutusKokonaisuusUpdateDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusKokonaisuusDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        koulutusId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusDto'];
        };
      };
    };
  };
  koulutusUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        koulutusId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['KoulutusDto'];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
        koulutusId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  kiinnostusGetOsaamiset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': string[];
        };
      };
    };
  };
  kiinnostusUpdateOsaamiset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': string[];
      };
    };
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  toimintoFindAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ToimintoDto'][];
        };
      };
    };
  };
  toimintoAdd: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ToimintoDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  patevyysFindAll: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PatevyysDto'][];
        };
      };
    };
  };
  patevyysAdd: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PatevyysDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  tyopaikkaFindAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TyopaikkaDto'][];
        };
      };
    };
  };
  tyopaikkaAdd: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['TyopaikkaDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  toimenkuvaFindAll: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ToimenkuvaDto'][];
        };
      };
    };
  };
  toimenkuvaAdd: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ToimenkuvaDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  yksilonSuosikkiGet: {
    parameters: {
      query?: {
        tyyppi?: 'TYOMAHDOLLISUUS' | 'KOULUTUSMAHDOLLISUUS';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SuosikkiDto'][];
        };
      };
    };
  };
  yksilonSuosikkiPost: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SuosikkiDto'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': string;
        };
      };
    };
  };
  yksilonSuosikkiDelete: {
    parameters: {
      query: {
        id: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusKokonaisuusGetAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusKokonaisuusDto'][];
        };
      };
    };
  };
  koulutusKokonaisuusAdd: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['KoulutusKokonaisuusDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  koulutusGetAll: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusDto'][];
        };
      };
    };
  };
  koulutusAdd: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['KoulutusDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'];
        };
      };
    };
  };
  tyomahdollisuudetCreateEhdotus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LuoEhdotusDto'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EhdotusDto'][];
        };
      };
    };
  };
  osaamisetEhdotusCreateEhdotus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LokalisoituTeksti'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ehdotus'][];
        };
      };
    };
  };
  tyomahdollisuusFindAll: {
    parameters: {
      query?: {
        sivu?: number;
        koko?: number;
        id?: string[];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SivuDtoTyomahdollisuusDto'];
        };
      };
    };
  };
  tyomahdollisuusFindById: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TyomahdollisuusFullDto'];
        };
      };
    };
  };
  yksiloGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['YksiloCsrfDto'];
        };
      };
    };
  };
  yksiloDelete: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  yksilonOsaaminenFind: {
    parameters: {
      query?: {
        tyyppi?: 'TOIMENKUVA' | 'KOULUTUS' | 'PATEVYYS' | 'MUU_OSAAMINEN';
        lahdeId?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['YksilonOsaaminenDto'][];
        };
      };
    };
  };
  yksilonOsaaminenDelete: {
    parameters: {
      query: {
        ids: string[];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  yksilonOsaaminenGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['YksilonOsaaminenDto'];
        };
      };
    };
  };
  yksilonOsaaminenDelete: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No Content */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  osaaminenFind: {
    parameters: {
      query?: {
        sivu?: number;
        koko?: number;
        uri?: string[];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SivuDtoOsaaminenDto'];
        };
      };
    };
  };
}
