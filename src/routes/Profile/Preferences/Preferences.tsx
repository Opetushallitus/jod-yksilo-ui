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
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { mapNavigationRoutes } from '../utils';

const Preferences = () => {
  const routes: RoutesNavigationListProps['routes'] = useOutletContext();
  const { t } = useTranslation();
  const title = t('profile.preferences');
  const navigationRoutes = React.useMemo(() => mapNavigationRoutes(routes), [routes]);
  const actionBar = useActionBar();
  const [file, setFile] = React.useState<File>();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
    },
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  });
  const navigate = useNavigate();
  const auth = useAuth();
  const kuva = auth?.kuva;
  const csrf = auth!.csrf;

  const saveAvatar = async (file: File, hideDialog: () => void) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/yksilo/kuva', {
      method: 'POST',
      headers: {
        [csrf.headerName]: csrf.token,
      },
      body: formData,
    });
    hideDialog();
    navigate('.', { replace: true });
  };

  const deleteImage = async () => {
    await client.DELETE('/api/yksilo/kuva', {
      headers: {
        [csrf.headerName]: csrf.token,
      },
    });
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
      <h1 className="mb-5 text-heading-2 sm:text-heading-1">{t('welcome', { name: 'Reetta' })}</h1>
      <p className="mb-8 text-body-md">
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
            {kuva ? (
              <ConfirmDialog
                title={t('preferences.delete-image')}
                onConfirm={() => void deleteImage()}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="destructive"
                description={t('preferences.confirm-delete-image')}
              >
                {(showDialog: () => void) => (
                  <Button variant="white-delete" label={t('preferences.delete-image')} onClick={showDialog} />
                )}
              </ConfirmDialog>
            ) : (
              <ConfirmDialog
                title={t('preferences.title')}
                description={t('preferences.description')}
                content={
                  <section>
                    <div
                      {...getRootProps()}
                      className="flex-col border-2 border-[#CECECE] border-dashed w-full h-[200px] bg-bg-gray rounded-md p-4 text-body-sm text-accent text-center flex gap-5 items-center cursor-pointer justify-center"
                    >
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>{t('preferences.help-active')}</p>
                      ) : (
                        <p className="whitespace-pre-line">
                          {file
                            ? t('preferences.selected-image', { name: (file as unknown as { path: string }).path })
                            : t('preferences.help')}
                        </p>
                      )}
                    </div>
                  </section>
                }
                footer={(hideDialog) => (
                  <>
                    <Button onClick={hideDialog} label={t('cancel')} variant="white" />
                    <Button
                      onClick={() => void saveAvatar(file!, hideDialog)}
                      label={t('save')}
                      variant="white"
                      disabled={!file}
                    />
                  </>
                )}
              >
                {(showDialog: () => void) => (
                  <Button
                    variant="white"
                    label={t('preferences.add-image')}
                    onClick={() => {
                      setFile(undefined);
                      showDialog();
                    }}
                  />
                )}
              </ConfirmDialog>
            )}
            <Button variant="white" label={t('preferences.share-my-competences')} disabled />
            <Button variant="white-delete" label={t('preferences.delete-my-account')} disabled />
          </div>,
          actionBar,
        )}
    </MainLayout>
  );
};

export default Preferences;
