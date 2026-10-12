import type { components } from '@/api/schema';
import { type ExperienceTableRowData } from '@/components';
import { sortByProperty } from '@/utils';

export interface Koulutus {
  id?: string;
  nimi: Record<string, string>;
  kuvaus?: Record<string, string>;
  alkuPvm?: string;
  loppuPvm?: string;
  osaamiset: string[];
  osaamisetOdottaaTunnistusta?: boolean;
  osaamisetTunnistusEpaonnistui?: boolean;
  osasuoritukset?: string[];
}

export interface Koulutuskokonaisuus {
  id?: string;
  nimi: Record<string, string>;
  tuontiLahde?: components['schemas']['KoulutusKokonaisuusDto']['tuontiLahde'];
  koulutukset: Koulutus[];
}

export const getEducationHistoryTableRows = (
  data: Koulutuskokonaisuus[],
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
    const { koulutukset } = row;
    const startTimestamps = koulutukset.flatMap((koulutus) =>
      koulutus.alkuPvm ? [new Date(koulutus.alkuPvm).getTime()] : [],
    );
    const hasMissingStartDate = koulutukset.some((koulutus) => !koulutus.alkuPvm);
    const alkuPvm =
      !hasMissingStartDate && startTimestamps.length > 0 ? new Date(Math.min(...startTimestamps)) : undefined;
    const endTimestamps = koulutukset.flatMap((koulutus) =>
      koulutus.loppuPvm ? [new Date(koulutus.loppuPvm).getTime()] : [],
    );
    const hasOngoingEducation = koulutukset.some((koulutus) => !koulutus.loppuPvm);
    const loppuPvm =
      !hasOngoingEducation && endTimestamps.length > 0 ? new Date(Math.max(...endTimestamps)) : undefined;

    const rowData: ExperienceTableRowData = {
      key: row.id ?? crypto.randomUUID(),
      nimi: row.nimi,
      alkuPvm,
      loppuPvm,
      tuontiLahde: row.tuontiLahde,
      subrows: [...koulutukset]
        .sort(sortByProperty('alkuPvm'))
        .map((koulutus) => mapKoulutusToRow(koulutus, osaamisetMap)),
      osaamiset: [...new Set(koulutukset.map((koulutus) => koulutus.osaamiset).flat())].map((id) => ({
        ...(osaamisetMap?.[id] ?? { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
        sourceType: 'koulutus',
      })),
      checked: true,
      osaamisetOdottaaTunnistusta: row.koulutukset.some((koulutus) => koulutus.osaamisetOdottaaTunnistusta),
      osaamisetTunnistusEpaonnistui: row.koulutukset.some((koulutus) => koulutus.osaamisetTunnistusEpaonnistui),
    };

    rows.push(rowData);

    return rows;
  }, []);

const mapKoulutusToRow = (
  koulutus: Koulutus,
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData => {
  const data: ExperienceTableRowData = {
    key: koulutus.id ?? crypto.randomUUID(),
    nimi: koulutus.nimi,
    kuvaus: koulutus.kuvaus,
    alkuPvm: koulutus.alkuPvm ? new Date(koulutus.alkuPvm) : undefined,
    loppuPvm: koulutus.loppuPvm ? new Date(koulutus.loppuPvm) : undefined,
    osaamiset: koulutus.osaamiset.map((id) => ({
      ...(osaamisetMap?.[id] ?? { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
      sourceType: 'koulutus',
    })),
    checked: true,
  };

  if (typeof koulutus.osaamisetOdottaaTunnistusta === 'boolean') {
    data.osaamisetOdottaaTunnistusta = koulutus.osaamisetOdottaaTunnistusta;
  }

  if (typeof koulutus.osaamisetTunnistusEpaonnistui === 'boolean') {
    data.osaamisetTunnistusEpaonnistui = koulutus.osaamisetTunnistusEpaonnistui;
  }

  return data;
};
