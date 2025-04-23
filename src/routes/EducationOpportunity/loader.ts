import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import type { Jakauma, KoulutusmahdollisuusJakaumat } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { sortByProperty } from '@/utils';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request, params, context }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const { data } = await client.GET('/api/koulutusmahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });
  const koulutusmahdollisuus = data as components['schemas']['KoulutusmahdollisuusFullDto'];
  const jakaumat = koulutusmahdollisuus?.jakaumat as unknown as KoulutusmahdollisuusJakaumat;

  if (jakaumat) {
    Object.values(jakaumat).forEach((jakauma: Jakauma) => {
      if (jakauma.arvot) {
        jakauma.arvot.sort(sortByProperty('osuus', true));
      }
    });
  }

  const osaamiset = await osaamisetService.combine(
    koulutusmahdollisuus?.jakaumat?.osaaminen?.arvot,
    (value) => value.arvo,
    (_, osaaminen) => osaaminen,
    request.signal,
  );

  if (context) {
    await useToolStore.getState().updateSuosikit(true);
  }

  return { jakaumat, koulutusmahdollisuus, osaamiset, isLoggedIn: !!context };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
