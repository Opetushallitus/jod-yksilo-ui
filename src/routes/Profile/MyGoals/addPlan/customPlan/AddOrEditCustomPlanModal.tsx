import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { formErrorMessage, LIMITS } from '@/constants';
import { useModal } from '@/hooks/useModal';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, clamp, Modal, Spinner, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { useShallow } from 'zustand/shallow';
import CreateCustomPlanStep from './CustomPlanStep';
import SelectCompetencesStep from './SelectCompetencesStep';

export interface OmaSuunnitelmaForm {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  osaamiset: {
    uri: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
  }[];
}

interface AddOrEditCustomPlanModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
  tavoiteId: string;
  suunnitelmaId?: string;
}

const AddOrEditCustomPlanModal = ({ isOpen, onClose, tavoiteId, suunnitelmaId }: AddOrEditCustomPlanModalProps) => {
  const { t } = useTranslation();
  const { showDialog, closeActiveModal } = useModal();
  const { sm, md } = useMediaQueries();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<OmaSuunnitelmaForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        id: z.string(),
        nimi: z
          .object({})
          .catchall(
            z
              .string()
              .trim()
              .nonempty(formErrorMessage.required())
              .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
          ),
        kuvaus: z.object({}).catchall(z.string().max(500).or(z.literal(''))),
        osaamiset: z.array(
          z.object({
            uri: z.string().min(1),
            nimi: z.object({}).catchall(z.string()),
            kuvaus: z.object({}).catchall(z.string()),
          }),
        ),
      }),
    ),
    defaultValues: async () => {
      if (suunnitelmaId) {
        setIsLoading(true);
        const { data: suunnitelma } = await client.GET('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
          params: { path: { id: tavoiteId, suunnitelmaId } },
        });

        const osaamiset =
          Array.isArray(suunnitelma?.osaamiset) && suunnitelma?.osaamiset?.length > 0
            ? await osaamisetService.find(suunnitelma?.osaamiset)
            : [];

        setIsLoading(false);
        return {
          id: suunnitelma?.id ?? '',
          nimi: suunnitelma?.nimi ?? {},
          kuvaus: suunnitelma?.kuvaus ?? {},
          osaamiset:
            suunnitelma?.osaamiset?.map((uri) => ({
              uri,
              nimi: osaamiset?.find((o) => o.uri === uri)?.nimi ?? {},
              kuvaus: osaamiset?.find((o) => o.uri === uri)?.kuvaus ?? {},
            })) ?? [],
        };
      } else {
        return {
          id: '',
          nimi: {},
          kuvaus: {},
          osaamiset: [],
        };
      }
    },
  });

  const { refreshTavoitteet } = useTavoitteetStore(
    useShallow((state) => ({
      refreshTavoitteet: state.refreshTavoitteet,
    })),
  );

  const onSubmit: FormSubmitHandler<OmaSuunnitelmaForm> = async ({ data }: { data: OmaSuunnitelmaForm }) => {
    setIsSubmitting(true);
    if (!tavoiteId) {
      closeActiveModal();
      return;
    }
    const body = {
      nimi: data.nimi,
      kuvaus: data.kuvaus,
      osaamiset: data.osaamiset.map((o) => o.uri),
    };

    if (suunnitelmaId) {
      await client.PUT('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
        params: {
          path: {
            id: tavoiteId,
            suunnitelmaId,
          },
        },
        body: {
          ...body,
          id: data.id,
        },
      });
    } else {
      await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
        params: {
          path: {
            id: tavoiteId,
          },
        },
        body,
      });
    }

    await refreshTavoitteet();
    closeActiveModal();
    setIsSubmitting(false);
  };

  const wizardComponents = [CreateCustomPlanStep, SelectCompetencesStep];

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
    return t('profile.paths.step-n-details', { count: wizardStep + 1 });
  }, [t, wizardStep]);
  const formId = React.useId();
  const { isValid } = useFormState({
    control: methods.control,
  });

  const osaamiset = useWatch({ control: methods.control, name: 'osaamiset' }) ?? [];

  return (
    <Modal
      name={currentHeaderText}
      open={isOpen}
      fullWidthContent={!md || wizardStep === 1}
      topSlot={
        <h1 className="text-heading-1-mobile sm:text-heading-1">{t('profile.my-goals.add-custom-plan-header')}</h1>
      }
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
      content={
        isLoading ? (
          <div className="flex items-center justify-start h-[128px]">
            <Spinner size={64} color="accent" />
          </div>
        ) : (
          <FormProvider {...methods}>
            <Form id={formId} onSubmit={onSubmit}>
              <WizardContent />
            </Form>
          </FormProvider>
        )
      }
      footer={
        <div className="flex flex-row gap-5 flex-1 justify-end">
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

            {wizardStep === 1 && (
              <Button
                label={t('previous')}
                variant="white"
                onClick={previousStep}
                icon={sm ? undefined : <JodArrowLeft />}
                iconSide={sm ? undefined : 'left'}
              />
            )}
            {wizardStep === 0 && (
              <Button
                label={t('next')}
                variant="accent"
                onClick={() => {
                  nextStep();
                }}
                disabled={!isValid}
                icon={sm ? undefined : <JodArrowRight />}
                iconSide={sm ? undefined : 'right'}
              />
            )}
            {wizardStep === 1 && (
              <Button
                label={t('save')}
                disabled={isSubmitting || osaamiset.length === 0}
                variant="accent"
                form={formId}
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default AddOrEditCustomPlanModal;
