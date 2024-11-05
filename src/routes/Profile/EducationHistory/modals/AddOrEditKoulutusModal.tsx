/* eslint-disable sonarjs/cognitive-complexity */
import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaamisSuosittelija } from '@/components';
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
  alkuPvm: string;
  loppuPvm: string;
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
  const { register, control } = useFormContext<KoulutusForm>();
  return (
    <>
      <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
        {t(koulutusId ? 'education-history.edit-degree' : 'education-history.add-new-degree')}
      </h2>
      <div className="mb-6">
        <InputField
          label={t('education-history.degree')}
          {...register(`nimi.${language}` as const)}
          placeholder="TODO: Lorem ipsum dolor sit amet"
        />
      </div>
      <div className="mb-6 flex grow gap-6">
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => <Datepicker label={t('started')} {...field} placeholder={t('date-placeholder')} />}
            name={'alkuPvm'}
          />
        </div>
        <div className="block w-full">
          <Controller
            control={control}
            render={({ field }) => (
              <Datepicker label={t('ended')} {...field} placeholder={t('date-or-continues-placeholder')} />
            )}
            name={'loppuPvm'}
          />
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

  const methods = useForm<KoulutusForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          id: z.string(),
          nimi: z.object({}).catchall(z.string().min(1)),
          kuvaus: z.object({}).catchall(z.string().min(1).or(z.literal(''))),
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

  const onSubmit: FormSubmitHandler<KoulutusForm> = async ({ data }: { data: KoulutusForm }) => {
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
    onClose();
  };

  const deleteKoulutus = async () => {
    await client.DELETE(`${KOULUTUKSET_API_PATH}/{koulutusId}`, {
      params: { path: { id, koulutusId: koulutusId! } },
    });
    onClose();
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  return !isLoading ? (
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
            <StepComponent koulutusId={koulutusId} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div>
            {koulutusId && (
              <ConfirmDialog
                title={t('education-history.delete-degree')}
                onConfirm={() => void deleteKoulutus()}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="destructive"
                description={t('education-history.confirm-delete-degree')}
              >
                {(showDialog: () => void) => (
                  <Button variant="white-delete" label={`${t('delete')}`} onClick={showDialog} />
                )}
              </ConfirmDialog>
            )}
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
  ) : (
    <></>
  );
};

export default AddOrEditKoulutusModal;
