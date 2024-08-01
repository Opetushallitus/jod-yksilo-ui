import { client } from '@/api/client';
import {
  MainLayout,
  RoutesNavigationList,
  SelectableTable,
  SimpleNavigationList,
  Title,
  type RoutesNavigationListProps,
} from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { WorkHistoryWizard } from './WorkHistoryWizard';
import { Tyopaikka, getWorkHistoryTableRows } from './utils';

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

  const checkedRows = rows.filter((row) => row.checked);

  React.useEffect(() => {
    setRows(getWorkHistoryTableRows(tyopaikat));
  }, [tyopaikat]);

  const deleteTyopaikkat = async () => {
    await Promise.all(
      checkedRows
        .map((row) => row.key)
        .map((id) =>
          client.DELETE('/api/profiili/tyopaikat/{id}', {
            params: { path: { id } },
          }),
        ),
    );
    navigate('.', { replace: true });
  };

  return (
    <MainLayout
      navChildren={
        <SimpleNavigationList title={t('profile.index')}>
          <RoutesNavigationList routes={navigationRoutes} />
        </SimpleNavigationList>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1 font-poppins">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      <SelectableTable
        selectableColumnHeader={t('work-history.workplace-or-job-description')}
        rows={rows}
        setRows={setRows}
      />
      {isOpen && <WorkHistoryWizard isOpen={isOpen} setIsOpen={setIsOpen} selectedRow={checkedRows[0]} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('work-history.add-new-workplace')}
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
            <ConfirmDialog
              title={t('work-history.delete-selected-work-history')}
              onConfirm={() => void deleteTyopaikkat()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('work-history.confirm-delete-selected-work-history')}
            >
              {(showDialog: () => void) => (
                <Button
                  variant="white-delete"
                  label={t('delete')}
                  onClick={showDialog}
                  disabled={checkedRows.length === 0}
                />
              )}
            </ConfirmDialog>
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default WorkHistory;
