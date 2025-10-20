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

interface AddOrEditToimenkuvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tyopaikkaId: string;
  toimenkuvaId?: string;
}

interface ToimenkuvaForm {
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

const TOIMENKUVAT_API_PATH = '/api/profiili/tyopaikat/{id}/toimenkuvat';

const MainStep = ({ toimenkuvaId }: { toimenkuvaId?: string }) => {
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
  } = useFormContext<ToimenkuvaForm>();

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = watch('alkuPvm');
  React.useEffect(() => {
    void trigger('loppuPvm');
  }, [alkuPvm, trigger]);
  return (
    <>
      <ModalHeader
        text={t(toimenkuvaId ? 'work-history.edit-job-description' : 'work-history.add-new-job-description')}
      />
      <div className="mb-6 flex flex-col">
        <InputField
          label={t('work-history.job-description')}
          {...register(`nimi.${language}` as const)}
          requiredText={t('required')}
          placeholder={t('profile.work-history.modals.job-description-placeholder')}
          help={t('profile.work-history.modals.job-description-help')}
        />
        <FormError name={`nimi.${language}`} errors={errors} />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            name="alkuPvm"
            render={({ field }) => (
              <Datepicker
                label={t('started')}
                {...field}
                placeholder={t('date-placeholder')}
                requiredText={t('required')}
                translations={getDatePickerTranslations(
                  t('datepicker', { returnObjects: true }) as DatePickerTranslations,
                )}
              />
            )}
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

const OsaamisetStep = ({ toimenkuvaId }: { toimenkuvaId?: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<ToimenkuvaForm>();
  return (
    <>
      <ModalHeader text={toimenkuvaId ? t('profile.competences.edit') : t('work-history.identify-competences')} />
      <p className="mb-7 text-body-sm font-arial sm:mb-9">{t('profile.work-history.modals.competences-description')}</p>
      <Controller
        control={control}
        name="osaamiset"
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija onChange={onChange} value={value} sourceType="TOIMENKUVA" />
        )}
      />
    </>
  );
};

const AddOrEditToimenkuvaModal = ({
  isOpen,
  onClose,
  tyopaikkaId: id,
  toimenkuvaId,
}: AddOrEditToimenkuvaModalProps) => {
  const { t } = useTranslation();

  if (!id) {
    onClose();
  }

  const formId = React.useId();
  useEscHandler(onClose, formId);
  const [step, setStep] = React.useState(0);
  const stepComponents = [MainStep, OsaamisetStep];
  const StepComponent = stepComponents[step];
  const revalidator = useRevalidator();

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

  const methods = useForm<ToimenkuvaForm>({
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
                .min(1, formErrorMessage.min(1))
                .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
            ),
          kuvaus: z.object({}).catchall(z.string().min(1).or(z.literal(''))),
          // eslint-disable-next-line sonarjs/deprecation
          alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
          // eslint-disable-next-line sonarjs/deprecation
          loppuPvm: z.string().date(formErrorMessage.date()).optional().or(z.literal('')),
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
      if (toimenkuvaId) {
        const [{ data: osaamiset }, { data: toimenkuva }] = await Promise.all([
          client.GET('/api/profiili/osaamiset'),
          client.GET(`${TOIMENKUVAT_API_PATH}/{toimenkuvaId}`, {
            params: {
              path: { id, toimenkuvaId },
            },
          }),
        ]);

        return {
          id: toimenkuva?.id ?? '',
          nimi: toimenkuva?.nimi ?? {},
          kuvaus: toimenkuva?.kuvaus ?? {},
          alkuPvm: toimenkuva?.alkuPvm ?? '',
          loppuPvm: toimenkuva?.loppuPvm ?? '',
          osaamiset:
            toimenkuva?.osaamiset?.map((osaaminenId) => ({
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
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit: FormSubmitHandler<ToimenkuvaForm> = async ({ data }: { data: ToimenkuvaForm }) => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    if (toimenkuvaId) {
      await client.PUT(`${TOIMENKUVAT_API_PATH}/{toimenkuvaId}`, {
        params: {
          path: {
            id,
            toimenkuvaId,
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
      await client.POST(TOIMENKUVAT_API_PATH, {
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
    setIsSubmitting(false);
    onClose();
  };

  const deleteToimenkuva = async () => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.DELETE(`${TOIMENKUVAT_API_PATH}/{toimenkuvaId}`, {
        params: { path: { id, toimenkuvaId: toimenkuvaId! } },
      });
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  const { showDialog } = useModal();

  return !isLoading ? (
    <Modal
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
            <StepComponent toimenkuvaId={toimenkuvaId} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1">
          <div>
            {toimenkuvaId && (
              <Button
                className="whitespace-nowrap"
                variant="white-delete"
                label={`${t('work-history.delete-job-description')}`}
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  showDialog({
                    title: t('work-history.delete-job-description'),
                    onConfirm: () => void deleteToimenkuva(),
                    description: t('work-history.confirm-delete-job-description', {
                      name: getLocalizedText(methods.getValues('nimi')),
                    }),
                    closeParentModal: true,
                  });
                }}
              />
            )}
          </div>
          <div className="flex flex-row justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={onClose} className="whitespace-nowrap" />
            {!isFirstStep && (
              <Button
                label={t('previous')}
                variant="white"
                disabled={!isValid}
                onClick={previousStep}
                className="whitespace-nowrap"
              />
            )}
            {!isLastStep && (
              <Button
                label={t('next')}
                variant="white"
                disabled={isLastStep || !isValid}
                onClick={nextStep}
                className="whitespace-nowrap"
              />
            )}
            {isLastStep && (
              <Button
                form={formId}
                label={t('save')}
                variant="white"
                disabled={!isValid}
                className="whitespace-nowrap"
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

export default AddOrEditToimenkuvaModal;
