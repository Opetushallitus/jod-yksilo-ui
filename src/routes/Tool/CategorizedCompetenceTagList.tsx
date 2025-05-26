import { client } from '@/api/client';
import AddedTags from '@/components/OsaamisSuosittelija/AddedTags';
import { type OsaaminenValue } from '@/components/OsaamisSuosittelija/OsaamisSuosittelija';
import { useLoginLink } from '@/hooks/useLoginLink';
import { ToolLoaderData } from '@/routes/Tool/loader';
import type { OsaaminenLahdeTyyppi } from '@/routes/types';
import { useToolStore } from '@/stores/useToolStore';
import { removeDuplicates } from '@/utils';
import { Accordion, Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';

const CompetenceExport = () => {
  const { t } = useTranslation();
  const loginLink = useLoginLink();
  const { isLoggedIn } = useLoaderData<ToolLoaderData>();
  const { osaamiset, kiinnostukset, setOsaamiset, setKiinnostukset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      kiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setKiinnostukset: state.setKiinnostukset,
    })),
  );

  const exportToProfile = React.useCallback(async () => {
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

  return isLoggedIn ? (
    <ConfirmDialog
      title={t('tool.my-own-data.export.confirm-title')}
      description={t('tool.my-own-data.export.confirm-description')}
      onConfirm={() => void exportToProfile()}
      confirmText={t('tool.my-own-data.export.confirm-button')}
      cancelText={t('tool.my-own-data.cancel-text')}
    >
      {(showExportConfirmDialog: () => void) => (
        <Button label={t('tool.my-own-data.export.export-button')} onClick={showExportConfirmDialog} variant="white" />
      )}
    </ConfirmDialog>
  ) : (
    <ConfirmDialog
      title={t('login-to-service')}
      description={t('tool.my-own-data.export.login-description')}
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
          label={t('tool.my-own-data.export.export-button')}
          onClick={showLoginConfirmDialog}
          className="whitespace-nowrap"
          variant="white"
        />
      )}
    </ConfirmDialog>
  );
};

const CompetenceCategory = ({
  title,
  osaamiset,
  onChange,
  lahdeTyyppi,
}: {
  title: string;
  osaamiset: OsaaminenValue[];
  onChange: (id: string) => () => void;
  lahdeTyyppi?: OsaaminenLahdeTyyppi;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="font-arial text-help">{`${t(title)} (${osaamiset.length})`}</div>
      <div className="flex flex-wrap gap-3">
        {<AddedTags osaamiset={osaamiset} onClick={onChange} lahdetyyppi={lahdeTyyppi} />}
      </div>
    </div>
  );
};

/**
 * Renders categorized tags for competences or interests.
 */
const CategorizedCompetenceTagList = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { osaamiset, kiinnostukset, setOsaamiset, setKiinnostukset } = useToolStore(
    useShallow((state) => ({
      osaamiset: state.osaamiset,
      kiinnostukset: state.kiinnostukset,
      setOsaamiset: state.setOsaamiset,
      setKiinnostukset: state.setKiinnostukset,
    })),
  );

  const filterByType = (type: OsaaminenLahdeTyyppi) => (val: OsaaminenValue) => val.tyyppi === type;
  const filterOsaaminenById = (id: string) => (value: OsaaminenValue) => value.id !== id;
  const mappedInterests = React.useMemo(() => kiinnostukset.filter(filterByType('KARTOITETTU')), [kiinnostukset]);
  const mappedCompetences = React.useMemo(() => osaamiset.filter(filterByType('KARTOITETTU')), [osaamiset]);
  const profileCompetences = React.useMemo(() => osaamiset.filter((val) => val.tyyppi !== 'KARTOITETTU'), [osaamiset]);

  const removeCompetenceByType = (type: 'osaaminen' | 'kiinnostus') => (id: string) => () => {
    const data = type === 'kiinnostus' ? kiinnostukset : osaamiset;
    const setData = type === 'kiinnostus' ? setKiinnostukset : setOsaamiset;
    setData(data.filter(filterOsaaminenById(id)));
  };

  return (
    <div className="bg-white rounded p-6">
      <Accordion
        title={t('tool.my-own-data.competences-of-your-choice-with-counts', {
          osaamiset: osaamiset.filter((o) => o.tyyppi !== 'KIINNOSTUS').length,
          kiinnostukset: kiinnostukset.length,
        })}
        lang={language}
      >
        <div className="flex flex-col gap-3">
          <div className="text-heading-4 my-6">
            {t('mapped')} {`(${mappedCompetences.length + mappedInterests.length})`}
          </div>
          <div className="flex flex-col gap-6 mb-8">
            <CompetenceCategory
              title="competences"
              osaamiset={mappedCompetences}
              onChange={removeCompetenceByType('osaaminen')}
            />
            <CompetenceCategory
              title="interests"
              osaamiset={mappedInterests}
              onChange={removeCompetenceByType('osaaminen')}
              lahdeTyyppi="KIINNOSTUS"
            />
          </div>

          <div className="text-heading-4">
            {t('competences-from-profile')} {`(${profileCompetences.length})`}
          </div>

          <div className="flex flex-col gap-6">
            <CompetenceCategory
              title={t('my-competences.by-TOIMENKUVA')}
              osaamiset={osaamiset.filter(filterByType('TOIMENKUVA'))}
              onChange={removeCompetenceByType('osaaminen')}
            />
            <CompetenceCategory
              title={t('my-competences.by-KOULUTUS')}
              osaamiset={osaamiset.filter(filterByType('KOULUTUS'))}
              onChange={removeCompetenceByType('osaaminen')}
            />
            <CompetenceCategory
              title={t('my-competences.by-PATEVYYS')}
              osaamiset={osaamiset.filter(filterByType('PATEVYYS'))}
              onChange={removeCompetenceByType('osaaminen')}
            />
            <CompetenceCategory
              title={t('my-competences.by-MUU_OSAAMINEN')}
              osaamiset={osaamiset.filter(filterByType('MUU_OSAAMINEN'))}
              onChange={removeCompetenceByType('osaaminen')}
            />
            <CompetenceCategory
              title={t('profile.interests.skills-that-interest-me')}
              osaamiset={kiinnostukset.filter(filterByType('KIINNOSTUS'))}
              onChange={removeCompetenceByType('kiinnostus')}
            />
            <div className="font-arial text-help">{t('tool.remove-competence-help')}</div>
          </div>

          <div className="flex flex-col gap-4 p-6 -mx-6 -mb-6 bg-bg-gray-2 items-start rounded-b">
            <CompetenceExport />
            <ConfirmDialog
              title={t('tool.my-own-data.competences.delete-all.title')}
              onConfirm={() => {
                setOsaamiset([]);
                setKiinnostukset([]);
              }}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('tool.my-own-data.competences.delete-all.description')}
            >
              {(showDialog: () => void) => (
                <Button
                  variant="white"
                  label={t('tool.my-own-data.competences.delete-all.title')}
                  onClick={showDialog}
                  disabled={osaamiset.length === 0 && kiinnostukset.length === 0}
                />
              )}
            </ConfirmDialog>
          </div>
        </div>
      </Accordion>
    </div>
  );
};
export default CategorizedCompetenceTagList;
