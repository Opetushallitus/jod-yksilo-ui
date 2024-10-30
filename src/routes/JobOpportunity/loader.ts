import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { LoaderFunction } from 'react-router-dom';

const loader = (async ({ request, params }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const { data } = await client.GET('/api/tyomahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  data?.jakaumat?.ammatti?.arvot?.sort((a, b) => b.osuus - a.osuus);
  data?.jakaumat?.osaaminen?.arvot?.sort((a, b) => b.osuus - a.osuus);

  const [competences, occupations] = await Promise.all([
    osaamiset.combine(
      data?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (_, osaaminen) => osaaminen,
      request.signal,
    ),
    ammatit.combine(
      data?.jakaumat?.ammatti?.arvot,
      (value) => value.arvo,
      (value, occupation) => ({ ...occupation, osuus: value.osuus }),
      request.signal,
    ),
  ]);

  return { tyomahdollisuus: data, osaamiset: competences, ammatit: occupations };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
