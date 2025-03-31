import { client } from '@/api/client';
import { formErrorMessage, LIMITS } from '@/constants';
import { useEscHandler } from '@/hooks/useEscHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import CompetencesStep from './CompetencesStep';
import EducationStep from './EducationStep';
import SummaryStep from './SummaryStep';
import { type EducationHistoryForm } from './utils';

interface EducationHistoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const EducationHistoryWizard = ({ isOpen, onClose }: EducationHistoryWizardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sm } = useMediaQueries();
  const [step, setStep] = React.useState(1);
  const selectedKoulutus = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);

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
              alkuPvm: z.string().date(formErrorMessage.date()).optional().or(z.literal('')),
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
  const onSubmit: FormSubmitHandler<EducationHistoryForm> = async ({ data }: { data: EducationHistoryForm }) => {
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
    onClose();
    navigate('.', { replace: true });
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);

  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isEducationStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

  if (isLoading) {
    return null;
  }

  return (
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
            {isEducationStep && (
              <EducationStep type={isFirstStep ? 'oppilaitos' : 'koulutus'} koulutus={selectedKoulutus} />
            )}
            {isCompetencesStep && <CompetencesStep koulutus={selectedKoulutus} />}
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
                label={t('education-history.add-studies-to-this-education')}
                variant="white"
              />
            )}
            {step !== steps && selectedKoulutus > 0 && (
              <Button
                onClick={() => {
                  setStep(selectedKoulutus * 2);
                  remove(selectedKoulutus);
                }}
                label={t('education-history.delete-degree')}
                variant="white-delete"
              />
            )}
          </div>
          <div className="flex gap-5">
            <Button onClick={onClose} label={t('cancel')} variant="white" />
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                label={t('previous')}
                variant="white"
                icon={!sm ? <MdArrowBack size={24} /> : undefined}
                disabled={!isValid}
              />
            )}
            {step < steps && (
              <Button
                onClick={() => setStep(step + 1)}
                label={t('next')}
                variant="white"
                icon={!sm ? <MdArrowForward size={24} /> : undefined}
                disabled={!isValid}
              />
            )}
            {step === steps && <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />}
          </div>
        </div>
      }
    />
  );
};

export default EducationHistoryWizard;
