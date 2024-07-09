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
    /**
     * Get vapaa-ajan toiminto by id
     * @description This endpoint can be used to get vapaa-ajan toiminto by id.
     *
     */
    get: operations['toimintoGet'];
    /**
     * Updates the vapaa-ajan toiminto by id
     * @description This endpoint can be used to update vapaa-ajan toiminto.
     *
     */
    put: operations['toimintoUpdate'];
    post?: never;
    delete?: never;
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
    /** Get all koulutukset and kategoriat of the user */
    get: operations['koulutusKokonaisuusFindAll'];
    /**
     * Updates a set of Koulutus
     * @description If an existing Koulutus in a Kategoria is omitted, it will be removed.
     */
    put: operations['koulutusKokonaisuusUpdate'];
    /** Creates a set of Koulutus associated with an optional Kategoria, creating the Kategoria if necessary */
    post: operations['koulutusKokonaisuusAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/koulutukset/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['koulutusKokonaisuusGetKoulutus'];
    put: operations['koulutusKokonaisuusUpdateKoulutus'];
    post?: never;
    delete: operations['koulutusKokonaisuusDeleteKoulutus'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/kategoriat/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put: operations['koulutusKokonaisuusUpdateKategoria'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/yksilo/kuva': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['yksiloAddKuva'];
    delete: operations['yksiloDeleteKuva'];
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
    /**
     * Get all vapaa-ajan toiminnot of the user
     * @description This endpoint can be used to get all vapaa-ajan toiminnot of the user.
     *
     */
    get: operations['toimintoGetAll'];
    put?: never;
    /**
     * Adds a new vapaa-ajan toiminto
     * @description This endpoint can be used to add a new vapaa-ajan toiminto.
     *
     */
    post: operations['toimintoAdd'];
    /**
     * Delete the vapaa-ajan toiminto by id
     * @description This endpoint can be used to delete the vapaa-ajan toiminto by id.
     *
     */
    delete: operations['toimintoDelete'];
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
    get: operations['tyopaikkaGetAll'];
    put?: never;
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
    get: operations['toimenkuvaGetAll'];
    put?: never;
    post: operations['toimenkuvaAdd'];
    delete?: never;
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
    get: operations['yksilonOsaaminenFind'];
    put?: never;
    post: operations['yksilonOsaaminenAdd'];
    delete: operations['yksilonOsaaminenDelete'];
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
  '/api/profiili/tyopaikat/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['tyopaikkaDelete'];
    options?: never;
    head?: never;
    patch: operations['tyopaikkaUpdate'];
    trace?: never;
  };
  '/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete: operations['toimenkuvaDelete'];
    options?: never;
    head?: never;
    patch: operations['toimenkuvaUpdate'];
    trace?: never;
  };
  '/api/yksilo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['yksiloGetYksilo'];
    put?: never;
    post?: never;
    delete: operations['yksiloDeleteYksilo'];
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
     * Hae työmahdollisuudet
     * @description Palauttaa työpaikkailmoitukset JSON-muodossa.
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
    get: operations['tyomahdollisuusFindById'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/kategoriat': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['koulutusKokonaisuusGetKategoriat'];
    put?: never;
    post?: never;
    delete?: never;
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
    get: operations['osaaminenFindAll'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/kuvat/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['kuvaGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/csrf': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['csrfCsrf'];
    put?: never;
    post?: never;
    delete?: never;
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
    get?: never;
    put?: never;
    post?: never;
    delete: operations['yksilonOsaaminenDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/profiili/koulutuskokonaisuudet/koulutukset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Deletes one or more Koulutus by ID
     * @description Possible resulting empty Kategoria are alse removed.
     */
    delete: operations['koulutusKokonaisuusDeleteKoulutukset'];
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
      [key: string]: string | undefined;
    };
    PatevyysDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm?: string;
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
    KategoriaDto: {
      /** Format: uuid */
      id?: string;
      nimi?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
    };
    KoulutusDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm?: string;
      /** Format: date */
      loppuPvm?: string;
      osaamiset?: string[];
    };
    KoulutusKategoriaDto: {
      kategoria?: components['schemas']['KategoriaDto'];
      koulutukset?: components['schemas']['KoulutusDto'][];
    };
    KoulutusUpdateResultDto: {
      /** Format: uuid */
      kategoria?: string;
      koulutukset?: string[];
    };
    IdDtoUUID: {
      /** Format: uuid */
      id?: string;
    };
    ToimenkuvaDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      /** Format: date */
      alkuPvm?: string;
      /** Format: date */
      loppuPvm?: string;
      osaamiset?: string[];
    };
    TyopaikkaDto: {
      /** Format: uuid */
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      toimenkuvat?: components['schemas']['ToimenkuvaDto'][];
    };
    OsaamisenLahdeDto: {
      /** @enum {string} */
      tyyppi: 'TOIMENKUVA' | 'KOULUTUS' | 'PATEVYYS';
      /** Format: uuid */
      id: string;
    };
    YksilonOsaaminenLisaysDto: {
      /** @description Reference */
      osaamiset: string[];
      lahde: components['schemas']['OsaamisenLahdeDto'];
    };
    Taidot: {
      kuvaus: string;
    };
    Ehdotus: {
      /** Format: uri */
      id?: string;
      nimi?: string;
      /** Format: uri */
      tyyppi?: string;
      /** Format: double */
      osuvuus?: number;
    };
    CsrfTokenDto: {
      token: string;
      headerName: string;
      parameterName: string;
    };
    YksiloCsrfDto: {
      /** Format: uuid */
      kuva?: string;
      csrf: components['schemas']['CsrfTokenDto'];
    };
    SivuDtoTyomahdollisuusDto: {
      /**
       * Format: int64
       * @example 10
       */
      maara?: number;
      /**
       * Format: int32
       * @example 1
       */
      sivuja?: number;
      sisalto?: components['schemas']['TyomahdollisuusDto'][];
    };
    TyomahdollisuusDto: {
      /** Format: uuid */
      id: string;
      otsikko: components['schemas']['LokalisoituTeksti'];
      tiivistelma?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
    };
    ArvoDto: {
      arvo?: string;
      /** Format: double */
      osuus?: number;
    };
    JakaumaDto: {
      /** Format: int32 */
      maara?: number;
      /** Format: int32 */
      tyhjia?: number;
      arvot?: components['schemas']['ArvoDto'][];
    };
    TyomahdollisuusFullDto: {
      /** Format: uuid */
      id: string;
      otsikko: components['schemas']['LokalisoituTeksti'];
      tiivistelma?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      jakaumat?: {
        [key: string]: components['schemas']['JakaumaDto'] | undefined;
      };
    };
    OsaaminenDto: {
      /** Format: uri */
      uri?: string;
      nimi?: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
    };
    YksilonOsaaminenDto: {
      /** Format: uuid */
      id?: string;
      osaaminen?: components['schemas']['OsaaminenDto'];
      lahde?: components['schemas']['OsaamisenLahdeDto'];
    };
    CsrfToken: {
      token?: string;
      headerName?: string;
      parameterName?: string;
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
        'application/json': components['schemas']['ToimintoDto'];
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
  koulutusKokonaisuusFindAll: {
    parameters: {
      query?: {
        kategoria?: string;
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
          'application/json': components['schemas']['KoulutusKategoriaDto'][];
        };
      };
    };
  };
  koulutusKokonaisuusUpdate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['KoulutusKategoriaDto'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusUpdateResultDto'];
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
        'application/json': components['schemas']['KoulutusKategoriaDto'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KoulutusUpdateResultDto'];
        };
      };
    };
  };
  koulutusKokonaisuusGetKoulutus: {
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
          'application/json': components['schemas']['KoulutusDto'];
        };
      };
    };
  };
  koulutusKokonaisuusUpdateKoulutus: {
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
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  koulutusKokonaisuusDeleteKoulutus: {
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
  koulutusKokonaisuusUpdateKategoria: {
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
        'application/json': components['schemas']['KategoriaDto'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  yksiloAddKuva: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: {
      content: {
        'multipart/form-data': {
          /** Format: binary */
          file: string;
        };
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': string;
        };
      };
    };
  };
  yksiloDeleteKuva: {
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
  toimintoGetAll: {
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
  toimintoDelete: {
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
  tyopaikkaGetAll: {
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
  toimenkuvaGetAll: {
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
  yksilonOsaaminenFind: {
    parameters: {
      query?: {
        tyyppi?: 'TOIMENKUVA' | 'KOULUTUS' | 'PATEVYYS';
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
  yksilonOsaaminenAdd: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['YksilonOsaaminenLisaysDto'];
      };
    };
    responses: {
      /** @description Created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IdDtoUUID'][];
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
  tyomahdollisuudetCreateEhdotus: {
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
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': unknown;
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
        'application/json': components['schemas']['Taidot'];
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
        'application/json': components['schemas']['TyopaikkaDto'];
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
  yksiloGetYksilo: {
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
  yksiloDeleteYksilo: {
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
  tyomahdollisuusFindAll: {
    parameters: {
      query?: {
        sivu?: number;
        koko?: number;
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
  koulutusKokonaisuusGetKategoriat: {
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
          'application/json': components['schemas']['KategoriaDto'][];
        };
      };
    };
  };
  osaaminenFindAll: {
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
          'application/json': components['schemas']['OsaaminenDto'][];
        };
      };
    };
  };
  kuvaGet: {
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
          'application/json': string;
        };
      };
    };
  };
  csrfCsrf: {
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
          'application/json': components['schemas']['CsrfToken'];
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
  koulutusKokonaisuusDeleteKoulutukset: {
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
}
