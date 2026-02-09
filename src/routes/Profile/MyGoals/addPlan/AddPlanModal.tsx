import { client } from '@/api/client';
import { useModal } from '@/hooks/useModal';
import { addPlanStore } from '@/routes/Profile/MyGoals/addPlan/store/addPlanStore';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import React from 'react';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/shallow';
import AddOrEditCustomPlanModal from './customPlan/AddOrEditCustomPlanModal';
import SelectPlanStep from './selectPlan/SelectPlanStep';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
}

const AddPlanModal = ({ isOpen, onClose }: AddPlanModalProps) => {
  const { t } = useTranslation();
  const { showDialog, showModal, closeActiveModal } = useModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { sm } = useMediaQueries();
  const { tavoite, selectedPlans } = addPlanStore(
    useShallow((state) => ({
      tavoite: state.tavoite,
      selectedPlans: state.selectedPlans,
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

  const close = (isCancel = false) => {
    onClose(isCancel);
  };

  const currentHeaderText = React.useMemo(() => {
    return t('profile.paths.step-n-details', { count: 1 });
  }, [t]);

  return (
    <Modal
      name={currentHeaderText}
      open={isOpen}
      topSlot={<h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.my-goals.add-new-plan-header')}</h1>}
      fullWidthContent
      className="h-full"
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={1}
          currentStep={1}
        />
      }
      content={<SelectPlanStep />}
      footer={
        <div className="flex flex-row gap-5 flex-1 justify-between">
          <Button
            label={t('profile.my-goals.add-custom-plan')}
            variant="white"
            size={sm ? 'lg' : 'sm'}
            className="h-5"
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
              className="h-5"
              onClick={() => {
                showDialog({
                  title: t('common:cancel'),
                  description: t('profile.paths.cancel-confirmation-text'),
                  confirmText: t('close'),
                  cancelText: t('profile.paths.continue-editing'),
                  onConfirm: () => close(true),
                });
              }}
            />

            <Button
              label={t('save')}
              disabled={isSubmitting || selectedPlans.length === 0}
              size={sm ? 'lg' : 'sm'}
              className="h-5"
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
