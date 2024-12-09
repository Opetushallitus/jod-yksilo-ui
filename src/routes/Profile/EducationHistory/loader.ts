import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data: koulutuskokonaisuudet, error } = await client.GET('/api/profiili/koulutuskokonaisuudet', {
    signal: request.signal,
  });
  if (error) {
    throw error;
  }

  const osaamisetMap = (
    await osaamiset.combine(
      koulutuskokonaisuudet
        ?.map((koulutuskokonaisuus) => koulutuskokonaisuus.koulutukset ?? [])
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
