import type { components } from '@/api/schema';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { mapKoulutusCodesToLabels } from '@/utils/codes/codes';

import { ammatit } from './ammatit';
import { client } from './client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from './mahdollisuusService';

/** An opportunity suggested by kohtaanto, with the details needed to show it as a card. */
export type SamankaltainenMahdollisuus = TypedMahdollisuus & {
  /** Match score of the suggestion (0-1) */
  pisteet?: number;
};

export interface Samankaltaiset {
  /**
   * Työmahdollisuudet and koulutusmahdollisuudet together. The opportunities of the same type as the source
   * opportunity come first, as the scores of the different types are not comparable. Each type is ordered by the score.
   */
  opportunities: SamankaltainenMahdollisuus[];
  /** Names of the ammattiryhmat of the opportunities by their URIs */
  ammattiryhmaNimet: Record<string, components['schemas']['LokalisoituTeksti']>;
}

export interface KohtaantoSamankaltaisetSource {
  /** ID of the opportunity the similar opportunities are searched for */
  id: string;
  /** Type of the opportunity the similar opportunities are searched for */
  tyyppi: MahdollisuusTyyppi;
}

const emptySamankaltaiset = (): Samankaltaiset => ({
  opportunities: [],
  ammattiryhmaNimet: {},
});

const withKoulutusalaLabels = (koulutusmahdollisuudet: TypedMahdollisuus[]) =>
  mapKoulutusCodesToLabels(koulutusmahdollisuudet).catch(() =>
    koulutusmahdollisuudet.map((m) => ({ ...m, yleisinKoulutusala: undefined })),
  );

const fetchSuggestions = async ({ id, tyyppi }: KohtaantoSamankaltaisetSource, signal?: AbortSignal) => {
  // The suggestions are the same in all languages and depend only on the path, so they are cached by CloudFront
  const options = { params: { path: { id } }, signal };
  const { data } =
    tyyppi === 'TYOMAHDOLLISUUS'
      ? await client.GET('/api/tyomahdollisuudet/{id}/samankaltaiset', options)
      : await client.GET('/api/koulutusmahdollisuudet/{id}/samankaltaiset', options);
  return data ?? [];
};

const fetchKohtaantoSamankaltaiset = async (
  source: KohtaantoSamankaltaisetSource,
  signal?: AbortSignal,
): Promise<Samankaltaiset> => {
  // Filtered and ordered by the backend
  const suggestions = await fetchSuggestions(source, signal);

  const idsByType = (tyyppi: MahdollisuusTyyppi) => suggestions.filter((s) => s.tyyppi === tyyppi).map((s) => s.id);

  const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
    getTypedTyoMahdollisuusDetails(idsByType('TYOMAHDOLLISUUS')),
    getTypedKoulutusMahdollisuusDetails(idsByType('KOULUTUSMAHDOLLISUUS')).then(withKoulutusalaLabels),
  ]);

  const detailsById = new Map([...tyomahdollisuudet, ...koulutusmahdollisuudet].map((m) => [m.id, m]));
  const opportunities = suggestions.flatMap(({ id, pisteet }): SamankaltainenMahdollisuus[] => {
    const mahdollisuus = detailsById.get(id);
    return mahdollisuus ? [{ ...mahdollisuus, pisteet }] : [];
  });

  const ammattiryhmaUris = [
    ...new Set(tyomahdollisuudet.flatMap((m) => (m.ammattiryhma?.uri ? [m.ammattiryhma.uri] : []))),
  ];
  const ammattiryhmat = await ammatit.find(ammattiryhmaUris, signal);

  return {
    opportunities,
    ammattiryhmaNimet: Object.fromEntries(ammattiryhmat.map((ar) => [ar.uri, ar.nimi])),
  };
};

/**
 * Fetches opportunities similar to the given opportunity using the kohtaanto suggestions. The backend uses the
 * osaamiset and the description of the opportunity as the input of the suggestions and leaves out the opportunity
 * itself. The best matches scoring at least 0.5, at most six of both types, are returned in one list: first the ones
 * of the same type as the opportunity, then the other type, each ordered by the score.
 * Never rejects: resolves to an empty result on an error, as the similar
 * opportunities are supplementary content and must not break the page.
 */
export const getKohtaantoSamankaltaiset = async (
  source: KohtaantoSamankaltaisetSource,
  signal?: AbortSignal,
): Promise<Samankaltaiset> => {
  try {
    return await fetchKohtaantoSamankaltaiset(source, signal);
  } catch (error) {
    // The result is not awaited by the loaders, so a rejection would be left unhandled
    if ((error as Error).name !== 'AbortError') {
      console.warn('Failed to fetch similar opportunities', error);
    }
    return emptySamankaltaiset();
  }
};
