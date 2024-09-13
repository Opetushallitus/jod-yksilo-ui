import { client } from '@/api/client';
import type { components } from '@/api/schema';
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
  id: components['schemas']['ToimintoDto']['id'];
  nimi: string;
  patevyydet: components['schemas']['ToimintoDto']['patevyydet'];
}

export const EditVapaaAjanToimintoModal = ({ isOpen, onClose, toimintoId: id }: EditVapaaAjanToimintoProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  const methods = useForm<VapaaAjanToimintoForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        id: z.string().min(1),
        nimi: z.string().min(1),
      }),
    ),
    defaultValues: async () => {
      const toiminnot = await client.GET('/api/profiili/vapaa-ajan-toiminnot');
      const toiminto =
        toiminnot.data?.find((toiminto) => toiminto.id === id) ??
        toiminnot.data?.find((toiminto) => toiminto.patevyydet?.some((p) => p.id === id));
      return {
        id: toiminto?.id,
        nimi: toiminto?.nimi?.[language] ?? '',
        patevyydet: toiminto?.patevyydet,
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<VapaaAjanToimintoForm> = async ({ data }: { data: VapaaAjanToimintoForm }) => {
    const params = {
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
        patevyydet: data.patevyydet,
      },
    };
    await client.PUT('/api/profiili/vapaa-ajan-toiminnot/{id}', params);
    onClose();
  };

  const deleteToiminto = async () => {
    await client.DELETE('/api/profiili/vapaa-ajan-toiminnot', {
      params: { query: { ids: [id] } },
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
              {t('free-time-activities.edit-activity')}
            </h2>

            <InputField
              label={t('free-time-activities.activity-or-proficiency-description')}
              {...methods.register('nimi')}
              placeholder="Lorem ipsum dolor sit amet"
              help="Help text"
            />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between">
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
