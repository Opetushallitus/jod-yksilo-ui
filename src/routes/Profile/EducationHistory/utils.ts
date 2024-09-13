import { type ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Tutkinto {
  id?: string;
  nimi: Record<string, string>;
  kuvaus?: Record<string, string>;
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: string[];
}

export interface Koulutus {
  kategoria?: {
    id?: string;
    nimi: Record<string, string>;
    kuvaus?: Record<string, string>;
  };
  koulutukset: Tutkinto[];
}

export const getEducationHistoryTableRows = (data: Koulutus[]): ExperienceTableRowData[] =>
  data.reduce((rows: ExperienceTableRowData[], row) => {
    const { kategoria: oppilaitos, koulutukset: tutkinnot } = row;

    const alkuPvm = Math.min(...tutkinnot.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = Math.max(
      ...tutkinnot.filter((t) => t.loppuPvm).map((t) => new Date(t.loppuPvm as unknown as string).getTime()),
    );

    if (oppilaitos) {
      const toplevelRow: ExperienceTableRowData = {
        key: oppilaitos.id ?? crypto.randomUUID(),
        nimi: oppilaitos.nimi,
        alkuPvm: new Date(alkuPvm),
        loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
        subrows: [...tutkinnot].sort(sortByProperty('alkuPvm')).map(mapTutkintoToRow),
        osaamisetCount: tutkinnot.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
      };

      rows.push(toplevelRow);
    } else {
      tutkinnot.map(mapTutkintoToRow).forEach((mapped) => rows.push(mapped));
    }

    return rows;
  }, []);

const mapTutkintoToRow = (tutkinto: Tutkinto): ExperienceTableRowData => ({
  key: tutkinto.id ?? crypto.randomUUID(),
  nimi: tutkinto.nimi,
  alkuPvm: new Date(tutkinto.alkuPvm),
  loppuPvm: tutkinto.loppuPvm ? new Date(tutkinto.loppuPvm) : undefined,
  osaamisetCount: tutkinto.osaamiset.length ?? 0,
});
