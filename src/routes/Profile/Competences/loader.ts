import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router';

export interface CompetenceDataGroup {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  data?:
    | components['schemas']['ToimenkuvaDto'][]
    | components['schemas']['PatevyysDto'][]
    | components['schemas']['KoulutusDto'][];
}

export interface CompetencesLoaderData {
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
  toimenkuvat: CompetenceDataGroup[];
  koulutukset: CompetenceDataGroup[];
  patevyydet: CompetenceDataGroup[];
  muutOsaamiset: components['schemas']['OsaaminenDto'][];
  muutOsaamisetVapaateksti?: components['schemas']['LokalisoituTeksti'];
}

/*
  Each main category (työpaikka, koulu, vapaa-ajan toiminto) has its own array of competences:
    - tyopaikat -> toimenkuvat
    - koulut -> koulutukset
    - vapaaAjanToiminnot -> patevyydet

  Each item in competences will be compared against "osaamiset" response, which contains all the competences for the user and nonmatching are filtered out.
  This is done to make. The resulting data will be used to populate the Competences page.

  Muu osaaminen is a special case, as it's not tied to any category.
*/
const filterItems = <T extends { id?: string }>(items: T[], osaaminenLahdeIds: string[]): T[] =>
  items.filter((item) => item.id && osaaminenLahdeIds.includes(item.id));

export default (async ({ request, context }) => {
  try {
    const [osaamisetRes, tyopaikatRes, koulutRes, vapaaAjanToiminnotRes, muuOsaaminenRes] = context
      ? await Promise.all([
          client.GET('/api/profiili/osaamiset', { signal: request.signal }),
          client.GET('/api/profiili/tyopaikat', { signal: request.signal }),
          client.GET('/api/profiili/koulutuskokonaisuudet', { signal: request.signal }),
          client.GET('/api/profiili/vapaa-ajan-toiminnot', { signal: request.signal }),
          client.GET('/api/profiili/muu-osaaminen', { signal: request.signal }),
        ])
      : [null, null, null, null];

    const osaaminenLahdeIds = (osaamisetRes?.data?.filter((o) => o.lahde.id).map((o) => o.lahde.id) ?? []) as string[];

    const muutOsaamiset =
      osaamisetRes?.data?.filter((o) => o.lahde.tyyppi === 'MUU_OSAAMINEN').map((o) => o.osaaminen) ?? [];
    const muutOsaamisetVapaateksti = muuOsaaminenRes?.data?.vapaateksti;

    const toimenkuvat =
      tyopaikatRes?.data?.map((tyopaikka) => ({
        id: tyopaikka.id,
        nimi: tyopaikka.nimi,
        data: filterItems(tyopaikka.toimenkuvat ?? [], osaaminenLahdeIds),
      })) ?? [];

    const patevyydet =
      vapaaAjanToiminnotRes?.data?.map((toiminto) => ({
        id: toiminto.id,
        nimi: toiminto.nimi,
        data: filterItems(toiminto.patevyydet ?? [], osaaminenLahdeIds),
      })) ?? [];

    const koulutukset =
      koulutRes?.data?.map((koulu) => ({
        id: koulu.id,
        nimi: koulu.nimi,
        data: filterItems(koulu.koulutukset ?? [], osaaminenLahdeIds),
      })) ?? [];

    return {
      osaamiset: osaamisetRes?.data ?? [],
      toimenkuvat,
      koulutukset,
      patevyydet,
      muutOsaamiset,
      muutOsaamisetVapaateksti,
    } as CompetencesLoaderData;
  } catch (_e) {
    return {
      osaamiset: [],
      toimenkuvat: [],
      koulutukset: [],
      patevyydet: [],
      muutOsaamiset: [],
    } as CompetencesLoaderData;
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
