import React from 'react';
import { createPortal } from 'react-dom';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActionBar } from '@/hooks/useActionBar';
import { client } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { mapNavigationRoutes } from '../utils';
import { WorkHistoryWizard } from './WorkHistoryWizard';
import { WorkHistoryTable } from './WorkHistoryTable';
import { Tyopaikka, getWorkHistoryTableRows } from './utils';
import {
  Title,
  MainLayout,
  SimpleNavigationList,
  type RoutesNavigationListProps,
  RoutesNavigationList,
} from '@/components';
import { Button } from '@jod/design-system';
import { RootLoaderData } from '@/routes/Root/loader';

const WorkHistory = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const tyopaikat = useLoaderData() as Tyopaikka[];
  const navigate = useNavigate();
  const { t } = useTranslation();
  const title = t('profile.work-history');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rows, setRows] = React.useState(getWorkHistoryTableRows(tyopaikat));
  const { csrf } = useAuth() as { csrf: NonNullable<RootLoaderData['csrf']> };

  const checkedRows = rows.filter((row) => row.checked);

  React.useEffect(() => {
    setRows(getWorkHistoryTableRows(tyopaikat));
  }, [tyopaikat]);

  const deleteTyopaikkat = async () => {
    await Promise.all(
      checkedRows
        .filter((row) => row.tyopaikkaId)
        .map((row) => row.tyopaikkaId as unknown as string)
        .map((id) =>
          client.DELETE('/api/profiili/tyopaikat/{id}', {
            headers: {
              [csrf.headerName]: csrf.token,
            },
            params: { path: { id } },
          }),
        ),
    );
    navigate('.', { replace: true });
  };

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('profile.index')} collapsible>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <WorkHistoryTable rows={rows} setRows={setRows} />
      {isOpen && <WorkHistoryWizard isOpen={isOpen} setIsOpen={setIsOpen} tyopaikka={checkedRows[0]} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('work-history.add-new-work-history')}
              onClick={() => setIsOpen(true)}
              disabled={checkedRows.length !== 0}
            />
            {/* <Button
              variant="white"
              label="Hae tietoja..."
              onClick={() => {
                alert('Hae tietoja...');
              }}
              disabled={checkedRows.length !== 0}
            /> */}
            {/* <Button
              variant="white"
              label="Tunnista osaamisia"
              onClick={() => {
                alert('Tunnista osaamisia');
              }}
              disabled={checkedRows.length === 0}
            /> */}
            <Button
              variant="white"
              label={t('edit')}
              onClick={() => setIsOpen(true)}
              disabled={checkedRows.length !== 1}
            />
            <Button
              variant="white-delete"
              label={t('delete')}
              onClick={() => void deleteTyopaikkat()}
              disabled={checkedRows.length === 0}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default WorkHistory;
