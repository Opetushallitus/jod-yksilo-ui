import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ConfirmDialog, InputField, Modal } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface EditVapaaAjanToimintoProps {
  isOpen: boolean;
  onClose: () => void;
  toimintoId: string;
}

export interface VapaaAjanToimintoForm {
  id?: components['schemas']['ToimintoDto']['id'];
  nimi: components['schemas']['LokalisoituTeksti'];
}

const VAPAA_AJAN_TOIMINTO_API_PATH = '/api/profiili/vapaa-ajan-toiminnot/{id}';

export const EditVapaaAjanToimintoModal = ({ isOpen, onClose, toimintoId: id }: EditVapaaAjanToimintoProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  useEscHandler(onClose, formId);
  const methods = useForm<VapaaAjanToimintoForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        id: z.string().optional(),
        nimi: z
          .object({})
          .catchall(
            z
              .string()
              .trim()
              .nonempty(formErrorMessage.required())
              .max(LIMITS.TEXT_INPUT, formErrorMessage.max(LIMITS.TEXT_INPUT)),
          ),
      }),
    ),
    defaultValues: async () => {
      const { data: toiminto } = await client.GET(VAPAA_AJAN_TOIMINTO_API_PATH, {
        params: { path: { id } },
      });
      return {
        id: toiminto?.id,
        nimi: toiminto?.nimi ?? {},
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading, errors } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<VapaaAjanToimintoForm> = async ({ data }: { data: VapaaAjanToimintoForm }) => {
    await client.PUT(VAPAA_AJAN_TOIMINTO_API_PATH, {
      params: {
        path: {
          id: data.id!,
        },
      },
      body: {
        id: data.id,
        nimi: data.nimi,
      },
    });
    onClose();
  };

  const deleteToiminto = async () => {
    await client.DELETE(VAPAA_AJAN_TOIMINTO_API_PATH, {
      params: { path: { id } },
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
            <h2 className="mb-4 text-heading-3 text-black sm:mb-5 sm:text-heading-2">
              {t('free-time-activities.edit-free-time-theme')}
            </h2>

            <InputField
              label={t('free-time-activities.name-of-free-time-theme')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
            />
            <FormError name={`nimi.${language}`} errors={errors} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1">
          <div>
            <ConfirmDialog
              title={t('free-time-activities.delete-free-time-activity')}
              onConfirm={() => void deleteToiminto()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('free-time-activities.confirm-delete-free-time-activity')}
            >
              {(showDialog: () => void) => (
                <Button variant="white-delete" label={`${t('delete')}`} onClick={showDialog} />
              )}
            </ConfirmDialog>
          </div>
          <div className="flex flex-row gap-5">
            <Button label={t('cancel')} variant="white" onClick={onClose} />
            <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
          </div>
        </div>
      }
    />
  );
};
