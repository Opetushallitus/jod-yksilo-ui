import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError, OsaamisSuosittelija, TouchedFormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { formErrorMessage, LIMITS } from '@/constants';
import { useDatePickerTranslations } from '@/hooks/useDatePickerTranslations';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Datepicker, InputField, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight, JodCheckmark } from '@jod/design-system/icons';
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

interface AddOrEditPatevyysModalProps {
  isOpen: boolean;
  onClose: () => void;
  toimintoId: string;
  patevyysId?: string;
}

interface PatevyysForm {
  id: string;
  nimi: components['schemas']['LokalisoituTeksti'];
  kuvaus: components['schemas']['LokalisoituTeksti'];
  alkuPvm: string;
  loppuPvm?: string;
  osaamiset: {
    id: string;
    nimi: components['schemas']['LokalisoituTeksti'];
    kuvaus: components['schemas']['LokalisoituTeksti'];
  }[];
}

const PATEVYYDET_API_PATH = '/api/profiili/vapaa-ajan-toiminnot/{id}/patevyydet'; // /{patevyysId}

const MainStep = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const {
    register,
    control,
    watch,
    trigger,
    formState: { errors, touchedFields },
  } = useFormContext<PatevyysForm>();

  const datePickerTranslations = useDatePickerTranslations();

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = watch('alkuPvm');
  React.useEffect(() => {
    void trigger('loppuPvm');
  }, [alkuPvm, trigger]);

  return (
    <>
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.name-of-free-time-activity')}
          {...register(`nimi.${language}` as const)}
          placeholder={t('profile.free-time-activities.modals.name-of-free-time-activity-placeholder')}
          requiredText={t('required')}
          testId="free-time-activities-activity-input"
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
                requiredText={t('required')}
                translations={datePickerTranslations}
                testId="free-time-activities-start-date"
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
                translations={datePickerTranslations}
                testId="free-time-activities-end-date"
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

const OsaamisetStep = () => {
  const { t } = useTranslation();
  const { control } = useFormContext<PatevyysForm>();
  return (
    <>
      <p className="mb-7 text-body-sm font-arial sm:mb-9">
        {t('profile.free-time-activities.modals.competences-description')}
      </p>
      <Controller
        control={control}
        name="osaamiset"
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            onChange={onChange}
            value={value}
            sourceType="PATEVYYS"
            placeholder={t('profile.free-time-activities.modals.competences-placeholder')}
          />
        )}
      />
    </>
  );
};

export const AddOrEditPatevyysModal = ({
  isOpen,
  onClose,
  toimintoId: id,
  patevyysId,
}: AddOrEditPatevyysModalProps) => {
  const { t } = useTranslation();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const revalidator = useRevalidator();
  const { sm } = useMediaQueries();

  if (!id) {
    onClose();
  }

  const formId = React.useId();
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

  const methods = useForm<PatevyysForm>({
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
          alkuPvm: z.iso.date(formErrorMessage.date()).nonempty(formErrorMessage.required()),
          loppuPvm: z.iso.date().optional().or(z.literal('')),
          osaamiset: z.array(
            z.object({
              id: z.string().min(1),
              nimi: z.object({}).catchall(z.string()),
              kuvaus: z.object({}).catchall(z.string()),
            }),
          ),
        })
        .refine((data) => !data.loppuPvm || data.alkuPvm <= data.loppuPvm, formErrorMessage.dateRange(['loppuPvm'])),
    ),
    defaultValues: async () => {
      if (patevyysId) {
        const [{ data: osaamiset }, { data: patevyys }] = await Promise.all([
          client.GET('/api/profiili/osaamiset'),
          client.GET(`${PATEVYYDET_API_PATH}/{patevyysId}`, {
            params: {
              path: { id, patevyysId },
            },
          }),
        ]);

        return {
          id: patevyys?.id ?? '',
          nimi: patevyys?.nimi ?? {},
          kuvaus: patevyys?.kuvaus ?? {},
          alkuPvm: patevyys?.alkuPvm ?? '',
          loppuPvm: patevyys?.loppuPvm ?? '',
          osaamiset:
            patevyys?.osaamiset?.map((osaaminenId) => ({
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

  const onSubmit: FormSubmitHandler<PatevyysForm> = async ({ data }: { data: PatevyysForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      if (patevyysId) {
        await client.PUT(`${PATEVYYDET_API_PATH}/{patevyysId}`, {
          params: {
            path: {
              id,
              patevyysId,
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
        await client.POST(PATEVYYDET_API_PATH, {
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

  const deletePatevyys = async () => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.DELETE(`${PATEVYYDET_API_PATH}/{patevyysId}`, {
        params: { path: { id, patevyysId: patevyysId! } },
      });
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerText = React.useMemo(() => {
    if (isFirstStep) {
      return patevyysId ? t('free-time-activities.edit-activity') : t('free-time-activities.add-new-activity');
    }
    return patevyysId ? t('free-time-activities.edit-activity') : t('free-time-activities.identify-proficiencies');
  }, [isFirstStep, t, patevyysId]);

  const topSlot = React.useMemo(
    () => <ModalHeader text={headerText} step={step} testId="add-or-edit-patevyys-modal-header" />,
    [headerText, step],
  );

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  const { showDialog } = useModal();

  if (isLoading) {
    return <></>;
  }

  return (
    <Modal
      name={headerText}
      open={isOpen}
      fullWidthContent
      className="sm:h-full!"
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
      topSlot={topSlot}
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
            <StepComponent />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1 gap-3">
          <div>
            {patevyysId && (
              <Button
                variant="white-delete"
                label={`${t('free-time-activities.delete-proficiency')}`}
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  showDialog({
                    title: t('free-time-activities.delete-proficiency'),
                    onConfirm: deletePatevyys,
                    description: t('free-time-activities.confirm-delete-proficiency', {
                      name: getLocalizedText(methods.getValues('nimi')),
                    }),
                  });
                }}
                testId="free-time-delete"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
          <div className="flex flex-row justify-between gap-3">
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
              testId="free-time-cancel"
              size={sm ? 'lg' : 'sm'}
            />
            {!isFirstStep && (
              <Button
                label={t('previous')}
                variant="white"
                icon={sm ? undefined : <JodArrowLeft />}
                disabled={!isValid}
                onClick={previousStep}
                className="whitespace-nowrap"
                testId="free-time-previous"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {!isLastStep && (
              <Button
                label={t('next')}
                variant="accent"
                icon={sm ? undefined : <JodArrowRight />}
                iconSide={sm ? 'right' : undefined}
                disabled={!isValid}
                onClick={nextStep}
                className="whitespace-nowrap"
                testId="free-time-next"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {isLastStep && (
              <Button
                form={formId}
                label={t('save')}
                variant="accent"
                icon={sm ? undefined : <JodCheckmark />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="free-time-save"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
        </div>
      }
    />
  );
};
