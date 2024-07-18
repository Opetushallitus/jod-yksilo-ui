import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export interface CompetencesLoaderData {
  osaamiset: OsaaminenApiResponse[];
  toimenkuvat: components['schemas']['ToimenkuvaDto'][];
  koulutukset: components['schemas']['KoulutusDto'][];
  patevyydet: components['schemas']['PatevyysDto'][];
}

export default (async ({ request }) => {
  const { data: osaamiset } = await client.GET('/api/profiili/osaamiset', { signal: request.signal });
  const { data: tyopaikat } = await client.GET('/api/profiili/tyopaikat', { signal: request.signal });
  const { data: koulut } = await client.GET('/api/profiili/koulutuskokonaisuudet', { signal: request.signal });
  const { data: vapaaAjanToiminnot } = await client.GET('/api/profiili/vapaa-ajan-toiminnot', {
    signal: request.signal,
  });

  const osaaminenLahdeIds = osaamiset?.map((o) => o.lahde.id) ?? [];

  /*
    Each main category (työpaikka, koulu, vapaa-ajan toiminto) has its own array of subcategories:
      - tyopaikat -> toimenkuvat
      - koulut -> koulutukset
      - vapaaAjanToiminnot -> patevyydet

    Each item in subcategories will be compared against "osaamiset", which contains all the competences for the user.
    This is done to eliminate the chance for competences that aren't tied to any categories.

    The resulting data will be used to populate the filters in Competences page.
  */
  const toimenkuvat: components['schemas']['ToimenkuvaDto'][] = [];
  tyopaikat?.forEach((tyopaikka) => {
    tyopaikka.toimenkuvat?.forEach((toimenkuva) => {
      if (toimenkuva.id && osaaminenLahdeIds.includes(toimenkuva.id)) {
        toimenkuvat.push(toimenkuva);
      }
    });
  });

  const patevyydet: components['schemas']['PatevyysDto'][] = [];
  vapaaAjanToiminnot?.forEach((toiminto) => {
    toiminto.patevyydet?.forEach((patevyys) => {
      if (patevyys.id && osaaminenLahdeIds.includes(patevyys.id)) {
        patevyydet.push(patevyys);
      }
    });
  });

  const koulutukset: components['schemas']['KoulutusDto'][] = [];
  koulut?.forEach((koulu) => {
    koulu.koulutukset?.forEach((koulutus) => {
      if (koulutus.id && osaaminenLahdeIds.includes(koulutus.id)) {
        koulutukset.push(koulutus);
      }
    });
  });

  return { osaamiset, toimenkuvat, koulutukset, patevyydet } as CompetencesLoaderData;
}) satisfies LoaderFunction;
