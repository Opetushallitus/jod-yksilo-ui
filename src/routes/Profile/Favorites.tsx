import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useActionBar } from '@/hooks/useActionBar';
import { mapNavigationRoutes } from './utils';
import {
  Title,
  MainLayout,
  SimpleNavigationList,
  type RoutesNavigationListProps,
  RoutesNavigationList,
} from '@/components';
import { Button } from '@jod/design-system';
import { useOutletContext } from 'react-router-dom';

const Favorites = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const { t } = useTranslation();
  const title = t('profile.favorites');
  const navigationRoutes = useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();

  return (
    <MainLayout
      navChildren={
        <div className="flex flex-col gap-5">
          <SimpleNavigationList title={t('profile.index')} collapsible>
            <RoutesNavigationList routes={navigationRoutes} />
          </SimpleNavigationList>
          <SimpleNavigationList title="Sisältö" collapsible>
            <div className="py-4">
              <p className="mb-5 text-body-xs text-secondary-gray">Valitse näytettävien suosikit.</p>
              TODO
            </div>
          </SimpleNavigationList>
        </div>
      }
    >
      <Title value={title} />
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="mb-8 text-body-md">
        Lorem ipsum dolor sit amet, no vis verear commodo. Vix quot dicta phaedrum ad. Has eu invenire concludaturque,
        simul accusata no ius. Volumus corpora per te, pri lucilius salutatus iracundia ut. Mutat posse voluptua quo cu,
        in albucius nominavi principes eum, quem facilisi cotidieque mel no.
      </p>
      {actionBar &&
        createPortal(
          <div className="mx-auto flex max-w-[1140px] flex-wrap gap-4 px-5 py-4 sm:gap-5 sm:px-6 sm:py-5">
            <Button
              variant="white"
              label="Vertaile"
              onClick={() => {
                alert('Vertaile');
              }}
            />
            <Button
              variant="white"
              label="Luo polku"
              onClick={() => {
                alert('Luo polku');
              }}
            />
            <Button
              variant="white-delete"
              label="Poista valitut ammatit"
              onClick={() => {
                alert('Poista valitut ammatit');
              }}
            />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Favorites;
