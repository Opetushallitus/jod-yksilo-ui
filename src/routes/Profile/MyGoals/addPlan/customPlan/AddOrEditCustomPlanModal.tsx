import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { formErrorMessage, LIMITS } from '@/constants';
import { useModal } from '@/hooks/useModal';
import { useTavoitteetStore } from '@/stores/useTavoitteetStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, clamp, Modal, Spinner, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight, JodCheckmark } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast/headless';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { useShallow } from 'zustand/shallow';
import { addPlanStore } from '../store/addPlanStore';
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
  tavoite?: components['schemas']['TavoiteDto'] | null;
  suunnitelmaId?: string;
}

const AddOrEditCustomPlanModal = ({ isOpen, onClose, tavoite, suunnitelmaId }: AddOrEditCustomPlanModalProps) => {
  const { t, i18n } = useTranslation();
  const { showDialog, closeActiveModal } = useModal();
  const { sm, md } = useMediaQueries();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { updateEhdotukset, vaaditutOsaamiset, setTavoite } = addPlanStore(
    useShallow((state) => ({
      updateEhdotukset: state.updateEhdotukset,
      vaaditutOsaamiset: state.vaaditutOsaamiset,
      setTavoite: state.setTavoite,
    })),
  );

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
      if (vaaditutOsaamiset.length === 0 && tavoite) {
        setIsLoading(true);
        setTavoite(tavoite);
        await updateEhdotukset(i18n.language);
      }

      if (suunnitelmaId && tavoite?.id) {
        setIsLoading(true);
        const { data: suunnitelma } = await client.GET('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
          params: { path: { id: tavoite.id, suunnitelmaId } },
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
        setIsLoading(false);
        return {
          id: '',
          nimi: {},
          kuvaus: {},
          osaamiset: [],
        };
      }
    },
  });

  const refreshTavoitteet = useTavoitteetStore((state) => state.refreshTavoitteet);

  const onSubmit: FormSubmitHandler<OmaSuunnitelmaForm> = async ({ data }: { data: OmaSuunnitelmaForm }) => {
    setIsSubmitting(true);
    if (!tavoite?.id) {
      closeActiveModal();
      return;
    }
    const body = {
      nimi: data.nimi,
      kuvaus: data.kuvaus,
      osaamiset: data.osaamiset.map((o) => o.uri),
    };

    if (suunnitelmaId) {
      const { error } = await client.PUT('/api/profiili/tavoitteet/{id}/suunnitelmat/{suunnitelmaId}', {
        params: {
          path: {
            id: tavoite.id,
            suunnitelmaId,
          },
        },
        body: {
          ...body,
          id: data.id,
        },
      });
      if (error) {
        toast.error(t('profile.my-goals.edit-plan-failed'));
      } else {
        toast.success(t('profile.my-goals.edit-plan-success'));
      }
    } else {
      const { error } = await client.POST('/api/profiili/tavoitteet/{id}/suunnitelmat', {
        params: {
          path: {
            id: tavoite.id,
          },
        },
        body,
      });

      if (error) {
        toast.error(t('profile.my-goals.add-plan-failed'));
      } else {
        toast.success(t('profile.my-goals.add-plan-success'));
      }
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
      className="sm:h-full!"
      topSlot={<h1 className="text-heading-2-mobile sm:text-hero">{t('profile.my-goals.add-custom-plan-header')}</h1>}
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
        <FormProvider {...methods}>
          <Form id={formId} onSubmit={onSubmit}>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[128px]">
                <Spinner size={64} color="accent" />
              </div>
            ) : (
              <WizardContent />
            )}
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row gap-5 flex-1 justify-end">
          <div className="flex flex-row gap-5">
            <Button
              label={t('common:cancel')}
              variant="white"
              className="whitespace-nowrap"
              size={sm ? 'lg' : 'sm'}
              onClick={() => {
                showDialog({
                  title: t('common:cancel'),
                  description: t('profile.paths.cancel-confirmation-text'),
                  confirmText: t('close'),
                  cancelText: t('profile.paths.continue-editing'),
                  onConfirm: cancel,
                });
              }}
              testId="custom-plan-cancel"
            />

            {wizardStep === 1 && (
              <Button
                label={t('previous')}
                variant="white"
                className="whitespace-nowrap"
                size={sm ? 'lg' : 'sm'}
                onClick={previousStep}
                icon={sm ? undefined : <JodArrowLeft />}
                testId="custom-plan-previous"
              />
            )}
            {wizardStep === 0 && (
              <Button
                label={t('next')}
                variant="accent"
                className="whitespace-nowrap"
                size={sm ? 'lg' : 'sm'}
                icon={sm ? undefined : <JodArrowRight />}
                onClick={nextStep}
                disabled={!isValid}
                testId="custom-plan-next"
              />
            )}
            {wizardStep === 1 && (
              <Button
                form={formId}
                label={t('save')}
                variant="accent"
                className="whitespace-nowrap"
                size={sm ? 'lg' : 'sm'}
                icon={sm ? undefined : <JodCheckmark />}
                disabled={isSubmitting || osaamiset.length === 0}
                testId="custom-plan-save"
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default AddOrEditCustomPlanModal;
