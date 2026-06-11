import type { components } from '@/api/schema';
import type { ExperienceTableRowData } from '@/components';
import { getEducationHistoryTableRows, type Koulutuskokonaisuus } from '@/routes/Profile/EducationHistory/utils';
import { getWorkHistoryTableRows, type Tyopaikka } from '@/routes/Profile/WorkHistory/utils';

export const buildSaveDto = (data: CvImportConvertedData): components['schemas']['CvTehtavaSaveDto'] => {
  const toValinta = (rows: ExperienceTableRowData[]): components['schemas']['Valinta'][] => {
    return rows
      .filter((row) => (row.subrows ?? []).some((s) => s.checked ?? true))
      .map((row) => {
        const lapset = (row.subrows ?? []).filter((s) => s.checked ?? true).map((s) => s.key);
        return {
          id: row.key,
          lapset,
        };
      })
      .filter((valinta) => valinta.lapset.length > 0);
  };

  return {
    koulutuskokonaisuudet: toValinta(data.education),
    tyopaikat: toValinta(data.work),
    teemat: toValinta(data.activities),
  };
};

export interface CvImportConvertedData {
  education: ExperienceTableRowData[];
  work: ExperienceTableRowData[];
  activities: ExperienceTableRowData[];
}

/**
 * Transforms KoulutusKokonaisuusDto to internal Koulutuskokonaisuus format
 */
const transformKoulutusKokonaisuusDto = (
  dto: components['schemas']['KoulutusKokonaisuusDto'],
): Koulutuskokonaisuus => ({
  id: dto.id,
  nimi: dto.nimi,
  tuontiLahde: dto.tuontiLahde,
  koulutukset: (dto.koulutukset || []).map((k) => ({
    id: k.id,
    nimi: k.kuvaus || k.nimi || { fi: '', sv: '', en: '' },
    kuvaus: k.kuvaus,
    alkuPvm: k.alkuPvm,
    loppuPvm: k.loppuPvm,
    osaamiset: k.osaamiset || [],
    osaamisetOdottaaTunnistusta: k.osaamisetOdottaaTunnistusta,
    osaamisetTunnistusEpaonnistui: k.osaamisetTunnistusEpaonnistui,
    osasuoritukset: k.osasuoritukset,
  })),
});

/**
 * Transforms TyopaikkaDto to internal Tyopaikka format
 */
const transformTyopaikkaDto = (dto: components['schemas']['TyopaikkaDto']): Tyopaikka => ({
  id: dto.id,
  nimi: dto.nimi,
  tuontiLahde: dto.tuontiLahde,
  toimenkuvat: (dto.toimenkuvat || []).map((t) => ({
    id: t.id,
    nimi: t.nimi,
    kuvaus: t.kuvaus,
    alkuPvm: t.alkuPvm || '',
    loppuPvm: t.loppuPvm,
    osaamiset: t.osaamiset || [],
  })),
});

/**
 * Converts CV import Tulos data to experience table rows for display
 */
export const convertTulosToTableRows = (
  tulos: components['schemas']['Tulos'],
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): CvImportConvertedData => {
  const education = tulos.koulutuskokonaisuudet
    ? getEducationHistoryTableRows(tulos.koulutuskokonaisuudet.map(transformKoulutusKokonaisuusDto), osaamisetMap)
    : [];

  const work = tulos.tyopaikat ? getWorkHistoryTableRows(tulos.tyopaikat.map(transformTyopaikkaDto), osaamisetMap) : [];

  // For activities, we need to convert TeemaDto to a compatible format
  const activities = tulos.teemat ? convertActivitiesToTableRows(tulos.teemat, osaamisetMap) : [];

  return { education, work, activities };
};

/**
 * Converts TeemaDto array to ExperienceTableRowData with patevyydet as subrows
 */
const convertActivitiesToTableRows = (
  teemat: components['schemas']['TeemaDto'][],
  osaamisetMap?: Record<
    string,
    {
      id: string;
      nimi: Record<string, string>;
      kuvaus: Record<string, string>;
    }
  >,
): ExperienceTableRowData[] => {
  return teemat.map((teema) => {
    const patevyydet = teema.patevyydet || [];
    return {
      key: teema.id ?? crypto.randomUUID(),
      nimi: teema.nimi,
      tuontiLahde: teema.tuontiLahde,
      subrows: patevyydet.map((p) => ({
        key: p.id ?? crypto.randomUUID(),
        nimi: p.nimi,
        kuvaus: p.kuvaus,
        alkuPvm: p.alkuPvm ? new Date(p.alkuPvm) : undefined,
        loppuPvm: p.loppuPvm ? new Date(p.loppuPvm) : undefined,
        osaamiset: (p.osaamiset || []).map((id) => ({
          ...(osaamisetMap
            ? osaamisetMap[id]
            : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
          sourceType: 'vapaa-ajan-teema' as const,
        })),
        checked: true,
      })),
      osaamiset: patevyydet
        .flatMap((p) => p.osaamiset || [])
        .map((id) => ({
          ...(osaamisetMap
            ? osaamisetMap[id]
            : { id, nimi: { fi: '', sv: '', en: '' }, kuvaus: { fi: '', sv: '', en: '' } }),
          sourceType: 'vapaa-ajan-teema' as const,
        })),
      checked: true,
    };
  });
};
