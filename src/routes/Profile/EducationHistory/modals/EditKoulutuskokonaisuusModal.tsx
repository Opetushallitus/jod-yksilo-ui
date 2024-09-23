import { client } from '@/api/client';
import { components } from '@/api/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ConfirmDialog, InputField, Modal } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

interface EditKoulutuskokonaisuusModalProps {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<void>>;
  koulutuskokonaisuusId: string;
}

interface KoulutuskokonaisuusForm {
  id: components['schemas']['TyopaikkaDto']['id'];
  nimi: string;
}

const KOULUTUSKOKONAISUUS_API_PATH = '/api/profiili/koulutuskokonaisuudet/{id}';

const EditKoulutuskokonaisuusModal = ({
  isOpen,
  onClose,
  koulutuskokonaisuusId: id,
}: EditKoulutuskokonaisuusModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  const methods = useForm<KoulutuskokonaisuusForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        id: z.string().min(1),
        nimi: z.string().min(1),
      }),
    ),
    defaultValues: async () => {
      const { data: koulutus } = await client.GET(KOULUTUSKOKONAISUUS_API_PATH, {
        params: { path: { id } },
      });
      return {
        id: koulutus?.id,
        nimi: koulutus?.nimi?.[language] ?? '',
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<KoulutuskokonaisuusForm> = async ({ data }: { data: KoulutuskokonaisuusForm }) => {
    await client.PUT(KOULUTUSKOKONAISUUS_API_PATH, {
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
      },
    });
    onClose();
  };

  const deleteKoulutuskokonaisuus = async () => {
    await client.DELETE(KOULUTUSKOKONAISUUS_API_PATH, {
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
              {t('education-history.edit-education')}
            </h2>

            <InputField
              label={t('education-history.educational-institution')}
              {...methods.register('nimi')}
              placeholder="Lorem ipsum dolor sit amet"
              help="Help text"
            />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-5">
            <ConfirmDialog
              title={t('education-history.delete-education-history')}
              onConfirm={() => void deleteKoulutuskokonaisuus()}
              confirmText={t('delete')}
              cancelText={t('cancel')}
              variant="destructive"
              description={t('education-history.confirm-delete-education-history')}
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

export default EditKoulutuskokonaisuusModal;