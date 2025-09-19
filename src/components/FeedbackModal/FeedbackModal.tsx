import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, InputField, Modal, RadioButton, RadioButtonGroup, Textarea } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Controller, Form, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const DETAILS_MAX_LENGTH = 2048;
const MESSAGE_MAX_LENGTH = 5000;
const EMAIL_MAX_LENGTH = 320;

const Feedback = z
  .object({
    section: z.enum(['Osaamispolkuni', 'Ohjaajan osio', 'Tietopalvelu', 'Koko palvelu tai muu palaute']),
    area: z.enum(['Alatunniste', 'Kohtaanto työkalu', 'Työmahdollisuus']),
    language: z.enum(['fi', 'en', 'sv']),
    details: z.string().nonempty().max(DETAILS_MAX_LENGTH).optional(),
    type: z.enum(['Kehu', 'Kehitysehdotus', 'Moite', 'Tekninen vika tai ongelma']),
    message: z.string().nonempty().max(MESSAGE_MAX_LENGTH),
    email: z.string().optional(),
    timestamp: z.iso.datetime().optional(),
    wantsContact: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.wantsContact) {
      if (!data.email || data.email.trim().length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
        });
      } else {
        const emailSchema = z.email().max(EMAIL_MAX_LENGTH);
        const result = emailSchema.safeParse(data.email);
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            path: ['email'],
          });
        }
      }
    }
  });

type Feedback = z.infer<typeof Feedback>;

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Feedback['section'];
  area: Feedback['area'];
  language: Feedback['language'];
}

export const FeedbackModal = ({ isOpen, onClose, section, area, language }: FeedbackModalProps) => {
  const formId = React.useId();
  const { t } = useTranslation();

  const { control, register, watch, reset } = useForm({
    resolver: zodResolver(Feedback),
    defaultValues: {
      section,
      area,
      language,
      type: 'Kehu',
      wantsContact: false,
    },
  });
  const { isValid } = useFormState({ control });
  const wantsContact = watch('wantsContact');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, area, language]);

  const onSubmit: FormSubmitHandler<Feedback> = async (payload) => {
    try {
      setIsSubmitting(true);
      const { wantsContact, email, ...rest } = payload.data;
      const body = JSON.stringify({
        ...rest,
        email: wantsContact ? email : undefined,
        details: window.location.href,
        timestamp: new Date().toISOString(),
      });
      const response = await fetch('/api/palaute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-amz-content-sha256': Array.from(
            new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))),
          )
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(''),
        },
        body,
      });

      if (!response.ok) {
        throw new Error();
      }

      setIsSubmitting(false);
      reset();
      onClose();

      // Wait a moment before showing success message
      await new Promise((resolve) => setTimeout(resolve, 50));
      alert(t('feedback.success'));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsSubmitting(false);
      alert(t('feedback.error'));
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      fullWidthContent
      content={
        <Form id={formId} control={control} onSubmit={onSubmit} data-testid="feedback-form">
          <h2 className="sm:text-heading-1 text-heading-1-mobile mb-5">{t('feedback.title')}</h2>
          <p className="sm:text-body-md text-body-md-mobile mb-9">
            {t('feedback.intro-1')} {t('feedback.intro-2')}
            <br />
            <br />
            {t('feedback.intro-privacy')}
          </p>
          <Controller
            control={control}
            name="section"
            render={({ field: { value, onChange } }) => (
              <RadioButtonGroup
                label={t('feedback.section-question')}
                value={value}
                onChange={onChange}
                className="mb-6"
                data-testid="feedback-section-group"
              >
                <RadioButton label={t('feedback.sections.osaamispolkuni')} value="Osaamispolkuni" />
                <RadioButton label={t('feedback.sections.ohjaajan-osio')} value="Ohjaajan osio" />
                <RadioButton label={t('feedback.sections.tietopalvelu')} value="Tietopalvelu" />
                <RadioButton label={t('feedback.sections.koko-palvelu')} value="Koko palvelu tai muu palaute" />
              </RadioButtonGroup>
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <RadioButtonGroup
                label={t('feedback.type-question')}
                value={value}
                onChange={onChange}
                className="mb-6"
                data-testid="feedback-type-group"
              >
                <RadioButton label={t('feedback.types.kehu')} value="Kehu" />
                <RadioButton label={t('feedback.types.kehitysehdotus')} value="Kehitysehdotus" />
                <RadioButton label={t('feedback.types.moite')} value="Moite" />
                <RadioButton label={t('feedback.types.vika')} value="Tekninen vika tai ongelma" />
              </RadioButtonGroup>
            )}
          />
          <Textarea
            label={t('feedback.message-label')}
            {...register('message')}
            className="mb-9"
            rows={5}
            maxLength={MESSAGE_MAX_LENGTH}
            data-testid="feedback-message"
          />
          <Controller
            control={control}
            name="wantsContact"
            render={({ field: { name, value, onChange } }) => (
              <Checkbox
                label={t('feedback.wants-contact')}
                ariaLabel={t('feedback.wants-contact')}
                name={name}
                value="yes"
                checked={value}
                onChange={onChange}
                className={wantsContact ? 'mb-5' : 'mb-7'}
                data-testid="feedback-wants-contact"
              />
            )}
          />
          {wantsContact && (
            <InputField
              label={t('feedback.email-label')}
              {...register('email')}
              className="mb-9"
              maxLength={EMAIL_MAX_LENGTH}
              data-testid="feedback-email"
            />
          )}
          <hr className="h-1 bg-border-gray text-border-gray mb-7" />
          <div className="sm:text-body-md text-body-md-mobile">
            <p>{t('feedback.footer-info-1')}</p>
            <br />
            <p>{t('feedback.footer-info-heading')}</p>
            <ul className="list-disc list-outside ml-7">
              <li>{t('feedback.footer-handled.osaamispolkuni')}</li>
              <li>{t('feedback.footer-handled.ohjaajan')}</li>
              <li>{t('feedback.footer-handled.tietopalvelu')}</li>
            </ul>
            <br />
            <p>{t('feedback.footer-privacy-heading')}</p>
            <ul className="list-disc list-outside ml-7">
              <li>
                <a
                  href={t('feedback.linkHrefs.oph')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('feedback.links.oph')}
                  <JodOpenInNew />
                </a>
              </li>
              <li>
                <a
                  href={t('feedback.linkHrefs.keha')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('feedback.links.keha')}
                  <JodOpenInNew />
                </a>
              </li>
              <li>
                <a
                  href={t('feedback.linkHrefs.okm')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('feedback.links.okm')}
                  <JodOpenInNew />
                </a>
              </li>
            </ul>
          </div>
        </Form>
      }
      footer={
        <div className="flex justify-end flex-1 gap-4">
          <Button
            variant="white"
            label={t('feedback.cancel')}
            onClick={() => {
              reset();
              onClose();
            }}
            className="whitespace-nowrap"
            data-testid="feedback-cancel"
          />
          <Button
            variant="white"
            label={t('feedback.submit')}
            className="whitespace-nowrap"
            disabled={!isValid || isSubmitting}
            form={formId}
            data-testid="feedback-submit"
          />
        </div>
      }
      data-testid="feedback-modal"
    />
  );
};
