import { type SelectableTableRow } from '@/components';

export interface Patevyys {
  id?: string;
  nimi: Record<string, string>;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface VapaaAjanToiminta {
  id?: string;
  nimi: Record<string, string>;
  patevyydet: Patevyys[];
}

export const getFreeTimeActivitiesTableRows = (data: VapaaAjanToiminta[]): SelectableTableRow[] =>
  data.reduce((rows: SelectableTableRow[], row) => {
    const { patevyydet } = row;
    const alkuPvm = Math.min(...patevyydet.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = patevyydet.some((patevyys) => !patevyys.loppuPvm)
      ? 0
      : Math.max(
          ...patevyydet
            .filter((patevyys) => patevyys.loppuPvm)
            .map((patevyys) => new Date(patevyys.loppuPvm as unknown as string).getTime()),
        );
    rows.push({
      key: row.id ?? crypto.randomUUID(),
      hideSubrowDetails: patevyydet.length <= 1,
      checked: false,
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
      osaamisetCount: patevyydet.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
    });
    patevyydet
      .sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm))
      .forEach((patevyys) => {
        rows.push({
          key: patevyys.id ?? crypto.randomUUID(),
          hideSubrowDetails: patevyydet.length <= 1,
          nimi: patevyys.nimi,
          alkuPvm: new Date(patevyys.alkuPvm),
          loppuPvm: patevyys.loppuPvm ? new Date(patevyys.loppuPvm) : undefined,
          osaamisetCount: patevyys.osaamiset.length ?? 0,
        });
      });
    return rows;
  }, []);
