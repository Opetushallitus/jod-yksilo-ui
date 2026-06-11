import type { components } from '@/api/schema';
import { ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Toiminto {
  id?: string;
  nimi: Record<string, string>;
  kuvaus?: Record<string, string>;
  alkuPvm: string;
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
    const alkuPvm = Math.min(...toiminnot.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = toiminnot.some((toiminto) => !toiminto.loppuPvm)
      ? 0
      : Math.max(
          ...toiminnot
            .filter((toiminto) => toiminto.loppuPvm)
            .map((toiminto) => new Date(toiminto.loppuPvm as unknown as string).getTime()),
        );

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm: new Date(alkuPvm),
      loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
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
  alkuPvm: new Date(toiminto.alkuPvm),
  loppuPvm: toiminto.loppuPvm ? new Date(toiminto.loppuPvm) : undefined,
  osaamiset: toiminto.osaamiset.map((id) => ({
    ...(osaamisetMap ? osaamisetMap[id] : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
    sourceType: 'vapaa-ajan-teema',
  })),
});
