import { client } from '@/api/client';
import { OsaamisSuosittelija } from '@/components';
import { useDebounceState } from '@/hooks/useDebounceState';
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

interface EditPatevyysProps {
  isOpen: boolean;
  onClose: () => void;
  toimintoId: string;
  patevyysId: string;
}

interface PatevyysForm {
  id: string;
  nimi: string;
  kuvaus: string;
  alkuPvm: string;
  loppuPvm: string;
  osaamiset: { id: string; nimi: string }[];
}

const PATEVYYS_API_PATH = '/api/profiili/vapaa-ajan-toiminnot/{id}/patevyydet/{patevyysId}';

const MainStep = () => {
  const { t } = useTranslation();
  const { register, control } = useFormContext<PatevyysForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t('free-time-activities.edit-proficiency')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.proficiency')}
          {...register('nimi')}
          placeholder="TODO: Lorem ipsum dolor sit amet"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => <Datepicker label={t('started')} {...field} placeholder={t('date-placeholder')} />}
            name="alkuPvm"
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('ended')} {...field} placeholder={t('date-or-continues-placeholder')} />
            )}
            name="loppuPvm"
          />
        </div>
      </div>
    </>
  );
};

const OsaaminenStep = () => {
  const [debouncedDescription, description, setDescription] = useDebounceState('', 500);
  const { t } = useTranslation();
  const { control } = useFormContext<PatevyysForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t('free-time-activities.edit-competences')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('free-time-activities.edit-competences')}
          value={description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          placeholder="TODO: Lorem ipsum dolor sit amet"
        />
      </div>

      <Controller
        control={control}
        name="osaamiset"
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija
            description={debouncedDescription}
            onChange={onChange}
            value={value}
            sourceType="PATEVYYS"
          />
        )}
      />
    </>
  );
};

export const EditPatevyysModal = ({ isOpen, onClose, toimintoId: id, patevyysId }: EditPatevyysProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  if (!id) {
    onClose();
  }

  const formId = React.useId();
  const [step, setStep] = React.useState(0);
  const stepComponents = [MainStep, OsaaminenStep];
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
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          id: z.string(),
          nimi: z.string().min(1),
          kuvaus: z.string().min(1).or(z.literal('')),
          alkuPvm: z.string().date(),
          loppuPvm: z.string().date().optional().or(z.literal('')),
          osaamiset: z.array(
            z.object({
              id: z.string().min(1),
            }),
          ),
        })
        .refine((data) => !data.loppuPvm || data.alkuPvm <= data.loppuPvm),
    ),
    defaultValues: async () => {
      const [{ data: osaamiset }, { data: patevyys }] = await Promise.all([
        client.GET('/api/profiili/osaamiset'),
        client.GET(PATEVYYS_API_PATH, {
          params: {
            path: { id, patevyysId },
          },
        }),
      ]);

      return {
        id: patevyys?.id ?? '',
        nimi: patevyys?.nimi?.[language] ?? '',
        kuvaus: patevyys?.kuvaus?.[language] ?? '',
        alkuPvm: patevyys?.alkuPvm ?? '',
        loppuPvm: patevyys?.loppuPvm ?? '',
        osaamiset:
          patevyys?.osaamiset?.map((osaaminenId) => ({
            id: osaaminenId,
            nimi: osaamiset?.find((o) => o.osaaminen?.uri === osaaminenId)?.osaaminen?.nimi?.[language] ?? '',
          })) ?? [],
      };
    },
  });
  const trigger = methods.trigger;
  const { isLoading, isValid } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<PatevyysForm> = async ({ data }: { data: PatevyysForm }) => {
    await client.PUT(PATEVYYS_API_PATH, {
      params: {
        path: {
          id,
          patevyysId,
        },
      },
      body: {
        id: data.id,
        nimi: {
          [language]: data.nimi,
        },
        alkuPvm: data.alkuPvm,
        loppuPvm: data.loppuPvm,
        osaamiset: data.osaamiset.map((o) => o.id),
      },
    });

    onClose();
  };

  const deletePatevyys = async () => {
    await client.DELETE(PATEVYYS_API_PATH, {
      params: { path: { id, patevyysId } },
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
      progress={<WizardProgress steps={stepComponents.length} currentStep={step + 1} />}
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
        <div className="flex flex-row justify-between">
          <div>
            <ConfirmDialog
              title={t('free-time-activities.delete-proficiency')}
              onConfirm={() => void deletePatevyys()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('free-time-activities.confirm-delete-proficiency')}
            >
              {(showDialog: () => void) => (
                <Button variant="white-delete" label={`${t('delete')}`} onClick={showDialog} />
              )}
            </ConfirmDialog>
          </div>
          <div className="flex flex-row justify-between gap-5">
            <Button label={t('cancel')} variant="white" onClick={onClose} />
            {!isFirstStep && (
              <Button label={t('previous')} variant="white" disabled={!isValid} onClick={previousStep} />
            )}
            {!isLastStep && (
              <Button label={t('next')} variant="white" disabled={isLastStep || !isValid} onClick={nextStep} />
            )}
            {isLastStep && <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />}
          </div>
        </div>
      }
    />
  );
};
