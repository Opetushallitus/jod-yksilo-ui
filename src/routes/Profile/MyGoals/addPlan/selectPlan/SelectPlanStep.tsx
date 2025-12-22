import { ActionButton } from '@/components';
import PlanOpportunityCard from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOpportunityCard.tsx';
import PlanOptionFilters from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionFilters.tsx';
import PlanOptionsPagination from '@/routes/Profile/MyGoals/addPlan/selectPlan/PlanOptionsPagination.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { Button, Spinner, useMediaQueries } from '@jod/design-system';
import { JodClose, JodRoute, JodSettings } from '@jod/design-system/icons';
import i18n from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';

const ExplorePlanOptions = () => {
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
  } = addPlanStore(
    useShallow((state) => ({
      tavoite: state.tavoite,
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      mahdollisuusEhdotukset: state.mahdollisuusEhdotukset,
      koulutusMahdollisuudet: state.koulutusmahdollisuudet,
      filters: state.filters,
      selectedPlans: state.selectedPlans,
      setSelectedPlans: state.setSelectedPlans,
      isLoading: state.ehdotuksetLoading || state.mahdollisuudetLoading,
      updateEhdotuksetAndTyomahdollisuudet: state.updateEhdotuksetAndMahdollisuudet,
    })),
  );

  const scrollRef = React.useRef<HTMLUListElement>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const settingsButtonRef = React.useRef<HTMLButtonElement>(null);
  const { lg } = useMediaQueries();

  const onUpdateResults = async () => {
    await updateEhdotuksetAndTyomahdollisuudet();
  };

  const onCloseSettings = () => {
    setSettingsOpen(false);
  };

  const getTotalFilterCount = React.useCallback(() => {
    return Object.values(filters).reduce((total, filter) => total + (filter?.length ?? 0), 0);
  }, [filters]);

  const toggleFiltersText = React.useMemo(() => {
    const count = getTotalFilterCount();
    const filterCount = count > 0 ? ` (${count})` : '';
    return `${t('tool.settings.toggle-title-closed')}${filterCount}`;
  }, [getTotalFilterCount, t]);

  const updateButtonLabel = isLoading ? t('updating-list') : t('update');

  return (
    <div className="relative flex flex-col h-full z-20">
      {/* Sticky header remains */}
      <div className="sticky top-0 z-40 bg-bg-gray px-1 lg:pt-4 shrink-0">
        <div className="mb-2">
          <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.my-goals.add-new-plan-header')}</h1>
          <p className="text-body-sm-mobile sm:text-body-sm">{t('profile.my-goals.add-new-plan-description')}</p>
        </div>

        <div className="flex items-center justify-end h-9 mt-5 lg:pb-4 not-lg:bg-white not-lg:w-full not-lg:mb-3 not-lg:px-4">
          <div className="flex gap-6 h-fit justify-end">
            <Button
              variant="plain"
              size="sm"
              ref={settingsButtonRef}
              icon={settingsOpen ? <JodClose className="text-accent!" /> : <JodSettings className="text-accent!" />}
              iconSide="left"
              label={settingsOpen ? t('tool.settings.toggle-title-open') : toggleFiltersText}
              data-testid="open-select-plan"
              onClick={() => setSettingsOpen(!settingsOpen)}
            />
            <Button
              size={lg ? 'lg' : 'sm'}
              label={updateButtonLabel}
              variant="accent"
              onClick={() => onUpdateResults()}
              icon={isLoading ? <Spinner color="white" size={20} /> : undefined}
              iconSide={isLoading ? 'right' : undefined}
              data-testid="selectplan-update-opportunities"
            />
          </div>
        </div>
        {settingsOpen && (
          <div className="shrink-0 mb-4 px-1 lg:px-4 bg-bg-gray shadow-md rounded-md">
            <PlanOptionFilters isOpen={settingsOpen} onClose={onCloseSettings} isModal={!lg} />
          </div>
        )}
      </div>

      {/* Scrollable opportunity cards container */}
      <ul
        id="selectplan-education-opportunities-list"
        ref={scrollRef}
        className="flex flex-col gap-5 sm:gap-3 mb-8 overflow-y-auto grow"
        style={{ minHeight: 0 }}
        data-testid="selectplan-opportunities-list"
      >
        {koulutusMahdollisuudet.map((mahdollisuus) => {
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
                  <ActionButton
                    label={t('profile.my-goals.remove-from-plans')}
                    onClick={() => setSelectedPlans(selectedPlans?.filter((plan) => plan !== id))}
                    className={'text-accent'}
                    icon={<JodRoute />}
                  />
                ) : (
                  <ActionButton
                    label={t('profile.my-goals.choose-as-plan')}
                    onClick={() => setSelectedPlans([...selectedPlans, id])}
                    icon={<JodRoute />}
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

      <PlanOptionsPagination scrollRef={scrollRef} ariaLabel={t('pagination.bottom')} className="mb-7 shrink-0" />
    </div>
  );
};

const SelectPlanStep = () => {
  const { updateEhdotukset, isLoading } = addPlanStore(
    useShallow((state) => ({
      isLoading: state.mahdollisuudetLoading,
      updateEhdotukset: state.updateEhdotukset,
    })),
  );

  React.useEffect(() => {
    const fetchData = async () => {
      await updateEhdotukset(i18n.language);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <div className="absolute top-1/2 left-1/2 transform -translate-1/2">
      <Spinner size={64} color="accent" />
    </div>
  ) : (
    <ExplorePlanOptions />
  );
};

export default SelectPlanStep;
