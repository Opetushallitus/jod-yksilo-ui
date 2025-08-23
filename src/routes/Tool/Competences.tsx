import { client } from '@/api/client';
import { OsaamisSuosittelija } from '@/components';
import { createLoginDialogFooter } from '@/components/createLoginDialogFooter';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useModal } from '@/hooks/useModal';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useLocation, useOutletContext } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { CompetenceFilters } from '../Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER } from '../Profile/Competences/constants';
import type { CompetencesLoaderData } from '../Profile/Competences/loader';
import type { ToolLoaderData } from './loader';

const CompetenceImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { state } = useLocation();
  const loginLink = useLoginLink({
    callbackURL: state?.callbackURL
      ? `/${language}/${state?.callbackURL}`
      : `/${language}/${t('slugs.profile.index')}/${t('slugs.profile.front')}`,
  });

  const { showDialog, closeAllModals } = useModal();
  const { isLoggedIn } = useOutletContext<ToolLoaderData>();
  const toolStore = useToolStore();

  const locale = language as 'fi' | 'sv';
  const { toimenkuvat, koulutukset, patevyydet, muutOsaamiset, osaamiset } = useLoaderData() as CompetencesLoaderData;

  const { selectedFilters, setSelectedFilters, filterKeys } = useInitializeFilters(
    locale,
    {
      TOIMENKUVA: [],
      KOULUTUS: [],
      PATEVYYS: [],
      MUU_OSAAMINEN: [],
    },
    toimenkuvat,
    koulutukset,
    patevyydet,
    muutOsaamiset,
  );

  const onCompetenceImportConfirm = React.useCallback(async () => {
    const mappedSelectedCompetences = FILTERS_ORDER.map((tyyppi) =>
      selectedFilters[tyyppi]
        .filter((sf) => sf.checked)
        .map((f) => ({
          id: f.value,
          tyyppi: tyyppi,
        })),
    ).flat();

    const toBeImportedSkills = [
      ...osaamiset
        .filter((osaaminen) => {
          return mappedSelectedCompetences.some((msc) => {
            if (msc.tyyppi === 'MUU_OSAAMINEN') {
              return msc.id.includes(osaaminen.osaaminen.uri);
            } else if (osaaminen.lahde.id) {
              return msc.id.includes(osaaminen.lahde.id);
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
      ...toolStore.osaamiset.filter((o) => o.tyyppi === 'KARTOITETTU'),
    ];

    toolStore.setOsaamiset([...removeDuplicates(toBeImportedSkills, 'id')]);
    if (toBeImportedSkills.some((o) => o.tyyppi === 'MUU_OSAAMINEN')) {
      const { data } = await client.GET('/api/profiili/muu-osaaminen');
      toolStore.setOsaamisetVapaateksti(data?.vapaateksti);
    }
  }, [osaamiset, selectedFilters, toolStore]);

  return isLoggedIn ? (
    // Have to render ConfirmDialog here instead of "showDialog" from the "useModal" hook because of the "content" prop.
    // When using "showDialog" and passing content that way, the dialog will not render any changes to content, like ticking the checkboxes.
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
          data-testid="competences-open-import"
          label={t('tool.my-own-data.competences.import.import-button')}
          onClick={showImportDialog}
          variant="white"
        />
      )}
    </ConfirmDialog>
  ) : (
    <Button
      data-testid="competences-open-login"
      label={t('tool.my-own-data.competences.import.import-button')}
      variant="white"
      onClick={() => {
        showDialog({
          title: t('login-to-service'),
          description: t('tool.my-own-data.competences.import.login-description'),
          footer: createLoginDialogFooter(t, loginLink, closeAllModals),
        });
      }}
    />
  );
};

const Competences = () => {
  const { osaamiset, setOsaamiset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      setOsaamiset: state.setOsaamiset,
    })),
  );

  return (
    <div className="pt-6 sm:pt-7 px-5 sm:px-6" data-testid="competences-view">
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={setOsaamiset}
          value={osaamiset}
          className="bg-[#F7F7F9]!"
          hideSelected
          hideTextAreaLabel
        />
      </div>
      <div className="p-6 -mx-6 bg-bg-gray-2 rounded-b" data-testid="competences-import-section">
        <CompetenceImport />
      </div>
    </div>
  );
};

export default Competences;
