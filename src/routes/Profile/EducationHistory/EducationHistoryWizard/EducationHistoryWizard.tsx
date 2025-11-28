import { client } from '@/api/client';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight, JodCheckmark } from '@jod/design-system/icons';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import { z } from 'zod';
import CompetencesStep from './CompetencesStep';
import EducationStep from './EducationStep';
import SummaryStep from './SummaryStep';
import type { EducationHistoryForm } from './utils';

interface EducationHistoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const EducationHistoryWizard = ({ isOpen, onClose }: EducationHistoryWizardProps) => {
  const { t } = useTranslation();

  const { sm } = useMediaQueries();
  const [step, setStep] = React.useState(1);
  const selectedKoulutus = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const revalidator = useRevalidator();

  const formId = React.useId();
  useEscHandler(onClose, formId);

  const methods = useForm<EducationHistoryForm>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(
      z
        .object({
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
          koulutukset: z
            .object({
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
              alkuPvm: z.iso.date(formErrorMessage.date()).optional().or(z.literal('')),
              loppuPvm: z.iso.date(formErrorMessage.date()).optional().or(z.literal('')),
              osaamiset: z.array(
                z.object({
                  id: z.string().min(1),
                  nimi: z.object({}).catchall(z.string()),
                  kuvaus: z.object({}).catchall(z.string()),
                }),
              ),
            })
            .array(),
        })
        .refine((data) => data.koulutukset.length > 0) // At least one koulutus
        .refine(
          (data) =>
            data.koulutukset.every((koulutus) =>
              koulutus.loppuPvm && koulutus.alkuPvm ? koulutus.alkuPvm <= koulutus.loppuPvm : true,
            ),
          formErrorMessage.dateRange(['koulutukset', `${selectedKoulutus}`, 'loppuPvm']),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      return Promise.resolve({
        nimi: {},
        koulutukset: [
          {
            nimi: {},
            alkuPvm: '',
            loppuPvm: '',
            osaamiset: [],
          },
        ],
      });
    },
  });
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'koulutukset',
  });

  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const onSubmit: FormSubmitHandler<EducationHistoryForm> = async ({ data }: { data: EducationHistoryForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.POST('/api/profiili/koulutuskokonaisuudet', {
        body: {
          nimi: data.nimi,
          koulutukset: data.koulutukset.map((koulutus) => ({
            nimi: koulutus.nimi,
            alkuPvm: koulutus.alkuPvm,
            loppuPvm: koulutus.loppuPvm,
            osaamiset: koulutus.osaamiset.map((osaaminen) => osaaminen.id),
          })),
        },
      });
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);

  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isEducationStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  const id = methods.watch('id');
  const koulutusId = methods.watch(`koulutukset.${selectedKoulutus}.id`);

  const headerText = React.useMemo(() => {
    if (isSummaryStep) {
      return t('education-history.summary');
    }
    if (isCompetencesStep) {
      return koulutusId ? t('profile.competences.edit') : t('education-history.identify-competences');
    }
    if (isEducationStep) {
      if (isFirstStep) {
        return id ? t('education-history.edit-education') : t('education-history.add-new-education');
      }
      return koulutusId
        ? t('education-history.edit-degree-or-education')
        : t('education-history.add-studies-to-this-education');
    }
    return '';
  }, [id, koulutusId, isFirstStep, isEducationStep, isCompetencesStep, isSummaryStep, t]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={isOpen}
      testId="education-history-wizard"
      fullWidthContent
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
            {isEducationStep && (
              <div data-testid="education-step-education">
                <EducationStep
                  headerText={headerText}
                  type={isFirstStep ? 'oppilaitos' : 'koulutus'}
                  koulutus={selectedKoulutus}
                />
              </div>
            )}
            {isCompetencesStep && (
              <div data-testid="education-step-competences">
                <CompetencesStep headerText={headerText} koulutus={selectedKoulutus} />
              </div>
            )}
            {isSummaryStep && (
              <div data-testid="education-step-summary">
                <SummaryStep headerText={headerText} />
              </div>
            )}
          </Form>
        </FormProvider>
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={steps}
          currentStep={step}
        />
      }
      footer={
        <div className="flex justify-between gap-5 flex-1" data-testid="education-history-wizard-footer">
          <div className="flex gap-5">
            {step === steps && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  append({
                    nimi: {},
                    alkuPvm: '',
                    loppuPvm: '',
                    osaamiset: [],
                  });
                }}
                label={t('education-history.add-studies-to-this-education')}
                variant="white"
                className="whitespace-nowrap"
                testId="education-history-add-degree"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {step !== steps && selectedKoulutus > 0 && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setStep(selectedKoulutus * 2);
                  remove(selectedKoulutus);
                }}
                label={t('education-history.delete-degree')}
                variant="white-delete"
                className="whitespace-nowrap"
                testId="education-history-delete-degree"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
          <div className="flex gap-5">
            <Button
              onClick={onClose}
              label={t('cancel')}
              variant="white"
              data-testid="education-history-cancel"
              size={sm ? 'lg' : 'sm'}
            />
            {step > 1 && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setStep(step - 1);
                }}
                label={t('previous')}
                variant="white"
                icon={sm ? undefined : <JodArrowLeft />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="education-history-previous"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {step < steps && (
              <Button
                onClick={() => {
                  if (isSubmitting) {
                    return;
                  }
                  setStep(step + 1);
                }}
                label={t('next')}
                variant="accent"
                icon={<JodArrowRight />}
                iconSide={sm ? 'right' : undefined}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="education-history-next"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {step === steps && (
              <Button
                form={formId}
                label={t('save')}
                icon={sm ? undefined : <JodCheckmark />}
                variant="accent"
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="education-history-save"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default EducationHistoryWizard;
