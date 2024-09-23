import { client } from '@/api/client';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';
import { EhdotusData, ehdotusDataToRecord, EhdotusRecord } from './utils';

export interface ToolLoaderData {
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
  tyomahdollisuusEhdotukset: EhdotusRecord;
  tyomahdollisuudet: {
    id: string;
    otsikko: components['schemas']['LokalisoituTeksti'];
    tiivistelma?: components['schemas']['LokalisoituTeksti'];
    kuvaus?: components['schemas']['LokalisoituTeksti'];
  }[];
}

export default (async ({ request, context }) => {
  let osaamiset: components['schemas']['YksilonOsaaminenDto'][] = [];
  if (context) {
    const { data } = await client.GET('/api/profiili/osaamiset', {
      signal: request.signal,
    });
    osaamiset = removeDuplicates(data ?? [], 'osaaminen.uri');
  }

  const { data: tyomahdollisuudetData } = await client.POST('/api/ehdotus/tyomahdollisuudet', {
    body: {
      osaamiset: osaamiset.map((osaaminen) => osaaminen.osaaminen.uri),
    },
  });

  const ehdotukset = ehdotusDataToRecord((tyomahdollisuudetData ?? []) as EhdotusData[]);

  const ids = Object.keys(ehdotukset ?? []);
  ids
    .map((key) => {
      const pisteet = ehdotukset?.[key].pisteet ?? 0;
      return { key, pisteet };
    })
    .sort((a, b) => b.pisteet - a.pisteet)
    .forEach((id) => id.key);

  const { data } = await client.GET('/api/tyomahdollisuudet', {
    params: {
      query: {
        id: ids.slice(0, 30), // TODO: fetch by paging
      },
    },
  });
  // All that has been returned are sorted by the scores
  const results = data?.sisalto ?? [];
  const sortedResults = [...results].sort((a, b) =>
    ehdotukset ? (ehdotukset[b.id]?.pisteet ?? 0) - (ehdotukset[a.id]?.pisteet ?? 0) : 0,
  );

  return { osaamiset, tyomahdollisuusEhdotukset: ehdotukset, tyomahdollisuudet: sortedResults };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
