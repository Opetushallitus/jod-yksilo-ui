import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export interface CompetencesLoaderData {
  osaamiset: OsaaminenApiResponse[];
  toimenkuvat: components['schemas']['ToimenkuvaDto'][];
  koulutukset: components['schemas']['KoulutusDto'][];
  patevyydet: components['schemas']['PatevyysDto'][];
}

const filterItems = <T extends { id?: string }>(items: T[], osaaminenLahdeIds: string[]): T[] =>
  items.filter((item) => item.id && osaaminenLahdeIds.includes(item.id));

export default (async ({ request }) => {
  const { data: osaamiset, error } = await client.GET('/api/profiili/osaamiset', { signal: request.signal });
  const { data: tyopaikat } = await client.GET('/api/profiili/tyopaikat', { signal: request.signal });
  const { data: koulut } = await client.GET('/api/profiili/koulutuskokonaisuudet', { signal: request.signal });
  const { data: vapaaAjanToiminnot } = await client.GET('/api/profiili/vapaa-ajan-toiminnot', {
    signal: request.signal,
  });

  const osaaminenLahdeIds = (osaamiset?.filter((o) => o.lahde.id).map((o) => o.lahde.id) ?? []) as string[];

  /*
    Each main category (työpaikka, koulu, vapaa-ajan toiminto) has its own array of subcategories:
      - tyopaikat -> toimenkuvat
      - koulut -> koulutukset
      - vapaaAjanToiminnot -> patevyydet

    Each item in subcategories will be compared against "osaamiset", which contains all the competences for the user.
    This is done to eliminate the chance for competences that aren't tied to any categories.

    The resulting data will be used to populate the Competences page.
  */
  const toimenkuvat =
    tyopaikat?.flatMap((tyopaikka) => filterItems(tyopaikka.toimenkuvat ?? [], osaaminenLahdeIds)) ?? [];

  const patevyydet =
    vapaaAjanToiminnot?.flatMap((toiminto) => filterItems(toiminto.patevyydet ?? [], osaaminenLahdeIds)) ?? [];

  const koulutukset = koulut?.flatMap((koulu) => filterItems(koulu.koulutukset ?? [], osaaminenLahdeIds)) ?? [];
  if (!error) {
    return { osaamiset, toimenkuvat, koulutukset, patevyydet } as CompetencesLoaderData;
  }
  return { osaamiset: [], toimenkuvat: [], koulutukset: [], patevyydet: [] } as CompetencesLoaderData;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
