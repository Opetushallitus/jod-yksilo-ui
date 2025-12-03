import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FORM_SCHEMA, formErrorMessage } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import type { MahdollisuusTyyppi } from '@/routes/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';
import { BasicInfoStep } from './BasicInfoStep';
import { DataToShareStep } from './DataToShareStep';
import type { ShareLinkForm } from './types';

interface NewShareLinkModalProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
  id?: string;
}
export const NewShareLinkModal = ({ isOpen, onClose, id }: NewShareLinkModalProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const revalidator = useRevalidator();
  const formId = React.useId();
  useEscHandler(() => onClose(true), formId);

  const methods = useForm<ShareLinkForm>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(
      z.object({
        id: z.string().optional(),
        nimi: z.string().optional(),
        muistiinpano: z.string().optional(),
        voimassaAsti: FORM_SCHEMA.pvm.nonoptional(formErrorMessage.required()).refine((val) => {
          if (!val) {
            return false;
          }
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const inputDate = new Date(val);
          inputDate.setHours(0, 0, 0, 0);
          return inputDate >= today;
        }, formErrorMessage.dateInThePast()),
        nimiJaettu: z.boolean().optional(),
        emailJaettu: z.boolean().optional(),
        kotikuntaJaettu: z.boolean().optional(),
        syntymavuosiJaettu: z.boolean().optional(),
        muuOsaaminenJaettu: z.boolean().optional(),
        kiinnostuksetJaettu: z.boolean().optional(),
        jaetutTyopaikat: z.array(z.object({ itemId: z.string() })),
        jaetutKoulutukset: z.array(z.object({ itemId: z.string() })),
        jaetutToiminnot: z.array(z.object({ itemId: z.string() })),
        jaetutSuosikit: z.array(z.object({ itemId: z.string() })),
        jaetutTavoitteet: z.array(z.object({ itemId: z.string() })),
      }),
    ),
    defaultValues: async () => {
      if (id) {
        const { data } = await client.GET(`/api/profiili/jakolinkki/{id}`, {
          params: { path: { id } },
        });
        return {
          id: data?.id,
          nimi: data?.nimi || '',
          muistiinpano: data?.muistiinpano || '',
          voimassaAsti: data?.voimassaAsti ? new Date(data?.voimassaAsti).toISOString().split('T')[0] : '',
          nimiJaettu: data?.nimiJaettu,
          emailJaettu: data?.emailJaettu,
          kotikuntaJaettu: data?.kotikuntaJaettu,
          syntymavuosiJaettu: data?.syntymavuosiJaettu,
          muuOsaaminenJaettu: data?.muuOsaaminenJaettu,
          kiinnostuksetJaettu: data?.kiinnostuksetJaettu,
          jaetutTyopaikat: data?.jaetutTyopaikat?.map((itemId) => ({ itemId })) ?? [],
          jaetutKoulutukset: data?.jaetutKoulutukset?.map((itemId) => ({ itemId })) ?? [],
          jaetutToiminnot: data?.jaetutToiminnot?.map((itemId) => ({ itemId })) ?? [],
          jaetutSuosikit: data?.jaetutSuosikit?.map((itemId) => ({ itemId })) ?? [],
          jaetutTavoitteet: data?.jaetutTavoitteet?.map((itemId) => ({ itemId })) ?? [],
        };
      } else {
        const sixMonths = 180 * 24 * 60 * 60 * 1000;
        return {
          id: undefined,
          nimi: '',
          voimassaAsti: new Date(Date.now() + sixMonths).toISOString().split('T')[0],
          muistiinpano: '',
          nimiJaettu: false,
          emailJaettu: false,
          kotikuntaJaettu: false,
          muuOsaaminenJaettu: false,
          kiinnostuksetJaettu: false,
          jaetutTyopaikat: [],
          jaetutKoulutukset: [],
          jaetutToiminnot: [],
          jaetutSuosikit: [],
          jaetutTavoitteet: [],
        };
      }
    },
  });

  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<ShareLinkForm> = async ({ data }: { data: ShareLinkForm }) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const voimassaAstiDate = new Date(data.voimassaAsti);
      voimassaAstiDate.setHours(23, 59, 59, 999);

      const payload: components['schemas']['JakolinkkiUpdateDto'] = {
        nimi: data.nimi,
        muistiinpano: data.muistiinpano,
        voimassaAsti: voimassaAstiDate.toISOString(),
        nimiJaettu: data.nimiJaettu,
        emailJaettu: data.emailJaettu,
        kotikuntaJaettu: data.kotikuntaJaettu,
        syntymavuosiJaettu: data.syntymavuosiJaettu,
        muuOsaaminenJaettu: data.muuOsaaminenJaettu,
        kiinnostuksetJaettu: data.kiinnostuksetJaettu,
        jaetutTyopaikat: data.jaetutTyopaikat?.map((item) => item.itemId),
        jaetutKoulutukset: data.jaetutKoulutukset?.map((item) => item.itemId),
        jaetutToiminnot: data.jaetutToiminnot?.map((item) => item.itemId),
        jaetutSuosikit: data.jaetutSuosikit?.map((item) => item.itemId as MahdollisuusTyyppi),
        jaetutTavoitteet: data.jaetutTavoitteet?.map((item) => item.itemId),
      };

      if (data.id) {
        await client.PATCH('/api/profiili/jakolinkki', {
          body: { ...payload, id: data.id },
        });
      } else {
        await client.POST('/api/profiili/jakolinkki', { body: payload });
      }

      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = id ? t('preferences.share.modal.title-edit') : t('preferences.share.modal.title-add');

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={modalTitle}
      open={isOpen}
      testId="share-link-wizard"
      content={
        <FormProvider {...methods}>
          <Form
            id={formId}
            onSubmit={onSubmit}
            className="pb-2"
            onKeyDown={(event) => {
              // Prevent form submission on Enter
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
          >
            {step === 1 && <BasicInfoStep title={modalTitle} />}
            {step === 2 && <DataToShareStep title={modalTitle} />}
          </Form>
        </FormProvider>
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={2}
          currentStep={step}
        />
      }
      footer={
        <div className="flex justify-between gap-5 flex-1" data-testid="share-link-wizard-footer">
          <div className="flex gap-5 ml-auto">
            <Button onClick={() => onClose(true)} label={t('cancel')} variant="white" testId="share-link-cancel" />
            {step > 1 && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setStep(step - 1);
                }}
                label={t('previous')}
                variant="white"
                icon={sm ? undefined : <JodArrowLeft />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="share-link-previous"
              />
            )}
            {step < 2 && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setStep(step + 1);
                }}
                label={t('next')}
                variant="accent"
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="share-link-next"
              />
            )}
            {step === 2 && (
              <Button
                form={formId}
                label={t('save')}
                variant="accent"
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="share-link-save"
              />
            )}
          </div>
        </div>
      }
    />
  );
};
