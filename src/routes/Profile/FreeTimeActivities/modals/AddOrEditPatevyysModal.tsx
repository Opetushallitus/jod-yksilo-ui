import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError, OsaamisSuosittelija, TouchedFormError } from '@/components';
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
const editCompetencesSlug = 'free-time-activities.edit-activity';
const MainStep = ({ patevyysId }: { patevyysId?: string }) => {
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

  // For triggering "date-range" error when "alkuPvm" is set after "loppuPvm"
  const alkuPvm = watch('alkuPvm');
  React.useEffect(() => {
    void trigger('loppuPvm');
  }, [alkuPvm, trigger]);

  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(patevyysId ? editCompetencesSlug : 'free-time-activities.add-new-activity')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.name-of-free-time-activity')}
          {...register(`nimi.${language}` as const)}
          placeholder={t('profile.free-time-activities.modals.name-of-free-time-activity-placeholder')}
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

const OsaamisetStep = ({ patevyysId }: { patevyysId?: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<PatevyysForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(patevyysId ? editCompetencesSlug : 'free-time-activities.identify-proficiencies')}
      </h2>
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
  const revalidator = useRevalidator();

  if (!id) {
    onClose();
  }

  const formId = React.useId();
  useEscHandler(onClose, formId);
  const [step, setStep] = React.useState(0);
  const stepComponents = [MainStep, OsaamisetStep];
  const StepComponent = stepComponents[step];

  const nextStep = () => {
    setStep(step < stepComponents.length - 1 ? step + 1 : step);
  };
  const previousStep = () => {
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
          alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
          loppuPvm: z.string().date().optional().or(z.literal('')),
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
  };

  const deletePatevyys = async () => {
    await client.DELETE(`${PATEVYYDET_API_PATH}/{patevyysId}`, {
      params: { path: { id, patevyysId: patevyysId! } },
    });
    await revalidator.revalidate();
    onClose();
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
            <StepComponent patevyysId={patevyysId} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1">
          <div>
            {patevyysId && (
              <Button
                variant="white-delete"
                label={`${t('free-time-activities.delete-proficiency')}`}
                onClick={() => {
                  showDialog({
                    title: t('free-time-activities.delete-proficiency'),
                    onConfirm: deletePatevyys,
                    description: t('free-time-activities.confirm-delete-proficiency', {
                      name: getLocalizedText(methods.getValues('nimi')),
                    }),
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
