import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  const { data: vapaaAjanToiminnot, error } = await client.GET('/api/profiili/vapaa-ajan-toiminnot', {
    signal: request.signal,
  });
  if (error) {
    throw error;
  }

  const osaamisetMap = (
    await osaamiset.combine(
      vapaaAjanToiminnot
        ?.map((vapaaAjanToiminto) => vapaaAjanToiminto.patevyydet ?? [])
        .map((patevyys) => patevyys.map((p) => p.osaamiset ?? []))
        .flat()
        .flat() ?? [],
      (e) => e,
      (_, o) => {
        return {
          id: o.uri,
          nimi: o.nimi,
          kuvaus: o.kuvaus,
        };
      },
      request.signal,
    )
  ).reduce<
    Record<
      string,
      {
        id: string;
        nimi: Record<string, string>;
        kuvaus: Record<string, string>;
      }
    >
  >((acc, obj) => {
    acc[obj.id] = obj;
    return acc;
  }, {});

  return { vapaaAjanToiminnot, osaamisetMap };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
