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

export const getEducationHistoryTableRows = (data: Koulutuskokonaisuus[]): ExperienceTableRowData[] =>
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
      subrows: [...koulutukset].sort(sortByProperty('alkuPvm')).map(mapKoulutusToRow),
      osaamisetCount: koulutukset.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
    };

    rows.push(rowData);

    return rows;
  }, []);

const mapKoulutusToRow = (koulutus: Koulutus): ExperienceTableRowData => ({
  key: koulutus.id ?? crypto.randomUUID(),
  nimi: koulutus.nimi,
  alkuPvm: new Date(koulutus.alkuPvm),
  loppuPvm: koulutus.loppuPvm ? new Date(koulutus.loppuPvm) : undefined,
  osaamisetCount: koulutus.osaamiset.length ?? 0,
});
