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
import ActivityStep from './ActivityStep';
import CompetencesStep from './CompetencesStep';
import SummaryStep from './SummaryStep';
import { type FreeTimeActivitiesForm } from './utils';

interface FreeTimeActivitiesWizardProps {
  isOpen: boolean;
  onClose: (isCancel?: boolean) => void;
}

const FreeTimeActivitiesWizard = ({ isOpen, onClose }: FreeTimeActivitiesWizardProps) => {
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
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
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isActivityStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  return !isLoading ? (
    <Modal
      open={isOpen}
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
            {isActivityStep && (
              <ActivityStep type={isFirstStep ? 'toiminta' : 'patevyys'} patevyys={selectedPatevyys} />
            )}
            {isCompetencesStep && <CompetencesStep patevyys={selectedPatevyys} />}
            {isSummaryStep && <SummaryStep />}
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
        <div className="flex justify-between gap-5 flex-1">
          <div className="flex gap-5">
            {step === steps && (
              <Button
                onClick={() => {
                  append({
                    nimi: {},
                    alkuPvm: '',
                    loppuPvm: '',
                    osaamiset: [],
                  });
                }}
                label={t('free-time-activities.add-new-activity')}
                variant="white"
                className="whitespace-nowrap"
              />
            )}
            {step !== steps && selectedPatevyys > 0 && (
              <Button
                onClick={() => {
                  setStep(selectedPatevyys * 2);
                  remove(selectedPatevyys);
                }}
                label={t('free-time-activities.delete-proficiency')}
                variant="white-delete"
                className="whitespace-nowrap"
              />
            )}
          </div>
          <div className="flex gap-5">
            <Button onClick={() => onClose(true)} label={t('cancel')} variant="white" className="whitespace-nowrap" />
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                label={t('previous')}
                variant="white"
                icon={!sm ? <JodArrowLeft /> : undefined}
                disabled={!isValid}
                className="whitespace-nowrap"
              />
            )}
            {step < steps && (
              <Button
                onClick={() => setStep(step + 1)}
                label={t('next')}
                variant="white"
                icon={<JodArrowRight />}
                iconSide={sm ? 'right' : undefined}
                disabled={!isValid}
                className="whitespace-nowrap"
              />
            )}
            {step === steps && (
              <Button
                form={formId}
                label={t('save')}
                variant="white"
                disabled={!isValid}
                className="whitespace-nowrap"
              />
            )}
          </div>
        </div>
      }
    />
  ) : null;
};

export default FreeTimeActivitiesWizard;
