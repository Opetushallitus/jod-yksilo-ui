import { client } from '@/api/client';
import { OsaaminenDto } from '@/api/osaamiset';
import { OsaaminenValue, OsaamisSuosittelija } from '@/components';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { Controller, Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { z } from 'zod';

interface EditMuuOsaaminenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OsaamisetForm {
  description: string;
  osaamiset: OsaaminenValue[];
}

const EditMuuOsaaminenModal = ({ isOpen, onClose }: EditMuuOsaaminenModalProps) => {
  const { t } = useTranslation();
  const data = (useLoaderData() as { muuOsaaminen: OsaaminenDto[]; vapaateksti: string }).muuOsaaminen ?? [];

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
    await client.PUT('/api/profiili/muu-osaaminen', {
      body: data.osaamiset.map((o) => o.id),
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
            <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">{t('profile.competences.edit')}</h2>
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
          <Button label={t('cancel')} variant="white" onClick={onClose} className="whitespace-nowrap" />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} className="whitespace-nowrap" />
        </div>
      }
    />
  );
};

export default EditMuuOsaaminenModal;
