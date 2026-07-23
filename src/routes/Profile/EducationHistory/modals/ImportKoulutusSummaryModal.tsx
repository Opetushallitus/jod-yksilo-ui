import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, Modal, Spinner, useMediaQueries, useNoteStack } from '@jod/design-system';

import { client } from '@/api/client';
import { ErrorResponse } from '@/api/errorResponse';
import type { components } from '@/api/schema';
import { AiInfo, type ExperienceTableRowData } from '@/components';
import { DataImportTable } from '@/components/DataImportTable/DataImportTable';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import { getEducationHistoryTableRows, type Koulutuskokonaisuus } from '@/routes/Profile/EducationHistory/utils';

interface ImportKoulutusSummaryModalProps extends ModalComponentProps {
  onSuccessful: () => void;
  openImportStartModal: () => void;
  logout: () => void;
}

const transformKoulutusKokonaisuusDto = (
  dto: components['schemas']['KoulutusKokonaisuusDto'],
): Koulutuskokonaisuus => ({
  id: dto.id,
  nimi: dto.nimi,
  tuontiLahde: dto.tuontiLahde,
  koulutukset: (dto.koulutukset ?? []).map((k) => ({
    id: k.id,
    nimi: k.kuvaus || k.nimi,
    alkuPvm: k.alkuPvm,
    loppuPvm: k.loppuPvm,
    osaamiset: k.osaamiset ?? [],
    osaamisetOdottaaTunnistusta: k.osaamisetOdottaaTunnistusta,
    osaamisetTunnistusEpaonnistui: k.osaamisetTunnistusEpaonnistui,
    osasuoritukset: k.osasuoritukset,
  })),
});

const buildSelections = (rows: ExperienceTableRowData[]): components['schemas']['Valinta'][] =>
  rows
    .filter((row) => (row.subrows ?? []).some((s) => s.checked ?? true))
    .map((row) => ({
      id: row.key,
      lapset: (row.subrows ?? []).filter((s) => s.checked ?? true).map((s) => s.key),
    }))
    .filter((valinta) => valinta.lapset.length > 0);

const ImportKoulutusSummaryModal = ({
  onSuccessful,
  openImportStartModal,
  logout,
  ...rest
}: ImportKoulutusSummaryModalProps) => {
  const { t } = useTranslation();
  const { showDialog, closeActiveModal, closeAllModals } = useModal();
  const { addTemporaryNote } = useNoteStack();
  const { sm } = useMediaQueries();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [tableRows, setTableRows] = React.useState<ExperienceTableRowData[]>([]);
  const [hasData, setHasData] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const hasFetchedRef = React.useRef<boolean>(false);
  const tehtavaIdRef = React.useRef<string | undefined>(undefined);
  const savedRef = React.useRef<boolean>(false);

  const modalId = React.useId();
  useEscHandler(() => cancelButtonRef.current?.click(), modalId);

  const handleFailure = (err: Error | undefined) => {
    setTableRows([]);
    setHasData(false);
    setError(err);
  };

  const fetchAndSetEducationHistories = React.useCallback(async () => {
    setIsFetching(true);
    setError(undefined);
    setTableRows([]);
    setHasData(false);
    try {
      const { data, error } = await client.POST('/api/integraatiot/koski/koulutukset');

      if (error) {
        handleFailure(error);
        return;
      }

      if (data?.id) {
        tehtavaIdRef.current = data.id;
      }

      if (data?.tila !== 'VALMIS') {
        handleFailure(new Error());
        return;
      }

      const koulutuskokonaisuudet = (data?.tulos?.koulutuskokonaisuudet ?? []).map(transformKoulutusKokonaisuusDto);
      setTableRows(getEducationHistoryTableRows(koulutuskokonaisuudet));
      setHasData(true);
    } catch (err) {
      handleFailure(err as Error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  React.useEffect(() => {
    if (rest.open && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      void fetchAndSetEducationHistories();
    }
  }, [rest.open, fetchAndSetEducationHistories]);

  // Clean up an unsaved tehtava on unmount (cancel, error, or navigation).
  React.useEffect(() => {
    return () => {
      const id = tehtavaIdRef.current;
      if (id && !savedRef.current) {
        void client.DELETE('/api/integraatiot/koski/koulutukset/{tehtavaId}', {
          params: { path: { tehtavaId: id } },
        });
      }
    };
  }, []);

  const saveSelectedKoulutus = async (skipOsaamistenTunnistus = false) => {
    if (isSaving) {
      return;
    }
    const tehtavaId = tehtavaIdRef.current;
    if (!tehtavaId) {
      return;
    }
    // Suppress the unmount cleanup DELETE for this tehtava now that we're
    // committing to save it; even if the save fails, the backend can clean
    // up an orphaned task via its own TTL.
    savedRef.current = true;
    setIsSaving(true);
    try {
      const { error: saveError } = await client.POST('/api/integraatiot/koski/koulutukset/{tehtavaId}', {
        params: { path: { tehtavaId } },
        body: {
          koulutuskokonaisuudet: buildSelections(tableRows),
          skipOsaamistenTunnistus,
        },
      });
      if (saveError) {
        throw new Error('save failed');
      }
      closeAllModals();
      onSuccessful();
    } catch (_) {
      closeAllModals();
      addTemporaryNote(() => ({
        title: t('education-history-import.summary-modal.error-title'),
        description: t('education-history-import.result-modal.failure'),
        variant: 'warning',
        isCollapsed: false,
      }));
    }
    setIsSaving(false);
  };

  React.useEffect(() => {
    if (error) {
      const { errorCode } = error as unknown as ErrorResponse;

      const getErrorMessage = () => {
        if (errorCode === 'DATA_NOT_FOUND') {
          return t('education-history-import.summary-modal.data-load-no-data');
        }
        if (errorCode === 'WRONG_PERSON') {
          return t('education-history-import.summary-modal.wrong-person');
        }
        return t('education-history-import.summary-modal.data-load-failed');
      };

      const getReadMoreComponent = () => {
        if (errorCode === 'WRONG_PERSON') {
          return (
            <Button
              variant="white"
              size="sm"
              label={t('common:logout')}
              onClick={() => {
                logout();
              }}
            />
          );
        } else if (errorCode !== 'DATA_NOT_FOUND') {
          return (
            <Button
              variant="white"
              size="sm"
              label={t('try-again')}
              onClick={() => {
                openImportStartModal();
              }}
            />
          );
        }

        return null;
      };

      closeActiveModal();
      addTemporaryNote(() => ({
        title: t('education-history-import.summary-modal.error-title'),
        description: getErrorMessage(),
        variant: 'warning',
        isCollapsed: false,
        readMoreComponent: getReadMoreComponent(),
      }));
    }
  }, [error, closeActiveModal, addTemporaryNote, t, openImportStartModal, logout]);

  if (!rest.open) {
    return null;
  }

  return (
    <Modal
      name={t('education-history-import.summary-modal.title')}
      {...rest}
      fullWidthContent
      topSlot={
        <ModalHeader text={t('education-history-import.summary-modal.title')} testId="education-summary-title" />
      }
      content={
        <div id={modalId} className="flex flex-col sm:h-[890px]">
          <div>
            <div className="box-content max-w-modal-content px-5 md:px-9">
              <p className="mb-5 font-arial text-body-md-mobile sm:mb-8 sm:text-body-md">
                {t('education-history-import.summary-modal.description')}
              </p>
              {isFetching && (
                <div className="flex w-fit items-center rounded bg-bg-gray-2 p-4">
                  <span>
                    <Spinner className="mr-5" size={24} color="black" />
                  </span>
                  <span className="font-arial text-body-sm text-primary-gray">
                    {t('education-history-import.summary-modal.data-loading')}
                  </span>
                </div>
              )}
            </div>
            {!isFetching && !error && (
              <div className="box-content max-w-modal-content px-5 md:px-9">
                <DataImportTable
                  rows={tableRows}
                  toggleAllSelectionText={t('education-history.education-provider-or-education')}
                />
              </div>
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex flex-1 flex-row justify-end">
          <div id="buttonSection" className="flex flex-row justify-between gap-5">
            <Button
              className="whitespace-nowrap"
              ref={cancelButtonRef}
              size={sm ? 'lg' : 'sm'}
              variant="white"
              label={t('common:cancel')}
              onClick={() => {
                if (error) {
                  closeActiveModal();
                } else {
                  showDialog({
                    title: t('education-history-import.summary-modal.cancel-modal.title'),
                    description: t('education-history-import.summary-modal.cancel-modal.description'),
                    onConfirm: closeActiveModal,
                    testId: 'cancel-import-koulutus-summary-dialog',
                  });
                }
              }}
              testId="cancel-button"
            />

            <Button
              label={t('save')}
              variant="accent"
              disabled={!hasData || isSaving}
              size={sm ? 'lg' : 'sm'}
              onClick={() => {
                showDialog({
                  title: (
                    <span className="inline-flex gap-2">
                      <Trans
                        i18nKey="education-history-import.result-modal.title"
                        components={{
                          AiIcon: <AiInfo type="education-import" />,
                        }}
                      />
                    </span>
                  ),
                  description: <Trans i18nKey="education-history-import.result-modal.success-osaamiset-info" />,
                  confirmText: t('education-history-import.result-modal.identify'),
                  cancelText: t('education-history-import.result-modal.no-identify'),
                  variant: 'normal',
                  onConfirm: () => {
                    void saveSelectedKoulutus(false);
                  },
                  onCancel: () => {
                    void saveSelectedKoulutus(true);
                  },
                  testId: 'save-import-koulutus-summary-dialog',
                });
              }}
              className="whitespace-nowrap"
              testId="save-button"
            />
          </div>
        </div>
      }
      testId="import-koulutus-summary-modal"
    />
  );
};

export default ImportKoulutusSummaryModal;
