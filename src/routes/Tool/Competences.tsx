import { client } from '@/api/client';
import { components } from '@/api/schema';
import { HelpingToolProfileLinkItem, HelpingToolsContent, OsaamisSuosittelija } from '@/components';
import { HelpingToolExternalLinkItem } from '@/components/HelpingToolsContent/HelpingToolLinkItem';
import { useInitializeFilters } from '@/hooks/useInitializeFilters';
import { useLoginLink } from '@/hooks/useLoginLink';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates, toastAdd } from '@/utils';
import { Accordion, Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdLightbulbOutline, MdOutlineSailing, MdOutlineSchool, MdWorkOutline } from 'react-icons/md';
import { useLoaderData, useOutletContext, useParams, useRouteLoaderData } from 'react-router';
import { CompetenceFilters } from '../Profile/Competences/CompetenceFilters';
import { FILTERS_ORDER } from '../Profile/Competences/constants';
import { CompetencesLoaderData } from '../Profile/Competences/loader';
import { generateProfileLink } from '../Profile/utils';
import { ToolLoaderData } from './loader';

const CompetenceExport = () => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();
  const { isLoggedIn } = useOutletContext<ToolLoaderData>();
  const toolStore = useToolStore();

  const exportToProfile = React.useCallback(async () => {
    const { response } = await client.PUT('/api/profiili/muu-osaaminen', {
      body: [
        ...new Set([
          ...((await client.GET('/api/profiili/muu-osaaminen')).data ?? []),
          ...toolStore.osaamiset
            .filter((o) => o.tyyppi === 'KARTOITETTU' || o.tyyppi === 'MUU_OSAAMINEN')
            .map((o) => o.id),
        ]),
      ],
    });
    toastAdd(response);

    const osaamiset = toolStore.osaamiset.map((o) => ({
      ...o,
      tyyppi: o.tyyppi === 'KARTOITETTU' ? 'MUU_OSAAMINEN' : o.tyyppi,
    }));
    toolStore.setOsaamiset(removeDuplicates(osaamiset, 'id'));
  }, [toolStore]);

  return isLoggedIn ? (
    <ConfirmDialog
      title={t('tool.my-own-data.competences.export.confirm-title')}
      description={t('tool.my-own-data.competences.export.confirm-description')}
      onConfirm={() => void exportToProfile()}
      confirmText={t('tool.my-own-data.competences.export.confirm-button')}
      cancelText={t('tool.my-own-data.cancel-text')}
    >
      {(showExportConfirmDialog: () => void) => (
        <Button label={t('tool.my-own-data.competences.export.export-button')} onClick={showExportConfirmDialog} />
      )}
    </ConfirmDialog>
  ) : (
    <ConfirmDialog
      title={t('login-to-service')}
      description={t('tool.my-own-data.competences.export.login-description')}
      /* eslint-disable-next-line react/no-unstable-nested-components */
      footer={(closeDialog: () => void) => (
        <div className="flex gap-4">
          <Button label={t('tool.my-own-data.cancel-text')} size="md" variant="gray" onClick={closeDialog} />
          <Button
            label={t('login')}
            size="md"
            variant="gray"
            /* eslint-disable-next-line react/no-unstable-nested-components */
            LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
          />
        </div>
      )}
    >
      {(showLoginConfirmDialog: () => void) => (
        <Button label={t('tool.my-own-data.competences.export.export-button')} onClick={showLoginConfirmDialog} />
      )}
    </ConfirmDialog>
  );
};

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
        <Button label={t('tool.my-own-data.competences.import.import-button')} onClick={showImportDialog} />
      )}
    </ConfirmDialog>
  ) : (
    <ConfirmDialog
      title={t('login-to-service')}
      description={t('tool.my-own-data.competences.import.login-description')}
      /* eslint-disable-next-line react/no-unstable-nested-components */
      footer={(closeDialog: () => void) => (
        <div className="flex gap-4">
          <Button label={t('tool.my-own-data.cancel-text')} size="md" variant="gray" onClick={closeDialog} />
          <Button
            label={t('login')}
            size="md"
            variant="gray"
            /* eslint-disable-next-line react/no-unstable-nested-components */
            LinkComponent={({ children }: { children: React.ReactNode }) => <a href={loginLink}>{children}</a>}
          />
        </div>
      )}
    >
      {(showLoginConfirmDialog: () => void) => (
        <Button label={t('tool.my-own-data.competences.import.import-button')} onClick={showLoginConfirmDialog} />
      )}
    </ConfirmDialog>
  );
};

const Competences = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const toolStore = useToolStore();
  const { lng } = useParams();

  const data = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'] | null;
  const competencesSlug = 'slugs.profile.competences';

  const educationLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.education-history'], data, language, t),
    [data, language, t],
  );
  const workLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.work-history'], data, language, t),
    [data, language, t],
  );
  const freeTimeLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.free-time-activities'], data, language, t),
    [data, language, t],
  );
  const somethingElseLink = React.useMemo(
    () => generateProfileLink([competencesSlug, 'slugs.profile.something-else'], data, language, t),
    [data, language, t],
  );

  return (
    <div className="py-6 sm:py-7 px-5 sm:px-6">
      <h2 className="text-heading-2-mobile sm:text-heading-2 mb-3 sm:mb-5">
        {t('tool.my-own-data.competences.title')}
      </h2>
      <p className="text-body-md-mobile sm:text-body-md whitespace-pre-wrap mb-6">
        {t('tool.my-own-data.competences.description')}
      </p>
      <div className="mb-6">
        <OsaamisSuosittelija
          onChange={toolStore.setOsaamiset}
          value={toolStore.osaamiset}
          categorized
          className="bg-[#F7F7F9]!"
        />
      </div>
      <div className="flex flex-wrap gap-5 mb-7">
        <CompetenceImport />
        <CompetenceExport />
        <ConfirmDialog
          title={t('tool.my-own-data.competences.delete-all.title')}
          onConfirm={() => toolStore.setOsaamiset([])}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          variant="destructive"
          description={t('tool.my-own-data.competences.delete-all.description')}
        >
          {(showDialog: () => void) => (
            <Button
              variant="gray-delete"
              label={t('tool.my-own-data.competences.delete-all.title')}
              onClick={showDialog}
              disabled={toolStore.osaamiset.length === 0}
            />
          )}
        </ConfirmDialog>
      </div>
      <Accordion title={t('tool.tools.title')} lang={language}>
        <HelpingToolsContent text={t('profile.help-text')}>
          <HelpingToolProfileLinkItem
            profileLink={workLink}
            icon={<MdWorkOutline size={24} color="#AD4298" />}
            title={t('tool.tools.work-history')}
          />
          <HelpingToolProfileLinkItem
            profileLink={educationLink}
            icon={<MdOutlineSchool size={24} color="#00818A" />}
            title={t('tool.tools.education-history')}
          />
          <HelpingToolProfileLinkItem
            profileLink={freeTimeLink}
            icon={<MdOutlineSailing size={24} className="text-accent" />}
            title={t('tool.tools.free-time-activities')}
          />
          <HelpingToolProfileLinkItem
            profileLink={somethingElseLink}
            icon={<MdLightbulbOutline size={24} className="text-secondary-gray" />}
            title={t('tool.tools.something-else')}
          />
          <HelpingToolExternalLinkItem
            href={`/urataidot/${lng}?yksilo=`}
            icon={<MdOutlineSchool size={24} color="#00818A" />}
            title={t('tool.tools.career-skills-self-assessment-tool')}
          />
        </HelpingToolsContent>
      </Accordion>
    </div>
  );
};

export default Competences;
