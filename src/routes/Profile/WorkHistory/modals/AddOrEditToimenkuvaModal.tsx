import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError, OsaamisSuosittelija, TouchedFormError } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { DatePickerTranslations, getDatePickerTranslations } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ConfirmDialog, Datepicker, InputField, Modal, WizardProgress } from '@jod/design-system';
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
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(toimenkuvaId ? 'work-history.edit-job-description' : 'work-history.add-new-job-description')}
      </h2>
      <div className="mb-6 flex flex-col">
        <InputField
          label={t('work-history.job-description')}
          {...register(`nimi.${language}` as const)}
          placeholder={t('profile.work-history.modals.job-description-placeholder')}
          help={t('profile.work-history.modals.job-description-help')}
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

const OsaamisetStep = ({ toimenkuvaId }: { toimenkuvaId?: string }) => {
  const { t } = useTranslation();
  const { control } = useFormContext<ToimenkuvaForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(toimenkuvaId ? 'profile.competences.edit' : 'work-history.identify-competences')}
      </h2>
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
          alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
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

  const onSubmit: FormSubmitHandler<ToimenkuvaForm> = async ({ data }: { data: ToimenkuvaForm }) => {
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
    onClose();
  };

  const deleteToimenkuva = async () => {
    await client.DELETE(`${TOIMENKUVAT_API_PATH}/{toimenkuvaId}`, {
      params: { path: { id, toimenkuvaId: toimenkuvaId! } },
    });
    onClose();
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      confirmBeforeClose={{
        translations: {
          title: t('confirm-modal-close.title'),
          description: t('confirm-modal-close.description'),
          noLabel: t('confirm-modal-close.no'),
          yesLabel: t('confirm-modal-close.yes'),
        },
      }}
      renderFooter={(onCloseClick) => (
        <div className="flex flex-row justify-between">
          <div>
            {toimenkuvaId && (
              <ConfirmDialog
                title={t('work-history.delete-job-description')}
                onConfirm={() => void deleteToimenkuva()}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="destructive"
                description={t('work-history.confirm-delete-job-description')}
              >
                {(showDialog: () => void) => (
                  <Button variant="white-delete" label={`${t('delete')}`} onClick={showDialog} />
                )}
              </ConfirmDialog>
            )}
          </div>
          <div className="flex flex-row justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={onCloseClick} />
            {!isFirstStep && (
              <Button label={t('previous')} variant="white" disabled={!isValid} onClick={previousStep} />
            )}
            {!isLastStep && (
              <Button label={t('next')} variant="white" disabled={isLastStep || !isValid} onClick={nextStep} />
            )}
            {isLastStep && <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />}
          </div>
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
            steps={stepComponents.length}
            currentStep={step + 1}
          />
        </div>
        <div className="order-2 sm:order-1 col-span-1 sm:col-span-2">
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
        </div>
      </div>
    </Modal>
  );
};

export default AddOrEditToimenkuvaModal;
