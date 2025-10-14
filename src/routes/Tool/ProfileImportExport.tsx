import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useModal } from '@/hooks/useModal';
import { CompetenceFilters } from '@/routes/Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER } from '@/routes/Profile/Competences/constants';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { getLinkTo } from '@/utils/routeUtils';
import { Button, ConfirmDialog } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';
import type { OsaaminenLahdeTyyppi } from '../types';
import type { ToolLoaderData } from './loader';

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
    setOsaamiset(removeDuplicates(newOsaamiset, 'id'));
    const newKiinnostukset = kiinnostukset.map((k) => ({
      ...k,
      tyyppi: k.tyyppi === 'KARTOITETTU' ? 'KIINNOSTUS' : k.tyyppi,
    }));
    setKiinnostukset(removeDuplicates(newKiinnostukset, 'id'));
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

const CompetenceImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const {
    storeOsaamiset,
    storeKiinnostukset,
    kiinnostuksetVapaateksti,
    muutOsaamisetVapaateksti,
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
  const locale = language as 'fi' | 'sv';
  const { toimenkuvat, koulutukset, patevyydet, muutOsaamiset, osaamiset, isLoggedIn, kiinnostukset } =
    useLoaderData<ToolLoaderData>();

  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    locale,
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
    const newKiinnostukset = [
      ...(await osaamisetService.find(data?.kiinnostukset)).map((k) => ({
        id: k.uri,
        nimi: k.nimi,
        kuvaus: k.kuvaus,
        tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
      })),
      ...storeKiinnostukset.filter((o) => o.tyyppi === 'KARTOITETTU'),
    ];
    setKiinnostukset(removeDuplicates(newKiinnostukset, 'id'));
    setKiinnostuksetVapaateksti(data?.vapaateksti);
  }, [setKiinnostukset, setKiinnostuksetVapaateksti, storeKiinnostukset]);

  const onCompetenceImportConfirm = React.useCallback(async () => {
    const mappedSelectedCompetences = FILTERS_ORDER.map((tyyppi) =>
      (selectedFilters[tyyppi] ?? [])
        .filter((sf) => sf.checked)
        .map((f) => ({
          id: f.value,
          tyyppi: tyyppi,
        })),
    ).flat();

    const toBeImportedInterests = [
      ...kiinnostukset
        .filter((kiinnostus) =>
          mappedSelectedCompetences.some((msc) => msc.tyyppi === 'KIINNOSTUS' && msc.id.includes(kiinnostus.uri)),
        )
        .map((k) => ({
          id: k.uri,
          nimi: k.nimi,
          kuvaus: k.kuvaus,
          tyyppi: 'KIINNOSTUS' as OsaaminenLahdeTyyppi,
        })),
    ];

    const toBeImportedSkills = [
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

    setOsaamiset([...removeDuplicates(toBeImportedSkills, 'id')]);
    setKiinnostukset([...removeDuplicates(toBeImportedInterests, 'id')]);

    if (toBeImportedSkills.some((o) => o.tyyppi === 'MUU_OSAAMINEN')) {
      const { data } = await client.GET('/api/profiili/muu-osaaminen');
      setOsaamisetVapaateksti(data?.vapaateksti);
    }
    if (toBeImportedInterests.some((o) => o.tyyppi === 'KIINNOSTUS')) {
      await importKiinnostuksetFromProfile();
    }
  }, [
    importKiinnostuksetFromProfile,
    kiinnostukset,
    osaamiset,
    selectedFilters,
    setKiinnostukset,
    setOsaamiset,
    setOsaamisetVapaateksti,
    storeOsaamiset,
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

const ProfileImportExport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { isLoggedIn } = useLoaderData<ToolLoaderData>();

  return isLoggedIn ? (
    <div className="flex flex-col gap-6 whitespace-pre-line">
      <p className="font-arial text-body-md">{t('tool.competency-profile.help')}</p>
      <div className="flex flex-col gap-3">
        <CompetenceImport />
        <CompetenceExport />
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <p className="font-arial">{t('tool.competency-profile.login-description')}</p>
      <Button
        data-testid="tool-open-login"
        label={t('login-to-service')}
        size="sm"
        icon={<JodArrowRight />}
        iconSide="right"
        variant="gray"
        className="w-fit"
        LinkComponent={getLinkTo(`/${language}/${t('slugs.profile.login')}`, {
          state: { callbackURL: t('slugs.tool.index') },
        })}
      />
    </div>
  );
};

export default ProfileImportExport;
