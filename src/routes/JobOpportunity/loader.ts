import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { useToolStore } from '@/stores/useToolStore';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request, params, context }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const { data } = await client.GET('/api/tyomahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  data?.jakaumat?.ammatti?.arvot?.sort((a, b) => b.osuus - a.osuus);
  data?.jakaumat?.osaaminen?.arvot?.sort((a, b) => b.osuus - a.osuus);

  const [competences, occupations, occupationGroup] = await Promise.all([
    osaamiset.combine(
      data?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
      request.signal,
    ),
    ammatit.combine(
      data?.jakaumat?.ammatti?.arvot,
      (value) => value.arvo,
      (value, occupation) => ({ ...occupation, osuus: value.osuus }),
      request.signal,
    ),
    ammatit.get(data?.ammattiryhma ?? '', request.signal),
  ]);

  if (context) {
    await useToolStore.getState().updateSuosikit(true);
  }

  return {
    tyomahdollisuus: data,
    osaamiset: competences,
    ammatit: occupations,
    ammattiryhma: occupationGroup,
    isLoggedIn: !!context,
  };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
