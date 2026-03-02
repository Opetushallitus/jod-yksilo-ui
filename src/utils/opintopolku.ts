import { LangCode } from '@/i18n/config';

export interface OpintopolkuKoulutusResponse {
  oid: string;
  nimi: Record<LangCode, string | undefined>;
  metadata: {
    kuvaus: Record<LangCode, string | undefined>;
    opintojenLaajuusNumero: number | undefined;
    opintojenLaajuusNumeroMin: number | undefined;
    opintojenLaajuusNumeroMax: number | undefined;
    opintojenLaajuusyksikko: {
      nimi: Record<LangCode, string | undefined>;
    };
  };
}

/*
 * Fetches koulutus data from Opintopolku API.
 */
export const getOpintopolkuKoulutus = async (oid: string) => {
  const url = new URL(`/konfo-backend/external/koulutus/${oid}`, globalThis.location.origin);
  url.searchParams.append('toteutukset', 'true');
  url.searchParams.append('hakukohteet', 'false');
  url.searchParams.append('haut', 'true');
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as OpintopolkuKoulutusResponse;
    return data;
  } catch {
    return null;
  }
};
