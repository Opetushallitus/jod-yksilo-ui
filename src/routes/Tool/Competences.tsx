import { OsaamisSuosittelija } from '@/components';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useOutletContext } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { CompetenceFilters } from '../Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER } from '../Profile/Competences/constants';
import { CompetencesLoaderData } from '../Profile/Competences/loader';
import { ToolLoaderData } from './loader';

const CompetenceImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const loginLink = useLoginLink();
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

  const onCompetenceImportConfirm = React.useCallback(() => {
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
  }, [osaamiset, selectedFilters, toolStore]);

  return isLoggedIn ? (
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
          label={t('tool.my-own-data.competences.import.import-button')}
          onClick={showImportDialog}
          variant="white"
        />
      )}
    </ConfirmDialog>
  ) : (
    <ConfirmDialog
      title={t('login-to-service')}
      description={t('tool.my-own-data.competences.import.login-description')}
      /* eslint-disable-next-line react/no-unstable-nested-components */
      footer={(closeDialog: () => void) => (
        <div className="flex gap-4 flex-1">
          <Button
            label={t('tool.my-own-data.cancel-text')}
            size="md"
            variant="gray"
            onClick={closeDialog}
            className="whitespace-nowrap"
          />
          <Button
            label={t('login')}
            size="md"
            variant="gray"
            /* eslint-disable-next-line react/no-unstable-nested-components */
            LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
            className="whitespace-nowrap"
          />
        </div>
      )}
    >
      {(showLoginConfirmDialog: () => void) => (
        <Button
          label={t('tool.my-own-data.competences.import.import-button')}
          onClick={showLoginConfirmDialog}
          variant="white"
        />
      )}
    </ConfirmDialog>
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
    <div className="pt-6 sm:pt-7 px-5 sm:px-6">
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={setOsaamiset}
          value={osaamiset}
          className="bg-[#F7F7F9]!"
          hideSelected
          hideTextAreaLabel
        />
      </div>
      <div className="p-6 -mx-6 bg-bg-gray-2 rounded-b">
        <CompetenceImport />
      </div>
    </div>
  );
};

export default Competences;
