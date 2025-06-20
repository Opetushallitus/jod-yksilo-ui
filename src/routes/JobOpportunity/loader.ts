import { ammatit } from '@/api/ammatit';
import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import type { Codeset, CodesetValues, Jakauma, TyomahdollisuusJakaumat } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { sortByProperty } from '@/utils';
import { getCodesetValue } from '@/utils/codes/codes';
import { LoaderFunction } from 'react-router';

const loader = (async ({ request, params, context }) => {
  if (!params.id) {
    throw new Response('Bad request', { status: 400 });
  }

  const { data } = await client.GET('/api/tyomahdollisuudet/{id}', {
    signal: request.signal,
    params: { path: { id: params.id } },
  });

  const tyomahdollisuus = data as components['schemas']['TyomahdollisuusFullDto'];
  const jakaumat = tyomahdollisuus?.jakaumat as unknown as TyomahdollisuusJakaumat;

  if (jakaumat) {
    Object.values(jakaumat).forEach((jakauma: Jakauma) => {
      if (jakauma.arvot) {
        jakauma.arvot.sort(sortByProperty('osuus', true));
      }
    });
  }

  const mapArvoToCodeValue = (codeset: Codeset) => (arvo: components['schemas']['ArvoDto']) =>
    getCodesetValue(codeset, arvo.arvo).then((value) => ({ code: arvo.arvo, value }));

  const codesetValues: CodesetValues = {
    kunta: jakaumat.kunta ? await Promise.all(jakaumat.kunta.arvot.map(mapArvoToCodeValue('kunta'))) : [],
    maa: jakaumat.maa ? await Promise.all(jakaumat.maa.arvot.map(mapArvoToCodeValue('maa'))) : [],
    maakunta: jakaumat.maakunta ? await Promise.all(jakaumat.maakunta.arvot.map(mapArvoToCodeValue('maakunta'))) : [],
    tyokieli: jakaumat.tyokieli ? await Promise.all(jakaumat.tyokieli.arvot.map(mapArvoToCodeValue('tyokieli'))) : [],
  };

  const [competences, occupations, occupationGroup] = await Promise.all([
    osaamiset.combine(
      tyomahdollisuus?.jakaumat?.osaaminen?.arvot,
      (value) => value.arvo,
      (value, osaaminen) => ({ ...osaaminen, osuus: value.osuus }),
      request.signal,
    ),
    ammatit.combine(
      tyomahdollisuus?.jakaumat?.ammatti?.arvot,
      (value) => value.arvo,
      (value, occupation) => ({ ...occupation, osuus: value.osuus }),
      request.signal,
    ),
    ammatit.get(tyomahdollisuus?.ammattiryhma ?? '', request.signal),
  ]);

  if (context) {
    await useToolStore.getState().updateSuosikit(true);
    const { data = [] } = await client.GET('/api/profiili/osaamiset');

    const omatRelevantOsaamiset = data.filter((osaaminen) =>
      competences.some((c) => c.uri === osaaminen.osaaminen.uri),
    );

    useToolStore.getState().setOsaamiset(
      omatRelevantOsaamiset.map((x) => ({
        id: x.osaaminen.uri,
        kuvaus: x.osaaminen.kuvaus,
        nimi: x.osaaminen.nimi,
      })),
    );
  }
  return {
    tyomahdollisuus,
    osaamiset: competences,
    ammatit: occupations,
    ammattiryhma: occupationGroup,
    jakaumat,
    codesetValues,
    isLoggedIn: !!context,
  };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;

export type LoaderData = Awaited<ReturnType<typeof loader>>;
export default loader;
