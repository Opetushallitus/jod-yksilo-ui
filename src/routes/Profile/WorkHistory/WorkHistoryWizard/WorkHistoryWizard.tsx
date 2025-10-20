import { client } from '@/api/client';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight } from '@jod/design-system/icons';
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
              // eslint-disable-next-line sonarjs/deprecation
              alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
              // eslint-disable-next-line sonarjs/deprecation
              loppuPvm: z.string().date(formErrorMessage.date()).optional().or(z.literal('')),
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
  const onSubmit: FormSubmitHandler<WorkHistoryForm> = async ({ data }: { data: WorkHistoryForm }) => {
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
  };

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

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={isOpen}
      data-testid="work-history-wizard"
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
            {isWorkplaceStep && (
              <div data-testid="work-history-step-workplace">
                <WorkplaceStep
                  headerText={headerText}
                  type={isFirstStep ? 'tyopaikka' : 'toimenkuva'}
                  toimenkuva={selectedToimenkuva}
                />
              </div>
            )}
            {isCompetencesStep && (
              <div data-testid="work-history-step-competences">
                <CompetencesStep headerText={headerText} toimenkuva={selectedToimenkuva} />
              </div>
            )}
            {isSummaryStep && (
              <div data-testid="work-history-step-summary">
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
        <div className="flex justify-between gap-5 flex-1" data-testid="work-history-wizard-footer">
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
                label={t('work-history.add-new-job-description')}
                variant="white"
                className="whitespace-nowrap"
                data-testid="work-history-add-job-description"
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
                data-testid="work-history-delete-job-description"
              />
            )}
          </div>
          <div className="flex gap-5">
            <Button onClick={() => onClose()} label={t('cancel')} variant="white" data-testid="work-history-cancel" />
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
                icon={!sm ? <JodArrowLeft /> : undefined}
                disabled={!isValid}
                className="whitespace-nowrap"
                data-testid="work-history-previous"
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
                variant="white"
                icon={<JodArrowRight />}
                iconSide={sm ? 'right' : undefined}
                disabled={!isValid}
                className="whitespace-nowrap"
                data-testid="work-history-next"
              />
            )}
            {step === steps && (
              <Button
                form={formId}
                label={t('save')}
                variant="white"
                disabled={!isValid}
                className="whitespace-nowrap"
                data-testid="work-history-save"
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default WorkHistoryWizard;
