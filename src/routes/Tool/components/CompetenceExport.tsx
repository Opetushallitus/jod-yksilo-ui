import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicatesByKey } from '@/utils';
import { Button, Checkbox } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

export const CompetenceExport = () => {
  const { t } = useTranslation();
  const { showDialog } = useModal();
  const [competencesToExport, setCompetencesToExport] = React.useState<Record<'OSAAMINEN' | 'KIINNOSTUS', boolean>>({
    OSAAMINEN: true,
    KIINNOSTUS: true,
  });

  const { osaamiset, kiinnostukset, setOsaamiset, setKiinnostukset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      kiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setKiinnostukset: state.setKiinnostukset,
    })),
  );

  const hasCompetencesToExport = React.useMemo(() => {
    return osaamiset.some((o) => o.tyyppi === 'KARTOITETTU') || kiinnostukset.some((k) => k.tyyppi === 'KARTOITETTU');
  }, [osaamiset, kiinnostukset]);

  const exportToProfile = React.useCallback(async () => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Profiiliin vienti']);
    const osaaminenApiCall = competencesToExport.OSAAMINEN
      ? client.PUT('/api/profiili/muu-osaaminen', {
          body: [
            ...new Set([
              ...((await client.GET('/api/profiili/muu-osaaminen')).data?.muuOsaaminen ?? []),
              ...osaamiset.filter((o) => o.tyyppi === 'KARTOITETTU' || o.tyyppi === 'MUU_OSAAMINEN').map((o) => o.id),
            ]),
          ],
        })
      : Promise.resolve();

    const kiinnostuksetApiCall = competencesToExport.KIINNOSTUS
      ? client.PUT('/api/profiili/kiinnostukset/osaamiset', {
          body: [
            ...new Set([
              ...((await client.GET('/api/profiili/kiinnostukset/osaamiset')).data?.kiinnostukset ?? []),
              ...kiinnostukset.map((k) => k.id),
            ]),
          ],
        })
      : Promise.resolve();

    await Promise.all([osaaminenApiCall, kiinnostuksetApiCall]);

    const newOsaamiset = osaamiset.map((o) => ({
      ...o,
      tyyppi: o.tyyppi === 'KARTOITETTU' ? 'MUU_OSAAMINEN' : o.tyyppi,
    }));
    setOsaamiset(removeDuplicatesByKey(newOsaamiset, (o) => o.id));
    const newKiinnostukset = kiinnostukset.map((k) => ({
      ...k,
      tyyppi: k.tyyppi === 'KARTOITETTU' ? 'KIINNOSTUS' : k.tyyppi,
    }));
    setKiinnostukset(removeDuplicatesByKey(newKiinnostukset, (k) => k.id));
  }, [kiinnostukset, osaamiset, setKiinnostukset, setOsaamiset, competencesToExport]);

  const renderFilterContent = React.useCallback(() => {
    return <StatefullCompentencesExportFilters onFiltersChange={setCompetencesToExport} />;
  }, [setCompetencesToExport]);

  const showExportDialog = React.useCallback(() => {
    if (hasCompetencesToExport) {
      showDialog({
        title: t('tool.my-own-data.export.confirm-title'),
        description: t('tool.my-own-data.export.confirm-description'),
        confirmText: t('tool.my-own-data.export.confirm-button'),
        cancelText: t('common:cancel'),
        onConfirm: exportToProfile,
        content: renderFilterContent,
        variant: 'normal',
      });
    } else {
      showDialog({
        title: t('tool.my-own-data.export.no-data-title'),
        description: t('tool.my-own-data.export.no-data-description'),
        confirmText: t('close'),
        hideSecondaryButton: true,
        variant: 'normal',
      });
    }
  }, [hasCompetencesToExport, exportToProfile, renderFilterContent, showDialog, t]);

  return (
    <Button
      variant="gray"
      className="w-fit"
      label={t('tool.my-own-data.export.export-button')}
      data-testid="competence-export-button"
      size="sm"
      onClick={showExportDialog}
    />
  );
};

/**
 * Component that manages its own filter state internally.
 * Reports filter changes via callback so parent can access current selection on confirm.
 */
const StatefullCompentencesExportFilters = ({
  onFiltersChange,
}: {
  onFiltersChange: (filters: Record<'OSAAMINEN' | 'KIINNOSTUS', boolean>) => void;
}) => {
  const { t } = useTranslation();
  const [osaamisetChecked, setOsaamisetChecked] = React.useState(true);
  const [kiinnostuksetChecked, setKiinnostuksetChecked] = React.useState(true);

  const { osaamiset, kiinnostukset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      kiinnostukset: state.kiinnostukset,
    })),
  );

  React.useEffect(() => {
    onFiltersChange({
      OSAAMINEN: osaamisetChecked,
      KIINNOSTUS: kiinnostuksetChecked,
    });
  }, [osaamisetChecked, kiinnostuksetChecked, onFiltersChange]);

  return (
    <ul className="flex flex-col gap-y-5 py-4">
      <li>
        <Checkbox
          name="osaamiseni"
          ariaLabel={t('types.competence.OSAAMINEN')}
          label={t('types.competence.OSAAMINEN')}
          checked={osaamiset.some((o) => o.tyyppi === 'KARTOITETTU') && osaamisetChecked}
          onChange={() => setOsaamisetChecked((prev) => !prev)}
          value="true"
          disabled={!osaamiset.some((o) => o.tyyppi === 'KARTOITETTU')}
        />
      </li>
      <li>
        <Checkbox
          name="kiinnostukseni"
          ariaLabel={t('types.competence.KIINNOSTUS')}
          label={t('types.competence.KIINNOSTUS')}
          checked={kiinnostukset.some((k) => k.tyyppi === 'KARTOITETTU') && kiinnostuksetChecked}
          onChange={() => setKiinnostuksetChecked((prev) => !prev)}
          value="true"
          disabled={!kiinnostukset.some((k) => k.tyyppi === 'KARTOITETTU')}
        />
      </li>
    </ul>
  );
};
