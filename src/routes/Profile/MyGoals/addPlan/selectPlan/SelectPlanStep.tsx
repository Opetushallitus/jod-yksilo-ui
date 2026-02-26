import { ActionButton } from '@/components';
import { OpportunityCardSkeleton } from '@/components/OpportunityCard';
import { useModal } from '@/hooks/useModal';
import PlanOpportunityCard from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOpportunityCard.tsx';
import PlanOptionFilters from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionFilters.tsx';
import PlanOptionsPagination from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionsPagination.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { Button, cx, EmptyState, tidyClasses, useMediaQueries } from '@jod/design-system';
import { JodClose, JodRoute, JodSettings } from '@jod/design-system/icons';
import i18n from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import { getKestoCount } from '../store/PlanOptionStoreModel';

const SelectPlanStep = () => {
  const { t } = useTranslation();

  const {
    mahdollisuusEhdotukset,
    koulutusMahdollisuudet,
    filters,
    isLoading,
    updateEhdotuksetAndTyomahdollisuudet,
    selectedPlans,
    setSelectedPlans,
    vaaditutOsaamiset,
    updateEhdotukset,
    ehdotuksetPageSize,
    settingsHaveChanged,
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
      ehdotuksetPageSize: state.ehdotuksetPageSize,
      settingsHaveChanged: state.settingsHaveChanged,
    })),
  );

  const scrollRef = React.useRef<HTMLUListElement>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
  const { lg } = useMediaQueries();
  const { showModal } = useModal();

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

  const onCloseSettings = () => {
    const hasChanges = addPlanStore.getState().settingsHaveChanged;
    if (hasChanges) {
      onUpdateResults();
    }
    setSettingsOpen(false);
  };

  const getTotalFilterCount = React.useCallback(() => {
    const kestoCount = getKestoCount(filters.minDuration, filters.maxDuration);
    return Object.values(filters).reduce((total, filter) => total + (filter?.length ?? 0), 0) + kestoCount;
  }, [filters]);

  const filterLabel = React.useMemo(() => {
    if (settingsOpen) {
      return settingsHaveChanged ? t('tool.settings.toggle-update-close') : t('tool.settings.toggle-close');
    }
    return t('tool.settings.toggle-open');
  }, [settingsOpen, settingsHaveChanged, t]);

  const toggleFiltersText = React.useMemo(() => {
    if (settingsOpen) {
      return filterLabel;
    }
    const count = getTotalFilterCount();
    const filterCount = count > 0 ? ` (${count})` : '';
    return filterLabel + filterCount;
  }, [getTotalFilterCount, filterLabel, settingsOpen]);

  return (
    <div className="relative flex flex-col h-full z-20">
      {/* Sticky header remains */}
      <div className="sticky top-0 z-40 bg-bg-gray px-1 lg:pt-4">
        <div className="mb-2">
          <p className="text-body-sm-mobile sm:text-body-sm font-arial">
            {t('profile.my-goals.add-new-plan-description')}
          </p>
        </div>

        <div className="flex justify-end h-9 sm:mt-5 lg:pb-4 not-lg:mb-3 items-center mr-6">
          <Button
            variant="plain"
            size={lg ? 'lg' : 'sm'}
            className="text-primary-gray!"
            ref={settingsButtonRef}
            icon={settingsOpen ? <JodClose className="text-accent!" /> : <JodSettings className="text-accent!" />}
            iconSide="left"
            disabled={isLoading}
            label={toggleFiltersText}
            data-testid="open-select-plan-filters"
            onClick={() => {
              if (lg) {
                if (settingsOpen && settingsHaveChanged) {
                  onUpdateResults();
                }
                setSettingsOpen(!settingsOpen);
              } else {
                showModal(PlanOptionFilters, { isModal: true, onClose: onCloseSettings });
              }
            }}
          />
        </div>
        {settingsOpen && lg && (
          <div className="mb-4 px-1">
            <PlanOptionFilters isOpen={settingsOpen} onClose={onCloseSettings} isModal={false} />
          </div>
        )}
      </div>

      {/* Scrollable opportunity cards container */}
      <ul
        id="selectplan-education-opportunities-list"
        ref={scrollRef}
        className={cx('flex flex-col gap-5 sm:gap-3 mb-8 p-2 pt-0', {
          'overflow-y-auto': !isLoading,
          'overflow-hidden': isLoading,
        })}
        data-testid="selectplan-opportunities-list"
      >
        {isLoading &&
          Array.from({ length: ehdotuksetPageSize }, (_, index) => <OpportunityCardSkeleton key={index} small />)}
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
              return vaaditutOsaamisetUris.has(uri as string);
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
      <div className="mt-auto">
        <PlanOptionsPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} />
      </div>
    </div>
  );
};

export default SelectPlanStep;
