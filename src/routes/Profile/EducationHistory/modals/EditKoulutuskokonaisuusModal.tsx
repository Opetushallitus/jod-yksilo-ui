import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
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
  const { showDialog } = useModal();

  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteKoulutuskokonaisuus = async () => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.DELETE(KOULUTUSKOKONAISUUS_API_PATH, {
        params: { path: { id } },
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={t('education-history.edit-education')}
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
            <ModalHeader text={t('education-history.edit-education')} testId="edit-education-modal-title" />
            <InputField
              label={t('education-history.educational-institution-or-education-provider')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.education-history.modals.workplace-placeholder')}
              requiredText={t('required')}
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
                if (isSubmitting) {
                  return;
                }
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
            <Button
              label={t('cancel')}
              variant="white"
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                onClose();
              }}
            />
            <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
          </div>
        </div>
      }
    />
  );
};

export default EditKoulutuskokonaisuusModal;
