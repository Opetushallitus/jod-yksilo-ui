import { type SelectableTableRow } from '@/components';

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

export interface EducationRowData {
  key: string;
  nimi: Record<string, string>;
  alkuPvm: Date;
  loppuPvm?: Date;
  tutkinnot?: EducationRowData[];
  osaamisetCount: number;
}

export const getEducationHistoryTableRows = (data: Koulutus[]): SelectableTableRow[] =>
  data.reduce((rows: SelectableTableRow[], row) => {
    const { kategoria, koulutukset } = row;
    if (kategoria) {
      const alkuPvm = Math.min(...koulutukset.map((t) => new Date(t.alkuPvm).getTime()));
      const loppuPvm = Math.max(
        ...koulutukset.filter((t) => t.loppuPvm).map((t) => new Date(t.loppuPvm as unknown as string).getTime()),
      );
      rows.push({
        key: kategoria.id ?? crypto.randomUUID(),
        hideRowDetails: koulutukset.length > 0,
        checked: false,
        nimi: kategoria.nimi,
        alkuPvm: new Date(alkuPvm),
        loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
        osaamisetCount: koulutukset.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
      });
    }
    koulutukset
      .sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm))
      .forEach((toimenkuva) => {
        rows.push({
          key: toimenkuva.id ?? crypto.randomUUID(),
          checked: kategoria ? undefined : false,
          nimi: toimenkuva.nimi,
          alkuPvm: new Date(toimenkuva.alkuPvm),
          loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
          osaamisetCount: toimenkuva.osaamiset.length ?? 0,
        });
      });
    return rows;
  }, []);

export const getEducationHistoryTableRowsV2 = (data: Koulutus[]): EducationRowData[] =>
  data.reduce((rows: EducationRowData[], row) => {
    const { kategoria: oppilaitos, koulutukset: tutkinnot } = row;

    const alkuPvm = Math.min(...tutkinnot.map((t) => new Date(t.alkuPvm).getTime()));
    const loppuPvm = Math.max(
      ...tutkinnot.filter((t) => t.loppuPvm).map((t) => new Date(t.loppuPvm as unknown as string).getTime()),
    );

    const mapTutkintoToRow = (tutkinto: Tutkinto): EducationRowData => ({
      key: tutkinto.id ?? crypto.randomUUID(),
      nimi: tutkinto.nimi,
      alkuPvm: new Date(tutkinto.alkuPvm),
      loppuPvm: tutkinto.loppuPvm ? new Date(tutkinto.loppuPvm) : undefined,
      osaamisetCount: tutkinto.osaamiset.length ?? 0,
    });

    if (oppilaitos) {
      const d: EducationRowData = {
        key: oppilaitos.id ?? crypto.randomUUID(),
        nimi: oppilaitos.nimi,
        alkuPvm: new Date(alkuPvm),
        loppuPvm: loppuPvm === 0 ? undefined : new Date(loppuPvm),
        tutkinnot: tutkinnot.sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm)).map(mapTutkintoToRow),
        osaamisetCount: tutkinnot.reduce((acc, cur) => acc + (cur.osaamiset.length ?? 0), 0),
      };

      rows.push(d);
    } else {
      tutkinnot.map(mapTutkintoToRow).forEach((mapped) => rows.push(mapped));
    }

    return rows;
  }, []);
