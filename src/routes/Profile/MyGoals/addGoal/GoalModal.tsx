import { client } from '@/api/client.ts';
import type { components } from '@/api/schema';
import { ActionButton, OpportunityCard } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import { usePaginationTranslations } from '@/hooks/usePaginationTranslations';
import type { TypedMahdollisuus } from '@/routes/types';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { type Tavoite, useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText, stringToLocalizedText } from '@/utils';
import {
  Button,
  InputField,
  Modal,
  type PageChangeDetails,
  Pagination,
  Textarea,
  tidyClasses,
  useMediaQueries,
  WizardProgress,
} from '@jod/design-system';
import { JodFlag, JodFlagFilled } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

interface AddGoalModalProps {
  mode: 'ADD';
  isOpen: boolean;
  tavoite: never;
}

interface UpdateGoalModalProps {
  mode: 'UPDATE';
  isOpen: boolean;
  tavoite: Tavoite;
}

type GoalModalProps = AddGoalModalProps | UpdateGoalModalProps;

export const GoalModal = ({ mode = 'ADD', isOpen, tavoite }: GoalModalProps) => {
  const { t } = useTranslation();
  const isUpdateMode = mode === 'UPDATE';
  const initialGoalName = getLocalizedText(tavoite?.tavoite);
  const initialGoalDescription = getLocalizedText(tavoite?.kuvaus);
  const initialSelectedMahdollisuusId = tavoite?.mahdollisuusId ?? null;

  const { sm, lg } = useMediaQueries();
  const { closeActiveModal } = useModal();

  // Stores and state from zustand
  const {
    ammattiryhmaNimet,
    fetchPage,
    fetchSuosikit,
    fetchedSuosikit,
    pageNr,
    pageSize,
    totalItems: totalFavorites,
  } = useSuosikitStore(
    useShallow((state) => ({
      ammattiryhmaNimet: state.ammattiryhmaNimet,
      fetchPage: state.fetchPage,
      fetchSuosikit: state.fetchSuosikit,
      fetchedSuosikit: state.pageData,
      pageNr: state.pageNr,
      pageSize: state.pageSize,
      totalItems: state.totalItems,
    })),
  );

  const { tavoitteet, upsertTavoite, refreshTavoitteet } = useTavoitteetStore(
    useShallow((state) => ({
      tavoitteet: state.tavoitteet,
      upsertTavoite: state.upsertTavoite,
      refreshTavoitteet: state.refreshTavoitteet,
    })),
  );

  // REACT STATE ---------------------------------------------------------
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [goalName, setGoalName] = React.useState(initialGoalName);
  const [goalDescription, setGoalDescription] = React.useState(initialGoalDescription);
  const [goalOptions, setGoalOptions] = React.useState<TypedMahdollisuus[]>([]);
  const [selectedMahdollisuus, setSelectedMahdollisuus] = React.useState<TypedMahdollisuus | null>(null);

  const [step, setStep] = React.useState(0);
  const steps = 1;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // FILTER FAVORITE WORK OPPORTUNITIES -----------------------------------
  const favoriteTyomahdollisuudet = React.useMemo(
    () => fetchedSuosikit.filter((m) => m.mahdollisuusTyyppi === 'TYOMAHDOLLISUUS'),
    [fetchedSuosikit],
  );

  // Update goalOptions and set selected possibility according to mode & tavoite
  React.useEffect(() => {
    const options = favoriteTyomahdollisuudet.filter(
      (item) => !tavoitteet.some((pm) => pm.mahdollisuusId === item.id) || item.id == initialSelectedMahdollisuusId,
    );
    setGoalOptions(options);

    if (isUpdateMode && initialSelectedMahdollisuusId) {
      const selected = options.find((o) => o.id === initialSelectedMahdollisuusId);
      if (selected) {
        setSelectedMahdollisuus(selected);
      }
    } else {
      setSelectedMahdollisuus(null);
    }
  }, [favoriteTyomahdollisuudet, tavoitteet, initialSelectedMahdollisuusId, isUpdateMode]);

  // INITIAL FETCH --------------------------------------------------------
  React.useEffect(() => {
    const fetchData = async () => {
      await fetchSuosikit();
      await fetchPage({ page: 1, pageSize });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tavoitteet]);

  // HANDLERS -------------------------------------------------------------
  const onPageChange = async (data: PageChangeDetails) => {
    await fetchPage(data);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Separate insert handlers for add and update ------------------------
  const addTavoite = async () => {
    if (!selectedMahdollisuus) {
      return;
    }
    setIsSubmitting(true);
    const newTavoite: components['schemas']['TavoiteDto'] = {
      mahdollisuusId: selectedMahdollisuus.id,
      mahdollisuusTyyppi: selectedMahdollisuus.mahdollisuusTyyppi,
      tavoite: stringToLocalizedText(goalName),
      kuvaus: stringToLocalizedText(goalDescription),
    };

    const response = await client.POST('/api/profiili/tavoitteet', { body: newTavoite });
    closeActiveModal();
    await upsertTavoite({ ...newTavoite, id: response.data });
    await refreshTavoitteet();
    setIsSubmitting(false);
  };

  const updateTavoite = async () => {
    if (!selectedMahdollisuus || !tavoite.id) {
      return;
    }
    setIsSubmitting(true);
    const newTavoite: Tavoite = {
      id: tavoite.id,
      tyyppi: 'MUU',
      mahdollisuusId: selectedMahdollisuus.id,
      mahdollisuusTyyppi: selectedMahdollisuus.mahdollisuusTyyppi,
      tavoite: stringToLocalizedText(goalName),
      kuvaus: stringToLocalizedText(goalDescription),
    } as Tavoite;

    await client.PUT(`/api/profiili/tavoitteet/{id}`, {
      params: {
        path: {
          id: tavoite.id,
        },
      },
      body: newTavoite,
    });
    closeActiveModal();
    await upsertTavoite({ ...newTavoite, id: tavoite.id });
    await refreshTavoitteet();
    setIsSubmitting(false);
  };
  const goalsId = React.useId();
  const insertTavoite = isUpdateMode ? updateTavoite : addTavoite;

  useEscHandler(insertTavoite, goalsId);

  const paginationTranslations = usePaginationTranslations();

  // STEP CONDITIONS ------------------------------------------------------
  const basicInfoStep = step === 0;
  const chooseFavoriteStep = step === 1;
  const addOrEditTitle =
    mode === 'ADD' ? t('profile.my-goals.add-modal-title') : t('profile.my-goals.update-modal-title');
  const headerText = basicInfoStep ? addOrEditTitle : t('profile.my-goals.choose-favorite-header');

  // RENDER ----------------------------------------------------------------
  return (
    <Modal
      name={headerText}
      open={isOpen}
      fullWidthContent={!lg}
      topSlot={<h1 className="text-heading-1-mobile sm:text-heading-1">{headerText}</h1>}
      content={
        <form className="pb-1">
          {basicInfoStep && (
            <div>
              <div className="flex flex-col">
                <p className="text-body-sm-mobile sm:text-body-sm font-arial mb-7">
                  {t('profile.my-goals.add-modal-description')}
                </p>
                <InputField
                  label={t('profile.my-goals.goal-name')}
                  requiredText={t('common:required')}
                  value={goalName}
                  className="mb-6 sm:max-w-[384px]"
                  onChange={(e) => setGoalName(e.target.value)}
                />
                <Textarea
                  label={t('profile.my-goals.goal-description')}
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {chooseFavoriteStep && (
            <div id={goalsId}>
              <div className="pb-3">
                <p className="text-body-sm-mobile sm:text-body-sm font-arial">
                  {t('profile.my-goals.choose-favorite-description')}
                </p>
              </div>
              <div className="flex flex-row mt-6 gap-5" ref={scrollRef}>
                <div className="flex flex-col gap-3 w-full">
                  {goalOptions.map((mahdollisuus) => {
                    const { id, mahdollisuusTyyppi } = mahdollisuus;
                    const isSelected = selectedMahdollisuus?.id === id;
                    return (
                      <OpportunityCard
                        key={id}
                        description={getLocalizedText(mahdollisuus.tiivistelma)}
                        name={getLocalizedText(mahdollisuus.otsikko)}
                        aineisto={mahdollisuus.aineisto}
                        ammattiryhma={mahdollisuus.ammattiryhma}
                        ammattiryhmaNimet={ammattiryhmaNimet}
                        tyyppi={mahdollisuus.tyyppi}
                        type={mahdollisuusTyyppi}
                        kesto={mahdollisuus.kesto}
                        yleisinKoulutusala={mahdollisuus.yleisinKoulutusala}
                        initiallyCollapsed
                        collapsible
                        hideFavorite
                        hideIcon={!sm}
                        actionButtonContent={
                          isSelected ? (
                            <div className="flex sm:gap-4 not-sm:justify-between items-center">
                              <span
                                className={tidyClasses([
                                  'flex',
                                  'items-center',
                                  'justify-center',
                                  'bg-secondary-3',
                                  'text-primary-gray',
                                  'text-heading-4',
                                  'rounded',
                                  'px-3',
                                  'pb-1',
                                  'text-[14px]',
                                  'uppercase',
                                  'sm:order-1',
                                  'not-sm:ml-3',
                                  'order-2',
                                ])}
                              >
                                {t('profile.my-goals.goal')}
                              </span>
                              <ActionButton
                                label={t('profile.my-goals.remove-from-goals')}
                                onClick={() => setSelectedMahdollisuus(null)}
                                className="order-1 sm:order-2 not-sm:px-0!"
                                icon={<JodFlagFilled className="text-accent" />}
                              />
                            </div>
                          ) : (
                            <ActionButton
                              label={t('profile.my-goals.set-to-goal')}
                              onClick={() => setSelectedMahdollisuus(mahdollisuus)}
                              icon={<JodFlag className="text-accent" />}
                            />
                          )
                        }
                      />
                    );
                  })}
                  {favoriteTyomahdollisuudet.length > 0 && (
                    <div className="mt-5">
                      <Pagination
                        currentPage={pageNr}
                        onPageChange={onPageChange}
                        pageSize={pageSize}
                        siblingCount={sm ? 1 : 0}
                        translations={paginationTranslations}
                        totalItems={totalFavorites}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={2}
          currentStep={step + 1}
        />
      }
      footer={
        <div className="flex justify-end gap-5 flex-1" data-testid="add-goal-footer">
          <div className="flex gap-5 justify-end">
            <Button
              label={t('common:cancel')}
              onClick={() => closeActiveModal()}
              variant="white"
              size={sm ? 'lg' : 'sm'}
              className="whitespace-nowrap h-5"
              data-testid="add-goal-modal-cancel"
            />
            {step > 0 && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  prevStep();
                }}
                label={t('previous')}
                variant="white"
                disabled={isSubmitting}
                size={sm ? 'lg' : 'sm'}
                className="whitespace-nowrap h-5"
                data-testid="add-goal-modal-previous"
              />
            )}
            {step < steps && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  nextStep();
                }}
                label={t('next')}
                variant="accent"
                disabled={isSubmitting || !goalName}
                size={sm ? 'lg' : 'sm'}
                className="whitespace-nowrap h-5"
                data-testid="add-goal-modal-next"
              />
            )}
            {(step === steps || isUpdateMode) && (
              <Button
                label={t('save')}
                onClick={async () => {
                  await insertTavoite();
                }}
                variant="accent"
                disabled={isSubmitting || !selectedMahdollisuus || !goalName}
                size={sm ? 'lg' : 'sm'}
                className="whitespace-nowrap h-5"
                data-testid="add-goal-modal-save"
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default GoalModal;
