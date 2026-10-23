import type { RelatedOpportunity } from '@/components/RelatedOpportunities/RelatedOpportunities';
import i18n, { type LangCode } from '@/i18n/config';
import type { MahdollisuusTyyppi, TypedMahdollisuus } from '@/routes/types';
import { getLocalizedText } from '@/utils';

import { client } from './client';
import { getTypedKoulutusMahdollisuusDetails, getTypedTyoMahdollisuusDetails } from './mahdollisuusService';

export type SamankaltaisetByTyyppi = Record<MahdollisuusTyyppi, RelatedOpportunity[]>;

/**
 * Fetches opportunities of the given type that are similar to the given opportunity. Resolves to an empty list on
 * an error response, as the similar opportunities are supplementary content and must not break the page.
 */
const fetchSamankaltaiset = async (
  lahdeTyyppi: MahdollisuusTyyppi,
  id: string,
  kohdeTyyppi: MahdollisuusTyyppi,
  signal?: AbortSignal,
): Promise<RelatedOpportunity[]> => {
  const options = { signal, params: { path: { id }, query: { tyyppi: kohdeTyyppi } } };
  const { data } =
    lahdeTyyppi === 'TYOMAHDOLLISUUS'
      ? await client.GET('/api/tyomahdollisuudet/{id}/samankaltaiset', options)
      : await client.GET('/api/koulutusmahdollisuudet/{id}/samankaltaiset', options);

  return (data ?? []).map(({ id: opportunityId, otsikko }) => ({
    id: opportunityId,
    title: getLocalizedText(otsikko),
  }));
};

/**
 * Fetches both the similar työmahdollisuudet and the similar koulutusmahdollisuudet of the given opportunity.
 */
export const getSamankaltaiset = async (
  lahdeTyyppi: MahdollisuusTyyppi,
  id: string,
  signal?: AbortSignal,
): Promise<SamankaltaisetByTyyppi> => {
  const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
    fetchSamankaltaiset(lahdeTyyppi, id, 'TYOMAHDOLLISUUS', signal),
    fetchSamankaltaiset(lahdeTyyppi, id, 'KOULUTUSMAHDOLLISUUS', signal),
  ]);
  return { TYOMAHDOLLISUUS: tyomahdollisuudet, KOULUTUSMAHDOLLISUUS: koulutusmahdollisuudet };
};

/** Opportunities shown per type; kept in sync with the amount the list component displays. */
const KOHTAANTO_RESULTS_PER_TYPE = 5;
/** Suggestions scoring below this (0-1) are marked as not similar enough. */
export const KOHTAANTO_MIN_SCORE = 0.5;
// Limits of the request validation in the backend
const MAX_OSAAMISET = 1000;
const MAX_FREE_TEXT_LENGTH = 10000;

export interface KohtaantoSamankaltaisetSource {
  description: string;
  /** URIs of all the osaamiset of the opportunity */
  osaamiset: string[];
}

const toRelatedOpportunities = (
  opportunities: TypedMahdollisuus[],
  lowScoreIds: ReadonlySet<string>,
): RelatedOpportunity[] =>
  opportunities.map(({ id, otsikko }) => ({
    id,
    title: getLocalizedText(otsikko),
    lowSimilarity: lowScoreIds.has(id),
  }));

/**
 * Fetches opportunities similar to the given opportunity using the kohtaanto suggestions. The osaamiset and the
 * description of the opportunity are used as the input of the suggestions. The opportunity itself is left out of the
 * result. The best matches are always returned, but the ones scoring below {@link KOHTAANTO_MIN_SCORE} (or without a
 * score) are marked with `lowSimilarity`. Resolves to empty lists on an error response, as the similar opportunities are supplementary content and must
 * not break the page.
 */
export const getKohtaantoSamankaltaiset = async (
  lahdeId: string,
  { description, osaamiset }: KohtaantoSamankaltaisetSource,
  signal?: AbortSignal,
): Promise<SamankaltaisetByTyyppi> => {
  const empty: SamankaltaisetByTyyppi = { TYOMAHDOLLISUUS: [], KOULUTUSMAHDOLLISUUS: [] };
  const osaamisetVapaateksti = description.trim().slice(0, MAX_FREE_TEXT_LENGTH);

  // Without any input the suggestions are not ranked, so there is nothing meaningful to show
  if (osaamiset.length === 0 && osaamisetVapaateksti === '') {
    return empty;
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

  const lowScoreIds = new Set<string>();
  // The suggestions are returned best match first
  const idsByType = (tyyppi: MahdollisuusTyyppi) =>
    (data ?? [])
      .filter((ehdotus) => ehdotus.ehdotusMetadata?.tyyppi === tyyppi && ehdotus.mahdollisuusId !== lahdeId)
      .slice(0, KOHTAANTO_RESULTS_PER_TYPE)
      .flatMap((ehdotus) => {
        if (!ehdotus.mahdollisuusId) {
          return [];
        }
        if ((ehdotus.ehdotusMetadata?.pisteet ?? 0) < KOHTAANTO_MIN_SCORE) {
          lowScoreIds.add(ehdotus.mahdollisuusId);
        }
        return [ehdotus.mahdollisuusId];
      });

  const [tyomahdollisuudet, koulutusmahdollisuudet] = await Promise.all([
    getTypedTyoMahdollisuusDetails(idsByType('TYOMAHDOLLISUUS')),
    getTypedKoulutusMahdollisuusDetails(idsByType('KOULUTUSMAHDOLLISUUS')),
  ]);

  return {
    TYOMAHDOLLISUUS: toRelatedOpportunities(tyomahdollisuudet, lowScoreIds),
    KOULUTUSMAHDOLLISUUS: toRelatedOpportunities(koulutusmahdollisuudet, lowScoreIds),
  };
};
