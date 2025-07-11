import { client } from '@/api/client';
import { formErrorMessage } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import CompetencesStep from '@/routes/Profile/Path/modal/ManualVaiheModal/CompetencesStep';
import OpportunityDetailsStep from '@/routes/Profile/Path/modal/ProposeVaiheModal/OpportunityDetailsStep';
import { usePolutStore } from '@/stores/usePolutStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, clamp, ConfirmDialog, Modal, WizardProgress } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { mapOsaaminenToUri, vaiheFormSchema, type PolkuQueryParams, type VaiheForm } from '../../utils';
import SelectOpportunityStep from './SelectOpportunityStep';

interface ProposeVaiheModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
  vaiheIndex: number;
}

const ProposeVaiheModal = ({ isOpen, onClose, vaiheIndex }: ProposeVaiheModalProps) => {
  const { vaiheet, proposedOpportunity, setProposedOpportunity } = usePolutStore(
    useShallow((state) => ({
      vaiheet: state.vaiheet,
      proposedOpportunity: state.proposedOpportunity,
      setProposedOpportunity: state.setProposedOpportunity,
    })),
  );
  const { t } = useTranslation();
  const { suunnitelmaId, paamaaraId } = useParams<PolkuQueryParams>();
  const formId = React.useId();
  const isEditMode = vaiheet.at(vaiheIndex)?.id !== undefined;

  const methods = useForm<VaiheForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      vaiheFormSchema.refine(
        (data) => !data.loppuPvm || data.alkuPvm <= data.loppuPvm,
        formErrorMessage.dateRange(['loppuPvm']),
      ),
    ),
    defaultValues: async () => {
      const vaihe = vaiheet.at(vaiheIndex);

      return Promise.resolve({
        id: vaihe?.id ?? undefined,
        nimi: vaihe?.nimi ?? {},
        kuvaus: vaihe?.kuvaus ?? {},
        linkit: vaihe?.linkit ?? [],
        alkuPvm: vaihe?.alkuPvm ?? '',
        loppuPvm: vaihe?.loppuPvm ?? '',
        osaamiset: vaihe?.osaamiset ?? [],
        valmis: vaihe?.valmis ?? false,
        tyyppi: vaihe?.tyyppi ?? 'KOULUTUS',
        lahde: 'EHDOTUS',
      });
    },
  });

  const onSubmit: FormSubmitHandler<VaiheForm> = async ({ data }: { data: VaiheForm }) => {
    if (!data || !suunnitelmaId || !paamaaraId) {
      close(true);
      return;
    }

    const apiCall = data.id
      ? client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}', {
          params: {
            path: {
              id: paamaaraId,
              suunnitelmaId,
              vaiheId: data.id,
            },
          },
          body: {
            ...data,
            linkit: data.linkit?.map((link) => link.url),
            osaamiset: data.osaamiset?.map(mapOsaaminenToUri),
          },
        })
      : client.POST('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet', {
          params: {
            path: {
              id: paamaaraId,
              suunnitelmaId,
            },
          },
          body: {
            ...data,
            nimi: proposedOpportunity?.otsikko ?? {},
            kuvaus: proposedOpportunity?.kuvaus,
            mahdollisuusId: proposedOpportunity?.id,
            linkit: data.linkit?.map((link) => link.url),
            osaamiset: data.osaamiset?.map(mapOsaaminenToUri),
          },
        });

    const { error } = await apiCall;

    if (!error) {
      close();
    }
  };

  const wizardComponents = isEditMode
    ? [OpportunityDetailsStep, CompetencesStep]
    : [SelectOpportunityStep, OpportunityDetailsStep, CompetencesStep];

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
    setProposedOpportunity(undefined);
    onClose(isCancel);
  };

  const cancel = () => {
    close(true);
  };

  useEscHandler(cancel, React.useId());

  const [alkuPvm, loppuPvm] = methods.watch(['alkuPvm', 'loppuPvm']);

  const detailsStepHasErrors =
    !!methods.formState.errors.alkuPvm || !!methods.formState.errors.loppuPvm || !alkuPvm || !loppuPvm;

  return (
    <FormProvider {...methods}>
      <Modal
        open={isOpen}
        fullWidthContent
        progress={
          <WizardProgress
            labelText={t('wizard.label')}
            stepText={t('wizard.step')}
            completedText={t('wizard.completed')}
            currentText={t('wizard.current')}
            steps={wizardComponents.length}
            currentStep={wizardStep + 1}
          />
        }
        content={
          <Form id={formId} onSubmit={onSubmit}>
            <WizardContent vaiheIndex={vaiheIndex} />
          </Form>
        }
        footer={
          <div className="flex flex-row justify-end gap-5 flex-1">
            {methods.formState.isDirty ? (
              <ConfirmDialog
                title={t('cancel')}
                description={t('profile.paths.cancel-confirmation-text')}
                onConfirm={cancel}
                confirmText={t('close')}
                cancelText={t('profile.paths.continue-editing')}
                variant="destructive"
              >
                {(showDialog: () => void) => <Button label={t('cancel')} variant="white" onClick={showDialog} />}
              </ConfirmDialog>
            ) : (
              <Button label={t('cancel')} variant="white" onClick={cancel} />
            )}

            {!isEditMode && wizardStep === 0 && (
              <Button
                label={t('next')}
                variant="white"
                disabled={!proposedOpportunity}
                onClick={nextStep}
                icon={<JodArrowRight />}
                iconSide="right"
              />
            )}
            {((!isEditMode && wizardStep === 1) || (isEditMode && wizardStep === 0)) && (
              <>
                {!isEditMode && <Button label={t('previous')} variant="white" onClick={previousStep} />}
                <Button
                  label={t('next')}
                  variant="white"
                  disabled={detailsStepHasErrors}
                  onClick={nextStep}
                  icon={<JodArrowRight />}
                  iconSide="right"
                />
              </>
            )}
            {((!isEditMode && wizardStep === 2) || (isEditMode && wizardStep === 1)) && (
              <>
                <Button label={t('previous')} variant="white" onClick={previousStep} />
                <Button label={t('save')} variant="white" form={formId} />
              </>
            )}
          </div>
        }
      />
    </FormProvider>
  );
};

export default ProposeVaiheModal;
