import { client } from '@/api/client.ts';
import { useModal } from '@/hooks/useModal';
import CreateCustomPlanStep from '@/routes/Profile/MyGoals/addPlan/createCustomPlan/CreateCustomPlanStep.tsx';
import SelectCompetencesStep from '@/routes/Profile/MyGoals/addPlan/selectCompetences/SelectCompetencesStep.tsx';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { Button, clamp, Modal, WizardProgress } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import SelectPlanStep from './selectPlan/SelectPlanStep.tsx';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
}

const AddPlanModal = ({ isOpen, onClose }: AddPlanModalProps) => {
  const { t } = useTranslation();
  const { showDialog, closeActiveModal } = useModal();
  const { tavoite, selectedPlans, selectedOsaamiset, planName, planDescription } = addPlanStore(
    useShallow((state) => ({
      tavoite: state.tavoite,
      selectedOsaamiset: state.selectedOsaamiset,
      selectedPlans: state.selectedPlans,
      setSelectedPlans: state.setSelectedPlans,
      planName: state.planName,
      planDescription: state.planDescription,
    })),
  );

  const { refreshTavoitteet } = useTavoitteetStore(
    useShallow((state) => ({
      refreshTavoitteet: state.refreshTavoitteet,
    })),
  );

  const onSubmit = async () => {
    if (!tavoite || !tavoite.id) {
      closeActiveModal();
      return;
    }
    for (const selectedplan of selectedPlans) {
      await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
        params: {
          path: {
            id: tavoite.id,
          },
        },
        body: {
          koulutusmahdollisuusId: selectedplan,
        },
      });
    }
    if (selectedPlans.length == 0) {
      await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
        params: {
          path: {
            id: tavoite!.id!,
          },
        },
        body: {
          nimi: planName,
          kuvaus: planDescription,
          osaamiset: selectedOsaamiset.map((o) => o.uri),
        },
      });
    }
    await refreshTavoitteet();
    closeActiveModal();
  };

  const wizardComponents = React.useMemo(
    () => [() => <SelectPlanStep />, () => <CreateCustomPlanStep />, () => <SelectCompetencesStep />],
    [],
  );

  const [wizardStep, setWizardStep] = React.useState(0);
  const WizardContent = wizardComponents[wizardStep];

  const setStep = (step: number) => {
    setWizardStep(clamp(step, 0, wizardComponents.length - 1));
  };

  const nextStep = () => {
    setStep(wizardStep + 1);
  };

  const previousStep = () => {
    setStep(wizardStep - 1);
  };

  const close = (isCancel = false) => {
    onClose(isCancel);
  };

  const cancel = () => {
    close(true);
  };

  const currentHeaderText = React.useMemo(() => {
    return t('profile.paths.step-n-details', { count: 3 });
  }, [t]);

  const planNameEmpty = (): boolean => {
    return Object.values(planName).every((value) => value.trim() === '');
  };

  return (
    <Modal
      name={currentHeaderText}
      open={isOpen}
      fullWidthContent
      progress={
        <div className="relative z-30">
          <WizardProgress
            labelText={t('wizard.label')}
            stepText={t('wizard.step')}
            completedText={t('wizard.completed')}
            currentText={t('wizard.current')}
            steps={wizardComponents.length}
            currentStep={wizardStep + 1}
          />
        </div>
      }
      content={<WizardContent />}
      footer={
        <>
          <div className={`flex flex-row gap-5 flex-1 ${wizardStep === 0 ? 'justify-between' : 'justify-end'}`}>
            {wizardStep === 0 && (
              <Button
                label={t('profile.my-goals.add-custom-plan')}
                variant="white"
                onClick={nextStep}
                iconSide="right"
              />
            )}

            <div className="flex flex-row gap-5">
              <Button
                label={t('cancel')}
                variant="white"
                onClick={() => {
                  showDialog({
                    title: t('cancel'),
                    description: t('profile.paths.cancel-confirmation-text'),
                    confirmText: t('close'),
                    cancelText: t('profile.paths.continue-editing'),
                    onConfirm: cancel,
                  });
                }}
              />

              {(wizardStep === 1 || wizardStep === 2) && (
                <Button label={t('previous')} variant="white" onClick={previousStep} />
              )}
              {wizardStep === 1 && <Button label={t('next')} variant="accent" onClick={nextStep} />}
              {(wizardStep === 0 || wizardStep === 2) && (
                <Button
                  label={t('save')}
                  disabled={(planNameEmpty() || selectedOsaamiset.length == 0) && selectedPlans.length == 0}
                  variant="accent"
                  onClick={() => onSubmit()}
                />
              )}
            </div>
          </div>
        </>
      }
    />
  );
};

export default AddPlanModal;
