import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError, OsaamisSuosittelija, TouchedFormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import { type DatePickerTranslations, getDatePickerTranslations, getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Datepicker, InputField, Modal, WizardProgress } from '@jod/design-system';
import React from 'react';
import {
  Controller,
  Form,
  FormProvider,
  FormSubmitHandler,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';

interface AddOrEditKoulutusModalProps {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<void>>;
  koulutuskokonaisuusId: string;
  koulutusId?: string;
}

interface KoulutusForm {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  alkuPvm?: string;
  loppuPvm?: string;
  osaamiset: {
    id: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
  }[];
}

const KOULUTUKSET_API_PATH = '/api/profiili/koulutuskokonaisuudet/{id}/koulutukset';

const MainStep = ({ koulutusId }: { koulutusId?: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    register,
    control,
    trigger,
    watch,
    formState: { errors, touchedFields },
  } = useFormContext<KoulutusForm>();

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = watch('alkuPvm');
  React.useEffect(() => {
    void trigger('loppuPvm');
  }, [alkuPvm, trigger]);

  return (
    <>
      <ModalHeader
        text={
          koulutusId ? t('education-history.edit-degree-or-education') : t('education-history.add-studies-to-education')
        }
      />
      <div className="mb-6">
        <InputField
          label={t('education-history.name-of-degree-or-education')}
          {...register(`nimi.${language}` as const)}
          placeholder={t('profile.education-history.modals.job-description-placeholder')}
          requiredText={t('required')}
        />
        <FormError name={`nimi.${language}`} errors={errors} />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                placeholder={t('date-placeholder')}
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
              />
            )}
            name="alkuPvm"
          />
          <TouchedFormError touchedFields={touchedFields} fieldName="alkuPvm" errors={errors} />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker
                label={t('ended')}
                {...field}
                placeholder={t('date-or-continues-placeholder')}
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
              />
            )}
            name="loppuPvm"
          />
          <FormError name="loppuPvm" errors={errors} />
        </div>
      </div>
    </>
  );
};

const OsaamisetStep = ({ koulutusId }: { koulutusId?: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<KoulutusForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(koulutusId ? 'profile.competences.edit' : 'education-history.identify-competences')}
      </h2>
      <p className="mb-7 text-body-sm font-arial sm:mb-9">
        {t('profile.education-history.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name={'osaamiset'}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija onChange={onChange} value={value} sourceType="KOULUTUS" />
        )}
      />
    </>
  );
};

const AddOrEditKoulutusModal = ({
  isOpen,
  onClose,
  koulutuskokonaisuusId: id,
  koulutusId,
}: AddOrEditKoulutusModalProps) => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();

  if (!id) {
    onClose();
  }

  const formId = React.useId();
  const { showDialog } = useModal();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  useEscHandler(onClose, formId);
  const [step, setStep] = React.useState(0);
  const stepComponents = [MainStep, OsaamisetStep];
  const StepComponent = stepComponents[step];

  const nextStep = () => {
    if (isSubmitting) {
      return;
    }
    setStep(step < stepComponents.length - 1 ? step + 1 : step);
  };
  const previousStep = () => {
    if (isSubmitting) {
      return;
    }
    setStep(step > 0 ? step - 1 : step);
  };
  const isLastStep = step === stepComponents.length - 1;
  const isFirstStep = step === 0;

  const methods = useForm<KoulutusForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z
        .object({
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
          kuvaus: z.object({}).catchall(z.string().min(1).or(z.literal(''))),
          // eslint-disable-next-line sonarjs/deprecation
          alkuPvm: z.string().date(formErrorMessage.date()).optional().or(z.literal('')),
          // eslint-disable-next-line sonarjs/deprecation
          loppuPvm: z.string().date().optional().or(z.literal('')),
          osaamiset: z.array(
            z.object({
              id: z.string().min(1),
              nimi: z.object({}).catchall(z.string()),
              kuvaus: z.object({}).catchall(z.string()),
            }),
          ),
        })
        .refine(
          (data) => (data.alkuPvm && data.loppuPvm ? data.alkuPvm <= data.loppuPvm : true),
          formErrorMessage.dateRange(['loppuPvm']),
        ),
    ),
    defaultValues: async () => {
      if (koulutusId) {
        const [{ data: osaamiset }, { data: koulutus }] = await Promise.all([
          client.GET('/api/profiili/osaamiset'),
          client.GET(`${KOULUTUKSET_API_PATH}/{koulutusId}`, {
            params: {
              path: { id, koulutusId },
            },
          }),
        ]);

        return {
          id: koulutus?.id ?? '',
          nimi: koulutus?.nimi ?? {},
          kuvaus: koulutus?.kuvaus ?? {},
          alkuPvm: koulutus?.alkuPvm ?? '',
          loppuPvm: koulutus?.loppuPvm ?? '',
          osaamiset:
            koulutus?.osaamiset?.map((osaaminenId) => ({
              id: osaaminenId,
              nimi: osaamiset?.find((o) => o.osaaminen?.uri === osaaminenId)?.osaaminen?.nimi ?? {},
              kuvaus: osaamiset?.find((o) => o.osaaminen?.uri === osaaminenId)?.osaaminen?.kuvaus ?? {},
            })) ?? [],
        };
      } else {
        return {
          id: '',
          nimi: {},
          kuvaus: {},
          alkuPvm: '',
          loppuPvm: '',
          osaamiset: [],
        };
      }
    },
  });
  const trigger = methods.trigger;
  const { isLoading, isValid } = useFormState({
    control: methods.control,
  });

  React.useEffect(() => {
    void trigger();
  }, [id, trigger]);

  const onSubmit: FormSubmitHandler<KoulutusForm> = async ({ data }: { data: KoulutusForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      if (koulutusId) {
        await client.PUT(`${KOULUTUKSET_API_PATH}/{koulutusId}`, {
          params: {
            path: {
              id,
              koulutusId,
            },
          },
          body: {
            id: data.id,
            nimi: data.nimi,
            alkuPvm: data.alkuPvm,
            loppuPvm: data.loppuPvm,
            osaamiset: data.osaamiset.map((o) => o.id),
          },
        });
      } else {
        await client.POST(KOULUTUKSET_API_PATH, {
          params: { path: { id } },
          body: {
            nimi: data.nimi,
            alkuPvm: data.alkuPvm,
            loppuPvm: data.loppuPvm,
            osaamiset: data.osaamiset.map((o) => o.id),
          },
        });
      }
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteKoulutus = async () => {
    if (isSubmitting) {
      return;
    }
    await client.DELETE(`${KOULUTUKSET_API_PATH}/{koulutusId}`, {
      params: { path: { id, koulutusId: koulutusId! } },
    });
    await revalidator.revalidate();
    onClose();
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  const title = koulutusId
    ? t('education-history.edit-degree-or-education')
    : t('education-history.add-studies-to-education');

  return !isLoading ? (
    <Modal
      name={title}
      open={isOpen}
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={stepComponents.length}
          currentStep={step + 1}
        />
      }
      content={
        <FormProvider {...methods}>
          <Form
            id={formId}
            onSubmit={onSubmit}
            onKeyDown={(event) => {
              // Prevent form submission on Enter
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
          >
            <StepComponent koulutusId={koulutusId} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1">
          <div>
            {koulutusId && (
              <Button
                variant="white-delete"
                className="whitespace-nowrap"
                label={`${t('education-history.delete-degree')}`}
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  showDialog({
                    title: t('education-history.delete-degree'),
                    onConfirm: deleteKoulutus,
                    description: t('education-history.confirm-delete-degree', {
                      name: getLocalizedText(methods.getValues('nimi')),
                    }),
                  });
                }}
                data-testid="education-history-delete"
              />
            )}
          </div>
          <div className="flex flex-row justify-between gap-5">
            <Button
              label={t('cancel')}
              variant="white"
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                onClose();
              }}
              className="whitespace-nowrap"
              data-testid="education-history-cancel"
            />
            {!isFirstStep && (
              <Button
                label={t('previous')}
                variant="white"
                disabled={!isValid}
                onClick={previousStep}
                className="whitespace-nowrap"
                data-testid="education-history-previous"
              />
            )}
            {!isLastStep && (
              <Button
                label={t('next')}
                variant="white"
                disabled={isLastStep || !isValid}
                onClick={nextStep}
                className="whitespace-nowrap"
                data-testid="education-history-next"
              />
            )}
            {isLastStep && (
              <Button
                form={formId}
                label={t('save')}
                variant="white"
                disabled={!isValid}
                className="whitespace-nowrap"
                data-testid="education-history-save"
              />
            )}
          </div>
        </div>
      }
    />
  ) : (
    <></>
  );
};

export default AddOrEditKoulutusModal;
