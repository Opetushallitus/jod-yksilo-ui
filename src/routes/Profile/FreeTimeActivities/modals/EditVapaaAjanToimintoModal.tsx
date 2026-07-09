import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';

import { Button, InputField, Modal, useMediaQueries } from '@jod/design-system';
import { JodCheckmark } from '@jod/design-system/icons';

import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { FormError } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { ModalComponentProps, useModal } from '@/hooks/useModal';
import { getLocalizedText } from '@/utils';

interface EditVapaaAjanTeemaProps extends ModalComponentProps {
  teemaId: string;
}

export interface VapaaAjanTeemaForm {
  id?: components['schemas']['TeemaDto']['id'];
  nimi: components['schemas']['LokalisoituTeksti'];
}

const VAPAA_AJAN_TEEMA_API_PATH = '/api/profiili/vapaa-ajan-teemat/{id}';

export const EditVapaaAjanTeemaModal = ({ onClose, teemaId: id, ...rest }: EditVapaaAjanTeemaProps) => {
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
  const methods = useForm<VapaaAjanTeemaForm>({
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
      const { data: teema } = await client.GET(VAPAA_AJAN_TEEMA_API_PATH, {
        params: { path: { id } },
      });
      return {
        id: teema?.id,
        nimi: teema?.nimi ?? {},
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading, errors } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<VapaaAjanTeemaForm> = async ({ data }: { data: VapaaAjanTeemaForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.PUT(VAPAA_AJAN_TEEMA_API_PATH, {
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

  const deleteTeema = async () => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.DELETE(VAPAA_AJAN_TEEMA_API_PATH, {
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
    () => <ModalHeader text={headerText} testId="edit-vapaa-ajan-teema-modal-header" />,
    [headerText],
  );

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={t('free-time-activities.edit-free-time-theme')}
      {...rest}
      topSlot={topSlot}
      fullWidthContent
      className="h-[90vh]! sm:h-full!"
      content={
        <FormProvider {...methods}>
          <Form id={formId} onSubmit={onSubmit} className="box-content max-w-modal-content px-5 md:px-9">
            <InputField
              label={t('free-time-activities.name-of-free-time-theme')}
              {...methods.register(`nimi.${language}` as const)}
              placeholder={t('profile.free-time-activities.modals.name-of-free-time-theme-placeholder')}
              requiredText={t('common:required')}
              testId="free-time-activities-theme-input"
            />
            <FormError name={`nimi.${language}`} errors={errors} />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-1 flex-row justify-between gap-3">
          <div>
            <Button
              className="whitespace-nowrap"
              variant="white-delete"
              label={`${t('free-time-activities.delete-theme')}`}
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                showDialog({
                  title: t('free-time-activities.delete-theme'),
                  description: t('free-time-activities.confirm-delete-theme', {
                    name: getLocalizedText(methods.getValues('nimi')),
                  }),
                  onConfirm: deleteTeema,
                  variant: 'destructive',
                  confirmText: t('common:delete'),
                  cancelText: t('common:cancel'),
                  testId: 'delete-teema-dialog',
                });
              }}
              testId="free-time-delete-activity"
              size={sm ? 'lg' : 'sm'}
            />
          </div>
          <div className="flex flex-row gap-3">
            <Button
              label={t('common:cancel')}
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
      testId="edit-vapaa-ajan-teema-modal"
    />
  );
};
