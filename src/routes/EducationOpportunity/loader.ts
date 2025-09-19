import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import type { EducationCodeSetValues, Jakauma, KoulutusmahdollisuusJakaumat } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { sortByProperty } from '@/utils';
import { getEducationCodesetValues } from '@/utils/codes/codes';
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
  const mapToArvo = (arvo: components['schemas']['ArvoDto']) => arvo.arvo;
  const codesetValues: EducationCodeSetValues = {
    aika: jakaumat.aika ? await getEducationCodesetValues(jakaumat.aika.arvot.map(mapToArvo)) : [],
    opetustapa: jakaumat.opetustapa ? await getEducationCodesetValues(jakaumat.opetustapa.arvot.map(mapToArvo)) : [],
    koulutusala: jakaumat.koulutusala ? await getEducationCodesetValues(jakaumat.koulutusala.arvot.map(mapToArvo)) : [],
  };
  const osaamiset = await osaamisetService.combine(
    koulutusmahdollisuus?.jakaumat?.osaaminen?.arvot,
    (value) => value.arvo,
    (_, osaaminen) => osaaminen,
    request.signal,
  );

  if (context) {
    await useToolStore.getState().updateSuosikit(true);
  }

  return { codesetValues, jakaumat, koulutusmahdollisuus, osaamiset, isLoggedIn: !!context };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
