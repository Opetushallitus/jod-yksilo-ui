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
    const alkuPvm = Math.min(...toimenkuvat.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = toimenkuvat.some((toimenkuva) => !toimenkuva.loppuPvm)
      ? 0
      : Math.max(
          ...toimenkuvat
            .filter((toimenkuva) => toimenkuva.loppuPvm)
            .map((toimenkuva) => new Date(toimenkuva.loppuPvm as unknown as string).getTime()),
        );
    rows.push({
      key: `${key}`,
      tyopaikkaId: row.id,
      toimenkuvatCount: toimenkuvat.length,
      checked: false,
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
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
