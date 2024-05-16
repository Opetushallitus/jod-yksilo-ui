import { type WorkHistoryTableRow } from './WorkHistoryTable';

export interface Toimenkuva {
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

export const getWorkHistoryTableRows = (data: Tyopaikka[]): WorkHistoryTableRow[] =>
  data.reduce((rows: WorkHistoryTableRow[], row, key) => {
    const { toimenkuvat } = row;
    rows.push({
      key: `${key}`,
      tyopaikkaId: row.id,
      toimenkuvatCount: toimenkuvat.length,
      checked: false,
      nimi: row.nimi,
      alkuPvm: toimenkuvat.reduce(
        (acc, cur) => (acc < new Date(cur.alkuPvm) ? acc : new Date(cur.alkuPvm)),
        new Date(),
      ),
      loppuPvm: toimenkuvat.reduce(
        (acc, cur) =>
          acc > (cur.loppuPvm ? new Date(cur.loppuPvm) : new Date(1900, 0, 1))
            ? acc
            : cur.loppuPvm
              ? new Date(cur.loppuPvm)
              : new Date(1900, 0, 1),
        new Date(1900, 0, 1),
      ),
      osaamisetCount: toimenkuvat.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
    });
    toimenkuvat
      .sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm))
      .forEach((toimenkuva, toimenkuvaKey) => {
        rows.push({
          key: `${key}-${toimenkuvaKey}`,
          toimenkuvatCount: toimenkuvat.length,
          nimi: toimenkuva.nimi,
          alkuPvm: new Date(toimenkuva.alkuPvm),
          loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
          osaamisetCount: toimenkuva.osaamiset.length ?? 0,
        });
      });
    return rows;
  }, []);
