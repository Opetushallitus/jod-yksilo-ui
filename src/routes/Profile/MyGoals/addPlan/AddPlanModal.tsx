import { client } from '@/api/client';
import { ActionButton } from '@/components';
import { OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import PlanOpportunityCard from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOpportunityCard.tsx';
import PlanOptionFilters from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionFilters.tsx';
import PlanOptionsPagination from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionsPagination.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { Button, cx, EmptyState, Modal, tidyClasses, useMediaQueries } from '@jod/design-system';
import { JodCheckmark, JodRoute, JodSettings } from '@jod/design-system/icons';
import i18n from 'i18next';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import AddOrEditCustomPlanModal from './customPlan/AddOrEditCustomPlanModal';
import { getKestoCount } from './store/PlanOptionStoreModel';

const AddPlanModal = ({ onClose, ...rest }: ModalComponentProps) => {
  const { t } = useTranslation();
  const { showDialog, showModal, closeActiveModal } = useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { sm } = useMediaQueries();

  const {
    tavoite,
    mahdollisuusEhdotukset,
    koulutusMahdollisuudet,
    filters,
    isLoading,
    updateEhdotuksetAndTyomahdollisuudet,
    selectedPlans,
    setSelectedPlans,
    vaaditutOsaamiset,
    updateEhdotukset,
    initialPlanListLoaded,
  } = addPlanStore(
    useShallow((state) => ({
      tavoite: state.tavoite,
      initialPlanListLoaded: state.initialPlanListLoaded,
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      koulutusMahdollisuudet: state.koulutusmahdollisuudet,
      filters: state.filters,
      selectedPlans: state.selectedPlans,
      setSelectedPlans: state.setSelectedPlans,
      isLoading: state.ehdotuksetLoading || state.mahdollisuudetLoading,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndMahdollisuudet,
      updateEhdotukset: state.updateEhdotukset,
    })),
  );

  const refreshTavoitteet = useTavoitteetStore((state) => state.refreshTavoitteet);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const tavoiteId = tavoite?.id;
    if (!tavoiteId) {
      closeActiveModal();
      return;
    }

    try {
      await Promise.all(
        selectedPlans.map(async (koulutusmahdollisuusId) => {
          const { error } = await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
            params: {
              path: {
                id: tavoiteId,
              },
            },
            body: { koulutusmahdollisuusId },
          });

          if (error) {
            throw error;
          }
        }),
      );
      toast.success(t('profile.my-goals.add-plan-success'));
    } catch (_error) {
      toast.error(t('profile.my-goals.add-plan-failed'));
    }
    await refreshTavoitteet();
    closeActiveModal();
    setIsSubmitting(false);
  };

  const currentHeaderText = React.useMemo(() => {
    return t('profile.paths.step-n-details', { count: 1 });
  }, [t]);

  const scrollRef = React.useRef<HTMLUListElement>(null);
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      await updateEhdotukset(i18n.language);
    };
    if (!initialPlanListLoaded) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPlanListLoaded]);

  const onUpdateResults = async () => {
    await updateEhdotuksetAndTyomahdollisuudet();
  };

  const onUpdateSettings = () => {
    const hasChanges = addPlanStore.getState().settingsHaveChanged;
    if (hasChanges) {
      onUpdateResults();
    }
  };

  const getTotalFilterCount = React.useCallback(() => {
    const kestoCount = getKestoCount(filters.minDuration, filters.maxDuration);
    return Object.values(filters).reduce((total, filter) => total + (filter?.length ?? 0), 0) + kestoCount;
  }, [filters]);

  const toggleFiltersText = React.useMemo(() => {
    return t('tool.settings.toggle-open', { count: getTotalFilterCount() });
  }, [getTotalFilterCount, t]);

  return (
    <Modal
      name={currentHeaderText}
      {...rest}
      topSlot={<h2 className="text-heading-2-mobile sm:text-hero">{t('profile.my-goals.add-new-plan-header')}</h2>}
      fullWidthContent
      className="sm:h-full!"
      content={
        <div>
          <div
            className={cx('mt-4', {
              // For shifting the scrollbar to the right
              'w-2/3': sm,
              '-mr-3 pr-3': !sm,
            })}
          >
            <div className="relative flex flex-col h-full z-20">
              <p className="text-body-sm-mobile sm:text-body-sm font-arial bg-bg-gray">
                {t('profile.my-goals.add-new-plan-description')}
              </p>
              <div className="sticky top-0 z-40 bg-bg-gray px-1">
                <div className="flex justify-end mb-3 items-center">
                  <Button
                    variant="gray"
                    size="sm"
                    className="bg-bg-gray-2!"
                    ariaHaspopup="dialog"
                    ref={settingsButtonRef}
                    icon={<JodSettings className="text-accent!" />}
                    iconSide="left"
                    disabled={isLoading}
                    label={toggleFiltersText}
                    data-testid="open-select-plan-filters"
                    onClick={() => {
                      showModal(PlanOptionFilters, {
                        onConfirm: onUpdateSettings,
                      });
                    }}
                  />
                </div>
              </div>

              {/* Scrollable opportunity cards container */}
              <ul
                id="selectplan-education-opportunities-list"
                ref={scrollRef}
                className={cx('flex flex-col gap-5 sm:gap-3 p-2 pt-0', {
                  'overflow-y-auto': !isLoading,
                  'overflow-hidden': isLoading,
                })}
                data-testid="selectplan-opportunities-list"
              >
                {isLoading && (
                  <>
                    <OpportunityCardSkeleton small />
                    <OpportunityCardSkeleton small />
                  </>
                )}

                {!isLoading && koulutusMahdollisuudet.length === 0 && (
                  <div className="flex justify-center mt-6">
                    <EmptyState text={t('profile.my-goals.no-filtered-results')} />
                  </div>
                )}
                {!isLoading &&
                  koulutusMahdollisuudet.map((mahdollisuus) => {
                    const { id } = mahdollisuus;
                    const ehdotus = mahdollisuusEhdotukset?.[id];
                    const vaaditutOsaamisetUris = new Set(vaaditutOsaamiset.map((o) => o.uri));
                    const matchingOsaamiset = mahdollisuus?.jakaumat?.osaaminen?.arvot!.filter((a) => {
                      const uri = a?.arvo;
                      return vaaditutOsaamisetUris.has(uri);
                    }).length;

                    return ehdotus ? (
                      <PlanOpportunityCard
                        key={id}
                        actionButtonContent={
                          selectedPlans?.includes(id) ? (
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
                                  'order-2',
                                ])}
                              >
                                {t('profile.my-goals.plan')}
                              </span>
                              <ActionButton
                                label={t('profile.my-goals.remove-from-plans')}
                                onClick={() => setSelectedPlans(selectedPlans?.filter((plan) => plan !== id))}
                                className="order-1 sm:order-2 not-sm:px-0!"
                                icon={<JodRoute className="text-accent" />}
                              />
                            </div>
                          ) : (
                            <ActionButton
                              className="px-0!"
                              label={t('profile.my-goals.choose-as-plan')}
                              onClick={() => setSelectedPlans([...selectedPlans, id])}
                              icon={<JodRoute className="text-accent" />}
                            />
                          )
                        }
                        mahdollisuus={mahdollisuus}
                        matchValue={`${matchingOsaamiset}/${vaaditutOsaamiset.length}`}
                        matchLabel={t('profile.my-goals.competences')}
                      />
                    ) : null;
                  })}
              </ul>
              <div className="my-4">
                <PlanOptionsPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} />
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-row gap-5 flex-1 justify-between">
          <Button
            label={t('profile.my-goals.add-custom-plan')}
            ariaHaspopup="dialog"
            variant="white"
            size={sm ? 'lg' : 'sm'}
            onClick={() => {
              closeActiveModal();
              showModal(AddOrEditCustomPlanModal, { tavoite });
            }}
          />

          <div className="flex flex-row gap-5">
            <Button
              label={t('common:cancel')}
              variant="white"
              size={sm ? 'lg' : 'sm'}
              ariaHaspopup="dialog"
              onClick={() => {
                showDialog({
                  title: t('common:cancel'),
                  description: t('profile.paths.cancel-confirmation-text'),
                  confirmText: t('close'),
                  cancelText: t('profile.paths.continue-editing'),
                  onConfirm: onClose,
                });
              }}
            />

            <Button
              label={t('save')}
              disabled={isSubmitting || selectedPlans.length === 0}
              size={sm ? 'lg' : 'sm'}
              icon={sm ? undefined : <JodCheckmark />}
              className="whitespace-nowrap"
              variant="accent"
              onClick={onSubmit}
            />
          </div>
        </div>
      }
    />
  );
};

export default AddPlanModal;
