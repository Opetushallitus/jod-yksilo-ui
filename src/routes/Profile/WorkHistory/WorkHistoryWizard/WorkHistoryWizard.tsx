/* eslint-disable sonarjs/cognitive-complexity */
import { client } from '@/api/client';
import { SelectableTableRow } from '@/components';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, WizardProgress, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import CompetencesStep from './CompetencesStep';
import SummaryStep from './SummaryStep';
import WorkplaceStep from './WorkplaceStep';
import { type WorkHistoryForm } from './utils';

interface WorkHistoryWizardProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow?: SelectableTableRow;
}

const WorkHistoryWizard = ({ isOpen, setIsOpen, selectedRow }: WorkHistoryWizardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { sm } = useMediaQueries();

  const formId = React.useId();
  const methods = useForm<WorkHistoryForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          id: z.string().optional(),
          nimi: z.string().min(1),
          toimenkuvat: z
            .object({
              id: z.string().optional(),
              nimi: z.string().min(1),
              alkuPvm: z.string().date(),
              loppuPvm: z.string().date().optional().or(z.literal('')),
              osaamiset: z.array(
                z.object({
                  id: z.string().min(1),
                }),
              ),
            })
            .array()
            .nonempty(),
        })
        .refine((data) => data.toimenkuvat.length > 0) // At least one toimenkuva
        .refine((data) =>
          data.toimenkuvat.every((toimenkuva) =>
            toimenkuva.loppuPvm ? toimenkuva.alkuPvm <= toimenkuva.loppuPvm : true,
          ),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      // Fetch osaamiset and toimenkuvat if the tyopaikka is defined
      if (selectedRow?.key) {
        const [osaamiset, toimenkuvat] = await Promise.all([
          client.GET('/api/profiili/osaamiset'),
          client.GET('/api/profiili/tyopaikat/{id}/toimenkuvat', {
            params: { path: { id: selectedRow.key } },
          }),
        ]);
        return {
          id: selectedRow?.key,
          nimi: selectedRow.nimi[language] ?? '',
          toimenkuvat:
            toimenkuvat.data
              ?.sort((a, b) => (a.alkuPvm as unknown as string).localeCompare(b.alkuPvm as unknown as string))
              .map((toimenkuva) => ({
                id: toimenkuva.id,
                nimi: toimenkuva.nimi[language] ?? '',
                alkuPvm: toimenkuva.alkuPvm ?? '',
                loppuPvm: toimenkuva.loppuPvm ?? '',
                osaamiset:
                  toimenkuva.osaamiset?.map((osaaminenId) => ({
                    id: osaaminenId,
                    nimi:
                      osaamiset.data?.find((osaaminen) => osaaminen.osaaminen?.uri === osaaminenId)?.osaaminen?.nimi?.[
                        language
                      ] ?? '',
                  })) ?? [],
              })) ?? [],
        };
      } else {
        return Promise.resolve({
          nimi: '',
          toimenkuvat: [
            {
              nimi: '',
              alkuPvm: '',
              loppuPvm: '',
              osaamiset: [],
            },
          ],
        });
      }
    },
  });
  const trigger = methods.trigger;
  const errors = methods.formState.errors;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'toimenkuvat',
  });
  const onSubmit: FormSubmitHandler<WorkHistoryForm> = async ({ data }: { data: WorkHistoryForm }) => {
    // Update the tyopaikka if it exists
    if (selectedRow?.key) {
      await client.PATCH('/api/profiili/tyopaikat/{id}', {
        params: {
          path: { id: selectedRow.key },
        },
        body: {
          id: data.id,
          nimi: {
            [language]: data.nimi,
          },
          toimenkuvat: data.toimenkuvat.map((toimenkuva) => ({
            id: toimenkuva.id,
            nimi: {
              [language]: toimenkuva.nimi,
            },
            alkuPvm: toimenkuva.alkuPvm,
            loppuPvm: toimenkuva.loppuPvm,
            osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
          })),
        },
      });
    } else {
      await client.POST('/api/profiili/tyopaikat', {
        body: {
          nimi: {
            [language]: data.nimi,
          },
          toimenkuvat: data.toimenkuvat.map((toimenkuva) => ({
            nimi: {
              [language]: toimenkuva.nimi,
            },
            alkuPvm: toimenkuva.alkuPvm,
            loppuPvm: toimenkuva.loppuPvm,
            osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
          })),
        },
      });
    }
    setIsOpen(false);
    navigate('.', { replace: true });
  };

  const [steps, setSteps] = React.useState(1);
  React.useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);
  const [step, setStep] = React.useState(1);
  const selectedToimeenkuva = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isWorkplaceStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
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
            {isWorkplaceStep && (
              <WorkplaceStep type={isFirstStep ? 'tyopaikka' : 'toimenkuva'} toimenkuva={selectedToimeenkuva} />
            )}
            {isCompetencesStep && <CompetencesStep toimenkuva={selectedToimeenkuva} />}
            {isSummaryStep && <SummaryStep />}
          </Form>
        </FormProvider>
      }
      progress={<WizardProgress steps={steps} currentStep={step} />}
      footer={
        <div className="flex justify-between gap-5">
          <div className="flex gap-5">
            {step === steps && (
              <Button
                onClick={() => {
                  append({
                    nimi: '',
                    alkuPvm: '',
                    loppuPvm: '',
                    osaamiset: [],
                  });
                }}
                label={t('work-history.add-new-job-description')}
                variant="white"
              />
            )}
            {step !== steps && selectedToimeenkuva > 0 && (
              <Button
                onClick={() => {
                  setStep(selectedToimeenkuva * 2);
                  remove(selectedToimeenkuva);
                }}
                label={t('work-history.delete-job-description')}
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
                icon={!sm ? 'arrow_back' : undefined}
              />
            )}
            {step < steps && (
              <Button
                onClick={() => setStep(step + 1)}
                label={t('next')}
                variant="white"
                icon={!sm ? 'arrow_forward' : undefined}
                disabled={errors.nimi !== undefined || errors.toimenkuvat?.[selectedToimeenkuva] !== undefined}
              />
            )}
            {step === steps && <Button form={formId} label={t('save')} variant="white" disabled={!isValid} />}
          </div>
        </div>
      }
    />
  ) : (
    <></>
  );
};

export default WorkHistoryWizard;
