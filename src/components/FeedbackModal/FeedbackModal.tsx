import { formErrorMessage } from '@/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Checkbox, InputField, Modal, RadioButton, RadioButtonGroup, Textarea } from '@jod/design-system';
import { JodOpenInNew } from '@jod/design-system/icons';
import React from 'react';
import { Controller, Form, FormSubmitHandler, useForm, useFormState } from 'react-hook-form';
import toast from 'react-hot-toast/headless';
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
    mode: 'onChange',
    resolver: zodResolver(Feedback),
    defaultValues: {
      section,
      area,
      language,
      type: 'Kehu',
      wantsContact: false,
    },
  });
  const { isValid, errors } = useFormState({ control });
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
      toast.success(t('common:feedback.success'));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsSubmitting(false);
      toast.error(t('common:feedback.error'));
    }
  };

  const topSlot = React.useMemo(
    () => <h2 className="sm:text-heading-1 text-heading-1-mobile mb-5">{t('common:feedback.title')}</h2>,
    [t],
  );

  return (
    <Modal
      name={t('common:feedback.title')}
      open={isOpen}
      onClose={onClose}
      fullWidthContent
      topSlot={topSlot}
      content={
        <Form
          id={formId}
          control={control}
          onSubmit={onSubmit}
          data-testid="feedback-form"
          className="max-w-modal-content"
        >
          <p className="sm:text-body-md text-body-md-mobile mb-9">
            {t('common:feedback.intro-1')} {t('common:feedback.intro-2')}
            <br />
            <br />
            {t('common:feedback.intro-privacy')}
          </p>
          <Controller
            control={control}
            name="section"
            render={({ field: { value, onChange } }) => (
              <RadioButtonGroup
                label={t('common:feedback.section-question')}
                value={value}
                onChange={onChange}
                className="mb-6"
                testId="feedback-section-group"
              >
                <RadioButton label={t('common:feedback.sections.osaamispolkuni')} value="Osaamispolkuni" />
                <RadioButton label={t('common:feedback.sections.ohjaajan-osio')} value="Ohjaajan osio" />
                <RadioButton label={t('common:feedback.sections.tietopalvelu')} value="Tietopalvelu" />
                <RadioButton label={t('common:feedback.sections.koko-palvelu')} value="Koko palvelu tai muu palaute" />
              </RadioButtonGroup>
            )}
          />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <RadioButtonGroup
                label={t('common:feedback.type-question')}
                value={value}
                onChange={onChange}
                className="mb-6"
                testId="feedback-type-group"
              >
                <RadioButton label={t('common:feedback.types.kehu')} value="Kehu" />
                <RadioButton label={t('common:feedback.types.kehitysehdotus')} value="Kehitysehdotus" />
                <RadioButton label={t('common:feedback.types.moite')} value="Moite" />
                <RadioButton label={t('common:feedback.types.vika')} value="Tekninen vika tai ongelma" />
              </RadioButtonGroup>
            )}
          />
          <div className="mb-9">
            <Textarea
              label={t('common:feedback.message-label')}
              {...register('message')}
              rows={5}
              maxLength={MESSAGE_MAX_LENGTH}
              requiredText={t('common:required')}
              errorMessage={errors.message ? formErrorMessage.required().message : undefined}
              testId="feedback-message"
            />
          </div>
          <Controller
            control={control}
            name="wantsContact"
            render={({ field: { name, value, onChange } }) => (
              <Checkbox
                label={t('common:feedback.wants-contact')}
                ariaLabel={t('common:feedback.wants-contact')}
                name={name}
                value="yes"
                checked={value}
                onChange={onChange}
                className={wantsContact ? 'mb-5' : 'mb-7'}
                testId="feedback-wants-contact"
              />
            )}
          />
          {wantsContact && (
            <div className="mb-9">
              <InputField
                label={t('common:feedback.email-label')}
                {...register('email')}
                maxLength={EMAIL_MAX_LENGTH}
                requiredText={t('common:required')}
                errorMessage={errors.email ? formErrorMessage.email().message : undefined}
                testId="feedback-email"
              />
            </div>
          )}
          <hr className="h-1 bg-border-gray text-border-gray mb-7" />
          <div className="sm:text-body-md text-body-md-mobile">
            <p>{t('common:feedback.footer-info-1')}</p>
            <br />
            <p>{t('common:feedback.footer-info-heading')}</p>
            <ul className="list-disc list-outside ml-7">
              <li>{t('common:feedback.footer-handled.osaamispolkuni')}</li>
              <li>{t('common:feedback.footer-handled.ohjaajan')}</li>
              <li>{t('common:feedback.footer-handled.tietopalvelu')}</li>
            </ul>
            <br />
            <p>{t('common:feedback.footer-privacy-heading')}</p>
            <ul className="list-disc list-outside ml-7">
              <li>
                <a
                  href={t('common:feedback.linkHrefs.oph')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('common:feedback.links.oph')}
                  <JodOpenInNew ariaLabel={t('common:external-link')} />
                </a>
              </li>
              <li>
                <a
                  href={t('common:feedback.linkHrefs.keha')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('common:feedback.links.keha')}
                  <JodOpenInNew ariaLabel={t('common:external-link')} />
                </a>
              </li>
              <li>
                <a
                  href={t('common:feedback.linkHrefs.okm')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                >
                  {t('common:feedback.links.okm')}
                  <JodOpenInNew ariaLabel={t('common:external-link')} />
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
            label={t('common:feedback.cancel')}
            onClick={() => {
              reset();
              onClose();
            }}
            className="whitespace-nowrap"
            testId="feedback-cancel"
          />
          <Button
            variant="white"
            label={t('common:feedback.submit')}
            className="whitespace-nowrap"
            disabled={!isValid || isSubmitting}
            form={formId}
            testId="feedback-submit"
          />
        </div>
      }
      testId="feedback-modal"
    />
  );
};
