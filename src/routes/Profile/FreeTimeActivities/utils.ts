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

export const getFreeTimeActivitiesTableRows = (
  data: VapaaAjanToiminto[],
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
      subrows: [...patevyydet]
        .sort(sortByProperty('alkuPvm'))
        .map((patevyys) => mapPatevyysToRow(patevyys, osaamisetMap)),
      osaamiset: [...new Set(patevyydet.map((patevyys) => patevyys.osaamiset).flat())].map((id) => ({
        ...(osaamisetMap
          ? osaamisetMap[id]
          : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
        sourceType: 'vapaa-ajan-toiminto',
      })),
    };
    rows.push(rowData);

    return rows;
  }, []);

const mapPatevyysToRow = (
  patevyys: Patevyys,
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData => ({
  key: patevyys.id ?? crypto.randomUUID(),
  nimi: patevyys.nimi,
  alkuPvm: new Date(patevyys.alkuPvm),
  loppuPvm: patevyys.loppuPvm ? new Date(patevyys.loppuPvm) : undefined,
  osaamiset: patevyys.osaamiset.map((id) => ({
    ...(osaamisetMap ? osaamisetMap[id] : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
    sourceType: 'vapaa-ajan-toiminto',
  })),
});
