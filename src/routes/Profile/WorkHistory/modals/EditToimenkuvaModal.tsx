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

interface EditToimenkuvaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tyopaikkaId: string;
  toimenkuvaId: string;
}

interface ToimenkuvaForm {
  id: string;
  nimi: string;
  kuvaus: string;
  alkuPvm: string;
  loppuPvm: string;
  osaamiset: { id: string; nimi: string }[];
}

const MainStep = () => {
  const { t } = useTranslation();
  const { register, control } = useFormContext<ToimenkuvaForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t('work-history.edit-job-description')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('work-history.job-description')}
          {...register('nimi')}
          placeholder="Lorem ipsum dolor sit amet"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('work-history.started')} {...field} placeholder={t('date-placeholder')} />
            )}
            name="alkuPvm"
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('work-history.ended')} {...field} placeholder={t('date-or-continues-placeholder')} />
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
  const { control } = useFormContext<ToimenkuvaForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">{t('work-history.edit-competences')}</h2>
      <div className="mb-6">
        <InputField
          label={t('work-history.edit-competences')}
          value={description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          placeholder="Lorem ipsum dolor sit amet"
        />
      </div>

      <Controller
        control={control}
        name="osaamiset"
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija description={debouncedDescription} onChange={onChange} value={value} />
        )}
      />
    </>
  );
};

const EditToimenkuvaModal = ({ isOpen, onClose, tyopaikkaId: id, toimenkuvaId }: EditToimenkuvaModalProps) => {
  const deleteKoulutukset = async () => {
    await client.DELETE('/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}', {
      params: { path: { id, toimenkuvaId } },
    });

    onClose();
  };

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

  const methods = useForm<ToimenkuvaForm>({
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
      const { data: osaamiset } = await client.GET('/api/profiili/osaamiset');
      const { data: toimenkuvat } = await client.GET('/api/profiili/tyopaikat/{id}/toimenkuvat', {
        params: {
          path: { id },
        },
      });

      const toimenkuva = toimenkuvat?.find((tk) => tk.id === toimenkuvaId);

      return {
        id: toimenkuva?.id ?? '',
        nimi: toimenkuva?.nimi?.[language] ?? '',
        kuvaus: toimenkuva?.kuvaus?.[language] ?? '',
        alkuPvm: toimenkuva?.alkuPvm ?? '',
        loppuPvm: toimenkuva?.loppuPvm ?? '',
        osaamiset:
          toimenkuva?.osaamiset?.map((osaaminenId) => ({
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

  const onSubmit: FormSubmitHandler<ToimenkuvaForm> = async ({ data }: { data: ToimenkuvaForm }) => {
    const params = {
      params: {
        path: {
          id,
          toimenkuvaId,
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
    };
    await client.PATCH('/api/profiili/tyopaikat/{id}/toimenkuvat/{toimenkuvaId}', params);
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
        <div className="flex flex-row justify-end gap-5">
          <ConfirmDialog
            title={t('work-history.delete-work-history')}
            onConfirm={() => void deleteKoulutukset()}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            variant="destructive"
            description={t('work-history.confirm-delete-work-history')}
          >
            {(showDialog: () => void) => (
              <Button variant="white-delete" label={`${t('delete')}`} onClick={showDialog} />
            )}
          </ConfirmDialog>
          <Button label={t('cancel')} variant="white" onClick={onClose} />
          <Button label={t('previous')} variant="white" disabled={isFirstStep} onClick={previousStep} />
          <Button label={t('next')} variant="white" disabled={isLastStep || !isValid} onClick={nextStep} />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
        </div>
      }
    />
  );
};

export default EditToimenkuvaModal;
