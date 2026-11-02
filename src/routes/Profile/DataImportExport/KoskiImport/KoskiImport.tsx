import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';

import { Button } from '@jod/design-system';

import { client } from '@/api/client';
import { AnchorLink } from '@/components';
import { ImportInfoBox } from '@/components/ImportInfoBox/ImportInfoBox';
import { TooltipWrapper } from '@/components/Tooltip/TooltipWrapper';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { useKoskiImport } from '@/routes/Profile/EducationHistory/useKoskiImport';

import type { DataImportExportLoaderData } from '../loader';

const POLL_INTERVAL_MS = 5000;

const useOsaamisetTunnistusOngoing = (pendingIds: string[]) => {
  const [finishedIds, setFinishedIds] = React.useState<string[]>([]);
  const remainingIds = pendingIds.filter((id) => !finishedIds.includes(id));
  const remainingIdsKey = remainingIds.join(',');

  React.useEffect(() => {
    if (!remainingIdsKey) {
      return;
    }

    const intervalId = setInterval(async () => {
      const { data } = await client
        .GET('/api/integraatiot/koski/osaamiset/tunnistus', {
          params: { query: { ids: remainingIdsKey.split(',') } },
        })
        .catch(() => ({ data: undefined }));
      const newFinishedIds = data?.map((koulutus) => koulutus.id).filter((id) => id !== undefined) ?? [];
      if (newFinishedIds.length > 0) {
        setFinishedIds((prev) => [...prev, ...newFinishedIds]);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [remainingIdsKey]);

  return remainingIds.length > 0;
};

const KoskiImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const guardedAction = useSessionGuardedAction();
  const { openImportStartModal } = useKoskiImport();
  const { pendingTunnistusKoulutusIds } = useLoaderData<DataImportExportLoaderData>();
  const isOngoing = useOsaamisetTunnistusOngoing(pendingTunnistusKoulutusIds);

  return (
    <div>
      <h3 className="mb-3 text-heading-3-mobile sm:text-heading-3">{t('preferences.koski-import.title')}</h3>
      <p className="mb-6 font-arial">{t('preferences.koski-import.description')}</p>
      <TooltipWrapper
        tooltipPlacement="top"
        tooltipContent={t('preferences.koski-import.competences-identifying')}
        tooltipOpen={isOngoing ? undefined : false}
        className="w-fit"
      >
        <Button
          label={t('preferences.koski-import.button-label')}
          size="sm"
          variant="accent"
          ariaHaspopup="dialog"
          onClick={guardedAction(openImportStartModal)}
          disabled={isOngoing}
          testId="koski-import-button"
        />
      </TooltipWrapper>

      <ImportInfoBox>
        <Trans
          i18nKey="preferences.koski-import.result-info"
          components={{
            EducationHistoryLink: (
              <AnchorLink
                href={`/yksilo/${language}/${t('slugs.profile.index')}/${t('slugs.profile.competences')}/${t('slugs.profile.education-history')}`}
                className="inline-flex underline"
              />
            ),
          }}
        />
      </ImportInfoBox>
    </div>
  );
};

export default KoskiImport;
