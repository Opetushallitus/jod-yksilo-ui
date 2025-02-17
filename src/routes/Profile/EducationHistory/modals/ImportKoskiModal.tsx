import { client } from '@/api/client';
import { components } from '@/api/schema';
import { ExperienceTable, ExperienceTableRowData } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { Button, InputField, Modal, Spinner, WizardProgress } from '@jod/design-system';
import { t } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete } from 'react-icons/md';
import { Link, useLocation } from 'react-router';
import { getEducationHistoryTableRows, Koulutus } from '../utils';

interface ImportKoskiModalProps {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<void>>;
  setKoskiModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Util functions
const isValidUrl = (url?: string): boolean => {
  try {
    if (!url) {
      return false;
    }
    // Parse the URL
    const parsedUrl = new URL(url);

    // Check if the protocol is HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Regular expression to validate the domain
    const domainRegex = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

    // Extract the hostname and validate it
    const hostname = parsedUrl.hostname;
    return !!domainRegex.test(hostname) && (hostname === 'testiopintopolku.fi' || hostname === 'opintopolku.fi');
  } catch (_) {
    // If URL parsing fails, it's not a valid URL
    return false;
  }
};

// Main step with inputfield
const MainStep = ({
  jakolinkki,
  setJakolinkki,
}: {
  jakolinkki?: string;
  setJakolinkki: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('education-import.share-link')}</h2>
      <div className="mb-6">
        <InputField
          label={t('education-import.share-link')}
          onChange={(event) => {
            setJakolinkki(event.target.value);
          }}
          help={!isValidUrl(jakolinkki) ? t('education-import.invalid-share-link') : ''}
          value={jakolinkki}
        />
      </div>
    </>
  );
};

// Second step to select koski data to be saved into the profile
const KoskiDataStep = ({
  rows,
  isLoading,
  error,
  reload,
  onRowClick,
}: {
  rows?: ExperienceTableRowData[];
  isLoading: boolean;
  error?: Error;
  reload: () => void;
  onRowClick: (row: ExperienceTableRowData) => void;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('education-import.data-header')}</h2>
      <p className="mb-4 text-body-sm text-black sm:mb-5 sm:text-body-sm">{t('education-import.data-info')}</p>
      {isLoading && (
        <div className="flex">
          <Spinner className="mr-5 mb-5" size={24} color={'accent'} />
          {t('education-import.data-loading')}
        </div>
      )}
      {error && (
        <div className="flex">
          <p className="content-center mr-5"> {t('education-import.data-load-failed')}</p>
          <Button variant="accent" label={t('education-import.data-load-retry')} onClick={reload} />
        </div>
      )}
      {rows && (
        <ExperienceTable
          mainColumnHeader={t('education-import.education-or-degree')}
          rows={rows}
          hideOsaamiset
          rowActionElement={<MdDelete size={24} className="fill-[#006DB3]" />}
          onRowClick={onRowClick}
          onNestedRowClick={onRowClick}
          useConfirm
          confirmTitle={t('education-import.confirm-delete-title')}
          confirmRowDescription={t('education-import.confirm-delete-oppilaitos')}
          confirmSubRowDescription={t('education-import.confirm-delete-education')}
          actionLabel={t('delete')}
        />
      )}
    </>
  );
};

const ImportKoskiModal = ({ isOpen, onClose, setKoskiModalOpen }: ImportKoskiModalProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [koskiFetchError, setError] = React.useState<Error | undefined>(undefined);
  const [jakolinkki, setJakolinkki] = React.useState<string | undefined>(undefined);
  const [koskiData, setKoskiData] = React.useState<components['schemas']['KoulutusDto'][] | undefined>(undefined);
  const [step, setStep] = React.useState(0);
  const stepComponents = [MainStep, KoskiDataStep];
  const StepComponent = stepComponents[step];
  const location = useLocation();

  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('koski') === 'authorized') {
      queryParams.delete('koski');
      fetchKoskiDataWithOAuth2();
      setStep(step < stepComponents.length - 1 ? step + 1 : step);
      setKoskiModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only need to run once after page is loaded.
  const contentId = React.useId();

  const nextStep = () => {
    fetchKoskiDataWithJakolinkki();
    setStep(step < stepComponents.length - 1 ? step + 1 : step);
  };
  const previousStep = () => {
    setStep(step > 0 ? step - 1 : step);
  };
  const isLastStep = step === stepComponents.length - 1;
  const isFirstStep = step === 0;

  const deleteRow = (row: ExperienceTableRowData): void => {
    let newKoskiData = koskiData;
    if (row.subrows) {
      row.subrows.forEach((r) => (newKoskiData = newKoskiData?.filter((d) => d.id !== r.key)));
    } else {
      newKoskiData = newKoskiData?.filter((d) => d.id !== row.key);
    }
    setKoskiData(newKoskiData);
  };

  const fetchKoskiDataWithJakolinkki = async () => {
    fetchKoskiData('/api/integraatiot/koski');
  };

  const fetchKoskiDataWithOAuth2 = async () => {
    fetchKoskiData('/api/integraatiot/koski/koulutukset');
  };

  const fetchKoskiData = async (endpoint: '/api/integraatiot/koski' | '/api/integraatiot/koski/koulutukset') => {
    setIsLoading(true);
    setKoskiData(undefined);
    setError(undefined);
    const { data, error } = await client.GET(endpoint, {
      params: { query: { jakolinkki: jakolinkki ?? '' } },
    });

    if (error) {
      setKoskiData(undefined);
      setIsLoading(false);
      setError(error);
    }

    const d = data.map((k) => ({ id: `koski-${crypto.randomUUID()}`, ...k }));
    setKoskiData(d);
    setIsLoading(false);
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

    close();
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

  const close = () => {
    setKoskiData(undefined);
    setJakolinkki(undefined);
    setStep(0);
    onClose();
  };
  useEscHandler(close, contentId);

  return (
    <Modal
      open={isOpen}
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={stepComponents.length}
          currentStep={step + 1}
        />
      }
      sidePanel={
        <>
          <p className="mb-4 text-black sm:mb-5 sm:text-heading-3">{t('education-import.data-hint')}</p>
          <Link to={'https://www.opintopolku.fi'} target="_blank">
            www.opintopolku.fi
          </Link>
        </>
      }
      content={
        <div id={contentId}>
          <StepComponent
            jakolinkki={jakolinkki}
            setJakolinkki={setJakolinkki}
            rows={convertKoskiDataToExperienceTableRows(koskiData)}
            isLoading={isLoading}
            error={koskiFetchError}
            reload={fetchKoskiDataWithJakolinkki}
            onRowClick={deleteRow}
          />
        </div>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div className="flex flex-start justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={close} />
            {!isFirstStep && <Button label={t('previous')} variant="white" onClick={previousStep} />}
            {!isLastStep && (
              <Button
                label={t('next')}
                variant="white"
                disabled={isLastStep || isLoading || !jakolinkki || !isValidUrl(jakolinkki)}
                onClick={nextStep}
              />
            )}
            {isLastStep && (
              <Button label={t('save')} variant="white" disabled={!koskiData} onClick={saveSelectedKoulutus} />
            )}
          </div>
        </div>
      }
    />
  );
};

export default ImportKoskiModal;
