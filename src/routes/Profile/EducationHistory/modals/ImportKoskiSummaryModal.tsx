import { client } from '@/api/client';
import { components } from '@/api/schema';
import { ExperienceTable } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { getEducationHistoryTableRows, Koulutus } from '@/routes/Profile/EducationHistory/utils.ts';
import { Button, Modal, Spinner } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoskiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessful: () => void;
  onFailure: () => void;
}

const ImportKoskiSummaryModal = ({ isOpen, onClose, onSuccessful, onFailure }: ImportKoskiSummaryModalProps) => {
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [koskiData, setKoskiData] = React.useState<components['schemas']['KoulutusDto'][] | undefined>(undefined);
  const [error, setError] = React.useState<Error | undefined>(undefined);

  const modalId = React.useId();
  useEscHandler(onClose, modalId);

  React.useEffect(() => {
    if (isOpen) {
      fetchAndSetEducationHistories();
    }
  }, [isOpen]);

  const fetchAndSetEducationHistories = async () => {
    setIsFetching(true);
    setKoskiData(undefined);
    const { data, error } = await client.GET('/api/integraatiot/koski/koulutukset', {});

    if (error) {
      setKoskiData(undefined);
      setIsFetching(false);
      setError(error);
      return;
    }

    const d = data.map((k) => ({ id: `koski-${crypto.randomUUID()}`, ...k }));
    setKoskiData(d);
    setIsFetching(false);
  };

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
      };
      if (koulutusKokonaisuudet.has(key)) {
        koulutusKokonaisuudet.get(key)?.push(koulutus);
      } else {
        koulutusKokonaisuudet.set(key, [koulutus]);
      }
    });
    const entries = Array.from(koulutusKokonaisuudet);
    const koulutuskokonaisuudet = entries
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

  const createKoulutusKokonaisuudet = (koskiData: components['schemas']['KoulutusDto'][] | undefined) => {
    const koulutusKokonaisuudet = new Map<string, Koulutus[]>();

    koskiData?.forEach((data) => {
      const key = JSON.stringify(data.nimi);
      const koulutus = createKoulutus(data);

      if (!koulutusKokonaisuudet.has(key)) {
        koulutusKokonaisuudet.set(key, []);
      }

      koulutusKokonaisuudet.get(key)?.push(koulutus);
    });

    return koulutusKokonaisuudet;
  };

  const saveSelectedKoulutus = async () => {
    const koulutusKokonaisuudet = createKoulutusKokonaisuudet(koskiData);

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

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      content={
        <div id={modalId} className="flex flex-col items-center">
          <div className="text-left">
            <h3 className="mb-5 text-heading-2">{t('education-history-import.summary-modal.title')}</h3>
            <p className="mb-4">{t('education-history-import.summary-modal.description')}</p>
            {!isFetching && error && (
              <p className="text-alert-text">{t('education-history-import.summary-modal.data-load-failed')}</p>
            )}
            {isFetching && (
              <div className="flex">
                <Spinner className="mr-5 mb-5" size={24} color={'accent'} />
                {t('education-history-import.summary-modal.data-loading')}
              </div>
            )}
            {!isFetching && (
              <ExperienceTable
                mainColumnHeader={t('education-history.education-provider-or-education')}
                rows={convertKoskiDataToExperienceTableRows(koskiData)}
                hideOsaamiset
              />
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div />
          <div className="flex flex-row justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={onClose} />
            <Button label={t('save')} variant="white" disabled={!koskiData} onClick={saveSelectedKoulutus} />
          </div>
        </div>
      }
    />
  );
};

export default ImportKoskiSummaryModal;
