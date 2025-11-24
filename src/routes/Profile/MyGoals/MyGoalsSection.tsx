import type { components } from '@/api/schema';
import { OpportunityCard } from '@/components';
import { useModal } from '@/hooks/useModal';
import { GoalModal } from '@/routes/Profile/MyGoals/addGoal/GoalModal';
import AddPlanModal from '@/routes/Profile/MyGoals/addPlan/AddPlanModal.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore.ts';
import { PlanCompetencesTable } from '@/routes/Profile/MyGoals/compareCompetences/PlanCompetencesTable.tsx';
import loader from '@/routes/Profile/MyGoals/loader';
import { PlanList } from '@/routes/Profile/MyGoals/PlanList.tsx';
import { getTypeSlug } from '@/routes/Profile/utils';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { getLocalizedText, initializeLocalizedText } from '@/utils';
import { Button } from '@jod/design-system';
import { JodCaretDown, JodCaretUp } from '@jod/design-system/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { useShallow } from 'zustand/shallow';

interface MyGoalsSectionProps {
  tavoitteet: components['schemas']['TavoiteDto'][];
}

const MyGoalsSection = ({ tavoitteet }: MyGoalsSectionProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const { mahdollisuusDetails, upsertTavoite, deleteTavoite } = useTavoitteetStore(
    useShallow((state) => ({
      mahdollisuusDetails: state.mahdollisuusDetails,
      upsertTavoite: state.upsertTavoite,
      deleteTavoite: state.deleteTavoite,
    })),
  );

  const { showDialog, showModal } = useModal();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  const getMahdollisuusDetails = React.useCallback(
    (id?: string) => (id ? mahdollisuusDetails.find((item) => item.id === id) : undefined),
    [mahdollisuusDetails],
  );

  const removeSuunnitelmaFromStore = React.useCallback(
    (tavoiteId?: string, suunnitelmaId?: string) => {
      if (!tavoiteId || !suunnitelmaId) return;
      const tavoite = tavoitteet.find((t) => t.id === tavoiteId);
      if (tavoite) {
        upsertTavoite({
          ...tavoite,
          suunnitelmat: tavoite.suunnitelmat?.filter((s) => s?.id !== suunnitelmaId),
        });
      }
    },
    [tavoitteet, upsertTavoite],
  );

  const { setTavoite } = addPlanStore(
    useShallow((state) => ({
      setTavoite: state.setTavoite,
    })),
  );

  // Accordion: index of open item, null = all closed
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-5">
      <div className="flex flex-col mb-5 gap-6">
        {tavoitteet.map((tavoite, i) => {
          const { mahdollisuusId, mahdollisuusTyyppi } = tavoite;
          const details = getMahdollisuusDetails(mahdollisuusId);
          const isOpen = openIndex === i;

          return (
            <div key={tavoite.id ?? mahdollisuusId ?? i} className="flex flex-col">
              {/* Accordion header */}
              <button
                onClick={() => toggleAccordion(i)}
                className="flex justify-between items-center text-heading-2 cursor-pointer bg-transparent hover:bg-gray-100 rounded"
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${i}`}
                id={`accordion-header-${i}`}
              >
                <span>{getLocalizedText(initializeLocalizedText(tavoite.tavoite))}</span>
                {isOpen ? <JodCaretUp size={20} /> : <JodCaretDown size={20} />}
              </button>

              <p className="ds:text-primary-gray">{getLocalizedText(initializeLocalizedText(tavoite.kuvaus)) ?? ''}</p>

              {!isOpen && (
                <p className="text-secondary-gray ds:sm:text-body-sm font-semibold">
                  {t('profile.my-goals.plan', { count: tavoite.suunnitelmat?.length ?? 0 })}
                </p>
              )}

              {isOpen && (
                <div
                  id={`accordion-content-${tavoite.id}`}
                  role="region"
                  aria-labelledby={`accordion-header-${i}`}
                  className="p-4"
                >
                  {details && mahdollisuusTyyppi && (
                    <>
                      <OpportunityCard
                        to={`/${language}/${getTypeSlug(mahdollisuusTyyppi)}/${mahdollisuusId ?? ''}`}
                        description={getLocalizedText(details.tiivistelma)}
                        from="goal"
                        ammattiryhma={details.ammattiryhma}
                        ammattiryhmaNimet={loaderData?.ammattiryhmaNimet}
                        name={getLocalizedText(details.otsikko)}
                        aineisto={details.aineisto}
                        tyyppi={details.tyyppi}
                        type={mahdollisuusTyyppi}
                        kesto={details.kesto}
                        yleisinKoulutusala={details.yleisinKoulutusala}
                        headingLevel="h3"
                        hideFavorite
                      />
                      <PlanList
                        goal={tavoite}
                        language={language}
                        removeSuunnitelmaFromStore={removeSuunnitelmaFromStore}
                      />
                    </>
                  )}

                  <div className="mt-9 flex flex-col items-start gap-3">
                    <Button
                      variant="white"
                      onClick={() => {
                        setTavoite(tavoite);
                        showModal(AddPlanModal);
                      }}
                      label={t('profile.my-goals.add-new-plan-for-goal')}
                    />
                    <PlanCompetencesTable goal={tavoite} />

                    <div className="w-full flex justify-between">
                      <Button
                        variant="white"
                        onClick={() => {
                          setTavoite(tavoite);
                          showModal(GoalModal, { mode: 'UPDATE', tavoite: tavoite });
                        }}
                        label={t('profile.my-goals.modify-goal')}
                      />

                      <Button
                        label={t('profile.my-goals.delete-goal')}
                        variant="white-delete"
                        onClick={() => {
                          if (!tavoite.id) return;
                          showDialog({
                            title: t('profile.my-goals.delete-goal'),
                            description: t('profile.my-goals.delete-goal-description'),
                            onConfirm: () => deleteTavoite(tavoite.id!),
                          });
                        }}
                        disabled={!tavoite.id}
                        testId="goals-delete"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyGoalsSection;
