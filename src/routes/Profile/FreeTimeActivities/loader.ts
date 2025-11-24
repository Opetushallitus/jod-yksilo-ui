import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';

import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data = [], error } = await client.GET('/api/profiili/vapaa-ajan-toiminnot', {
    signal: request.signal,
  });
  if (error) {
    throw error;
  }

  const vapaaAjanToiminnot = data.map((vapaaAjanToiminto) => ({
    ...vapaaAjanToiminto,
    nimi: vapaaAjanToiminto.nimi,
    patevyydet: vapaaAjanToiminto.patevyydet?.map((patevyys) => ({
      ...patevyys,
      nimi: patevyys.nimi,
      kuvaus: patevyys.kuvaus,
    })),
  }));

  const osaamisetMap = (
    await osaamiset.combine(
      vapaaAjanToiminnot
        .map((vapaaAjanToiminto) => vapaaAjanToiminto.patevyydet ?? [])
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
