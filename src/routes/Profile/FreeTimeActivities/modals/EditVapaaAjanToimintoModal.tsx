import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Modal, useMediaQueries } from '@jod/design-system';
import { JodCheckmark } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
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
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const revalidator = useRevalidator();
  const { sm } = useMediaQueries();

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
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
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
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteToiminto = async () => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.DELETE(VAPAA_AJAN_TOIMINTO_API_PATH, {
        params: { path: { id } },
      });

      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  const { showDialog } = useModal();

  const headerText = React.useMemo(() => {
    return t('free-time-activities.edit-free-time-theme');
  }, [t]);

  const topSlot = React.useMemo(
    () => <ModalHeader text={headerText} testId="edit-vapaa-ajan-toiminto-modal-header" />,
    [headerText],
  );

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={t('free-time-activities.edit-free-time-theme')}
      open={isOpen}
      topSlot={topSlot}
      fullWidthContent
      className="sm:h-full!"
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
            className="max-w-modal-content"
          >
            <InputField
              label={t('free-time-activities.name-of-free-time-theme')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
              requiredText={t('required')}
              testId="free-time-activities-theme-input"
            />
            <FormError name={`nimi.${language}`} errors={errors} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-between flex-1 gap-3">
          <div>
            <Button
              className="whitespace-nowrap"
              variant="white-delete"
              label={`${t('free-time-activities.delete-free-time-activity-button')}`}
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                showDialog({
                  title: t('free-time-activities.delete-free-time-activity'),
                  description: t('free-time-activities.confirm-delete-free-time-activity', {
                    name: getLocalizedText(methods.getValues('nimi')),
                  }),
                  onConfirm: deleteToiminto,
                  variant: 'destructive',
                  confirmText: t('delete'),
                  cancelText: t('cancel'),
                });
              }}
              testId="free-time-delete-activity"
              size={sm ? 'lg' : 'sm'}
            />
          </div>
          <div className="flex flex-row gap-3">
            <Button
              label={t('cancel')}
              variant="white"
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                onClose();
              }}
              className="whitespace-nowrap"
              testId="free-time-cancel"
              size={sm ? 'lg' : 'sm'}
            />
            <Button
              form={formId}
              label={t('save')}
              variant="accent"
              icon={sm ? undefined : <JodCheckmark />}
              disabled={!isValid}
              className="whitespace-nowrap"
              testId="free-time-save"
              size={sm ? 'lg' : 'sm'}
            />
          </div>
        </div>
      }
    />
  );
};
