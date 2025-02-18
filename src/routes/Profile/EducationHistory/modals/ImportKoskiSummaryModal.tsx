import { client } from '@/api/client';
import { components } from '@/api/schema';
import { ExperienceTable } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { getEducationHistoryTableRows, Koulutus } from '@/routes/Profile/EducationHistory/utils.ts';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImportKoskiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const ImportKoskiSummaryModal = ({ isOpen, onClose }: ImportKoskiSummaryModalProps) => {
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [koskiData, setKoskiData] = React.useState<components['schemas']['KoulutusDto'][] | undefined>(undefined);

  const modalId = React.useId();
  useEscHandler(onClose, modalId);

  React.useEffect(() => {
    setIsFetching(true);
    const exampleKoskiData = [
      {
        id: '1',
        nimi: { fi: 'Esimerkki Koulutus', sv: '', en: '' },
        kuvaus: { fi: 'Esimerkki Koulutuksen Kuvaus', sv: '', en: '' },
        alkuPvm: '2020-01-01',
        loppuPvm: '2021-01-01',
        osaamiset: [],
      },
    ];
    setKoskiData(exampleKoskiData);
    setIsFetching(false);
  }, [isOpen]);

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

  const saveSelectedKoulutus = async () => {
    const koulutusKokonaisuudet = new Map<string, Koulutus[]>();
    koskiData?.forEach((k) => {
      const key = JSON.stringify(k.nimi);
      const koulutus = {
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
    try {
      await Promise.all(
        entries
          .map((entry) => ({ nimi: entry[0], koulutukset: entry[1] }))
          .map((o) =>
            client.POST('/api/profiili/koulutuskokonaisuudet', {
              body: {
                nimi: JSON.parse(o.nimi) as Record<string, string>,
                koulutukset: o.koulutukset.map((koulutus) => ({
                  nimi: koulutus.nimi,
                  alkuPvm: koulutus.alkuPvm,
                  loppuPvm: koulutus.loppuPvm,
                  osaamiset: koulutus.osaamiset,
                })),
              },
            }),
          ),
      );

      onClose();
    } catch (error) {
      console.error(error);
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
            {isFetching && (
              <p className="flex items-center">
                {/*<Spinner size={24} color="accent" />*/}
                {t('education-history-import.summary-modal.data-loading')}
              </p>
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
