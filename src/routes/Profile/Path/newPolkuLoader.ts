import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction, redirect } from 'react-router';

export default (async ({ request, params }) => {
  const response = await client.GET('/api/profiili/paamaarat', { signal: request.signal });
  const { paamaaraId, suunnitelmaId } = params;
  const paamaarat = response.data ?? [];
  const paamaara = paamaarat.find((item) => item.id === paamaaraId);

  if (!paamaara) {
    throw new Error('Päämäärä not found');
  }

  const mahdollisuusOpts = {
    signal: request.signal,
    params: { path: { id: paamaara.mahdollisuusId } },
  };
  const clientFn =
    paamaara?.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
      ? client.GET('/api/koulutusmahdollisuudet/{id}', mahdollisuusOpts)
      : client.GET('/api/tyomahdollisuudet/{id}', mahdollisuusOpts);

  const { data: mahdollisuus } = await clientFn;

  // If suunnitelmaId is not present, do a POST call to create a new polku and redirect there
  if (mahdollisuus && paamaaraId && !suunnitelmaId) {
    try {
      const { data: polkuId } = await client.POST('/api/profiili/paamaarat/{id}/suunnitelmat', {
        body: {
          nimi: mahdollisuus.otsikko,
        },
        params: { path: { id: paamaaraId } },
      });
      return redirect(polkuId!);
    } catch (_) {
      // Failed to create a new empty path
    }
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
