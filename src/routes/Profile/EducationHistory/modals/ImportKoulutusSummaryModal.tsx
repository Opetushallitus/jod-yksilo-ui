import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Modal, Spinner, useMediaQueries, useNoteStack, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight } from '@jod/design-system/icons';

import { client } from '@/api/client';
import { ErrorResponse } from '@/api/errorResponse';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { type ExperienceTableRowData } from '@/components';
import { CompetenceSection, getSelectedRows } from '@/components/CompetenceSection/CompetenceSection';
import { DataImportTable } from '@/components/DataImportTable/DataImportTable';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import {
  buildSelections,
  getEducationHistoryTableRows,
  type Koulutuskokonaisuus,
} from '@/routes/Profile/EducationHistory/utils';

// Skill extraction usually takes seconds to a few minutes; a user who waits longer can resume the import later.
const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 200;
const MAX_POLL_FAILURES_IN_A_ROW = 3;

type KoskiTehtava = components['schemas']['KoskiTehtavaDto'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Polls a task until skill extraction finishes or polling gives up, riding out a few failed polls;
 * undefined if polling keeps failing or `isActive` turns false.
 */
const waitForExtraction = async (tehtava: KoskiTehtava, isActive: () => boolean): Promise<KoskiTehtava | undefined> => {
  let current = tehtava;
  let failures = 0;
  for (let attempt = 0; current.tila === 'ODOTTAA' && attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    if (!isActive() || !current.id) {
      return undefined;
    }
    const { data } = await client
      .GET('/api/integraatiot/koski/koulutukset/{tehtavaId}', { params: { path: { tehtavaId: current.id } } })
      .catch(() => ({ data: undefined }));
    if (!isActive()) {
      return undefined;
    }
    if (!data) {
      if (++failures >= MAX_POLL_FAILURES_IN_A_ROW) {
        return undefined;
      }
      continue;
    }
    failures = 0;
    current = data;
  }
  return current;
};

/** Educations with extracted skills have their osaamiset set, possibly empty; others are imported without skills. */
const hasExtractedSkills = (tehtava: KoskiTehtava) =>
  (tehtava.tulos?.koulutuskokonaisuudet ?? []).some((k) => (k.koulutukset ?? []).some((c) => c.osaamiset != null));

interface ImportKoulutusSummaryModalProps extends ModalComponentProps {
  /** An unfinished import task to resume instead of fetching from Koski. */
  tehtavaId?: string;
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
  })),
});

/** Names and descriptions of the osaamiset the educations refer to, keyed by URI. */
const loadOsaamisetMap = async (kokonaisuudet: Koulutuskokonaisuus[]) => {
  const uris = [...new Set(kokonaisuudet.flatMap((k) => k.koulutukset.flatMap((koulutus) => koulutus.osaamiset)))];
  if (uris.length === 0) {
    return undefined;
  }
  const combined = await osaamiset.combine(
    uris,
    (uri) => uri,
    (_, o) => ({ id: o.uri, nimi: o.nimi, kuvaus: o.kuvaus }),
  );
  return Object.fromEntries(combined.map((o) => [o.id, o]));
};

const hasSelectedRows = (rows: ExperienceTableRowData[]) =>
  rows.some((row) => (row.subrows ?? []).some((s) => s.checked ?? false));

const ImportKoulutusSummaryModal = ({
  tehtavaId: resumedTehtavaId,
  onSuccessful,
  openImportStartModal,
  logout,
  onClose: _onClose,
  ...rest
}: ImportKoulutusSummaryModalProps) => {
  const { t } = useTranslation();
  const { showDialog, closeActiveModal, closeAllModals } = useModal();
  const { addTemporaryNote } = useNoteStack();
  const { sm } = useMediaQueries();
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  // The Koski data has arrived and the skills are being identified.
  const [isIdentifying, setIsIdentifying] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [tableRows, setTableRows] = React.useState<ExperienceTableRowData[]>([]);
  const [hasData, setHasData] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null);
  const hasFetchedRef = React.useRef<boolean>(false);
  const tehtavaIdRef = React.useRef<string | undefined>(resumedTehtavaId);
  const unmountedRef = React.useRef<boolean>(false);
  // Set once the modal is cancelled or closed; it stays mounted a moment longer while it fades out.
  const closedRef = React.useRef<boolean>(false);
  const isActive = React.useCallback(() => !unmountedRef.current && !closedRef.current, []);
  const savingRef = React.useRef<boolean>(false);
  // Only extracted skills are saved; when extraction failed, the educations are saved without skills.
  const [skillsExtracted, setSkillsExtracted] = React.useState<boolean>(false);
  const [step, setStep] = React.useState<number>(1);
  const isCompetenceStep = step === 2;
  const progressText = isIdentifying
    ? t('education-history-import.summary-modal.identifying')
    : t('education-history-import.summary-modal.data-loading');
  const refreshRows = React.useCallback(() => setTableRows((rows) => [...rows]), []);

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
      const { data, error } = resumedTehtavaId
        ? await client.GET('/api/integraatiot/koski/koulutukset/{tehtavaId}', {
            params: { path: { tehtavaId: resumedTehtavaId } },
          })
        : await client.POST('/api/integraatiot/koski/koulutukset');

      if (error) {
        handleFailure(error);
        return;
      }

      if (data?.id) {
        tehtavaIdRef.current = data.id;
      }

      let tehtava: KoskiTehtava | undefined = data;
      if (tehtava?.tila === 'ODOTTAA') {
        setIsIdentifying(true);
        tehtava = await waitForExtraction(tehtava, isActive);
        if (!isActive()) {
          return;
        }
      }

      if (tehtava?.tila === 'ODOTTAA') {
        closeActiveModal();
        addTemporaryNote(() => ({
          title: t('education-history-import.still-processing.title'),
          description: t('education-history-import.still-processing.description'),
          variant: 'feedback',
          isCollapsed: false,
        }));
        return;
      }
      if (tehtava?.tila !== 'VALMIS') {
        handleFailure(new Error());
        return;
      }
      const extracted = hasExtractedSkills(tehtava);
      setSkillsExtracted(extracted);

      const koulutuskokonaisuudet = (tehtava.tulos?.koulutuskokonaisuudet ?? []).map(transformKoulutusKokonaisuusDto);
      let osaamisetMap: Awaited<ReturnType<typeof loadOsaamisetMap>>;
      if (extracted) {
        try {
          osaamisetMap = await loadOsaamisetMap(koulutuskokonaisuudet);
        } catch (err) {
          console.error('Failed to load osaamiset for Koski import', err);
          addTemporaryNote(() => ({
            title: t('education-history-import.competences-failed.title'),
            description: t('education-history-import.competences-failed.description'),
            variant: 'warning',
            isCollapsed: false,
          }));
        }
        if (!isActive()) {
          return;
        }
      }
      setTableRows(getEducationHistoryTableRows(koulutuskokonaisuudet, osaamisetMap));
      setHasData(true);
    } catch (err) {
      handleFailure(err as Error);
    } finally {
      setIsFetching(false);
      setIsIdentifying(false);
    }
  }, [addTemporaryNote, closeActiveModal, isActive, resumedTehtavaId, t]);

  React.useEffect(() => {
    if (!rest.open && hasFetchedRef.current) {
      closedRef.current = true;
    }
    if (rest.open && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      void fetchAndSetEducationHistories();
    }
  }, [rest.open, fetchAndSetEducationHistories]);

  React.useEffect(() => {
    // StrictMode remounts the component, so the flag must be reset on mount.
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  // Only an explicit cancel discards the task: a user who leaves otherwise can resume it.
  const cancelImport = () => {
    closedRef.current = true;
    const id = tehtavaIdRef.current;
    if (id) {
      void client.DELETE('/api/integraatiot/koski/koulutukset/{tehtavaId}', {
        params: { path: { tehtavaId: id } },
      });
    }
    closeActiveModal();
  };

  const saveSelectedKoulutus = async () => {
    const tehtavaId = tehtavaIdRef.current;
    if (savingRef.current || !tehtavaId) {
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      const { error: saveError } = await client.POST('/api/integraatiot/koski/koulutukset/{tehtavaId}', {
        params: { path: { tehtavaId } },
        body: {
          koulutuskokonaisuudet: buildSelections(tableRows, skillsExtracted),
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
    savingRef.current = false;
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
        if (errorCode === 'PERMISSION_REQUIRED') {
          return t('education-history-import.summary-modal.permission-missing');
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
        <ModalHeader
          text={
            isCompetenceStep
              ? t('education-history-import.competence-selection.title')
              : t('education-history-import.summary-modal.select-title')
          }
          step={step}
          testId="education-summary-title"
        />
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={2}
          currentStep={step}
        />
      }
      content={
        <div id={modalId} className="flex flex-col sm:h-[890px]">
          {isCompetenceStep ? (
            <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
              <p>{t('education-history-import.competence-selection.description')}</p>
              <CompetenceSection
                titleText={t('education-history-import.summary-modal.education-title')}
                headerText={t('education-history.education-provider-or-education')}
                rows={getSelectedRows(tableRows)}
                onCompetenceChange={refreshRows}
                failingDetection={t('education-history-import.competence-selection.no-competences')}
              />
            </div>
          ) : (
            <div className="box-content flex max-w-modal-content flex-col gap-7 px-5 font-arial md:max-w-none md:px-9">
              <p>{t('education-history-import.summary-modal.description')}</p>
              <output aria-live="polite" className="sr-only">
                {isFetching ? progressText : t('education-history-import.summary-modal.data-loaded')}
              </output>
              {isFetching && (
                <div>
                  <div className="mb-5 flex flex-row gap-5">
                    <h2 className="text-heading-2-mobile sm:text-heading-2">
                      {t('education-history-import.summary-modal.importing')}
                    </h2>
                    <Spinner size={24} color="accent" />
                  </div>
                  <ul className="ml-6 list-disc">
                    <li>{t('education-history-import.summary-modal.data-loading')}</li>
                    {isIdentifying && <li>{t('education-history-import.summary-modal.identifying')}</li>}
                  </ul>
                </div>
              )}
              {!isFetching && !error && (
                <div>
                  <h2 className="mb-6 text-heading-2-mobile sm:text-heading-2">
                    {t('education-history-import.summary-modal.education-title')}
                  </h2>
                  <DataImportTable
                    rows={tableRows}
                    toggleAllSelectionText={t('education-history.education-provider-or-education')}
                    showDescription={false}
                    onSelectionChange={refreshRows}
                    selectCompetencesWithRow={false}
                    alternatingBg={false}
                  />
                </div>
              )}
            </div>
          )}
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
                    onConfirm: cancelImport,
                    testId: 'cancel-import-koulutus-summary-dialog',
                  });
                }
              }}
              testId="cancel-button"
            />

            {!isCompetenceStep && (
              <Button
                label={t('next')}
                variant="accent"
                icon={sm ? undefined : <JodArrowRight />}
                disabled={!hasData || !hasSelectedRows(tableRows)}
                size={sm ? 'lg' : 'sm'}
                onClick={() => setStep(2)}
                className="whitespace-nowrap"
                testId="next-button"
              />
            )}
            {isCompetenceStep && (
              <Button
                label={t('previous')}
                variant="white"
                icon={sm ? undefined : <JodArrowLeft />}
                disabled={isSaving}
                size={sm ? 'lg' : 'sm'}
                onClick={() => setStep(1)}
                className="whitespace-nowrap"
                testId="previous-button"
              />
            )}
            {isCompetenceStep && (
              <Button
                label={t('save')}
                variant="accent"
                disabled={!hasData || isSaving || !hasSelectedRows(tableRows)}
                size={sm ? 'lg' : 'sm'}
                onClick={() => void saveSelectedKoulutus()}
                className="whitespace-nowrap"
                testId="save-button"
              />
            )}
          </div>
        </div>
      }
      testId="import-koulutus-summary-modal"
    />
  );
};

export default ImportKoulutusSummaryModal;
