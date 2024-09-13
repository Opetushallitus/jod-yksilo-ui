import { type ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Toimenkuva {
  id?: string;
  nimi: Record<string, string>;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface Tyopaikka {
  id?: string;
  nimi: Record<string, string>;
  toimenkuvat: Toimenkuva[];
}

export const getWorkHistoryTableRows = (data: Tyopaikka[]): ExperienceTableRowData[] =>
  data.reduce((rows: ExperienceTableRowData[], row) => {
    const { toimenkuvat } = row;
    const alkuPvm = Math.min(...toimenkuvat.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = toimenkuvat.some((toimenkuva) => !toimenkuva.loppuPvm)
      ? 0
      : Math.max(
          ...toimenkuvat
            .filter((toimenkuva) => toimenkuva.loppuPvm)
            .map((toimenkuva) => new Date(toimenkuva.loppuPvm as unknown as string).getTime()),
        );

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
      subrows: [...toimenkuvat].sort(sortByProperty('alkuPvm')).map(mapToimenkuvaToRow),
      osaamisetCount: toimenkuvat.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
    };

    rows.push(rowData);

    return rows;
  }, []);

const mapToimenkuvaToRow = (toimenkuva: Toimenkuva): ExperienceTableRowData => ({
  key: toimenkuva.id ?? crypto.randomUUID(),
  nimi: toimenkuva.nimi,
  alkuPvm: new Date(toimenkuva.alkuPvm),
  loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
  osaamisetCount: toimenkuva.osaamiset.length ?? 0,
});
