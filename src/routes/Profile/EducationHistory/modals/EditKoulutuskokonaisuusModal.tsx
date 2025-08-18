import { client } from '@/api/client';
import { components } from '@/api/schema';
import { FormError } from '@/components';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Modal } from '@jod/design-system';
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
  id?: components['schemas']['TyopaikkaDto']['id'];
  nimi: components['schemas']['LokalisoituTeksti'];
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
  useEscHandler(onClose, formId);
  const methods = useForm<KoulutuskokonaisuusForm>({
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
      const { data: koulutus } = await client.GET(KOULUTUSKOKONAISUUS_API_PATH, {
        params: { path: { id } },
      });
      return {
        id: koulutus?.id,
        nimi: koulutus?.nimi ?? {},
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading, errors } = useFormState({
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
        nimi: data.nimi,
      },
    });
    onClose();
  };

  const { showDialog } = useModal();

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
              label={t('education-history.educational-institution-or-education-provider')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.education-history.modals.workplace-placeholder')}
            />
            <FormError name={`nimi.${language}`} errors={errors} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1">
          <div className="flex flex-row gap-5">
            <Button
              variant="white-delete"
              label={`${t('education-history.delete-education-history')}`}
              onClick={() => {
                showDialog({
                  title: t('education-history.delete-education-history'),
                  onConfirm: deleteKoulutuskokonaisuus,
                  description: t('education-history.confirm-delete-education-history', {
                    name: getLocalizedText(methods.getValues('nimi')),
                  }),
                });
              }}
            />
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
