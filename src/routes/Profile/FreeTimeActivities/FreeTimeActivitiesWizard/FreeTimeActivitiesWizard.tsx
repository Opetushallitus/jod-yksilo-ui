/* eslint-disable sonarjs/cognitive-complexity */
import { client } from '@/api/client';
import { SelectableTableRow } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { RootLoaderData } from '@/routes/Root/loader';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, WizardProgress, useMediaQueries } from '@jod/design-system';
import React from 'react';
import { Form, FormProvider, FormSubmitHandler, useFieldArray, useForm, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import ActivityStep from './ActivityStep';
import ProfiencyStep from './ProfiencyStep';
import SummaryStep from './SummaryStep';
import { type FreeTimeActivitiesForm } from './utils';

interface FreeTimeActivitiesWizardProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRow?: SelectableTableRow;
}

const FreeTimeActivitiesWizard = ({ isOpen, setIsOpen, selectedRow }: FreeTimeActivitiesWizardProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const navigate = useNavigate();
  const { csrf } = useAuth() as { csrf: NonNullable<RootLoaderData['csrf']> };
  const { sm } = useMediaQueries();

  const formId = React.useId();
  const methods = useForm<FreeTimeActivitiesForm>({
    mode: 'onChange',
    resolver: zodResolver(
      z
        .object({
          nimi: z.string().min(1),
          patevyydet: z
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
        .refine((data) => data.patevyydet.length > 0) // At least one patevyys
        .refine((data) =>
          data.patevyydet.every((patevyys) => (patevyys.loppuPvm ? patevyys.alkuPvm <= patevyys.loppuPvm : true)),
        ), // alkuPvm <= loppuPvm
    ),
    defaultValues: async () => {
      // Fetch osaamiset and patevyydet if the nimi is defined
      if (selectedRow?.key) {
        const [osaamiset, patevyydet] = await Promise.all([
          client.GET('/api/profiili/osaamiset', {
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          client.GET('/api/profiili/vapaa-ajan-toiminnot/{id}', {
            params: { path: { id: selectedRow.key } },
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);
        return {
          id: selectedRow.key,
          nimi: selectedRow.nimi[language] ?? '',
          patevyydet:
            patevyydet.data?.patevyydet
              ?.sort((a, b) => (a.alkuPvm as unknown as string).localeCompare(b.alkuPvm as unknown as string))
              .map((patevyys) => ({
                id: patevyys.id,
                nimi: patevyys.nimi[language] ?? '',
                alkuPvm: patevyys.alkuPvm ?? '',
                loppuPvm: patevyys.loppuPvm ?? '',
                osaamiset:
                  patevyys.osaamiset?.map((osaaminenId) => ({
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
          patevyydet: [
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
  const errors = methods.formState.errors;
  const { isValid, isLoading } = useFormState({
    control: methods.control,
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'patevyydet',
  });

  const onSubmit: FormSubmitHandler<FreeTimeActivitiesForm> = async ({ data }: { data: FreeTimeActivitiesForm }) => {
    if (selectedRow?.key) {
      await client.PUT('/api/profiili/vapaa-ajan-toiminnot/{id}', {
        params: { path: { id: selectedRow.key } },
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: {
          id: methods.watch('id'),
          nimi: {
            [language]: data.nimi,
          },
          patevyydet: data.patevyydet.map((patevyys, index) => ({
            id: methods.watch(`patevyydet.${index}.id`),
            nimi: {
              [language]: patevyys.nimi,
            },
            alkuPvm: patevyys.alkuPvm,
            loppuPvm: patevyys.loppuPvm,
            osaamiset: patevyys.osaamiset.map((osaaminen) => osaaminen.id),
          })),
        },
      });
    } else {
      await client.POST('/api/profiili/vapaa-ajan-toiminnot', {
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: {
          nimi: {
            [language]: data.nimi,
          },
          patevyydet: data.patevyydet.map((patevyys) => ({
            nimi: {
              [language]: patevyys.nimi,
            },
            alkuPvm: patevyys.alkuPvm,
            loppuPvm: patevyys.loppuPvm,
            osaamiset: patevyys.osaamiset.map((osaaminen) => osaaminen.id),
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
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const selectedPatevyys = React.useMemo(() => (step + (step % 2)) / 2 - 1, [step]);
  const isActivityStep = React.useMemo(() => step !== steps && (step + 1) % 2 === 0, [step, steps]);
  const isProficienyStep = React.useMemo(() => step !== steps && (step + 2) % 2 === 0, [step, steps]);
  const isSummaryStep = React.useMemo(() => step === steps, [step, steps]);

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
            {isProficienyStep && <ProfiencyStep patevyys={selectedPatevyys} />}
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
                label={t('free-time-activities.add-new-proficiency')}
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
                icon={!sm ? 'arrow_back' : undefined}
              />
            )}
            {step < steps && (
              <Button
                onClick={() => setStep(step + 1)}
                label={t('next')}
                variant="white"
                icon={!sm ? 'arrow_forward' : undefined}
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
