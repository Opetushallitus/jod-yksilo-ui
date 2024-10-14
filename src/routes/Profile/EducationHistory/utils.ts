import { type ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Koulutus {
  id?: string;
  nimi: Record<string, string>;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface Koulutuskokonaisuus {
  id?: string;
  nimi: Record<string, string>;
  koulutukset: Koulutus[];
}

export const getEducationHistoryTableRows = (
  data: Koulutuskokonaisuus[],
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData[] =>
  data.reduce((rows: ExperienceTableRowData[], row) => {
    const { koulutukset } = row;
    const alkuPvm = Math.min(...koulutukset.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = koulutukset.some((koulutus) => !koulutus.loppuPvm)
      ? 0
      : Math.max(
          ...koulutukset
            .filter((koulutus) => koulutus.loppuPvm)
            .map((koulutus) => new Date(koulutus.loppuPvm as unknown as string).getTime()),
        );

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
      subrows: [...koulutukset]
        .sort(sortByProperty('alkuPvm'))
        .map((koulutus) => mapKoulutusToRow(koulutus, osaamisetMap)),
      osaamiset: [...new Set(koulutukset.map((koulutus) => koulutus.osaamiset).flat())].map((id) => ({
        ...(osaamisetMap
          ? osaamisetMap[id]
          : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
        sourceType: 'koulutus',
      })),
    };

    rows.push(rowData);

    return rows;
  }, []);

const mapKoulutusToRow = (
  koulutus: Koulutus,
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData => ({
  key: koulutus.id ?? crypto.randomUUID(),
  nimi: koulutus.nimi,
  alkuPvm: new Date(koulutus.alkuPvm),
  loppuPvm: koulutus.loppuPvm ? new Date(koulutus.loppuPvm) : undefined,
  osaamiset: koulutus.osaamiset.map((id) => ({
    ...(osaamisetMap ? osaamisetMap[id] : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
    sourceType: 'koulutus',
  })),
});
