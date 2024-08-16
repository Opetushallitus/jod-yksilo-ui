import { client } from '@/api/client';
import { LoaderFunction } from 'react-router-dom';

const loader = (async ({ request, params }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const jobOpportunity = await client.GET('/api/tyomahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  // the list of competences can be quite long, so we split the request into chunks to avoid exceeding the maximum URL length
  // perhaps the API should (also) support POST requests with a body
  const chunks =
    jobOpportunity.data?.jakaumat?.osaaminen?.arvot.reduce<string[][]>((chunks, value, indx) => {
      if (indx % 23 === 0) {
        chunks.push([value.arvo]);
      } else {
        chunks[chunks.length - 1].push(value.arvo);
      }
      return chunks;
    }, []) ?? [];

  const results = await Promise.all(
    chunks.map((uris) =>
      client.GET('/api/osaamiset', {
        signal: request.signal,
        params: { query: { uri: uris, sivu: 0, koko: uris.length } },
      }),
    ),
  );

  return { tyomahdollisuus: jobOpportunity.data, osaamiset: results.flatMap((result) => result.data?.sisalto ?? []) };
}) satisfies LoaderFunction;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
