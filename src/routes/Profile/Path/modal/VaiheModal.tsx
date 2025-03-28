import { client } from '@/api/client';
import { formErrorMessage, LIMITS } from '@/constants';
import { usePolutStore } from '@/stores/usePolutStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ConfirmDialog, Modal, WizardProgress } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { z } from 'zod';
import { useShallow } from 'zustand/shallow';
import { VAIHE_TYYPIT, type PolkuQueryParams, type VaiheForm } from '../utils';
import CompetencesStep from './CompetencesStep';
import DetailsStep from './DetailsStep';

interface VaiheModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
  vaiheIndex: number;
}

const VaiheModal = ({ isOpen, onClose, vaiheIndex }: VaiheModalProps) => {
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
      z
        .object({
          id: z.string().optional(),
          nimi: z
            .object({})
            .catchall(
              z
                .string()
                .trim()
                .nonempty(formErrorMessage.required())
                .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
            ),
          kuvaus: z
            .object({})
            .catchall(z.string().max(LIMITS.TEXTAREA, formErrorMessage.max(LIMITS.TEXTAREA)))
            .optional(),
          tyyppi: z.enum(VAIHE_TYYPIT),
          valmis: z.boolean(),
          linkit: z.array(
            z.object({
              url: z.string().url(formErrorMessage.url()),
            }),
          ),
          alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
          loppuPvm: z.string().date(formErrorMessage.date()).or(z.literal('')),
          osaamiset: z.array(
            z.object({
              uri: z.string().min(1),
              nimi: z.object({}).catchall(z.string()),
              kuvaus: z.object({}).catchall(z.string()),
            }),
          ),
        })
        .refine((data) => !data.loppuPvm || data.alkuPvm <= data.loppuPvm, formErrorMessage.dateRange(['loppuPvm'])),
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
        onClose={close}
        renderFooter={(onCloseClick) => (
          <div className="flex flex-row justify-end gap-5">
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
              <Button label={t('cancel')} variant="white" onClick={onCloseClick} />
            )}

            {wizardStep === 0 && <Button label={t('next')} variant="white" disabled={!isValid} onClick={nextStep} />}
            {wizardStep === 1 && (
              <>
                <Button label={t('previous')} variant="white" disabled={false} onClick={previousStep} />
                <Button label={t('save')} variant="white" form={formId} />
              </>
            )}
          </div>
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="order-1 sm:order-2 col-span-1 justify-items-end">
            <WizardProgress
              labelText={t('wizard.label')}
              stepText={t('wizard.step')}
              completedText={t('wizard.completed')}
              currentText={t('wizard.current')}
              steps={wizardComponents.length}
              currentStep={wizardStep + 1}
            />
          </div>
          <div className="order-2 sm:order-1 col-span-1 sm:col-span-2">
            <Form id={formId} onSubmit={onSubmit}>
              <WizardContent vaiheIndex={vaiheIndex} />
            </Form>
          </div>
        </div>
      </Modal>
    </FormProvider>
  );
};

export default VaiheModal;
