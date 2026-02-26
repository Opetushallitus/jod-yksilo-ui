import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { ExperienceTableRowData } from '@/components';
import React from 'react';
import { useRevalidator } from 'react-router';

const updateRowSubrows = <ContextType>(
  row: ExperienceTableRowData,
  transformSubrow: (subrow: ExperienceTableRowData, context: ContextType) => ExperienceTableRowData,
  context: ContextType,
): ExperienceTableRowData => {
  if (!row.subrows?.length) {
    return row;
  }

  return {
    ...row,
    subrows: row.subrows.map((subrow) => transformSubrow(subrow, context)),
  };
};

type ResponseMapValue = Omit<components['schemas']['KoulutusDto'], 'osaamiset'> & {
  osaamiset: components['schemas']['OsaaminenDto'][];
};

const updateSubrow = (
  subrow: ExperienceTableRowData,
  responseMap: Map<string, ResponseMapValue>,
): ExperienceTableRowData => {
  const responseItem = responseMap.get(subrow.key);

  return responseItem
    ? {
        ...subrow,
        osaamiset: (responseItem.osaamiset ?? []).map((osaaminen) => ({
          id: osaaminen.uri,
          nimi: osaaminen.nimi,
          kuvaus: osaaminen.kuvaus,
          sourceType: 'koulutus',
        })),
        osaamisetOdottaaTunnistusta: responseItem.osaamisetOdottaaTunnistusta,
        osaamisetTunnistusEpaonnistui: responseItem.osaamisetTunnistusEpaonnistui,
      }
    : subrow;
};

const updateSubrowWithTunnistusStatus = (
  subrow: ExperienceTableRowData,
  rowIdsForOsaamisetTunnistus: string[],
): ExperienceTableRowData => {
  return rowIdsForOsaamisetTunnistus.includes(subrow.key)
    ? {
        ...subrow,
        osaamisetTunnistusEpaonnistui: true,
      }
    : subrow;
};

export const usePollOsaamisetTunnistus = (
  isOsaamisetTunnistusOngoing: boolean,
  rows: ExperienceTableRowData[],
  setRows: React.Dispatch<React.SetStateAction<ExperienceTableRowData[]>>,
  revalidator: ReturnType<typeof useRevalidator>,
) => {
  const [isPolling, setIsPolling] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const rowIdsForOsaamisetTunnistus = rows.flatMap((row) =>
    row.osaamisetOdottaaTunnistusta && row.subrows?.length
      ? row.subrows.filter((subRow) => subRow.osaamisetOdottaaTunnistusta).map((subRow) => subRow.key)
      : [],
  );

  const fetchOsaamisetTunnistus = React.useCallback(async () => {
    if (isPolling || !isOsaamisetTunnistusOngoing || rowIdsForOsaamisetTunnistus.length === 0) {
      return;
    }

    setIsPolling(true);

    let hasError = false;
    try {
      const { data, error } = await client.GET('/api/integraatiot/koski/osaamiset/tunnistus', {
        params: {
          query: {
            ids: rowIdsForOsaamisetTunnistus,
          },
        },
      });

      if (error) {
        hasError = true;
        setError(error);
        return;
      }

      if (!data) {
        hasError = true;
        setError(new Error('API returned empty response'));
        return;
      }

      const koulutukset: components['schemas']['KoulutusDto'][] = data;

      const uris = koulutukset
        .map((koulutus) => koulutus.osaamiset)
        .filter((osaaminen) => osaaminen !== undefined)
        .flat();
      const osaamisetData = await osaamiset.find(uris);
      const osaamisetMap = new Map<string, components['schemas']['OsaaminenDto']>(
        osaamisetData.map((osaaminen) => [osaaminen.uri, osaaminen]),
      );

      const responseMap = new Map<string, ResponseMapValue>(
        koulutukset.map((koulutus) => [
          koulutus.id!,
          // koulutus,
          {
            ...koulutus,
            osaamiset: (koulutus.osaamiset ?? [])
              .map((id) => osaamisetMap.get(id))
              .filter((osaaminen): osaaminen is components['schemas']['OsaaminenDto'] => osaaminen !== undefined),
          },
        ]),
      );

      const updatedRows = rows
        .map((row) => updateRowSubrows(row, updateSubrow, responseMap))
        .map((row) => {
          if (!row.subrows) {
            return row;
          }

          const allKoulutusOsaamiset = Array.from(
            new Map(
              row.subrows
                .filter((subrow) => subrow.osaamisetOdottaaTunnistusta === false)
                .flatMap((subrow) => subrow.osaamiset ?? [])
                .map((osaaminen) => [osaaminen.id, osaaminen]),
            ).values(),
          );

          return {
            ...row,
            osaamiset: allKoulutusOsaamiset,
          };
        });
      setRows(updatedRows);

      const remainingIds = rowIdsForOsaamisetTunnistus.filter((id) => !responseMap.has(id));
      if (remainingIds.length === 0) {
        revalidator.revalidate();
      }
    } catch (err) {
      hasError = true;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (hasError) {
        const updatedRowsToFailed = rows.map((row) =>
          updateRowSubrows(row, updateSubrowWithTunnistusStatus, rowIdsForOsaamisetTunnistus),
        );
        setRows(updatedRowsToFailed);
      }

      setIsPolling(false);
    }
  }, [isPolling, isOsaamisetTunnistusOngoing, rowIdsForOsaamisetTunnistus, rows, setRows, revalidator]);

  // Set up polling with an appropriate retry strategy
  React.useEffect(() => {
    const interval = error ? 15_000 : 5000;
    const intervalId = setInterval(fetchOsaamisetTunnistus, interval);
    return () => clearInterval(intervalId);
  }, [fetchOsaamisetTunnistus, error]);
};
