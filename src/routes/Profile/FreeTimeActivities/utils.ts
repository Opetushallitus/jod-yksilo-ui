import type { components } from '@/api/schema';
import { ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Toiminto {
  id?: string;
  nimi: Record<string, string>;
  kuvaus?: Record<string, string>;
  alkuPvm?: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface VapaaAjanToiminto {
  id?: string;
  nimi: Record<string, string>;
  tuontiLahde?: components['schemas']['TeemaDto']['tuontiLahde'];
  toiminnot: Toiminto[];
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
    const { toiminnot } = row;
    const startTimestamps = toiminnot.flatMap((toiminto) =>
      toiminto.alkuPvm ? [new Date(toiminto.alkuPvm).getTime()] : [],
    );
    const hasMissingStartDate = toiminnot.some((toiminto) => !toiminto.alkuPvm);
    const alkuPvm =
      !hasMissingStartDate && startTimestamps.length > 0 ? new Date(Math.min(...startTimestamps)) : undefined;
    const endTimestamps = toiminnot.flatMap((toiminto) =>
      toiminto.loppuPvm ? [new Date(toiminto.loppuPvm).getTime()] : [],
    );
    const hasOngoingActivity = toiminnot.some((toiminto) => !toiminto.loppuPvm);
    const loppuPvm = !hasOngoingActivity && endTimestamps.length > 0 ? new Date(Math.max(...endTimestamps)) : undefined;

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm,
      loppuPvm,
      tuontiLahde: row.tuontiLahde,
      subrows: [...toiminnot]
        .sort(sortByProperty('alkuPvm'))
        .map((toiminto) => mapToimintoToRow(toiminto, osaamisetMap)),
      osaamiset: [...new Set(toiminnot.map((toiminto) => toiminto.osaamiset).flat())].map((id) => ({
        ...(osaamisetMap
          ? osaamisetMap[id]
          : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
        sourceType: 'vapaa-ajan-teema',
      })),
    };
    rows.push(rowData);

    return rows;
  }, []);

const mapToimintoToRow = (
  toiminto: Toiminto,
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData => ({
  key: toiminto.id ?? crypto.randomUUID(),
  nimi: toiminto.nimi,
  kuvaus: toiminto.kuvaus,
  alkuPvm: toiminto.alkuPvm ? new Date(toiminto.alkuPvm) : undefined,
  loppuPvm: toiminto.loppuPvm ? new Date(toiminto.loppuPvm) : undefined,
  osaamiset: toiminto.osaamiset.map((id) => ({
    ...(osaamisetMap ? osaamisetMap[id] : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
    sourceType: 'vapaa-ajan-teema',
  })),
});
