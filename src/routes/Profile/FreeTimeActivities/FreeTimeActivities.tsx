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
import { useAuth } from '@/hooks/useAuth';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';
import { FreeTimeActivitiesWizard } from './FreeTimeActivitiesWizard';
import { VapaaAjanToiminta, getFreeTimeActivitiesTableRows } from './utils';

const FreeTimeActivities = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const vapaaAjanToiminnat = useLoaderData() as VapaaAjanToiminta[];
  const navigate = useNavigate();
  const { t } = useTranslation();
  const title = t('profile.free-time-activities');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [isOpen, setIsOpen] = React.useState(false);
  const [rows, setRows] = React.useState(getFreeTimeActivitiesTableRows(vapaaAjanToiminnat));
  const auth = useAuth();
  const csrf = auth!.csrf;

  const checkedRows = rows.filter((row) => row.checked);

  React.useEffect(() => {
    setRows(getFreeTimeActivitiesTableRows(vapaaAjanToiminnat));
  }, [vapaaAjanToiminnat]);

  const deleteVapaaAjanToiminnat = async () => {
    await Promise.all([
      client.DELETE('/api/profiili/vapaa-ajan-toiminnot', {
        headers: {
          [csrf.headerName]: csrf.token,
        },
        params: { query: { ids: checkedRows.map((row) => row.key) } },
      }),
    ]);
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
      <SelectableTable
        selectableColumnHeader={t('free-time-activities.activity-or-profiency-description')}
        rows={rows}
        setRows={setRows}
      />
      {isOpen && <FreeTimeActivitiesWizard isOpen={isOpen} setIsOpen={setIsOpen} selectedRow={checkedRows[0]} />}
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label={t('free-time-activities.add-new-free-time-activity')}
              onClick={() => {
                setIsOpen(true);
              }}
              disabled={checkedRows.length !== 0}
            />
            {/* <Button
              variant="white"
              label="Tunnista osaamisia"
              onClick={() => {
                alert('Tunnista osaamisia');
              }}
            /> */}
            <Button
              variant="white"
              label={t('edit')}
              onClick={() => {
                setIsOpen(true);
              }}
              disabled={checkedRows.length !== 1}
            />
            <ConfirmDialog
              title={t('free-time-activities.delete-selected-free-time-activities')}
              onConfirm={() => void deleteVapaaAjanToiminnat()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('free-time-activities.confirm-delete-selected-free-time-activities')}
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

export default FreeTimeActivities;
