import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import i18n, { LangCode } from '@/i18n/config';
import type { Jakauma, KoulutusmahdollisuusJakaumat } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { sortByProperty } from '@/utils';
import { getCodeset, getEducationCodesetValues } from '@/utils/codes/codes';
import { LoaderFunction } from 'react-router';
import { Codeset, type EducationCodeSetValues } from '../../utils/jakaumaUtils';

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

  const mapJakaumaToCodeValue = async (codeset: Codeset, lang: LangCode, jakauma?: Jakauma) => {
    if (!jakauma || !jakauma.arvot || jakauma.arvot.length === 0) {
      return [];
    }
    const codes = await getCodeset(codeset, lang);
    return jakauma.arvot.map((arvo) => ({ code: arvo.arvo, value: codes.get(arvo.arvo) ?? arvo.arvo }));
  };

  const codesetValues: EducationCodeSetValues = {
    aika: jakaumat.aika ? await getEducationCodesetValues(jakaumat.aika.arvot.map(mapToArvo)) : [],
    opetustapa: jakaumat.opetustapa ? await getEducationCodesetValues(jakaumat.opetustapa.arvot.map(mapToArvo)) : [],
    koulutusala: jakaumat.koulutusala ? await getEducationCodesetValues(jakaumat.koulutusala.arvot.map(mapToArvo)) : [],
    kunta: await mapJakaumaToCodeValue('kunta', i18n.language as LangCode, jakaumat.kunta),
    maakunta: await mapJakaumaToCodeValue('maakunta', i18n.language as LangCode, jakaumat.maakunta),
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
