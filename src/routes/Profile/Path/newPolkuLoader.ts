import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction, redirect } from 'react-router';

export default (async ({ request, params }) => {
  const response = await client.GET('/api/profiili/tavoitteet', { signal: request.signal });
  const { tavoiteId, suunnitelmaId } = params;
  const tavoitteet = response.data ?? [];
  const tavoite = tavoitteet.find((item) => item.id === tavoiteId);

  if (!tavoite) {
    throw new Error('Päämäärä not found');
  }

  const mahdollisuusOpts = {
    signal: request.signal,
    params: { path: { id: tavoite.mahdollisuusId } },
  };
  const clientFn =
    tavoite?.mahdollisuusTyyppi === 'KOULUTUSMAHDOLLISUUS'
      ? client.GET('/api/koulutusmahdollisuudet/{id}', mahdollisuusOpts)
      : client.GET('/api/tyomahdollisuudet/{id}', mahdollisuusOpts);

  const { data: mahdollisuus } = await clientFn;

  // If suunnitelmaId is not present, do a POST call to create a new polku and redirect there
  if (mahdollisuus && tavoiteId && !suunnitelmaId) {
    try {
      const { data: polkuId } = await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
        body: {
          nimi: mahdollisuus.otsikko,
        },
        params: { path: { id: tavoiteId } },
      });
      return redirect(polkuId!);
    } catch (_) {
      // Failed to create a new empty path
    }
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
