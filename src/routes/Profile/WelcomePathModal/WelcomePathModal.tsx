import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import {
  Controller,
  Form,
  FormProvider,
  type FormSubmitHandler,
  useForm,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useRevalidator } from 'react-router';
import z from 'zod';

import { AiInfoButton, Button, InputField, Modal, useMediaQueries, WizardProgress } from '@jod/design-system';
import { JodArrowLeft, JodArrowRight, JodCheckmark, JodOpenInNew } from '@jod/design-system/icons';

import { client } from '@/api/client';
import { AnchorLink } from '@/components';
import { ModalHeader } from '@/components/ModalHeader';
import { formErrorMessage } from '@/constants';
import { useSessionGuardedAction } from '@/hooks/useSessionGuardedAction';
import type { YksiloData } from '@/hooks/useYksiloData';
import { useSessionManagerStore } from '@/stores/useSessionManagerStore';

import { PersonalDetailsInfoBlock, ToggleAllow } from '../components';
import { GENDER_VALUES } from '../utils';

const Separator = () => <hr aria-hidden className="my-4 h-1 border-0 bg-bg-gray-2" />;

const welcomePathSchema = z.object({
  tervetuloapolku: z.boolean(),
  allowSyntymavuosi: z.boolean(),
  syntymavuosi: z.number().optional(),
  allowKotikunta: z.boolean(),
  kotikunta: z.string().optional(),
  kotikuntaNimi: z.string(),
  email: z.string().trim().min(1, formErrorMessage.required()).pipe(z.email(formErrorMessage.email())),
  allowSukupuoli: z.boolean(),
  sukupuoli: z.enum(GENDER_VALUES).or(z.undefined()),
  sukupuoliNimi: z.string(),
});

type WelcomePathForm = z.infer<typeof welcomePathSchema>;

const StepWelcome = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="font-medium mb-7 text-body-lg-mobile sm:mb-8 sm:text-body-lg">{t('introduction.step-1.text-1')}</p>
      <ul className="mb-7 list-inside list-disc font-arial text-body-md-mobile sm:text-body-md">
        <li>{t('introduction.step-1.item-1')}</li>
        <li>{t('introduction.step-1.item-2')}</li>
        <li>{t('introduction.step-1.item-3')}</li>
        <li>{t('introduction.step-1.item-4')}</li>
        <li>{t('introduction.step-1.item-5')}</li>
      </ul>
    </>
  );
};

const StepInformation = ({ data }: { data: YksiloData }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { sm } = useMediaQueries();
  const firstName = useSessionManagerStore((s) => s.user?.etunimi);
  const lastName = useSessionManagerStore((s) => s.user?.sukunimi);
  const { control, register, trigger } = useFormContext<WelcomePathForm>();
  const { errors } = useFormState({ control });
  const emailFieldId = React.useId();
  const guardedAction = useSessionGuardedAction();
  const emailField = register('email');
  const mpassid = React.useMemo(
    () => !(data.syntymavuosi || data.kotikunta || data.sukupuoli),
    [data.kotikunta, data.syntymavuosi, data.sukupuoli],
  );

  React.useEffect(() => {
    void trigger('email');
  }, [trigger]);

  return (
    <>
      {!mpassid && (
        <p className="font-medium mb-2 text-body-lg-mobile sm:text-body-lg">{t('introduction.step-2.text-1')}</p>
      )}
      {!mpassid && (
        <p className="mb-7 font-arial text-body-md-mobile sm:text-body-md">{t('introduction.step-2.text-2')}</p>
      )}
      <div>
        {data.syntymavuosi && (
          <>
            <Separator />
            <PersonalDetailsInfoBlock
              label={t('personal-details.birthyear')}
              info={`${data.syntymavuosi}`}
              interactiveComponent={
                <Controller
                  control={control}
                  render={({ field: { onChange, value }, field }) => (
                    <ToggleAllow
                      {...field}
                      onChange={(val: boolean) => onChange(val)}
                      checked={value}
                      testId="birthyear-toggle-button"
                    />
                  )}
                  name="allowSyntymavuosi"
                />
              }
              testId="birthyear-field"
            />
          </>
        )}
        {data.kotikuntaNimi && (
          <>
            <Separator />
            <PersonalDetailsInfoBlock
              label={t('personal-details.home-city')}
              info={data.kotikuntaNimi}
              interactiveComponent={
                <Controller
                  control={control}
                  render={({ field: { onChange, value }, field }) => (
                    <ToggleAllow
                      {...field}
                      onChange={(val: boolean) => onChange(val)}
                      checked={value}
                      testId="home-city-toggle-button"
                    />
                  )}
                  name="allowKotikunta"
                />
              }
              testId="home-city-field"
            />
          </>
        )}
        {data.sukupuoli && (
          <>
            <Separator />
            <PersonalDetailsInfoBlock
              label={t('personal-details.gender')}
              info={data.sukupuoliNimi}
              interactiveComponent={
                <Controller
                  control={control}
                  render={({ field: { onChange, value }, field }) => (
                    <ToggleAllow
                      {...field}
                      onChange={(val: boolean) => onChange(val)}
                      checked={value}
                      testId="gender-toggle-button"
                    />
                  )}
                  name="allowSukupuoli"
                />
              }
              testId="gender-field"
            />
          </>
        )}
        {firstName && lastName && (
          <>
            <Separator />
            <PersonalDetailsInfoBlock
              label={t('personal-details.name')}
              info={`${firstName} ${lastName}`}
              testId="name-field"
            />
          </>
        )}
        <Separator />
        <PersonalDetailsInfoBlock
          label={t('personal-details.email')}
          stack={!sm}
          htmlFor={emailFieldId}
          interactiveComponent={
            <InputField
              {...emailField}
              requiredText={t('common:required')}
              errorMessage={errors.email?.message}
              id={emailFieldId}
              hideLabel={true}
              placeholder="matti.meikalainen@suomi.fi"
              onBlur={(event) => {
                void emailField.onBlur(event);
                void trigger('email');
              }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                guardedAction(() => {
                  void emailField.onChange(e);
                })();
              }}
            />
          }
          testId="email-field"
        />
        <Separator />
      </div>

      <p className="mt-8 mb-2 text-heading-3-mobile sm:text-heading-3">{t('introduction.step-2.text-3')}</p>
      <p className="mb-6 font-arial text-body-md-mobile sm:text-body-md">
        <Trans
          i18nKey="introduction.step-2.text-4"
          components={{
            Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
            CustomLink: (
              <AnchorLink
                href={`/${language}/${t('common:slugs.privacy-and-cookies')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-accent hover:underline"
                data-testid="privacy-and-cookies-link"
              />
            ),
          }}
        />
      </p>
    </>
  );
};

const StepAi = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();

  return (
    <>
      <p className="font-medium mb-5 text-body-lg-mobile sm:mb-8 sm:text-body-lg">{t('introduction.step-3.text-1')}</p>
      <p className="text-body-md-mobile sm:text-body-md">{t('introduction.step-3.item-text')}</p>
      <ul className="mb-7 ml-5 list-inside list-disc text-body-md-mobile sm:text-body-md">
        <li>{t('introduction.step-3.item-1')}</li>
        <li>{t('introduction.step-3.item-2')}</li>
      </ul>
      <p className="mb-5 text-body-md-mobile sm:text-body-md">
        {
          <Trans
            i18nKey="introduction.step-3.text-2"
            components={{
              Icon: <JodOpenInNew ariaLabel={t('common:external-link')} />,
              CustomLink: (
                <AnchorLink
                  href={`/${language}/${t('common:slugs.ai-usage')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-accent hover:underline"
                  data-testid="ai-usage-link"
                />
              ),
            }}
          />
        }
      </p>

      <div className="mb-11">
        <AiInfoButton size={52} className="mb-2" />
      </div>
      <p className="font-semibold mb-5 text-body-lg-mobile sm:text-body-lg">{t('introduction.step-3.text-3')}</p>
    </>
  );
};

const WelcomePathModal = ({ yksiloData }: { yksiloData: YksiloData }) => {
  const [showWelcomePathModal, setShowWelcomePathModal] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const { t } = useTranslation();
  const { sm } = useMediaQueries();
  const formId = React.useId();

  const methods = useForm<WelcomePathForm>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    resolver: zodResolver(welcomePathSchema),
    defaultValues: async () => {
      return Promise.resolve({
        tervetuloapolku: false,
        allowSyntymavuosi: true,
        syntymavuosi: yksiloData.syntymavuosi,
        allowKotikunta: true,
        kotikunta: yksiloData.kotikunta, // koodi
        kotikuntaNimi: yksiloData.kotikuntaNimi,
        email: yksiloData.email || '',
        allowSukupuoli: true,
        sukupuoli: yksiloData.sukupuoli,
        sukupuoliNimi: yksiloData.sukupuoliNimi,
      });
    },
  });

  const revalidator = useRevalidator();
  const { isLoading, isValid } = useFormState({
    control: methods.control,
  });

  const onSubmit: FormSubmitHandler<WelcomePathForm> = async ({ data }: { data: WelcomePathForm }) => {
    await client.PUT('/api/profiili/yksilo/tiedot-ja-luvat', {
      body: {
        tervetuloapolku: true,
        syntymavuosi: data.allowSyntymavuosi ? data.syntymavuosi : undefined,
        kotikunta: data.allowKotikunta ? data.kotikunta : undefined,
        sukupuoli: data.allowSukupuoli ? data.sukupuoli : undefined,
        email: data.email,
      },
    });

    await revalidator.revalidate();
    onClose();
  };

  const onClose = () => {
    setShowWelcomePathModal(false);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const onStepChange = async () => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  };

  const totalSteps = 3;
  const isFirstStep = React.useMemo(() => step === 1, [step]);
  const isInfoStep = React.useMemo(() => step === 2, [step]);
  const isAiStep = React.useMemo(() => step === 3, [step]);

  const headerText = React.useMemo(() => {
    if (isFirstStep) {
      return t('introduction.step-1.title');
    }
    if (isInfoStep) {
      return t('introduction.step-2.title');
    }
    if (isAiStep) {
      return t('introduction.step-3.title');
    }
    return '';
  }, [t, isFirstStep, isInfoStep, isAiStep]);

  if (isLoading) {
    return null;
  }

  return (
    <Modal
      name={headerText}
      open={showWelcomePathModal}
      fullWidthContent
      className="h-[90vh]! sm:h-full!"
      testId="welcome-path-modal"
      topSlot={
        <ModalHeader
          text={headerText}
          className="mb-5 text-heading-1-mobile sm:text-heading-1"
          testId={`welcome-path-modal-header-step-${step}`}
        />
      }
      content={
        <FormProvider {...methods}>
          <Form id={formId} onSubmit={onSubmit}>
            <div ref={scrollRef} className="box-content max-w-modal-content px-5 md:px-9">
              {isFirstStep && <StepWelcome />}
              {isInfoStep && <StepInformation data={yksiloData} />}
              {isAiStep && <StepAi />}
            </div>
          </Form>
        </FormProvider>
      }
      footer={
        <div className="flex flex-1 flex-row justify-end gap-4">
          {step > 1 && (
            <Button
              label={t('previous')}
              icon={sm ? undefined : <JodArrowLeft />}
              size={sm ? 'lg' : 'sm'}
              onClick={() => {
                setStep((value) => value - 1);
                void onStepChange();
              }}
              testId="welcome-path-modal-previous-button"
            />
          )}
          {step < totalSteps && (
            <Button
              onClick={() => {
                setStep(step + 1);
                void onStepChange();
              }}
              label={t('next')}
              variant="accent"
              size={sm ? 'lg' : 'sm'}
              icon={sm ? undefined : <JodArrowRight />}
              disabled={isInfoStep && !isValid}
              testId="welcome-path-modal-next-button"
            />
          )}
          {step === totalSteps && (
            <Button
              form={formId}
              variant="accent"
              label={t('introduction.step-3.button-ok')}
              size={sm ? 'lg' : 'sm'}
              icon={sm ? undefined : <JodCheckmark />}
              testId="welcome-path-modal-ok-button"
            />
          )}
        </div>
      }
      progress={
        <WizardProgress
          labelText={t('wizard.label')}
          stepText={t('wizard.step')}
          completedText={t('wizard.completed')}
          currentText={t('wizard.current')}
          steps={totalSteps}
          currentStep={step}
        />
      }
    />
  );
};

export default WelcomePathModal;
