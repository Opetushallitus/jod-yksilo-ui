import { client } from '@/api/client';
import { formErrorMessage, LIMITS } from '@/constants';
import { toastAdd } from '@/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import ActivityStep from './ActivityStep';
import CompetencesStep from './CompetencesStep';
import SummaryStep from './SummaryStep';
import { type FreeTimeActivitiesForm } from './utils';

interface FreeTimeActivitiesWizardProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FreeTimeActivitiesWizard = ({ isOpen, setIsOpen }: FreeTimeActivitiesWizardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sm } = useMediaQueries();

  const formId = React.useId();
  const methods = useForm<FreeTimeActivitiesForm>({
    mode: 'onBlur',
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
              alkuPvm: z.string().nonempty(formErrorMessage.required()).date(formErrorMessage.date()),
              loppuPvm: z.string().date(formErrorMessage.date()).optional().or(z.literal('')),
              osaamiset: z.array(
                z.object({
                  id: z.string().min(1),
                }),
              ),
            })
            .array()
            .nonempty(),
        })
        .refine((data) => data.patevyydet.length > 0) // At least one patevyys
        .refine(
          (data) =>
            data.patevyydet.every((patevyys) => (patevyys.loppuPvm ? patevyys.alkuPvm <= patevyys.loppuPvm : true)),
          formErrorMessage.dateRange(['loppuPvm']),
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
  const trigger = methods.trigger;
  const errors = methods.formState.errors;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'patevyydet',
  });

  const onSubmit: FormSubmitHandler<FreeTimeActivitiesForm> = async ({ data }: { data: FreeTimeActivitiesForm }) => {
    const { response } = await client.POST('/api/profiili/vapaa-ajan-toiminnot', {
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
    toastAdd(response);
    setIsOpen(false);
    navigate('.', { replace: true });
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);
  const [step, setStep] = React.useState(1);
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const selectedPatevyys = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const isActivityStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  React.useEffect(() => {
    void trigger();
  }, [trigger, fields]);

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
        <div className="flex justify-between gap-5">
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
              />
            )}
          </div>
          <div className="flex gap-5">
            <Button onClick={() => setIsOpen(false)} label={t('cancel')} variant="white" />
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                label={t('previous')}
                variant="white"
                icon={!sm ? <MdArrowBack size={24} /> : undefined}
              />
            )}
            {step < steps && (
              <Button
                onClick={() => setStep(step + 1)}
                label={t('next')}
                variant="white"
                icon={!sm ? <MdArrowForward size={24} /> : undefined}
                disabled={errors.nimi !== undefined || errors.patevyydet?.[selectedPatevyys] !== undefined}
              />
            )}
            {step === steps && <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />}
          </div>
        </div>
      }
    />
  ) : null;
};

export default FreeTimeActivitiesWizard;
