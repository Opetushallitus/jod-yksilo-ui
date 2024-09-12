import { client } from '@/api/client';
import type { components } from '@/api/schema';
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
  id: components['schemas']['TyopaikkaDto']['id'];
  nimi: string;
  toimenkuvat: components['schemas']['TyopaikkaDto']['toimenkuvat'];
}

const EditTyonantajaModal = ({ isOpen, onClose, tyopaikkaId: id }: EditTyonantajaModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  const methods = useForm<TyonantajaForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        id: z.string().min(1),
        nimi: z.string().min(1),
      }),
    ),
    defaultValues: async () => {
      const tyopaikat = await client.GET('/api/profiili/tyopaikat');
      const tyopaikka =
        tyopaikat.data?.find((tp) => tp.id === id) ??
        tyopaikat.data?.find((tp) => tp.toimenkuvat?.some((tk) => tk.id === id));
      return {
        id: tyopaikka?.id,
        nimi: tyopaikka?.nimi?.[language] ?? '',
        toimenkuvat: tyopaikka?.toimenkuvat,
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<TyonantajaForm> = async ({ data }: { data: TyonantajaForm }) => {
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
        toimenkuvat: data.toimenkuvat,
      },
    };
    await client.PATCH('/api/profiili/tyopaikat/{id}', params);
    onClose();
  };

  const deleteTyopaikka = async () => {
    await client.DELETE('/api/profiili/tyopaikat/{id}', {
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
              {...methods.register('nimi')}
              placeholder="Lorem ipsum dolor sit amet"
              help="Help text"
            />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-end gap-5">
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
          <Button label={t('cancel')} variant="white" onClick={onClose} />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
        </div>
      }
    />
  );
};

export default EditTyonantajaModal;
