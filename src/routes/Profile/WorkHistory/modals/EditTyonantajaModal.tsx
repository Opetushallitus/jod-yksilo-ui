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

interface EditTyonantajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tyopaikkaId: string;
}

interface TyonantajaForm {
  id?: components['schemas']['TyopaikkaDto']['id'];
  nimi: components['schemas']['LokalisoituTeksti'];
}

const TYOPAIKKA_API_PATH = '/api/profiili/tyopaikat/{id}';

const EditTyonantajaModal = ({ isOpen, onClose, tyopaikkaId: id }: EditTyonantajaModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  useEscHandler(onClose, formId);
  const methods = useForm<TyonantajaForm>({
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
      const { data: tyopaikka } = await client.GET(TYOPAIKKA_API_PATH, { params: { path: { id } } });
      return {
        id: tyopaikka?.id,
        nimi: tyopaikka?.nimi ?? {},
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading, errors } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<TyonantajaForm> = async ({ data }: { data: TyonantajaForm }) => {
    await client.PUT(TYOPAIKKA_API_PATH, {
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

  const deleteTyopaikka = async () => {
    await client.DELETE(TYOPAIKKA_API_PATH, {
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
              {t('work-history.edit-workplace')}
            </h2>
            <InputField
              label={t('work-history.employer')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.work-history.modals.workplace-placeholder')}
              help={t('profile.work-history.modals.workplace-help')}
            />
            <FormError name={`nimi.${language}`} errors={errors} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-5">
            <ConfirmDialog
              title={t('work-history.delete-work-history')}
              onConfirm={() => void deleteTyopaikka()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('work-history.confirm-delete-work-history')}
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

export default EditTyonantajaModal;
