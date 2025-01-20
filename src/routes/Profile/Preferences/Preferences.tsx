import { client } from '@/api/client';
import { components } from '@/api/schema';
import { MainLayout, RoutesNavigationList, SimpleNavigationList, type RoutesNavigationListProps } from '@/components';
import { useActionBar } from '@/hooks/useActionBar';
import { Button, ConfirmDialog } from '@jod/design-system';
import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useRouteLoaderData } from 'react-router';
import { mapNavigationRoutes } from '../utils';

const Preferences = () => {
  const routes = useOutletContext<RoutesNavigationListProps['routes']>();
  const { t } = useTranslation();
  const title = t('profile.preferences.title');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const rootLoaderData = useRouteLoaderData('root') as components['schemas']['YksiloCsrfDto'];

  const deleteAccount = async () => {
    await client.DELETE('/api/profiili/yksilo');
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
      <title>{title}</title>
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">
        {t('welcome', { name: rootLoaderData.etunimi ?? 'Nimetön' })}
      </h1>

      <div className="mb-8 text-body-md flex flex-col gap-7">
        <p>{t('profile.preferences.you-are-signed-in')}</p>
        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-2')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-1-item-3')}</li>
        </ul>
        <p>{t('profile.preferences.paragraph-2')}</p>
        <ul>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-2-item-1')}</li>
          <li className="list-disc ml-7 pl-4">{t('profile.preferences.list-2-item-2')}</li>
        </ul>
        <p>{t('profile.preferences.paragraph-3')}</p>
        <p>{t('profile.preferences.paragraph-4')}</p>
      </div>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button variant="white" label={`TODO: ${t('preferences.share-my-competences')}`} />
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
