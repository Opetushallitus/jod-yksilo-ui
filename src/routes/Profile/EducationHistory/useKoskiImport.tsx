import React from 'react';
import toast from 'react-hot-toast/headless';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useRevalidator, useSearchParams } from 'react-router';

import { useNoteStack } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';

import { client } from '@/api/client';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useModal } from '@/hooks/useModal';
import { LogoutFormContext } from '@/routes/Root';

import ImportKoulutusSummaryModal from './modals/ImportKoulutusSummaryModal';

export const useKoskiImport = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { showModal, showDialog } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const { isPrd } = useEnvironment();
  const { addTemporaryNote } = useNoteStack();
  const logoutForm = React.useContext(LogoutFormContext);

  const refreshData = React.useCallback(async () => {
    await revalidator.revalidate();
  }, [revalidator]);

  const logout = React.useCallback(() => {
    logoutForm?.current?.submit();
  }, [logoutForm]);

  const opintopolkuUrl = React.useMemo(() => {
    const base = `https://${isPrd ? 'opintopolku.fi' : 'testiopintopolku.fi'}/konfo/${language}/sivu/`;
    let path = '';

    if (language === 'sv') {
      path = 'min-studieinfo#mina-studieprestationer';
    } else if (language === 'en') {
      path = 'my-studyinfo#my-completed-studies';
    } else {
      path = 'oma-opintopolku#omat-opintosuoritukseni';
    }

    return new URL(encodeURI(`${base}${path}`)).href;
  }, [language, isPrd]);

  const showStartDialog = React.useCallback(() => {
    showDialog({
      variant: 'normal',
      title: t('education-history-import.start-modal.title'),
      confirmText: t('education-history-import.start-modal.import-button'),
      description: (
        <div className="flex flex-col font-arial text-body-md-mobile text-primary-gray sm:text-body-md">
          <Trans
            i18nKey="education-history-import.start-modal.description-1"
            components={{
              Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
              CustomLink: (
                <Link to={opintopolkuUrl} className="inline-flex items-center text-accent underline" target="_blank" />
              ),
            }}
          />
          <p className="mt-7">
            <Trans i18nKey="education-history-import.start-modal.description-2" />
          </p>
        </div>
      ),
      onConfirm: () => {
        globalThis._paq?.push(['trackEvent', 'yksilo.Rajapinnat', 'Koski tuonti - siirry Opintopolkuun']);
        const currentUrl = encodeURIComponent(globalThis.location.href);

        try {
          globalThis.location.href = `/yksilo/oauth2/authorization/koski?callback=${currentUrl}&lang=${language}`;
        } catch (_error) {
          globalThis._paq?.push([
            'trackEvent',
            'yksilo.Rajapinnat',
            'Koski tuonti - siirtyminen Opintopolkuun epäonnistui',
          ]);
          toast.error(t('education-history-import.start-modal.import-redirect-fail'));
        }
      },
    });
  }, [language, opintopolkuUrl, showDialog, t]);

  const openSummaryModal = React.useCallback(
    (tehtavaId?: string) => {
      showModal(ImportKoulutusSummaryModal, {
        tehtavaId,
        onSuccessful: () => {
          void refreshData();
        },
        openImportStartModal: showStartDialog,
        logout,
      });
    },
    [logout, refreshData, showModal, showStartDialog],
  );

  // Ignores repeated clicks while the unfinished imports are being checked, so only one modal opens.
  const isCheckingUnfinishedRef = React.useRef(false);

  // An unfinished import is continued rather than started again through Opintopolku.
  const openImportStartModal = React.useCallback(() => {
    if (isCheckingUnfinishedRef.current) {
      return;
    }
    isCheckingUnfinishedRef.current = true;
    globalThis._paq?.push(['trackEvent', 'yksilo.Rajapinnat', 'Koski tuonti']);
    void client
      .GET('/api/integraatiot/koski/koulutukset')
      .catch(() => ({ data: undefined }))
      .then(({ data }) => {
        const unfinished = data?.[0];
        if (unfinished?.id) {
          openSummaryModal(unfinished.id);
        } else {
          showStartDialog();
        }
      })
      .finally(() => {
        isCheckingUnfinishedRef.current = false;
      });
  }, [openSummaryModal, showStartDialog]);

  React.useEffect(() => {
    const result = searchParams.get('koski');
    if (result) {
      setSearchParams({});
      if (result === 'authorized') {
        openSummaryModal();
      } else if (result === 'error') {
        addTemporaryNote(() => ({
          title: t('education-history-import.summary-modal.error-title'),
          description: t('education-history-import.result-modal.give-permission-failed'),
          variant: 'warning',
          isCollapsed: false,
        }));
      }
    }
  }, [addTemporaryNote, openSummaryModal, searchParams, setSearchParams, t]);

  return { openImportStartModal, refreshData };
};
