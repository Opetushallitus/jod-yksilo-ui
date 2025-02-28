import { client } from '@/api/client';
import { ErrorResponse } from '@/api/errorResponse';
import { components } from '@/api/schema';
import { ExperienceTable, ExperienceTableRowData } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { getEducationHistoryTableRows, Koulutus } from '@/routes/Profile/EducationHistory/utils.ts';
import { Button, ConfirmDialog, Modal, Spinner } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoulutusSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  onFailure: () => void;
}

const ImportKoulutusSummaryModal = ({ isOpen, onClose, onSuccessful, onFailure }: ImportKoulutusSummaryModalProps) => {
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [koskiData, setKoskiData] = React.useState<components['schemas']['KoulutusDto'][] | undefined>(undefined);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [tableRows, setTableRows] = React.useState<ExperienceTableRowData[]>([]);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

  const modalId = React.useId();
  useEscHandler(() => cancelButtonRef.current?.click(), modalId);

  React.useEffect(() => {
    if (isOpen) {
      fetchAndSetEducationHistories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      const { data, error } = await client.GET('/api/integraatiot/koski/koulutukset', {});

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

  const convertKoskiDataToExperienceTableRows = (koskiData: components['schemas']['KoulutusDto'][] | undefined) => {
    const koulutusKokonaisuudet = new Map<string, Koulutus[]>();
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
      if (koulutusKokonaisuudet.has(key)) {
        koulutusKokonaisuudet.get(key)?.push(koulutus);
      } else {
        koulutusKokonaisuudet.set(key, [koulutus]);
      }
    });
    const koulutuskokonaisuudet = Array.from(koulutusKokonaisuudet)
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
  });

  const isChecked = (
    key: string,
    data: {
      id?: string;
      nimi: components['schemas']['LokalisoituTeksti'];
      kuvaus?: components['schemas']['LokalisoituTeksti'];
      alkuPvm: string;
      loppuPvm?: string;
      osaamiset?: string[];
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

  const createKoulutusKokonaisuudet = () => {
    const koulutusKokonaisuudet = new Map<string, Koulutus[]>();

    koskiData?.forEach((data) => {
      const key = JSON.stringify(data.nimi);
      if (!isChecked(key, data)) {
        return;
      }

      const koulutus = createKoulutus(data);

      if (!koulutusKokonaisuudet.has(key)) {
        koulutusKokonaisuudet.set(key, []);
      }

      koulutusKokonaisuudet.get(key)?.push(koulutus);
    });

    return koulutusKokonaisuudet;
  };

  const saveSelectedKoulutus = async () => {
    const koulutusKokonaisuudet = createKoulutusKokonaisuudet();
    if (koulutusKokonaisuudet.size === 0) {
      onSuccessful();
    }
    try {
      const requests = [];
      for (const [jsonNimi, koulutukset] of koulutusKokonaisuudet) {
        requests.push(
          client.POST('/api/profiili/koulutuskokonaisuudet', {
            body: {
              nimi: JSON.parse(jsonNimi) as Record<string, string>,
              koulutukset,
            },
          }),
        );
      }

      await Promise.all(requests);
      onSuccessful();
    } catch (_) {
      onFailure();
    }
  };

  if (!isOpen) {
    return null;
  }

  const renderErrorMessage = () => {
    return (
      <>
        {(() => {
          const errorResponse = error as unknown as ErrorResponse;
          if (errorResponse) {
            if (errorResponse.errorCode === 'DATA_NOT_FOUND') {
              return <p>{t('education-history-import.summary-modal.data-load-no-data')}</p>;
            }
            if (errorResponse.errorCode === 'WRONG_PERSON') {
              return <p>{t('education-history-import.summary-modal.wrong-person')}</p>;
            }
            return <p>{t('education-history-import.summary-modal.data-load-failed')}</p>;
          }
        })()}
      </>
    );
  };

  return (
    <Modal
      open={isOpen}
      content={
        <div id={modalId} className="flex flex-col">
          <div className="text-left">
            <h3 className="mb-5 text-heading-2">{t('education-history-import.summary-modal.title')}</h3>
            <p className="mb-4">{t('education-history-import.summary-modal.description')}</p>
            {isFetching && (
              <div className="flex">
                <Spinner className="mr-5 mb-5" size={24} color={'accent'} />
                {t('education-history-import.summary-modal.data-loading')}
              </div>
            )}
            {!isFetching && error && <div className="text-alert-text">{renderErrorMessage()}</div>}
            {!isFetching && (
              <ExperienceTable
                mainColumnHeader={t('education-history.education-provider-or-education')}
                rows={tableRows}
                hideOsaamiset
                showCheckbox={true}
                checkboxColumnHeader={t('education-history-import.summary-modal.table-header-checkbox')}
              />
            )}
          </div>
          {!isFetching && !error && (
            <div className="sticky p-4 bottom-0 bg-bg-gray w-full text-todo">
              Tähän kuvaus, että osaamisia lisätty opintoihin. TODO: OPHJOD-1306
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex flex-row justify-end">
          <div id="buttonSection" className="flex flex-row justify-between gap-5">
            <ConfirmDialog
              title={t('education-history-import.summary-modal.cancel-modal.title')}
              onConfirm={onClose}
              confirmText={t('yes')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('education-history-import.summary-modal.cancel-modal.description')}
            >
              {(showDialog: () => void) => (
                <Button
                  ref={cancelButtonRef}
                  variant="white"
                  label={t('cancel')}
                  onClick={error ? onClose : showDialog}
                />
              )}
            </ConfirmDialog>
            <Button label={t('save')} variant="white" disabled={!koskiData} onClick={saveSelectedKoulutus} />
          </div>
        </div>
      }
    />
  );
};

export default ImportKoulutusSummaryModal;
