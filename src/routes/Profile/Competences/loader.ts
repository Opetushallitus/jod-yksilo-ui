import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export interface CompetencesLoaderData {
  osaamiset: OsaaminenApiResponse[];
  toimenkuvat: components['schemas']['ToimenkuvaDto'][];
  koulutukset: components['schemas']['KoulutusDto'][];
}

export default (async ({ request }) => {
  const { data: osaamiset } = await client.GET('/api/profiili/osaamiset', { signal: request.signal });
  const { data: tyopaikat } = await client.GET('/api/profiili/tyopaikat', { signal: request.signal });
  const { data: koulutukset } = await client.GET('/api/profiili/koulutukset', { signal: request.signal });

  const toimenkuvat: components['schemas']['ToimenkuvaDto'][] = [];
  const osaaminenLahdeIds = osaamiset?.map((o) => o.lahde?.id);

  tyopaikat?.forEach((x) => {
    x.toimenkuvat?.forEach((tk) => {
      if (osaaminenLahdeIds?.includes(tk.id)) {
        toimenkuvat.push(tk);
      }
    });
  });

  return { osaamiset, toimenkuvat, koulutukset } as CompetencesLoaderData;
}) satisfies LoaderFunction;
