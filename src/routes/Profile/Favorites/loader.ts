import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export interface SuosikitLoaderData {
  suosikit: components['schemas']['SuosikkiDto'][];
  tyomahdollisuudet: components['schemas']['TyomahdollisuusDto'][];
  isLoggedIn: boolean;
}
export default (async ({ request, context }) => {
  const { suosikit, tyomahdollisuudet, error } = await client
    .GET('/api/profiili/suosikki', { signal: request.signal })
    .then(async (res) => {
      const suosikit = res.data ?? [];

      if (suosikit.length === 0) {
        return { suosikit: [], tyomahdollisuudet: [], error: null };
      }

      const tyoIds = [...suosikit].filter((s) => s.tyyppi === 'TYOMAHDOLLISUUS').map((s) => s.suosionKohdeId ?? '');

      const { data: tyomahdollisuudet, error } = await client.GET('/api/tyomahdollisuudet', {
        signal: request.signal,
        params: { query: { id: tyoIds } },
      });

      // TODO: Fetch koulutusmahdollisuudet
      const sorted = [...(tyomahdollisuudet?.sisalto ?? [])].sort((a, b) => {
        const aLuotu = suosikit.find((s) => s.suosionKohdeId === a.id)?.luotu ?? '';
        const bLuotu = suosikit.find((s) => s.suosionKohdeId === b.id)?.luotu ?? '';

        if (!aLuotu || !bLuotu) {
          return 0;
        }

        return bLuotu.localeCompare(aLuotu);
      });

      return { suosikit, tyomahdollisuudet: sorted, error };
    });

  if (!error) {
    return { tyomahdollisuudet, suosikit, isLoggedIn: !!context } as SuosikitLoaderData;
  }
  return { tyomahdollisuudet: [], suosikit: [], isLoggedIn: !!context } as SuosikitLoaderData;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
