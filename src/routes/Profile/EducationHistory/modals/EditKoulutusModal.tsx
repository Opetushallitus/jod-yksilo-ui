import { client } from '@/api/client';
import { OsaamisSuosittelija } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useDebounceState } from '@/hooks/useDebounceState';
import { type KoulutusForm } from '@/routes/Profile/EducationHistory/EducationHistoryWizard/utils';
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

interface EditKoulutusModalProps {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<void>>;
  koulutusId: string;
}

const MainStep = () => {
  const { t } = useTranslation();
  const { register, control } = useFormContext<KoulutusForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t('education-history.edit-education-or-degree')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('education-history.degree-or-course')}
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
            name={'alkuPvm'}
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('work-history.ended')} {...field} placeholder={t('date-or-continues-placeholder')} />
            )}
            name={'loppuPvm'}
          />
        </div>
      </div>
    </>
  );
};

const OsaaminenStep = () => {
  const [debouncedDescription, description, setDescription] = useDebounceState('', 500);
  const { t } = useTranslation();
  const { control } = useFormContext<KoulutusForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t('education-history.edit-competences')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('education-history.educational-content')}
          value={description}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          placeholder="Lorem ipsum dolor sit amet"
        />
      </div>

      <Controller
        control={control}
        name={'osaamiset'}
        render={({ field: { onChange, value } }) => (
          <OsaamisSuosittelija description={debouncedDescription} onChange={onChange} value={value} />
        )}
      />
    </>
  );
};

const EditKoulutusModal = ({ isOpen, onClose, koulutusId }: EditKoulutusModalProps) => {
  const API_PATH = '/api/profiili/koulutuskokonaisuudet/koulutukset/{id}';

  const deleteKoulutukset = async () => {
    await client.DELETE(API_PATH, {
      headers: {
        [csrf.headerName]: csrf.token,
      },
      params: { path: { id: koulutusId } },
    });

    onClose();
  };
  const {
    t,
    i18n: { language },
  } = useTranslation();

  if (!koulutusId) {
    onClose();
  }

  const auth = useAuth();
  const csrf = auth!.csrf;
  const formId = React.useId();
  const [step, setStep] = React.useState(0);
  const steps = [MainStep, OsaaminenStep];
  const StepComponent = steps[step];

  const nextStep = () => {
    setStep(step < steps.length - 1 ? step + 1 : step);
  };
  const previousStep = () => {
    setStep(step > 0 ? step - 1 : step);
  };
  const isLastStep = step === steps.length - 1;
  const isFirstStep = step === 0;

  const methods = useForm<KoulutusForm>({
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
      const { data: koulutus } = await client.GET('/api/profiili/koulutuskokonaisuudet/koulutukset/{id}', {
        params: {
          path: { id: koulutusId },
        },
      });

      return {
        id: koulutus?.id,
        nimi: koulutus?.nimi?.[language] ?? '',
        kuvaus: koulutus?.kuvaus?.[language] ?? '',
        alkuPvm: koulutus?.alkuPvm ?? '',
        loppuPvm: koulutus?.loppuPvm,
        osaamiset:
          koulutus?.osaamiset?.map((osaaminenId) => ({
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

  const onSubmit: FormSubmitHandler<KoulutusForm> = async ({ data }: { data: KoulutusForm }) => {
    const params = {
      headers: {
        'Content-Type': 'application/json',
        [csrf.headerName]: csrf.token,
      },
      params: {
        path: {
          id: data.id!,
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
    await client.PUT(API_PATH, params);
    onClose();
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  return !isLoading ? (
    <Modal
      open={isOpen}
      progress={<WizardProgress steps={steps.length} currentStep={step + 1} />}
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
            title={t('education-history.delete-education-history')}
            onConfirm={() => void deleteKoulutukset()}
            confirmText={t('delete')}
            cancelText={t('cancel')}
            variant="destructive"
            description={t('education-history.confirm-delete-education-history')}
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
  ) : (
    <></>
  );
};

export default EditKoulutusModal;
