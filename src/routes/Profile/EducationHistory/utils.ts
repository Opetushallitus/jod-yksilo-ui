/* eslint-disable sonarjs/cognitive-complexity */
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
      koulutukset
        .sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm))
        .forEach((toimenkuva) => {
          rows.push({
            key: toimenkuva.id ?? crypto.randomUUID(),
            nimi: toimenkuva.nimi,
            alkuPvm: new Date(toimenkuva.alkuPvm),
            loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
            osaamisetCount: toimenkuva.osaamiset.length ?? 0,
          });
        });
    } else {
      koulutukset
        .sort((a, b) => a.alkuPvm.localeCompare(b.alkuPvm))
        .forEach((toimenkuva) => {
          rows.push({
            key: toimenkuva.id ?? crypto.randomUUID(),
            checked: false,
            nimi: toimenkuva.nimi,
            alkuPvm: new Date(toimenkuva.alkuPvm),
            loppuPvm: toimenkuva.loppuPvm ? new Date(toimenkuva.loppuPvm) : undefined,
            osaamisetCount: toimenkuva.osaamiset.length ?? 0,
          });
        });
    }
    return rows;
  }, []);
