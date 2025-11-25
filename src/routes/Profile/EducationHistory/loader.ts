import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';

import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data = [], error } = await client.GET('/api/profiili/koulutuskokonaisuudet', {
    signal: request.signal,
  });
  if (error) {
    throw error;
  }

  const koulutuskokonaisuudet = data.map((kk) => ({
    ...kk,
    nimi: kk.nimi,
    koulutukset: kk.koulutukset?.map((koulutus) => ({
      ...koulutus,
      nimi: koulutus.nimi,
      kuvaus: koulutus.kuvaus,
    })),
  }));

  const osaamisetMap = (
    await osaamiset.combine(
      koulutuskokonaisuudet
        .map((koulutuskokonaisuus) => koulutuskokonaisuus.koulutukset ?? [])
        .map((koulutus) => koulutus.map((k) => k.osaamiset ?? []))
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

  return { koulutuskokonaisuudet, osaamisetMap };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
