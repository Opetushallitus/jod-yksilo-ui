import { client } from '@/api/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Modal } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { type KategoriaForm } from '../EducationHistoryWizard/utils';

interface EditKategoriaModalProps {
  isOpen: boolean;
  onClose: React.Dispatch<React.SetStateAction<void>>;
  kategoriaId: string;
}

const EditKategoriaModal = ({ isOpen, onClose, kategoriaId }: EditKategoriaModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  const formId = React.useId();
  const methods = useForm<KategoriaForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        id: z.string().min(1),
        nimi: z.string().min(1),
      }),
    ),
    defaultValues: async () => {
      const koulutukset = await client.GET('/api/profiili/koulutuskokonaisuudet');
      const koulutus =
        koulutukset.data?.find((koulutus) => koulutus.kategoria?.id === kategoriaId) ??
        koulutukset.data?.find((koulutus) => koulutus.koulutukset?.some((koulutus) => koulutus.id === kategoriaId));
      return {
        id: koulutus?.kategoria?.id,
        nimi: koulutus?.kategoria?.nimi?.[language] ?? '',
        kuvaus: koulutus?.kategoria?.kuvaus?.[language] ?? '',
      };
    },
  });
  const trigger = methods.trigger;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<KategoriaForm> = async ({ data }: { data: KategoriaForm }) => {
    const params = {
      body: {
        kategoria: data.nimi
          ? {
              id: data.id,
              nimi: {
                [language]: data.nimi,
              },
            }
          : undefined,
      },
    };
    await client.PUT('/api/profiili/koulutuskokonaisuudet', params);
    onClose();
  };

  React.useEffect(() => {
    void trigger();
  }, [trigger]);

  return !isLoading ? (
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
              {t('education-history.educational-institution')}
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
        <div className="flex flex-row justify-end gap-5">
          <Button label={t('cancel')} variant="white" onClick={onClose} />
          <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />
        </div>
      }
    />
  ) : (
    <></>
  );
};

export default EditKategoriaModal;
