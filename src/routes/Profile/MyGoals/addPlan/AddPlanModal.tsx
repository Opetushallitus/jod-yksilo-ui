import i18n from 'i18next';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

import { Button, cx, EmptyState, Modal, useMediaQueries } from '@jod/design-system';
import { JodCheckmark, JodSettings } from '@jod/design-system/icons';

import { client } from '@/api/client';
import { getKoulutusMahdollisuusDetailsFullPage } from '@/api/mahdollisuusService';
import { OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import PlanOpportunityCard from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOpportunityCard.tsx';
import PlanOptionFilters from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionFilters.tsx';
import PlanOptionsPagination from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionsPagination.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { KoulutusMahdollisuusFull } from '@/routes/Profile/MyGoals/addPlan/store/PlanOptionStoreModel';
import { useSuosikitStore } from '@/stores/useSuosikitStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';

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
  const { suosikit, fetchSuosikit } = useSuosikitStore(
    useShallow((state) => ({ suosikit: state.suosikit, fetchSuosikit: state.fetchSuosikit })),
  );

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
      void fetchData();
    }
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [initialPlanListLoaded]);

  React.useEffect(() => {
    void fetchSuosikit();
  }, [fetchSuosikit]);

  const onUpdateResults = async () => {
    await updateEhdotuksetAndTyomahdollisuudet();
  };

  const onUpdateSettings = () => {
    const hasChanges = addPlanStore.getState().settingsHaveChanged;
    if (hasChanges) {
      void onUpdateResults();
    }
  };

  const getTotalFilterCount = React.useCallback(() => {
    const kestoCount = getKestoCount(filters.minDuration, filters.maxDuration);
    const arrayCount = filters.educationOpportunityType.length;
    const favoritesCount = filters.showFavorites ? 1 : 0;
    return arrayCount + kestoCount + favoritesCount;
  }, [filters]);

  const toggleFiltersText = React.useMemo(() => {
    return t('tool.settings.toggle-open', { count: getTotalFilterCount() });
  }, [getTotalFilterCount, t]);

  const favoriteEducationOpportunityIds = React.useMemo(
    () =>
      new Set(
        suosikit.filter((suosikki) => suosikki.tyyppi === 'KOULUTUSMAHDOLLISUUS').map((suosikki) => suosikki.kohdeId),
      ),
    [suosikit],
  );

  const [favoritePinnedMahdollisuudet, setFavoritePinnedMahdollisuudet] = React.useState<KoulutusMahdollisuusFull[]>(
    [],
  );

  const alreadyPlannedIds = React.useMemo(
    () => new Set(tavoite?.suunnitelmat?.map((s) => s.koulutusmahdollisuusId).filter(Boolean)),
    [tavoite],
  );

  React.useEffect(() => {
    if (!filters.showFavorites || favoriteEducationOpportunityIds.size === 0) {
      setFavoritePinnedMahdollisuudet([]);
      return;
    }
    const ids = [...favoriteEducationOpportunityIds].filter((id) => !alreadyPlannedIds.has(id));
    if (ids.length === 0) {
      setFavoritePinnedMahdollisuudet([]);
      return;
    }
    let cancelled = false;
    void getKoulutusMahdollisuusDetailsFullPage(ids, ids.length).then((data) => {
      if (!cancelled) setFavoritePinnedMahdollisuudet(data);
    });
    return () => {
      cancelled = true;
    };
  }, [favoriteEducationOpportunityIds, filters.showFavorites, alreadyPlannedIds]);

  const renderActionButtonContent = React.useCallback(
    (id: string) =>
      selectedPlans?.includes(id) ? (
        <div className="flex flex-row items-center gap-4">
          <span
            className={cx([
              'flex items-center justify-center px-3 pb-1',
              'size-[20px] rounded-full bg-primary-2-dark',
              'text-heading-4 text-[0.875rem] uppercase',
            ])}
          ></span>
          <Button
            size="sm"
            variant="gray"
            label={t('profile.my-goals.remove-from-plans')}
            onClick={() => setSelectedPlans(selectedPlans?.filter((plan) => plan !== id))}
          />
        </div>
      ) : (
        <Button
          size="sm"
          variant="gray"
          className="bg-bg-gray"
          label={t('profile.my-goals.choose-as-plan')}
          onClick={() => setSelectedPlans([...selectedPlans, id])}
        />
      ),
    [selectedPlans, setSelectedPlans, t],
  );

  const vaaditutOsaamisetUris = React.useMemo(() => new Set(vaaditutOsaamiset.map((o) => o.uri)), [vaaditutOsaamiset]);

  const getMatchCount = React.useCallback(
    (mahdollisuus: { jakaumat?: { osaaminen?: { arvot?: { arvo?: string }[] | null } | null } | null }) =>
      mahdollisuus?.jakaumat?.osaaminen?.arvot?.filter((v) => v?.arvo && vaaditutOsaamisetUris.has(v.arvo)).length ?? 0,
    [vaaditutOsaamisetUris],
  );

  const matchCountsById = React.useMemo(() => {
    return new Map(koulutusMahdollisuudet.map((m) => [m.id, getMatchCount(m)]));
  }, [koulutusMahdollisuudet, getMatchCount]);

  const sortedKoulutusMahdollisuudet = React.useMemo(() => {
    return [...koulutusMahdollisuudet].sort(
      (a, b) => (matchCountsById.get(b.id) ?? 0) - (matchCountsById.get(a.id) ?? 0),
    );
  }, [koulutusMahdollisuudet, matchCountsById]);

  const renderPlanOpportunity = React.useCallback(
    (mahdollisuus: (typeof koulutusMahdollisuudet)[number]) => {
      const { id } = mahdollisuus;
      const ehdotus = mahdollisuusEhdotukset?.[id];
      if (!ehdotus) return null;

      return (
        <PlanOpportunityCard
          key={id}
          actionButtonContent={renderActionButtonContent(id)}
          selected={selectedPlans?.includes(id)}
          mahdollisuus={mahdollisuus}
          matchValue={`${matchCountsById.get(id) ?? 0}/${vaaditutOsaamiset.length}`}
          matchLabel={t('profile.my-goals.competences')}
        />
      );
    },
    [mahdollisuusEhdotukset, renderActionButtonContent, t, vaaditutOsaamiset, selectedPlans, matchCountsById],
  );

  const sortedFavoritePinnedMahdollisuudet = React.useMemo(() => {
    return [...favoritePinnedMahdollisuudet].sort((a, b) => getMatchCount(b) - getMatchCount(a));
  }, [favoritePinnedMahdollisuudet, getMatchCount]);

  const renderFavoriteOpportunity = React.useCallback(
    (mahdollisuus: KoulutusMahdollisuusFull) => {
      const { id } = mahdollisuus;
      return (
        <PlanOpportunityCard
          key={id}
          actionButtonContent={renderActionButtonContent(id)}
          mahdollisuus={mahdollisuus}
          matchValue={`${getMatchCount(mahdollisuus)}/${vaaditutOsaamiset.length}`}
          matchLabel={t('profile.my-goals.competences')}
        />
      );
    },
    [renderActionButtonContent, t, vaaditutOsaamiset, getMatchCount],
  );

  return (
    <Modal
      name={currentHeaderText}
      {...rest}
      topSlot={<h2 className="text-heading-2-mobile sm:text-hero">{t('profile.my-goals.add-new-plan-header')}</h2>}
      fullWidthContent
      className="h-[90vh]! sm:h-full!"
      content={
        <div className="">
          <div>
            <div className="relative z-20 flex h-full flex-col">
              <div className="box-content max-w-modal-content px-5 md:px-9">
                <p className="bg-bg-gray font-arial text-body-sm-mobile sm:text-body-sm">
                  {t('profile.my-goals.add-new-plan-description')}
                </p>
                <div className="sticky top-0 z-40 bg-bg-gray px-1">
                  <div className="mb-3 flex items-center justify-end">
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
              </div>

              {/* Scrollable opportunity cards container */}
              <ul
                id="selectplan-education-opportunities-list"
                ref={scrollRef}
                className={cx('box-content flex max-w-modal-content flex-col gap-4 py-2 pt-0 md:pl-9', {
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

                {!isLoading && sortedKoulutusMahdollisuudet.length === 0 && (
                  <div className="mt-6 flex justify-center">
                    <EmptyState text={t('profile.my-goals.no-filtered-results')} />
                  </div>
                )}
                {!isLoading &&
                  (filters.showFavorites ? (
                    <>
                      <li className="font-semibold mb-2 font-arial text-body-md-mobile sm:text-body-md">
                        {t('profile.my-goals.filters.favorites.title')}
                      </li>
                      {sortedFavoritePinnedMahdollisuudet.map(renderFavoriteOpportunity)}

                      <li className="font-semibold mt-2 mb-2 font-arial text-body-md-mobile sm:text-body-md">
                        {t('profile.my-goals.filters.other-options-title')}
                      </li>
                      {sortedKoulutusMahdollisuudet.map(renderPlanOpportunity)}
                    </>
                  ) : (
                    sortedKoulutusMahdollisuudet.map(renderPlanOpportunity)
                  ))}
              </ul>
              <div className="my-4 px-5 md:pl-9">
                <PlanOptionsPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} />
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-1 flex-row justify-between gap-5">
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
