import { ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Patevyys {
  id?: string;
  nimi: Record<string, string>;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface VapaaAjanToiminto {
  id?: string;
  nimi: Record<string, string>;
  patevyydet: Patevyys[];
}

export const getFreeTimeActivitiesTableRows = (data: VapaaAjanToiminto[]): ExperienceTableRowData[] =>
  data.reduce((rows: ExperienceTableRowData[], row) => {
    const { patevyydet } = row;
    const alkuPvm = Math.min(...patevyydet.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = patevyydet.some((patevyys) => !patevyys.loppuPvm)
      ? 0
      : Math.max(
          ...patevyydet
            .filter((patevyys) => patevyys.loppuPvm)
            .map((patevyys) => new Date(patevyys.loppuPvm as unknown as string).getTime()),
        );

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
      subrows: [...patevyydet].sort(sortByProperty('alkuPvm')).map(mapPatevyysToRow),
      osaamisetCount: patevyydet.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
    };
    rows.push(rowData);

    return rows;
  }, []);

const mapPatevyysToRow = (toimenkuva: Patevyys): ExperienceTableRowData => ({
  key: toimenkuva.id ?? crypto.randomUUID(),
  nimi: toimenkuva.nimi,
  alkuPvm: new Date(toimenkuva.alkuPvm),
  loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
  osaamisetCount: toimenkuva.osaamiset.length ?? 0,
});
