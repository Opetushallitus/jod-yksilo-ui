import { client } from '@/api/client';
import { ErrorResponse } from '@/api/errorResponse';
import type { components } from '@/api/schema';
import { AiInfo, type ExperienceTableRowData } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import {
  getEducationHistoryTableRows,
  type Koulutus,
  type Koulutuskokonaisuus,
} from '@/routes/Profile/EducationHistory/utils';
import { Button, Modal, Spinner, useMediaQueries, useNoteStack } from '@jod/design-system';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { EducationImportTable } from '../EducationImportTable';

interface ImportKoulutusSummaryModalProps {
  isOpen: boolean;
  onSuccessful: () => void;
  openImportStartModal: () => void;
  logout: () => void;
}

const ImportKoulutusSummaryModal = ({
  isOpen,
  onSuccessful,
  openImportStartModal,
  logout,
}: ImportKoulutusSummaryModalProps) => {
  const { t } = useTranslation();
  const { showDialog, closeActiveModal } = useModal();
  const { addTemporaryNote } = useNoteStack();
  const { sm } = useMediaQueries();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [koskiData, setKoskiData] = React.useState<components['schemas']['KoulutusDto'][] | undefined>(undefined);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [tableRows, setTableRows] = React.useState<ExperienceTableRowData[]>([]);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const hasFetchedRef = React.useRef<boolean>(false);

  const modalId = React.useId();
  useEscHandler(() => cancelButtonRef.current?.click(), modalId);

  const handleGetKoulutusDataFailure = (error: Error | undefined) => {
    setKoskiData(undefined);
    setTableRows([]);
    setError(error);
  };

  const fetchAndSetEducationHistories = React.useCallback(async () => {
    setIsFetching(true);
    setKoskiData(undefined);
    setError(undefined);
    try {
      const { data, error } = await client.GET('/api/integraatiot/koski/koulutukset');

      if (error) {
        handleGetKoulutusDataFailure(error);
        return;
      }

      setKoskiData(Array.isArray(data) ? data.map((k) => ({ id: `koski-${crypto.randomUUID()}`, ...k })) : []);
      setTableRows(convertKoskiDataToExperienceTableRows(data));
    } catch (err) {
      handleGetKoulutusDataFailure(err as Error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAndSetEducationHistories();
    }
  }, [isOpen, fetchAndSetEducationHistories]);

  const convertKoskiDataToExperienceTableRows = (koskiData: components['schemas']['KoulutusDto'][] | undefined) => {
    // Group koulutukset by their nimi to form koulutuskokonaisuudet
    const groupedKoulutukset = new Map<string, Koulutus[]>();

    koskiData?.forEach((k) => {
      const key = JSON.stringify(k.nimi);
      const koulutus = {
        id: k.id,
        nimi: k.kuvaus as Record<string, string>,
        alkuPvm: k.alkuPvm,
        loppuPvm: k.loppuPvm,
        osaamiset: [],
        checked: true,
      };
      if (groupedKoulutukset.has(key)) {
        groupedKoulutukset.get(key)?.push(koulutus);
      } else {
        groupedKoulutukset.set(key, [koulutus]);
      }
    });

    const koulutuskokonaisuudet: Koulutuskokonaisuus[] = Array.from(groupedKoulutukset)
      .map((entry) => ({ key: entry[0], koulutukset: entry[1] }))
      .map((o, i) => ({
        nimi: JSON.parse(o.key),
        id: `${i}`,
        koulutukset: o.koulutukset.map((koulutus) => ({
          id: koulutus.id,
          nimi: koulutus.nimi,
          alkuPvm: koulutus.alkuPvm,
          loppuPvm: koulutus.loppuPvm,
          osaamiset: koulutus.osaamiset,
          checked: true,
        })),
      }));
    return getEducationHistoryTableRows(koulutuskokonaisuudet);
  };

  const createKoulutus = (data: components['schemas']['KoulutusDto']): Koulutus => ({
    nimi: data.kuvaus as Record<string, string>,
    alkuPvm: data.alkuPvm,
    loppuPvm: data.loppuPvm,
    osaamiset: [],
    osasuoritukset: data.osasuoritukset,
  });

  const isChecked = (
    key: string,
    data: {
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
    },
  ) => {
    const matchSchool = tableRows?.find((row) => JSON.stringify(row.nimi) === key);
    if (!matchSchool) {
      return false;
    }
    const matchEducation = matchSchool.subrows?.find((row) => JSON.stringify(row.nimi) === JSON.stringify(data.kuvaus));
    if (!matchEducation) {
      return false;
    }
    return matchEducation.checked;
  };

  const createKoulutusKokonaisuudet = (skipOsaamistenTunnistus = false) => {
    const koulutusKokonaisuudet = new Map<string, Koulutus[]>();

    koskiData?.forEach((data) => {
      const key = JSON.stringify(data.nimi);
      if (!isChecked(key, data)) {
        return;
      }

      if (skipOsaamistenTunnistus) {
        data.osaamisetOdottaaTunnistusta = undefined;
        data.osaamisetTunnistusEpaonnistui = undefined;
      }

      const koulutus = createKoulutus(data);

      if (!koulutusKokonaisuudet.has(key)) {
        koulutusKokonaisuudet.set(key, []);
      }

      koulutusKokonaisuudet.get(key)?.push(koulutus);
    });

    return koulutusKokonaisuudet;
  };

  const saveSelectedKoulutus = async (skipOsaamistenTunnistus = false) => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const koulutusKokonaisuudet = createKoulutusKokonaisuudet(skipOsaamistenTunnistus);
      const body: {
        nimi: Record<string, string>;
        koulutukset: Koulutus[];
      }[] = [];
      for (const [jsonNimi, koulutukset] of koulutusKokonaisuudet) {
        body.push({
          nimi: JSON.parse(jsonNimi) as Record<string, string>,
          koulutukset,
        });
      }

      let apiCall;

      if (skipOsaamistenTunnistus) {
        apiCall = Promise.all(
          body.map((koulutus) =>
            client.POST('/api/profiili/koulutuskokonaisuudet', {
              body: koulutus,
            }),
          ),
        );
      } else {
        apiCall = client.POST('/api/profiili/koulutuskokonaisuudet/tuonti', {
          body,
        });
      }

      await apiCall;
      closeActiveModal();
      onSuccessful();
    } catch (_) {
      closeActiveModal();
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

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      name={t('education-history-import.summary-modal.title')}
      open={isOpen}
      fullWidthContent
      topSlot={
        <ModalHeader text={t('education-history-import.summary-modal.title')} testId="education-summary-title" />
      }
      content={
        <div id={modalId} className="flex flex-col sm:h-[890px]">
          <div>
            <p className="sm:mb-8 mb-5 sm:text-body-md text-body-md-mobile font-arial">
              {t('education-history-import.summary-modal.description')}
            </p>
            {isFetching && (
              <div className="flex bg-bg-gray-2 rounded w-fit items-center p-4">
                <span>
                  <Spinner className="mr-5" size={24} color="black" />
                </span>
                <span className="text-primary-gray font-arial text-body-sm">
                  {t('education-history-import.summary-modal.data-loading')}
                </span>
              </div>
            )}
            {!isFetching && !error && <EducationImportTable rows={tableRows} />}
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row justify-end flex-1">
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
                  });
                }
              }}
            />

            <Button
              label={t('save')}
              variant="accent"
              disabled={!koskiData}
              size={sm ? 'lg' : 'sm'}
              onClick={() => {
                closeActiveModal();
                showDialog({
                  title: (
                    <span className="inline-flex gap-2">
                      <Trans
                        i18nKey="education-history-import.result-modal.title"
                        components={{
                          AiIcon: <AiInfo />,
                        }}
                      />
                    </span>
                  ),
                  description: <Trans i18nKey="education-history-import.result-modal.success-osaamiset-info" />,
                  confirmText: t('education-history-import.result-modal.identify'),
                  cancelText: t('education-history-import.result-modal.no-identify'),
                  variant: 'normal',
                  onConfirm: () => {
                    saveSelectedKoulutus(false);
                  },
                  onCancel: () => {
                    saveSelectedKoulutus(true);
                  },
                });
              }}
              className="whitespace-nowrap"
            />
          </div>
        </div>
      }
    />
  );
};

export default ImportKoulutusSummaryModal;
