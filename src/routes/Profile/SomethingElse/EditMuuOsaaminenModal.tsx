import { client } from '@/api/client';
import type { OsaaminenDto } from '@/api/osaamiset';
import { type OsaaminenValue, OsaamisSuosittelija } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { Controller, Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';

interface EditMuuOsaaminenModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OsaaminenDto[];
}

interface OsaamisetForm {
  description: string;
  osaamiset: OsaaminenValue[];
}

const EditMuuOsaaminenModal = ({ isOpen, onClose, data }: EditMuuOsaaminenModalProps) => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formId = React.useId();
  useEscHandler(onClose, formId);

  const methods = useForm<OsaamisetForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        description: z.string(),
        osaamiset: z.array(
          z.object({
            id: z.string().min(1),
            nimi: z.object({}).catchall(z.string()),
            kuvaus: z.object({}).catchall(z.string()),
          }),
        ),
      }),
    ),
    defaultValues: async () => {
      return Promise.resolve({
        description: '',
        osaamiset: data.map((x) => ({
          id: x.uri,
          nimi: x.nimi,
          kuvaus: x.kuvaus,
        })),
      });
    },
  });
  const trigger = methods.trigger;

  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<OsaamisetForm> = async ({ data }: { data: OsaamisetForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.PUT('/api/profiili/muu-osaaminen', {
        body: data.osaamiset.map((o) => o.id),
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

  if (isLoading) {
    return null;
  }

  const headerText = t('profile.competences.edit');

  return (
    <Modal
      name={headerText}
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
            <ModalHeader text={headerText} testId="edit-other-competences" />
            <Controller
              control={methods.control}
              name="osaamiset"
              render={({ field: { onChange, value } }) => (
                <OsaamisSuosittelija onChange={onChange} value={value} sourceType="MUU_OSAAMINEN" />
              )}
            />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-end gap-5 flex-1">
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
          />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} className="whitespace-nowrap" />
        </div>
      }
    />
  );
};

export default EditMuuOsaaminenModal;
