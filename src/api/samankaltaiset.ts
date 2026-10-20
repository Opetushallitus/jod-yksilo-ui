import type { components } from '@/api/schema';
import i18n, { type LangCode } from '@/i18n/config';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';

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

/** Number of the best matching opportunities returned for each type. */
const KOHTAANTO_RESULTS_PER_TYPE = 6;
/** Suggestions scoring below this (0-1) are not similar enough to be returned. */
export const KOHTAANTO_MIN_SCORE = 0.5;
// Limits of the request validation in the backend
const MAX_OSAAMISET = 1000;
const MAX_FREE_TEXT_LENGTH = 10000;

export interface KohtaantoSamankaltaisetSource {
  /** Type of the opportunity the similar opportunities are searched for */
  tyyppi: MahdollisuusTyyppi;
  description: string;
  /** URIs of all the osaamiset of the opportunity */
  osaamiset: string[];
}

const emptySamankaltaiset = (): Samankaltaiset => ({
  opportunities: [],
  ammattiryhmaNimet: {},
});

const fetchKohtaantoSamankaltaiset = async (
  lahdeId: string,
  { tyyppi: lahdeTyyppi, description, osaamiset }: KohtaantoSamankaltaisetSource,
  signal?: AbortSignal,
): Promise<Samankaltaiset> => {
  const osaamisetVapaateksti = description.trim().slice(0, MAX_FREE_TEXT_LENGTH);

  // Without any input the suggestions are not ranked, so there is nothing meaningful to show
  if (osaamiset.length === 0 && osaamisetVapaateksti === '') {
    return emptySamankaltaiset();
  }

  const { data } = await client.POST('/api/ehdotus/mahdollisuudet', {
    body: {
      osaamiset: osaamiset.slice(0, MAX_OSAAMISET),
      osaamisetVapaateksti,
      osaamisPainotus: 1,
      kiinnostukset: [],
      kiinnostusPainotus: 0,
      escoListPainotus: 0.5,
      openTextPainotus: 0.5,
    },
    signal,
    headers: { 'Content-Language': i18n.language as LangCode },
  });

  const byScoreDescending = (a: { pisteet?: number }, b: { pisteet?: number }) => (b.pisteet ?? 0) - (a.pisteet ?? 0);
  // The scores of työmahdollisuudet and koulutusmahdollisuudet are not comparable, so the types are not mixed
  const orderedTypes: MahdollisuusTyyppi[] =
    lahdeTyyppi === 'TYOMAHDOLLISUUS'
      ? ['TYOMAHDOLLISUUS', 'KOULUTUSMAHDOLLISUUS']
      : ['KOULUTUSMAHDOLLISUUS', 'TYOMAHDOLLISUUS'];
  // The suggestions are ordered by the score by the backend, but the order is not relied on
  const similarEnough = (data ?? [])
    .flatMap(({ mahdollisuusId, ehdotusMetadata }) =>
      mahdollisuusId && mahdollisuusId !== lahdeId && ehdotusMetadata
        ? [{ id: mahdollisuusId, tyyppi: ehdotusMetadata.tyyppi, pisteet: ehdotusMetadata.pisteet }]
        : [],
    )
    .filter(({ pisteet }) => (pisteet ?? 0) >= KOHTAANTO_MIN_SCORE)
    .sort(byScoreDescending);
  const suggestions = orderedTypes.flatMap((tyyppi) =>
    similarEnough.filter((s) => s.tyyppi === tyyppi).slice(0, KOHTAANTO_RESULTS_PER_TYPE),
  );

  const idsByType = (tyyppi: MahdollisuusTyyppi) => suggestions.filter((s) => s.tyyppi === tyyppi).map((s) => s.id);

  const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
    getTypedTyoMahdollisuusDetails(idsByType('TYOMAHDOLLISUUS')),
    getTypedKoulutusMahdollisuusDetails(idsByType('KOULUTUSMAHDOLLISUUS')),
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
 * Fetches opportunities similar to the given opportunity using the kohtaanto suggestions. The osaamiset and the
 * description of the opportunity are used as the input of the suggestions. The opportunity itself is left out of the
 * result. The best matches scoring at least {@link KOHTAANTO_MIN_SCORE}, at most six of both types, are returned in
 * one list: first the ones of the same type as the opportunity, then the other type, each ordered by the score.
 * Never rejects: resolves to an empty result on an error, as the similar
 * opportunities are supplementary content and must not break the page.
 */
export const getKohtaantoSamankaltaiset = async (
  lahdeId: string,
  source: KohtaantoSamankaltaisetSource,
  signal?: AbortSignal,
): Promise<Samankaltaiset> => {
  try {
    return await fetchKohtaantoSamankaltaiset(lahdeId, source, signal);
  } catch (error) {
    // The result is not awaited by the loaders, so a rejection would be left unhandled
    if ((error as Error).name !== 'AbortError') {
      console.warn('Failed to fetch similar opportunities', error);
    }
    return emptySamankaltaiset();
  }
};
