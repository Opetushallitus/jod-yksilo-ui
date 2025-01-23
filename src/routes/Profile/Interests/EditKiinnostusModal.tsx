import { client } from '@/api/client';
import { components } from '@/api/schema';
import { OsaaminenValue, OsaamisSuosittelija } from '@/components';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '@jod/design-system';
import React from 'react';
import { Controller, Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router';
import { z } from 'zod';

interface EditKiinnostusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KiinnostusForm {
  description: string;
  kiinnostukset: OsaaminenValue[];
}

const EditInterestModal = ({ isOpen, onClose }: EditKiinnostusModalProps) => {
  const { t } = useTranslation();
  const data = (useLoaderData() as components['schemas']['OsaaminenDto'][]) ?? [];

  const formId = React.useId();
  const methods = useForm<KiinnostusForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        description: z.string(),
        kiinnostukset: z.array(
          z.object({
            id: z.string().min(1),
          }),
        ),
      }),
    ),
    defaultValues: async () => {
      return Promise.resolve({
        description: '',
        kiinnostukset: data.map((x) => ({
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

  const onSubmit: FormSubmitHandler<KiinnostusForm> = async ({ data }: { data: KiinnostusForm }) => {
    await client.PUT('/api/profiili/kiinnostukset/osaamiset', {
      body: data.kiinnostukset.map((kiinnostus) => kiinnostus.id),
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
            <h2 className="mb-2 text-heading-3 text-black sm:text-heading-2">
              {t('profile.interests.edit-interests')}
            </h2>
            <Controller
              control={methods.control}
              name="kiinnostukset"
              render={({ field: { onChange, value } }) => (
                <OsaamisSuosittelija onChange={onChange} value={value} sourceType="KIINNOSTUS" mode="kiinnostukset" />
              )}
            />
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-row justify-end gap-5">
          <Button label={t('cancel')} variant="white" onClick={onClose} />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
        </div>
      }
    />
  );
};

export default EditInterestModal;
