/* eslint-disable sonarjs/cognitive-complexity */
import { Dispatch, SetStateAction, useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, useFormState, FormProvider, Form, FormSubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/api/client';
import { type WorkHistoryForm } from './utils';
import { type RootLoaderData } from '@/routes/Root/loader';
import { WorkHistoryTableRow } from '../WorkHistoryTable';
import TyopaikkaOrToimenkuvaStep from './TyopaikkaOrToimenkuvaStep';
import { Modal, WizardProgress, Button, useMediaQueries } from '@jod/design-system';
import CompetencesStep from './CompetencesStep';
import SummaryStep from './SummaryStep';

const WorkHistoryWizard = ({
  isOpen,
  setIsOpen,
  tyopaikka,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  tyopaikka?: WorkHistoryTableRow;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { csrf } = useAuth() as { csrf: NonNullable<RootLoaderData['csrf']> };
  const { sm } = useMediaQueries();

  const formId = useId();
  const methods = useForm<WorkHistoryForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        nimi: z.string().min(1),
        toimenkuvat: z
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
      }),
    ),
    defaultValues: async () => {
      // Fetch osaamiset and toimenkuvat if the tyopaikka is defined
      if (tyopaikka?.tyopaikkaId) {
        const [osaamiset, toimenkuvat] = await Promise.all([
          client.GET('/api/profiili/osaamiset', {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          client.GET('/api/profiili/tyopaikat/{id}/toimenkuvat', {
            params: { path: { id: tyopaikka.tyopaikkaId } },
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);
        return {
          id: tyopaikka?.tyopaikkaId,
          nimi: tyopaikka.nimi[language] ?? '',
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
    if (tyopaikka?.tyopaikkaId) {
      await client.PATCH('/api/profiili/tyopaikat/{id}', {
        params: {
          path: { id: tyopaikka.tyopaikkaId },
        },
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: {
          id: methods.watch('id'),
          nimi: {
            [language]: data.nimi,
          },
          // TODO: Implement toimenkuvat in the backend
          // toimenkuvat: data.toimenkuvat.map((toimenkuva, index) => ({
          //   id: methods.watch(`toimenkuvat.${index}.id`),
          //   nimi: {
          //     [language]: toimenkuva.nimi,
          //   },
          //   alkuPvm: toimenkuva.alkuPvm,
          //   loppuPvm: toimenkuva.loppuPvm,
          //   osaamiset: toimenkuva.osaamiset.map((osaaminen) => osaaminen.id),
          // })),
        },
      });
    } else {
      await client.POST('/api/profiili/tyopaikat', {
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
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

  const [steps, setSteps] = useState(1);
  useEffect(() => {
    setSteps(fields.length * 2 + 1);
  }, [fields.length]);
  const [step, setStep] = useState(1);
  const selectedToimeenkuva = useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const isFirstStep = useMemo(() => step === 1, [step]);
  const isTyopaikkaOrToimenkuvaStep = useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isCompetencesStep = useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = useMemo(() => step === steps, [step, steps]);

  useEffect(() => {
    void trigger();
  }, [trigger, fields]);

  return !isLoading ? (
    <Modal
      open={isOpen}
      onClose={() => void {}}
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
            {isTyopaikkaOrToimenkuvaStep && (
              <TyopaikkaOrToimenkuvaStep
                type={isFirstStep ? 'tyopaikka' : 'toimenkuva'}
                toimenkuva={selectedToimeenkuva}
              />
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