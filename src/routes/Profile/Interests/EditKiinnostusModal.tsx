import { client } from '@/api/client';
import type { components } from '@/api/schema';
import { type OsaaminenValue, OsaamisSuosittelija } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries } from '@jod/design-system';
import { JodCheckmark } from '@jod/design-system/icons';
import React from 'react';
import { Controller, Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';

interface EditKiinnostusModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: components['schemas']['OsaaminenDto'][];
}

interface KiinnostusForm {
  description: string;
  kiinnostukset: OsaaminenValue[];
}

const EditInterestModal = ({ isOpen, onClose, data = [] }: EditKiinnostusModalProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const revalidator = useRevalidator();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formId = React.useId();
  useEscHandler(onClose, formId);

  const methods = useForm<KiinnostusForm>({
    mode: 'onBlur',
    resolver: zodResolver(
      z.object({
        description: z.string(),
        kiinnostukset: z.array(
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
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.PUT('/api/profiili/kiinnostukset/osaamiset', {
        body: data.kiinnostukset.map((kiinnostus) => kiinnostus.id),
      });
      await revalidator.revalidate();
      setIsSubmitting(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  const headerText = React.useMemo(() => {
    return data.length > 0 ? t('profile.interests.edit-interests') : t('profile.interests.add-interests');
  }, [data, t]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={isOpen}
      topSlot={<ModalHeader text={headerText} testId="edit-interests-title" />}
      className="sm:!h-full"
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
            testId="interests-cancel"
            size={sm ? 'lg' : 'sm'}
          />
          <Button
            form={formId}
            label={t('save')}
            icon={sm ? undefined : <JodCheckmark />}
            variant="accent"
            disabled={!isValid}
            className="whitespace-nowrap"
            testId="interests-save"
            size={sm ? 'lg' : 'sm'}
          />
        </div>
      }
    />
  );
};

export default EditInterestModal;
