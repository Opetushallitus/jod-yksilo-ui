import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useModal } from '@/hooks/useModal';
import { CompetenceFilters } from '@/routes/Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER } from '@/routes/Profile/Competences/constants';
import { useToolStore } from '@/stores/useToolStore';
import { hasLocalizedText, removeDuplicatesByKey } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, ConfirmDialog } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { OsaaminenLahdeTyyppi } from '../types';
import type { ToolLoaderData } from './loader';
import { mergeUniqueValuesExcludingType } from './utils';

const CompetenceExport = () => {
  const { t } = useTranslation();
  const { showDialog } = useModal();

  const { osaamiset, kiinnostukset, setOsaamiset, setKiinnostukset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      kiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setKiinnostukset: state.setKiinnostukset,
    })),
  );

  const exportToProfile = React.useCallback(async () => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Profiiliin vienti']);
    const osaaminenApiCall = client.PUT('/api/profiili/muu-osaaminen', {
      body: [
        ...new Set([
          ...((await client.GET('/api/profiili/muu-osaaminen')).data?.muuOsaaminen ?? []),
          ...osaamiset.filter((o) => o.tyyppi === 'KARTOITETTU' || o.tyyppi === 'MUU_OSAAMINEN').map((o) => o.id),
        ]),
      ],
    });

    const kiinnostuksetApiCall = client.PUT('/api/profiili/kiinnostukset/osaamiset', {
      body: [
        ...new Set([
          ...((await client.GET('/api/profiili/kiinnostukset/osaamiset')).data?.kiinnostukset ?? []),
          ...kiinnostukset.map((k) => k.id),
        ]),
      ],
    });

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
  }, [kiinnostukset, osaamiset, setKiinnostukset, setOsaamiset]);

  return (
    <Button
      variant="gray"
      className="w-fit"
      label={t('tool.my-own-data.export.export-button')}
      data-testid="competence-export-button"
      size="sm"
      onClick={() =>
        showDialog({
          title: t('tool.my-own-data.export.confirm-title'),
          description: t('tool.my-own-data.export.confirm-description'),
          confirmText: t('tool.my-own-data.export.confirm-button'),
          cancelText: t('tool.my-own-data.cancel-text'),
          variant: 'normal',
          onConfirm: exportToProfile,
        })
      }
    />
  );
};

const CompetenceImport = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const { t } = useTranslation();

  const {
    storeOsaamiset,
    storeKiinnostukset,
    setOsaamiset,
    setOsaamisetVapaateksti,
    setKiinnostukset,
    setKiinnostuksetVapaateksti,
  } = useToolStore(
    useShallow((state) => ({
      kiinnostuksetVapaateksti: state.kiinnostuksetVapaateksti,
      muutOsaamisetVapaateksti: state.osaamisetVapaateksti,
      storeOsaamiset: state.osaamiset,
      storeKiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setOsaamisetVapaateksti: state.setOsaamisetVapaateksti,
      setKiinnostukset: state.setKiinnostukset,
      setKiinnostuksetVapaateksti: state.setKiinnostuksetVapaateksti,
    })),
  );
  const {
    toimenkuvat,
    koulutukset,
    patevyydet,
    muutOsaamiset,
    muutOsaamisetVapaateksti,
    osaamiset,
    isLoggedIn,
    kiinnostukset,
    kiinnostuksetVapaateksti,
  } = useLoaderData<ToolLoaderData>();

  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    {
      TOIMENKUVA: [],
      KOULUTUS: [],
      PATEVYYS: [],
      MUU_OSAAMINEN: [],
      KIINNOSTUS: [],
    },
    {
      toimenkuvat,
      koulutukset,
      patevyydet,
      muutOsaamiset,
      kiinnostukset,
      muutOsaamisetVapaateksti,
      kiinnostuksetVapaateksti,
    },
  );

  const importKiinnostuksetFromProfile = React.useCallback(async () => {
    globalThis._paq?.push(['trackEvent', 'yksilo.Kartoitustyökalut', 'Klikkaus', 'Profiilista tuonti']);
    const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset');
    const newKiinnostukset = (await osaamisetService.find(data?.kiinnostukset)).map((k) => ({
      id: k.uri,
      nimi: k.nimi,
      kuvaus: k.kuvaus,
      tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
    }));

    setKiinnostukset(mergeUniqueValuesExcludingType(storeKiinnostukset, newKiinnostukset, 'KIINNOSTUS'));
    setKiinnostuksetVapaateksti(data?.vapaateksti);
  }, [setKiinnostukset, setKiinnostuksetVapaateksti, storeKiinnostukset]);

  const onCompetenceImportConfirm = React.useCallback(async () => {
    try {
      const mappedSelectedCompetences = FILTERS_ORDER.flatMap((tyyppi) =>
        (selectedFilters[tyyppi] ?? [])
          .filter((sf) => sf.checked)
          .map((f) => ({
            id: f.value,
            tyyppi: tyyppi,
          })),
      );

      const importedInterests = kiinnostukset
        .filter((kiinnostus) =>
          mappedSelectedCompetences.some((msc) => msc.tyyppi === 'KIINNOSTUS' && msc.id.includes(kiinnostus.uri)),
        )
        .map((k) => ({
          id: k.uri,
          nimi: k.nimi,
          kuvaus: k.kuvaus,
          tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
        }));

      const currentAndImportedSkills = [
        ...osaamiset
          .filter((osaaminen) => {
            return mappedSelectedCompetences.some((msc) => {
              if (msc.tyyppi === 'MUU_OSAAMINEN') {
                return msc.id.includes(osaaminen.osaaminen.uri) && osaaminen.lahde.tyyppi === 'MUU_OSAAMINEN';
              } else if (osaaminen.lahde.id) {
                return msc.id.includes(osaaminen.lahde.id) && msc.tyyppi === osaaminen.lahde.tyyppi;
              }
              return false;
            });
          })
          .map((skill) => ({
            id: skill.osaaminen.uri,
            nimi: skill.osaaminen.nimi,
            kuvaus: skill.osaaminen.kuvaus,
            tyyppi: skill.lahde.tyyppi,
          })),
        ...storeOsaamiset.filter((o) => o.tyyppi === 'KARTOITETTU'),
      ];

      // Count occurrences for each id
      const occurrences = currentAndImportedSkills.reduce(
        (acc, item) => {
          acc[item.id] = (acc[item.id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Remove duplicates and sort by occurrence count
      const filtered = removeDuplicatesByKey(currentAndImportedSkills, (item) => item.id + item.tyyppi).sort(
        (a, b) => occurrences[b.id] - occurrences[a.id],
      );

      setOsaamiset(filtered);

      const hasMuutOsaamisetVapaateksti =
        mappedSelectedCompetences.some((o) => o.tyyppi === 'MUU_OSAAMINEN' && o.id.length === 0) &&
        hasLocalizedText(muutOsaamisetVapaateksti);
      if (currentAndImportedSkills.some((o) => o.tyyppi === 'MUU_OSAAMINEN') || hasMuutOsaamisetVapaateksti) {
        const { data } = await client.GET('/api/profiili/muu-osaaminen');
        setOsaamisetVapaateksti(data?.vapaateksti);
      }

      const hasKiinnostuksetVapaateksti =
        mappedSelectedCompetences.some((o) => o.tyyppi === 'KIINNOSTUS' && o.id.length === 0) &&
        hasLocalizedText(kiinnostuksetVapaateksti);
      if (importedInterests.length > 0 || hasKiinnostuksetVapaateksti) {
        await importKiinnostuksetFromProfile();
      }

      toast.success(t('tool.my-own-data.competences.import.success-toast'));
      onImportSuccess?.();
    } catch (_error) {
      toast.error(t('tool.my-own-data.competences.import.failure-toast'));
    }
  }, [
    importKiinnostuksetFromProfile,
    kiinnostukset,
    kiinnostuksetVapaateksti,
    muutOsaamisetVapaateksti,
    onImportSuccess,
    osaamiset,
    selectedFilters,
    setOsaamiset,
    setOsaamisetVapaateksti,
    storeOsaamiset,
    t,
  ]);
  // Have to render ConfirmDialog here instead of "showDialog" from the "useModal" hook because of the "content" prop.
  // When using "showDialog" and passing content that way, the dialog will not render any changes to content, like ticking the checkboxes.
  return (
    <ConfirmDialog
      title={t('tool.my-own-data.competences.import.confirm-title')}
      description={t('tool.my-own-data.competences.import.confirm-description')}
      onConfirm={onCompetenceImportConfirm}
      confirmText={t('tool.my-own-data.competences.import.confirm-button')}
      cancelText={t('tool.my-own-data.cancel-text')}
      content={
        <CompetenceFilters
          filterKeys={filterKeys}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
      }
    >
      {(showImportDialog: () => void) => (
        <Button
          data-testid="competence-import-button"
          className="w-fit"
          label={t('tool.my-own-data.competences.import.import-button')}
          onClick={showImportDialog}
          disabled={!isLoggedIn}
          variant="gray"
          size="sm"
        />
      )}
    </ConfirmDialog>
  );
};

const ProfileImportExport = ({ onImportSuccess }: { onImportSuccess?: () => void }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { isLoggedIn } = useLoaderData<ToolLoaderData>();

  return isLoggedIn ? (
    <div className="flex flex-col gap-6 whitespace-pre-line">
      <p className="font-arial text-body-md">{t('tool.competency-profile.help')}</p>
      <div className="flex flex-col gap-3">
        <CompetenceImport onImportSuccess={onImportSuccess} />
        <CompetenceExport />
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <p className="font-arial">{t('tool.competency-profile.login-description')}</p>
      <Button
        label={t('login-to-service')}
        size="sm"
        icon={<JodArrowRight />}
        iconSide="right"
        variant="gray"
        className="w-fit"
        linkComponent={getLinkTo(`/${language}/${t('slugs.profile.login')}`, {
          state: { callbackURL: t('slugs.tool.index') },
        })}
        data-testid="tool-open-login"
      />
    </div>
  );
};

export default ProfileImportExport;
