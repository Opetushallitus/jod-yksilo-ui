import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { initializeLocalizedText } from '@/utils';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data = [], error } = await client.GET('/api/profiili/tyopaikat', { signal: request.signal });
  if (error) {
    throw error;
  }
  const tyopaikat = data.map((tp) => ({
    ...tp,
    nimi: initializeLocalizedText(tp.nimi),
    toimenkuvat: tp.toimenkuvat?.map((tk) => ({
      ...tk,
      nimi: initializeLocalizedText(tk.nimi),
      kuvaus: initializeLocalizedText(tk.kuvaus),
    })),
  }));

  const osaamisetMap = (
    await osaamiset.combine(
      tyopaikat
        .map((tyopaikka) => tyopaikka.toimenkuvat ?? [])
        .map((toimenkuva) => toimenkuva.map((tk) => tk.osaamiset ?? []))
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

  return { tyopaikat, osaamisetMap };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
