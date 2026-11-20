import type { components } from '../src/api/schema';
import type { OpintopolkuKoulutusResponse } from '../src/utils/opintopolku';
import { competences, educationCompetences, freetimeCompetences } from './data';

type Schemas = components['schemas'];

const esco = (id: string) => `http://data.europa.eu/esco/skill/${id}`;

/** Competences made up for the tests, in addition to the real ESCO competences of `data.ts`. */
const testOsaamiset: Schemas['OsaaminenDto'][] = [
  {
    uri: esco('e2e-huvipuisto'),
    nimi: {
      fi: 'valvoa huvipuiston turvallisuutta',
      sv: 'övervaka säkerheten i nöjesparker',
      en: 'monitor amusement park safety',
    },
    kuvaus: {
      fi: 'Valvoa kävijöiden turvallisuutta huvipuistossa.',
      sv: 'Övervaka besökarnas säkerhet.',
      en: 'Monitor the safety of visitors.',
    },
  },
  {
    uri: esco('e2e-pelisaannot'),
    nimi: { fi: 'pelisäännöt', sv: 'spelregler', en: 'game rules' },
    kuvaus: { fi: 'Pelien säännöt ja niiden soveltaminen.', sv: 'Spelens regler.', en: 'The rules of games.' },
  },
  {
    uri: esco('e2e-rahoitus'),
    nimi: { fi: 'hallinnoida rahoitusta', sv: 'förvalta finansiering', en: 'manage funding' },
    kuvaus: {
      fi: 'Hallinnoida hankkeiden rahoitusta.',
      sv: 'Förvalta finansiering.',
      en: 'Manage the funding of projects.',
    },
  },
];

export const osaamiset: Schemas['OsaaminenDto'][] = [
  ...competences.sisalto,
  ...freetimeCompetences.sisalto,
  ...educationCompetences.sisalto,
  ...testOsaamiset,
];

export const ammatit: Schemas['AmmattiDto'][] = [
  {
    uri: 'http://data.europa.eu/esco/occupation/e2e-elainhoitaja',
    koodi: '5164',
    nimi: { fi: 'eläintenhoitaja', sv: 'djurskötare', en: 'animal care attendant' },
    kuvaus: { fi: 'Hoitaa eläimiä.', sv: 'Sköter djur.', en: 'Takes care of animals.' },
  },
];

/**
 * Search words of the fake competence recognition (`POST /api/ehdotus/osaamiset`), which in reality is done by a
 * language model. A text that contains a search word suggests its competences.
 */
export const hakusanat: Record<string, string[]> = {
  kissa: competences.sisalto.map((o) => o.uri),
  uida: freetimeCompetences.sisalto.map((o) => o.uri),
  opetus: educationCompetences.sisalto.map((o) => o.uri),
  puisto: [esco('e2e-huvipuisto')],
  raha: [esco('e2e-pelisaannot'), esco('e2e-rahoitus')],
};

const isco = (code: string) => `http://data.europa.eu/esco/isco/${code}`;

/** Occupation groups (ISCO), shown on job opportunities. They are fetched from `/api/ammatit` too. */
export const ammattiryhmat: Schemas['AmmattiDto'][] = [
  // Upper level groups, used by the occupation group filter.
  { uri: isco('C1'), koodi: '1', nimi: { fi: 'Johtajat', sv: 'Chefer', en: 'Managers' } },
  {
    uri: isco('C5'),
    koodi: '5',
    nimi: {
      fi: 'Palvelu- ja myyntityöntekijät',
      sv: 'Service- och försäljningsarbetare',
      en: 'Service and sales workers',
    },
  },
  {
    uri: isco('C9'),
    koodi: '9',
    nimi: { fi: 'Muut työntekijät', sv: 'Övriga arbetstagare', en: 'Elementary occupations' },
  },
  {
    uri: isco('C9629'),
    koodi: '9629',
    nimi: {
      fi: 'Muut muualla luokittelemattomat työntekijät',
      sv: 'Övriga arbetare',
      en: 'Elementary workers not elsewhere classified',
    },
  },
  {
    uri: isco('C1431'),
    koodi: '1431',
    nimi: {
      fi: 'Urheilu-, vapaa-ajan- ja kulttuurikeskusten johtajat',
      sv: 'Chefer för fritidsanläggningar',
      en: 'Sports, recreation and cultural centre managers',
    },
  },
  {
    uri: isco('C5164'),
    koodi: '5164',
    nimi: { fi: 'Lemmikkieläinten hoitajat', sv: 'Djurskötare', en: 'Pet groomers and animal care workers' },
  },
];

const jakauma = (arvot: string[]): Schemas['JakaumaDto'] => ({
  maara: arvot.length,
  tyhjia: 0,
  arvot: arvot.map((arvo) => ({ arvo, osuus: 100 / arvot.length })),
});

const text = (fi: string, sv = `${fi} (sv)`, en = `${fi} (en)`) => ({ fi, sv, en });

/** A job opportunity, with the metadata of an opportunity suggestion and the competences it requires. */
export interface Tyomahdollisuus {
  dto: Schemas['TyomahdollisuusFullDto'];
  meta: Omit<Schemas['EhdotusMetadata'], 'aakkosIndeksi' | 'pisteet'>;
  osaamiset: string[];
}

/** An education opportunity, with the metadata of an opportunity suggestion and the competences it gives. */
export interface Koulutusmahdollisuus {
  dto: Schemas['KoulutusmahdollisuusFullDto'];
  meta: Omit<Schemas['EhdotusMetadata'], 'aakkosIndeksi' | 'pisteet'>;
  osaamiset: string[];
}

const tyomahdollisuus = (
  id: string,
  otsikko: string,
  ammattiryhma: string,
  aineisto: 'TMT' | 'AMMATTITIETO',
  maakunnat: string[],
  osaamiset: string[],
): Tyomahdollisuus => ({
  dto: {
    id,
    otsikko: text(otsikko),
    tiivistelma: text(`${otsikko} tekee monipuolisia tehtäviä.`),
    kuvaus: text(`${otsikko} on työmahdollisuus testejä varten.`),
    tehtavat: text(`${otsikko}n tehtävät.`),
    yleisetVaatimukset: text(`${otsikko}n vaatimukset.`),
    ammattiryhma: { uri: isco(ammattiryhma), mediaaniPalkka: 3000, kohtaanto: 'TASAPAINO' },
    aineisto,
    aktiivinen: true,
    jakaumat: { osaaminen: jakauma(osaamiset), maakunta: jakauma(maakunnat) },
  },
  meta: {
    tyyppi: 'TYOMAHDOLLISUUS',
    ammattiryhma: isco(ammattiryhma),
    aineisto,
    maakunnat,
    osaamisia: osaamiset.length,
  },
  osaamiset,
});

const koulutusmahdollisuus = (
  id: string,
  otsikko: string,
  tyyppi: 'TUTKINTO' | 'EI_TUTKINTO',
  kestoKk: number,
  osaamiset: string[],
): Koulutusmahdollisuus => ({
  dto: {
    id,
    tyyppi,
    otsikko: text(otsikko),
    tiivistelma: text(`${otsikko} antaa valmiudet alalle.`),
    kuvaus: text(`${otsikko} on koulutusmahdollisuus testejä varten.`),
    kesto: { minimi: kestoKk, mediaani: kestoKk, maksimi: kestoKk },
    koulutukset: [],
    aktiivinen: true,
    jakaumat: { osaaminen: jakauma(osaamiset) },
  },
  meta: {
    tyyppi: 'KOULUTUSMAHDOLLISUUS',
    koulutusmahdollisuusTyyppi: tyyppi,
    kesto: kestoKk,
    kestoMinimi: kestoKk,
    kestoMaksimi: kestoKk,
    osaamisia: osaamiset.length,
  },
  osaamiset,
});

const [elainKaytos, elainAnatomia, elainVirikkeet] = competences.sisalto.map((o) => o.uri);
const huvipuisto = esco('e2e-huvipuisto');
const pelisaannot = esco('e2e-pelisaannot');
const rahoitus = esco('e2e-rahoitus');

// Maakunta codes: 01 Uusimaa, 10 Etelä-Savo.
export const tyomahdollisuudet: Tyomahdollisuus[] = [
  tyomahdollisuus('a0000000-0000-4000-8000-000000000001', 'Laitetyöntekijä', 'C9629', 'TMT', ['01'], [huvipuisto]),
  tyomahdollisuus(
    'a0000000-0000-4000-8000-000000000002',
    'Huvipuistonjohtaja',
    'C1431',
    'AMMATTITIETO',
    ['10'],
    [huvipuisto, rahoitus, pelisaannot],
  ),
  tyomahdollisuus(
    'a0000000-0000-4000-8000-000000000003',
    'Eläintenhoitaja',
    'C5164',
    'AMMATTITIETO',
    ['01'],
    [elainKaytos, elainAnatomia, elainVirikkeet],
  ),
];

export const koulutusmahdollisuudet: Koulutusmahdollisuus[] = [
  {
    ...koulutusmahdollisuus('b0000000-0000-4000-8000-000000000001', 'Vartijan koulutus', 'EI_TUTKINTO', 3, [
      huvipuisto,
    ]),
  },
  koulutusmahdollisuus('b0000000-0000-4000-8000-000000000002', 'Liiketalouden perustutkinto', 'TUTKINTO', 36, [
    rahoitus,
    pelisaannot,
  ]),
  koulutusmahdollisuus('b0000000-0000-4000-8000-000000000003', 'Eläintenhoidon ammattitutkinto', 'TUTKINTO', 24, [
    elainKaytos,
    elainVirikkeet,
  ]),
];

const VARTIJAKOULUTUS_OID = '1.2.246.562.13.00000000000000000001';
koulutusmahdollisuudet[0].dto.koulutukset = [{ oid: VARTIJAKOULUTUS_OID, nimi: text('Vartijan peruskoulutus') }];

export const opintopolkuKoulutukset: OpintopolkuKoulutusResponse[] = [
  {
    oid: VARTIJAKOULUTUS_OID,
    nimi: text('Vartijan peruskoulutus'),
    metadata: {
      kuvaus: text('Koulutus antaa valmiudet vartijan tehtäviin.'),
      opintojenLaajuusNumero: 7,
      opintojenLaajuusNumeroMin: undefined,
      opintojenLaajuusNumeroMax: undefined,
      opintojenLaajuusyksikko: { nimi: text('opintopistettä') },
    },
  },
];
