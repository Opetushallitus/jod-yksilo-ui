import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator } from 'react-router';
import { useShallow } from 'zustand/shallow';

import { Button, Select, useMediaQueries } from '@jod/design-system';

import type { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import { useModal } from '@/hooks/useModal';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import { GoalModal } from '@/routes/Profile/MyGoals/addGoal/GoalModal';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { PlanCompetencesTable } from '@/routes/Profile/MyGoals/compareCompetences/PlanCompetencesTable';
import loader from '@/routes/Profile/MyGoals/loader';
import { PlanList } from '@/routes/Profile/MyGoals/PlanList';
import { getTypeSlug } from '@/routes/Profile/utils';
import { getMahdollisuusAlityyppi } from '@/routes/Tool/utils';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText, sortByProperty } from '@/utils';

interface MyGoalsSectionProps {
  tavoitteet: components['schemas']['TavoiteDto'][];
}

const MyGoalsSection = ({ tavoitteet }: MyGoalsSectionProps) => {
  const { t, i18n } = useTranslation();
  const { sm } = useMediaQueries();
  const revalidator = useRevalidator();

  const { mahdollisuusDetails, isLoading, upsertTavoite, deleteTavoite } = useTavoitteetStore(
    useShallow((state) => ({
      mahdollisuusDetails: state.mahdollisuusDetails,
      isLoading: state.isLoading,
      upsertTavoite: state.upsertTavoite,
      deleteTavoite: state.deleteTavoite,
    })),
  );

  const { showDialog, showModal } = useModal();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const guardedAction = useSessionGuardedAction();

  const getMahdollisuusDetails = React.useCallback(
    (id?: string) => (id ? mahdollisuusDetails.find((item) => item.id === id) : undefined),
    [mahdollisuusDetails],
  );

  const removeSuunnitelmaFromStore = React.useCallback(
    (tavoiteId?: string, suunnitelmaId?: string) => {
      if (!tavoiteId || !suunnitelmaId) return;
      const tavoite = tavoitteet.find((t) => t.id === tavoiteId);
      if (tavoite) {
        void upsertTavoite({
          ...tavoite,
          suunnitelmat: tavoite.suunnitelmat?.filter((s) => s?.id !== suunnitelmaId).sort(sortByProperty('luotu')),
        });
      }
    },
    [tavoitteet, upsertTavoite],
  );

  const setTavoite = addPlanStore((state) => state.setTavoite);

  const goalOptions = tavoitteet.map((tavoite, i) => ({
    value: String(tavoite.id ?? tavoite.mahdollisuusId ?? i),
    label: getLocalizedText(tavoite.tavoite),
  }));

  const [selectedGoalValue, setSelectedGoalValue] = React.useState<string | undefined>(goalOptions[0]?.value);

  const selectedTavoite = tavoitteet.find(
    (tavoite, i) => String(tavoite.id ?? tavoite.mahdollisuusId ?? i) === selectedGoalValue,
  );

  return (
    <div className="mb-5">
      <div className="mb-5 flex flex-col gap-6 px-5 sm:px-6 lg:pr-0 lg:pl-6" data-testid="my-goals-section">
        <Select
          label={t('profile.my-goals.show-goal')}
          options={goalOptions}
          selected={selectedGoalValue}
          onChange={setSelectedGoalValue}
          placeholder={t('profile.my-goals.show-goal')}
          testId="goal-select"
        />

        {selectedTavoite &&
          (() => {
            const { mahdollisuusId, mahdollisuusTyyppi } = selectedTavoite;
            const details = getMahdollisuusDetails(mahdollisuusId);

            return (
              <div className="flex flex-col rounded bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <h2
                    className="font-poppins text-heading-3 text-primary-gray sm:text-heading-3-mobile"
                    data-testid="goal-title"
                  >
                    {getLocalizedText(selectedTavoite.tavoite)}
                  </h2>
                  <p className="font-arial text-primary-gray" data-testid="goal-description">
                    {getLocalizedText(selectedTavoite.kuvaus)}
                  </p>
                </div>
                <div className="pt-6 sm:pt-7">
                  {details && mahdollisuusTyyppi && (
                    <>
                      <OpportunityCard
                        to={`/${i18n.language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId ?? ''}`}
                        description={getLocalizedText(details.tiivistelma)}
                        from="goal"
                        ammattiryhma={details.ammattiryhma}
                        ammattiryhmaNimet={loaderData?.ammattiryhmaNimet}
                        name={getLocalizedText(details.otsikko)}
                        mahdollisuusTyyppi={mahdollisuusTyyppi}
                        mahdollisuusAlityyppi={getMahdollisuusAlityyppi(details)}
                        kesto={details.kesto}
                        yleisinKoulutusala={details.yleisinKoulutusala}
                        headingLevel="h3"
                        hideFavorite
                        isActiveOpportunity={details.aktiivinen}
                        borderClassName="border-2 border-border-gray"
                      />
                      <PlanList
                        goal={selectedTavoite}
                        language={i18n.language}
                        removeSuunnitelmaFromStore={removeSuunnitelmaFromStore}
                      />
                    </>
                  )}

                  <div className="mt-9 flex flex-col items-start gap-3 pl-3 sm:pl-4">
                    <PlanCompetencesTable goal={selectedTavoite} />
                    <div className="flex w-full justify-end gap-5">
                      <Button
                        variant="gray"
                        ariaHaspopup="dialog"
                        size={'sm'}
                        onClick={guardedAction(() => {
                          setTavoite(selectedTavoite);
                          showModal(GoalModal, { mode: 'UPDATE', tavoite: selectedTavoite });
                        })}
                        disabled={isLoading}
                        label={sm ? t('profile.my-goals.modify-goal') : t('edit')}
                        testId="modify-goal-button"
                      />
                      <Button
                        label={t('profile.my-goals.delete-goal')}
                        variant="white-delete"
                        size={'sm'}
                        ariaHaspopup="dialog"
                        onClick={guardedAction(() => {
                          showDialog({
                            title: t('profile.my-goals.delete-goal'),
                            description: t('profile.my-goals.delete-goal-description'),
                            onConfirm: async () => {
                              await deleteTavoite(selectedTavoite.id!);
                              await revalidator.revalidate();
                            },
                            testId: 'delete-goal-dialog',
                          });
                        })}
                        disabled={!selectedTavoite.id || isLoading}
                        testId="delete-goal-button"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default MyGoalsSection;
