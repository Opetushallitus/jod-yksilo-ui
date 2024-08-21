import { client } from '@/api/client';
import {
  MainLayout,
  RoutesNavigationList,
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
import { useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';

const Preferences = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const { t } = useTranslation();
  const title = t('profile.preferences');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const auth = useAuth();

  const deleteAccount = async () => {
    await client.DELETE('/api/yksilo');
    window.location.href = '/';
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
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('welcome', { name: auth?.etunimi ?? 'Nimetön' })}</h1>
      <p className="mb-8 text-body-md font-arial">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
        <br />
        <br />
        Cum ei sale incorrupte voluptatibus, his causae epicuri in, in est vero inimicus. Nam an ipsum tantas torquatos,
        per ei decore commodo, consul voluptua neglegentur te eam.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label={t('preferences.share-my-competences')} disabled />
            <ConfirmDialog
              title={t('preferences.delete-my-account')}
              onConfirm={() => void deleteAccount()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('preferences.confirm-delete-my-account')}
            >
              {(showDialog: () => void) => (
                <Button variant="white-delete" label={t('preferences.delete-my-account')} onClick={showDialog} />
              )}
            </ConfirmDialog>
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Preferences;
