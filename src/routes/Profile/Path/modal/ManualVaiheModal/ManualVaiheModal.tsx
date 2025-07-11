import { client } from '@/api/client';
import { formErrorMessage } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { usePolutStore } from '@/stores/usePolutStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ConfirmDialog, Modal, WizardProgress } from '@jod/design-system';
import { JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/shallow';
import { vaiheFormSchema, type PolkuQueryParams, type VaiheForm } from '../../utils';
import CompetencesStep from './CompetencesStep';
import DetailsStep from './DetailsStep';

interface ManualVaiheModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
  vaiheIndex: number;
}

const ManualVaiheModal = ({ isOpen, onClose, vaiheIndex }: ManualVaiheModalProps) => {
  const { vaiheet } = usePolutStore(
    useShallow((state) => ({
      vaiheet: state.vaiheet,
    })),
  );
  const { t } = useTranslation();
  const { suunnitelmaId, paamaaraId } = useParams<PolkuQueryParams>();
  const formId = React.useId();

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
        tyyppi: vaihe?.tyyppi ?? 'KOULUTUS',
        valmis: vaihe?.valmis ?? false,
        linkit: vaihe?.linkit ?? [],
        lahde: vaihe?.lahde ?? 'KAYTTAJA',
        alkuPvm: vaihe?.alkuPvm ?? '',
        loppuPvm: vaihe?.loppuPvm ?? '',
        osaamiset: vaihe?.osaamiset ?? [],
      });
    },
  });

  const close = (isCancel = false) => {
    onClose(isCancel);
  };

  const {
    formState: { isValid },
    trigger,
  } = methods;

  useEscHandler(onClose, React.useId());

  const onSubmit: FormSubmitHandler<VaiheForm> = async ({ data }: { data: VaiheForm }) => {
    if (!data || !suunnitelmaId || !paamaaraId) {
      close();
      return;
    }

    const body = {
      ...data,
      linkit: data.linkit?.map((link) => link.url),
      osaamiset: data.osaamiset?.map((osaaminen) => osaaminen.uri),
      valmis: data.valmis,
    };

    const apiCall = data.id
      ? client.PUT('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet/{vaiheId}', {
          params: {
            path: {
              id: paamaaraId,
              suunnitelmaId,
              vaiheId: data.id,
            },
          },
          body,
        })
      : client.POST('/api/profiili/paamaarat/{id}/suunnitelmat/{suunnitelmaId}/vaiheet', {
          params: {
            path: {
              id: paamaaraId,
              suunnitelmaId,
            },
          },
          body,
        });

    const { error } = await apiCall;

    if (!error) {
      close();
    }
  };

  const wizardComponents = [DetailsStep, CompetencesStep];
  const [wizardStep, setWizardStep] = React.useState(0);
  const WizardContent = wizardComponents[wizardStep];

  const nextStep = () => {
    if (!isValid) {
      trigger();
    } else {
      setWizardStep(wizardStep < wizardComponents.length - 1 ? wizardStep + 1 : wizardStep);
    }
  };

  const previousStep = () => {
    if (!isValid) {
      trigger();
    } else {
      setWizardStep(wizardStep > 0 ? wizardStep - 1 : wizardStep);
    }
  };

  const cancel = () => {
    close(true);
  };

  return (
    <FormProvider {...methods}>
      <Modal
        open={isOpen}
        fullWidthContent={wizardStep === 1}
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
              <Button label={t('cancel')} variant="white" onClick={() => close()} />
            )}

            {wizardStep === 0 && (
              <Button
                label={t('next')}
                variant="white"
                disabled={!isValid}
                onClick={nextStep}
                icon={<JodArrowRight />}
                iconSide="right"
              />
            )}
            {wizardStep === 1 && (
              <>
                <Button label={t('previous')} variant="white" disabled={false} onClick={previousStep} />
                <Button label={t('save')} variant="white" form={formId} />
              </>
            )}
          </div>
        }
      />
    </FormProvider>
  );
};

export default ManualVaiheModal;
