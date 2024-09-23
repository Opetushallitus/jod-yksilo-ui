import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { LoaderFunction } from 'react-router-dom';

const loader = (async ({ request, params }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const jobOpportunity = await client.GET('/api/tyomahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  const results = await osaamiset.combine(
    jobOpportunity.data?.jakaumat?.osaaminen?.arvot,
    (value) => value.arvo,
    (_, osaaminen) => osaaminen,
    request.signal,
  );
  return { tyomahdollisuus: jobOpportunity.data, osaamiset: results };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
