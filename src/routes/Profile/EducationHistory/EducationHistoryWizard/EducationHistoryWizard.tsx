/* eslint-disable sonarjs/cognitive-complexity */
import { client } from '@/api/client';
import { SelectableTableRow } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, WizardProgress, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import CompetencesStep from './CompetencesStep';
import EducationStep from './EducationStep';
import SummaryStep from './SummaryStep';
import { type EducationHistoryForm } from './utils';

interface EducationHistoryWizard {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow?: SelectableTableRow;
}

const EducationHistoryWizard = ({ isOpen, setIsOpen, selectedRow }: EducationHistoryWizard) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const csrf = auth!.csrf;
  const { sm } = useMediaQueries();

  const formId = React.useId();
  const methods = useForm<EducationHistoryForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          nimi: z.string().min(1).optional().or(z.literal('')),
          koulutukset: z
            .object({
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
        .refine((data) => data.koulutukset.length > 0) // At least one toimenkuva
        .refine((data) =>
          data.koulutukset.every((tutkinto) => (tutkinto.loppuPvm ? tutkinto.alkuPvm <= tutkinto.loppuPvm : true)),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      // Fetch osaamiset and koulutukset if the koulutus is defined
      if (selectedRow?.key) {
        const [osaamiset, koulutukset] = await Promise.all([
          client.GET('/api/profiili/osaamiset', {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          client.GET('/api/profiili/koulutukset', {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);
        const koulutus =
          koulutukset.data?.find((koulutus) => koulutus.kategoria?.id === selectedRow.key) ??
          koulutukset.data?.find((koulutus) =>
            koulutus.koulutukset?.some((koulutus) => koulutus.id === selectedRow.key),
          );
        return {
          nimi: koulutus?.kategoria?.nimi?.[language] ?? '',
          koulutukset:
            koulutus?.koulutukset?.map((tutkinto) => ({
              id: tutkinto.id,
              nimi: tutkinto.nimi[language] ?? '',
              alkuPvm: tutkinto.alkuPvm ?? '',
              loppuPvm: tutkinto.loppuPvm ?? '',
              osaamiset:
                tutkinto.osaamiset?.map((osaaminenId) => ({
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
          koulutukset: [
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
  const { fields } = useFieldArray({
    control: methods.control,
    name: 'koulutukset',
  });
  const onSubmit: FormSubmitHandler<EducationHistoryForm> = async ({ data }: { data: EducationHistoryForm }) => {
    // Update the kategoria if it exists
    if (selectedRow?.key) {
      const actions = [];
      if (data.nimi.length > 0) {
        actions.push(
          client.PATCH('/api/profiili/kategoriat/{id}', {
            params: {
              path: { id: selectedRow.key },
            },
            headers: {
              'Content-Type': 'application/json',
              [csrf.headerName]: csrf.token,
            },
            body: {
              id: selectedRow.key,
              nimi: {
                [language]: data.nimi,
              },
            },
          }),
        );
      }
      data.koulutukset.map((koulutus, index) => {
        const koulutusId = methods.watch(`koulutukset.${index}.id`);
        if (koulutusId) {
          actions.push(
            client.PATCH('/api/profiili/koulutukset/{id}', {
              params: {
                path: { id: koulutusId },
              },
              headers: {
                'Content-Type': 'application/json',
                [csrf.headerName]: csrf.token,
              },
              body: {
                id: koulutusId,
                nimi: {
                  [language]: koulutus.nimi,
                },
                alkuPvm: koulutus.alkuPvm,
                loppuPvm: koulutus.loppuPvm,
                osaamiset: koulutus.osaamiset.map((osaaminen) => osaaminen.id),
              },
            }),
          );
        } else {
          // TODO: Implement koulutus creation in the backend
        }
        // TODO: remove deleted koulutukset
      });

      await Promise.all(actions);
    } else {
      await client.POST('/api/profiili/koulutukset', {
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: {
          kategoria: data.nimi
            ? {
                nimi: {
                  [language]: data.nimi,
                },
              }
            : undefined,
          koulutukset: data.koulutukset.map((tutkinto) => ({
            nimi: {
              [language]: tutkinto.nimi,
            },
            alkuPvm: tutkinto.alkuPvm,
            loppuPvm: tutkinto.loppuPvm,
            osaamiset: tutkinto.osaamiset.map((osaaminen) => osaaminen.id),
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
  const selectedTutkinto = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isEducationStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
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
            {isEducationStep && (
              <EducationStep type={isFirstStep ? 'koulutus' : 'tutkinto'} tutkinto={selectedTutkinto} />
            )}
            {isCompetencesStep && <CompetencesStep tutkinto={selectedTutkinto} />}
            {isSummaryStep && <SummaryStep />}
          </Form>
        </FormProvider>
      }
      progress={<WizardProgress steps={steps} currentStep={step} />}
      footer={
        <div className="flex flex-row-reverse justify-between gap-5">
          {/* <div className="flex gap-5">
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
                label={t('education-history.add-new-degree-or-course')}
                variant="white"
              />
            )}
            {step !== steps && selectedTutkinto > 0 && (
              <Button
                onClick={() => {
                  setStep(selectedTutkinto * 2);
                  remove(selectedTutkinto);
                }}
                label={t('education-history.delete-degree-or-course')}
                variant="white-delete"
              />
            )}
          </div> */}
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
                disabled={errors.nimi !== undefined || errors.koulutukset?.[selectedTutkinto] !== undefined}
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

export default EducationHistoryWizard;
