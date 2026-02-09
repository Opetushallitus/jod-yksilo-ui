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
import ActivityStep from './ActivityStep';
import CompetencesStep from './CompetencesStep';
import SummaryStep from './SummaryStep';
import type { FreeTimeActivitiesForm } from './utils';

interface FreeTimeActivitiesWizardProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
}

const FreeTimeActivitiesWizard = ({ isOpen, onClose }: FreeTimeActivitiesWizardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  // Using local state to prevent double submissions, as RHF isSubmitting is not reliable.
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const selectedPatevyys = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const revalidator = useRevalidator();
  const formId = React.useId();
  useEscHandler(onClose, formId);

  const methods = useForm<FreeTimeActivitiesForm>({
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
          patevyydet: z
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
        .refine((data) => data.patevyydet.length > 0) // At least one patevyys
        .refine(
          (data) =>
            data.patevyydet.every((patevyys) => (patevyys.loppuPvm ? patevyys.alkuPvm <= patevyys.loppuPvm : true)),
          formErrorMessage.dateRange(['patevyydet', `${selectedPatevyys}`, 'loppuPvm']),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      return Promise.resolve({
        nimi: {},
        patevyydet: [
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
    name: 'patevyydet',
  });

  const onSubmit: FormSubmitHandler<FreeTimeActivitiesForm> = async ({ data }: { data: FreeTimeActivitiesForm }) => {
    if (isSubmitting) {
      return;
    }
    try {
      setIsSubmitting(true);
      await client.POST('/api/profiili/vapaa-ajan-toiminnot', {
        body: {
          nimi: data.nimi,
          patevyydet: data.patevyydet.map((patevyys) => ({
            nimi: patevyys.nimi,
            alkuPvm: patevyys.alkuPvm,
            loppuPvm: patevyys.loppuPvm,
            osaamiset: patevyys.osaamiset.map((osaaminen) => osaaminen.id),
          })),
        },
      });
      await revalidator.revalidate();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isActivityStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  const hasPreviousStep = React.useMemo(() => step > 1, [step]);
  const hasNextStep = React.useMemo(() => step < steps, [step, steps]);
  const isLastStep = React.useMemo(() => step === steps, [step, steps]);

  const id = methods.watch('id');
  const patevyysId = methods.watch(`patevyydet.${selectedPatevyys}.id`);

  const headerText = React.useMemo(() => {
    if (isSummaryStep) {
      return t('free-time-activities.summary');
    }
    if (isCompetencesStep) {
      return patevyysId ? t('profile.competences.edit') : t('free-time-activities.identify-proficiencies');
    }
    if (isActivityStep) {
      if (isFirstStep) {
        return id ? t('free-time-activities.edit-activity') : t('free-time-activities.add-new-free-time-activity');
      }
      return patevyysId ? t('free-time-activities.edit-proficiency') : t('free-time-activities.add-new-activity');
    }
    return '';
  }, [id, patevyysId, isFirstStep, isActivityStep, isCompetencesStep, isSummaryStep, t]);

  const onClickAddNewActivityHandler = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    append({
      nimi: {},
      alkuPvm: '',
      loppuPvm: '',
      osaamiset: [],
    });
  }, [append, isSubmitting]);

  const onClickDeleteActivityHandler = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setStep(selectedPatevyys * 2);
    remove(selectedPatevyys);
  }, [isSubmitting, remove, selectedPatevyys]);

  const onClickCancelHandler = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onClose(true);
  }, [isSubmitting, onClose]);

  const onClickPreviousHandler = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setStep(step - 1);
  }, [isSubmitting, step]);

  const onClickNextHandler = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    setStep(step + 1);
  }, [isSubmitting, step]);

  const StepComponent = React.useMemo(() => {
    if (isActivityStep) {
      return (
        <div data-testid="free-time-step-activity">
          <ActivityStep type={isFirstStep ? 'toiminta' : 'patevyys'} patevyys={selectedPatevyys} />
        </div>
      );
    } else if (isCompetencesStep) {
      return (
        <div data-testid="free-time-step-competences">
          <CompetencesStep patevyys={selectedPatevyys} />
        </div>
      );
    } else if (isSummaryStep) {
      return (
        <div data-testid="free-time-step-summary">
          <SummaryStep />
        </div>
      );
    }
    return <></>;
  }, [isActivityStep, isCompetencesStep, isFirstStep, isSummaryStep, selectedPatevyys]);

  const topSlot = React.useMemo(
    () => <ModalHeader text={headerText} step={step} testId="free-time-step-title" />,
    [headerText, step],
  );

  if (isLoading) {
    return null;
  }
  return (
    <Modal
      name={headerText}
      open={isOpen}
      testId="free-time-wizard"
      fullWidthContent
      topSlot={topSlot}
      className="sm:h-full!"
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
        <div className="flex justify-between gap-3 flex-1" data-testid="free-time-wizard-footer">
          <div className="flex gap-3">
            {isLastStep && (
              <Button
                onClick={onClickAddNewActivityHandler}
                label={t('free-time-activities.add-new-activity-button')}
                variant="white"
                className="whitespace-nowrap"
                testId="free-time-add-activity"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {step !== steps && selectedPatevyys > 0 && (
              <Button
                onClick={onClickDeleteActivityHandler}
                label={t('free-time-activities.delete-proficiency')}
                variant="white-delete"
                className="whitespace-nowrap"
                testId="free-time-delete-activity"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onClickCancelHandler}
              label={t('common:cancel')}
              variant="white"
              className="whitespace-nowrap"
              testId="free-time-cancel"
              size={sm ? 'lg' : 'sm'}
            />
            {hasPreviousStep && (
              <Button
                onClick={onClickPreviousHandler}
                label={t('previous')}
                variant="white"
                icon={sm ? undefined : <JodArrowLeft />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="free-time-previous"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {hasNextStep && (
              <Button
                onClick={onClickNextHandler}
                label={t('next')}
                variant="accent"
                icon={sm ? undefined : <JodArrowRight />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="free-time-next"
                size={sm ? 'lg' : 'sm'}
              />
            )}
            {isLastStep && (
              <Button
                form={formId}
                label={t('save')}
                variant="accent"
                icon={sm ? undefined : <JodCheckmark />}
                disabled={!isValid}
                className="whitespace-nowrap"
                testId="free-time-save"
                size={sm ? 'lg' : 'sm'}
              />
            )}
          </div>
        </div>
      }
    />
  );
};

export default FreeTimeActivitiesWizard;
