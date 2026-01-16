import { client } from '@/api/client';
import { ModalHeader } from '@/components/ModalHeader';
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
import SummaryStep from './SummaryStep';
import WorkplaceStep from './WorkplaceStep';
import type { WorkHistoryForm } from './utils';

interface WorkHistoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkHistoryWizard = ({ isOpen, onClose }: WorkHistoryWizardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const selectedToimenkuva = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const revalidator = useRevalidator();

  const formId = React.useId();
  useEscHandler(onClose, formId);

  const methods = useForm<WorkHistoryForm>({
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
          toimenkuvat: z
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
              alkuPvm: z.iso.date(formErrorMessage.date()).nonempty(formErrorMessage.required()),
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
        .refine((data) => data.toimenkuvat.length > 0, formErrorMessage.required()) // At least one toimenkuva
        .refine(
          (data) =>
            data.toimenkuvat.every((toimenkuva) =>
              toimenkuva.loppuPvm ? toimenkuva.alkuPvm <= toimenkuva.loppuPvm : true,
            ),
          formErrorMessage.dateRange(['toimenkuvat', `${selectedToimenkuva}`, 'loppuPvm']),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      return Promise.resolve({
        nimi: {},
        toimenkuvat: [
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
    name: 'toimenkuvat',
  });
  const onSubmit: FormSubmitHandler<WorkHistoryForm> = React.useCallback(
    async ({ data }: { data: WorkHistoryForm }) => {
      if (isSubmitting) {
        return;
      }

      try {
        setIsSubmitting(true);
        await client.POST('/api/profiili/tyopaikat', {
          body: {
            nimi: data.nimi,
            toimenkuvat: data.toimenkuvat.map((toimenkuva) => ({
              nimi: toimenkuva.nimi,
              alkuPvm: toimenkuva.alkuPvm,
              loppuPvm: toimenkuva.loppuPvm,
              osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
            })),
          },
        });
        await revalidator.revalidate();
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, revalidator, onClose],
  );

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);

  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isWorkplaceStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  const id = methods.watch('id');
  const toimenkuvaId = methods.watch(`toimenkuvat.${selectedToimenkuva}.id`);

  const headerText = React.useMemo(() => {
    if (isSummaryStep) {
      return t('work-history.summary');
    }
    if (isCompetencesStep) {
      return toimenkuvaId ? t('profile.competences.edit') : t('work-history.identify-competences');
    }
    if (isWorkplaceStep) {
      if (isFirstStep) {
        return id ? t('work-history.edit-workplace') : t('work-history.add-new-workplace');
      }
      return toimenkuvaId ? t('work-history.edit-job-description') : t('work-history.add-new-job-description');
    }
    return '';
  }, [id, toimenkuvaId, isFirstStep, isWorkplaceStep, isCompetencesStep, isSummaryStep, t]);

  const topSlot = React.useMemo(
    () => <ModalHeader text={headerText} step={step} testId="work-history-wizard-header" />,
    [headerText, step],
  );

  const StepComponent = React.useMemo(() => {
    if (isWorkplaceStep) {
      return (
        <div data-testid="work-history-step-workplace">
          <WorkplaceStep type={isFirstStep ? 'tyopaikka' : 'toimenkuva'} toimenkuva={selectedToimenkuva} />
        </div>
      );
    } else if (isCompetencesStep) {
      return (
        <div data-testid="work-history-step-competences">
          <CompetencesStep toimenkuva={selectedToimenkuva} />
        </div>
      );
    } else if (isSummaryStep) {
      return (
        <div data-testid="work-history-step-summary">
          <SummaryStep />
        </div>
      );
    }
    return <></>;
  }, [isWorkplaceStep, isFirstStep, selectedToimenkuva, isCompetencesStep, isSummaryStep]);

  const progress = React.useMemo(
    () => (
      <WizardProgress
        labelText={t('wizard.label')}
        stepText={t('wizard.step')}
        completedText={t('wizard.completed')}
        currentText={t('wizard.current')}
        steps={steps}
        currentStep={step}
      />
    ),
    [t, steps, step],
  );

  const footer = React.useMemo(
    () => (
      <div className="flex justify-between gap-3 flex-1" data-testid="work-history-wizard-footer">
        <div className="flex gap-3">
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
              label={t('work-history.add-new-job-description-button')}
              variant="white"
              className="whitespace-nowrap"
              testId="work-history-add-job-description"
              size={sm ? 'lg' : 'sm'}
            />
          )}
          {step !== steps && selectedToimenkuva > 0 && (
            <Button
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                setStep(selectedToimenkuva * 2);
                remove(selectedToimenkuva);
              }}
              label={t('work-history.delete-job-description')}
              variant="white-delete"
              className="whitespace-nowrap"
              testId="work-history-delete-job-description"
              size={sm ? 'lg' : 'sm'}
            />
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => onClose()}
            label={t('cancel')}
            variant="white"
            testId="work-history-cancel"
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
              testId="work-history-previous"
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
              icon={sm ? undefined : <JodArrowRight />}
              disabled={!isValid}
              className="whitespace-nowrap"
              testId="work-history-next"
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
              testId="work-history-save"
              size={sm ? 'lg' : 'sm'}
            />
          )}
        </div>
      </div>
    ),
    [step, steps, isSubmitting, append, t, sm, selectedToimenkuva, remove, setStep, onClose, isValid, formId],
  );

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={isOpen}
      testId="work-history-wizard"
      fullWidthContent
      topSlot={topSlot}
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
            {StepComponent}
          </Form>
        </FormProvider>
      }
      progress={progress}
      footer={footer}
      className="sm:h-full!"
    />
  );
};

export default WorkHistoryWizard;
